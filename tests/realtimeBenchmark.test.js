import test from 'node:test';
import assert from 'node:assert/strict';
import { Benchmark,aggregateRuns,percentile,distribution,BENCHMARK_CONFIG } from '../src/realtime/lab/Benchmark.js';
import { PulseExperiment } from '../src/realtime/lab/PulseExperiment.js';
import { PulseMetrics } from '../src/realtime/lab/PulseMetrics.js';
import { LabState,MAX_REMEMBERED_LAB_PROJECTILES } from '../src/realtime/lab/LabState.js';
import { validClientMessage,validPulseSummary } from '../src/realtime/realtimeMessages.js';

function clock(){
  let now=0,id=0;const tasks=new Map();
  return {tasks,now:()=>now,schedule:(fn,ms)=>{tasks.set(++id,{fn,at:now+ms});return id;},cancel:id=>tasks.delete(id),
    next(){const [id,t]=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0]??[];if(!t)return false;tasks.delete(id);now=t.at;t.fn();return true;},
    wakeLate(ms){now+=ms;const [id,t]=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0];tasks.delete(id);t.fn();},
    drain(){let count=0;while(this.next())assert.ok(++count<10000,'No infinite worker chain');}};
}
function fixture(peers=[]){
  const c=clock(),simulation={latencyMs:0,jitterMs:0,loss:0},messages=[];
  let id=0,hidden=false;
  const pulse=new PulseExperiment({...c,makeId:()=>`run-${++id}`,visibility:()=>hidden?'hidden':'visible',
    shoot:timing=>pulse.recordLocal(`shot-${timing.sequence}`,timing),sendControl:(type,payload)=>messages.push({type,payload}),
    getSettings:()=>({simulation}),getClientId:()=> 'sender'});
  const benchmark=new Benchmark({...c,pulse,getPeers:()=>peers,getMetadata:()=>({userAgent:'Test browser',transport:'websocket'}),getRtt:()=>24,
    config:{reportTimeoutMs:1000}});
  return {c,pulse,benchmark,messages,setHidden(value){hidden=value;pulse.visibilityChanged(value?'hidden':'visible');}};
}
test('percentiles interpolate ordered sample ranks, including empty/singleton/boundary data',()=>{
  assert.equal(percentile([],0.5),null);assert.equal(percentile([9],.99),9);
  assert.equal(percentile([40,10,30,20],.5),25);assert.equal(percentile([0,100],.95),95);
  assert.equal(percentile([0,100],.99),99);assert.equal(percentile([2,8],0),2);assert.equal(percentile([2,8],1),8);
  assert.throws(()=>percentile([2],1.1));assert.equal(distribution([2,NaN,4]).average,3);
});
test('all presets complete ten controlled runs with independent samples and a 500 ms pause',()=>{
  for(const [preset,shots,interval] of [['standard',10,100],['stress20',20,50],['stress50',50,20]]){
    const {c,pulse,benchmark,messages}=fixture();benchmark.start(preset,10);c.drain();
    const report=benchmark.report();assert.equal(report.benchmark.completedRuns,10);assert.equal(report.aggregate.totalShots,shots*10);
    assert.equal(report.aggregate.localScheduleError.count,shots*10);assert.equal(report.aggregate.localScheduleError.max,0);
    assert.equal(report.aggregate.localIntervalJitter.max,0);assert.equal(report.aggregate.localIntervals.average,interval);
    assert.equal(c.now(),10*shots*interval+9*500);assert.equal(c.tasks.size,0);
    assert.equal(messages.filter(m=>m.type==='pulse-start').length,10);assert.equal(pulse.listeners.size,1);
    benchmark.start(preset,10);c.drain();assert.equal(benchmark.report().aggregate.totalShots,shots*10);
    assert.equal(pulse.listeners.size,1);benchmark.dispose();assert.equal(pulse.listeners.size,0);
  }
});
test('benchmark waits for remote samples, pools raw distributions and counts background runs explicitly',()=>{
  const {c,pulse,benchmark,setHidden}=fixture(['peer']);benchmark.start('standard',10);
  for(let i=0;i<10;i++)c.next();assert.equal(benchmark.phase,'settling');assert.equal(benchmark.runs.length,0);
  const receiver=new PulseMetrics({runId:pulse.local.runId,role:'receiver',intervalMs:100});receiver.benchmark=true;
  for(let n=1;n<=10;n++){receiver.recordArrival(`p-${n}`,{sequence:n,scheduledAt:1e6+n*100,actualFireAt:1e6+n*100,sentAt:1e6+n*100},n*100);receiver.markRendered(`p-${n}`,n*100+16);}
  receiver.visibility('hidden');receiver.finish({lastSequence:10});assert.equal(validPulseSummary(receiver.summary()),true);
  pulse.receive({type:'pulse-summary',senderId:'peer',payload:{targetId:'sender',summary:receiver.summary()}},1000);
  assert.equal(benchmark.runs.length,1);assert.equal(benchmark.phase,'pause');
  const r=benchmark.report();assert.equal(r.aggregate.receiveToRender.p99,16);assert.equal(r.aggregate.remoteArrivalJitter.max,0);
  assert.equal(r.visibility.backgroundedRuns,1);assert.equal(r.foregroundAggregate.totalShots,10);
  assert.equal(r.runs[0].senderBackgrounded,false);assert.equal(r.runs[0].receiverBackgrounded,true);
  assert.equal(r.visibility.senderBackgroundedRuns,0);assert.equal(r.visibility.receiverBackgroundedRuns,1);
  assert.equal(r.visibility.anySenderBackgrounded,false);assert.equal(r.visibility.anyReceiverBackgrounded,true);
  setHidden(true);c.next();c.next();benchmark.stop();
  const partial=benchmark.report();assert.equal(partial.benchmark.status,'cancelled');assert.equal(partial.benchmark.abortedRuns,1);
  assert.equal(partial.visibility.backgroundedRuns,2);assert.equal(c.tasks.size,0);
  const saved=JSON.parse(JSON.stringify(partial));assert.equal(saved.visibility.senderBackgroundedRuns,1);
  assert.equal(saved.visibility.receiverBackgroundedRuns,1);assert.equal(saved.foregroundAggregate.totalShots,10);
  assert.equal(saved.runs[1].senderBackgrounded,true);assert.equal(saved.runs[1].receiverBackgrounded,false);
  assert.doesNotThrow(()=>JSON.stringify(partial));
});
test('50 and 100 run selections stay bounded and finish without leaked timers',()=>{
  for(const count of [50,100]){
    const {c,pulse,benchmark}=fixture();benchmark.start('standard',count);c.drain();
    assert.equal(benchmark.report().benchmark.completedRuns,count);assert.equal(benchmark.report().aggregate.totalShots,count*10);
    assert.equal(pulse.local.records.size,10);assert.equal(c.tasks.size,0);benchmark.dispose();
  }
});
test('cancel during firing, settling or pause clears timers and stale callbacks without disconnecting',()=>{
  for(const phase of ['firing','settling','pause']){
    const {c,pulse,benchmark,messages}=fixture(phase==='settling'?['peer']:[]);benchmark.start();
    if(phase!=='firing')for(let i=0;i<10;i++)c.next();
    const stale=[...c.tasks.values()].map(t=>t.fn);assert.equal(benchmark.phase,phase);
    benchmark.stop();const count=messages.length;
    for(const fn of stale)fn();assert.equal(messages.length,count);assert.equal(c.tasks.size,0);assert.equal(pulse.generator.active,false);
    assert.equal(benchmark.report().benchmark.status,'cancelled');assert.equal(pulse.listeners.size,1);
  }
});
test('missing reports time out explicitly, disconnection stops chains, invalid settings do not alter a run',()=>{
  const {c,pulse,benchmark}=fixture(['missing']);benchmark.start();c.drain();
  assert.equal(benchmark.report().aggregate.missingPeerReports,10);assert.equal(benchmark.report().aggregate.receivedSamples,0);
  assert.equal(benchmark.report().aggregate.remoteArrivalJitter.average,null);
  benchmark.start();assert.throws(()=>benchmark.start('unknown',10));assert.equal(benchmark.active,true);
  c.next();pulse.reset();assert.equal(benchmark.active,false);assert.equal(c.tasks.size,0);
  assert.equal(benchmark.report().benchmark.status,'disconnected');
});
test('pooled percentiles weight samples rather than runs, and reliability counts are summed',()=>{
  const run=errors=>({local:{sampleCount:errors.length,skippedScheduledSlots:2,timingSamples:{scheduleError:errors}},
    remote:[{summary:{sampleCount:3,missingSequences:1,outOfOrder:2,timingSamples:{receiveToRender:[4,8]}}}],missingPeers:[],rttAverageMs:10});
  const a=aggregateRuns([run([0]),run([100,100,100])]);assert.equal(a.localScheduleError.average,75);
  assert.equal(a.localScheduleError.p50,100);assert.equal(a.missing,2);assert.equal(a.outOfOrder,4);assert.equal(a.skippedScheduledShots,4);
});
test('benchmark visuals are capped and short-lived; normal projectile TTL is unchanged',()=>{
  const state=new LabState();
  for(let n=1;n<=100;n++)state.spawn({id:`b-${n}`,x:10,y:10,vx:0,vy:0,startedAt:0,ttlMs:2000,pulse:{benchmark:true}},'peer',0);
  assert.equal(state.projectiles.size,BENCHMARK_CONFIG.visualCap);assert.equal(state.projectileSamples(499).length,24);
  assert.equal(state.projectileSamples(500).length,0);
  state.spawn({id:'manual',x:10,y:10,vx:0,vy:0,startedAt:500,ttlMs:2000},'peer',500);
  assert.equal(state.projectileSamples(1500).length,1);
});
test('stress presets are valid protocol events, with bounded sample payloads below the relay limit',()=>{
  const f=fixture();f.benchmark.start('stress50',10);while(f.benchmark.runs.length<1)f.c.next();
  const start=f.messages.find(m=>m.type==='pulse-start');
  assert.equal(validClientMessage({...start,roomId:'test',seq:1,sentAt:0,channel:'reliable'}),true);
  const m=new PulseMetrics({runId:'run-1',role:'receiver',intervalMs:20});m.benchmark=true;
  for(let n=1;n<=50;n++){m.recordArrival(`p-${n}`,{sequence:n},n*20.123456789);m.markRendered(`p-${n}`,n*20.123456789+16.123456789);}
  m.finish({lastSequence:50});assert.equal(validPulseSummary(m.summary()),true);
  assert.ok(Buffer.byteLength(JSON.stringify(m.summary()))<8192);
  assert.equal(validPulseSummary({...m.summary(),timingSamples:{...m.timingSamples(),intervals:Array(51).fill(1)}}),false);
  f.benchmark.stop();assert.throws(()=>f.pulse.start(20,50),/Invalid/);
});

