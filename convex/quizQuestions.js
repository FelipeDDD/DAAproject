import STATIC_QUIZ_QUESTIONS from './quizStaticQuestions.generated.js';
import { GENERATED_QUIZ_QUESTIONS } from './quizGeneratedQuestions.js';

export {
  DECIMAL_VALUE_MAX,
  DECIMAL_VALUE_MIN,
  generateUniqueDistractors,
  shuffleAnswers,
  SUBNET_PREFIX_MAX,
  SUBNET_PREFIX_MIN,
} from './quizGeneratedQuestions.js';

export const QUESTIONS_PER_QUIZ = 5;
export const QUIZ_DIFFICULTIES = Object.freeze(['easy', 'medium', 'hard']);
export const QUIZ_QUESTIONS = Object.freeze([
  ...STATIC_QUIZ_QUESTIONS,
  ...GENERATED_QUIZ_QUESTIONS,
]);

export function materializeQuizQuestion(template, random = Math.random) {
  const generated = template.type === 'generated' ? template.generate(random) : template;
  const concrete = {
    id: template.id,
    category: template.category,
    difficulty: template.difficulty,
    question: generated.question,
    answers: [...generated.answers],
    correctAnswer: generated.correctAnswer,
    ...(generated.explanation !== undefined ? { explanation: generated.explanation } : {}),
    ...(generated.media !== undefined ? { media: generated.media } : {}),
  };
  if (typeof concrete.question !== 'string' || concrete.answers.length !== 4
    || new Set(concrete.answers).size !== 4 || !Number.isInteger(concrete.correctAnswer)
    || concrete.correctAnswer < 0 || concrete.correctAnswer >= concrete.answers.length) {
    throw new Error(`Invalid concrete quiz question: ${template.id}`);
  }
  return concrete;
}

export function materializeQuizQuestions(questionIds, random = Math.random) {
  return questionIds.map((id) => {
    const template = QUIZ_QUESTIONS.find((question) => question.id === id);
    if (!template) throw new Error(`Unknown quiz question: ${id}`);
    return materializeQuizQuestion(template, random);
  });
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectQuizQuestionIds({
  category,
  difficulty,
  count = QUESTIONS_PER_QUIZ,
  seed = Date.now(),
} = {}) {
  const eligible = QUIZ_QUESTIONS.filter((item) => (!category || item.category === category)
    && (!difficulty || item.difficulty === difficulty));
  const amount = Math.min(Math.max(0, Math.trunc(count)), eligible.length);
  return eligible
    .map((item) => ({ id: item.id, order: stableHash(`${seed}:${item.id}`) }))
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .slice(0, amount)
    .map((item) => item.id);
}
