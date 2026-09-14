import { internalMutationGeneric as internalMutation,mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { AVAILABLE_EMOTES,EMOTE_COOLDOWN_MS,EMOTE_DURATION_MS } from '../src/emotes/config.js';
import { requireActivePlayer } from './playerSessions.js';

export const inRoom=query({
  args:{room:v.string()},
  handler:async(ctx,{room})=>(await ctx.db.query('emoteEvents').withIndex('by_room',q=>q.eq('room',room)).collect())
    .filter(event=>Date.now()-event.createdAt<EMOTE_DURATION_MS),
});

export const send=mutation({
  args:{room:v.string(),characterId:v.string(),sessionId:v.string(),emote:v.string()},
  handler:async(ctx,args)=>{
    const player=await requireActivePlayer(ctx,args.characterId,args.sessionId,args.room);
    if(!AVAILABLE_EMOTES.includes(args.emote))throw new Error('Invalid emote.');
    const now=Date.now();
    const existing=await ctx.db.query('emoteEvents').withIndex('by_character',q=>q.eq('characterId',args.characterId)).unique();
    if(existing&&now-existing.createdAt<EMOTE_COOLDOWN_MS)throw new Error('EMOTE_COOLDOWN');
    const event={characterId:player.characterId,playerId:player.playerId,room:player.room,emote:args.emote,createdAt:now};
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
