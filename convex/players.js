import { findSessionPlayer } from './playerSessions.js';
import { soloArenaRoom,arenaLobbyId,roomMapKey } from '../src/boss/arenaRooms.js';
import { requireArenaRoomMembership } from './arenaLobbies.js';
import { requirePvpMembership } from './pvpMatches.js';
import { PVP_MAP,PVP_INSPECTION_SCENE,pvpMatchId } from '../src/pvp/config.js';
import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import { baseCharacterId, characterBaseIdFor, characterById } from '../src/characters.js';
import {
  isPlayerActive,
  ownsCharacterSession,
  ownsPlayerSession,
  PRESENCE_TIMEOUT_MS,
  TERMINAL_LEASE_MS,
  STATIONARY_LEASE_MS,
} from '../src/multiplayer/presencePolicy.js';
import { canCharacterOwnItem,isCharacterItemEnabled } from '../src/inventory/characterItems.js';
import { publicProfile,requireSession } from './profileStore.js';
import { MAX_PLAYER_CAPACITY } from '../src/multiplayer/playerCapacity.js';
import { normalizeDisplayName } from '../src/displayName.js';
import { equippedItemId } from './characterLoadouts.js';
import { findProfileCharacterState,publicClassState,savePlayerClassState } from './profileCharacterState.js';

export const availability = query({
  args: {},
  handler: async ctx => {
    const rows = await ctx.db.query('players').collect();
    return {maxPlayers:MAX_PLAYER_CAPACITY,players:rows.map(({sessionId,guestId,...player})=>({
      ...player,characterBaseId:characterBaseIdFor(player),
      activeCharacterItem:isCharacterItemEnabled(player.activeCharacterItem)?player.activeCharacterItem:null,
    }))};
  },
});

function selectedCharacter(characterBaseId,characterId){
  const selected=characterBaseId??characterId;
  if(characterBaseId!==undefined&&characterId!==undefined&&baseCharacterId(characterId)!==characterBaseId)
    throw new Error('Invalid character base');
  const character=characterById(selected);
  if(!character)return null;
  return character;
}

export const claim = internalMutation({
  args: { tokenHash:v.string(),characterBaseId:v.optional(v.string()),characterId:v.optional(v.string()),sessionId:v.string() },
  handler: async (ctx,{tokenHash,characterBaseId,characterId,sessionId}) => {
    const c=selectedCharacter(characterBaseId,characterId);
    if(!c||sessionId.length<16||sessionId.length>100)throw new Error('Invalid character/session');
    const {profile}=await requireSession(ctx,tokenHash);
    const displayName=normalizeDisplayName(profile.displayName);
    const rows=await ctx.db.query('players').collect();
    const existing=rows.filter(row=>row.profileId===profile._id||row.sessionId===sessionId);
    if(rows.filter(row=>isPlayerActive(row)).length-existing.filter(row=>isPlayerActive(row)).length>=MAX_PLAYER_CAPACITY)
      return {ok:false,reason:'full'};
    const now=Date.now();
    for(const row of existing){
      if(row.profileId===profile._id&&isPlayerActive(row,now))await savePlayerClassState(ctx,row,now);
      await ctx.db.delete(row._id);
    }
    await ctx.db.patch(profile._id,{selectedCharacterId:c.id,updatedAt:now});
    const savedItem=await equippedItemId(ctx,profile._id,baseCharacterId(c.id));
    const activeCharacterItem=isCharacterItemEnabled(savedItem)?savedItem:null;
    const classState=publicClassState(await findProfileCharacterState(ctx,profile._id,baseCharacterId(c.id)));
    const state={profileId:profile._id,identityKind:'profile',playerId:'pending',characterId:c.id,
      characterBaseId:baseCharacterId(c.id),name:displayName,displayName,sessionId,room:'selection',x:0,y:0,direction:'down',presenceMode:'playing',
      equippedSkin:'classic',activeCharacterItem,moving:undefined,velocityX:undefined,velocityY:undefined,lastSeen:now};
    // A fresh Convex document ID is the independent live identity; never an authorization token.
    const playerId=await ctx.db.insert('players',state);
    await ctx.db.patch(playerId,{playerId});
    return {ok:true,playerId,profile:publicProfile({...profile,selectedCharacterId:c.id,updatedAt:now}),classState};
  },
});

