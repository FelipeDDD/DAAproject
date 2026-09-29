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

export function nextStreak(count, correct, target = OFFICE3_STREAK_TARGET) {
  return correct ? Math.min(target, count + 1) : 0;
}

export function chooseOffice3Question(questionBank,previousIds = [], random = Math.random) {
  const available = questionBank.filter(question =>
    Array.isArray(question.answers) && question.answers.length === 4 &&
    Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 &&
    question.correctAnswer < 4 && !previousIds.includes(question.id));
  const pool = available.length ? available : questionBank.filter(question =>
    Array.isArray(question.answers) && question.answers.length === 4 &&
    Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer < 4);
  if (!pool.length) throw new Error('No quiz questions are available.');
  const question=pool[Math.floor(random()*pool.length)];
  const tagged=question.answers.map((answer,index)=>({answer,isCorrect:index===question.correctAnswer}));
  for(let index=tagged.length-1;index>0;index--){
    const target=Math.floor(random()*(index+1));
    [tagged[index],tagged[target]]=[tagged[target],tagged[index]];
  }
  return {...question,answers:tagged.map(item=>item.answer),correctAnswer:tagged.findIndex(item=>item.isCorrect)};
}
