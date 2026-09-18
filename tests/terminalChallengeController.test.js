import test from 'node:test';
import assert from 'node:assert/strict';
import { SoloStudyController } from '../src/SoloStudyController.js';
import { SoloChallengeSession } from '../src/quiz/SoloChallengeSession.js';

const questions=[0,1].map(index=>({
  id:`question-${index}`,category:'Hardware',topic:null,difficulty:'medium',
  question:`Question ${index}`,answers:['A','B','C','D'],correctAnswer:0,explanation:'',
}));

function controllerWith(session){
  return Object.assign(Object.create(SoloStudyController.prototype),{
    session,terminalChallengeListeners:new Set(),status:{textContent:''},
    paintChallengeTimers(){},markChallengeQuestionViewed(){},render(){},
    finishChallenge(){this.finishCalls=(this.finishCalls??0)+1;},
    pending:false,finishingChallenge:false,newPersonalBest:false,personalBestScore:null,
  });
}

test('terminal timer states come from the local session tick and advance after feedback',()=>{
  const session=new SoloChallengeSession(questions,{now:0});
  const controller=controllerWith(session),states=[];
  controller.subscribeTerminalChallenge(state=>states.push(state));
  session.select(0);session.confirm(100);
  controller.updateChallengeClock(1_099);
  assert.equal(states.at(-1).question.id,'question-0');
  assert.equal(states.at(-1).resolving,true);
  controller.updateChallengeClock(1_100);
  assert.equal(states.at(-1).question.id,'question-1');
  assert.equal(states.at(-1).resolving,false);
  assert.equal(states.at(-1).score,10);
});

test('terminal timer publishes fresh local countdown values without a backend request',()=>{
  const controller=controllerWith(new SoloChallengeSession(questions,{now:10_000})),states=[];
  controller.subscribeTerminalChallenge(state=>states.push(state));
  controller.updateChallengeClock(11_000);controller.updateChallengeClock(12_000);
  assert.equal(states[0].timers.remainingMs-states[1].timers.remainingMs,1_000);
  assert.equal(states[0].timers.questionRemainingMs-states[1].timers.questionRemainingMs,1_000);
});
