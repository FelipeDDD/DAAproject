import {
  internalMutationGeneric as internalMutation,
  internalQueryGeneric as internalQuery,
} from 'convex/server';
import { v } from 'convex/values';
import { characterById } from '../src/characters.js';
import {
  LOGIN_ATTEMPT_RETENTION_MS,LOGIN_ATTEMPT_WINDOW_MS,LOGIN_BLOCK_DURATION_MS,
  LOGIN_MAX_FAILURES,PROFILE_SESSION_DURATION_MS,
} from '../src/authPolicy.js';

export { PROFILE_SESSION_DURATION_MS };

export function publicProfile(profile){
  return {
    profileId:profile._id,
    profileName:profile.profileName,
    displayName:profile.displayName,
    selectedCharacterId:profile.selectedCharacterId,
    createdAt:profile.createdAt,
    updatedAt:profile.updatedAt,
  };
}

export async function requireSession(ctx,tokenHash,now=Date.now()){
  const session=await ctx.db.query('profileSessions').withIndex(
    'by_token_hash',query=>query.eq('tokenHash',tokenHash),
  ).unique();
  if(!session||session.expiresAt<=now)throw new Error('SESSION_INVALID');
  const profile=await ctx.db.get(session.profileId);
  if(!profile?.passwordHash)throw new Error('SESSION_INVALID');
  return {session,profile};
}

export async function sessionTokenHash(token){
  if(typeof token!=='string'||token.length<32||token.length>100)throw new Error('SESSION_INVALID');
  const bytes=new TextEncoder().encode(token);
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}

export async function requireSessionToken(ctx,token,now=Date.now()){
  return requireSession(ctx,await sessionTokenHash(token),now);
}

async function legacyProfileHasPersistentData(ctx,profile){
  const profileId=profile._id;
  const ownedProgress=await ctx.db.query('bossProgress').withIndex(
    'by_profile_boss',query=>query.eq('profileId',profileId),
  ).first();
  const ownedItem=await ctx.db.query('characterItems').withIndex(
    'by_profile',query=>query.eq('profileId',profileId),
  ).first();
  if(ownedProgress||ownedItem)return true;
  const characterId=profile.selectedCharacterId;
  const checks=[
    ['bossProgress','by_character_boss'],['characterItems','by_character'],
    ['quizPerformance','by_character'],['itChallengeHighScores','by_character_rules'],
    ['quizQuestionHistory','by_character'],['quizAttempts','by_character_time'],
  ];
  for(const [table,index]of checks){
    const records=await ctx.db.query(table).withIndex(index,query=>query.eq('characterId',characterId)).collect();
    if(records.some(record=>!record.profileId))return true;
  }
  return false;
}

export const register=internalMutation({
  args:{
    profileName:v.string(),displayName:v.string(),passwordHash:v.string(),passwordVersion:v.number(),
    selectedCharacterId:v.string(),tokenHash:v.string(),now:v.number(),expiresAt:v.number(),
  },
  handler:async(ctx,args)=>{
    if(!characterById(args.selectedCharacterId))throw new Error('INVALID_CHARACTER');
    const existing=await ctx.db.query('profiles').withIndex(
      'by_profile_name',query=>query.eq('profileName',args.profileName),
    ).unique();
    let profileId;
    if(existing?.passwordHash)return {status:'exists'};
    if(existing){
      if(await legacyProfileHasPersistentData(ctx,existing))return {status:'legacy_protected'};
      profileId=existing._id;
      await ctx.db.patch(profileId,{
        displayName:args.displayName,passwordHash:args.passwordHash,passwordVersion:args.passwordVersion,
        selectedCharacterId:args.selectedCharacterId,updatedAt:args.now,
      });
    }else{
      profileId=await ctx.db.insert('profiles',{
        profileName:args.profileName,displayName:args.displayName,passwordHash:args.passwordHash,
        passwordVersion:args.passwordVersion,selectedCharacterId:args.selectedCharacterId,
        createdAt:args.now,updatedAt:args.now,
      });
    }
    await ctx.db.insert('profileSessions',{
      profileId,tokenHash:args.tokenHash,createdAt:args.now,expiresAt:args.expiresAt,
    });
    return {status:'created',profile:publicProfile(await ctx.db.get(profileId))};
  },
});

