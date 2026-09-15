import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import {
  IT_CHALLENGE_CATEGORIES,
  IT_CHALLENGE_DURATION_MS,
  IT_CHALLENGE_RULES_VERSION,
  IT_CHALLENGE_VARIANT,
  itChallengeRulesKey,
} from '../src/quiz/itChallengeRules.js';
import { materializeQuizQuestions,selectQuizQuestionIds } from './quizQuestions.js';
import { recentHistoriesFor,rememberQuestions } from './quizHistory.js';
import { requireActivePlayer } from './playerSessions.js';
import { recordQuizAttempt,recordQuizSkip } from './quizStatisticsStore.js';
import { isNewPersonalBest,itChallengeAccuracy,scoreItChallengeOutcomes } from './itChallengeScoring.js';

const outcomeValidator=v.object({
  questionIndex:v.number(),
  type:v.union(v.literal('answer'),v.literal('manualSkip'),v.literal('timeoutSkip')),
  answerIndex:v.optional(v.number()),
});

async function currentBest(ctx,characterId){
  return ctx.db.query('itChallengeHighScores').withIndex('by_character_rules',q=>q
    .eq('characterId',characterId).eq('rulesKey',itChallengeRulesKey())).unique();
}

export const start=mutation({
  args:{characterId:v.string(),sessionId:v.string()},
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    const [recentHistory]=await recentHistoriesFor(ctx,[args.characterId]);
    const questionIds=selectQuizQuestionIds({
      categories:IT_CHALLENGE_CATEGORIES,count:null,recentHistories:[recentHistory],
      seed:`it-challenge:${args.characterId}:${Date.now()}`,
    });
    if(!questionIds.length)throw new Error('No IT Challenge questions are available.');
    const questions=materializeQuizQuestions(questionIds);
    for(const previous of await ctx.db.query('itChallengeRuns')
      .withIndex('by_character',q=>q.eq('characterId',args.characterId)).collect())await ctx.db.delete(previous._id);
    const startedAt=Date.now();
    const runId=await ctx.db.insert('itChallengeRuns',{
      characterId:args.characterId,sessionId:args.sessionId,rulesKey:itChallengeRulesKey(),
      rulesVersion:IT_CHALLENGE_RULES_VERSION,variant:IT_CHALLENGE_VARIANT,
      durationMs:IT_CHALLENGE_DURATION_MS,startedAt,deadline:startedAt+IT_CHALLENGE_DURATION_MS,
      questions:questions.map(question=>({
        id:question.id,category:question.category,topic:question.topic??null,difficulty:question.difficulty,
        correctAnswer:question.correctAnswer,answerCount:question.answers.length,
      })),
    });
    await rememberQuestions(ctx,[args.characterId],[questions[0].id]);
    return {runId,questions,durationMs:IT_CHALLENGE_DURATION_MS};
  },
});

export const finish=mutation({
  args:{
    characterId:v.string(),sessionId:v.string(),runId:v.id('itChallengeRuns'),
    outcomes:v.array(outcomeValidator),lastViewedQuestionIndex:v.number(),
  },
  handler:async(ctx,args)=>{
    await requireActivePlayer(ctx,args.characterId,args.sessionId);
    const run=await ctx.db.get(args.runId);
    if(!run||run.characterId!==args.characterId||run.sessionId!==args.sessionId)
      throw new Error('IT Challenge session unavailable.');
    if(run.rulesKey!==itChallengeRulesKey())throw new Error('IT Challenge rules have changed. Start a new run.');
    if(run.finishedAt){
      return {result:run.result,newPersonalBest:run.wasPersonalBest??false,personalBest:await currentBest(ctx,args.characterId)};
    }
    const {result,records}=scoreItChallengeOutcomes(run.questions,args.outcomes,args.lastViewedQuestionIndex);
    for(const {question,outcome,correct} of records){
      const base={
        attemptKey:`it-challenge:${run._id}:${outcome.questionIndex}:${args.characterId}`,
        characterId:args.characterId,questionId:question.id,category:question.category,
        topic:question.topic,difficulty:question.difficulty,mode:'challenge',answeredAt:Date.now(),
      };
      if(outcome.type==='answer'){
        await recordQuizAttempt(ctx,{...base,correct});
      }else{
        await recordQuizSkip(ctx,{...base,outcome:outcome.type});
      }
    }
    await rememberQuestions(ctx,[args.characterId],run.questions.slice(0,args.lastViewedQuestionIndex+1).reverse().map(q=>q.id));
    const achievedAt=Date.now();
    const previous=await currentBest(ctx,args.characterId);
    const newPersonalBest=isNewPersonalBest(previous,result.score);
    if(newPersonalBest){
      const highScore={
        characterId:args.characterId,rulesKey:run.rulesKey,rulesVersion:run.rulesVersion,
        variant:run.variant,durationMs:run.durationMs,score:result.score,correct:result.correct,
        wrong:result.wrong,skipped:result.skipped,manualSkip:result.manualSkip,
        timeoutSkip:result.timeoutSkip,mediumCorrect:result.mediumCorrect,
        hardCorrect:result.hardCorrect,achievedAt,
      };
      if(previous)await ctx.db.replace(previous._id,highScore);
      else await ctx.db.insert('itChallengeHighScores',highScore);
    }
    await ctx.db.patch(run._id,{finishedAt:achievedAt,result,wasPersonalBest:newPersonalBest});
    return {result,newPersonalBest,personalBest:await currentBest(ctx,args.characterId)};
  },
});

export const leaderboard=query({
  args:{},
  handler:async ctx=>{
    const rows=await ctx.db.query('itChallengeHighScores')
      .withIndex('by_rules_score',q=>q.eq('rulesKey',itChallengeRulesKey())).collect();
    return rows.sort((left,right)=>right.score-left.score||left.achievedAt-right.achievedAt)
      .map(row=>({...row,totalAnswered:row.correct+row.wrong,accuracy:itChallengeAccuracy(row.correct,row.wrong)}));
  },
});
