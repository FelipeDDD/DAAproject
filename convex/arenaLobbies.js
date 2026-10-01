import { mutationGeneric as mutation,queryGeneric as query,internalMutationGeneric as internalMutation,anyApi } from 'convex/server';
import { v,ConvexError } from 'convex/values';
import { ARENA_CODE_ALPHABET,normalizeArenaCode,validArenaCode } from '../src/boss/arenaLobbyUi.js';
import { findSessionPlayer } from './playerSessions.js';
import { isPlayerActive,ownsPlayerSession,PRESENCE_TIMEOUT_MS } from '../src/multiplayer/presencePolicy.js';
import { ARENA_COOP_CAPACITY,ARENA_LOBBY_LIFETIME_MS,coopArenaRoom } from '../src/boss/arenaRooms.js';

const identityArgs={playerId:v.string(),sessionId:v.string()};
const memberArgs={...identityArgs,lobbyId:v.id('arenaLobbies')};
function requireDev(){
  if(process.env.DEV_TOOLS_ENABLED!=='true'&&!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??''))
    throw new ConvexError('ARENA_DEV_DISABLED');
}
async function requirePlayer(ctx,args){
  const player=await findSessionPlayer(ctx,undefined,args.playerId);
  if(!ownsPlayerSession(player,args.playerId,args.sessionId)||!isPlayerActive(player))throw new Error('CHARACTER_SESSION_LOST');
  return player;
}
const isMember=(lobby,args)=>lobby?.participants.some(p=>p.playerId===args.playerId&&p.sessionId===args.sessionId);
export async function activeArenaMembers(ctx,lobby,now=Date.now()){
  if(!lobby||lobby.status==='closed'||lobby.expiresAt<=now)return [];
  const players=await Promise.all(lobby.participants.map(async member=>{
    const player=await findSessionPlayer(ctx,undefined,member.playerId);
    return ownsPlayerSession(player,member.playerId,member.sessionId)&&isPlayerActive(player,now)?player:null;
  }));
  return players.filter(Boolean);
}
const activeUntil=p=>p.presenceMode==='terminal'?p.terminalLeaseExpiresAt:
  p.presenceMode==='stationary'?p.stationaryLeaseExpiresAt:p.lastSeen+PRESENCE_TIMEOUT_MS;
