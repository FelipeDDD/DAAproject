import STATIC_QUIZ_QUESTIONS from './quizStaticQuestions.generated.js';
import { GENERATED_QUIZ_QUESTIONS } from './quizGeneratedQuestions.js';
import { buildQuizQuestionSelection } from './quizSelection.js';

export {
  DECIMAL_VALUE_MAX,
  DECIMAL_VALUE_MIN,
  generateUniqueDistractors,
  shuffleAnswers,
  SUBNET_PREFIX_MAX,
  SUBNET_PREFIX_MIN,
} from './quizGeneratedQuestions.js';

export const QUESTIONS_PER_QUIZ = 5;
export const QUIZ_DIFFICULTIES = Object.freeze(['medium', 'hard']);
export const QUIZ_QUANTITIES = Object.freeze([5, 10, 15]);
export const QUIZ_QUESTIONS = Object.freeze([
  ...STATIC_QUIZ_QUESTIONS,
  ...GENERATED_QUIZ_QUESTIONS,
]);

export function quizCategories() {
  return [...new Set(QUIZ_QUESTIONS.map((question) => question.category))]
    .sort((left, right) => left.localeCompare(right, 'de'));
}

export function shuffleConcreteAnswers(question, random = Math.random) {
  const tagged = question.answers.map((answer, index) => ({
    answer,
    isCorrect: index === question.correctAnswer,
  }));
  for (let index = tagged.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [tagged[index], tagged[target]] = [tagged[target], tagged[index]];
  }
  const correctAnswer = tagged.findIndex(({ isCorrect }) => isCorrect);
  if (tagged.length !== 4 || tagged.filter(({ isCorrect }) => isCorrect).length !== 1 || correctAnswer < 0) {
    throw new Error(`Invalid answer set: ${question.id}`);
  }
  return {...question,answers:tagged.map(({ answer }) => answer),correctAnswer};
}

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
  return shuffleConcreteAnswers(concrete, random);
}

export function materializeQuizQuestions(questionIds, random = Math.random) {
  const concreteQuestions=[];
  const seen=new Set();
  const occurrences=new Map();
  for(const id of questionIds){
    const template = QUIZ_QUESTIONS.find((question) => question.id === id);
    if (!template) throw new Error(`Unknown quiz question: ${id}`);
    let concrete,signature;
    const attempts=template.type==='generated'?50:1;
    for(let attempt=0;attempt<attempts;attempt+=1){
      concrete=materializeQuizQuestion(template,random);
      signature=JSON.stringify([template.id,concrete.question]);
      if(!seen.has(signature))break;
    }
    if(seen.has(signature))continue;
    seen.add(signature);
    const occurrence=(occurrences.get(template.id)??0)+1;
    occurrences.set(template.id,occurrence);
    concreteQuestions.push({...concrete,id:occurrence===1?template.id:`${template.id}#${occurrence}`});
  }
  return concreteQuestions;
}

export function selectQuizQuestionIds({
  category,
  difficulty,
  count = QUESTIONS_PER_QUIZ,
  seed = Date.now(),
  recentHistories = [],
} = {}) {
  return buildQuizQuestionSelection({
    questionBank:QUIZ_QUESTIONS,category,difficulty,count,seed,recentHistories,
  }).questionIds;
}
