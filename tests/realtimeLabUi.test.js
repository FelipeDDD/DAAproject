import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { WebSocket } from 'ws';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { REALTIME_CONFIG as config } from '../src/realtime/config.js';
import { NetworkSimulation } from '../src/realtime/lab/NetworkSimulation.js';
import { LabState } from '../src/realtime/lab/LabState.js';
import { PulseExperiment } from '../src/realtime/lab/PulseExperiment.js';
import { PulseGenerator } from '../src/realtime/lab/PulseGenerator.js';
import { Benchmark,browserName } from '../src/realtime/lab/Benchmark.js';

// Exercise the actual page bootstrap and button handlers without a visual browser.
function page(createRealtimeTransport,{now=()=>performance.now(),storage=new Map()}={}){
  const html=readFileSync(new URL('../tools/realtime-lab/index.html',import.meta.url),'utf8');
  const elements=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],{
    value:'',checked:false,style:{},classList:{values:new Set(),add(value){this.values.add(value);},remove(value){this.values.delete(value);},contains(value){return this.values.has(value);}},addEventListener(type,handler){this[type]=handler;},
    setAttribute(){},focus(){},select(){},getContext(){return new Proxy({}, {get:()=>()=>{}});}
  }]));
  const timers=new Set(),documentListeners=new Map();let frame,pulseInstance;
  const document={visibilityState:'visible',getElementById:id=>elements.get(id),querySelector:s=>elements.get(s.slice(1)),
    addEventListener(type,handler){documentListeners.set(type,handler);}};
  const source=readFileSync(new URL('../src/realtime/lab/main.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env.DEV','true').replaceAll('import.meta.env.VITE_REALTIME_URL','undefined');
  runInNewContext(source,{config,createRealtimeTransport,NetworkSimulation,LabState,
    PulseExperiment:class extends PulseExperiment{constructor(options){super({...options,visibility:()=>document.visibilityState});pulseInstance=this;}},Benchmark,browserName,
    document,
    window:{addEventListener(){}},navigator:{userAgent:'UI test browser'},performance:{now},URL,
    localStorage:storage instanceof Map?{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}:storage,
    setInterval:(callback,delay)=>{const timer={callback,delay};timers.add(timer);return timer;},clearInterval:timer=>timers.delete(timer),
    requestAnimationFrame:callback=>{frame=callback;return 1;},cancelAnimationFrame(){}
  });
  elements.get('transport').value='websocket';elements.get('room').value='ui-test';
  elements.get('benchmark-preset').value='standard';elements.get('benchmark-runs').value='10';
  return {elements,timers,html,document,pulse:()=>pulseInstance,dispatchDocument:type=>documentListeners.get(type)?.(),frame:now=>frame(now)};
}

test('Connect button bootstraps and joins a real relay; disconnect clears the position timer',async()=>{
  const server=createRealtimeServer({port:0,heartbeatMs:60000});await server.ready;
  const p=page(options=>new WebSocketTransport({...options,WebSocketImpl:WebSocket}));
  p.elements.get('url').value=`ws://127.0.0.1:${server.wss.address().port}`;
  try{
    p.elements.get('connect').click();
    assert.match(p.elements.get('status').textContent,/Connecting/);
    const deadline=Date.now()+2000;
    while(p.elements.get('status').textContent!=='Connected to room ui-test.'){
      assert.ok(Date.now()<deadline,'Connect should join the room');
      await new Promise(resolve=>setTimeout(resolve,5));
    }
    assert.equal(p.timers.size,3); // probe, ordering, position
    assert.equal(p.elements.get('connect').classList.contains('connected'),true);
    assert.equal(p.elements.get('connect').textContent,'Connected ✓ — Reconnect');
    assert.equal(p.elements.get('socket-target').textContent,p.elements.get('url').value);
    assert.ok(p.html.indexOf('id="status"')<p.html.indexOf('id="field"'));
    p.elements.get('run-benchmark').click();assert.equal(p.elements.get('status').textContent,'Benchmark started.');
    p.frame(performance.now()+400);
    assert.equal(p.elements.get('run-benchmark').disabled,true);
    assert.equal(p.elements.get('cancel-benchmark').disabled,false);
    assert.match(p.elements.get('benchmark-stats').textContent,/Benchmark: run 1 \/ 10/);
    p.elements.get('cancel-benchmark').click();p.frame(performance.now()+800);
    assert.match(p.elements.get('benchmark-stats').textContent,/cancelled/);
    assert.equal(p.elements.get('run-benchmark').disabled,false);
    assert.equal(p.elements.get('connect').classList.contains('connected'),true);
  }finally{p.elements.get('disconnect').click();await server.close();}
  assert.equal(p.timers.size,2);
  assert.equal(p.elements.get('status').textContent,'Disconnected.');
  assert.equal(p.elements.get('connect').classList.contains('connected'),false);
  assert.equal(p.elements.get('connect').textContent,'Connect');
});

