import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence } from '../src/multiplayer/Presence.js';
import { interpolate } from '../src/multiplayer/RemotePlayers.js';
import {
  isPresenceActive,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_SYNC_INTERVAL_MS,
  PRESENCE_TIMEOUT_MS,
} from '../src/multiplayer/presencePolicy.js';
import { cleanup, heartbeat, update } from '../convex/players.js';

test('room subscription filters self and stale players; old callbacks cannot repopulate a new room', async () => {
  const callbacks=[],calls=[];
  const client={onUpdate: (_fn,args,cb)=>{callbacks.push(cb);return ()=>{};}, mutation: async (_fn,args)=>calls.push(args)};
  const presence=new Presence(client,{players:{}},{playerId:'me',name:'Me'});
  let rows;
  try {
    presence.enter('school',()=>({x:1,y:2,direction:'down'}),r=>rows=r);
    callbacks[0](['me','other','expired'].map(playerId=>({
      playerId,room:'school',lastSeen:playerId==='expired'?Date.now()-PRESENCE_TIMEOUT_MS-1:Date.now(),
    })));
    assert.deepEqual(rows.map(p=>p.playerId),['other']);
    await Promise.resolve();
    presence.enter('outside',()=>({x:10,y:20,direction:'left'}),r=>rows=r);
    callbacks[0]([{playerId:'ghost',room:'school',lastSeen:Date.now()}]);
    assert.deepEqual(rows,[]);
    assert.equal(calls.at(-1).room,'outside');
  } finally { presence.leave(); }
});

test('remote visibility uses server heartbeat time when the local computer clock is ahead',()=>{
  const callbacks=[];
  const client={onUpdate:(_fn,_args,callback)=>{callbacks.push(callback);return()=>{};},mutation:async()=>{}};
  const presence=new Presence(client,{players:{}},{playerId:'me',name:'Me'});
  const realNow=Date.now,serverNow=1_800_000_000_000;
  let rows;
  try{
    Date.now=()=>serverNow+5*60_000;
    presence.enter('school',()=>({x:0,y:0,direction:'down'}),value=>rows=value);
    callbacks[0]([
      {playerId:'me',room:'school',lastSeen:serverNow},
      {playerId:'other',room:'school',lastSeen:serverNow-2_000},
      {playerId:'expired',room:'school',lastSeen:serverNow-PRESENCE_TIMEOUT_MS-1},
    ]);
    assert.deepEqual(rows.map(player=>player.playerId),['other']);
  }finally{Date.now=realNow;presence.leave();}
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
    assert.equal(1000/PRESENCE_SYNC_INTERVAL_MS,8);
  } finally { presence.leave(); }
});

function stationaryPresence(mutation) {
  const identity={playerId:'me',characterId:'me',name:'Me',sessionId:'session-123456789'};
  const state={...identity,room:'school',x:10,y:20,direction:'down'};
  const presence=new Presence({mutation},{players:{update:'update',heartbeat:'heartbeat'}},identity);
  presence.active={room:'school',snapshot:()=>({x:10,y:20,direction:'down'}),previous:JSON.stringify(state),sentAt:0};
  return presence;
}

test('a stationary player sends a lightweight heartbeat instead of full position state',async()=>{
  const calls=[];const presence=stationaryPresence(async(fn,args)=>calls.push({fn,args}));
  await presence.send(PRESENCE_HEARTBEAT_MS-1);
  assert.equal(calls.length,0);
  await presence.send(PRESENCE_HEARTBEAT_MS);
  assert.deepEqual(calls,[{fn:'heartbeat',args:{characterId:'me',sessionId:'session-123456789'}}]);
});