test('peer departure stops a benchmark cleanly during firing, settling or pause and marks partial results',()=>{
  for(const phase of ['firing','settling','pause']){
    const {c,pulse,benchmark}=fixture(['peer']);benchmark.start();
    if(phase!=='firing')for(let n=0;n<10;n++)c.next();
    if(phase==='pause'){
      pulse.reports.set('peer',{runId:pulse.local.runId,sampleCount:10,missingSequences:0,outOfOrder:0,backgrounded:false,timingSamples:{}});
      pulse.emit('report');
    }
    assert.equal(benchmark.phase,phase);pulse.removePeer('peer');
    const r=benchmark.report();assert.equal(r.benchmark.status,'peer-disconnected');assert.equal(r.benchmark.partial,true);
    assert.deepEqual(r.benchmark.disconnectedPeers,['peer']);assert.equal(c.tasks.size,0);assert.equal(pulse.generator.active,false);
    if(phase!=='pause')assert.deepEqual(r.runs[0].missingPeers,['peer']);
    benchmark.dispose();
  }
});

test('no-peer benchmarks export absent network distributions instead of invented zero measurements',()=>{
  const {c,benchmark}=fixture();benchmark.start();c.drain();const r=JSON.parse(JSON.stringify(benchmark.report()));
  assert.equal(r.aggregate.receivedSamples,0);assert.equal(r.aggregate.remoteArrivalJitter.count,0);
  assert.equal(r.aggregate.remoteArrivalJitter.average,null);assert.equal(r.aggregate.receiveToRender.p95,null);
  assert.equal(r.runs.length,10);assert.equal(r.runs.every(run=>run.remote.length===0),true);
});

