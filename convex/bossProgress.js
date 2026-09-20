import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireActivePlayer } from './playerSessions.js';
import {
  applyBossDevPreset,applyDirectorRewardChoice,applyDirectorVictory,BOSS_DEV_PRESETS,
  DIRECTOR_BOSS_ID,DIRECTOR_REWARD_IDS,equipCharacterSkin,
  hasBossReward,normalizeBossProgress,
} from '../src/boss/BossRewards.js';

const validBossId=id=>id===DIRECTOR_BOSS_ID;
const validToken=value=>typeof value==='string'&&value.length>=16&&value.length<=120;
const devToolsEnabled=()=>process.env.DEV_TOOLS_ENABLED==='true'
  ||/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(process.env.CONVEX_CLOUD_URL??'');

async function findProgress(ctx,characterId,bossId=DIRECTOR_BOSS_ID){
  return ctx.db.query('bossProgress').withIndex('by_character_boss',q=>q
    .eq('characterId',characterId).eq('bossId',bossId)).unique();
}

export const get=query({
  args:{characterId:v.string(),bossId:v.optional(v.string())},
  handler:async(ctx,{characterId,bossId=DIRECTOR_BOSS_ID})=>{
    if(!validBossId(bossId))return null;
    const row=await findProgress(ctx,characterId,bossId);
    return row?normalizeBossProgress(row,characterId):null;
  },
});

export const hasReward=query({
  args:{characterId:v.string(),rewardId:v.string()},
  handler:async(ctx,{characterId,rewardId})=>{
    if(!DIRECTOR_REWARD_IDS.includes(rewardId))return false;
    return hasBossReward(await findProgress(ctx,characterId),rewardId);
  },
});

export const recordVictory=mutation({
  args:{characterId:v.string(),sessionId:v.string(),bossId:v.string(),victoryId:v.string()},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    if(!validBossId(args.bossId)||!validToken(args.victoryId))throw new Error('Invalid boss victory.');
    const receipt=await ctx.db.query('bossVictoryReceipts').withIndex('by_victory_id',q=>q.eq('victoryId',args.victoryId)).unique();
    if(receipt){
      if(receipt.characterId!==args.characterId||receipt.bossId!==args.bossId)throw new Error('Victory token already used.');
      return {progress:normalizeBossProgress(await findProgress(ctx,args.characterId),args.characterId),
        outcome:receipt.outcome==='automatic'?{type:'automatic',rewardId:receipt.rewardId}:{type:receipt.outcome},duplicate:true};
    }
    const previous=await findProgress(ctx,args.characterId,args.bossId);
    const {progress,outcome}=applyDirectorVictory(previous,args.characterId);
    const stored={...progress,updatedAt:Date.now()};
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    await ctx.db.insert('bossVictoryReceipts',{
      victoryId:args.victoryId,characterId:args.characterId,bossId:args.bossId,wins:progress.wins,
      outcome:outcome.type,rewardId:outcome.rewardId,createdAt:Date.now(),
    });
    return {progress,outcome,duplicate:false};
  },
});

export const chooseReward=mutation({
  args:{characterId:v.string(),sessionId:v.string(),bossId:v.string(),rewardId:v.string()},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    if(!validBossId(args.bossId)||!DIRECTOR_REWARD_IDS.includes(args.rewardId))throw new Error('Invalid reward.');
    const previous=await findProgress(ctx,args.characterId,args.bossId);
    const result=applyDirectorRewardChoice(previous,args.rewardId);
    if(result.granted)await ctx.db.replace(previous._id,{...result.progress,updatedAt:Date.now()});
    return {...result,progress:normalizeBossProgress(result.progress,args.characterId)};
  },
});

export const equipSkin=mutation({
  args:{characterId:v.string(),sessionId:v.string(),skin:v.union(v.literal('classic'),v.literal('remastered'))},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    const previous=await findProgress(ctx,args.characterId);
    const progress=equipCharacterSkin(previous,args.skin,args.characterId);
    const stored={...progress,updatedAt:Date.now()};
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    return normalizeBossProgress(stored,args.characterId);
  },
});

export const devSetPreset=mutation({
  args:{characterId:v.string(),sessionId:v.string(),preset:v.string()},
  handler:async(ctx,args)=>{
    if(!devToolsEnabled())throw new Error('DEV boss tools are disabled on this deployment.');
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    if(!BOSS_DEV_PRESETS.includes(args.preset))throw new Error('Invalid DEV preset.');
    const previous=await findProgress(ctx,args.characterId);
    const progress=applyBossDevPreset(previous,args.preset,args.characterId);
    const stored={...progress,updatedAt:Date.now()};
    if(previous)await ctx.db.replace(previous._id,stored);else await ctx.db.insert('bossProgress',stored);
    return normalizeBossProgress(stored,args.characterId);
  },
});