test('Lab one-second probe timer shows separate RTTs and Copy Benchmark exports measured peer samples without leaked subscriptions',async()=>{
  const server=createRealtimeServer({port:0,heartbeatMs:60000});await server.ready;
  const transports=[];
  const factory=options=>{const t=new WebSocketTransport({...options,WebSocketImpl:WebSocket});transports.push(t);return t;};
  const sender=page(factory),receiver=page(factory),url=`ws://127.0.0.1:${server.wss.address().port}`;
  const wait=async predicate=>{const deadline=Date.now()+3000;while(!predicate()){
    assert.ok(Date.now()<deadline,'Lab peer measurement should complete');await new Promise(resolve=>setTimeout(resolve,5));
  }};
  try{
    for(const p of [sender,receiver]){p.elements.get('url').value=url;p.elements.get('connect').click();}
    await wait(()=>transports.every(t=>t.peerRtt.peers.size===1));
    sender.elements.get('run-benchmark').click();
    const probes=[...sender.timers].filter(t=>t.delay===1000);assert.equal(probes.length,1);
    probes[0].callback();
    await wait(()=>transports[0].getStats().peerRtt[0]?.count===1&&transports[0].getStats().rtt!==null);
    sender.frame(performance.now()+400);
    assert.match(sender.elements.get('stats').textContent,/Server RTT probe:/);
    assert.match(sender.elements.get('stats').textContent,/Peer RTT \[.+\]: current .*average.*variation/);
    sender.elements.get('cancel-benchmark').click();
    await sender.elements.get('copy-benchmark').click();
    const report=JSON.parse(sender.elements.get('copy-fallback').value);
    assert.equal(report.peerRtt.length,1);assert.equal(report.peerRtt[0].peerId,transports[1].clientId);
    assert.equal(report.peerRtt[0].count,1);assert.ok(report.peerRtt[0].average>=0);
    assert.equal(report.runs[0].peerRtt[0].count,1);
    assert.equal(sender.timers.size,3,'Peer probes reuse the existing timer');
    const old=transports[0];sender.elements.get('connect').click();
    await wait(()=>transports.at(-1).peerRtt.peers.size===1);
    assert.equal(old.peerRtt.listeners.size,0);assert.equal(old.peerRtt.pending.size,0);
    assert.equal(transports.at(-1).peerRtt.listeners.size,1);assert.equal(sender.timers.size,3);
  }finally{sender.elements.get('disconnect').click();receiver.elements.get('disconnect').click();await server.close();}
});

test('connection failure gives a visible actionable relay-start message',async()=>{
  const p=page(()=>({url:'ws://127.0.0.1:8787',
    onConnectionState(handler){handler('disconnected');this.stateHandler=handler;return ()=>{};},
    onMessage(){return ()=>{};},
    connect(){this.stateHandler('reconnecting');return Promise.reject(new Error('WebSocket connection failed'));},
    disconnect(){}
  }));
  p.elements.get('connect').click();await Promise.resolve();
  assert.match(p.elements.get('status').textContent,/npm run realtime:server/);
  assert.match(p.elements.get('status').textContent,/127\.0\.0\.1:8787/);
  assert.match(p.elements.get('status').textContent,/retry/);
  assert.equal(p.elements.get('connect').classList.contains('connected'),false);
  p.elements.get('disconnect').click();
});