function publicLobby(lobby,players){
  if(!players.some(p=>p.playerId===lobby.hostPlayerId))return null; // No host migration in phase 1.
  return {lobbyId:lobby._id,code:lobby.code??null,hostPlayerId:lobby.hostPlayerId,status:lobby.status,
    room:coopArenaRoom(lobby._id),maxParticipants:lobby.maxParticipants,expiresAt:lobby.expiresAt,
    participants:players.map(p=>({playerId:p.playerId,displayName:p.displayName??p.name,
      characterBaseId:p.characterBaseId??p.characterId,activeUntil:activeUntil(p)}))};
}
function closedLobby(lobby,reason){
  return {lobbyId:lobby._id,code:lobby.code??null,status:'closed',closedReason:reason,participants:[]};
}
async function closeLobby(ctx,lobby){
  // Retain membership until bounded GC so subscribed guests can receive the closure reason.
  if(lobby.status!=='closed')await ctx.db.patch(lobby._id,{status:'closed',closedReason:'host-left'});
}
async function newLobbyCode(ctx){
  for(let attempt=0;attempt<12;attempt++){
    const code=Array.from({length:6},()=>ARENA_CODE_ALPHABET[Math.floor(Math.random()*ARENA_CODE_ALPHABET.length)]).join('');
    if(!await ctx.db.query('arenaLobbies').withIndex('by_code',q=>q.eq('code',code)).unique())return code;
  }
  throw new Error('Could not allocate an arena lobby code.');
}
export const current=query({
  args:memberArgs,
  handler:async(ctx,args)=>{
    await requirePlayer(ctx,args);
    const lobby=await ctx.db.get(args.lobbyId);
    if(!isMember(lobby,args))return null;
    if(lobby.status==='closed')return closedLobby(lobby,lobby.closedReason??'host-left');
    if(lobby.expiresAt<=Date.now())return closedLobby(lobby,'expired');
    return publicLobby(lobby,await activeArenaMembers(ctx,lobby))??closedLobby(lobby,'host-disconnected');
  },
});
export const create=mutation({
  args:identityArgs,
  handler:async(ctx,args)=>{
    requireDev();const player=await requirePlayer(ctx,args);
    await leaveOtherLobbies(ctx,args);
    const now=Date.now();
    const code=await newLobbyCode(ctx);
    const lobby={code,hostPlayerId:player.playerId,status:'waiting',participants:[args],
      maxParticipants:ARENA_COOP_CAPACITY,createdAt:now,expiresAt:now+ARENA_LOBBY_LIFETIME_MS};
    const lobbyId=await ctx.db.insert('arenaLobbies',lobby);
    // One bounded, one-shot GC per lobby; no recurring idle worker or per-player jobs.
    await ctx.scheduler.runAfter(ARENA_LOBBY_LIFETIME_MS,anyApi.arenaLobbies.expire,{lobbyId});
    return publicLobby({...lobby,_id:lobbyId},[player]);
  },
});
async function leaveOtherLobbies(ctx,args,except){
  const hosted=await ctx.db.query('arenaLobbies').withIndex('by_host',q=>q.eq('hostPlayerId',args.playerId)).collect();
  // The room population is small; membership is array data. Only nonclosed lobbies are inspected.
  const open=await ctx.db.query('arenaLobbies').withIndex('by_status',q=>q.eq('status','waiting')).collect();
  const started=await ctx.db.query('arenaLobbies').withIndex('by_status',q=>q.eq('status','started')).collect();
  const lobbies=new Map([...hosted,...open,...started].map(lobby=>[lobby._id,lobby]));
  for(const lobby of lobbies.values())if(lobby._id!==except&&isMember(lobby,args))await removeMember(ctx,lobby,args);
}
async function removeMember(ctx,lobby,args){
  if(!isMember(lobby,args))return false;
  if(lobby.hostPlayerId===args.playerId)await closeLobby(ctx,lobby);
  else await ctx.db.patch(lobby._id,{participants:lobby.participants.filter(p=>p.playerId!==args.playerId)});
  return true;
}
export const join=mutation({
  args:{...identityArgs,code:v.optional(v.string()),lobbyId:v.optional(v.id('arenaLobbies'))},
  handler:async(ctx,args)=>{
    requireDev();await requirePlayer(ctx,args);
    const code=normalizeArenaCode(args.code);
    if(args.code!==undefined&&!validArenaCode(code))throw new ConvexError('ARENA_CODE_INVALID');
    // ID is transitional compatibility for existing in-flight development clients, never public UI.
    const lobby=args.code!==undefined
      ?await ctx.db.query('arenaLobbies').withIndex('by_code',q=>q.eq('code',code)).unique()
      :args.lobbyId?await ctx.db.get(args.lobbyId):null;
    if(!lobby)throw new ConvexError('ARENA_LOBBY_NOT_FOUND');
    if(lobby.status==='closed')throw new ConvexError('ARENA_LOBBY_CLOSED');
    if(lobby.expiresAt<=Date.now())throw new ConvexError('ARENA_LOBBY_EXPIRED');
    if(lobby.status!=='waiting')throw new ConvexError('ARENA_LOBBY_STARTED');
    const players=await activeArenaMembers(ctx,lobby);
    if(!publicLobby(lobby,players))throw new ConvexError('ARENA_HOST_LEFT');
    if(!isMember(lobby,args)&&players.length>=lobby.maxParticipants)throw new ConvexError('ARENA_LOBBY_FULL');
    await leaveOtherLobbies(ctx,args,lobby._id);
    const participants=lobby.participants.filter(p=>players.some(player=>player.playerId===p.playerId));
    if(!isMember({...lobby,participants},args))participants.push({playerId:args.playerId,sessionId:args.sessionId});
    await ctx.db.patch(lobby._id,{participants});
    return {lobbyId:lobby._id,code:lobby.code??null};
  },
});
export const start=mutation({
  args:memberArgs,
  handler:async(ctx,args)=>{
    await requirePlayer(ctx,args);
    const lobby=await ctx.db.get(args.lobbyId);
    if(!isMember(lobby,args)||lobby.hostPlayerId!==args.playerId)throw new ConvexError('ARENA_HOST_ONLY');
    if(lobby.status==='closed')throw new ConvexError('ARENA_LOBBY_CLOSED');
    if(lobby.status!=='waiting')throw new ConvexError('ARENA_LOBBY_STARTED');
    const players=await activeArenaMembers(ctx,lobby);
    if(!publicLobby(lobby,players))throw new ConvexError('ARENA_LOBBY_EXPIRED');
    await ctx.db.patch(lobby._id,{status:'started',participants:lobby.participants.filter(p=>players.some(player=>player.playerId===p.playerId))});
    return {room:coopArenaRoom(lobby._id)};
  },
});
export const leave=mutation({
  args:memberArgs,
  handler:async(ctx,args)=>{
    // Generation ownership still matters after expiry; a delayed leave cannot remove a new claim.
    const player=await findSessionPlayer(ctx,undefined,args.playerId);
    if(!ownsPlayerSession(player,args.playerId,args.sessionId))return {left:false};
    const lobby=await ctx.db.get(args.lobbyId);
    return {left:lobby?await removeMember(ctx,lobby,args):false};
  },
});
export const expire=internalMutation({
  args:{lobbyId:v.id('arenaLobbies')},
  handler:async(ctx,{lobbyId})=>{
    const lobby=await ctx.db.get(lobbyId);
    if(lobby&&lobby.expiresAt<=Date.now())await ctx.db.delete(lobbyId);
  },
});
export async function requireArenaRoomMembership(ctx,player,lobbyId){
  const lobby=await ctx.db.get(lobbyId);
  if(lobby?.status!=='started'||!isMember(lobby,player)
    ||!(await activeArenaMembers(ctx,lobby)).some(p=>p.playerId===lobby.hostPlayerId))
    throw new Error('Arena lobby closed or invalid membership.');
}
