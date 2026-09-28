import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { CHARACTER_ITEM_COOLDOWN_MS,canCharacterOwnItem,characterItemDefinition } from '../src/inventory/characterItems.js';
import { baseCharacterId, characterBaseIdFor } from '../src/characters.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { equippedItemId, findLoadout } from './characterLoadouts.js';

async function authenticatedProfile(ctx,token){
  const {profile}=await requireSessionToken(ctx,token);
  if(!profile?.selectedCharacterId)throw new Error('Select a character before using items.');
  return profile;
}
async function findItem(ctx,profileId,itemId){
  return ctx.db.query('characterItems').withIndex('by_profile_item',q=>q
    .eq('profileId',profileId).eq('itemId',itemId)).unique();
}
function publicItem(item,active=false){
  if(!item)return null;
  return {itemId:item.itemId,characterBaseId:item.characterBaseId??baseCharacterId(item.characterId),active,
    cooldownUntil:item.cooldownUntil,updatedAt:item.updatedAt};
}

async function activeSession(ctx,{token,playerId,sessionId}){
  const profile=await authenticatedProfile(ctx,token);
  const player=await requireAuthenticatedLivePlayer(ctx,playerId,sessionId);
  if(player.profileId!==profile._id||characterBaseIdFor(player)!==baseCharacterId(profile.selectedCharacterId))
    throw new Error('CHARACTER_SESSION_LOST');
  return {profile,player,characterBaseId:characterBaseIdFor(player)};
}

export const forProfile=query({
  args:{token:v.string(),playerId:v.optional(v.string()),sessionId:v.optional(v.string())},
  handler:async(ctx,args)=>{
    const {profile,characterBaseId}=args.playerId===undefined&&args.sessionId===undefined
      ?{profile:await authenticatedProfile(ctx,args.token),characterBaseId:null}
      :await activeSession(ctx,args);
    const rows=await ctx.db.query('characterItems').withIndex('by_profile',q=>q.eq('profileId',profile._id)).collect();
    const selectedBaseId=characterBaseId??baseCharacterId(profile.selectedCharacterId);
    const activeItemId=await equippedItemId(ctx,profile._id,selectedBaseId);
    return rows.map(row=>publicItem(row,row.itemId===activeItemId));
  },
});

export const claim=mutation({
  args:{token:v.string(),itemId:v.string()},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    const characterBaseId=baseCharacterId(profile.selectedCharacterId);
    if(!canCharacterOwnItem(characterBaseId,args.itemId))throw new Error('This character cannot collect that item.');
    const existing=await findItem(ctx,profile._id,args.itemId);
    if(existing)return {item:publicItem(existing,(await equippedItemId(ctx,profile._id,characterBaseId))===args.itemId),duplicate:true};
    const item={profileId:profile._id,characterBaseId,itemId:args.itemId,
      cooldownUntil:0,updatedAt:Date.now()};
    await ctx.db.insert('characterItems',item);
    return {item:publicItem(item),duplicate:false};
  },
});

export const setActive=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string(),itemId:v.string(),active:v.boolean()},
  handler:async(ctx,args)=>{
    const {profile,player,characterBaseId}=await activeSession(ctx,args);
    const definition=characterItemDefinition(args.itemId);
    if(!definition?.activatable||!canCharacterOwnItem(characterBaseId,args.itemId))throw new Error('This character cannot use that item.');
    const existing=await findItem(ctx,profile._id,args.itemId);
    if(!existing)throw new Error('Item has not been collected.');
    const loadout=await findLoadout(ctx,profile._id,characterBaseId);
    const current=await equippedItemId(ctx,profile._id,characterBaseId);
    const nextItemId=args.active?args.itemId:(current===args.itemId?null:current);
    if(nextItemId===current)return publicItem(existing,current===args.itemId);
    const now=Date.now();if(existing.cooldownUntil>now)throw new Error('Item is cooling down.');
    const next={activeItemId:nextItemId??undefined,updatedAt:now};
    if(loadout)await ctx.db.patch(loadout._id,next);
    else await ctx.db.insert('characterLoadouts',{profileId:profile._id,characterBaseId,...next});
    await ctx.db.patch(existing._id,{cooldownUntil:now+CHARACTER_ITEM_COOLDOWN_MS,updatedAt:now});
    await ctx.db.patch(player._id,{activeCharacterItem:nextItemId});
    return publicItem({...existing,cooldownUntil:now+CHARACTER_ITEM_COOLDOWN_MS,updatedAt:now},nextItemId===args.itemId);
  },
});
