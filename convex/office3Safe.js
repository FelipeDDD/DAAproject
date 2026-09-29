import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireSessionToken } from './profileStore.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { characterBaseIdFor } from '../src/characters.js';
import { CHARACTER_ITEM_IDS } from '../src/inventory/characterItems.js';
import QUESTIONS from './quizStaticQuestions.generated.js';

const authArgs = {token:v.string(), playerId:v.string(), sessionId:v.string()};
async function owner(ctx, args) {
  const {profile} = await requireSessionToken(ctx, args.token);
  const player = await requireAuthenticatedLivePlayer(ctx, args.playerId, args.sessionId, 'office3');
  if (player.profileId !== profile._id) throw new Error('CHARACTER_SESSION_LOST');
  return {profile, player};
}
const findSafe = (ctx, profileId) => ctx.db.query('office3Safes')
  .withIndex('by_profile', q => q.eq('profileId', profileId)).unique();

// A safe row is created only after the first five-answer challenge succeeds.
// Its persisted existence is the per-profile completion marker.
export const challengeStatus = query({
  args:{...authArgs, password:v.string()},
  handler:async(ctx,args)=>{
    const {profile}=await owner(ctx,args);
    if(args.password!=='488')throw new Error('Access denied.');
    const safe=await findSafe(ctx,profile._id);
    return {requiredAnswers:safe?1:5,blockedUntil:safe?.computerBlockedUntil??0};
  },
});

export const unlockComputer = mutation({
  args:{...authArgs, password:v.string(), answers:v.array(v.object({id:v.string(), answer:v.string()}))},
  handler:async(ctx,args) => {
    const {profile} = await owner(ctx,args);
    let safe = await findSafe(ctx, profile._id);
    const requiredAnswers=safe?1:5;
    if (args.password !== '488' || args.answers.length !== requiredAnswers
      || new Set(args.answers.map(a=>a.id)).size !== requiredAnswers
      || !args.answers.every(answer => QUESTIONS.some(q=>q.id===answer.id && q.answers[q.correctAnswer]===answer.answer)))
      throw new Error('Access denied.');
    if (safe?.computerBlockedUntil > Date.now()) return {blockedUntil:safe.computerBlockedUntil};
    if (!safe) {
      // Indexed collision checks participate in the same Convex transaction as insertion.
      // Four decimal digits allow 10,000 unique profile codes; never silently duplicate one.
      const start = Math.floor(Math.random()*10_000);
      let code;
      for (let i=0;i<10_000;i++) {
        const candidate=String((start+i)%10_000).padStart(4,'0');
        if (!await ctx.db.query('office3Safes').withIndex('by_code',q=>q.eq('code',candidate)).unique()) {code=candidate;break;}
      }
      if (code===undefined) throw new Error('Safe code capacity reached. Contact the administrator.');
      safe={profileId:profile._id,code,createdAt:Date.now()};
      await ctx.db.insert('office3Safes',safe);
    }
    return {code:safe.code};
  },
});

export const shutdownComputer = mutation({
  args:authArgs,
  handler:async(ctx,args)=>{
    const {profile}=await owner(ctx,args),safe=await findSafe(ctx,profile._id);
    if(!safe)throw new Error('Access denied.');
    const blockedUntil=Date.now()+10_000;
    await ctx.db.patch(safe._id,{computerBlockedUntil:blockedUntil});
    return {blockedUntil};
  },
});

export const open = mutation({
  args:{...authArgs,code:v.string()},
  handler:async(ctx,args)=>{
    const {profile,player}=await owner(ctx,args),safe=await findSafe(ctx,profile._id),now=Date.now();
    if (!safe) return {ok:false};
    if (safe.blockedUntil > now) return {ok:false,blockedUntil:safe.blockedUntil};
    if (!/^\d{4}$/.test(args.code) || safe.code !== args.code) {
      const failures=(safe.failures??0)+1,blockedUntil=failures>=5?now+30_000:0;
      await ctx.db.patch(safe._id,{failures:failures>=5?0:failures,blockedUntil});
      return {ok:false,blockedUntil};
    }
    const itemId=CHARACTER_ITEM_IDS.OFFICE2_KEY;
    let item=await ctx.db.query('characterItems').withIndex('by_profile_item',q=>q.eq('profileId',profile._id).eq('itemId',itemId)).unique();
    if(!item){
      item={profileId:profile._id,characterBaseId:characterBaseIdFor(player),itemId,quantity:1,cooldownUntil:0,updatedAt:now};
      await ctx.db.insert('characterItems',item);
    }
    await ctx.db.patch(safe._id,{openedAt:safe.openedAt??now,failures:0,blockedUntil:0});
    return {ok:true,item:{itemId,quantity:item.quantity??1,cooldownUntil:item.cooldownUntil,updatedAt:item.updatedAt,active:false}};
  },
});
