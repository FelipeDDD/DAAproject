import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTIONS_PER_QUIZ,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTIONS,
  SUBNET_PREFIX_MIN,
  SUBNET_PREFIX_MAX,
  DECIMAL_VALUE_MIN,
  DECIMAL_VALUE_MAX,
  materializeQuizQuestion,
  materializeQuizQuestions,
  quizTopicsByCategory,
  selectQuizQuestionIds,
  shuffleConcreteAnswers,
} from '../convex/quizQuestions.js';

function seededRandom(seed) {
  let state=seed>>>0;
  return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/2**32);
}

function validateConcrete(question) {
  assert.ok(question.question);
  assert.equal(question.answers.length,4);
  assert.equal(new Set(question.answers).size,4);
  assert.ok(Number.isInteger(question.correctAnswer));
  assert.ok(question.correctAnswer>=0&&question.correctAnswer<question.answers.length);
  assert.ok(question.explanation===undefined||typeof question.explanation==='string');
}

test('question bank uses the editable metadata structure',()=>{
  assert.ok(QUIZ_QUESTIONS.length>=25);
  assert.equal(new Set(QUIZ_QUESTIONS.map(question=>question.id)).size,QUIZ_QUESTIONS.length);
  for(const item of QUIZ_QUESTIONS){
    assert.ok(item.category);
    assert.ok(QUIZ_DIFFICULTIES.includes(item.difficulty));
    if(item.type==='generated')assert.equal(typeof item.generate,'function');
    else validateConcrete(materializeQuizQuestion(item));
  }
});

test('all static answers are shuffled without losing the correct answer',()=>{
  const template=QUIZ_QUESTIONS.find(question=>question.type!=='generated');
  const correctText=template.answers[template.correctAnswer],orders=new Set();
  for(let seed=0;seed<100;seed++){
    const question=materializeQuizQuestion(template,seededRandom(seed));
    validateConcrete(question);orders.add(question.answers.join('|'));
    assert.equal(question.answers[question.correctAnswer],correctText);
  }
  assert.ok(orders.size>1);
});

test('tagged shuffle keeps exactly one correct answer',()=>{
  const source={id:'shuffle-test',answers:['A','B','C','D'],correctAnswer:2};
  for(let seed=0;seed<100;seed++){
    const shuffled=shuffleConcreteAnswers(source,seededRandom(seed));
    assert.equal(shuffled.answers.length,4);
    assert.equal(shuffled.answers[shuffled.correctAnswer],'C');
    assert.equal(shuffled.answers.filter(answer=>answer==='C').length,1);
  }
});

test('subnet template stays within /24-/30 with four unique, correctly indexed answers',()=>{
  const template=QUIZ_QUESTIONS.find(question=>question.id==='network-subnet-hosts-generated');
  assert.match(materializeQuizQuestion(template,()=>0).question,/\/24-/);
  assert.match(materializeQuizQuestion(template,()=>0.999999).question,/\/30-/);
  for(let seed=0;seed<500;seed++){
    const question=materializeQuizQuestion(template,seededRandom(seed));
    validateConcrete(question);
    const prefix=Number(question.question.match(/\/(\d+)/)?.[1]);
    assert.ok(prefix>=SUBNET_PREFIX_MIN&&prefix<=SUBNET_PREFIX_MAX);
    const expected=String(2**(32-prefix)-2);
    assert.equal(question.answers[question.correctAnswer],expected);
  }
});

test('decimal template stays within 0-255 and always uses unique eight-bit answers',()=>{
  const template=QUIZ_QUESTIONS.find(question=>question.id==='number-decimal-binary-generated');
  assert.match(materializeQuizQuestion(template,()=>0).question,/Dezimalzahl 0\?/);
  assert.match(materializeQuizQuestion(template,()=>0.999999).question,/Dezimalzahl 255\?/);
  for(let seed=0;seed<500;seed++){
    const question=materializeQuizQuestion(template,seededRandom(seed));
    validateConcrete(question);
    const decimal=Number(question.question.match(/Dezimalzahl (\d+)/)?.[1]);
    assert.ok(decimal>=DECIMAL_VALUE_MIN&&decimal<=DECIMAL_VALUE_MAX);
    assert.ok(question.answers.every(answer=>/^[01]{8}$/.test(answer)));
    assert.equal(question.answers[question.correctAnswer],decimal.toString(2).padStart(8,'0'));
  }
});

test('one server-side selection is deterministic, limited and contains no repeats',()=>{
  const options={count:QUESTIONS_PER_QUIZ,seed:'same quiz session'};
  const first=selectQuizQuestionIds(options),second=selectQuizQuestionIds(options);
  assert.deepEqual(first,second);
  assert.equal(first.length,Math.min(QUESTIONS_PER_QUIZ,QUIZ_QUESTIONS.length));
  assert.equal(new Set(first).size,first.length);
});

test('selection is ready for category, difficulty and amount filters',()=>{
  const ids=selectQuizQuestionIds({category:'Programmierung',difficulty:'medium',count:2,seed:'filters'});
  assert.equal(ids.length,2);
  for(const id of ids){
    const item=QUIZ_QUESTIONS.find(question=>question.id===id);
    assert.equal(item.category,'Programmierung');assert.equal(item.difficulty,'medium');
  }
});

test('Rechnungen topics are detected and filter the shared question bank',()=>{
  const groups=quizTopicsByCategory();
  const rechnungen=groups.find(group=>group.category==='Rechnungen')?.topics??[];
  for(const topic of ['Dreisatz','Netto-Brutto','Prozentrechnung','Rabatt','Textverständnis'])
    assert.ok(rechnungen.includes(topic));
  assert.deepEqual(groups.find(group=>group.category==='Prüfungssprache')?.topics,
    ['Aufgabenverben','Prüfungsformulierungen','Textverständnis']);
  const ids=selectQuizQuestionIds({category:'Rechnungen',topic:'Rabatt',difficulty:'medium',count:null,seed:'rabatt'});
  assert.equal(ids.length,2);
  assert.ok(ids.every(id=>QUIZ_QUESTIONS.find(question=>question.id===id)?.topic==='Rabatt'));
});

test('All quantity uses every compatible question without failing',()=>{
  const ids=selectQuizQuestionIds({category:'Programmierung',difficulty:'medium',count:null,seed:'all'});
  const compatible=QUIZ_QUESTIONS.filter(item=>item.category==='Programmierung'&&item.difficulty==='medium');
  assert.equal(ids.length,compatible.length);assert.equal(new Set(ids).size,ids.length);
});

test('a generated category fills a five-question session with unique concrete questions',()=>{
  const ids=selectQuizQuestionIds({category:'Netzwerk',difficulty:'medium',count:5,seed:'five-network'});
  assert.equal(ids.length,5);
  const questions=materializeQuizQuestions(ids,seededRandom(42));
  assert.equal(questions.length,5);
  assert.equal(new Set(questions.map(question=>question.id)).size,5);
  assert.equal(new Set(questions.map(question=>question.question)).size,5);
  for(const question of questions)validateConcrete(question);
});
