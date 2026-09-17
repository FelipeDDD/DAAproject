import test from 'node:test';
import assert from 'node:assert/strict';
import { TerminalStudyBridge,TERMINAL_STUDY_MESSAGES } from '../src/terminal/TerminalStudyBridge.js';

function harness(){
  const calls=[],messages=[];
  const contentWindow={postMessage(message,origin){messages.push({message,origin});}};
  const controller={
    state:{phase:'setup'},
    terminalStudyState(){return this.state;},
    async loadStudyOptions(){calls.push(['options']);this.state={phase:'setup',options:{categories:['Hardware']}};},
    async startStudyFromTerminal(settings){calls.push(['start',settings]);this.state={phase:'question'};},
    selectStudyAnswerFromTerminal(index){calls.push(['select',index]);},
    confirmStudyAnswerFromTerminal(){calls.push(['confirm']);},
    async nextStudyQuestionFromTerminal(){calls.push(['next']);},
    async endStudyFromTerminal(){calls.push(['end']);this.state={phase:'setup'};},
  };
  const frame={contentWindow};
  const bridge=new TerminalStudyBridge({frame,controller,origin:'http://local.test'});
  const event=(action,payload,overrides={})=>({
    origin:'http://local.test',source:contentWindow,
    data:{type:TERMINAL_STUDY_MESSAGES.request,action,payload},...overrides,
  });
  return {bridge,controller,calls,messages,event,contentWindow};
}

test('terminal Study bridge loads real options and sends controller state to its iframe',async()=>{
  const h=harness();
  assert.equal(await h.bridge.handle(h.event('options')),true);
  assert.deepEqual(h.calls,[['options']]);
  assert.deepEqual(h.messages,[{
    message:{type:TERMINAL_STUDY_MESSAGES.state,state:{phase:'setup',options:{categories:['Hardware']}}},
    origin:'http://local.test',
  }]);
});

test('terminal Study bridge normalizes presentation values and keeps the existing five-question session',async()=>{
  const h=harness();
  await h.bridge.handle(h.event('start',{
    category:'Netzwerk',topic:'DNS',difficulty:'medium',count:999,
  }));
  assert.deepEqual(h.calls,[['start',{
    category:'Netzwerk',topic:'DNS',difficulty:'medium',count:5,
  }]]);
  await h.bridge.handle(h.event('select',{answerIndex:2}));
  await h.bridge.handle(h.event('confirm'));
  await h.bridge.handle(h.event('next'));
  assert.deepEqual(h.calls.slice(1),[['select',2],['confirm'],['next']]);
});

test('terminal Study bridge rejects messages from another source or origin',async()=>{
  const h=harness();
  assert.equal(await h.bridge.handle(h.event('options',{}, {origin:'http://other.test'})),false);
  assert.equal(await h.bridge.handle(h.event('options',{}, {source:{}})),false);
  assert.deepEqual(h.calls,[]);
});

test('ending while startup is pending waits for the real run and then clears it',async()=>{
  const h=harness();let release;
  h.controller.startStudyFromTerminal=async settings=>{
    h.calls.push(['start',settings]);await new Promise(resolve=>{release=resolve;});h.controller.state={phase:'question'};
  };
  const starting=h.bridge.handle(h.event('start',{category:'Hardware'}));
  await Promise.resolve();
  const ending=h.bridge.handle(h.event('end'));
  await Promise.resolve();
  assert.deepEqual(h.calls.map(call=>call[0]),['start']);
  release();await Promise.all([starting,ending]);
  assert.deepEqual(h.calls.map(call=>call[0]),['start','end']);
  assert.equal(h.controller.state.phase,'setup');
});
