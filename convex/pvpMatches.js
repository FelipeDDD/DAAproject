import { mutationGeneric as mutation,queryGeneric as query,internalMutationGeneric as internalMutation,anyApi } from 'convex/server';
import { v,ConvexError } from 'convex/values';
import { findSessionPlayer } from './playerSessions.js';
import { ownsPlayerSession,isPlayerActive,PRESENCE_TIMEOUT_MS } from '../src/multiplayer/presencePolicy.js';
import { normalizeArenaCode,validArenaCode,ARENA_CODE_ALPHABET } from '../src/boss/arenaLobbyUi.js';
import { PVP_RULES,pvpRoom } from '../src/pvp/config.js';
import { newFighter,startMatch,advanceMatch,endMatch,applyPlayerDamage,reconcileParticipants } from '../src/pvp/matchState.js';

const identity={playerId:v.string(),sessionId:v.string()},member={...identity,matchId:v.id('pvpMatches')},command={...member,round:v.optional(v.number())};
const team=v.union(v.literal('A'),v.literal('B'));
const fail=message=>{throw new ConvexError(message);};
function requireDev(){
  if(process.env.DEV_TOOLS_ENABLED!=='true'&&!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??''))
    fail('PvP testing is disabled on this backend.');
}
async function player(ctx,args){
  const p=await findSessionPlayer(ctx,undefined,args.playerId);
  if(!ownsPlayerSession(p,args.playerId,args.sessionId)||!isPlayerActive(p))fail('CHARACTER_SESSION_LOST');
  return p;
}
const owns=(m,args)=>m?.participants.some(p=>p.playerId===args.playerId&&p.sessionId===args.sessionId);
function requireRound(m,args){if((m.round??0)!==(args.round??0))fail('This match round is no longer active.');}
async function live(ctx,m,deadlines={}){
  const members=await Promise.all(m.participants.map(async p=>{
    const row=await findSessionPlayer(ctx,undefined,p.playerId);
    deadlines[p.playerId]=row?.presenceMode==='terminal'?row.terminalLeaseExpiresAt:
      row?.presenceMode==='stationary'?row.stationaryLeaseExpiresAt:(row?.lastSeen??0)+PRESENCE_TIMEOUT_MS;
    return ownsPlayerSession(row,p.playerId,p.sessionId)&&isPlayerActive(row)?p:null;
  }));return members.filter(Boolean);
}
async function read(ctx,args,allowMissing=false){
  const p=await player(ctx,args),m=await ctx.db.get(args.matchId);
  if(!m&&allowMissing)return {p,m:null};
  if(!owns(m,args))fail('You are no longer in this PvP lobby.');
  let state=advanceMatch(m,Date.now());
  const deadlines={},active=await live(ctx,m,deadlines);
  if(m.expiresAt<=Date.now())state=endMatch(state,Date.now(),'expired');
  else state=reconcileParticipants(state,state.participants.filter(p=>active.some(a=>a.playerId===p.playerId)),Date.now());
  return {p,m:state,deadlines};
}
function publicMatch(m,deadlines){
  return m?{...m,round:m.round??0,matchId:m._id,room:pvpRoom(m._id),participants:m.participants.map(({sessionId,...p})=>({...p,presenceExpiresAt:deadlines[p.playerId]}))}:null;
}
async function save(ctx,m){
  const {_id,_creationTime,...data}=m;await ctx.db.patch(_id,data);
}
async function leaveOld(ctx,args){
  for(const state of ['waiting','countdown','active']){
    const rows=await ctx.db.query('pvpMatches').withIndex('by_state',q=>q.eq('state',state)).collect();
    for(const m of rows)if(owns(m,args))await remove(ctx,m,args);
  }
}
async function remove(ctx,m,args){
  if(!owns(m,args)||(args.round!==undefined&&args.round!==(m.round??0)))return;
  const remaining=(await live(ctx,m)).filter(p=>p.playerId!==args.playerId);
  const advanced=advanceMatch(m,Date.now());
  await save(ctx,reconcileParticipants(advanced,advanced.participants.filter(p=>remaining.some(r=>r.playerId===p.playerId)),Date.now()));
}
export const create=mutation({args:identity,handler:async(ctx,args)=>{
  requireDev();const p=await player(ctx,args);await leaveOld(ctx,args);
  let code;
  for(let tries=0;tries<12;tries++){
    code=Array.from({length:6},()=>ARENA_CODE_ALPHABET[Math.floor(Math.random()*ARENA_CODE_ALPHABET.length)]).join('');
    if(!await ctx.db.query('pvpMatches').withIndex('by_code',q=>q.eq('code',code)).unique())break;
    code=null;
  }
  if(!code)fail('Could not create a code. Try again.');
  const now=Date.now(),match={code,round:0,mode:'tdm',state:'waiting',hostPlayerId:p.playerId,
    participants:[newFighter({...args,displayName:p.displayName??p.name,characterBaseId:p.characterBaseId??p.characterId,team:'A'})],
    scores:{A:0,B:0},scoreLimit:PVP_RULES.scoreLimit,timeLimitMs:PVP_RULES.timeLimitMs,respawnMs:PVP_RULES.respawnMs,
    startedAt:null,endsAt:null,endedAt:null,winner:null,reason:null,createdAt:now,expiresAt:now+PVP_RULES.lobbyLifetimeMs};
  const matchId=await ctx.db.insert('pvpMatches',match);
  await ctx.scheduler.runAfter(PVP_RULES.lobbyLifetimeMs,anyApi.pvpMatches.expire,{matchId});
  return {matchId,code,round:0};
}});
export const join=mutation({args:{...identity,code:v.string()},handler:async(ctx,args)=>{
  requireDev();const p=await player(ctx,args),code=normalizeArenaCode(args.code);
  if(!validArenaCode(code))fail('Enter a valid six-character PvP code.');
  const saved=await ctx.db.query('pvpMatches').withIndex('by_code',q=>q.eq('code',code)).unique();
  if(!saved)fail('PvP lobby not found.');
  if(saved.state!=='waiting'||saved.expiresAt<=Date.now())fail('This PvP lobby has started, closed or expired.');
  const participants=await live(ctx,saved),m={...saved,participants};
  if(!participants.some(p=>p.playerId===m.hostPlayerId))fail('The host left this lobby.');
  if(owns(m,args))return {matchId:m._id,code:m.code,round:m.round??0};
  if(participants.length>=4)fail('This PvP lobby is full (4 players).');
  await leaveOld(ctx,args);
  const count=t=>participants.filter(p=>p.team===t).length;
  const assigned=count('A')<=count('B')?'A':'B';
  participants.push(newFighter({playerId:p.playerId,sessionId:p.sessionId,displayName:p.displayName??p.name,
    characterBaseId:p.characterBaseId??p.characterId,team:assigned}));
  await ctx.db.patch(m._id,{participants});return {matchId:m._id,code:m.code,round:m.round??0};
}});
export const current=query({args:member,handler:async(ctx,args)=>{const {m,deadlines}=await read(ctx,args,true);return publicMatch(m,deadlines);}});
export const chooseTeam=mutation({args:{...command,team},handler:async(ctx,args)=>{
  const {m}=await read(ctx,args);requireRound(m,args);if(m.state!=='waiting')fail('Teams are locked after starting.');
  if(m.participants.filter(p=>p.team===args.team&&p.playerId!==args.playerId).length>=PVP_RULES.teamSize)fail('That team is full (2 players).');
  await save(ctx,{...m,participants:m.participants.map(p=>p.playerId===args.playerId?{...p,team:args.team}:p)});
}});
export const start=mutation({args:command,handler:async(ctx,args)=>{
  const {m}=await read(ctx,args);requireRound(m,args);if(m.hostPlayerId!==args.playerId)fail('Only the host can start.');
  if(m.state!=='waiting')fail('This match is no longer waiting.');
  for(const member of m.participants){
    const row=await findSessionPlayer(ctx,undefined,member.playerId);
    if(row?.room===pvpRoom(m._id))fail('Wait for all players to return from the arena.');
  }
  try{await save(ctx,startMatch(m,Date.now()));}catch(error){fail(error.message);}
}});
export const leave=mutation({args:command,handler:async(ctx,args)=>{
  const p=await findSessionPlayer(ctx,undefined,args.playerId);
  if(!ownsPlayerSession(p,args.playerId,args.sessionId))return;
  const m=await ctx.db.get(args.matchId);if(m)await remove(ctx,m,args);
}});
export const hit=mutation({args:{...command,victimId:v.string(),victimLife:v.number(),attackerLife:v.number(),shot:v.number()},handler:async(ctx,args)=>{
  const {p,m}=await read(ctx,args);
  requireRound(m,args);
  if(p.room!==pvpRoom(m._id))fail('Enter the PvP arena first.');
  const victim=await findSessionPlayer(ctx,undefined,args.victimId);
  if(victim?.room!==p.room||!owns(m,victim)||!isPlayerActive(victim))return;
  // Test-only hit reports. Server enforces ownership/teams/lives/cooldown/scoring;
  // projectile geometry remains client-side until realtime authority is added.
  const next=applyPlayerDamage(m,{...args,attackerId:args.playerId},Date.now());
  if(JSON.stringify(next)!==JSON.stringify(m))await save(ctx,next);
}});
export const finish=mutation({args:{...command,force:v.optional(v.boolean())},handler:async(ctx,args)=>{
  const {m}=await read(ctx,args);
  requireRound(m,args);
  if(args.force){requireDev();if(m.hostPlayerId!==args.playerId)fail('Only the host can end the match.');}
  if(args.force||m.state==='ended')await save(ctx,args.force?endMatch(m,Date.now(),'dev-ended'):m);
}});
// Reuse the same short-code lobby after an interrupted round. Concurrent returns
// reset it once; round/life generations reject delayed combat and leave requests.
export const returnToLobby=mutation({args:command,handler:async(ctx,args)=>{
  await player(ctx,args);
  const saved=await ctx.db.get(args.matchId);
  if(!saved||!owns(saved,args)||saved.expiresAt<=Date.now())return null;
  const active=await live(ctx,saved);
  if(!active.some(p=>p.playerId===saved.hostPlayerId))return null;
  if(saved.state==='waiting'&&(saved.round??0)===(args.round??0)+1)return {matchId:saved._id};
  if((saved.round??0)!==(args.round??0))return null;
  const m=reconcileParticipants(advanceMatch(saved,Date.now()),active,Date.now());
  if(m.state!=='ended'||m.reason!=='team_empty')return null;
  await save(ctx,{...m,round:(m.round??0)+1,state:'waiting',scores:{A:0,B:0},
    startedAt:null,endsAt:null,endedAt:null,winner:null,reason:null,
    participants:active.map(p=>({...newFighter(p),life:p.life+1,lastShot:p.lastShot}))});
  return {matchId:m._id};
}});
export const expire=internalMutation({args:{matchId:v.id('pvpMatches')},handler:async(ctx,{matchId})=>{
  const m=await ctx.db.get(matchId);if(m&&m.expiresAt<=Date.now())await ctx.db.delete(matchId);
}});
export async function requirePvpMembership(ctx,p,matchId){
  const m=await ctx.db.get(matchId);
  const returning=m?.state==='waiting'&&p.room===pvpRoom(matchId);
  if(m?.mode!=='tdm'||(!returning&&!['countdown','active','ended'].includes(m.state))||!owns(m,p)||m.expiresAt<=Date.now())
    fail('Invalid PvP match membership.');
}
