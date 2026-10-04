import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createRealtimeServer,rateAllowed } from '../scripts/realtime-server.mjs';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validClientMessage,validServerMessage,decodeMessage } from '../src/realtime/realtimeMessages.js';
import { NetworkSimulation } from '../src/realtime/lab/NetworkSimulation.js';
import { LabSnapshotBuffer,LabState } from '../src/realtime/lab/LabState.js';
import { RealtimeStats } from '../src/realtime/realtimeStats.js';
import { PulseExperiment } from '../src/realtime/lab/PulseExperiment.js';
import { Benchmark } from '../src/realtime/lab/Benchmark.js';

test('ten Stress 50 Hz benchmark runs exchange bounded raw samples over real WebSockets',async()=>{
  await withServer(async(_server,_url,connect)=>{
    const a=await connect(),b=await connect(),settings=()=>({simulation:{latencyMs:0,jitterMs:0,loss:0}});let shot=0;
    const sender=new PulseExperiment({getSettings:settings,getClientId:()=>a.transport.clientId,visibility:()=>'visible',
      sendControl:(type,payload)=>a.transport.sendReliable(type,payload),shoot:timing=>{
        const id=`${a.transport.clientId}-${++shot}`;sender.recordLocal(id,timing);
        a.transport.sendReliable('projectile-spawn',{...projectile(id),startedAt:Date.now(),pulse:timing});
      }});
    const receiver=new PulseExperiment({getSettings:settings,getClientId:()=>b.transport.clientId,visibility:()=>'visible',shoot(){},
      sendControl:(type,payload)=>b.transport.sendReliable(type,payload)});
    const offA=a.transport.onMessage(m=>sender.receive(m,performance.now()));
    const offB=b.transport.onMessage(m=>{receiver.receive(m,performance.now());if(m.type==='projectile-spawn')receiver.rendered(m.payload.id,performance.now());});
    const benchmark=new Benchmark({pulse:sender,getPeers:()=>[b.transport.clientId],getMetadata:()=>({transport:'websocket'}),
      config:{pauseBetweenRunsMs:5}});
    try{
      benchmark.start('stress50',10);await waitFor(()=>!benchmark.active,22000);
      const report=benchmark.report();assert.equal(report.benchmark.completedRuns,10);assert.equal(report.aggregate.totalShots,500);
      assert.equal(report.aggregate.receivedSamples,500);assert.equal(report.aggregate.missing,0);
      assert.equal(report.aggregate.missingPeerReports,0);assert.equal(report.aggregate.receiveToRender.count,500);
      assert.equal(report.aggregate.remoteArrivalIntervals.count,490);assert.equal(a.transport.getStats().rejected,0);
      assert.equal(b.transport.getStats().rejected,0);
    }finally{benchmark.dispose();sender.reset();receiver.reset();offA();offB();}
  });
});

const position=(x=10,sampleSeq=1)=>({x,y:20,vx:30,vy:0,sampleSeq});
const envelope=(type,payload={},seq=1,roomId='test')=>({type,payload,seq,roomId,sentAt:1000,channel:'unreliable'});
const projectile=(id='a-1')=>({id,x:10,y:20,vx:100,vy:0,startedAt:1000,ttlMs:1000});
async function waitFor(predicate,timeout=2000){const until=Date.now()+timeout;while(!predicate()){if(Date.now()>until)throw new Error('Test timeout');await new Promise(r=>setTimeout(r,5));}}
async function client(url,roomId='test'){
  const transport=new WebSocketTransport({url,roomId,WebSocketImpl:WebSocket,config:{reconnectMs:10,maxReconnectMs:30}});
  const messages=[];transport.onMessage(m=>{messages.push(m);if(m.type==='welcome')transport.sendReliable('join-room',{});});
  await transport.connect();await waitFor(()=>messages.some(m=>m.type==='room-state'));return {transport,messages};
}
async function withServer(fn,options={}){
  const server=createRealtimeServer({port:0,heartbeatMs:60000,...options});await server.ready;
  const url=`ws://127.0.0.1:${server.wss.address().port}`;const clients=[];
  try{await fn(server,url,async room=>{const c=await client(url,room);clients.push(c);return c;});}
  finally{for(const c of clients)c.transport.disconnect();await server.close();}
}

test('message validation rejects malformed, oversized, unknown types and bad payloads',()=>{
  assert.ok(validClientMessage(envelope('position',position())));
  assert.equal(decodeMessage('{',validClientMessage),null);
  assert.equal(decodeMessage('x'.repeat(8193),validClientMessage),null);
  for(const m of [envelope('execute',{}),envelope('position',{x:NaN}),envelope('position',position(),-1),envelope('join-room',{},1,'../secret')])assert.equal(validClientMessage(m),false);
  assert.equal(validServerMessage({type:'welcome',serverTime:1000,payload:{clientId:'server-id'}}),true);
});