export const claimGuest = mutation({
  args:{guestId:v.string(),characterBaseId:v.optional(v.string()),characterId:v.optional(v.string()),sessionId:v.string()},
  handler:async(ctx,{guestId,characterBaseId,characterId,sessionId})=>{
    const c=selectedCharacter(characterBaseId,characterId);
    if(!c||guestId.length<22||guestId.length>120||sessionId.length<16||sessionId.length>100)
      throw new Error('Invalid guest/session');
    const rows=await ctx.db.query('players').collect();
    const existing=rows.filter(row=>row.guestId===guestId||row.sessionId===sessionId);
    if(rows.filter(row=>isPlayerActive(row)).length-existing.filter(row=>isPlayerActive(row)).length>=MAX_PLAYER_CAPACITY)
      return {ok:false,reason:'full'};
    const now=Date.now();
    for(const row of existing)await ctx.db.delete(row._id);
    const state={guestId,identityKind:'guest',playerId:'pending',characterId:c.id,characterBaseId:baseCharacterId(c.id),name:c.name,displayName:c.name,
      sessionId,room:'selection',x:0,y:0,direction:'down',presenceMode:'playing',equippedSkin:'classic',activeCharacterItem:null,moving:undefined,velocityX:undefined,velocityY:undefined,lastSeen:now};
    // A fresh Convex document ID is the independent live identity; never an authorization token.
    const playerId=await ctx.db.insert('players',state);
    await ctx.db.patch(playerId,{playerId});
    return {ok:true,playerId};
  },
});

export const release = mutation({
  args:{playerId:v.optional(v.string()),characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{playerId,characterId,sessionId})=>{
    const row=await findSessionPlayer(ctx,characterId,playerId);
    const released=ownsCharacterSession(row,characterId,sessionId)&&(playerId===undefined||ownsPlayerSession(row,playerId,sessionId));
    if(released){
      if(isPlayerActive(row))await savePlayerClassState(ctx,row);
      await ctx.db.delete(row._id);
    }
    return {released};
  },
});

export const inRoom = query({
  args: { room: v.string() },
  handler: async (ctx, { room }) => (await ctx.db.query('players').withIndex('by_room', q => q.eq('room', room)).collect())
    .map(({sessionId,guestId,...publicState})=>({...publicState,
      activeCharacterItem:isCharacterItemEnabled(publicState.activeCharacterItem)?publicState.activeCharacterItem:null,
      characterBaseId:characterBaseIdFor(publicState)})),
});

export const enterStationary = mutation({
  args:{playerId:v.optional(v.string()),characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{playerId,characterId,sessionId})=>{
    const player=await findSessionPlayer(ctx,characterId,playerId);
    const now=Date.now();
    if(!ownsCharacterSession(player,characterId,sessionId)||(playerId!==undefined&&!ownsPlayerSession(player,playerId,sessionId))||!isPlayerActive(player,now))throw new Error('CHARACTER_SESSION_LOST');
    if(player.presenceMode&&player.presenceMode!=='playing')throw new Error('PLAYER_NOT_PLAYING');
    const stationaryLeaseExpiresAt=now+STATIONARY_LEASE_MS;
    await ctx.db.patch(player._id,{presenceMode:'stationary',stationaryLeaseExpiresAt,terminalLeaseExpiresAt:undefined});
    return {presenceMode:'stationary',stationaryLeaseExpiresAt,serverNow:now};
  },
});

export const renewStationary = mutation({
  args:{playerId:v.optional(v.string()),characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{playerId,characterId,sessionId})=>{
    const player=await findSessionPlayer(ctx,characterId,playerId);
    const now=Date.now();
    if(!ownsCharacterSession(player,characterId,sessionId)||(playerId!==undefined&&!ownsPlayerSession(player,playerId,sessionId))||player.presenceMode!=='stationary'||!isPlayerActive(player,now))
      throw new Error('CHARACTER_SESSION_LOST');
    const stationaryLeaseExpiresAt=now+STATIONARY_LEASE_MS;
    await ctx.db.patch(player._id,{stationaryLeaseExpiresAt});
    return {presenceMode:'stationary',stationaryLeaseExpiresAt,serverNow:now};
  },
});

export const enterTerminal = mutation({
  args:{playerId:v.optional(v.string()),characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{playerId,characterId,sessionId})=>{
    const player=await findSessionPlayer(ctx,characterId,playerId);
    const now=Date.now();
    if(!ownsCharacterSession(player,characterId,sessionId)||(playerId!==undefined&&!ownsPlayerSession(player,playerId,sessionId))||!isPlayerActive(player,now))throw new Error('CHARACTER_SESSION_LOST');
    if(player.presenceMode==='terminal')throw new Error('TERMINAL_ALREADY_ACTIVE');
    const terminalLeaseExpiresAt=now+TERMINAL_LEASE_MS;
    await ctx.db.patch(player._id,{presenceMode:'terminal',terminalLeaseExpiresAt,stationaryLeaseExpiresAt:undefined});
    return {presenceMode:'terminal',terminalLeaseExpiresAt,serverNow:now};
  },
});

export const exitTerminal = mutation({
  args:{playerId:v.optional(v.string()),characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{playerId,characterId,sessionId})=>{
    const player=await findSessionPlayer(ctx,characterId,playerId);
    const now=Date.now();
    if(!ownsCharacterSession(player,characterId,sessionId)||(playerId!==undefined&&!ownsPlayerSession(player,playerId,sessionId))||player.presenceMode!=='terminal'||!isPlayerActive(player,now))throw new Error('CHARACTER_SESSION_LOST');
    await ctx.db.patch(player._id,{presenceMode:'playing',terminalLeaseExpiresAt:undefined,stationaryLeaseExpiresAt:undefined,lastSeen:now});
    return {ok:true,presenceMode:'playing',lastSeen:now};
  },
});

