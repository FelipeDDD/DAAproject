import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUIZ_QUESTION_DURATION_MS,
  quizQuestionComplete,
  quizQuestionExpired,
  remainingQuizSeconds,
  shouldEndQuizForParticipants,
} from '../src/quizTimer.js';

test('quiz timer defaults to thirty seconds and counts down to zero',()=>{
  assert.equal(QUIZ_QUESTION_DURATION_MS,30_000);
  const deadline=40_000;
  assert.equal(remainingQuizSeconds(deadline,10_000),30);
  assert.equal(remainingQuizSeconds(deadline,39_001),1);
  assert.equal(remainingQuizSeconds(deadline,40_000),0);
  assert.equal(quizQuestionExpired(deadline,39_999),false);
  assert.equal(quizQuestionExpired(deadline,40_000),true);
});

test('question completes early when everyone confirms',()=>{
  assert.equal(quizQuestionComplete(['a','b'],['a','b'],40_000,[],10_000),true);
  assert.equal(quizQuestionComplete(['a','b'],['a'],40_000,[],10_000),false);
});

test('timeout waits for every active player finalization, including no answer',()=>{
  const participants=['a','b'];
  assert.equal(quizQuestionComplete(participants,['a'],40_000,[],40_000),false);
  assert.equal(quizQuestionComplete(participants,['a'],40_000,['b'],40_000),true);
  assert.equal(quizQuestionComplete(participants,[],40_000,['a','b'],40_000),true);
});

test('an active quiz continues with two players and ends below two',()=>{
  assert.equal(shouldEndQuizForParticipants('starting',3),false);
  assert.equal(shouldEndQuizForParticipants('starting',2),false);
  assert.equal(shouldEndQuizForParticipants('starting',1),true);
  assert.equal(shouldEndQuizForParticipants('lobby',1),false);
  assert.equal(shouldEndQuizForParticipants('finished',1),false);
});
