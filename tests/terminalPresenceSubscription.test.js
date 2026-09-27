import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence } from '../src/multiplayer/Presence.js';
import { TERMINAL_LEASE_MS } from '../src/multiplayer/presencePolicy.js';
import { TerminalOverlayController } from '../src/terminal/TerminalOverlayController.js';

function fixture(t){
  const now=100_000;t.mock.method(Date,'now',()=>now);
  t.mock.method(globalThis,'setInterval',()=>1);t.mock.method(globalThis,'clearInterval',()=>{});
  const callbacks=[],calls=[];let subscriptions=0,rows=[],failEntry=false,failExit=false;
  const client={onUpdate(_fn,_args,callback){subscriptions++;callbacks.push(callback);let active=true;return()=>{if(active){active=false;subscriptions--;}};},
    async mutation(fn){calls.push(fn);if(fn==='enter'){
      if(failEntry)throw Error('entry failed');return {serverNow:now,terminalLeaseExpiresAt:now+TERMINAL_LEASE_MS};
    }if(fn==='exit'&&failExit)throw Error('CHARACTER_SESSION_LOST');return {};}};
  const p=new Presence(client,{players:{inRoom:'room',update:'update',heartbeat:'heartbeat',enterTerminal:'enter',exitTerminal:'exit'}},
    {playerId:'me',characterId:'felipe',sessionId:'session',name:'Me'});
  p.enter('school',()=>({x:0,y:0,direction:'down'}),value=>rows=value);
  callbacks[0]([{playerId:'other',room:'school',lastSeen:now,x:10,y:20}]);
  t.after(()=>p.leave());
  return {p,callbacks,calls,get subscriptions(){return subscriptions;},get rows(){return rows;},set failEntry(v){failEntry=v;},set failExit(v){failExit=v;},now};
}
async function settle(){for(let i=0;i<5;i++)await Promise.resolve();}

test('terminal entry unsubscribes without releasing row; exit awaits fresh snapshot before returning',async t=>{
  const f=fixture(t);await settle();await f.p.enterTerminal();
  assert.equal(f.subscriptions,0);assert.equal(f.p.unsubscribe,null);assert.deepEqual(f.rows,[]);
  const before=f.calls.length;await f.p.send(f.now+70_000);assert.equal(f.calls.length,before);
  f.callbacks[0]([{playerId:'stale',room:'school',lastSeen:f.now}]);assert.deepEqual(f.rows,[]);
  let finished=false;const exiting=f.p.exitTerminal().then(()=>finished=true);await settle();
  assert.equal(f.subscriptions,1);assert.equal(finished,false);
  f.callbacks[0]([{playerId:'stale',room:'school',lastSeen:f.now}]);assert.deepEqual(f.rows,[]);
  f.callbacks[1]([{playerId:'fresh',room:'school',lastSeen:f.now,x:90,y:100}]);await exiting;
  assert.equal(finished,true);assert.equal(f.rows[0].playerId,'fresh');assert.equal(f.rows[0].x,90);
  assert.equal(f.calls.includes('release'),false);
});

test('failed entry keeps subscription; expired exit never restores it',async t=>{
  const f=fixture(t);await settle();f.failEntry=true;
  await assert.rejects(f.p.enterTerminal(),/entry failed/);assert.equal(f.subscriptions,1);
  assert.equal(f.rows[0].playerId,'other');f.failEntry=false;await f.p.enterTerminal();
  f.failExit=true;f.p.reportedError=true;
  await assert.rejects(f.p.exitTerminal(),/CHARACTER_SESSION_LOST/);assert.equal(f.subscriptions,0);
  assert.equal(f.callbacks.length,1);assert.equal(f.p.active,null);
});

test('repeated cycles maintain one gameplay subscription and zero terminal subscriptions',async t=>{
  const f=fixture(t);await settle();
  for(let i=0;i<4;i++){
    await f.p.enterTerminal();assert.equal(f.subscriptions,0);
    const exit=f.p.exitTerminal();await settle();assert.equal(f.subscriptions,1);
    f.callbacks.at(-1)([]);await exit;assert.equal(f.subscriptions,1);
  }
  assert.equal(f.callbacks.length,5);
  await f.p.send(f.now+10_000);assert.equal(f.calls.at(-1),'heartbeat');
});

test('other clients see terminal players using lease deadline even with stale lastSeen',t=>{
  const f=fixture(t);
  f.callbacks[0]([{playerId:'terminal',room:'school',presenceMode:'terminal',lastSeen:0,terminalLeaseExpiresAt:f.now+1000},
    {playerId:'expired',room:'school',presenceMode:'terminal',lastSeen:f.now,terminalLeaseExpiresAt:f.now}]);
  assert.deepEqual(f.rows.map(r=>r.playerId),['terminal']);assert.equal(f.rows[0].presenceMode,'terminal');
});

test('terminal close keeps gameplay locked until remote snapshot has been delivered',async t=>{
  const f=fixture(t);await settle();await f.p.enterTerminal();
  const keyboard={enabled:false};
  const c=Object.assign(Object.create(TerminalOverlayController.prototype),{
    scene:{presence:f.p,input:{keyboard}},isOpen:true,isTransitioning:false,disposed:false,
    saved:{scrollX:0,scrollY:0,zoom:1},frame:{style:{}},root:{focus(){}},surface:{style:{}},dimmer:{style:{}},
    async animate(){},updateOrigin(){return 'none';},async moveCamera(){},
    async restore(){assert.equal(f.rows[0].playerId,'fresh');keyboard.enabled=true;},
  });
  const closing=c.close();await settle();assert.equal(keyboard.enabled,false);
  f.callbacks.at(-1)([{playerId:'fresh',room:'school',lastSeen:f.now,x:30,y:40}]);
  await closing;assert.equal(keyboard.enabled,true);
});
