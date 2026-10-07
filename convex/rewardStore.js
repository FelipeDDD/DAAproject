import { QUIZ_CORRECT_REWARD } from '../src/economy/config.js';

function amount(value){
  if(!Number.isSafeInteger(value)||value<=0)throw new Error('INVALID_COIN_AMOUNT');
  return value;
}

export function profileCoins(profile){
  const coins=profile?.currency?.coins??0;
  if(!Number.isSafeInteger(coins)||coins<0)throw new Error('INVALID_COIN_BALANCE');
  return coins;
}

async function applyCoinChange(ctx,{profileId,eventKey,source,delta}){
  if(!profileId)throw new Error('PROFILE_REQUIRED');
  if(typeof eventKey!=='string'||!eventKey||typeof source!=='string'||!source)throw new Error('INVALID_REWARD_EVENT');
  const profile=await ctx.db.get(profileId);
  if(!profile)throw new Error('PROFILE_REQUIRED');
  const coins=profileCoins(profile);
  const receipt=await ctx.db.query('currencyEvents').withIndex('by_profile_event',q=>
    q.eq('profileId',profileId).eq('eventKey',eventKey)).unique();
  if(receipt){
    if(receipt.delta!==delta||receipt.source!==source)throw new Error('REWARD_EVENT_CONFLICT');
    return {created:false,coins,eventId:receipt._id};
  }
  const next=coins+delta;
  if(next<0)throw new Error('INSUFFICIENT_COINS');
  if(!Number.isSafeInteger(next))throw new Error('INVALID_COIN_BALANCE');
  const now=Date.now();
  await ctx.db.patch(profileId,{currency:{...profile.currency,coins:next},updatedAt:now});
  const eventId=await ctx.db.insert('currencyEvents',{profileId,eventKey,source,delta,createdAt:now});
  return {created:true,coins:next,eventId};
}

const rewardHandlers={
  coins:(ctx,event,reward)=>applyCoinChange(ctx,{...event,delta:amount(reward.amount)}),
  none:async()=>({created:false}),
};

// Internal helpers, deliberately not public mutations. The caller authenticates
// ownership and validates gameplay plus a server-issued event before granting.
export async function grantReward(ctx,event,reward){
  if(!Object.hasOwn(rewardHandlers,reward?.type))throw new Error('UNSUPPORTED_REWARD_TYPE');
  return rewardHandlers[reward.type](ctx,event,reward);
}

export async function grantQuizReward(ctx,{profileId,attemptKey,correct}){
  if(!correct)return {created:false};
  return grantReward(ctx,{profileId,eventKey:`quiz:${attemptKey}`,source:'quiz-correct'},
    {type:'coins',amount:QUIZ_CORRECT_REWARD});
}

export function spendCoins(ctx,{profileId,eventKey,source,amount:cost}){
  return applyCoinChange(ctx,{profileId,eventKey,source,delta:-amount(cost)});
}
