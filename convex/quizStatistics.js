import { mutationGeneric as mutation,queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import { requireAuthenticatedPlayer } from './playerSessions.js';
import { buildQuizStatisticsSummary } from './quizStatisticsModel.js';
import { recordQuizAttempt } from './quizStatisticsStore.js';

const modeValidator=v.union(v.literal('study'),v.literal('challenge'),v.literal('multiplayer'));

export const recordSoloAnswer=mutation({
  args:{
    characterId:v.string(),sessionId:v.string(),runId:v.id('soloQuizRuns'),
    questionIndex:v.number(),answerIndex:v.optional(v.number()),
  },
  handler:async(ctx,args)=>{
    await requireAuthenticatedPlayer(ctx,args.characterId,args.sessionId);
    const run=await ctx.db.get(args.runId);
    if(!run||run.characterId!==args.characterId||run.sessionId!==args.sessionId)
      throw new Error('Solo quiz session unavailable.');
    if(!Number.isInteger(args.questionIndex)||args.questionIndex<0||args.questionIndex>=run.questions.length)
      throw new Error('Invalid solo question.');
    const question=run.questions[args.questionIndex];
    if(args.answerIndex!==undefined&&(!Number.isInteger(args.answerIndex)
      ||args.answerIndex<0||args.answerIndex>=question.answerCount))throw new Error('Invalid answer.');
    return recordQuizAttempt(ctx,{
      attemptKey:`solo:${run._id}:${args.questionIndex}:${args.characterId}`,
      characterId:args.characterId,questionId:question.id,category:question.category,
      topic:question.topic,difficulty:question.difficulty,mode:run.mode,
      correct:args.answerIndex!==undefined&&args.answerIndex===question.correctAnswer,
      answeredAt:Date.now(),
    });
  },
});

export const summary=query({
  args:{characterId:v.string(),sessionId:v.string(),mode:v.optional(modeValidator)},
  handler:async(ctx,args)=>{
    await requireAuthenticatedPlayer(ctx,args.characterId,args.sessionId);
    const rows=await ctx.db.query('quizPerformance')
      .withIndex('by_character',q=>q.eq('characterId',args.characterId)).collect();
    return buildQuizStatisticsSummary(rows,{mode:args.mode??null});
  },
});
