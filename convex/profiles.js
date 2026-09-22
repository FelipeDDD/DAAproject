"use node";

import { actionGeneric as action,anyApi } from 'convex/server';
import { v } from 'convex/values';
import { createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PROFILE_SESSION_DURATION_MS } from '../src/authPolicy.js';

const scrypt=promisify(scryptCallback);
const PASSWORD_VERSION=1;
const PROFILE_NAME_MIN=3;
const PROFILE_NAME_MAX=32;
const PASSWORD_MIN=8;
const PASSWORD_MAX=128;
const DUMMY_PASSWORD_HASH='scrypt$v1$16384$8$1$cmF0ZS1saW1pdC1kdW1teQ$Xq49wVcfEdZecQMcEVgYVPm3oZlmnOWGrS5RRBKF5pBcpLMbw4qeUHDCu69EhXVfiCurb-xGgt2AoLpc5b2p0Q';

export function normalizeProfileName(value){return value.trim().toLowerCase();}

function validateProfileName(value){
  const displayName=value.trim();
  const profileName=normalizeProfileName(value);
  if(profileName.length<PROFILE_NAME_MIN||profileName.length>PROFILE_NAME_MAX||!/^[a-z0-9._-]+$/.test(profileName))
    throw new Error('INVALID_PROFILE_NAME');
  return {profileName,displayName};
}

function validatePassword(password){
  if(password.length<PASSWORD_MIN||password.length>PASSWORD_MAX)throw new Error('INVALID_PASSWORD');
}

function tokenHash(token){return createHash('sha256').update(token).digest('hex');}
function loginKey(profileName){return createHash('sha256').update(profileName).digest('hex');}
function sessionToken(){return randomBytes(32).toString('base64url');}

export async function passwordHash(password,salt=randomBytes(16)){
  const derived=await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});
  return `scrypt$v${PASSWORD_VERSION}$16384$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password,encoded){
  const [algorithm,version,n,r,p,salt,key]=String(encoded).split('$');
  if(algorithm!=='scrypt'||version!==`v${PASSWORD_VERSION}`||!salt||!key)return false;
  const expected=Buffer.from(key,'base64url');
  const derived=await scrypt(password,Buffer.from(salt,'base64url'),expected.length,{
    N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024,
  });
  return expected.length===derived.length&&timingSafeEqual(expected,derived);
}

function sessionResult(profile,token,expiresAt){return {profile,token,expiresAt};}

export const register=action({
  args:{profileName:v.string(),password:v.string(),selectedCharacterId:v.string()},
  handler:async(ctx,args)=>{
    const name=validateProfileName(args.profileName);validatePassword(args.password);
    const passwordHashValue=await passwordHash(args.password);
    const token=sessionToken(),now=Date.now(),expiresAt=now+PROFILE_SESSION_DURATION_MS;
    const registration=await ctx.runMutation(anyApi.profileStore.register,{
      ...name,passwordHash:passwordHashValue,passwordVersion:PASSWORD_VERSION,
      selectedCharacterId:args.selectedCharacterId,tokenHash:tokenHash(token),now,expiresAt,
    });
    if(registration.status!=='created')throw new Error('PROFILE_EXISTS');
    return sessionResult(registration.profile,token,expiresAt);
  },
});

export const login=action({
  args:{profileName:v.string(),password:v.string()},
  handler:async(ctx,args)=>{
    const {profileName}=validateProfileName(args.profileName);validatePassword(args.password);
    const key=loginKey(profileName),now=Date.now();
    const attempt=await ctx.runMutation(anyApi.profileStore.beginLogin,{loginKey:key,now});
    if(!attempt.allowed)throw new Error('INVALID_CREDENTIALS');
    const record=await ctx.runQuery(anyApi.profileStore.loginRecord,{profileName});
    const valid=await verifyPassword(args.password,record?.passwordHash??DUMMY_PASSWORD_HASH);
    if(!record?.passwordHash||!valid){
      await ctx.runMutation(anyApi.profileStore.recordLoginFailure,{loginKey:key,now:Date.now()});
      throw new Error('INVALID_CREDENTIALS');
    }
    const token=sessionToken(),authenticatedAt=Date.now(),expiresAt=authenticatedAt+PROFILE_SESSION_DURATION_MS;
    const profile=await ctx.runMutation(anyApi.profileStore.completeLogin,{
      profileId:record._id,tokenHash:tokenHash(token),loginKey:key,now:authenticatedAt,expiresAt,
    });
    return sessionResult(profile,token,expiresAt);
  },
});

export const me=action({
  args:{token:v.string()},
  handler:async(ctx,{token})=>{
    if(token.length<32||token.length>100)return null;
    return ctx.runQuery(anyApi.profileStore.sessionProfile,{tokenHash:tokenHash(token),now:Date.now()});
  },
});

export const logout=action({
  args:{token:v.string()},
  handler:async(ctx,{token})=>ctx.runMutation(anyApi.profileStore.logout,{tokenHash:tokenHash(token)}),
});

export const claimCharacter=action({
  args:{token:v.string(),characterId:v.string(),presenceSessionId:v.string()},
  handler:async(ctx,args)=>ctx.runMutation(anyApi.players.claim,{
    tokenHash:tokenHash(args.token),characterId:args.characterId,sessionId:args.presenceSessionId,
  }),
});
