import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireActivePlayer } from './playerSessions.js';
import { CHARACTER_ITEM_COOLDOWN_MS,canCharacterOwnItem,characterItemDefinition } from '../src/inventory/characterItems.js';

async function findItem(ctx,characterId,itemId){
  return ctx.db.query('characterItems').withIndex('by_character_item',q=>q
    .eq('characterId',characterId).eq('itemId',itemId)).unique();
}

export const forCharacter=query({
  args:{characterId:v.string()},
  handler:async(ctx,{characterId})=>ctx.db.query('characterItems').withIndex('by_character',q=>q.eq('characterId',characterId)).collect(),
});

export const claim=mutation({
  args:{characterId:v.string(),sessionId:v.string(),itemId:v.string()},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    if(!canCharacterOwnItem(args.characterId,args.itemId))throw new Error('This character cannot collect that item.');
    const existing=await findItem(ctx,args.characterId,args.itemId);
    if(existing)return {item:existing,duplicate:true};
    const item={characterId:args.characterId,itemId:args.itemId,active:false,cooldownUntil:0,updatedAt:Date.now()};
    const id=await ctx.db.insert('characterItems',item);return {item:{...item,_id:id},duplicate:false};
  },
});

export const setActive=mutation({
  args:{characterId:v.string(),sessionId:v.string(),itemId:v.string(),active:v.boolean()},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    const definition=characterItemDefinition(args.itemId);
    if(!definition?.activatable||!canCharacterOwnItem(args.characterId,args.itemId))throw new Error('This character cannot use that item.');
    const existing=await findItem(ctx,args.characterId,args.itemId);
    if(!existing)throw new Error('Item has not been collected.');
    const now=Date.now();if(existing.cooldownUntil>now)throw new Error('Item is cooling down.');
    const item={...existing,active:args.active,cooldownUntil:now+CHARACTER_ITEM_COOLDOWN_MS,updatedAt:now};
    await ctx.db.patch(existing._id,item);return item;
  },
});
