import test from 'node:test';
import assert from 'node:assert/strict';
import { SoloChallengeSession,challengeAccuracy } from '../src/quiz/SoloChallengeSession.js';
import {
  IT_CHALLENGE_CATEGORIES,IT_CHALLENGE_DURATION_MS,IT_CHALLENGE_FEEDBACK_DELAY_MS,
  IT_CHALLENGE_POINTS,IT_CHALLENGE_QUESTION_TIMEOUT_MS,
} from '../src/quiz/itChallengeRules.js';
import { isNewPersonalBest,scoreItChallengeOutcomes } from '../convex/itChallengeScoring.js';
import { QUIZ_QUESTIONS,materializeQuizQuestions } from '../convex/quizQuestions.js';

const questions=(difficulties=['medium','hard','medium'])=>difficulties.map((difficulty,index)=>({
  id:`q-${index}`,category:'Hardware',topic:null,difficulty,question:`Frage ${index}`,
  answers:['A','B','C','D'],correctAnswer:index%4,explanation:'Erklärung',
}));

test('IT Challenge centralizes its five-minute, question and feedback timers',()=>{
  assert.equal(IT_CHALLENGE_DURATION_MS,300_000);
  assert.equal(IT_CHALLENGE_QUESTION_TIMEOUT_MS,30_000);
  assert.equal(IT_CHALLENGE_FEEDBACK_DELAY_MS,1_000);
  assert.deepEqual(IT_CHALLENGE_CATEGORIES,[
    'Hardware','Betriebssysteme','Netzwerk','Programmierung','Zahlensysteme',
  ]);
});

test('medium, hard and wrong answers use configured scoring and one-second feedback',()=>{
  const session=new SoloChallengeSession(questions(),{now:1_000});
  session.select(0);assert.equal(session.confirm(2_000).points,IT_CHALLENGE_POINTS.mediumCorrect);
  assert.equal(session.tick(2_999),null);assert.equal(session.tick(3_000).type,'advanced');
  session.select(1);assert.equal(session.confirm(4_000).points,IT_CHALLENGE_POINTS.hardCorrect);
  session.tick(5_000);session.select(0);assert.equal(session.confirm(6_000).points,IT_CHALLENGE_POINTS.wrong);
  assert.equal(session.score,21);assert.equal(session.tick(7_000).type,'complete');
  assert.deepEqual(session.result(),{
    score:21,correct:2,wrong:1,skipped:0,manualSkip:0,timeoutSkip:0,
    mediumCorrect:1,hardCorrect:1,totalAnswered:3,accuracy:66.7,assessment:'Keep practicing',
  });
});

test('manual and timeout skips share scoring but preserve their origin',()=>{
  const session=new SoloChallengeSession(questions(),{now:0});
  assert.equal(session.skip('manualSkip',1_000).type,'manualSkip');
  assert.equal(session.tick(31_000).type,'timeoutSkip');
  assert.equal(session.score,-6);assert.equal(session.skippedCount,2);
  assert.equal(session.manualSkipCount,1);assert.equal(session.timeoutSkipCount,1);
  assert.deepEqual(session.submission(),[
    {questionIndex:0,type:'manualSkip'},
    {questionIndex:1,type:'timeoutSkip'},
  ]);
});

test('global timer never resets and does not penalize the open question at zero',()=>{
  const session=new SoloChallengeSession(questions(),{durationMs:35_000,now:1_000});
  session.skip('manualSkip',10_000);
  assert.equal(session.remainingMs(20_000),16_000);
  assert.equal(session.questionRemainingMs(20_000),16_000);
  assert.equal(session.tick(36_000).type,'complete');
  assert.equal(session.result().skipped,1);assert.equal(session.submission().length,1);
});

test('backend scoring validates answers and both skip origins',()=>{
  const bank=questions().map(question=>({...question,answerCount:4}));
  const {result}=scoreItChallengeOutcomes(bank,[
    {questionIndex:0,type:'answer',answerIndex:0},
    {questionIndex:1,type:'answer',answerIndex:0},
    {questionIndex:2,type:'timeoutSkip'},
  ],2);
  assert.deepEqual(result,{
    score:1,correct:1,wrong:1,skipped:1,manualSkip:0,timeoutSkip:1,
    mediumCorrect:1,hardCorrect:0,totalAnswered:2,accuracy:50,
  });
  assert.throws(()=>scoreItChallengeOutcomes(bank,[
    {questionIndex:0,type:'manualSkip'},{questionIndex:0,type:'manualSkip'},
  ],1),/Invalid IT Challenge outcome/);
  assert.throws(()=>scoreItChallengeOutcomes(bank,[
    {questionIndex:1,type:'answer',answerIndex:1},
  ],2),/missing its outcome/);
});

test('accuracy excludes skips and only a greater score replaces a personal best',()=>{
  assert.equal(challengeAccuracy(5,1),83.3);assert.equal(challengeAccuracy(0,0),0);
  assert.equal(isNewPersonalBest(null,-3),true);assert.equal(isNewPersonalBest({score:100},99),false);
  assert.equal(isNewPersonalBest({score:100},100),false);assert.equal(isNewPersonalBest({score:100},101),true);
});

test('resolving a question blocks double submit',()=>{
  const session=new SoloChallengeSession(questions(),{now:0});
  session.select(0);assert.ok(session.confirm(100));
  assert.equal(session.confirm(101),null);assert.equal(session.skip('manualSkip',101),null);
  assert.equal(session.outcomes.length,1);
});

test('generated IT questions remain materialized, shuffled and scoreable',()=>{
  const template=QUIZ_QUESTIONS.find(question=>question.type==='generated'
    &&IT_CHALLENGE_CATEGORIES.includes(question.category));
  assert.ok(template);
  const [question]=materializeQuizQuestions([template.id],()=>0.31);
  const session=new SoloChallengeSession([question],{now:0});
  session.select(question.correctAnswer);session.confirm(100);
  assert.equal(session.correctCount,1);
  assert.equal(session.outcomes[0].questionIndex,0);
  assert.equal(new Set(question.answers).size,4);
});