test('stale callbacks cannot clear or duplicate the next benchmark or pulse timer',()=>{
  const {c,pulse,benchmark}=fixture();benchmark.start();const oldPulse=[...c.tasks.values()][0].fn;
  for(let n=0;n<10;n++)c.next();const oldPause=[...c.tasks.values()][0].fn;
  benchmark.start('stress50',10);oldPulse();oldPause();
  assert.equal(c.tasks.size,1);benchmark.stop();assert.equal(c.tasks.size,0);assert.equal(pulse.listeners.size,1);
});

test('Stress 50 Hz skips missed deadlines after a stall, emits one shot and reports the skipped slots',()=>{
  const {c,pulse,benchmark}=fixture();benchmark.start('stress50',10);c.wakeLate(1000);
  assert.equal(pulse.local.samples,1);assert.equal(pulse.generator.skipped,49);assert.equal(c.tasks.size,1);
  c.next();assert.equal(pulse.local.samples,2);benchmark.stop();
  assert.equal(benchmark.report().aggregate.skippedScheduledShots,49);assert.equal(benchmark.report().aggregate.totalShots,2);
});

test('old receiver starts, projectile deliveries and settle callbacks cannot replace the current run',()=>{
  const {c,pulse}=fixture();const simulation={latencyMs:0,jitterMs:0,loss:0};
  pulse.receive({type:'room-state',payload:{peers:[{clientId:'peer'}]}},0);
  const start=(runId,seq)=>({type:'pulse-start',senderId:'peer',seq,payload:{runId,intervalMs:100,simulation,benchmark:true}});
  const event=runId=>({type:'projectile-spawn',senderId:'peer',payload:{id:`${runId}-shot`,pulse:{runId,sequence:1,actualFireAt:100,scheduledAt:100,sentAt:100}}});
  pulse.receive(start('old',1),0);assert.equal(pulse.receive(event('old'),100),true);
  pulse.receive({type:'pulse-end',senderId:'peer',payload:{runId:'old',lastSequence:1}},100);
  const stale=[...c.tasks.values()][0].fn;
  pulse.receive(start('new',10),200);assert.equal(pulse.receive(start('old',1),250),false);
  assert.equal(pulse.receive(event('old'),300),false);stale();assert.equal(c.tasks.size,0);
  assert.equal(pulse.receivers.get('peer').metrics.runId,'new');assert.equal(pulse.receivers.get('peer').metrics.samples,0);
  assert.equal(pulse.receive(event('new'),400),true);
  pulse.receive(start('new',10),450);assert.equal(pulse.receivers.get('peer').metrics.samples,1);
  pulse.removePeer('peer');assert.equal(pulse.receive(start('departed',20),500),false);
  assert.equal(pulse.receivers.size,0);
});