test('native browser timers retain the global receiver during Connect, pulses, simulation and reconnect',()=>{
  const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
  const pending=new Map();let sequence=0,cancelCalls=0;
  // Node timers tolerate foreign receivers; browser Window methods need the
  // Window/global receiver. Model that constraint so the UI test catches it.
  globalThis.setTimeout=function(callback,delay){
    assert.equal(this,globalThis,'setTimeout must not receive a Lab/transport object');
    const id=++sequence;pending.set(id,{callback,delay});return id;
  };
  globalThis.clearTimeout=function(id){
    assert.equal(this,globalThis,'clearTimeout must not receive a Lab/transport object');
    cancelCalls++;pending.delete(id);
  };
  try{
    const p=page(()=>({url:'ws://127.0.0.1:8787',
      onConnectionState(handler){handler('disconnected');return ()=>{};},onMessage(){return ()=>{};},
      connect(){return Promise.resolve();},disconnect(){}
    }));
    assert.equal(p.elements.get('status').textContent,'Ready. Click Connect to join the relay.');
    p.elements.get('connect').click();
    assert.notEqual(p.elements.get('status').textContent,'Ready. Click Connect to join the relay.');
    p.elements.get('disconnect').click();
    const generator=new PulseGenerator();generator.start();generator.stop();
    const experiment=new PulseExperiment({shoot(){},sendControl(){},getSettings:()=>({simulation:{}}),getClientId:()=>null});
    experiment.reset();
    const simulation=new NetworkSimulation();simulation.configure({latencyMs:100});simulation.deliver('position',()=>{});simulation.clear();
    const transport=new WebSocketTransport({url:'ws://127.0.0.1:8787',roomId:'timer-test'});
    transport.wanted=true;transport.retryLater();transport.disconnect();
    assert.ok(cancelCalls>=6);assert.equal(pending.size,0);
  }finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;}
});

function connectedPage(options={}){
  let receive;
  const p=page(config=>({url:config.url,roomId:config.roomId,clientId:'local',state:'connected',
    onConnectionState(handler){handler('disconnected');return ()=>{};},
    onMessage(handler){receive=handler;return ()=>{};},connect(){return Promise.resolve();},disconnect(){},
    sendReliable(){return true;},sendUnreliable(){return true;},getStats(){return {serverOffsetMs:0};}
  }),options);
  p.elements.get('connect').click();receive({type:'room-state',payload:{peers:[{clientId:'peer',position:null}]}});
  return {...p,receive};
}

test('scroll events do not change sender visibility; only actual hidden visibility events flag it',()=>{
  const p=connectedPage();
  try{
    p.elements.get('run-benchmark').click();assert.equal(p.pulse().local.backgrounded,false);
    p.dispatchDocument('scroll');p.dispatchDocument('scroll');
    assert.equal(p.pulse().local.backgrounded,false);assert.equal(p.pulse().local.visibilityChanges,0);
    p.document.visibilityState='hidden';p.dispatchDocument('visibilitychange');assert.equal(p.pulse().local.backgrounded,true);
    p.document.visibilityState='visible';p.dispatchDocument('visibilitychange');assert.equal(p.pulse().local.backgrounded,true);
  }finally{p.elements.get('disconnect').click();}
});

test('actual Lab receive and frame paths collect first-draw timing; no draw produces no fabricated sample',()=>{
  let now=100;const p=connectedPage({now:()=>now});
  const start=(runId,seq)=>({type:'pulse-start',senderId:'peer',seq,payload:{runId,intervalMs:100,count:10,benchmark:true,simulation:{latencyMs:0,jitterMs:0,loss:0}}});
  const shot=(runId,id)=>({type:'projectile-spawn',senderId:'peer',payload:{id,x:100,y:100,vx:30,vy:0,ttlMs:2000,startedAt:Date.now(),
    pulse:{runId,sequence:1,intervalMs:100,scheduledAt:1e6,actualFireAt:1e6,sentAt:1e6,benchmark:true}}});
  try{
    p.receive(start('visible-run',1));p.receive(shot('visible-run','peer-shot-1'));
    let m=p.pulse().receivers.get('peer').metrics;assert.equal(m.summary().receiveToRenderMs.count,0);
    now=116;p.frame(now);assert.equal(m.summary().receiveToRenderMs.count,1);
    assert.equal(m.summary().receiveToRenderMs.average,16);assert.deepEqual(m.summary().timingSamples.receiveToRender,[16]);
    now=132;p.frame(now);assert.equal(m.summary().receiveToRenderMs.count,1);
    p.document.visibilityState='hidden';p.dispatchDocument('visibilitychange');
    p.receive(start('hidden-run',5));p.receive(shot('hidden-run','peer-shot-2'));
    m=p.pulse().receivers.get('peer').metrics;m.finish({lastSequence:1});
    assert.equal(m.summary().backgrounded,true);assert.equal(m.summary().receiveToRenderMs.count,0);
    assert.equal(m.summary().receiveToRenderMs.average,null);assert.deepEqual(m.summary().timingSamples.receiveToRender,[]);
  }finally{p.elements.get('disconnect').click();}
});

