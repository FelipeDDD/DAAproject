import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_QUESTIONS,materializeQuizQuestions,selectQuizQuestionIds } from '../convex/quizQuestions.js';
import { SoloStudySession } from '../src/quiz/SoloStudySession.js';
import {
  CHALLENGE_POINTS_PER_CORRECT,CHALLENGE_QUESTION_DURATION_MS,challengeAssessment,SoloChallengeSession,
} from '../src/quiz/SoloChallengeSession.js';
import { createSoloSession } from '../src/quiz/soloModes.js';

const questions=count=>Array.from({length:count},(_,index)=>({
  id:`q-${index}`,category:'Hardware',difficulty:'medium',question:`Frage ${index}`,
  answers:['A','B','C','D'],correctAnswer:index%4,explanation:'Erklärung',
}));

test('Challenge and Study consume the same filtered, anti-repeated question sequence',()=>{
  const compatible=QUIZ_QUESTIONS.filter(question=>question.category==='Hardware'&&question.difficulty==='medium');
  const recent=compatible.slice(0,5).map((question,index)=>({questionId:question.id,seenAt:100-index}));
  const ids=selectQuizQuestionIds({category:'Hardware',difficulty:'medium',count:5,seed:'shared-solo',recentHistories:[recent]});
  const concrete=materializeQuizQuestions(ids,()=>0.42);
  const study=createSoloSession('study',concrete),challenge=createSoloSession('challenge',concrete);
  assert.deepEqual(study.questions,challenge.questions);
  assert.ok(ids.every(id=>!recent.some(entry=>entry.questionId===id)));
});

test('ten correct Challenge answers add up to 100 points',()=>{
  const session=new SoloChallengeSession(questions(10));
  for(const question of session.questions){session.select(question.correctAnswer);session.confirm();session.next();}
  assert.equal(CHALLENGE_POINTS_PER_CORRECT,10);assert.equal(session.result().score,100);
});

test('wrong Challenge answers add zero points and lock after confirmation',()=>{
  const session=new SoloChallengeSession(questions(1));session.select(1);session.confirm();
  assert.equal(session.score,0);assert.equal(session.select(0),false);assert.equal(session.confirm(),null);
});

test('Challenge gives each question sixty seconds and resets on manual advance',()=>{
  const session=new SoloChallengeSession(questions(2),{now:1000});
  assert.equal(CHALLENGE_QUESTION_DURATION_MS,60_000);
  assert.equal(session.remainingMs(1000),60_000);assert.equal(session.remainingMs(31_000),30_000);
  session.select(0);session.confirm(31_000);assert.equal(session.remainingMs(50_000),30_000);
  session.next(70_000);assert.equal(session.remainingMs(70_000),60_000);
});

test('Challenge timeout locks the question as wrong, reveals feedback and adds no score',()=>{
  const session=new SoloChallengeSession(questions(1),{now:1000});session.select(0);
  assert.equal(session.expire(60_999),null);
  assert.deepEqual(session.expire(61_000),{correct:false,answerIndex:null,correctAnswer:0,timedOut:true});
  assert.equal(session.confirmedAnswer,-1);assert.equal(session.explanationVisible,true);
  assert.equal(session.score,0);assert.equal(session.select(0),false);
});

test('Challenge result includes score, correct answers, accuracy and future highscore payload',()=>{
  const session=new SoloChallengeSession(questions(4));
  for(const [index,answer] of [0,1,2,3].map((answer,index)=>[index,index<3?answer%4:(answer+1)%4])){
    assert.equal(session.index,index);session.select(answer);session.confirm();session.next();
  }
  assert.deepEqual(session.result(),{correct:3,total:4,accuracy:75,score:30,assessment:'Good'});
  assert.deepEqual(session.completionRecord({characterId:'felipe',category:'Hardware',difficulty:'medium',completedAt:123}),{
    characterId:'felipe',mode:'challenge',category:'Hardware',difficulty:'medium',questionCount:4,
    score:30,correctAnswers:3,accuracy:75,completedAt:123,
  });
});

test('assessment bands are stable and Study remains score-free',()=>{
  assert.equal(challengeAssessment(90),'Excellent');assert.equal(challengeAssessment(89),'Good');
  assert.equal(challengeAssessment(74),'Keep practicing');assert.equal(challengeAssessment(49),'Needs practice');
  const study=new SoloStudySession(questions(1));study.select(0);study.confirm();study.next();
  assert.equal('score' in study,false);assert.deepEqual(study.result(),{correct:1,total:1,accuracy:100});
});

test('generated questions stay materialized and correctly scored in Challenge',()=>{
  const generated=QUIZ_QUESTIONS.find(question=>question.type==='generated');
  const [question]=materializeQuizQuestions([generated.id],()=>0.31);
  const session=new SoloChallengeSession([question]);session.select(question.correctAnswer);session.confirm();session.next();
  assert.deepEqual(session.result(),{correct:1,total:1,accuracy:100,score:10,assessment:'Excellent'});
});
