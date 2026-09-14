import { questionTemplateId, RECENT_HISTORY_LIMIT } from './quizSelection.js';

export async function recentHistoriesFor(ctx, characterIds) {
  const histories = [];
  for (const characterId of characterIds) {
    const history = await ctx.db.query('quizQuestionHistory')
      .withIndex('by_character', q => q.eq('characterId', characterId)).unique();
    histories.push(history?.recentQuestions ?? []);
  }
  return histories;
}

export async function rememberQuestions(ctx, characterIds, questionIds, seenAt = Date.now()) {
  const newlySeen = [...new Set(questionIds.map(questionTemplateId).filter(Boolean))]
    .map(questionId => ({ questionId, seenAt }));
  for (const characterId of characterIds) {
    const history = await ctx.db.query('quizQuestionHistory')
      .withIndex('by_character', q => q.eq('characterId', characterId)).unique();
    const newIds = new Set(newlySeen.map(entry => entry.questionId));
    const recentQuestions = [...newlySeen, ...(history?.recentQuestions ?? [])
      .filter(entry => !newIds.has(questionTemplateId(entry.questionId)))]
      .slice(0, RECENT_HISTORY_LIMIT);
    if (history) await ctx.db.patch(history._id, { recentQuestions, updatedAt: seenAt });
    else await ctx.db.insert('quizQuestionHistory', { characterId, recentQuestions, updatedAt: seenAt });
  }
}
