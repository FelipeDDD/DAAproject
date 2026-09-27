import test from 'node:test';
import assert from 'node:assert/strict';
import { Presence } from '../src/multiplayer/Presence.js';
import {
  isPresenceActive,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_POSITION_THRESHOLD_PX,
  PRESENCE_SYNC_INTERVAL_MS,
  PRESENCE_TIMEOUT_MS,
  TERMINAL_PRESENCE_HEARTBEAT_MS,
} from '../src/multiplayer/presencePolicy.js';
import { cleanup, heartbeat, update } from '../convex/players.js';

for(const operation of ['heartbeat','update']){
  test(`${operation} rejects expired reservations even while their rows remain`,async t=>{
    const lastSeen=1_000_000;let now=lastSeen+PRESENCE_TIMEOUT_MS-1,patches=0;
    t.mock.method(Date,'now',()=>now);
    const row={_id:'player',playerId:'felipe',characterId:'felipe',sessionId:'session-123456789',lastSeen};
    const ctx={db:{query:()=>({withIndex:()=>({unique:async()=>row})}),patch:async()=>{patches++;}}};
    const args=operation==='heartbeat'
      ? {characterId:row.characterId,sessionId:row.sessionId}
      : {playerId:row.playerId,characterId:row.characterId,sessionId:row.sessionId,
        name:'Felipe',room:'school',x:1,y:2,direction:'down'};
    const handler=operation==='heartbeat'?heartbeat:update;
    await handler._handler(ctx,args);assert.equal(patches,1);
    // The stub retains the original lastSeen so the exact expiry boundary is exercised.
    for(now=lastSeen+PRESENCE_TIMEOUT_MS;now<=lastSeen+PRESENCE_TIMEOUT_MS+1;now++){
      await assert.rejects(handler._handler(ctx,args),/CHARACTER_SESSION_LOST/);
    }
    assert.equal(patches,1);assert.equal(row.lastSeen,lastSeen);
  });
}

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
  const originalSetInterval=globalThis.setInterval;
  let scheduledInterval;
  globalThis.setInterval=(callback,interval)=>{
    scheduledInterval=interval;
    return originalSetInterval(callback,interval);
  };
  const client={onUpdate:()=>()=>{},mutation:()=>{count++;return new Promise(r=>finish=r);}};
  const presence=new Presence(client,{players:{}},{playerId:'me',name:'Me'});
  try {
    presence.enter('school',()=>({x:0,y:0,direction:'down'}),()=>{});
    for(let i=0;i<120;i++)presence.send();
    assert.equal(count,1);
    finish(); await Promise.resolve();
    await presence.send();
    assert.equal(count,1);
    assert.equal(scheduledInterval,PRESENCE_SYNC_INTERVAL_MS);
  } finally { presence.leave();globalThis.setInterval=originalSetInterval; }
});

function stationaryPresence(mutation) {
  const identity={playerId:'me',characterId:'me',name:'Me',sessionId:'session-123456789'};
  const state={...identity,room:'school',x:10,y:20,direction:'down'};
  const presence=new Presence({mutation},{players:{update:'update',heartbeat:'heartbeat'}},identity);
  presence.active={room:'school',snapshot:()=>({x:10,y:20,direction:'down'}),
    previous:JSON.stringify(state),previousState:state,sentAt:0};
  return presence;
}

test('tiny movement accumulates from the last sent position and direction changes still send',async()=>{
  const calls=[];let x=10,direction='down';
  const presence=stationaryPresence(async(fn,args)=>calls.push({fn,args}));
  presence.active.snapshot=()=>({x,y:20,direction});
  x+=PRESENCE_POSITION_THRESHOLD_PX/4;
  await presence.send(200);
  x+=PRESENCE_POSITION_THRESHOLD_PX/4;
  await presence.send(400);
  assert.equal(calls.length,0);
  x+=PRESENCE_POSITION_THRESHOLD_PX/2;
  await presence.send(600);
  assert.equal(calls.length,1);
  assert.equal(calls[0].fn,'update');
  assert.equal(calls[0].args.x,x);
  direction='left';
  await presence.send(800);
  assert.equal(calls[1].args.direction,'left');
  x+=0.1;
  await presence.send(PRESENCE_HEARTBEAT_MS+800);
  assert.equal(calls[2].fn,'heartbeat');
});

test('a stationary player sends a lightweight heartbeat instead of full position state',async()=>{
  const calls=[];const presence=stationaryPresence(async(fn,args)=>calls.push({fn,args}));
  await presence.send(PRESENCE_HEARTBEAT_MS-1);
  assert.equal(calls.length,0);
  await presence.send(PRESENCE_HEARTBEAT_MS);
  assert.deepEqual(calls,[{fn:'heartbeat',args:{characterId:'me',sessionId:'session-123456789'}}]);
});

