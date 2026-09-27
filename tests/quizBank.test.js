import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOffice3Questions,loadQuizBank,materializeQuizBankQuestion } from '../src/quiz/quizBank.js';

test('Office3 loader caches only the static bank needed by its existing puzzle',async()=>{
  const first=loadOffice3Questions(),second=loadOffice3Questions();
  assert.equal(first,second);
  const questions=await first;
  assert.ok(questions.length>100);
  assert.equal(await loadOffice3Questions(),questions);
});

test('quiz bank loader caches its module and exposes both static and generated data',async()=>{
  const first=loadQuizBank(),second=loadQuizBank();
  assert.equal(first,second);
  const bank=await first;
  assert.ok(bank.staticQuestions.length>100);
  assert.ok(bank.generatedQuestions.length>0);
  assert.equal(await loadQuizBank(),bank);
});

test('lazy materialization preserves generated quiz answers and concrete fields',async()=>{
  const {generatedQuestions}=await loadQuizBank();
  const template=generatedQuestions[0];
  const concrete=materializeQuizBankQuestion(template,()=>0.37);
  assert.equal(concrete.id,template.id);
  assert.equal(concrete.category,template.category);
  assert.equal(concrete.answers.length,4);
  assert.equal(new Set(concrete.answers).size,4);
  assert.ok(concrete.correctAnswer>=0&&concrete.correctAnswer<4);
});
