import { ROULETTE_COST,ROULETTE_REWARDS } from '../src/economy/config.js';
import { selectWeightedReward } from '../src/economy/weightedRewards.js';
import { grantReward,spendCoins } from './rewardStore.js';
import { mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { profileCoins } from './rewardStore.js';
import { COIN_BRACKETS,CIGARETTE_REWARDS,CIGARETTE_VOUCHER,SPECIAL_REWARDS,rouletteCategoryId } from '../src/gamble/rewardCatalog.js';

async function inventoryItem(ctx,profileId,itemId){
  return ctx.db.query('characterItems').withIndex('by_profile_item',q=>q.eq('profileId',profileId).eq('itemId',itemId)).unique();
}
async function giveItem(ctx,profileId,itemId,{stack=false}={}){
  const existing=await inventoryItem(ctx,profileId,itemId),now=Date.now();
  if(existing){if(stack)await ctx.db.patch(existing._id,{quantity:(existing.quantity??1)+1,updatedAt:now});}
  else await ctx.db.insert('characterItems',{profileId,itemId,quantity:1,cooldownUntil:0,updatedAt:now});
}
const choose=entries=>entries[Math.min(entries.length-1,Math.floor(Math.random()*entries.length))];

export async function grantRoulettePrize(ctx,{profileId,eventKey},category){
  const type=category.reward.type;
  if(type==='coin-brackets'){
    const bracket=selectWeightedReward(COIN_BRACKETS.map(b=>({...b,reward:{type:'none'}})),Math.random());
    const amount=bracket.min+Math.floor(Math.random()*(bracket.max-bracket.min+1));
    await grantReward(ctx,{profileId,eventKey,source:'roulette'},{type:'coins',amount});
    return {type:'coins',amount,label:`Coins ×${amount}`};
  }
  if(type==='cigarette-collection'){
    const missing=[];
    for(const item of CIGARETTE_REWARDS)if(!await inventoryItem(ctx,profileId,item.itemId))missing.push(item);
    const item=missing.length?choose(missing):CIGARETTE_VOUCHER;
    await giveItem(ctx,profileId,item.itemId,{stack:!missing.length});
    return {type:missing.length?'item':'voucher',itemId:item.itemId,label:item.name};
  }
  if(type==='item'){
    await giveItem(ctx,profileId,category.reward.itemId);
    return {type:'item',itemId:category.reward.itemId,label:category.name};
  }
  if(type==='special'){
    const item=choose(SPECIAL_REWARDS);await giveItem(ctx,profileId,item.itemId,{stack:true});
    return {type:'item',itemId:item.itemId,label:item.name};
  }
  return {type:'none',label:category.name};
}

// Cost, prize and receipt commit together. Historical spin IDs never get re-resolved.
export async function resolveRoulette(ctx,{profileId,spinId}){
  if(typeof spinId!=='string'||!spinId)throw new Error('INVALID_SPIN');
  const eventKey=`roulette:${spinId}`;
  const existing=await ctx.db.query('rouletteResults').withIndex('by_profile_spin',q=>
    q.eq('profileId',profileId).eq('spinId',spinId)).unique();
  if(existing)return {rewardId:existing.rewardId,categoryId:existing.categoryId??rouletteCategoryId(existing.rewardId),
    ...(existing.outcome?{outcome:existing.outcome}:{}),duplicate:true};
  const selected=selectWeightedReward(ROULETTE_REWARDS,Math.random());
  await spendCoins(ctx,{profileId,eventKey:`${eventKey}:cost`,source:'roulette',amount:ROULETTE_COST});
  const outcome=await grantRoulettePrize(ctx,{profileId,eventKey:`${eventKey}:prize`},selected);
  await ctx.db.insert('rouletteResults',{profileId,spinId,rewardId:selected.id,categoryId:selected.id,outcome,createdAt:Date.now()});
  return {rewardId:selected.id,categoryId:selected.id,outcome,duplicate:false};
}

export const spin=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string(),spinId:v.string()},
  handler:async(ctx,args)=>{
    if(!/^[\w-]{8,100}$/.test(args.spinId))throw new Error('INVALID_SPIN');
    const {profile}=await requireSessionToken(ctx,args.token);
    const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId);
    if(player.profileId!==profile._id)throw new Error('PROFILE_REQUIRED');
    const result=await resolveRoulette(ctx,{profileId:profile._id,spinId:args.spinId});
    const updatedProfile=await ctx.db.get(profile._id);
    return {...result,coins:profileCoins(updatedProfile)};
  },
});
