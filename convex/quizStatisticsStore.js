import { applyAttemptToBucket,normalizeStatisticsQuestionId } from './quizStatisticsModel.js';

export async function recordQuizAttempt(ctx,attempt){
  const existing=await ctx.db.query('quizAttempts')
    .withIndex('by_attempt_key',q=>q.eq('attemptKey',attempt.attemptKey)).unique();
  if(existing)return {created:false,attemptId:existing._id};
  const normalized={
    ...attempt,
    questionId:normalizeStatisticsQuestionId(attempt.questionId),
    topic:attempt.topic??null,
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
