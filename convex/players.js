import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import { CHARACTERS, characterById } from '../src/characters.js';
import {
  isPresenceActive,
  ownsCharacterSession,
  PRESENCE_TIMEOUT_MS,
} from '../src/multiplayer/presencePolicy.js';
import { canCharacterOwnItem } from '../src/inventory/characterItems.js';
import { publicProfile,requireSession } from './profileStore.js';

export const availability = query({
  args: {},
  handler: async ctx => {
    const rows = await ctx.db.query('players').collect();
    return CHARACTERS.map(c => {
      const presence=rows.find(player=>player.characterId===c.id);
      return {characterId:c.id,active:isPresenceActive(presence?.lastSeen),lastSeen:presence?.lastSeen??0};
    });
  },
});

export const claim = internalMutation({
  args: { tokenHash:v.string(),characterId:v.string(),sessionId:v.string() },
  handler: async (ctx,{tokenHash,characterId,sessionId}) => {
    const c=characterById(characterId);
    if(!c||sessionId.length<16||sessionId.length>100)throw new Error('Invalid character/session');
    const {profile}=await requireSession(ctx,tokenHash);
    const old=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',characterId)).unique();
    if(old&&old.profileId!==profile._id&&old.sessionId!==sessionId&&isPresenceActive(old.lastSeen))return {ok:false};
    const now=Date.now();
    for(const row of await ctx.db.query('players').collect())
      if((row.profileId===profile._id||row.sessionId===sessionId)&&row._id!==old?._id)await ctx.db.delete(row._id);
    await ctx.db.patch(profile._id,{selectedCharacterId:c.id,updatedAt:now});
    const state={profileId:profile._id,playerId:c.id,characterId:c.id,name:c.name,sessionId,room:'selection',x:0,y:0,direction:'down',equippedSkin:'classic',activeCharacterItem:null,lastSeen:now};
    if(old)await ctx.db.patch(old._id,state);else await ctx.db.insert('players',state);
    return {ok:true,profile:publicProfile({...profile,selectedCharacterId:c.id,updatedAt:now})};
  },
});

export const release = mutation({
  args:{characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{characterId,sessionId})=>{
    const row=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',characterId)).unique();
    const released=row?.sessionId===sessionId;
    if(released)await ctx.db.delete(row._id);
    return {released};
  },
});

export const inRoom = query({
  args: { room: v.string() },
  handler: async (ctx, { room }) => (await ctx.db.query('players').withIndex('by_room', q => q.eq('room', room)).collect())
    .map(({sessionId,...publicState})=>publicState),
});

export const update = mutation({
  args: {
    playerId: v.string(), name: v.string(), room: v.string(),
    profileId:v.optional(v.id('profiles')),
    characterId: v.string(), sessionId: v.string(),
    x: v.number(), y: v.number(), direction: v.string(),
    equippedSkin:v.optional(v.union(v.literal('classic'),v.literal('remastered'))),
    activeCharacterItem:v.union(v.literal('lung_crusher_3000'),v.null()),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.x) || !Number.isFinite(args.y) ||
        args.playerId.length > 100 || args.name.length > 40 ||
        !['school', 'outside', 'arena', 'selection'].includes(args.room) ||
        !['up', 'down', 'left', 'right'].includes(args.direction)) throw new Error('Invalid player state');
    if(args.activeCharacterItem&&!canCharacterOwnItem(args.characterId,args.activeCharacterItem))
      throw new Error('Invalid active character item');
    const existing = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', args.playerId)).unique();
    if(!ownsCharacterSession(existing,args.characterId,args.sessionId)||args.characterId!==args.playerId)throw new Error('CHARACTER_SESSION_LOST');
    const state = { ...args, name:characterById(args.characterId).name, lastSeen: Date.now() };
    await ctx.db.patch(existing._id, state);
  },
});

export const heartbeat = mutation({
  args: { characterId:v.string(), sessionId:v.string() },
  handler: async (ctx, {characterId,sessionId}) => {
    const existing=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',characterId)).unique();
    if(!ownsCharacterSession(existing,characterId,sessionId))throw new Error('CHARACTER_SESSION_LOST');
    await ctx.db.patch(existing._id,{lastSeen:Date.now()});
  },
});

// Expiry also handles crashed/closed tabs, without relying on an unload request.
export const cleanup = internalMutation({
  args: {},
  handler: async ctx => {
    const stale = await ctx.db.query('players').withIndex(
      'by_lastSeen',q=>q.lt('lastSeen',Date.now()-PRESENCE_TIMEOUT_MS),
    ).take(200);
    for (const player of stale) await ctx.db.delete(player._id);
  },
});
