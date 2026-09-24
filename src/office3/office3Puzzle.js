import STATIC_QUIZ_QUESTIONS from '../../convex/quizStaticQuestions.generated.js';
import { OFFICE3_MONITOR_STATUS } from '../art/office3PaperHighlight.js';

export const OFFICE3_PASSWORD_DIGITS = '488';
export const OFFICE3_STREAK_TARGET = 5;
export const OFFICE3_FEEDBACK_MS = 1000;
export const OFFICE3_PASSWORD_DENIED_MS = 2200;
export const OFFICE3_MONITOR = Object.freeze({
  ...OFFICE3_MONITOR_STATUS, interactionY: OFFICE3_MONITOR_STATUS.y + 28, radius: 55,
});

export function passwordIsCorrect(digits) {
  return digits === OFFICE3_PASSWORD_DIGITS;
}

export function nextStreak(count, correct) {
  return correct ? Math.min(OFFICE3_STREAK_TARGET, count + 1) : 0;
}

export function chooseOffice3Question(previousIds = [], random = Math.random) {
  const available = STATIC_QUIZ_QUESTIONS.filter(question =>
    Array.isArray(question.answers) && question.answers.length === 4 &&
    Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 &&
    question.correctAnswer < 4 && !previousIds.includes(question.id));
  const pool = available.length ? available : STATIC_QUIZ_QUESTIONS.filter(question =>
    Array.isArray(question.answers) && question.answers.length === 4 &&
    Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer < 4);
  if (!pool.length) throw new Error('No quiz questions are available.');
  return pool[Math.floor(random() * pool.length)];
}
