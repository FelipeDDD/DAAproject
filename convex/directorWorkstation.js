import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { BOSS_REWARDS,hasBossReward,DIRECTOR_BOSS_ID } from '../src/boss/BossRewards.js';
import { directorSecurityState,DIRECTOR_SECURITY_FAILURES_REQUIRED } from '../src/office2/directorSecurity.js';

const authArgs={token:v.string(),playerId:v.string(),sessionId:v.string()};

async function owner(ctx,args,room='office2'){
  const {profile}=await requireSessionToken(ctx,args.token);
  const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId,room);
  if(player.profileId!==profile._id)throw new Error('CHARACTER_SESSION_LOST');
  return profile;
}

const findProgress=(ctx,profileId)=>ctx.db.query('directorWorkstations')
  .withIndex('by_profile',q=>q.eq('profileId',profileId)).unique();

async function hasDirectorKey(ctx,profileId){
  const boss=await ctx.db.query('bossProgress').withIndex('by_profile_boss',q=>q
    .eq('profileId',profileId).eq('bossId',DIRECTOR_BOSS_ID)).unique();
  return hasBossReward(boss,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE);
}

export const status=query({
  args:authArgs,
  handler:async(ctx,args)=>{
    const profile=await owner(ctx,args);
    if(!await hasDirectorKey(ctx,profile._id))return directorSecurityState(false);
    return directorSecurityState(true,await findProgress(ctx,profile._id));
  },
});

export const submitChoice=mutation({
  args:{...authArgs,choice:v.union(v.literal('left'),v.literal('right'))},
  handler:async(ctx,args)=>{
    const profile=await owner(ctx,args);
    if(!await hasDirectorKey(ctx,profile._id))return directorSecurityState(false);
    const progress=await findProgress(ctx,profile._id);
    const current=directorSecurityState(true,progress);
    if(current.stage!=='question')return current;
    const failedAttempts=Math.min(DIRECTOR_SECURITY_FAILURES_REQUIRED,current.failedAttempts+1);
    const now=Date.now();
    const update={failedAttempts,updatedAt:now};
    if(failedAttempts===DIRECTOR_SECURITY_FAILURES_REQUIRED)update.compromisedAt=now;
    if(progress)await ctx.db.patch(progress._id,update);
    else await ctx.db.insert('directorWorkstations',{profileId:profile._id,...update});
    return directorSecurityState(true,{...progress,...update});
  },
});

// Opening the workstation never verifies possession or writes progress.
export const verifyPhysicalKey=mutation({
  args:authArgs,
  handler:async(ctx,args)=>{
    const profile=await owner(ctx,args);
    const progress=await findProgress(ctx,profile._id);
    if(!await hasDirectorKey(ctx,profile._id))return directorSecurityState(false,progress);
    if(progress?.physicalKeyVerifiedAt)return directorSecurityState(true,progress);
    const update={physicalKeyVerifiedAt:Date.now(),updatedAt:Date.now()};
    if(progress)await ctx.db.patch(progress._id,update);
    else await ctx.db.insert('directorWorkstations',{profileId:profile._id,failedAttempts:0,...update});
    return directorSecurityState(true,{...progress,...update});
  },
});

export const recoveryStatus=query({
  args:authArgs,
  handler:async(ctx,args)=>{
    const profile=await owner(ctx,args,'office3');
    return directorSecurityState(await hasDirectorKey(ctx,profile._id),await findProgress(ctx,profile._id));
  },
});

export const completeRecovery=mutation({
  args:authArgs,
  handler:async(ctx,args)=>{
    const profile=await owner(ctx,args,'office3');
    const progress=await findProgress(ctx,profile._id);
    const state=directorSecurityState(await hasDirectorKey(ctx,profile._id),progress);
    if(!state.factor1Verified||!state.compromised)throw new Error('RECOVERY_NOT_AVAILABLE');
    if(state.recoveryComplete)return state;
    // The small parody game is client-side, not an anti-cheat challenge. Only
    // the authenticated profile's unlocked recovery can be completed here.
    const update={recoveryCompletedAt:Date.now(),updatedAt:Date.now()};
    await ctx.db.patch(progress._id,update);
    return directorSecurityState(true,{...progress,...update});
  },
});
