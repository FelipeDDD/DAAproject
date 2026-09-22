import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import {
  applyBossDevPreset,applyDirectorRewardChoice,applyDirectorVictory,BOSS_DEV_PRESETS,
  DIRECTOR_BOSS_ID,DIRECTOR_REWARD_IDS,equipCharacterSkin,
  hasBossReward,normalizeBossProgress,
} from '../src/boss/BossRewards.js';

const validBossId=id=>id===DIRECTOR_BOSS_ID;
const validVictoryId=value=>typeof value==='string'&&value.length>=16&&value.length<=120;
const devToolsEnabled=()=>process.env.DEV_TOOLS_ENABLED==='true'
  ||/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??'');

async function authenticatedProfile(ctx,token){
  const {profile}=await requireSessionToken(ctx,token);
  if(!profile?.selectedCharacterId)throw new Error('Select a character before using boss progress.');
  return profile;
}
async function findProgress(ctx,profileId,bossId=DIRECTOR_BOSS_ID){
  return ctx.db.query('bossProgress').withIndex('by_profile_boss',q=>q
    .eq('profileId',profileId).eq('bossId',bossId)).unique();
}
function storedProgress(progress,profile,now=Date.now()){
  return {
    profileId:profile._id,characterId:profile.selectedCharacterId,bossId:progress.bossId,
    wins:progress.wins,defeated:progress.defeated,rewards:progress.rewards,
    equippedSkin:progress.equippedSkin,updatedAt:now,
  };
}

export const get=query({
  args:{token:v.string(),bossId:v.optional(v.string())},
  handler:async(ctx,{token,bossId=DIRECTOR_BOSS_ID})=>{
    const profile=await authenticatedProfile(ctx,token);
    if(!validBossId(bossId))return null;
    const row=await findProgress(ctx,profile._id,bossId);
    return row?normalizeBossProgress(row,profile.selectedCharacterId):null;
  },
});

export const hasReward=query({
  args:{token:v.string(),rewardId:v.string()},
  handler:async(ctx,{token,rewardId})=>{
    const profile=await authenticatedProfile(ctx,token);
    if(!DIRECTOR_REWARD_IDS.includes(rewardId))return false;
    return hasBossReward(await findProgress(ctx,profile._id),rewardId);
  },
});

export const recordVictory=mutation({
  args:{token:v.string(),bossId:v.string(),victoryId:v.string()},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    if(!validBossId(args.bossId)||!validVictoryId(args.victoryId))throw new Error('Invalid boss victory.');
    const receipt=await ctx.db.query('bossVictoryReceipts').withIndex('by_victory_id',q=>q.eq('victoryId',args.victoryId)).unique();
    if(receipt){
      if(receipt.profileId!==profile._id||receipt.bossId!==args.bossId)throw new Error('Victory token already used.');
      return {progress:normalizeBossProgress(await findProgress(ctx,profile._id),profile.selectedCharacterId),
        outcome:receipt.outcome==='automatic'?{type:'automatic',rewardId:receipt.rewardId}:{type:receipt.outcome},duplicate:true};
    }
    const previous=await findProgress(ctx,profile._id,args.bossId);
    const {progress,outcome}=applyDirectorVictory(previous,profile.selectedCharacterId);
    const stored=storedProgress(progress,profile);
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    await ctx.db.insert('bossVictoryReceipts',{
      victoryId:args.victoryId,profileId:profile._id,characterId:profile.selectedCharacterId,
      bossId:args.bossId,wins:progress.wins,outcome:outcome.type,
      rewardId:outcome.rewardId,createdAt:Date.now(),
    });
    return {progress:normalizeBossProgress(stored,profile.selectedCharacterId),outcome,duplicate:false};
  },
});

export const chooseReward=mutation({
  args:{token:v.string(),bossId:v.string(),rewardId:v.string()},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    if(!validBossId(args.bossId)||!DIRECTOR_REWARD_IDS.includes(args.rewardId))throw new Error('Invalid reward.');
    const previous=await findProgress(ctx,profile._id,args.bossId);
    const result=applyDirectorRewardChoice(previous,args.rewardId);
    if(result.granted)await ctx.db.replace(previous._id,storedProgress(result.progress,profile));
    return {...result,progress:normalizeBossProgress(result.progress,profile.selectedCharacterId)};
  },
});

export const equipSkin=mutation({
  args:{token:v.string(),skin:v.union(v.literal('classic'),v.literal('remastered'))},
  handler:async(ctx,args)=>{
    const profile=await authenticatedProfile(ctx,args.token);
    const previous=await findProgress(ctx,profile._id);
    const progress=equipCharacterSkin(previous,args.skin,profile.selectedCharacterId);
    const stored=storedProgress(progress,profile);
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    return normalizeBossProgress(stored,profile.selectedCharacterId);
  },
});

export const devSetPreset=mutation({
  args:{token:v.string(),preset:v.string()},
  handler:async(ctx,args)=>{
    if(!devToolsEnabled())throw new Error('DEV boss tools are disabled on this deployment.');
    const profile=await authenticatedProfile(ctx,args.token);
    if(!BOSS_DEV_PRESETS.includes(args.preset))throw new Error('Invalid DEV preset.');
    const previous=await findProgress(ctx,profile._id);
    const progress=applyBossDevPreset(previous,args.preset,profile.selectedCharacterId);
    const stored=storedProgress(progress,profile);
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    return normalizeBossProgress(stored,profile.selectedCharacterId);
  },
});
