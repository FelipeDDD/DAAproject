import { ROULETTE_COST,ROULETTE_REWARDS } from '../src/economy/config.js';
import { selectWeightedReward } from '../src/economy/weightedRewards.js';
import { grantReward,spendCoins } from './rewardStore.js';
import { mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { profileCoins } from './rewardStore.js';

// Preparation only: no public spin endpoint. A future mutation must authenticate
// the owner and issue/validate a spin ID before calling this internal helper.
// Spend, prize and result commit together in that mutation's transaction.
export async function resolveRoulette(ctx,{profileId,spinId}){
  if(typeof spinId!=='string'||!spinId)throw new Error('INVALID_SPIN');
  const eventKey=`roulette:${spinId}`;
  const existing=await ctx.db.query('rouletteResults').withIndex('by_profile_spin',q=>
    q.eq('profileId',profileId).eq('spinId',spinId)).unique();
  if(existing)return {rewardId:existing.rewardId,duplicate:true};
  const selected=selectWeightedReward(ROULETTE_REWARDS,Math.random());
  await spendCoins(ctx,{profileId,eventKey:`${eventKey}:cost`,source:'roulette',amount:ROULETTE_COST});
  await grantReward(ctx,{profileId,eventKey:`${eventKey}:prize`,source:'roulette'},selected.reward);
  await ctx.db.insert('rouletteResults',{profileId,spinId,rewardId:selected.id,createdAt:Date.now()});
  return {rewardId:selected.id,duplicate:false};
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