test('two room clients receive server-authored identity and reliable/unreliable events; another room is isolated',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect(),b=await connect(),other=await connect('other');
    a.transport.sendUnreliable('position',position());
    a.transport.sendReliable('projectile-spawn',projectile(a.transport.clientId+'-1'));
    await waitFor(()=>b.messages.some(m=>m.type==='projectile-spawn'));
    assert.equal(b.messages.find(m=>m.type==='position').senderId,a.transport.clientId);
    assert.equal(b.messages.find(m=>m.type==='position').payload.x,10);
    assert.equal(b.messages.find(m=>m.type==='projectile-spawn').channel,'reliable');
    assert.equal(other.messages.some(m=>m.type==='position'||m.type==='projectile-spawn'),false);
    const aId=a.transport.clientId;a.transport.disconnect();await waitFor(()=>!server.clients.has(aId));
    await waitFor(()=>b.messages.some(m=>m.type==='peer-left'&&m.payload.clientId===aId));
    assert.equal(server.rooms.get('test').size,1);
  });
});

test('server ignores stale position samples and forged sender IDs',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect(),b=await connect();
    a.transport.socket.send(JSON.stringify({...envelope('position',position(20,2),100),senderId:'forged'}));
    a.transport.socket.send(JSON.stringify(envelope('position',position(10,1),101)));
    await waitFor(()=>b.messages.some(m=>m.type==='position'));
    await new Promise(r=>setTimeout(r,20));
    const rows=b.messages.filter(m=>m.type==='position');assert.equal(rows.length,1);assert.equal(rows[0].senderId,a.transport.clientId);
    assert.equal([...server.clients.values()].find(c=>c.id===a.transport.clientId).position.x,20);
  });
});

test('room departure, membership validation and projectile ownership cannot be forged',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect(),b=await connect();const id=a.transport.clientId;
    a.transport.sendReliable('leave-room',{});await waitFor(()=>server.clients.get(id).roomId===null);
    a.transport.sendUnreliable('position',position());await waitFor(()=>!server.clients.has(id));
    a.transport.disconnect();assert.ok(b.messages.some(m=>m.type==='peer-left'));
    b.transport.sendReliable('projectile-destroy',{id:'other-player-1'});
    const bId=b.transport.clientId;await waitFor(()=>!server.clients.has(bId));b.transport.disconnect();
  });
});

test('server safely closes malformed and oversized clients',async()=>{
  await withServer(async(server,url)=>{
    for(const payload of ['{','x'.repeat(9000)]){
      const ws=new WebSocket(url);ws.on('error',()=>{});await new Promise(resolve=>ws.once('open',resolve));
      const closed=new Promise(resolve=>ws.once('close',resolve));ws.send(payload);await closed;
    }
    await waitFor(()=>server.clients.size===0);
  });
});

test('rate window resets and excess messages cause server rejection',async()=>{
  const c={windowAt:0,count:0};assert.ok(rateAllowed(c,0,2));assert.ok(rateAllowed(c,50,2));assert.equal(rateAllowed(c,100,2),false);assert.ok(rateAllowed(c,1000,2));
  await withServer(async(server,url,connect)=>{
    const a=await connect();const id=a.transport.clientId;
    for(let i=0;i<8;i++)a.transport.sendUnreliable('position',position(i,i));
    await waitFor(()=>!server.clients.has(id));a.transport.disconnect();
  },{maxMessagesPerSecond:4});
});

test('heartbeat terminates dead peers and cleans room roster',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect();const id=a.transport.clientId;server.clients.get(id).alive=false;server.sweep();
    assert.equal(server.clients.has(id),false);assert.equal(server.rooms.has('test'),false);a.transport.disconnect();
  });
});

test('reconnect creates one fresh identity and rejoins once; repeated connect is idempotent',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect();const oldId=a.transport.clientId;const joins=a.messages.filter(m=>m.type==='room-state').length;
    server.clients.get(oldId).ws.terminate();
    await waitFor(()=>a.transport.clientId&&a.transport.clientId!==oldId&&a.messages.filter(m=>m.type==='room-state').length>joins);
    await Promise.all([a.transport.connect(),a.transport.connect()]);assert.equal(server.clients.size,1);assert.equal(server.rooms.get('test').size,1);
    assert.equal(a.messages.filter(m=>m.type==='room-state').length,joins+1);
  });
});

test('RTT probe yields measured RTT/jitter/rates without calling Convex',async()=>{
  await withServer(async(server,url,connect)=>{const a=await connect();a.transport.probe();await waitFor(()=>a.transport.getStats().rtt!==null);
    const stats=a.transport.getStats();assert.ok(stats.rtt>=0);assert.ok(stats.sentPerSecond>=2);assert.ok(stats.receivedBytesPerSecond>0);
  });
  let now=0;const stats=new RealtimeStats(()=>now);stats.record('sent',10);stats.recordRtt(50,0);stats.recordRtt(70,0);
  assert.equal(stats.get().averageRtt,60);assert.equal(stats.get().jitter,1.25);now=1001;assert.equal(stats.get().sentPerSecond,0);
});

