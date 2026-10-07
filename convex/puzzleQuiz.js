import { mutationGeneric as mutation } from 'convex/server';
import { v } from 'convex/values';
import QUESTIONS from './quizStaticQuestions.generated.js';
import { requireAuthenticatedLivePlayer } from './playerSessions.js';
import { grantQuizReward } from './rewardStore.js';

const sources={office3:'office3',koetting:'secret-path'};
const identityArgs={playerId:v.string(),sessionId:v.string()};
const runArgs={...identityArgs,runId:v.id('puzzleQuizRuns'),questionIndex:v.number()};

async function ownedRun(ctx,args){
  const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId);
  const run=await ctx.db.get(args.runId);
  if(!run||run.profileId!==player.profileId||run.playerId!==args.playerId||run.sessionId!==args.sessionId
    ||player.room!==sources[run.source])throw new Error('PUZZLE_QUIZ_SESSION_LOST');
  if(!Number.isSafeInteger(args.questionIndex)||args.questionIndex<0)throw new Error('INVALID_QUESTION');
  return run;
}

export const start=mutation({
  args:{...identityArgs,source:v.union(v.literal('office3'),v.literal('koetting'))},
  handler:async(ctx,args)=>{
    const player=await requireAuthenticatedLivePlayer(ctx,args.playerId,args.sessionId,sources[args.source]);
    for(const previous of await ctx.db.query('puzzleQuizRuns').withIndex('by_profile_source',q=>
      q.eq('profileId',player.profileId).eq('source',args.source)).collect())await ctx.db.delete(previous._id);
    return {runId:await ctx.db.insert('puzzleQuizRuns',{
      profileId:player.profileId,playerId:args.playerId,sessionId:args.sessionId,
      source:args.source,createdAt:Date.now(),questions:[],
    })};
  },
});

// The existing puzzle still chooses/shuffles its question. The server registers
// that presentation before accepting an answer, using the authored answer bank.
export const prepare=mutation({
  args:{...runArgs,questionId:v.string()},
  handler:async(ctx,args)=>{
    const run=await ownedRun(ctx,args);
    const question=QUESTIONS.find(q=>q.id===args.questionId);
    if(!question||question.answers.length!==4)throw new Error('INVALID_QUESTION');
    const existing=run.questions[args.questionIndex];
    if(existing){
      if(existing.id!==args.questionId)throw new Error('QUIZ_ATTEMPT_CONFLICT');
      return {ready:true};
    }
    if(args.questionIndex!==run.questions.length
      ||(args.questionIndex>0&&run.questions.at(-1).answer===undefined))throw new Error('ANSWER_PREVIOUS_QUESTION');
    await ctx.db.patch(run._id,{questions:[...run.questions,{id:question.id}]});
    return {ready:true};
  },
});

export const answer=mutation({
  args:{...runArgs,answer:v.string()},
  handler:async(ctx,args)=>{
    const run=await ownedRun(ctx,args);
    const presentation=run.questions[args.questionIndex];
    if(!presentation)throw new Error('INVALID_QUESTION');
    const question=QUESTIONS.find(q=>q.id===presentation.id);
    if(!question?.answers.includes(args.answer))throw new Error('INVALID_ANSWER');
    if(presentation.answer!==undefined){
      if(presentation.answer!==args.answer)throw new Error('QUIZ_ATTEMPT_CONFLICT');
      return {correct:presentation.answer===question.answers[question.correctAnswer],duplicate:true};
    }
    const correct=args.answer===question.answers[question.correctAnswer];
    await ctx.db.patch(run._id,{questions:run.questions.map((q,index)=>
      index===args.questionIndex?{...q,answer:args.answer}:q)});
    await grantQuizReward(ctx,{profileId:run.profileId,attemptKey:`puzzle:${run._id}:${args.questionIndex}`,correct});
    return {correct,duplicate:false};
  },
});