export const update = mutation({
  args: {
    playerId: v.string(), name: v.optional(v.string()),displayName:v.optional(v.string()), room: v.string(),
    characterId: v.string(), sessionId: v.string(),
    x: v.number(), y: v.number(), direction: v.string(),
    moving:v.optional(v.boolean()),velocityX:v.optional(v.number()),velocityY:v.optional(v.number()),
    equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),
    activeCharacterItem:v.optional(v.union(v.string(),v.null())),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.x) || !Number.isFinite(args.y) ||
        (args.velocityX !== undefined && !Number.isFinite(args.velocityX)) ||
        (args.velocityY !== undefined && !Number.isFinite(args.velocityY)) ||
        args.playerId.length > 100 || (args.name!==undefined&&args.name.length > 40) ||
        (args.displayName!==undefined&&args.displayName.length>32) ||
        !['school', 'outside', 'arena', 'office2', 'office3', 'secret-path', 'selection',PVP_MAP,PVP_INSPECTION_SCENE].includes(roomMapKey(args.room)) ||
        !['up', 'down', 'left', 'right'].includes(args.direction)) throw new Error('Invalid player state');
    if(args.activeCharacterItem&&!canCharacterOwnItem(baseCharacterId(args.characterId),args.activeCharacterItem))
      throw new Error('Invalid active character item');
    const existing = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', args.playerId)).unique();
    if(!ownsCharacterSession(existing,args.characterId,args.sessionId)||!ownsPlayerSession(existing,args.playerId,args.sessionId)
      ||!isPlayerActive(existing))throw new Error('CHARACTER_SESSION_LOST');
    if(existing.presenceMode==='terminal')return;
    // Older clients publishing bare `arena` are also isolated, never placed in a shared solo room.
    const room=args.room==='arena'?soloArenaRoom(args.playerId):args.room;
    if(roomMapKey(room)===PVP_MAP){
      const matchId=pvpMatchId(room);if(!matchId)throw new Error('Missing PvP match.');
      await requirePvpMembership(ctx,existing,matchId);
    }
    if(roomMapKey(room)==='arena'){
      const lobbyId=arenaLobbyId(room);
      if(lobbyId)await requireArenaRoomMembership(ctx,existing,lobbyId);
      else if(room!==soloArenaRoom(args.playerId))throw new Error('Invalid solo arena identity.');
    }
    if(existing.room!==room)await savePlayerClassState(ctx,existing);
    const publishedItem=existing.profileId?existing.activeCharacterItem:args.activeCharacterItem;
    const state = {
      room,x:args.x,y:args.y,direction:args.direction,
      characterBaseId:baseCharacterId(args.characterId),
      moving:args.moving,velocityX:args.velocityX,velocityY:args.velocityY,
      equippedSkin:args.equippedSkin,activeCharacterItem:isCharacterItemEnabled(publishedItem)?publishedItem??null:null,
      name:existing.displayName??existing.name,
      displayName:existing.displayName??existing.name,lastSeen:Date.now(),
      presenceMode:'playing',stationaryLeaseExpiresAt:undefined,
    };
    await ctx.db.patch(existing._id, state);
  },
});

export const heartbeat = mutation({
  args: { playerId:v.optional(v.string()), characterId:v.string(), sessionId:v.string() },
  handler: async (ctx, {playerId,characterId,sessionId}) => {
    const existing=await findSessionPlayer(ctx,characterId,playerId);
    if(!ownsCharacterSession(existing,characterId,sessionId)||(playerId!==undefined&&!ownsPlayerSession(existing,playerId,sessionId))||!isPlayerActive(existing))throw new Error('CHARACTER_SESSION_LOST');
    if(existing.presenceMode==='terminal'||existing.presenceMode==='stationary')return;
    await ctx.db.patch(existing._id,{lastSeen:Date.now()});
  },
});

// Garbage collection only: reservation expiry and reclaim do not depend on deletion.
export const cleanup = internalMutation({
  args: {},
  handler: async ctx => {
    const now=Date.now();
    const stale = await ctx.db.query('players').withIndex(
      'by_lastSeen',q=>q.lte('lastSeen',now-PRESENCE_TIMEOUT_MS),
    ).filter(q=>q.and(q.neq(q.field('presenceMode'),'terminal'),q.neq(q.field('presenceMode'),'stationary'))).take(200);
    const stationary = await ctx.db.query('players').withIndex(
      'by_presenceMode_stationaryLease',q=>q.eq('presenceMode','stationary').lte('stationaryLeaseExpiresAt',now),
    ).take(200);
    const terminal = await ctx.db.query('players').withIndex(
      'by_presenceMode_lease',q=>q.eq('presenceMode','terminal').lte('terminalLeaseExpiresAt',now),
    ).take(200);
    for (const player of [...stale,...stationary,...terminal]) if(!isPlayerActive(player,now))await ctx.db.delete(player._id);
  },
});