export const loginRecord=internalQuery({
  args:{profileName:v.string()},
  handler:async(ctx,{profileName})=>ctx.db.query('profiles').withIndex(
    'by_profile_name',query=>query.eq('profileName',profileName),
  ).unique(),
});

export const beginLogin=internalMutation({
  args:{loginKey:v.string(),now:v.number()},
  handler:async(ctx,{loginKey,now})=>{
    const attempt=await ctx.db.query('profileLoginAttempts').withIndex(
      'by_login_key',query=>query.eq('loginKey',loginKey),
    ).unique();
    return {allowed:!attempt||attempt.blockedUntil<=now};
  },
});

export const recordLoginFailure=internalMutation({
  args:{loginKey:v.string(),now:v.number()},
  handler:async(ctx,{loginKey,now})=>{
    const attempt=await ctx.db.query('profileLoginAttempts').withIndex(
      'by_login_key',query=>query.eq('loginKey',loginKey),
    ).unique();
    const withinWindow=attempt&&now-attempt.windowStartedAt<LOGIN_ATTEMPT_WINDOW_MS;
    const failures=(withinWindow?attempt.failures:0)+1;
    const state={
      loginKey,failures,windowStartedAt:withinWindow?attempt.windowStartedAt:now,
      blockedUntil:failures>=LOGIN_MAX_FAILURES?now+LOGIN_BLOCK_DURATION_MS:0,updatedAt:now,
    };
    if(attempt)await ctx.db.patch(attempt._id,state);else await ctx.db.insert('profileLoginAttempts',state);
    return {blocked:state.blockedUntil>now};
  },
});

export const completeLogin=internalMutation({
  args:{profileId:v.id('profiles'),tokenHash:v.string(),loginKey:v.string(),now:v.number(),expiresAt:v.number()},
  handler:async(ctx,args)=>{
    const profile=await ctx.db.get(args.profileId);
    if(!profile?.passwordHash)throw new Error('INVALID_CREDENTIALS');
    await ctx.db.insert('profileSessions',{
      profileId:args.profileId,tokenHash:args.tokenHash,createdAt:args.now,expiresAt:args.expiresAt,
    });
    const attempt=await ctx.db.query('profileLoginAttempts').withIndex(
      'by_login_key',query=>query.eq('loginKey',args.loginKey),
    ).unique();
    if(attempt)await ctx.db.delete(attempt._id);
    return publicProfile(profile);
  },
});

export const sessionProfile=internalQuery({
  args:{tokenHash:v.string(),now:v.number()},
  handler:async(ctx,{tokenHash,now})=>{
    const session=await ctx.db.query('profileSessions').withIndex(
      'by_token_hash',query=>query.eq('tokenHash',tokenHash),
    ).unique();
    if(!session||session.expiresAt<=now)return null;
    const profile=await ctx.db.get(session.profileId);
    return profile?.passwordHash?publicProfile(profile):null;
  },
});

export const logout=internalMutation({
  args:{tokenHash:v.string()},
  handler:async(ctx,{tokenHash})=>{
    const session=await ctx.db.query('profileSessions').withIndex(
      'by_token_hash',query=>query.eq('tokenHash',tokenHash),
    ).unique();
    if(session)await ctx.db.delete(session._id);
    return {ok:true};
  },
});

export const cleanupSessions=internalMutation({
  args:{},
  handler:async ctx=>{
    const expired=await ctx.db.query('profileSessions').withIndex(
      'by_expires_at',query=>query.lt('expiresAt',Date.now()),
    ).take(200);
    for(const session of expired)await ctx.db.delete(session._id);
  },
});

export const cleanupLoginAttempts=internalMutation({
  args:{},
  handler:async ctx=>{
    const stale=await ctx.db.query('profileLoginAttempts').withIndex(
      'by_updated_at',query=>query.lt('updatedAt',Date.now()-LOGIN_ATTEMPT_RETENTION_MS),
    ).take(200);
    for(const attempt of stale)await ctx.db.delete(attempt._id);
  },
});
