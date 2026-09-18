import test from 'node:test';
import assert from 'node:assert/strict';
import { TerminalChallengeBridge,TERMINAL_CHALLENGE_MESSAGES } from '../src/terminal/TerminalChallengeBridge.js';
import { terminalChallengeShortcut } from '../src/terminal/terminalChallengeShortcuts.js';

function harness(){
  const calls=[],messages=[];let clockListener=null;
  const contentWindow={postMessage(message,origin){messages.push({message,origin});}};
  const controller={
    state:{phase:'intro',rules:{durationMs:300_000,questionTimeoutMs:30_000}},
    terminalChallengeState(){return this.state;},
    async startChallengeFromTerminal(){calls.push(['start']);this.state={phase:'question',score:0};return this.state;},
    selectChallengeAnswerFromTerminal(index,options){calls.push(['select',index,options]);},
    confirmChallengeAnswerFromTerminal(){calls.push(['confirm']);},
    skipChallengeFromTerminal(){calls.push(['skip']);},
    async endChallengeFromTerminal(){calls.push(['leave']);this.state={phase:'intro'};},
    subscribeTerminalChallenge(listener){clockListener=listener;return ()=>{clockListener=null;};},
  };
  const frame={contentWindow};
  const bridge=new TerminalChallengeBridge({frame,controller,origin:'http://local.test'});
  const event=(action,payload,overrides={})=>({
    origin:'http://local.test',source:contentWindow,
    data:{type:TERMINAL_CHALLENGE_MESSAGES.request,action,payload},...overrides,
  });
  return {bridge,controller,calls,messages,event,emitClock(state){controller.state=state;clockListener?.(state);}};
}

test('terminal Challenge bridge starts the existing run and streams its real clock state',async()=>{
  const h=harness();
  assert.equal(await h.bridge.handle(h.event('state')),true);
  assert.equal(h.messages.at(-1).message.state.phase,'intro');
  await h.bridge.handle(h.event('start'));
  assert.deepEqual(h.calls,[['start']]);
  h.emitClock({phase:'question',score:10,timers:{remainingMs:299_000,questionRemainingMs:29_000}});
  assert.equal(h.messages.at(-1).message.state.score,10);
});

test('selection preserves local confirmation choice while submit and skip use the real controller',async()=>{
  const h=harness();
  await h.bridge.handle(h.event('select',{answerIndex:2,submitImmediately:true}));
  await h.bridge.handle(h.event('confirm'));
  await h.bridge.handle(h.event('skip'));
  assert.deepEqual(h.calls,[['select',2,{submitImmediately:true}],['confirm'],['skip']]);
});

test('leaving stops terminal updates and abandons the local run without finishing it',async()=>{
  const h=harness();await h.bridge.handle(h.event('start'));
  await h.bridge.handle(h.event('leave'));
  const messageCount=h.messages.length;h.emitClock({phase:'question',score:99});
  assert.equal(h.messages.length,messageCount);assert.deepEqual(h.calls,[['start'],['leave']]);
  assert.equal(h.messages.at(-1).message.state.phase,'intro');
});

test('bridge rejects another source or origin and stops polling after a saved result',async()=>{
  const h=harness();
  assert.equal(await h.bridge.handle(h.event('state',{}, {origin:'http://other.test'})),false);
  assert.equal(await h.bridge.handle(h.event('state',{}, {source:{}})),false);
  await h.bridge.handle(h.event('start'));h.emitClock({phase:'result',saving:false,result:{score:17}});
  assert.equal(h.messages.at(-1).message.state.result.score,17);
  const messageCount=h.messages.length;h.emitClock({phase:'result',saving:false,result:{score:99}});
  assert.equal(h.messages.length,messageCount);
});

test('Challenge keyboard shortcuts skip with S and confirm a selected answer with Space',()=>{
  assert.equal(terminalChallengeShortcut({key:'s'}),'skip');
  assert.equal(terminalChallengeShortcut({key:'S'}),'skip');
  assert.equal(terminalChallengeShortcut({key:' ',code:'Space',selectedAnswer:2}),'confirm');
  assert.equal(terminalChallengeShortcut({key:' ',selectedAnswer:null}),null);
  assert.equal(terminalChallengeShortcut({key:' ',selectedAnswer:2,confirmBeforeSubmit:false}),null);
});

test('Challenge shortcuts stay inactive during feedback, calculator/dialog input and key repeat',()=>{
  assert.equal(terminalChallengeShortcut({key:'s',resolving:true}),null);
  assert.equal(terminalChallengeShortcut({key:'s',blocked:true}),null);
  assert.equal(terminalChallengeShortcut({key:'s',repeat:true}),null);
  assert.equal(terminalChallengeShortcut({key:'s',modified:true}),null);
  assert.equal(terminalChallengeShortcut({key:' ',selectedAnswer:1,saving:true}),null);
});