test('explicit release waits for an in-flight presence update before deleting the session',async()=>{
  const calls=[];let finishUpdate;
  const updateFinished=new Promise(resolve=>{finishUpdate=resolve;});
  const client={mutation:async(fn,args)=>{
    calls.push({fn,args});
    if(fn==='update')await updateFinished;
    return fn==='release'?{released:true}:undefined;
  }};
  const identity={playerId:'felipe',characterId:'felipe',name:'Felipe',sessionId:'session-123456789'};
  const presence=new Presence(client,{players:{update:'update',heartbeat:'heartbeat',release:'release'}},identity);
  presence.active={room:'school',snapshot:()=>({x:1,y:2,direction:'down',activeCharacterItem:null}),previous:'',sentAt:0,receive() {}};
  const sending=presence.send();
  await Promise.resolve();
  const releasing=presence.release();
  assert.deepEqual(calls.map(call=>call.fn),['update']);
  finishUpdate();
  await Promise.all([sending,releasing]);
  assert.deepEqual(calls.map(call=>call.fn),['update','release']);
  assert.equal(presence.identity,null);
});

test('a simulated background tab remains active while heartbeats continue',async()=>{
  let serverLastSeen=0;
  const presence=stationaryPresence(async(fn)=>{assert.equal(fn,'heartbeat');serverLastSeen=presence.active.sentAt+PRESENCE_HEARTBEAT_MS;});
  for(let now=PRESENCE_HEARTBEAT_MS;now<=PRESENCE_TIMEOUT_MS*2;now+=PRESENCE_HEARTBEAT_MS){
    await presence.send(now);serverLastSeen=now;
    assert.equal(isPresenceActive(serverLastSeen,now+PRESENCE_HEARTBEAT_MS),true);
  }
});

test('cleanup removes a session that has missed the configured timeout',async()=>{
  const deleted=[];let cutoff;
  const stale={_id:'stale-player',lastSeen:Date.now()-PRESENCE_TIMEOUT_MS-1};
  const ctx={db:{
    query:()=>({withIndex:(_name,build)=>{
      build({lt:(_field,value)=>{cutoff=value;return {};}});return {take:async()=>[stale]};
    }}),
    delete:async id=>deleted.push(id),
  }};
  const before=Date.now()-PRESENCE_TIMEOUT_MS;
  await cleanup._handler(ctx);
  const after=Date.now()-PRESENCE_TIMEOUT_MS;
  assert.ok(cutoff>=before&&cutoff<=after);
  assert.deepEqual(deleted,['stale-player']);
});

test('an old session cannot update or heartbeat after another session owns the character',async()=>{
  const current={_id:'player',playerId:'michael',characterId:'michael',sessionId:'new-session-123456',lastSeen:Date.now()};
  const ctx={db:{query:()=>({withIndex:()=>({unique:async()=>current})}),patch:async()=>assert.fail('must not patch')}};
  const state={playerId:'michael',characterId:'michael',sessionId:'old-session-123456',name:'Ignored',room:'school',x:1,y:2,direction:'down'};
  await assert.rejects(update._handler(ctx,state),/CHARACTER_SESSION_LOST/);
  await assert.rejects(heartbeat._handler(ctx,{characterId:'michael',sessionId:state.sessionId}),/CHARACTER_SESSION_LOST/);
});

test('presence rejects an exclusive visual item for any character other than its owner',async()=>{
  const current={_id:'player',playerId:'sarina',characterId:'sarina',sessionId:'session-123456789',lastSeen:Date.now()};
  const ctx={db:{query:()=>({withIndex:()=>({unique:async()=>current})}),patch:async()=>assert.fail('must not patch')}};
  await assert.rejects(update._handler(ctx,{
    playerId:'sarina',characterId:'sarina',sessionId:current.sessionId,name:'Sarina',room:'school',x:1,y:2,direction:'down',
    activeCharacterItem:'lung_crusher_3000',
  }),/Invalid active character item/);
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
  const active={room:'school',rows:[{
    playerId:'other',room:'school',lastSeen:Date.now()-PRESENCE_TIMEOUT_MS-1,
  }],receive:r=>rows=r};
  presence.active=active;
  presence.deliver(active);
  assert.deepEqual(rows,[]);
});
