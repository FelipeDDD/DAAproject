import test from 'node:test';
import assert from 'node:assert/strict';
import { createExecutiveRunner,jumpExecutiveRunner,stepExecutiveRunner,runnerObstacles } from '../src/office2/executiveRunner.js';
import { DirectorRecoveryFlow } from '../src/office2/DirectorRecoveryFlow.js';
import { directorSecurityState } from '../src/office2/directorSecurity.js';

test('runner fails on collision, restarts fresh, and cannot double jump',()=>{
  const state=createExecutiveRunner();stepExecutiveRunner(state,4);
  assert.equal(state.phase,'failed');
  assert.equal(jumpExecutiveRunner(state),false);
  const fresh=createExecutiveRunner();assert.equal(fresh.elapsed,0);
  assert.equal(jumpExecutiveRunner(fresh),true);stepExecutiveRunner(fresh,0.1);
  assert.equal(jumpExecutiveRunner(fresh),false);
});

test('fixed obstacles are beatable; final encounter disables jumps and wins in 10–20 seconds',()=>{
  const state=createExecutiveRunner();let finalSeen=false;
  for(let frame=0;frame<1200&&state.phase!=='won';frame++){
    if(runnerObstacles(state).some(o=>o.x>115&&o.x<205))jumpExecutiveRunner(state);
    stepExecutiveRunner(state,1/60);
    assert.notEqual(state.phase,'failed');
    if(state.phase==='final'){
      finalSeen=true;assert.equal(jumpExecutiveRunner(state),false);
    }
  }
  assert.equal(finalSeen,true);assert.equal(state.phase,'won');
  assert.ok(state.elapsed>=10&&state.elapsed<=20);
});

function fakeUi(t){
  const context=new Proxy({},{get:(_target,key)=>key==='fillStyle'?null:()=>{},set:()=>true});
  function node(tag){return {tag,children:[],listeners:{},textContent:'',
    append(...nodes){this.children.push(...nodes);},setAttribute(){},focus(){},
    addEventListener(type,callback){this.listeners[type]=callback;},getContext(){return context;}};}
  const original={document:globalThis.document,requestAnimationFrame:globalThis.requestAnimationFrame,
    cancelAnimationFrame:globalThis.cancelAnimationFrame};
  let id=0;const frames=new Map();
  globalThis.document={createElement:node};
  globalThis.requestAnimationFrame=callback=>{frames.set(++id,callback);return id;};
  globalThis.cancelAnimationFrame=key=>frames.delete(key);
  t.after(()=>Object.assign(globalThis,original));
  const panel=node('section'),calls=[];
  const state=directorSecurityState(true,{physicalKeyVerifiedAt:1,failedAttempts:2});
  const host={active:true,generation:1,panel,
    resetPanel(title){panel.children=[];host.title=title;},
    showComputer(){host.shell=true;},
    scene:{presence:{identity:{playerId:'p',sessionId:'s'},profileSessionToken:'profile-token',
      api:{directorWorkstation:{recoveryStatus:'status',completeRecovery:'complete'}},
      client:{query:async(method,args)=>{calls.push({method,args});return state;},
        mutation:async(method,args)=>{calls.push({method,args});return {...state,recoveryComplete:true};}},
      fail(){host.lost=true;},
    }},
  };
  const flow=new DirectorRecoveryFlow(host);
  host.close=()=>{host.active=false;host.generation++;flow.close();};
  t.after(()=>flow.close());
  return {flow,host,calls,frames,state,frame(now){const [key,callback]=frames.entries().next().value;frames.delete(key);callback(now);}};
}

test('recovery opens connection after validation; closing cancels pending animation',async t=>{
  const {flow,host,calls}=fakeUi(t);await flow.open();
  assert.equal(host.title,'EMERGENCY CONNECTION');assert.equal(calls.length,1);
  assert.ok(flow.delay);host.close();assert.equal(flow.delay,null);assert.equal(flow.active,false);
});

test('recovery refuses premature access and skips replay when profile already completed',async t=>{
  const {flow,host,state}=fakeUi(t);state.compromised=false;
  await flow.open();assert.equal(flow.delay,null);
  assert.ok(host.panel.children.some(n=>n.textContent.includes('Complete local security verification')));
  state.compromised=true;state.recoveryComplete=true;
  await flow.open();assert.equal(host.title,'EXECUTIVE DEFEATED');assert.equal(flow.runner,null);
});

test('runner frames and jumps make no calls; failure/restart and successful completion use one write',async t=>{
  const ui=fakeUi(t),{flow,host,calls}=ui;
  flow.active=true;flow.generation=host.generation;flow.start();
  for(let now=0;flow.runner.phase==='running';now+=17)ui.frame(now);
  assert.equal(flow.runner.phase,'failed');assert.equal(calls.length,0);
  flow.start();assert.equal(flow.runner.elapsed,0);assert.equal(ui.frames.size,1);
  let prevented=0;flow.handleKey({key:' ',type:'keydown',preventDefault(){prevented++;}});
  assert.equal(prevented,1);
  for(let now=0;ui.frames.size&&now<20000;now+=17){
    if(runnerObstacles(flow.runner).some(o=>o.x>115&&o.x<205))flow.jump();
    ui.frame(now);
  }
  await Promise.resolve();await Promise.resolve();
  assert.deepEqual(calls.map(c=>c.method),['complete']);
  assert.equal(host.title,'EXECUTIVE DEFEATED');assert.equal(flow.runner,null);
  await flow.complete();assert.equal(calls.length,1);
});

test('failed completion can retry without replay and never sends parallel writes',async t=>{
  const {flow,host,calls}=fakeUi(t);
  flow.active=true;flow.generation=host.generation;flow.runner={phase:'won'};flow.message={};
  host.scene.presence.client.mutation=async()=>{throw new Error('offline');};
  await flow.complete();assert.ok(flow.retryButton);assert.equal(flow.saving,false);
  let resolve;host.scene.presence.client.mutation=()=>{calls.push('write');return new Promise(done=>{resolve=done;});};
  const pending=flow.complete();await flow.complete();assert.equal(calls.length,1);
  resolve({recoveryComplete:true});await pending;assert.equal(host.title,'EXECUTIVE DEFEATED');
});

test('closing during completion cannot reopen the terminal, and stale status is ignored',async t=>{
  const {flow,host}=fakeUi(t);let resolve;
  host.scene.presence.client.query=()=>new Promise(done=>{resolve=done;});
  const pending=flow.open();host.close();resolve({recoveryComplete:true});await pending;
  assert.notEqual(host.title,'EXECUTIVE DEFEATED');
  host.active=true;flow.active=true;flow.generation=host.generation;flow.runner={phase:'won'};flow.message={};
  host.scene.presence.client.mutation=()=>new Promise(done=>{resolve=done;});
  const completion=flow.complete();host.close();resolve({recoveryComplete:true});await completion;
  assert.notEqual(host.title,'EXECUTIVE DEFEATED');assert.equal(flow.active,false);
});

test('lost session during recovery uses existing character selection recovery',async t=>{
  const {flow,host}=fakeUi(t);
  host.scene.presence.client.query=async()=>{throw new Error('CHARACTER_SESSION_LOST');};
  await flow.open();assert.equal(host.active,false);assert.equal(host.lost,true);assert.equal(flow.active,false);
});
