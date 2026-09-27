import { internalMutationGeneric as internalMutation,mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { AVAILABLE_EMOTES,EMOTE_COOLDOWN_MS,EMOTE_DURATION_MS } from '../src/emotes/config.js';
import { findSessionPlayer } from './playerSessions.js';
import { isPlayerActive } from '../src/multiplayer/presencePolicy.js';
import { characterBaseIdFor } from '../src/characters.js';

export const inRoom=query({
  args:{room:v.string()},
  handler:async(ctx,{room})=>(await ctx.db.query('emoteEvents').withIndex('by_room',q=>q.eq('room',room)).collect())
    .filter(event=>Date.now()-event.createdAt<EMOTE_DURATION_MS),
});

export const send=mutation({
  args:{room:v.string(),playerId:v.string(),sessionId:v.string(),emote:v.string()},
  handler:async(ctx,args)=>{
    const player=await findSessionPlayer(ctx,undefined,args.playerId);
    if(!player||player.playerId!==args.playerId||player.sessionId!==args.sessionId||player.room!==args.room||!isPlayerActive(player))
      throw new Error('Invalid session or room.');
    if(!AVAILABLE_EMOTES.includes(args.emote))throw new Error('Invalid emote.');
    const now=Date.now();
    const existing=await ctx.db.query('emoteEvents').withIndex('by_player',q=>q.eq('playerId',args.playerId)).unique();
    if(existing&&now-existing.createdAt<EMOTE_COOLDOWN_MS)throw new Error('EMOTE_COOLDOWN');
    const event={playerId:player.playerId,characterBaseId:characterBaseIdFor(player),room:player.room,emote:args.emote,createdAt:now};
    if(existing)await ctx.db.patch(existing._id,event);else await ctx.db.insert('emoteEvents',event);
    return event;
  },
});

export const cleanup=internalMutation({
  args:{},
  handler:async ctx=>{
    const expired=await ctx.db.query('emoteEvents').withIndex('by_createdAt',q=>q.lt('createdAt',Date.now()-EMOTE_DURATION_MS)).take(100);
    for(const event of expired)await ctx.db.delete(event._id);
  },
});
