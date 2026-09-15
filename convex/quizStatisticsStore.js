import { applyAttemptToBucket,normalizeStatisticsQuestionId } from './quizStatisticsModel.js';

export async function recordQuizAttempt(ctx,attempt){
  const existing=await ctx.db.query('quizAttempts')
    .withIndex('by_attempt_key',q=>q.eq('attemptKey',attempt.attemptKey)).unique();
  if(existing)return {created:false,attemptId:existing._id};
  const normalized={
    ...attempt,
    questionId:normalizeStatisticsQuestionId(attempt.questionId),
    topic:attempt.topic??null,
    outcome:attempt.correct?'correct':'wrong',
  };
  const attemptId=await ctx.db.insert('quizAttempts',normalized);
  const bucket=await ctx.db.query('quizPerformance').withIndex('by_character_bucket',q=>q
    .eq('characterId',normalized.characterId)
    .eq('category',normalized.category)
    .eq('topic',normalized.topic)
    .eq('difficulty',normalized.difficulty)
    .eq('mode',normalized.mode)).unique();
  const totals=applyAttemptToBucket(bucket,normalized);
  if(bucket)await ctx.db.patch(bucket._id,{...totals,updatedAt:normalized.answeredAt});
  else await ctx.db.insert('quizPerformance',{
    characterId:normalized.characterId,category:normalized.category,topic:normalized.topic,
    difficulty:normalized.difficulty,mode:normalized.mode,...totals,updatedAt:normalized.answeredAt,
  });
  return {created:true,attemptId};
}

export async function recordQuizSkip(ctx,skip){
  const existing=await ctx.db.query('quizAttempts')
    .withIndex('by_attempt_key',q=>q.eq('attemptKey',skip.attemptKey)).unique();
  if(existing)return {created:false,attemptId:existing._id};
  const normalized={
    ...skip,questionId:normalizeStatisticsQuestionId(skip.questionId),topic:skip.topic??null,
  };
  const attemptId=await ctx.db.insert('quizAttempts',normalized);
  const bucket=await ctx.db.query('quizPerformance').withIndex('by_character_bucket',q=>q
    .eq('characterId',normalized.characterId)
    .eq('category',normalized.category)
    .eq('topic',normalized.topic)
    .eq('difficulty',normalized.difficulty)
    .eq('mode',normalized.mode)).unique();
  const skipped=(bucket?.skipped??0)+1;
  const manualSkip=(bucket?.manualSkip??0)+(normalized.outcome==='manualSkip'?1:0);
  const timeoutSkip=(bucket?.timeoutSkip??0)+(normalized.outcome==='timeoutSkip'?1:0);
  if(bucket)await ctx.db.patch(bucket._id,{skipped,manualSkip,timeoutSkip,updatedAt:normalized.answeredAt});
  else await ctx.db.insert('quizPerformance',{
    characterId:normalized.characterId,category:normalized.category,topic:normalized.topic,
    difficulty:normalized.difficulty,mode:normalized.mode,correct:0,wrong:0,answered:0,
    skipped,manualSkip,timeoutSkip,updatedAt:normalized.answeredAt,
  });
  return {created:true,attemptId};
}
