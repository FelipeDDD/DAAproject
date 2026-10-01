import { characterBaseIdFor,characterById } from '../src/characters.js';
import { roomMapKey } from '../src/boss/arenaRooms.js';
import { findSessionPlayer } from './playerSessions.js';
import { queryGeneric as query, mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { isPlayerActive, ownsCharacterSession, ownsPlayerSession } from '../src/multiplayer/presencePolicy.js';

export const inRoom = query({
  args: { room:v.string() },
  handler: async (ctx,{room}) => (await ctx.db.query('messages')
    .withIndex('by_room_createdAt',q=>q.eq('room',room)).order('desc').take(50)).reverse(),
});

export const send = mutation({
  args: { room:v.string(), playerId:v.optional(v.string()), characterId:v.string(), sessionId:v.string(), text:v.string() },
  handler: async(ctx,args)=>{
    const text=args.text.trim();
    if(!text||text.length>200)throw new Error('Messages must contain between 1 and 200 characters.');
    const player=await findSessionPlayer(ctx,args.characterId,args.playerId);
    if(!ownsCharacterSession(player,args.characterId,args.sessionId)||(args.playerId!==undefined&&!ownsPlayerSession(player,args.playerId,args.sessionId))||!isPlayerActive(player)||
       player.room!==args.room||!['school','outside','arena','office2','office3','secret-path'].includes(roomMapKey(args.room)))
      throw new Error('Invalid session or room.');
    const characterBaseId=characterBaseIdFor(player);
    const characterName=characterById(characterBaseId)?.name??player.characterName??player.name;
    const displayName=player.displayName??player.name;
    await ctx.db.insert('messages',{room:player.room,characterId:player.characterId,
      characterName,authorPlayerId:player.playerId,displayName,
      characterBaseId:characterBaseIdFor(player),profileId:player.profileId,text,createdAt:Date.now()});
  },
});
