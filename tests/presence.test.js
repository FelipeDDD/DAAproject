import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence, SYNC_INTERVAL_MS } from '../src/multiplayer/Presence.js';
import { interpolate } from '../src/multiplayer/RemotePlayers.js';

test('room subscription filters self and stale players; old callbacks cannot repopulate a new room', async () => {
  const callbacks=[],calls=[];
  const client={onUpdate: (_fn,args,cb)=>{callbacks.push(cb);return ()=>{};}, mutation: async (_fn,args)=>calls.push(args)};
  const presence=new Presence(client,{players:{}},{playerId:'me',name:'Me'});
  let rows;
  try {
    presence.enter('school',()=>({x:1,y:2,direction:'down'}),r=>rows=r);
    callbacks[0](['me','other','expired'].map(playerId=>({playerId,room:'school',lastSeen:playerId==='expired'?0:Date.now()})));
    assert.deepEqual(rows.map(p=>p.playerId),['other']);
    await Promise.resolve();
    presence.enter('outside',()=>({x:10,y:20,direction:'left'}),r=>rows=r);
    callbacks[0]([{playerId:'ghost',room:'school',lastSeen:Date.now()}]);
    assert.deepEqual(rows,[]);
    assert.equal(calls.at(-1).room,'outside');
  } finally { presence.leave(); }
});

test('network latency never queues a position per frame, and stationary heartbeats are reduced', async () => {
  let finish, count=0;
  const client={onUpdate:()=>()=>{},mutation:()=>{count++;return new Promise(r=>finish=r);}};
  const presence=new Presence(client,{players:{}},{playerId:'me',name:'Me'});
  try {
    presence.enter('school',()=>({x:0,y:0,direction:'down'}),()=>{});
    for(let i=0;i<120;i++)presence.send();
    assert.equal(count,1);
    finish(); await Promise.resolve();
    await presence.send();
    assert.equal(count,1);
    assert.equal(1000/SYNC_INTERVAL_MS,8);
  } finally { presence.leave(); }
});

test('remote smoothing converges without overshoot and is independent of frame rate', () => {
  const once=interpolate(0,100,100);
  const twice=interpolate(interpolate(0,100,50),100,50);
  assert.ok(once>0&&once<100);
  assert.ok(Math.abs(once-twice)<1e-9);
});

test('cached remote expires even without a further realtime callback', () => {
  let rows;
  const presence=new Presence({}, {}, {playerId:'self'});
  const active={room:'school',rows:[{playerId:'other',room:'school',lastSeen:Date.now()-16_000}],receive:r=>rows=r};
  presence.active=active;
  presence.deliver(active);
  assert.deepEqual(rows,[]);
});
