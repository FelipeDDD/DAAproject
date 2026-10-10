import path from 'node:path';
import { loadStaticQuizQuestions } from '../../../scripts/quiz-csv.mjs';

export const QUICK_QUIZ_PERCENTILES = Object.freeze(
  Array.from({ length: 20 }, (_, index) => (index + 1) * 5),
);
export const QUICK_QUIZ_CATEGORY_CUTS = Object.freeze([10, 20, 25, 30, 40, 50]);
export const QUICK_QUIZ_EXCLUDED_CATEGORIES = Object.freeze(['wiso']);

export function characterLength(value) {
  return Array.from(String(value ?? '')).length;
}

export function measureQuestion(question) {
  const questionLength = characterLength(question.question);
  const answerLengths = (question.answers ?? []).map(characterLength);
  const answersTotalLength = answerLengths.reduce((total, length) => total + length, 0);
  return {
    ...question,
    metrics: {
      questionLength,
      maxAnswerLength: Math.max(0, ...answerLengths),
      answersTotalLength,
      displayLength: questionLength + answersTotalLength,
    },
  };
}

export function rankQuestions(questions) {
  return questions.map(measureQuestion).sort((left, right) =>
    left.metrics.displayLength - right.metrics.displayLength
      || left.metrics.questionLength - right.metrics.questionLength
      || left.id.localeCompare(right.id));
}

export function percentileCount(total, percentile) {
  if (!Number.isFinite(total) || total < 0 || !Number.isFinite(percentile)
    || percentile < 0 || percentile > 100) {
    throw new RangeError('total must be non-negative and percentile must be from 0 to 100');
  }
  return Math.ceil(total * percentile / 100);
}

function summarizePool(pool, percentile, targetCount) {
  const metrics = pool.map((question) => question.metrics);
  return {
    percentile,
    targetCount,
    eligibleCount: pool.length,
    maxQuestionLength: Math.max(0, ...metrics.map((item) => item.questionLength)),
    maxDisplayLength: Math.max(0, ...metrics.map((item) => item.displayLength)),
    maxAnswerLength: Math.max(0, ...metrics.map((item) => item.maxAnswerLength)),
  };
}

export function buildQuickQuizAnalysis(questions, files = []) {
  const excludedCategories = new Set(QUICK_QUIZ_EXCLUDED_CATEGORIES.map((category) => category.toLocaleLowerCase()));
  const excludedQuestions = questions.filter((question) => excludedCategories.has(String(question.category).toLocaleLowerCase()));
  const rankedQuestions = rankQuestions(questions.filter((question) => !excludedCategories.has(String(question.category).toLocaleLowerCase())));
  const percentiles = QUICK_QUIZ_PERCENTILES.map((percentile) => {
    const targetCount = percentileCount(rankedQuestions.length, percentile);
    return summarizePool(rankedQuestions.slice(0, targetCount), percentile, targetCount);
  });
  const categoryNames = [...new Set(rankedQuestions.map((question) => question.category))]
    .sort((left, right) => left.localeCompare(right));
  const categoryQuestionSets = Object.fromEntries(categoryNames.map((category) => [
    category,
    rankQuestions(rankedQuestions.filter((question) => question.category === category)),
  ]));
  const globalCategoryDistribution = QUICK_QUIZ_CATEGORY_CUTS.map((percentile) => {
    const targetCount = percentileCount(rankedQuestions.length, percentile);
    const counts = Object.fromEntries(categoryNames.map((category) => [category, 0]));
    for (const question of rankedQuestions.slice(0, targetCount)) counts[question.category] += 1;
    return { percentile, targetCount, counts };
  });
  const perCategoryPercentiles = Object.fromEntries(categoryNames.map((category) => [
    category,
    QUICK_QUIZ_PERCENTILES.map((percentile) => {
      const pool = categoryQuestionSets[category];
      const targetCount = percentileCount(pool.length, percentile);
      return summarizePool(pool.slice(0, targetCount), percentile, targetCount);
    }),
  ]));
  const perCategoryDistribution = QUICK_QUIZ_CATEGORY_CUTS.map((percentile) => {
    const counts = Object.fromEntries(categoryNames.map((category) => [
      category,
      percentileCount(categoryQuestionSets[category].length, percentile),
    ]));
    return { percentile, counts, targetCount: Object.values(counts).reduce((sum, count) => sum + count, 0) };
  });

  return {
    totalQuestions: rankedQuestions.length,
    sourceQuestionCount: questions.length,
    excludedQuestionCount: excludedQuestions.length,
    excludedCategories: [...QUICK_QUIZ_EXCLUDED_CATEGORIES],
    files,
    categoryNames,
    tieBreak: 'displayLength, then questionLength, then ID',
    percentiles,
    globalCategoryDistribution,
    perCategoryDistribution,
    perCategoryPercentiles,
    categoryQuestionSets,
    rankedQuestions,
  };
}

export function loadQuickQuizAnalysis(quizDataDirectory) {
  const loaded = loadStaticQuizQuestions(quizDataDirectory);
  if (loaded.errors.length) {
    throw new Error(`Cannot analyze invalid quiz data:\n${loaded.errors.join('\n')}`);
  }
  return buildQuickQuizAnalysis(loaded.questions, loaded.files);
}

export function defaultQuizDataDirectory(projectRoot) {
  return path.join(projectRoot, 'quiz-data');
}
