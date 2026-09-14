export const QUESTIONS_PER_QUIZ = 5;
export const QUIZ_DIFFICULTIES = Object.freeze(['easy','medium','hard']);

// Add and edit questions here. Filters already accept category and difficulty,
// although the lobby does not expose those choices in its interface yet.
export const QUIZ_QUESTIONS = Object.freeze([
  {
    id: 'programming-001',
    media: {
      type: 'code',
      language: 'javascript',
      content: 'const score = 0;\nconsole.log(score);',
    },
    category: 'Programmierung',
    difficulty: 'easy',
    question: 'Qual linguagem está sendo usada no frontend deste projeto?',
    answers: ['JavaScript', 'Python', 'Java', 'C#'],
    correctAnswer: 0,
    explanation: 'O frontend do projeto foi escrito em JavaScript.',
  },
  {
    id: 'programming-002',
    category: 'Programmierung',
    difficulty: 'easy',
    question: 'Qual ferramenta renderiza o mundo 2D deste projeto?',
    answers: ['Convex', 'Phaser', 'Tiled Server', 'Vercel'],
    correctAnswer: 1,
    explanation: 'Phaser é responsável pela renderização e lógica do mundo 2D.',
  },
  {
    id: 'programming-003',
    media: {
      type: 'table',
      columns: ['Personagem', 'ID'],
      rows: [['Michael', 'michael'], ['Jassine', 'jassine'], ['Sarina', 'sarina'], ['Felipe', 'felipe']],
    },
    category: 'Programmierung',
    difficulty: 'easy',
    question: 'Quantos personagens fixos existem nesta primeira versão?',
    answers: ['Dois', 'Três', 'Quatro', 'Oito'],
    correctAnswer: 2,
  },
]);

function stableHash(value) {
  let hash=2166136261;
  for(const character of String(value)){
    hash^=character.charCodeAt(0);
    hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}

export function selectQuizQuestionIds({
  category,
  difficulty,
  count=QUESTIONS_PER_QUIZ,
  seed=Date.now(),
}={}) {
  const eligible=QUIZ_QUESTIONS.filter(item=>(!category||item.category===category)&&(!difficulty||item.difficulty===difficulty));
  const amount=Math.min(Math.max(0,Math.trunc(count)),eligible.length);
  return eligible
    .map(item=>({id:item.id,order:stableHash(`${seed}:${item.id}`)}))
    .sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))
    .slice(0,amount)
    .map(item=>item.id);
}
