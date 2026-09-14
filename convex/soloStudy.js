import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server';
import { v } from 'convex/values';
import {
  QUIZ_DIFFICULTIES, QUIZ_QUANTITIES, QUIZ_QUESTIONS,
  materializeQuizQuestions, quizCategories, selectQuizQuestionIds,
} from './quizQuestions.js';
import { recentHistoriesFor, rememberQuestions } from './quizHistory.js';
import { questionTemplateId } from './quizSelection.js';
import { requireActivePlayer } from './playerSessions.js';

function validateSettings(category, difficulty, count) {
  if (category !== null && !quizCategories().includes(category)) throw new Error('Invalid quiz category.');
  if (difficulty !== null && !QUIZ_DIFFICULTIES.includes(difficulty)) throw new Error('Invalid quiz difficulty.');
  if (count !== null && !QUIZ_QUANTITIES.includes(count)) throw new Error('Invalid quiz question count.');
}

export const options = query({
  args: {},
  handler: async () => ({ categories: quizCategories(), difficulties: QUIZ_DIFFICULTIES, quantities: QUIZ_QUANTITIES }),
});

export const start = mutation({
  args: {
    characterId: v.string(), sessionId: v.string(),
    category: v.union(v.string(), v.null()),
    difficulty: v.union(v.literal('medium'), v.literal('hard'), v.null()),
    count: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    await requireActivePlayer(ctx, args.characterId, args.sessionId);
    validateSettings(args.category, args.difficulty, args.count);
    const [recentHistory] = await recentHistoriesFor(ctx, [args.characterId]);
    const questionIds = selectQuizQuestionIds({
      category: args.category, difficulty: args.difficulty,
      count: args.count,
      recentHistories: [recentHistory], seed: `${args.characterId}:${Date.now()}`,
    });
    if (!questionIds.length) throw new Error('No questions match these settings.');
    const questions = materializeQuizQuestions(questionIds);
    await rememberQuestions(ctx, [args.characterId], questions.slice(0, 1).map(question => question.id));
    return { questions, settings: { category: args.category, difficulty: args.difficulty, count: args.count } };
  },
});

export const markViewed = mutation({
  args: { characterId: v.string(), sessionId: v.string(), questionId: v.string() },
  handler: async (ctx, args) => {
    await requireActivePlayer(ctx, args.characterId, args.sessionId);
    const questionId = questionTemplateId(args.questionId);
    if (!QUIZ_QUESTIONS.some(question => question.id === questionId)) throw new Error('Unknown quiz question.');
    await rememberQuestions(ctx, [args.characterId], [questionId]);
  },
});
