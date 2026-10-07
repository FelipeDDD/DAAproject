import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { grantReward, profileCoins } from './rewardStore.js';

const devToolsEnabled=()=>process.env.DEV_TOOLS_ENABLED==='true'
  ||/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??'');

export const balance=query({
  args:{token:v.string()},
  handler:async(ctx,{token})=>{
    const {profile}=await requireSessionToken(ctx,token);
    return {coins:profileCoins(profile)};
  },
});

export const devGrantCoins=mutation({
  args:{token:v.string(),playerId:v.string(),sessionId:v.string()},
  handler:async(ctx,args)=>{
    if(!devToolsEnabled())throw new Error('DEV currency tools are disabled on this deployment.');
    const {profile}=await requireSessionToken(ctx,args.token);
    const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId);
    if(player.profileId!==profile._id)throw new Error('PROFILE_REQUIRED');
    const eventKey=`devtools:${player._id}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const result=await grantReward(ctx,{profileId:profile._id,eventKey,source:'devtools'},
      {type:'coins',amount:30});
    return {amount:30,coins:result.coins};
  },
});
