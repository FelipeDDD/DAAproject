import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import {
  QUIZ_QUESTIONS, materializeQuizQuestions, quizConfigurationOptions,
  selectQuizQuestionIds, validateQuizSettings,
} from './quizQuestions.js';
import { recentHistoriesFor, rememberQuestions } from './quizHistory.js';
import { questionTemplateId } from './quizSelection.js';
import { requireAuthenticatedLivePlayer, refreshTerminalLease } from './playerSessions.js';

export const options = query({
  args: {},
  handler: async () => quizConfigurationOptions(),
});

export const start = mutation({
  args: {
    playerId: v.string(), sessionId: v.string(),
    mode: v.union(v.literal('study'),v.literal('challenge')),
    category: v.union(v.string(), v.null()),
    topic: v.optional(v.union(v.string(),v.null())),
    difficulty: v.union(v.literal('medium'), v.literal('hard'), v.null()),
    count: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const player = await requireAuthenticatedLivePlayer(ctx, args.playerId, args.sessionId);
    const settings=validateQuizSettings(args);
    const [recentHistory] = await recentHistoriesFor(ctx, [player.profileId]);
    const questionIds = selectQuizQuestionIds({
      ...settings,
      recentHistories: [recentHistory], seed: `${player.profileId}:${Date.now()}`,
    });
    if (!questionIds.length) throw new Error('No questions match these settings.');
    const questions = materializeQuizQuestions(questionIds);
    await rememberQuestions(ctx, [player.profileId], questions.slice(0, 1).map(question => question.id));
    for(const previous of await ctx.db.query('soloQuizRuns')
      .withIndex('by_profile',q=>q.eq('profileId',player.profileId)).collect())await ctx.db.delete(previous._id);
    const runId=await ctx.db.insert('soloQuizRuns',{
      profileId:player.profileId,playerId:args.playerId,sessionId:args.sessionId,mode:args.mode,settings,
      questions:questions.map(question=>({
        id:question.id,category:question.category,topic:question.topic??null,difficulty:question.difficulty,
        correctAnswer:question.correctAnswer,answerCount:question.answers.length,
      })),
      createdAt:Date.now(),
    });
    return { questions, settings, runId, terminalLease: await refreshTerminalLease(ctx, player, args.playerId, args.sessionId) };
  },
});

export const markViewed = mutation({
  args: { playerId: v.string(), sessionId: v.string(), questionId: v.string() },
  handler: async (ctx, args) => {
    const player = await requireAuthenticatedLivePlayer(ctx, args.playerId, args.sessionId);
    const questionId = questionTemplateId(args.questionId);
    if (!QUIZ_QUESTIONS.some(question => question.id === questionId)) throw new Error('Unknown quiz question.');
    await rememberQuestions(ctx, [player.profileId], [questionId]);
    return { terminalLease: await refreshTerminalLease(ctx, player, args.playerId, args.sessionId) };
  },
});
