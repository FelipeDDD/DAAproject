import test from 'node:test';
import assert from 'node:assert/strict';
import { DoorSync } from '../src/multiplayer/DoorSync.js';
import { TerminalOverlayController } from '../src/terminal/TerminalOverlayController.js';

function doorFixture(){
  const callbacks=[];let subscribeCount=0,unsubscribeCount=0,fail;
  const states=[{doorId:'office',open:false,locked:false}];
  const door={id:'office',open:null,locked:null,applySharedState(state){this.open=state.open;this.locked=state.locked;}};
  const presence={api:{doors:{inRoom:'doors'}},client:{onUpdate(_query,_args,onUpdate,onError){
    subscribeCount++;callbacks.push(onUpdate);fail=onError;let active=true;
    return()=>{if(active){active=false;unsubscribeCount++;}};
  }},fail(){}};
  const sync=new DoorSync(presence,'school',[door],()=>({}));
  const emit=(index,patch)=>callbacks[index]([{...states[0],...patch}]);
  return {sync,door,emit,emitCurrent:(patch)=>callbacks.at(-1)([{...states[0],...patch}]),counts:()=>({subscribeCount,unsubscribeCount}),fail:()=>fail};
}
function controller(scene){return Object.assign(Object.create(TerminalOverlayController.prototype),{
  scene,disposed:false,terminalSubscriptionsSuspended:false,doorSyncSuspended:false,
});}

test('DoorSync pauses after entry; callbacks from its old subscription cannot alter doors',async()=>{
  const f=doorFixture();f.emit(0,{open:false});assert.equal(f.sync.ready,true);
  assert.equal(f.sync.suspend(),true);assert.equal(f.sync.ready,false);
  f.emit(0,{open:true});assert.equal(f.door.open,false);
});

test('DoorSync waits for the authoritative resubscription snapshot before resolving',async()=>{
  const f=doorFixture();f.emit(0,{open:false});f.sync.suspend();
  let resolved=false;const resync=f.sync.resume().then(()=>{resolved=true;});
  assert.deepEqual(f.counts(),{subscribeCount:2,unsubscribeCount:1});
  f.emit(0,{open:true});assert.equal(f.door.open,false);assert.equal(resolved,false);
  f.emitCurrent({open:true,locked:true});await resync;
  assert.equal(f.door.open,true);assert.equal(f.door.locked,true);assert.equal(resolved,true);
  assert.equal(f.sync.ready,true);
});

test('terminal exit waits for door snapshot before restoring emote and quiz subscriptions',async()=>{
  const f=doorFixture();f.emit(0,{open:false});f.sync.suspend();
  let emoteResumes=0,quizResumes=0,exited=false;
  const c=controller({presence:{async exitTerminal(){exited=true;}},doorSync:f.sync,
    emoteSync:{resume(){emoteResumes++;}},quiz:{resumeCurrent(){quizResumes++;}}});
  c.terminalSubscriptionsSuspended=true;c.doorSyncSuspended=true;
  const exit=c.exitTerminalMode();await Promise.resolve();
  assert.equal(exited,true);assert.equal(emoteResumes,0);assert.equal(quizResumes,0);
  f.emit(1,{open:true});await exit;
  assert.equal(f.door.open,true);assert.equal(emoteResumes,1);assert.equal(quizResumes,1);
});

test('failed entry leaves DoorSync active and failed or expired exit does not resubscribe',async()=>{
  const f=doorFixture();f.emit(0,{open:false});
  const c=controller({presence:{async enterTerminal(){throw Error('entry failed');},async exitTerminal(){throw Error('CHARACTER_SESSION_LOST');}},
    doorSync:f.sync,emoteSync:{suspend(){assert.fail('suspended after failed entry');},resume(){assert.fail('resumed after failed exit');}},
    quiz:{suspendCurrent(){},resumeCurrent(){}}});
  await assert.rejects(c.enterTerminalMode(),/entry failed/);
  assert.equal(f.sync.suspended,false);assert.deepEqual(f.counts(),{subscribeCount:1,unsubscribeCount:0});
  c.terminalSubscriptionsSuspended=true;c.doorSyncSuspended=true;
  await assert.rejects(c.exitTerminalMode(),/CHARACTER_SESSION_LOST/);
  assert.deepEqual(f.counts(),{subscribeCount:1,unsubscribeCount:0});
});

test('repeated cycles keep one active DoorSync subscription and never duplicate the chain',async()=>{
  const f=doorFixture();f.emit(0,{open:false});
  for(let i=0;i<4;i++){
    f.sync.suspend();const resumed=f.sync.resume();f.emit(i,{open:true});f.emitCurrent({open:i%2===0});await resumed;
    assert.equal(f.sync.ready,true);
  }
  assert.deepEqual(f.counts(),{subscribeCount:5,unsubscribeCount:4});
  assert.equal(f.sync.unsubscribe!==null,true);
});
