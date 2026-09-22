import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { CHARACTER_ITEM_COOLDOWN_MS,canCharacterOwnItem,characterItemDefinition } from '../src/inventory/characterItems.js';

async function authenticatedProfile(ctx,token){
  const {profile}=await requireSessionToken(ctx,token);
  if(!profile?.selectedCharacterId)throw new Error('Select a character before using items.');
  return profile;
}
async function findItem(ctx,profileId,itemId){
  return ctx.db.query('characterItems').withIndex('by_profile_item',q=>q
    .eq('profileId',profileId).eq('itemId',itemId)).unique();
}
function publicItem(item){
  if(!item)return null;
  return {itemId:item.itemId,characterId:item.characterId,active:Boolean(item.active),
    cooldownUntil:item.cooldownUntil,updatedAt:item.updatedAt};
}

export const forProfile=query({
  args:{token:v.string()},
  handler:async(ctx,{token})=>{
    const profile=await authenticatedProfile(ctx,token);
    const rows=await ctx.db.query('characterItems').withIndex('by_profile',q=>q.eq('profileId',profile._id)).collect();
    return rows.map(publicItem);
  },
});

export const claim=mutation({
  args:{token:v.string(),itemId:v.string()},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    if(!canCharacterOwnItem(profile.selectedCharacterId,args.itemId))throw new Error('This character cannot collect that item.');
    const existing=await findItem(ctx,profile._id,args.itemId);
    if(existing)return {item:publicItem(existing),duplicate:true};
    const item={profileId:profile._id,characterId:profile.selectedCharacterId,itemId:args.itemId,
      active:false,cooldownUntil:0,updatedAt:Date.now()};
    await ctx.db.insert('characterItems',item);
    return {item:publicItem(item),duplicate:false};
  },
});

export const setActive=mutation({
  args:{token:v.string(),itemId:v.string(),active:v.boolean()},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    const definition=characterItemDefinition(args.itemId);
    if(!definition?.activatable||!canCharacterOwnItem(profile.selectedCharacterId,args.itemId))throw new Error('This character cannot use that item.');
    const existing=await findItem(ctx,profile._id,args.itemId);
    if(!existing)throw new Error('Item has not been collected.');
    const now=Date.now();if(existing.cooldownUntil>now)throw new Error('Item is cooling down.');
    const next={active:args.active,cooldownUntil:now+CHARACTER_ITEM_COOLDOWN_MS,updatedAt:now,
      characterId:profile.selectedCharacterId};
    await ctx.db.patch(existing._id,next);
    return publicItem({...existing,...next});
  },
});