test('interpolation is linear, raw mode snaps, stale samples fail and underrun holds',()=>{
  const b=new LabSnapshotBuffer();assert.ok(b.push(position(0),1,0));assert.ok(b.push(position(100),2,100));
  assert.equal(b.sample(150,100).x,50);assert.equal(b.sample(150,100,false).x,100);
  assert.equal(b.push(position(1),1,200),false);assert.equal(b.sample(300,100).x,100);
});

test('lab loss/delay/jitter operate on application messages only and queued work is cancellable',()=>{
  const scheduled=[],cancelled=[];let random=.75,calls=0;
  const sim=new NetworkSimulation({random:()=>random,schedule:(fn,delay)=>{const id=scheduled.length;scheduled.push({fn,delay});return id;},cancel:id=>cancelled.push(id)});
  sim.configure({latencyMs:100,jitterMs:40,loss:.1});sim.deliver('position',()=>calls++);assert.equal(scheduled[0].delay,120);assert.equal(calls,0);
  scheduled[0].fn();assert.equal(calls,1);random=.01;assert.equal(sim.deliver('position',()=>calls++),false);assert.equal(sim.dropped,1);
  sim.deliver('welcome',()=>calls++);assert.equal(calls,2);random=.75;sim.deliver('projectile-spawn',()=>calls++);sim.clear();assert.deepEqual(cancelled,[1]);
});

test('projectiles simulate deterministic timestamped motion, ignore duplicates and expire/destroy',()=>{
  const model=new LabState();const p=projectile();assert.ok(model.spawn(p,'a',1000));assert.equal(model.spawn(p,'a',1100),false);
  assert.equal(model.projectileSamples(1500)[0].x,60);assert.equal(model.projectileSamples(2000).length,0);
  const next=projectile('a-2');assert.ok(model.spawn(next,'a',1000));model.receive({type:'projectile-destroy',payload:{id:'a-2'},senderId:'a'},0,1200);
  assert.equal(model.projectiles.size,0);assert.equal(model.spawn(next,'a',1300),false);
});

test('peer removal and reconnect reset ignore delayed state/projectiles; numbered event detects staleness',()=>{
  const model=new LabState();model.addPeer('a');model.receive({type:'test-event',payload:{value:2},senderId:'a'},0,1000);
  model.receive({type:'test-event',payload:{value:1},senderId:'a'},0,1000);assert.equal(model.lastReceivedTest,2);assert.equal(model.stale,1);
  model.removePeer('a');model.receive({type:'position',payload:position(),seq:1,senderId:'a'},0,1000);
  model.receive({type:'projectile-spawn',payload:projectile(),senderId:'a'},0,1000);assert.equal(model.remotes.size,0);assert.equal(model.projectiles.size,0);
  model.reset();assert.equal(model.stale,0);assert.equal(model.testSequences.size,0);
});

test('real WebSocket peers preserve pulse timing metadata and relay the completed receiver summary',async()=>{
  await withServer(async(server,url,connect)=>{
    const a=await connect(),b=await connect();const settings=()=>({simulation:{latencyMs:0,jitterMs:0,loss:0}});
    let sender;
    const receiver=new PulseExperiment({shoot:()=>{},sendControl:(t,p)=>b.transport.sendReliable(t,p),getSettings:settings,getClientId:()=>b.transport.clientId,visibility:()=> 'visible'});
    sender=new PulseExperiment({makeId:()=> 'real-stream',getSettings:settings,getClientId:()=>a.transport.clientId,visibility:()=> 'visible',
      sendControl:(t,p)=>a.transport.sendReliable(t,p),shoot:p=>{
        const id=a.transport.clientId+'-'+p.sequence;sender.recordLocal(id,p);p.sentAt=performance.now();sender.sent(id,p.sentAt);
        a.transport.sendReliable('projectile-spawn',{...projectile(id),startedAt:Date.now(),pulse:p});
      }});
    const offA=a.transport.onMessage(m=>sender.receive(m,performance.now()));
    const offB=b.transport.onMessage(m=>{receiver.receive(m,performance.now());if(m.type==='projectile-spawn')receiver.rendered(m.payload.id,performance.now());});
    try{
      sender.start(50,10);await waitFor(()=>sender.reports.size===1,3500);
      const report=[...sender.reports.values()][0];assert.equal(report.sampleCount,10);assert.equal(report.missingSequences,0);
      assert.equal(report.receiveToRenderMs.count,10);assert.ok(report.intervalsMs.average>0);
      assert.equal(b.messages.filter(m=>m.type==='projectile-spawn').length,10);
      assert.equal(b.messages.find(m=>m.type==='projectile-spawn').payload.pulse.runId,'real-stream');
    }finally{sender.reset();receiver.reset();offA();offB();}
  });
});
