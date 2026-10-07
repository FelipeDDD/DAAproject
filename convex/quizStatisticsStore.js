import { applyAttemptToBucket,normalizeStatisticsQuestionId } from './quizStatisticsModel.js';
import { grantQuizReward } from './rewardStore.js';

export async function recordQuizAttempt(ctx,attempt){
  if(!attempt.profileId)throw new Error('PROFILE_REQUIRED');
  const existing=await ctx.db.query('quizAttempts')
    .withIndex('by_attempt_key',q=>q.eq('attemptKey',attempt.attemptKey)).unique();
  if(existing){
    if(existing.profileId!==attempt.profileId||existing.correct!==attempt.correct
      ||(existing.answerIndex!==undefined&&attempt.answerIndex!==undefined&&existing.answerIndex!==attempt.answerIndex))
      throw new Error('QUIZ_ATTEMPT_CONFLICT');
    return {created:false,attemptId:existing._id};
  }
  const normalized={
    ...attempt,
    questionId:normalizeStatisticsQuestionId(attempt.questionId),
    topic:attempt.topic??null,
    outcome:attempt.correct?'correct':'wrong',
  };
  const attemptId=await ctx.db.insert('quizAttempts',normalized);
  const bucket=await ctx.db.query('quizPerformance').withIndex('by_profile_bucket',q=>q
    .eq('profileId',normalized.profileId)
    .eq('category',normalized.category)
    .eq('topic',normalized.topic)
    .eq('difficulty',normalized.difficulty)
    .eq('mode',normalized.mode)).unique();
  const totals=applyAttemptToBucket(bucket,normalized);
  if(bucket)await ctx.db.patch(bucket._id,{...totals,updatedAt:normalized.answeredAt});
  else await ctx.db.insert('quizPerformance',{
    profileId:normalized.profileId,category:normalized.category,topic:normalized.topic,
    difficulty:normalized.difficulty,mode:normalized.mode,...totals,updatedAt:normalized.answeredAt,
  });
  await grantQuizReward(ctx,attempt);
  return {created:true,attemptId};
}

export async function recordQuizSkip(ctx,skip){
  if(!skip.profileId)throw new Error('PROFILE_REQUIRED');
  const existing=await ctx.db.query('quizAttempts')
    .withIndex('by_attempt_key',q=>q.eq('attemptKey',skip.attemptKey)).unique();
  if(existing){
    if(existing.profileId!==skip.profileId||existing.outcome!==skip.outcome)throw new Error('QUIZ_ATTEMPT_CONFLICT');
    return {created:false,attemptId:existing._id};
  }
  const normalized={
    ...skip,questionId:normalizeStatisticsQuestionId(skip.questionId),topic:skip.topic??null,
  };
  const attemptId=await ctx.db.insert('quizAttempts',normalized);
  const bucket=await ctx.db.query('quizPerformance').withIndex('by_profile_bucket',q=>q
    .eq('profileId',normalized.profileId)
    .eq('category',normalized.category)
    .eq('topic',normalized.topic)
    .eq('difficulty',normalized.difficulty)
    .eq('mode',normalized.mode)).unique();
  const skipped=(bucket?.skipped??0)+1;
  const manualSkip=(bucket?.manualSkip??0)+(normalized.outcome==='manualSkip'?1:0);
  const timeoutSkip=(bucket?.timeoutSkip??0)+(normalized.outcome==='timeoutSkip'?1:0);
  if(bucket)await ctx.db.patch(bucket._id,{skipped,manualSkip,timeoutSkip,updatedAt:normalized.answeredAt});
  else await ctx.db.insert('quizPerformance',{
    profileId:normalized.profileId,category:normalized.category,topic:normalized.topic,
    difficulty:normalized.difficulty,mode:normalized.mode,correct:0,wrong:0,answered:0,
    skipped,manualSkip,timeoutSkip,updatedAt:normalized.answeredAt,
  });
  return {created:true,attemptId};
}
