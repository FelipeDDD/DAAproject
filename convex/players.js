import { queryGeneric as query, mutationGeneric as mutation, internalMutationGeneric as internalMutation } from 'convex/server';
import { v } from 'convex/values';
import { CHARACTERS, characterById } from '../src/characters.js';

export const availability = query({
  args: {},
  handler: async ctx => {
    const rows = await ctx.db.query('players').collect();
    return CHARACTERS.map(c => ({ characterId:c.id, lastSeen:rows.find(p=>p.playerId===c.id)?.lastSeen ?? 0 }));
  },
});

export const claim = mutation({
  args: { characterId:v.string(), sessionId:v.string() },
  handler: async (ctx,{characterId,sessionId}) => {
    const c=characterById(characterId);
    if(!c||sessionId.length<16||sessionId.length>100)throw new Error('Invalid character/session');
    const old=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',characterId)).unique();
    if(old&&old.sessionId!==sessionId&&Date.now()-old.lastSeen<15_000)return {ok:false};
    // One character per session, including simultaneous claims from this client.
    for(const row of await ctx.db.query('players').collect())if(row.sessionId===sessionId&&row._id!==old?._id)await ctx.db.delete(row._id);
    const state={playerId:c.id,characterId:c.id,name:c.name,sessionId,room:'selection',x:0,y:0,direction:'down',lastSeen:Date.now()};
    if(old)await ctx.db.patch(old._id,state);else await ctx.db.insert('players',state);
    return {ok:true};
  },
});

export const release = mutation({
  args:{characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,{characterId,sessionId})=>{
    const row=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',characterId)).unique();
    if(row?.sessionId===sessionId)await ctx.db.delete(row._id);
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
    characterId: v.string(), sessionId: v.string(),
    x: v.number(), y: v.number(), direction: v.string(),
  },
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.x) || !Number.isFinite(args.y) ||
        args.playerId.length > 100 || args.name.length > 40 ||
        !['school', 'outside', 'selection'].includes(args.room) ||
        !['up', 'down', 'left', 'right'].includes(args.direction)) throw new Error('Invalid player state');
    const existing = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', args.playerId)).unique();
    if(!existing||existing.sessionId!==args.sessionId||args.characterId!==args.playerId)throw new Error('CHARACTER_SESSION_LOST');
    const state = { ...args, name:characterById(args.characterId).name, lastSeen: Date.now() };
    await ctx.db.patch(existing._id, state);
  },
});

// Expiry also handles crashed/closed tabs, without relying on an unload request.
export const cleanup = internalMutation({
  args: {},
  handler: async ctx => {
    const stale = await ctx.db.query('players').withIndex('by_lastSeen', q => q.lt('lastSeen', Date.now() - 15_000)).take(200);
    for (const player of stale) await ctx.db.delete(player._id);
  },
});
