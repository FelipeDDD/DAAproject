import test from 'node:test';
import assert from 'node:assert/strict';
import { enterTerminal,exitTerminal,heartbeat,update,availability } from '../convex/players.js';
import { Presence } from '../src/multiplayer/Presence.js';
import { TerminalOverlayController } from '../src/terminal/TerminalOverlayController.js';
import { TERMINAL_LEASE_MS,isPlayerActive } from '../src/multiplayer/presencePolicy.js';

function fixture(){
  const row={_id:'p',playerId:'felipe',characterId:'felipe',sessionId:'session-123456789',lastSeen:100_000,
    room:'school',x:10,y:20,direction:'left',equippedSkin:'remastered'};
  const ctx={db:{query:()=>({collect:async()=>[row],withIndex:()=>({unique:async()=>row})}),
    patch:async(_id,patch)=>Object.assign(row,patch)}};
  const args={characterId:row.characterId,sessionId:row.sessionId};return {row,ctx,args};
}

test('terminal entry preserves visual state; exit clears ten-minute lease and renews playing presence',async t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);const {row,ctx,args}=fixture();
  const result=await enterTerminal._handler(ctx,args);
  assert.equal(result.terminalLeaseExpiresAt,now+TERMINAL_LEASE_MS);
  assert.equal(row.room,'school');assert.equal(row.x,10);assert.equal(row.direction,'left');assert.equal(row.equippedSkin,'remastered');
  now+=70_000;
  assert.equal(isPlayerActive((await availability._handler(ctx,{})).players[0]),true);
  await heartbeat._handler(ctx,args);
  await update._handler(ctx,{...args,playerId:'felipe',name:'Felipe',room:'outside',x:999,y:999,direction:'down'});
  assert.equal(row.x,10);assert.equal(row.lastSeen,100_000);assert.equal(row.presenceMode,'terminal');
  const exit=await exitTerminal._handler(ctx,args);assert.equal(exit.ok,true);
  assert.equal(row.presenceMode,'playing');assert.equal(row.terminalLeaseExpiresAt,undefined);assert.equal(row.lastSeen,now);
});

test('invalid ownership, expired playing entry and expired terminal exit cannot revive the session',async t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);const {row,ctx,args}=fixture();
  await assert.rejects(enterTerminal._handler(ctx,{...args,sessionId:'wrong'}),/CHARACTER_SESSION_LOST/);
  now=160_000;await assert.rejects(enterTerminal._handler(ctx,args),/CHARACTER_SESSION_LOST/);
  row.lastSeen=now;await enterTerminal._handler(ctx,args);now=row.terminalLeaseExpiresAt;
  for(const mutation of [exitTerminal,heartbeat])await assert.rejects(mutation._handler(ctx,args),/CHARACTER_SESSION_LOST/);
  await assert.rejects(update._handler(ctx,{...args,playerId:'felipe',name:'Felipe',room:'school',x:10,y:20,direction:'left'}),/CHARACTER_SESSION_LOST/);
  assert.equal(row.presenceMode,'terminal');assert.equal(row.lastSeen,160_000);
});

test('Presence lease keeps timer, suspends room subscription, and restores normal cadence',async t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);const {row,ctx,args}=fixture();
  const calls=[];const api={players:{enterTerminal:'enter',exitTerminal:'exit',update:'update',heartbeat:'heartbeat'}};
  let receiveSnapshot;
  const p=new Presence({onUpdate(_fn,_args,callback){receiveSnapshot=callback;return()=>{};},async mutation(name,values){calls.push(name);return ({enter:enterTerminal,exit:exitTerminal,update,heartbeat}[name])._handler(ctx,values);}},api,
    {...args,playerId:'felipe',name:'Felipe'});
  const snapshot={x:10,y:20,direction:'left',equippedSkin:'remastered'};
  p.active={room:'school',snapshot:()=>snapshot,previousState:{playerId:'felipe',characterId:'felipe',name:'Felipe',sessionId:args.sessionId,room:'school',...snapshot},sentAt:now,receive(){}};
  p.active.previous=JSON.stringify(p.active.previousState);
  p.timer={id:1};p.unsubscribe=()=>{};const timer=p.timer,subscription=p.unsubscribe;
  await p.enterTerminal();now+=70_000;await p.send();assert.deepEqual(calls,['enter']);
  let remote=[];p.active.receive=rows=>remote=rows;p.active.rows=[{...row,playerId:'remote'}];p.deliver(p.active);assert.equal(remote.length,0);
  const exiting=p.exitTerminal();for(let i=0;i<5;i++)await Promise.resolve();receiveSnapshot([{...row,playerId:'remote'}]);await exiting;
  await p.send();assert.deepEqual(calls,['enter','exit']);
  now+=10_000;await p.send();assert.equal(calls.at(-1),'heartbeat');
  assert.equal(p.timer,timer);assert.notEqual(p.unsubscribe,subscription);assert.equal(remote.length,1);
});

test('failed entry leaves overlay hidden and failed exit does not restore controls',async()=>{
  const overlay=Object.assign(Object.create(TerminalOverlayController.prototype),{
    root:{hidden:true},scene:{player:{setVelocity(){}},hint:{},presence:{async enterTerminal(){throw new Error('entry failed');}}},
  });
  await overlay.open({});assert.equal(overlay.active,false);assert.equal(overlay.root.hidden,true);
  overlay.isOpen=true;overlay.scene.presence.exitTerminal=async()=>{throw new Error('CHARACTER_SESSION_LOST');};
  let restored=false;overlay.restoreVisual=()=>{restored=true;};
  await overlay.close();assert.equal(restored,false);assert.equal(overlay.isOpen,true);
});

test('expired exit routes through Presence session-loss recovery',async()=>{
  const p=new Presence({async mutation(){throw new Error('CHARACTER_SESSION_LOST');}}, {players:{exitTerminal:'exit'}},
    {characterId:'felipe',sessionId:'session-123456789'});
  p.terminalLease={terminalLeaseExpiresAt:0};let lost=false;
  p.fail=error=>{assert.match(String(error),/CHARACTER_SESSION_LOST/);lost=true;p.leave();};
  await assert.rejects(p.exitTerminal(),/CHARACTER_SESSION_LOST/);assert.equal(lost,true);assert.equal(p.active,null);
});
