import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence } from '../src/multiplayer/Presence.js';
import { enterStationary,enterTerminal,exitTerminal,heartbeat,renewStationary,update } from '../convex/players.js';
import { PRESENCE_HEARTBEAT_MS,STATIONARY_IDLE_DWELL_MS,STATIONARY_LEASE_MS,STATIONARY_RENEWAL_MARGIN_MS,STATIONARY_RENEWAL_RETRY_MS } from '../src/multiplayer/presencePolicy.js';

function fixture(t){
  let now=100_000;
  t.mock.method(Date,'now',()=>now);
  const row={_id:'player',playerId:'felipe',characterId:'felipe',sessionId:'session-123456789',
    lastSeen:now,room:'school',x:10,y:20,direction:'down',equippedSkin:'remastered',activeCharacterItem:null};
  const ctx={db:{query:()=>({withIndex:()=>({unique:async()=>row})}),patch:async(_id,patch)=>Object.assign(row,patch)}};
  const handlers={enterStationary,enterTerminal,exitTerminal,heartbeat,renewStationary,update};
  const calls=[];
  const snapshot={x:10,y:20,direction:'down',equippedSkin:'remastered',activeCharacterItem:null};
  const identity={playerId:row.playerId,characterId:row.characterId,sessionId:row.sessionId,name:'Felipe'};
  const p=new Presence({async mutation(name,args){calls.push(name);return handlers[name]._handler(ctx,args);}},
    {players:Object.fromEntries(Object.keys(handlers).map(name=>[name,name]))},identity);
  const state={playerId:identity.playerId,characterId:identity.characterId,name:identity.name,
    sessionId:identity.sessionId,room:'school',...snapshot};
  p.active={room:'school',snapshot:()=>snapshot,previousState:state,previous:JSON.stringify(state),sentAt:now,
    idleSince:now,receive(){}};
  return {row,ctx,p,calls,snapshot,args:{characterId:row.characterId,sessionId:row.sessionId},
    setNow:value=>now=value,get now(){return now;}};
}

test('20s dwell enters once; acknowledged five-minute lease suppresses heartbeat ticks',async t=>{
  const f=fixture(t);f.setNow(f.now+STATIONARY_IDLE_DWELL_MS-1);await f.p.send();
  assert.deepEqual(f.calls,['heartbeat']);assert.equal(f.p.stationaryLease,undefined);
  f.setNow(f.now+1);await f.p.send();
  assert.deepEqual(f.calls,['heartbeat','enterStationary']);
  assert.equal(f.row.stationaryLeaseExpiresAt,f.now+STATIONARY_LEASE_MS);
  assert.equal(f.row.equippedSkin,'remastered');assert.equal(f.row.x,10);
  for(let i=0;i<100;i++){f.setNow(f.now+200);await f.p.send();}
  assert.equal(f.calls.length,2);
});

test('movement, direction and appearance reset dwell; room update atomically exits stationary',async t=>{
  const f=fixture(t);
  for(const change of [()=>f.snapshot.x+=2,()=>f.snapshot.direction='left',()=>f.snapshot.equippedSkin='classic']){
    f.setNow(f.now+19_000);change();await f.p.send();
    f.setNow(f.now+19_999);await f.p.send();assert.equal(f.row.presenceMode,'playing');
  }
  f.setNow(f.now+1);await f.p.send();assert.equal(f.row.presenceMode,'stationary');
  const before=f.calls.length;f.p.active.room='outside';await f.p.send();
  assert.deepEqual(f.calls.slice(before),['update']);assert.equal(f.row.room,'outside');
  assert.equal(f.row.presenceMode,'playing');assert.equal(f.row.stationaryLeaseExpiresAt,undefined);
});

test('stationary movement exits with one update; expired backend actions cannot revive lease',async t=>{
  const f=fixture(t);f.setNow(f.now+20_000);await f.p.send();
  f.snapshot.x+=2;await f.p.send();assert.deepEqual(f.calls,['enterStationary','update']);
  assert.equal(f.row.presenceMode,'playing');assert.equal(f.p.stationaryLease,null);
  f.setNow(f.now+20_000);await f.p.send();f.setNow(f.row.stationaryLeaseExpiresAt);
  const state={...f.args,playerId:'felipe',name:'Felipe',room:'school',...f.snapshot};
  for(const [handler,args] of [[update,state],[heartbeat,f.args],[enterStationary,f.args]]){
    await assert.rejects(handler._handler(f.ctx,args),/CHARACTER_SESSION_LOST/);
  }
  f.p.reportedError=true;await f.p.send();assert.equal(f.p.active,null);
});