test('late peer reports from a prior benchmark do not contaminate a new benchmark',()=>{
  const {c,pulse,benchmark}=fixture(['peer']);benchmark.start();c.next();const old=pulse.local.runId;
  benchmark.start();pulse.receive({type:'pulse-summary',senderId:'peer',payload:{targetId:'sender',summary:{runId:old}}},100);
  assert.equal(pulse.reports.size,0);assert.equal(benchmark.report().aggregate.totalShots,0);assert.equal(benchmark.runs.length,0);
  benchmark.stop();assert.equal(c.tasks.size,0);
});

test('hidden-tab delivery without render ticks bounds visuals and dedup entries, including destroyed events',()=>{
  const model=new LabState();model.addPeer('peer');
  for(let n=0;n<5000;n++){
    const id=`peer-${n}`;
    model.spawn({id,x:1,y:1,vx:0,vy:0,startedAt:0,ttlMs:2000,pulse:{benchmark:true}},'peer',0);
    model.receive({type:'projectile-destroy',senderId:'peer',payload:{id:`destroy-${n}`}},0,0);
  }
  assert.equal(model.projectiles.size,24);assert.equal(model.seenProjectiles.size,MAX_REMEMBERED_LAB_PROJECTILES);
  model.projectileSamples(6000);assert.equal(model.projectiles.size,0);assert.equal(model.seenProjectiles.size,0);
});
