import { mutationGeneric as mutation,queryGeneric as query,internalQueryGeneric as internalQuery,internalMutationGeneric as internalMutation,anyApi } from 'convex/server';
import { v,ConvexError } from 'convex/values';
import { findSessionPlayer } from './playerSessions.js';
import { ownsPlayerSession,isPlayerActive,PRESENCE_TIMEOUT_MS } from '../src/multiplayer/presencePolicy.js';
import { normalizeArenaCode,validArenaCode,ARENA_CODE_ALPHABET } from '../src/boss/arenaLobbyUi.js';
import { PVP_RULES,PVP_MAP_DEFINITION,pvpRoom } from '../src/pvp/config.js';
import { gameMode,PVP_MODES } from '../src/pvp/gameModes.js';
import { validPayloadState } from '../src/pvp/payload/state.js';
import { pvpModeValidator,payloadStateValidator } from './pvpModeValidators.js';
import { mergeCombatSnapshot } from '../src/pvp/combatSnapshot.js';
import { newFighter,startMatch,endMatch,reconcileParticipants,interruptedMatch,canStartMatch } from '../src/pvp/matchState.js';

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
async function live(ctx,m,deadlines={},rooms={}){
  const members=await Promise.all(m.participants.map(async p=>{
    const row=await findSessionPlayer(ctx,undefined,p.playerId);
    rooms[p.playerId]=row?.room??null;
    deadlines[p.playerId]=row?.presenceMode==='terminal'?row.terminalLeaseExpiresAt:
      row?.presenceMode==='stationary'?row.stationaryLeaseExpiresAt:(row?.lastSeen??0)+PRESENCE_TIMEOUT_MS;
    return ownsPlayerSession(row,p.playerId,p.sessionId)&&isPlayerActive(row)?p:null;
  }));return members.filter(Boolean);
}
async function read(ctx,args,allowMissing=false){
  const p=await player(ctx,args),m=await ctx.db.get(args.matchId);
  if(!m&&allowMissing)return {p,m:null};
  if(!owns(m,args))fail('You are no longer in this PvP lobby.');
  let state=m;
  const deadlines={},active=await live(ctx,m,deadlines);
  if(m.expiresAt<=Date.now())state=endMatch(state,Date.now(),'expired');
  else state=reconcileParticipants(state,state.participants.filter(p=>active.some(a=>a.playerId===p.playerId)),Date.now());
  return {p,m:state,deadlines};
}
function publicMatch(m,deadlines,rooms){
  return m?{...m,arenaMap:PVP_MAP_DEFINITION,round:m.round??0,matchId:m._id,room:pvpRoom(m._id),participants:m.participants.map(({sessionId,...p})=>
    ({...p,presenceExpiresAt:deadlines[p.playerId],...(rooms?{presenceRoom:rooms[p.playerId]}:{})}))}:null;
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
  const advanced=m;
  await save(ctx,reconcileParticipants(advanced,advanced.participants.filter(p=>remaining.some(r=>r.playerId===p.playerId)),Date.now()));
}
export const create=mutation({args:{...identity,mode:v.optional(pvpModeValidator)},handler:async(ctx,args)=>{
  requireDev();const p=await player(ctx,args);await leaveOld(ctx,args);
  let code;
  for(let tries=0;tries<12;tries++){
    code=Array.from({length:6},()=>ARENA_CODE_ALPHABET[Math.floor(Math.random()*ARENA_CODE_ALPHABET.length)]).join('');
    if(!await ctx.db.query('pvpMatches').withIndex('by_code',q=>q.eq('code',code)).unique())break;
    code=null;
  }
  if(!code)fail('Could not create a code. Try again.');
  const mode=args.mode??'tdm',rules=gameMode(mode);
  const now=Date.now(),match={code,round:0,damageRevision:0,mode,state:'waiting',hostPlayerId:p.playerId,
    participants:[newFighter({playerId:args.playerId,sessionId:args.sessionId,displayName:p.displayName??p.name,characterBaseId:p.characterBaseId??p.characterId,team:'A'})],
    scores:{A:0,B:0},scoreLimit:PVP_RULES.scoreLimit,timeLimitMs:rules.timeLimitMs,respawnMs:rules.respawnMs,
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
  const {m}=await read(ctx,args);
  requireRound(m,args);
  fail('PvP damage is handled by the realtime server.');
}});
// The local relay uses admin authentication. Neither function is browser-callable.
export const realtimeState=internalQuery({args:{matchId:v.id('pvpMatches')},handler:async(ctx,{matchId})=>{
  requireDev();const m=await ctx.db.get(matchId);if(!m)return null;
  const deadlines={},rooms={},participants=await live(ctx,m,deadlines,rooms),now=Date.now();
  const advanced=m;
  const state=m.expiresAt<=now?endMatch(advanced,now,'expired'):reconcileParticipants(advanced,
    advanced.participants.filter(p=>participants.some(active=>active.playerId===p.playerId)),now);
  return publicMatch(state,deadlines,rooms);
}});
// One trusted relay is bound transactionally to this round. A competing process
// cannot take over a running match or replay its snapshots.
export const acquireRealtimeCombat=internalMutation({args:{matchId:v.id('pvpMatches'),round:v.number(),authorityId:v.string()},handler:async(ctx,args)=>{
  requireDev();const m=await ctx.db.get(args.matchId);
  if(!m||(m.round??0)!==args.round||!['countdown','active'].includes(m.state)
    ||(m.combatAuthorityId&&m.combatAuthorityId!==args.authorityId))fail('PvP combat authority unavailable. Recreate the lobby.');
  await ctx.db.patch(m._id,{combatAuthorityId:args.authorityId});
  const deadlines={},rooms={},participants=await live(ctx,m,deadlines,rooms);
  return publicMatch({...m,combatAuthorityId:args.authorityId,participants},deadlines,rooms);
}});
const nullableNumber=v.union(v.null(),v.number());
const combatSnapshotValidator=v.object({
  state:v.union(v.literal('countdown'),v.literal('active'),v.literal('ended')),
  scores:v.object({A:v.number(),B:v.number()}),startedAt:nullableNumber,endsAt:nullableNumber,endedAt:nullableNumber,
  winner:v.union(v.null(),v.literal('A'),v.literal('B'),v.literal('draw')),reason:v.union(v.null(),v.string()),
  payload:v.optional(payloadStateValidator),
  players:v.array(v.object({playerId:v.string(),hp:v.number(),life:v.number(),kills:v.number(),deaths:v.number(),
    respawnAt:nullableNumber,lastShot:v.number(),lastHitAt:v.number()})),
});
export const mirrorRealtimeCombat=internalMutation({args:{matchId:v.id('pvpMatches'),round:v.number(),authorityId:v.string(),
  expectedRevision:v.number(),revision:v.number(),snapshot:combatSnapshotValidator,retryDeadline:v.optional(v.number())},handler:async(ctx,args)=>{
  requireDev();const m=await ctx.db.get(args.matchId);
  if(!m||(m.round??0)!==args.round||m.combatAuthorityId!==args.authorityId)return {applied:false};
  const revision=m.damageRevision??0;
  if(args.revision<=revision)return {applied:true,duplicate:true};
  if(args.expectedRevision!==revision||args.revision!==revision+1)return {applied:false};
  const s=args.snapshot;
  if(s.payload!==undefined&&(m.mode!=='payload'||!validPayloadState(s.payload)))return {applied:false};
  if(s.players.length>4||new Set(s.players.map(p=>p.playerId)).size!==s.players.length
    ||s.players.some(p=>!Number.isSafeInteger(p.life)||p.life<0||!Number.isFinite(p.hp)||p.hp<0||p.hp>100))return {applied:false};
  if(m.state==='ended'&&!interruptedMatch(m)&&s.state!=='ended')return {applied:false};
  // Copy decisions, never calculate damage/death/respawn/score/victory. Preserve
  // private ownership and never resurrect a participant removed by a concurrent leave.
  const valid=await live(ctx,m);
  let next=mergeCombatSnapshot({...m,participants:valid},s);
  if(interruptedMatch(m))next={...next,state:'ended',reason:m.reason,endedAt:m.endedAt,
    participants:next.participants.map(p=>({...p,respawnAt:null}))};
  await save(ctx,{...next,damageRevision:args.revision,...(args.retryDeadline!==undefined?{retryDeadline:args.retryDeadline}:{})});return {applied:true};
}});
// Retry votes are decided by the bound relay. This transaction validates the
// remaining sessions and stores the next generation once; it never counts votes.
export const advanceRealtimeRound=internalMutation({args:{matchId:v.id('pvpMatches'),round:v.number(),authorityId:v.string(),
  playerIds:v.array(v.string()),startedAt:nullableNumber},handler:async(ctx,args)=>{
  requireDev();const m=await ctx.db.get(args.matchId);
  if(m&&(m.round??0)===args.round+1&&m.retryFromAuthorityId===args.authorityId){
    const deadlines={},rooms={};await live(ctx,m,deadlines,rooms);return publicMatch(m,deadlines,rooms);
  }
  if(!m||(m.round??0)!==args.round||m.combatAuthorityId!==args.authorityId||m.state!=='ended'
    ||m.retryDeadline===undefined||m.expiresAt<=Date.now())fail('Retry round unavailable.');
  if(args.playerIds.length>4||new Set(args.playerIds).size!==args.playerIds.length)fail('Invalid Retry participants.');
  const deadlines={},rooms={},valid=await live(ctx,m,deadlines,rooms);
  // A Leave can commit before its reactive echo reaches the relay. Intersect the
  // chosen IDs with current valid members; never add/revive a removed participant.
  const participants=valid.filter(p=>args.playerIds.includes(p.playerId)).map(p=>({...newFighter(p),life:p.life+1}));
  if(!participants.length){await ctx.db.delete(m._id);return null;}
  const hostPlayerId=participants.some(p=>p.playerId===m.hostPlayerId)?m.hostPlayerId:participants[0].playerId;
  let next={...m,round:args.round+1,combatAuthorityId:undefined,retryDeadline:undefined,retryFromAuthorityId:args.authorityId,
    payload:undefined,damageRevision:0,state:'waiting',hostPlayerId,participants,scores:{A:0,B:0},startedAt:null,endsAt:null,endedAt:null,winner:null,reason:null};
  // The relay requests a start only with opposing teams. A concurrent Leave or
  // session expiry can safely downgrade that request to waiting, never solo play.
  if(args.startedAt!==null&&canStartMatch(next)){
    if(!Number.isFinite(args.startedAt)||args.startedAt<Date.now()||args.startedAt>Date.now()+10000)fail('Invalid Retry start.');
    next={...next,state:'countdown',startedAt:args.startedAt,endsAt:args.startedAt+next.timeLimitMs};
  }
  await save(ctx,next);return publicMatch(next,deadlines,rooms);
}});
// Legacy hit-only mirror is deliberately disabled: it cannot own combat lifecycle.
export const applyRealtimeDamage=internalMutation({args:{matchId:v.id('pvpMatches'),round:v.number(),expectedRevision:v.number(),
  shooterId:v.string(),targetId:v.string(),attackerLife:v.number(),targetLife:v.number(),shotSeq:v.number(),
  hpBefore:v.number(),hpAfter:v.number(),acceptedAt:v.number()},handler:async()=>({applied:false})});
export const finish=mutation({args:{...command,force:v.optional(v.boolean())},handler:async(ctx,args)=>{
  const {m}=await read(ctx,args);
  requireRound(m,args);
  if(args.force){requireDev();if(m.hostPlayerId!==args.playerId)fail('Only the host can end the match.');}
  if(args.force)fail('End the match through the realtime server.');
  // Membership recovery acknowledgement only; combat results are mirrored by the relay.
  if(m.state==='ended'&&interruptedMatch(m))await save(ctx,m);
}});
// Reuse the same short-code lobby after an interrupted round. Concurrent returns
// reset it once; round/life generations reject delayed combat and leave requests.
export const returnToLobby=mutation({args:command,handler:async(ctx,args)=>{
  await player(ctx,args);
  const saved=await ctx.db.get(args.matchId);
  if(!saved||!owns(saved,args)||saved.expiresAt<=Date.now())return null;
  if(saved.retryDeadline!==undefined)return null; // The relay owns this end window.
  const active=await live(ctx,saved);
  if(!active.some(p=>p.playerId===saved.hostPlayerId))return null;
  if(saved.state==='waiting'&&(saved.round??0)===(args.round??0)+1)return {matchId:saved._id};
  if((saved.round??0)!==(args.round??0))return null;
  const m=reconcileParticipants(saved,active,Date.now());
  if(m.state!=='ended'||m.reason!=='team_empty')return null;
  await save(ctx,{...m,round:(m.round??0)+1,combatAuthorityId:undefined,payload:undefined,damageRevision:0,state:'waiting',scores:{A:0,B:0},
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
  if(!Object.hasOwn(PVP_MODES,m?.mode??'')||(!returning&&!['countdown','active','ended'].includes(m.state))||!owns(m,p)||m.expiresAt<=Date.now())
    fail('Invalid PvP match membership.');
}