test('pending entry is not acknowledged early or duplicated; subsequent movement wins',async t=>{
  const f=fixture(t);let resolve;
  f.p.client.mutation=async(name,args)=>{f.calls.push(name);if(name==='enterStationary')await new Promise(r=>resolve=r);return ({enterStationary,update}[name])._handler(f.ctx,args);};
  f.setNow(f.now+20_000);const pending=f.p.send();
  assert.equal(f.p.stationaryLease,undefined);
  for(let i=0;i<10;i++)await f.p.send();assert.deepEqual(f.calls,['enterStationary']);
  f.snapshot.x+=2;resolve();await pending;await f.p.send();
  assert.deepEqual(f.calls,['enterStationary','update']);assert.equal(f.row.presenceMode,'playing');
});

test('failed entry retains playing behavior and backs off without suppressing updates',async t=>{
  const f=fixture(t);const original=f.p.client.mutation;f.p.fail=()=>{};
  f.p.client.mutation=async(name,args)=>{if(name==='enterStationary'){f.calls.push(name);throw new Error('offline');}return original(name,args);};
  f.setNow(f.now+20_000);await f.p.send();assert.equal(f.p.stationaryLease,undefined);
  for(let i=0;i<10;i++)await f.p.send();assert.equal(f.calls.length,1);
  f.setNow(f.p.active.retryAt);f.snapshot.x+=2;await f.p.send();
  assert.equal(f.calls.at(-1),'update');assert.equal(f.row.presenceMode,'playing');
});

test('stationary entry rejects wrong ownership, terminal mode, and repeat entry; terminal replaces lease',async t=>{
  const f=fixture(t);
  await assert.rejects(enterStationary._handler(f.ctx,{...f.args,sessionId:'wrong'}),/CHARACTER_SESSION_LOST/);
  f.setNow(f.now+20_000);await f.p.send();
  await assert.rejects(enterStationary._handler(f.ctx,f.args),/PLAYER_NOT_PLAYING/);
  await enterTerminal._handler(f.ctx,f.args);
  assert.equal(f.row.presenceMode,'terminal');assert.equal(f.row.stationaryLeaseExpiresAt,undefined);
  await assert.rejects(enterStationary._handler(f.ctx,f.args),/PLAYER_NOT_PLAYING/);
  await exitTerminal._handler(f.ctx,f.args);assert.equal(f.row.presenceMode,'playing');
  assert.equal(f.row.terminalLeaseExpiresAt,undefined);
});

test('backend renewal extends a live stationary lease from server time and preserves player state',async t=>{
  const f=fixture(t);f.setNow(200_000);f.row.presenceMode='stationary';f.row.stationaryLeaseExpiresAt=240_000;
  const before={...f.row};const result=await renewStationary._handler(f.ctx,f.args);
  assert.equal(result.stationaryLeaseExpiresAt,200_000+STATIONARY_LEASE_MS);
  assert.equal(f.row.stationaryLeaseExpiresAt,result.stationaryLeaseExpiresAt);
  for(const field of ['lastSeen','room','x','y','direction','equippedSkin','activeCharacterItem'])assert.equal(f.row[field],before[field]);
});

test('renewal happens at four minutes, only once, then schedules from the returned expiry',async t=>{
  const f=fixture(t);f.setNow(f.now+STATIONARY_IDLE_DWELL_MS);await f.p.send();
  const firstExpiry=f.row.stationaryLeaseExpiresAt;
  f.setNow(firstExpiry-STATIONARY_RENEWAL_MARGIN_MS-1);await f.p.send();
  assert.equal(f.calls.filter(name=>name==='renewStationary').length,0);
  f.setNow(firstExpiry-STATIONARY_RENEWAL_MARGIN_MS);await f.p.send();
  assert.equal(f.calls.filter(name=>name==='renewStationary').length,1);
  const nextRenewAt=f.row.stationaryLeaseExpiresAt-STATIONARY_RENEWAL_MARGIN_MS;
  for(let i=0;i<100;i++)await f.p.send(nextRenewAt-1);
  assert.equal(f.calls.filter(name=>name==='renewStationary').length,1);
  await f.p.send(nextRenewAt);assert.equal(f.calls.filter(name=>name==='renewStationary').length,2);
});

test('expired lease and wrong mode or owner cannot renew',async t=>{
  const f=fixture(t);f.row.presenceMode='stationary';f.row.stationaryLeaseExpiresAt=f.now;
  for(const args of [f.args,{...f.args,sessionId:'old-session'}])
    await assert.rejects(renewStationary._handler(f.ctx,args),/CHARACTER_SESSION_LOST/);
  f.row.stationaryLeaseExpiresAt=f.now+1000;f.row.presenceMode='playing';
  await assert.rejects(renewStationary._handler(f.ctx,f.args),/CHARACTER_SESSION_LOST/);
});