test('normal and terminal presence modes use 10s and 20s heartbeats without restarting timers or subscriptions',async()=>{
  const calls=[];let intervalCount=0,subscriptionCount=0,intervalCallback;
  const realInterval=globalThis.setInterval;
  globalThis.setInterval=(callback,interval)=>{intervalCount++;intervalCallback=callback;assert.equal(interval,PRESENCE_SYNC_INTERVAL_MS);return {id:intervalCount};};
  const client={
    onUpdate(){subscriptionCount++;return ()=>{};},
    async mutation(fn,args){calls.push({fn,args});},
  };
  const presence=new Presence(client,{players:{inRoom:'inRoom',update:'update',heartbeat:'heartbeat'}},
    {playerId:'me',characterId:'me',name:'Me',sessionId:'session-123456789'});
  try{
    presence.enter('school',()=>({x:10,y:20,direction:'down'}),()=>{});
    await new Promise(resolve=>setImmediate(resolve));
    const active=presence.active,subscription=presence.unsubscribe;
    const timer=presence.timer;
    assert.equal(active.nextHeartbeatAt,active.sentAt+PRESENCE_HEARTBEAT_MS);
    await presence.send(active.nextHeartbeatAt-1);assert.equal(calls.length,1);
    await presence.send(active.nextHeartbeatAt);assert.equal(calls.at(-1).fn,'heartbeat');

    const terminalStart=active.sentAt;
    assert.equal(presence.setTerminalMode(true,terminalStart),true);
    assert.equal(presence.heartbeatIntervalMs,TERMINAL_PRESENCE_HEARTBEAT_MS);
    await presence.send(terminalStart+TERMINAL_PRESENCE_HEARTBEAT_MS-1);
    assert.equal(calls.length,2);
    await presence.send(terminalStart+TERMINAL_PRESENCE_HEARTBEAT_MS);
    assert.equal(calls.at(-1).fn,'heartbeat');
    assert.equal(presence.setTerminalMode(true,Date.now()),false);

    const closeTime=active.sentAt+100;
    assert.equal(presence.setTerminalMode(false,closeTime),true);
    assert.equal(presence.heartbeatIntervalMs,PRESENCE_HEARTBEAT_MS);
    await presence.send(closeTime+PRESENCE_HEARTBEAT_MS-1);assert.equal(calls.length,3);
    await presence.send(closeTime+PRESENCE_HEARTBEAT_MS);assert.equal(calls.at(-1).fn,'heartbeat');
    for(let cycle=0;cycle<5;cycle++){
      presence.setTerminalMode(true,closeTime+cycle*100);
      presence.setTerminalMode(false,closeTime+cycle*100+1);
    }
    assert.equal(intervalCount,1);assert.equal(subscriptionCount,1);
    assert.equal(presence.timer,timer);assert.equal(presence.unsubscribe,subscription);
    assert.equal(typeof intervalCallback,'function');
  }finally{presence.leave();globalThis.setInterval=realInterval;}
});

test('movement still sends updates in normal and terminal modes; terminal state-only changes use heartbeat',async()=>{
  const calls=[];let x=10,direction='down';
  const presence=stationaryPresence(async(fn,args)=>calls.push({fn,args}));
  presence.active.snapshot=()=>({x,y:20,direction});
  x+=PRESENCE_POSITION_THRESHOLD_PX;
  await presence.send(100);assert.equal(calls[0].fn,'update');
  presence.setTerminalMode(true,200);
  x+=PRESENCE_POSITION_THRESHOLD_PX;
  await presence.send(300);assert.equal(calls[1].fn,'update');
  direction='left';
  await presence.send(400);assert.equal(calls.length,2);
  await presence.send(presence.active.nextHeartbeatAt);
  assert.equal(calls[2].fn,'heartbeat');
});

test('a failed presence request waits before retrying instead of flooding Convex',async()=>{
  let calls=0;
  const presence=stationaryPresence(async()=>{calls++;throw new Error('Temporary network failure');});
  presence.fail=()=>{};
  await presence.send(Date.now());
  for(let attempt=0;attempt<80;attempt++)await presence.send(Date.now());
  assert.equal(calls,1);
  await presence.send(presence.active.retryAt);
  assert.equal(calls,2);
});

test('a lost character session stops sending presence requests',async()=>{
  let calls=0;
  const presence=stationaryPresence(async()=>{calls++;throw new Error('CHARACTER_SESSION_LOST');});
  presence.active.receive=()=>{};
  presence.reportedError=true;
  await presence.send(Date.now());
  assert.equal(presence.active,null);
  await presence.send(Date.now()+PRESENCE_HEARTBEAT_MS);
  assert.equal(calls,1);
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
    query:()=>({withIndex:(name,build)=>{
      if(name==='by_presenceMode_lease')return {take:async()=>[]};
      build({lte:(_field,value)=>{cutoff=value;return {};}});
      return {filter:()=>({take:async()=>[stale]})};
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
