import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { CHARACTER_ITEM_COOLDOWN_MS,CHARACTER_ITEM_IDS,HEALTH_POTION_MAX_STACK,canCharacterOwnItem,characterItemDefinition } from '../src/inventory/characterItems.js';
import { baseCharacterId, characterBaseIdFor } from '../src/characters.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { equippedItemId, findLoadout } from './characterLoadouts.js';

const devToolsEnabled=()=>process.env.DEV_TOOLS_ENABLED==='true'
  ||/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??'');

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
    quantity:item.quantity??1,cooldownUntil:item.cooldownUntil,updatedAt:item.updatedAt};
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
    if(args.itemId===CHARACTER_ITEM_IDS.OFFICE2_KEY)throw new Error('Use the office safe to collect this key.');
    if(!canCharacterOwnItem(characterBaseId,args.itemId))throw new Error('This character cannot collect that item.');
    const existing=await findItem(ctx,profile._id,args.itemId);
    if(existing){
      const definition=characterItemDefinition(args.itemId),quantity=existing.quantity??1;
      if(!definition?.maxStack)return {item:publicItem(existing,(await equippedItemId(ctx,profile._id,characterBaseId))===args.itemId),duplicate:true};
      if(quantity>=definition.maxStack)return {item:publicItem(existing),duplicate:true,full:true};
      const next={quantity:quantity+1,updatedAt:Date.now()};await ctx.db.patch(existing._id,next);
      return {item:publicItem({...existing,...next}),duplicate:false,stacked:true};
    }
    const item={profileId:profile._id,characterBaseId,itemId:args.itemId,
      quantity:1,cooldownUntil:0,updatedAt:Date.now()};
    await ctx.db.insert('characterItems',item);
    return {item:publicItem(item),duplicate:false};
  },
});

export const consume=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string(),itemId:v.string()},
  handler:async(ctx,args)=>{
    const {profile,player,characterBaseId}=await activeSession(ctx,args);
    const definition=characterItemDefinition(args.itemId);
    if(!definition?.consumable||!canCharacterOwnItem(characterBaseId,args.itemId))throw new Error('This item cannot be consumed.');
    const existing=await findItem(ctx,profile._id,args.itemId),now=Date.now();
    const quantity=existing?.quantity??0;
    if(!existing||quantity<=0)throw new Error('Item has not been collected.');
    if(existing.cooldownUntil>now)throw new Error('Item is cooling down.');
    const next={quantity:quantity-1,cooldownUntil:now+(definition.cooldownMs??0),updatedAt:now};
    await ctx.db.patch(existing._id,next);
    await ctx.db.patch(player._id,{lastItemUseId:args.itemId,lastItemUseAt:now,lastSeen:now});
    return {...publicItem({...existing,...next}),usedAt:now};
  },
});

export const claimKoettingPotions=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string(),amount:v.number()},
  handler:async(ctx,args)=>{
    if(!Number.isInteger(args.amount)||args.amount<1||args.amount>3)throw new Error('Invalid potion reward amount.');
    const {profile,characterBaseId}=await activeSession(ctx,args);
    const itemId=CHARACTER_ITEM_IDS.HEALTH_POTION;
    const existing=await findItem(ctx,profile._id,itemId);
    const added=Math.min(args.amount,Math.max(0,HEALTH_POTION_MAX_STACK-(existing?.quantity??0)));
    if(!added)return {item:publicItem(existing),added:0};
    const now=Date.now();
    if(existing){
      const next={quantity:(existing.quantity??0)+added,updatedAt:now};
      await ctx.db.patch(existing._id,next);
      return {item:publicItem({...existing,...next}),added};
    }
    const item={profileId:profile._id,characterBaseId,itemId,quantity:added,cooldownUntil:0,updatedAt:now};
    await ctx.db.insert('characterItems',item);
    return {item:publicItem(item),added};
  },
});

export const devClearPotions=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string()},
  handler:async(ctx,args)=>{
    if(!devToolsEnabled())throw new Error('DEV item tools are disabled on this deployment.');
    const {profile}=await activeSession(ctx,args);
    const potion=await findItem(ctx,profile._id,CHARACTER_ITEM_IDS.HEALTH_POTION);
    if(!potion)return {removed:0};
    await ctx.db.delete(potion._id);
    return {removed:potion.quantity??1};
  },
});

export const devGrantOffice2Key=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string()},
  handler:async(ctx,args)=>{
    if(!devToolsEnabled())throw new Error('DEV item tools are disabled on this deployment.');
    const {profile,characterBaseId}=await activeSession(ctx,args);
    const itemId=CHARACTER_ITEM_IDS.OFFICE2_KEY;
    const existing=await findItem(ctx,profile._id,itemId);
    if(existing)return {item:publicItem(existing),duplicate:true};
    const item={profileId:profile._id,characterBaseId,itemId,quantity:1,cooldownUntil:0,updatedAt:Date.now()};
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