test('movement wins during a pending renewal and terminal entry waits then replaces it',async t=>{
  const f=fixture(t);f.setNow(f.now+20_000);await f.p.send();
  let resolveRenew;const renewal=new Promise(resolve=>{resolveRenew=resolve;});
  const original=f.p.client.mutation.bind(f.p.client);
  f.p.client.mutation=async(name,args)=>{if(name==='renewStationary'){f.calls.push(name);return renewal;}return original(name,args);};
  const due=f.row.stationaryLeaseExpiresAt-STATIONARY_RENEWAL_MARGIN_MS;f.setNow(due);
  const sending=f.p.send();assert.equal(f.calls.at(-1),'renewStationary');
  f.snapshot.x+=2;await f.p.send();assert.equal(f.row.presenceMode,'stationary');
  resolveRenew(await renewStationary._handler(f.ctx,f.args));await sending;
  await f.p.send();assert.equal(f.row.presenceMode,'playing');assert.equal(f.row.stationaryLeaseExpiresAt,undefined);

  f.snapshot.x=10;f.setNow(f.now+20_000);await f.p.send();
  f.setNow(f.now+20_000);await f.p.send();
  const terminalRenewal=new Promise(resolve=>{resolveRenew=resolve;});
  f.p.client.mutation=async(name,args)=>{if(name==='renewStationary'){f.calls.push(name);return terminalRenewal;}return original(name,args);};
  f.setNow(f.row.stationaryLeaseExpiresAt-STATIONARY_RENEWAL_MARGIN_MS);
  const renewing=f.p.send();
  const entering=f.p.enterTerminal();
  resolveRenew(await renewStationary._handler(f.ctx,f.args));await renewing;
  await entering;assert.equal(f.row.presenceMode,'terminal');assert.equal(f.row.stationaryLeaseExpiresAt,undefined);
  await exitTerminal._handler(f.ctx,f.args);assert.equal(f.row.presenceMode,'playing');
});

test('transient renewal errors retry once after a bounded delay before expiry',async t=>{
  const f=fixture(t);f.setNow(f.now+STATIONARY_IDLE_DWELL_MS);await f.p.send();
  const expiry=f.row.stationaryLeaseExpiresAt;let attempts=0;
  const original=f.p.client.mutation.bind(f.p.client);
  f.p.client.mutation=async(name,args)=>{
    if(name==='renewStationary'){attempts++;if(attempts===1)throw new Error('temporary network error');}
    return original(name,args);
  };
  f.setNow(expiry-STATIONARY_RENEWAL_MARGIN_MS);await f.p.send();
  assert.equal(attempts,1);const retryAt=f.p.stationaryLease.renewAt;
  assert.equal(retryAt,f.now+STATIONARY_RENEWAL_RETRY_MS);
  for(let i=0;i<100;i++)await f.p.send(retryAt-1);
  assert.equal(attempts,1);await f.p.send(retryAt);assert.equal(attempts,2);
});

test('stationary lease expiry recovers and playing heartbeat resumes after movement',async t=>{
  const f=fixture(t);f.setNow(f.now+STATIONARY_IDLE_DWELL_MS);await f.p.send();
  f.snapshot.x+=2;await f.p.send();assert.equal(f.row.presenceMode,'playing');
  f.setNow(f.now+PRESENCE_HEARTBEAT_MS);await f.p.send();assert.equal(f.calls.at(-1),'heartbeat');

  const expired=fixture(t);expired.setNow(expired.now+20_000);await expired.p.send();
  expired.setNow(expired.row.stationaryLeaseExpiresAt);expired.p.reportedError=true;await expired.p.send();
  assert.equal(expired.p.active,null);
});

test('one 200ms timer remains local after acknowledgement; real room entry clears backend lease',async t=>{
  const f=fixture(t);let tick,timers=0;
  t.mock.method(globalThis,'setInterval',(callback,delay)=>{
    assert.equal(delay,200);tick=callback;timers++;return undefined;
  });
  f.p.client.onUpdate=()=>()=>{};
  f.p.enter('school',()=>f.snapshot,()=>{});await f.p.pendingSend;
  f.setNow(f.now+20_000);tick();await f.p.pendingSend;
  assert.equal(f.row.presenceMode,'stationary');const calls=f.calls.length;
  for(let i=0;i<100;i++){f.setNow(f.now+200);tick();}
  assert.equal(f.calls.length,calls);assert.equal(timers,1);
  f.p.enter('outside',()=>f.snapshot,()=>{});await f.p.pendingSend;
  assert.equal(f.row.room,'outside');assert.equal(f.row.presenceMode,'playing');
  assert.equal(f.row.stationaryLeaseExpiresAt,undefined);f.p.leave();
});
