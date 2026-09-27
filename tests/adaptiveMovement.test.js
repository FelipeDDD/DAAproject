import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence } from '../src/multiplayer/Presence.js';
import { resolvedMovementState } from '../src/multiplayer/movementState.js';
import { update } from '../convex/players.js';
import { RemoteSnapshotBuffer, REMOTE_INTERPOLATION_DELAY_MS } from '../src/multiplayer/remoteMovement.js';

function fixture(t, adaptiveMovement=true) {
  let now=100_000;
  t.mock.method(Date,'now',()=>now);
  t.mock.timers.enable({apis:['setTimeout']});
  const calls=[];
  const state={x:0,y:0,direction:'right',equippedSkin:'classic',activeCharacterItem:null};
  const p=new Presence({mutation:async(fn,args)=>{
    calls.push({fn,args,time:now});
    return {serverNow:now,stationaryLeaseExpiresAt:now+300_000};
  }},{players:{update:'update',heartbeat:'heartbeat',enterStationary:'enterStationary'}},
  {playerId:'felipe',characterId:'felipe',sessionId:'session',name:'Felipe'},()=>{}, {adaptiveMovement});
  p.active={room:'school',snapshot:()=>state,receive(){},sentAt:0,previous:''};
  t.after(()=>p.leave());
  const step=async(ms,patch={})=>{
    now+=ms;Object.assign(state,patch);t.mock.timers.tick(ms);await p.pendingSend;await p.send(now);
  };
  const movement=(moving,vx=144,vy=0)=>{p.active.movement={moving,velocityX:moving?vx:0,velocityY:moving?vy:0};};
  return {p,calls,state,step,movement,advance(ms){now+=ms;t.mock.timers.tick(ms);}};
}

test('adaptive start/turn/velocity/stop/appearance/item/teleport events bypass cruise throttle',async t=>{
  const f=fixture(t);f.movement(false);await f.step(0);
  f.movement(true);await f.step(16,{x:2.3});
  assert.equal(f.calls.at(-1).args.moving,true);
  await f.step(100,{x:16});assert.equal(f.calls.length,2);
  await f.step(10,{direction:'up'});assert.equal(f.calls.length,3);
  f.movement(true,0,-144);await f.step(10,{y:-2});assert.equal(f.calls.length,4);
  f.movement(false);await f.step(10,{y:-3});
  assert.equal(f.calls.at(-1).args.moving,false);assert.equal(f.calls.at(-1).args.y,-3);
  await f.step(10,{equippedSkin:'remastered'});
  await f.step(10,{activeCharacterItem:'lung_crusher_3000'});
  await f.step(10,{x:500});assert.equal(f.calls.length,8);
});

test('cruise deadline fires at 300ms independently of the 200ms check',async t=>{
  const f=fixture(t);f.movement(true);await f.step(0);
  await f.step(200,{x:28.8});assert.equal(f.calls.length,1);
  f.state.x=43.2;f.advance(100);await f.p.pendingSend;await Promise.resolve();
  assert.equal(f.calls.length,2);assert.equal(f.calls[1].time-f.calls[0].time,300);
  await f.step(200,{x:72});assert.equal(f.calls.length,2);
  f.state.x=86.4;f.advance(100);await f.p.pendingSend;await Promise.resolve();
  assert.equal(f.calls[2].time-f.calls[1].time,300);
});

test('in-flight events coalesce behind one mutation and publish final collision stop',async t=>{
  const f=fixture(t);let resolve;
  f.p.client.mutation=async(fn,args)=>{f.calls.push({fn,args});await new Promise(r=>resolve=r);};
  f.movement(true);const first=f.p.send();
  f.state.x=5;f.movement(false);f.p.observeMovement(f.p.active.movement);
  assert.equal(f.calls.length,1);
  resolve();await first;await Promise.resolve();
  assert.equal(f.calls.length,2);assert.equal(f.calls[1].args.moving,false);
  assert.equal(f.calls[1].args.x,5);resolve();await f.p.pendingSend;
});

test('baseline keeps 200ms sends and omits experimental fields',async t=>{
  const f=fixture(t,false);f.movement(true);await f.step(0);
  await f.step(200,{x:28.8});assert.equal(f.calls.length,2);
  assert.equal(f.calls[1].args.moving,undefined);
});

test('explicit stop allows stationary dwell; terminal sends remain suppressed',async t=>{
  const f=fixture(t);f.movement(true);await f.step(0);
  f.movement(false);await f.step(16,{x:2.3});
  await f.step(20_000);assert.equal(f.calls.at(-1).fn,'enterStationary');
  const count=f.calls.length;await f.step(200);assert.equal(f.calls.length,count);
  f.p.terminalLease={clockOffset:0,terminalLeaseExpiresAt:1_000_000};
  f.movement(true);await f.step(200,{x:20});assert.equal(f.calls.length,count);
});

test('adaptive renderer uses 300ms delay and explicit stopped timeline',()=>{
  assert.equal(REMOTE_INTERPOLATION_DELAY_MS,300);
  const b=new RemoteSnapshotBuffer();
  b.push({x:0,y:0,moving:true,direction:'right'},0);
  b.push({x:43.2,y:0,moving:false,direction:'right'},300);
  assert.equal(b.sample(450).moving,true);
  assert.equal(b.sample(600).moving,false);
  b.push({x:43.2,y:0,moving:false,direction:'up'},400);
  assert.equal(b.sample(650).moving,false);
});

test('resolved wall stop ignores held input and frame duration jitter',()=>{
  const body={deltaX:()=>2.4,deltaY:()=>0,velocity:{x:144,y:0}};
  assert.deepEqual(resolvedMovementState(body),{moving:true,velocityX:144,velocityY:0});
  body.deltaX=()=>0;
  assert.deepEqual(resolvedMovementState(body),{moving:false,velocityX:0,velocityY:0});
  body.deltaX=()=>1;body.velocity.x=0;
  assert.equal(resolvedMovementState(body).moving,false);
});

test('movement metadata persists under existing ownership checks and legacy update clears it',async t=>{
  const now=100_000;t.mock.method(Date,'now',()=>now);
  const row={_id:'player',playerId:'felipe',characterId:'felipe',sessionId:'session',lastSeen:now};
  const ctx={db:{query:()=>({withIndex:()=>({unique:async()=>row})}),patch:async(_id,patch)=>Object.assign(row,patch)}};
  const args={playerId:'felipe',characterId:'felipe',sessionId:'session',name:'Felipe',room:'school',
    x:10,y:20,direction:'right',moving:true,velocityX:144,velocityY:0};
  await update._handler(ctx,args);assert.equal(row.moving,true);assert.equal(row.velocityX,144);
  await assert.rejects(update._handler(ctx,{...args,sessionId:'wrong'}),/CHARACTER_SESSION_LOST/);
  const {moving,velocityX,velocityY,...legacy}=args;
  await update._handler(ctx,legacy);assert.equal(row.moving,undefined);
});
