import { questionTemplateId, RECENT_HISTORY_LIMIT } from './quizSelection.js';

export async function recentHistoriesFor(ctx, profileIds) {
  const histories = [];
  for (const profileId of profileIds) {
    const history = await ctx.db.query('quizQuestionHistory')
      .withIndex('by_profile', q => q.eq('profileId', profileId)).unique();
    histories.push(history?.recentQuestions ?? []);
  }
  return histories;
}

export async function rememberQuestions(ctx, profileIds, questionIds, seenAt = Date.now()) {
  const newlySeen = [...new Set(questionIds.map(questionTemplateId).filter(Boolean))]
    .map(questionId => ({ questionId, seenAt }));
  for (const profileId of [...new Set(profileIds)]) {
    const history = await ctx.db.query('quizQuestionHistory')
      .withIndex('by_profile', q => q.eq('profileId', profileId)).unique();
    const newIds = new Set(newlySeen.map(entry => entry.questionId));
    const recentQuestions = [...newlySeen, ...(history?.recentQuestions ?? [])
      .filter(entry => !newIds.has(questionTemplateId(entry.questionId)))]
      .slice(0, RECENT_HISTORY_LIMIT);
    if (history) await ctx.db.patch(history._id, { recentQuestions, updatedAt: seenAt });
    else await ctx.db.insert('quizQuestionHistory', { profileId, recentQuestions, updatedAt: seenAt });
  }
}
