import { queryGeneric as query, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { isPresenceActive, ownsCharacterSession } from '../src/multiplayer/presencePolicy.js';

export const inRoom = query({
  args: { room:v.string() },
  handler: async (ctx,{room}) => (await ctx.db.query('messages')
    .withIndex('by_room_createdAt',q=>q.eq('room',room)).order('desc').take(50)).reverse(),
});

export const send = mutation({
  args: { room:v.string(), characterId:v.string(), sessionId:v.string(), text:v.string() },
  handler: async(ctx,args)=>{
    const text=args.text.trim();
    if(!text||text.length>200)throw new Error('Messages must contain between 1 and 200 characters.');
    const player=await ctx.db.query('players').withIndex('by_player',q=>q.eq('playerId',args.characterId)).unique();
    if(!ownsCharacterSession(player,args.characterId,args.sessionId)||!isPresenceActive(player.lastSeen)||
       player.room!==args.room||!['school','outside','arena'].includes(args.room))throw new Error('Invalid session or room.');
    await ctx.db.insert('messages',{room:player.room,characterId:player.characterId,
      characterName:player.name,text,createdAt:Date.now()});
  },
});
