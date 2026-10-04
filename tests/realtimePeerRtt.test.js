import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { PeerRtt } from '../src/realtime/PeerRtt.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { validClientMessage } from '../src/realtime/realtimeMessages.js';
import { Benchmark } from '../src/realtime/lab/Benchmark.js';
import { PulseExperiment } from '../src/realtime/lab/PulseExperiment.js';

function fixture(){
  let at=100;const sent=[],samples=[];
  const tracker=new PeerRtt({now:()=>at});tracker.onSample(s=>samples.push(s));
  const send=(type,payload)=>{sent.push({type,payload});return true;};
  const pong=(senderId,pingId,target='sender')=>({type:'peer-pong',senderId,payload:{peerId:target,pingId},sentAt:9e12,serverTime:1});
  return {tracker,sent,samples,send,pong,setAt:n=>at=n};
}

test('peer RTT uses only sender monotonic time; rejects unknown IDs, wrong targets/peers and duplicate pongs',()=>{
  const f=fixture();f.tracker.addPeer('a');f.tracker.addPeer('b');f.tracker.probe(f.send);
  const ping=f.sent[0].payload.pingId;f.setAt(340);
  assert.equal(f.tracker.receive(f.pong('b',ping),'sender',f.send),false);
  assert.equal(f.tracker.receive(f.pong('a',ping,'another-client'),'sender',f.send),false);
  assert.equal(f.tracker.receive(f.pong('a','unknown'),'sender',f.send),false);
  assert.equal(f.tracker.receive(f.pong('a',ping),'sender',f.send),true);
  assert.equal(f.samples[0].rttMs,240);assert.equal(f.samples[0].startedAt,100);
  assert.equal(f.tracker.receive(f.pong('a',ping),'sender',f.send),false);
  assert.equal(f.samples.length,1);
});

test('receiver answers immediately once, and ignores duplicate pings/nonmembers/wrong targets',()=>{
  const f=fixture();f.tracker.addPeer('sender');
  const ping={type:'peer-ping',senderId:'sender',payload:{peerId:'receiver',pingId:'one'}};
  assert.equal(f.tracker.receive(ping,'receiver',f.send),true);
  assert.deepEqual(f.sent,[{type:'peer-pong',payload:{peerId:'sender',pingId:'one'}}]);
  assert.equal(f.tracker.receive(ping,'receiver',f.send),false);
  assert.equal(f.tracker.receive({...ping,senderId:'intruder'},'receiver',f.send),false);
  assert.equal(f.tracker.receive(ping,'another-receiver',f.send),false);
});

test('late/expired pongs cannot replace newer samples; disconnect/reset discards outstanding probes',()=>{
  const f=fixture();f.tracker.addPeer('a');f.tracker.probe(f.send);const first=f.sent.at(-1).payload.pingId;
  f.setAt(1100);f.tracker.probe(f.send);const second=f.sent.at(-1).payload.pingId;
  f.setAt(1200);assert.equal(f.tracker.receive(f.pong('a',second),'sender',f.send),true);
  assert.equal(f.tracker.receive(f.pong('a',first),'sender',f.send),false);
  f.tracker.probe(f.send);const expired=f.sent.at(-1).payload.pingId;
  f.setAt(11200);assert.equal(f.tracker.receive(f.pong('a',expired),'sender',f.send),false);
  f.tracker.probe(f.send);const disconnected=f.sent.at(-1).payload.pingId;
  f.tracker.removePeer('a');f.tracker.addPeer('a');
  assert.equal(f.tracker.receive(f.pong('a',disconnected),'sender',f.send),false);
  f.tracker.probe(f.send);const old=f.sent.at(-1).payload.pingId;f.tracker.reset();f.tracker.addPeer('a');
  assert.equal(f.tracker.receive(f.pong('a',old),'sender',f.send),false);
  assert.equal(f.tracker.pending.size,0);
});

test('multiple peers have independent current/average/variation; absent samples are null and storage is bounded',()=>{
  const f=fixture();assert.deepEqual(f.tracker.getStats(),[]);f.tracker.addPeer('a');f.tracker.addPeer('b');
  assert.deepEqual(f.tracker.getStats()[0],{peerId:'a',count:0,current:null,average:null,jitter:null});
  for(let i=0;i<40;i++){
    f.setAt(100+i*1000);f.tracker.probe(f.send);
    for(const [peerId,delay] of [['a',100],['b',300]]){
      const ping=f.sent.slice(-2).find(m=>m.payload.peerId===peerId).payload.pingId;
      f.setAt(100+i*1000+delay);f.tracker.receive(f.pong(peerId,ping),'sender',f.send);
    }
  }
  const stats=f.tracker.getStats();assert.equal(stats[0].count,30);assert.equal(stats[0].average,100);
  assert.equal(stats[1].average,300);assert.equal(stats[0].jitter,0);assert.equal(f.tracker.pending.size,0);
  f.tracker.probe(()=>false);assert.equal(f.tracker.pending.size,0);
});