test('Socket URL defaults locally, persists wss URLs and reconnects to the exact edited target',()=>{
  const storage=new Map(),targets=[],closed=[];let stateHandler;
  const factory=options=>{
    targets.push(options.url);
    return {url:options.url,roomId:options.roomId,
      onConnectionState(handler){stateHandler=handler;handler('disconnected');return ()=>{};},onMessage(){return ()=>{};},
      connect(){stateHandler('connected');return Promise.resolve();},disconnect(){closed.push(options.url);}
    };
  };
  const p=page(factory,{storage});assert.equal(p.elements.get('url').value,'ws://127.0.0.1:8787');
  const first='wss://first.trycloudflare.com',second='wss://second.trycloudflare.com/path';
  p.elements.get('url').value=first;p.elements.get('url').change();p.elements.get('connect').click();
  assert.equal(p.elements.get('socket-target').textContent,first);
  p.elements.get('url').value=second;p.elements.get('url').change();
  assert.equal(p.elements.get('socket-target').textContent,first,'editing alone does not switch the active socket');
  p.elements.get('connect').click();assert.deepEqual(targets,[first,second]);assert.deepEqual(closed,[first]);
  assert.equal(p.elements.get('socket-target').textContent,second);
  assert.equal(storage.get('realtime-lab.socket-url'),second);
  const reloaded=page(factory,{storage});assert.equal(reloaded.elements.get('url').value,second);
  p.elements.get('disconnect').click();assert.equal(p.elements.get('socket-target').textContent,'Not connected');
});

test('invalid saved URLs and unavailable localStorage do not break local defaults or manual connection',()=>{
  const invalid=page(()=>{}, {storage:new Map([['realtime-lab.socket-url','ftp://invalid.example']])});
  assert.equal(invalid.elements.get('url').value,'ws://127.0.0.1:8787');
  let target;
  const p=page(options=>{target=options.url;return {url:target,onConnectionState(handler){handler('connecting');return ()=>{};},
    onMessage(){return ()=>{};},connect(){return Promise.resolve();},disconnect(){}};},
    {storage:{getItem(){throw new Error('Storage blocked');},setItem(){throw new Error('Storage blocked');}}});
  p.elements.get('url').value='wss://manual.trycloudflare.com';p.elements.get('connect').click();
  assert.equal(target,'wss://manual.trycloudflare.com');assert.match(p.elements.get('status').textContent,/Connecting/);
  p.elements.get('disconnect').click();
});

test('WebSocket transport passes the complete wss URL to the native socket constructor',()=>{
  let received;
  class Socket {constructor(url){received=url;}addEventListener(){}close(){}}
  const url='wss://public.trycloudflare.com/socket?mode=lab';
  const t=new WebSocketTransport({url,roomId:'internet-test',WebSocketImpl:Socket});
  t.connect().catch(()=>{});assert.equal(received,url);t.disconnect();
});

test('HTTP tunnel URLs normalize on input and Connect, preserving paths and existing WebSocket URLs',()=>{
  for(const [entered,expected] of [['https://abc-def.trycloudflare.com','wss://abc-def.trycloudflare.com'],
    ['http://127.0.0.1:8787','ws://127.0.0.1:8787'],['https://host.example/path?q=1','wss://host.example/path?q=1'],
    ['ws://127.0.0.1:8787','ws://127.0.0.1:8787'],['wss://host.example/path','wss://host.example/path']]){
    const storage=new Map();let target,handler;
    const p=page(options=>{target=options.url;return {url:target,onConnectionState(fn){handler=fn;fn('disconnected');return ()=>{};},
      onMessage(){return ()=>{};},connect(){handler('connected');return Promise.resolve();},disconnect(){}};},{storage});
    p.elements.get('url').value=entered;p.elements.get('url').input();assert.equal(p.elements.get('url').value,expected);
    assert.equal(storage.get('realtime-lab.socket-url'),expected);
    p.elements.get('url').value=entered; // Also verify Connect without an input/blur event.
    p.elements.get('connect').click();assert.equal(target,expected);
    assert.equal(p.elements.get('socket-target').textContent,expected);assert.equal(p.elements.get('url').value,expected);
    const next=page(()=>{}, {storage});assert.equal(next.elements.get('url').value,expected);
    p.elements.get('disconnect').click();
  }
});
