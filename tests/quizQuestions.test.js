import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTIONS_PER_QUIZ,
  QUIZ_DIFFICULTIES,
  QUIZ_QUESTIONS,
  selectQuizQuestionIds,
} from '../convex/quizQuestions.js';

test('question bank uses the editable metadata structure',()=>{
  assert.equal(QUIZ_QUESTIONS.length,3);
  assert.equal(new Set(QUIZ_QUESTIONS.map(question=>question.id)).size,QUIZ_QUESTIONS.length);
  for(const item of QUIZ_QUESTIONS){
    assert.ok(item.category);
    assert.ok(QUIZ_DIFFICULTIES.includes(item.difficulty));
    assert.ok(item.question);
    assert.equal(item.answers.length,4);
    assert.ok(Number.isInteger(item.correctAnswer));
    assert.ok(item.correctAnswer>=0&&item.correctAnswer<item.answers.length);
    assert.ok(item.explanation===undefined||typeof item.explanation==='string');
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
  const ids=selectQuizQuestionIds({category:'Programmierung',difficulty:'easy',count:2,seed:'filters'});
  assert.equal(ids.length,2);
  for(const id of ids){
    const item=QUIZ_QUESTIONS.find(question=>question.id===id);
    assert.equal(item.category,'Programmierung');assert.equal(item.difficulty,'easy');
  }
});
