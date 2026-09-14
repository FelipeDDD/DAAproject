import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_QUESTIONS,materializeQuizQuestions,selectQuizQuestionIds } from '../convex/quizQuestions.js';
import { questionTemplateId } from '../convex/quizSelection.js';
import { SoloStudySession } from '../src/quiz/SoloStudySession.js';

test('Solo Study uses shared filters and recent-question exclusion',()=>{
  const compatible=QUIZ_QUESTIONS.filter(question=>question.category==='Hardware'&&question.difficulty==='medium');
  assert.ok(compatible.length>=5);
  const recent=compatible.slice(0,5).map((question,index)=>({questionId:question.id,seenAt:100-index}));
  const ids=selectQuizQuestionIds({category:'Hardware',difficulty:'medium',count:5,seed:'solo-test',recentHistories:[recent]});
  assert.equal(ids.length,5);
  assert.ok(ids.every(id=>compatible.some(question=>question.id===id)));
  assert.ok(ids.every(id=>!recent.some(entry=>entry.questionId===id)));
});

test('Solo Study materializes generated questions with four shuffled answers and a valid correct answer',()=>{
  const generated=QUIZ_QUESTIONS.find(question=>question.type==='generated');
  assert.ok(generated);
  const [question]=materializeQuizQuestions([generated.id],()=>0.37);
  assert.equal(questionTemplateId(question.id),generated.id);
  assert.equal(question.answers.length,4);
  assert.equal(new Set(question.answers).size,4);
  assert.ok(Number.isInteger(question.correctAnswer));
  assert.ok(question.correctAnswer>=0&&question.correctAnswer<4);
});

test('Solo Study allows reselection, reveals explanation after confirmation, and identifies correctness',()=>{
  const session=new SoloStudySession([{id:'one',question:'Frage',answers:['A','B','C','D'],correctAnswer:2,explanation:'Erklärung'}]);
  assert.equal(session.explanationVisible,false);
  assert.equal(session.select(0),true);assert.equal(session.select(2),true);
  assert.deepEqual(session.confirm(),{correct:true,answerIndex:2,correctAnswer:2});
  assert.equal(session.select(1),false);assert.equal(session.explanationVisible,true);
});

test('Solo Study advances through every question and calculates its result',()=>{
  const questions=[0,1,2].map(index=>({id:String(index),question:'Q',answers:['A','B','C','D'],correctAnswer:index}));
  const session=new SoloStudySession(questions);
  for(const answer of [0,0,2]){session.select(answer);session.confirm();session.next();}
  assert.equal(session.complete,true);assert.equal(session.question,null);
  assert.deepEqual(session.result(),{correct:2,total:3,accuracy:67});
});
