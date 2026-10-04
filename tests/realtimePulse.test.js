import test from 'node:test';
import assert from 'node:assert/strict';
import { PulseGenerator } from '../src/realtime/lab/PulseGenerator.js';
import { PulseMetrics } from '../src/realtime/lab/PulseMetrics.js';
import { PulseExperiment } from '../src/realtime/lab/PulseExperiment.js';
import { validClientMessage,validPulseSummary } from '../src/realtime/realtimeMessages.js';

function clock(){let now=0,id=0;const tasks=new Map();return {now:()=>now,schedule:(fn,delay)=>{tasks.set(++id,{fn,at:now+delay});return id;},cancel:id=>tasks.delete(id),tasks,
  advance(at){now=at;for(const [id,t] of [...tasks])if(t.at<=now){tasks.delete(id);t.fn();}}};}
const pulse=(sequence,scheduledAt=sequence*100,actualFireAt=scheduledAt)=>({runId:'run-test',sequence,intervalMs:100,scheduledAt,actualFireAt,sentAt:actualFireAt});
const settings=()=>({simulation:{latencyMs:0,jitterMs:0,loss:0}});
const message=(type,payload,senderId='peer')=>({type,payload,senderId});

test('deadline generator emits exactly ten numbered shots on the intended grid and completes once',()=>{
  const c=clock(),shots=[],complete=[];const g=new PulseGenerator({...c,onShot:s=>shots.push(s),onComplete:reason=>complete.push(reason)});
  g.start({intervalMs:100,count:10});for(let t=100;t<=1000;t+=100)c.advance(t);
  assert.equal(shots.length,10);assert.deepEqual(shots.map(s=>s.sequence),[1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(shots.map(s=>s.scheduledAt),shots.map(s=>s.sequence*100));assert.deepEqual(complete,['completed']);assert.equal(c.tasks.size,0);
});

test('late timer preserves intended time, skips obsolete slots and never fires an unbounded catch-up burst',()=>{
  const c=clock(),shots=[];const g=new PulseGenerator({...c,onShot:s=>shots.push(s)});
  g.start({intervalMs:100,count:null});c.advance(110);assert.equal(shots[0].scheduledAt,100);assert.equal(shots[0].actualFireAt,110);
  c.advance(10050);assert.equal(shots.length,2);assert.equal(shots[1].scheduledAt,10000);assert.equal(shots[1].actualFireAt,10050);
  assert.equal(g.skipped,98);assert.equal(g.maxWakeLateness,9850);assert.equal(c.tasks.size,1);g.stop();assert.equal(c.tasks.size,0);
});

test('continuous start/stop/restart has one timer, OFF cancels immediately and stale callbacks cannot fire',()=>{
  const c=clock(),shots=[];const g=new PulseGenerator({...c,onShot:s=>shots.push(s)});
  g.start({intervalMs:50,count:null});const stale=[...c.tasks.values()][0].fn;
  g.start({intervalMs:200,count:50});assert.equal(c.tasks.size,1);stale();assert.equal(shots.length,0);
  c.advance(200);assert.equal(shots.length,1);g.stop();c.advance(20000);assert.equal(shots.length,1);assert.equal(c.tasks.size,0);
  assert.throws(()=>g.start({intervalMs:1,count:10}),/Invalid/);
});

test('local timing metrics separate scheduling error, interval variation, sent time and visibility',()=>{
  const m=new PulseMetrics({runId:'run-test',intervalMs:100,role:'sender'});
  m.recordLocal('a',pulse(1,100,110));m.recordLocal('b',pulse(2,200,220));m.recordLocal('c',pulse(3,300,350));m.markSent('b',240);
  m.visibility('hidden');m.visibility('visible');m.finish({lastSequence:3});const s=m.summary();
  assert.equal(s.intervalsMs.average,120);assert.equal(s.intervalsMs.min,110);assert.equal(s.intervalsMs.max,130);assert.equal(s.intervalsMs.jitter,10);
  assert.ok(Math.abs(s.scheduleErrorMs.average-80/3)<1e-10);assert.equal(s.scheduleErrorMs.max,50);assert.equal(m.records.get('b').sentAt,240);
  assert.equal(s.backgrounded,true);assert.equal(s.visibilityChanges,2);
});

test('arrival intervals use receiver timestamps only, gaps recover on late delivery and final tail loss is counted',()=>{
  const m=new PulseMetrics({runId:'run-test',intervalMs:100,role:'receiver'});
  m.recordArrival('a',pulse(1,100000,100000),100);m.recordArrival('c',pulse(3,100200,100200),300);
  assert.equal(m.summary().missingSequences,1);m.recordArrival('b',pulse(2,100100,100100),320);
  assert.equal(m.summary().missingSequences,0);m.markRendered('b',336);m.markRendered('b',350);m.finish({lastSequence:5});const s=m.summary();
  assert.equal(s.intervalsMs.average,110);assert.equal(s.intervalsMs.jitter,90);assert.equal(s.intervalsMs.min,20);assert.equal(s.intervalsMs.max,200);
  assert.equal(s.missingSequences,2);assert.equal(s.outOfOrder,1);assert.equal(s.receiveToRenderMs.average,16);
  assert.equal(m.recordArrival('d',pulse(4),400),false);assert.ok(validPulseSummary(s));
});

test('continuous metrics have bounded detail and duplicate sequences are not new samples',()=>{
  const m=new PulseMetrics({runId:'run-test',intervalMs:100,role:'receiver'});
  for(let n=1;n<=2000;n++)m.recordArrival('shot-'+n,pulse(n),n*100);
  assert.equal(m.records.size,512);assert.equal(m.seen.size,512);assert.equal(m.summary().sampleCount,2000);
  assert.equal(m.recordArrival('duplicate',pulse(2000),200001),false);assert.equal(m.summary().missingSequences,0);
});

test('burst sender and receiver exchange frozen summaries after settling, and copy JSON stays local',()=>{
  const c=clock(),reports=[];let source;
  const receiver=new PulseExperiment({...c,shoot:()=>{},sendControl:(type,payload)=>{reports.push(payload);source.receive(message(type,payload,'receiver'),c.now());},
    getSettings:settings,getClientId:()=> 'receiver',visibility:()=> 'visible'});
  source=new PulseExperiment({...c,makeId:()=> 'run-test',getSettings:settings,getClientId:()=> 'sender',visibility:()=> 'visible',
    sendControl:(type,payload)=>receiver.receive(message(type,payload,'sender'),c.now()),
    shoot:p=>{const id='sender-'+p.sequence;source.recordLocal(id,p);source.sent(id,c.now());receiver.receive(message('projectile-spawn',{id,pulse:p},'sender'),c.now()+10);receiver.rendered(id,c.now()+26);}});
  source.start(100,10);for(let t=100;t<=1000;t+=100)c.advance(t);
  assert.equal(source.local.completed,true);assert.equal(source.local.samples,10);assert.equal(reports.length,0);c.advance(1500);
  assert.equal(reports.length,1);assert.equal(source.reports.get('receiver').missingSequences,0);assert.equal(source.reports.get('receiver').receiveToRenderMs.average,16);
  const copy=JSON.parse(JSON.stringify(source.results({rtt:20},'Test browser')));assert.equal(copy.userAgent,'Test browser');assert.equal(copy.records.length,10);
  assert.equal(copy.remote.length,1);assert.match(copy.note,/not synchronized/);assert.equal(c.tasks.size,0);
  source.start(100,10);assert.equal(source.local.samples,0);assert.equal(source.reports.size,0);source.reset();receiver.reset();assert.equal(c.tasks.size,0);
});

test('disconnect/reset clears timers and receivers, invalid settings do not send a start event',()=>{
  const c=clock(),messages=[];const e=new PulseExperiment({...c,shoot:()=>{},sendControl:(t,p)=>messages.push([t,p]),getSettings:settings,getClientId:()=> 'sender',makeId:()=> 'run',visibility:()=> 'hidden'});
  assert.throws(()=>e.start(2,10),/Invalid/);assert.equal(messages.length,0);
  e.start(100,null);assert.equal(e.local.backgrounded,true);
  e.receive(message('pulse-start',{runId:'other',intervalMs:100,count:10,simulation:settings().simulation}),0);
  e.receive(message('pulse-end',{runId:'other',lastSequence:10,skipped:0,maxWakeLateness:0}),0);assert.equal(c.tasks.size,2);
  e.reset();assert.equal(c.tasks.size,0);assert.equal(e.receivers.size,0);assert.equal(e.local,null);
});

test('pulse protocol validates metadata and keeps manual projectile messages compatible',()=>{
  const envelope=(type,payload)=>({type,payload,roomId:'room',seq:1,sentAt:1000,channel:'reliable'});
  const p={id:'sender-1',x:10,y:10,vx:100,vy:0,startedAt:1000,ttlMs:2000};
  assert.ok(validClientMessage(envelope('projectile-spawn',p)));assert.ok(validClientMessage(envelope('projectile-spawn',{...p,pulse:pulse(1)})));
  assert.equal(validClientMessage(envelope('projectile-spawn',{...p,pulse:{...pulse(1),sentAt:-1}})),false);
  assert.ok(validClientMessage(envelope('pulse-start',{runId:'run',intervalMs:100,count:10,simulation:settings().simulation})));
});