test('protocol validates peer target and correlation IDs',()=>{
  const message={type:'peer-ping',roomId:'test',seq:1,sentAt:0,channel:'reliable',payload:{peerId:'peer',pingId:'ping-1'}};
  assert.equal(validClientMessage(message),true);assert.equal(validClientMessage({...message,type:'peer-pong'}),true);
  assert.equal(validClientMessage({...message,payload:{peerId:'../invalid',pingId:'ping-1'}}),false);
  assert.equal(validClientMessage({...message,payload:{peerId:'peer'}}),false);
});

test('benchmark exports real per-peer distributions, no pre-benchmark samples, null missing metrics, and clean repeated runs',()=>{
  let now=1000,id=0;const timers=new Map();
  const pulse=new PulseExperiment({shoot(){},sendControl(){},visibility:()=> 'visible',getSettings:()=>({simulation:{}}),getClientId:()=> 'sender',
    schedule:(fn,ms)=>{timers.set(++id,fn);return id;},cancel:id=>timers.delete(id)});
  const benchmark=new Benchmark({pulse,getPeers:()=>['a','b'],getMetadata:()=>({}),now:()=>now});
  try{
    benchmark.start();
    benchmark.recordPeerRtt({peerId:'a',startedAt:999,rttMs:999});
    benchmark.recordPeerRtt({peerId:'unknown',startedAt:1000,rttMs:999});
    for(const rttMs of [100,200,300])benchmark.recordPeerRtt({peerId:'a',startedAt:1000,rttMs});
    const r=JSON.parse(JSON.stringify(benchmark.report()));
    assert.deepEqual(r.peerRtt[0],{peerId:'a',count:3,average:200,p50:200,p95:290,p99:298,min:100,max:300});
    assert.deepEqual(r.peerRtt[1],{peerId:'b',count:0,average:null,p50:null,p95:null,p99:null,min:null,max:null});
    benchmark.stop();assert.equal(benchmark.report().runs[0].peerRtt[0].count,3);
    benchmark.recordPeerRtt({peerId:'a',startedAt:1000,rttMs:700});assert.equal(benchmark.report().peerRtt[0].count,3);
    now=2000;benchmark.start();benchmark.recordPeerRtt({peerId:'a',startedAt:1000,rttMs:999});
    assert.equal(benchmark.report().peerRtt[0].count,0);
  }finally{benchmark.dispose();pulse.reset();}
  assert.equal(timers.size,0);
});

async function waitFor(predicate){const deadline=Date.now()+3000;while(!predicate()){
  assert.ok(Date.now()<deadline,'peer RTT timeout');await new Promise(resolve=>setTimeout(resolve,5));
}}
test('real relay targets only same-room receiver; peer pong traverses receiver and fake sender cannot satisfy probes',async()=>{
  const server=createRealtimeServer({port:0,heartbeatMs:60000});await server.ready;const clients=[];
  async function connect(roomId){
    const transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId,WebSocketImpl:WebSocket});
    const messages=[];transport.onMessage(m=>{messages.push(m);if(m.type==='welcome')transport.sendReliable('join-room',{});});
    clients.push(transport);await transport.connect();await waitFor(()=>messages.some(m=>m.type==='room-state'));
    return {transport,messages};
  }
  try{
    const a=await connect('test'),b=await connect('test'),c=await connect('test'),other=await connect('other');
    await waitFor(()=>a.transport.peerRtt.peers.size===2);a.transport.probePeers();
    await waitFor(()=>a.transport.getStats().peerRtt.every(p=>p.count===1));
    assert.equal(b.messages.filter(m=>m.type==='peer-ping').length,1);
    assert.equal(c.messages.filter(m=>m.type==='peer-ping').length,1);
    assert.equal(other.messages.some(m=>m.type==='peer-ping'),false);
    for(const p of a.transport.getStats().peerRtt)assert.ok(p.current>=0);
    a.transport.sendReliable('peer-ping',{peerId:other.transport.clientId,pingId:'wrong-room'});
    // Forge a declared sender; relay must replace it with c's real identity.
    c.transport.socket.send(JSON.stringify({type:'peer-pong',senderId:b.transport.clientId,roomId:'test',seq:1000,
      sentAt:0,channel:'reliable',payload:{peerId:a.transport.clientId,pingId:'made-up'}}));
    await waitFor(()=>a.messages.some(m=>m.type==='peer-pong'&&m.payload.pingId==='made-up'));
    assert.equal(a.messages.find(m=>m.payload.pingId==='made-up').senderId,c.transport.clientId);
    assert.equal(other.messages.some(m=>m.type==='peer-ping'),false);
    assert.ok(a.transport.getStats().peerRtt.every(p=>p.count===1));
    const bId=b.transport.clientId;b.transport.disconnect();
    await waitFor(()=>!a.transport.peerRtt.peers.has(bId));assert.equal(a.transport.getStats().peerRtt.length,1);
    a.transport.probe();await waitFor(()=>a.transport.getStats().rtt!==null);
    assert.equal(a.transport.getStats().peerRtt[0].count,1,'Server RTT is independent');
  }finally{for(const client of clients)client.disconnect();await server.close();}
});
