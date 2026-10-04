// LAB ONLY. Centralized profiles and bounded receiver/report wait.
export const BENCHMARK_PRESETS=Object.freeze({
  standard:Object.freeze({label:'Standard',shots:10,intervalMs:100}),
  stress20:Object.freeze({label:'Stress 20 Hz',shots:20,intervalMs:50}),
  stress50:Object.freeze({label:'Stress 50 Hz',shots:50,intervalMs:20})
});
export const BENCHMARK_CONFIG=Object.freeze({pauseBetweenRunsMs:500,reportTimeoutMs:8500,visualCap:24,visualLifetimeMs:500});

// Linear interpolation at rank (n-1)*p; never average per-run percentiles.
export function percentile(values,p){
  if(!Number.isFinite(p)||p<0||p>1)throw new Error('Invalid percentile');
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b),rank=(sorted.length-1)*p,lo=Math.floor(rank),hi=Math.ceil(rank);
  return sorted[lo]+(sorted[hi]-sorted[lo])*(rank-lo);
}
export function distribution(values){
  const clean=values.filter(Number.isFinite);
  return {count:clean.length,average:clean.length?clean.reduce((a,b)=>a+b,0)/clean.length:null,
    p50:percentile(clean,.5),p95:percentile(clean,.95),p99:percentile(clean,.99),min:percentile(clean,0),max:percentile(clean,1)};
}
export function aggregateRuns(runs){
  const local=runs.map(r=>r.local),remote=runs.flatMap(r=>r.remote.map(p=>p.summary));
  const samples=(summaries,key)=>summaries.flatMap(s=>s.timingSamples?.[key]??[]);
  return {
    localScheduleError:distribution(samples(local,'scheduleError')),
    localIntervalJitter:distribution(samples(local,'intervalVariation')),
    localIntervals:distribution(samples(local,'intervals')),
    remoteArrivalJitter:distribution(samples(remote,'intervalVariation')),
    remoteArrivalIntervals:distribution(samples(remote,'intervals')),
    receiveToRender:distribution(samples(remote,'receiveToRender')),
    rtt:distribution(runs.map(r=>r.rttAverageMs)),
    totalShots:local.reduce((n,s)=>n+s.sampleCount,0),receivedSamples:remote.reduce((n,s)=>n+s.sampleCount,0),
    missing:remote.reduce((n,s)=>n+s.missingSequences,0),outOfOrder:remote.reduce((n,s)=>n+s.outOfOrder,0),
    skippedScheduledShots:local.reduce((n,s)=>n+s.skippedScheduledSlots,0),
    missingPeerReports:runs.reduce((n,r)=>n+r.missingPeers.length,0)
  };
}
export function browserName(userAgent){
  for(const [pattern,name] of [[/Vivaldi/i,'Vivaldi'],[/Firefox/i,'Firefox'],[/Edg\//,'Edge'],[/Chrome\//,'Chrome/Chromium'],[/Safari/i,'Safari']])if(pattern.test(userAgent))return name;
  return 'Unknown';
}

export class Benchmark {
  constructor({pulse,getPeers,getMetadata,getRtt=()=>null,onRunStart=()=>{},now=()=>performance.now(),
    schedule=(fn,ms)=>globalThis.setTimeout(fn,ms),cancel=id=>globalThis.clearTimeout(id),config={}}){
    Object.assign(this,{pulse,getPeers,getMetadata,getRtt,onRunStart,now,schedule,cancel});
    this.config={...BENCHMARK_CONFIG,...config};this.active=false;this.generation=0;
    this.unsubscribe=pulse.onEvent((type,detail)=>{
      if(!this.active)return;
      if(type==='reset'){this.stop('disconnected');return;}
      if(type==='peer-left'&&this.expectedPeers.includes(detail)){
        this.disconnectedPeers.push(detail);this.stop('peer-disconnected');return;
      }
      if(type==='local-finished'){
        if(pulse.local.reason!=='completed'){this.stop(pulse.local.reason);return;}
        this.phase='settling';this.tryCollect();
        if(this.active&&this.phase==='settling')this.arm(()=>this.collect(),this.config.reportTimeoutMs);
      }
      if(type==='report'&&this.phase==='settling')this.tryCollect();
    });
  }
  arm(fn,ms){
    this.cancel(this.timer);const generation=this.generation;
    this.timer=this.schedule(()=>{if(!this.active||generation!==this.generation)return;this.timer=null;fn();},ms);
  }
  start(preset='standard',requestedRuns=10){
    const profile=BENCHMARK_PRESETS[preset];
    if(!profile||![10,50,100].includes(requestedRuns))throw new Error('Invalid benchmark settings');
    if(this.active)this.stop('replaced');
    this.pulse.stop();this.cancel(this.timer);this.timer=null;++this.generation;
    this.metadata=this.getMetadata();this.preset=preset;this.profile=profile;this.requestedRuns=requestedRuns;
    this.peerRttStartedAt=this.now();this.peerRttSamples=new Map([...this.getPeers()].map(id=>[id,[]]));
    this.runs=[];this.disconnectedPeers=[];this.current=null;this.status='running';this.active=true;this.beginRun();
  }
  beginRun(){
    this.expectedPeers=[...this.getPeers()];this.current=null;this.phase='firing';this.onRunStart();
    this.runPeerRttStartedAt=this.now();this.runPeerRttSamples=new Map(this.expectedPeers.map(id=>[id,[]]));
    for(const id of this.expectedPeers)if(!this.peerRttSamples.has(id))this.peerRttSamples.set(id,[]);
    this.pulse.start(this.profile.intervalMs,this.profile.shots,{benchmark:true});
    this.current=this.pulse.local.runId;
  }
  tryCollect(){if(this.expectedPeers.every(id=>this.pulse.reports.has(id)))this.collect();}
  recordPeerRtt(sample){
    if(!this.active||sample.startedAt<this.peerRttStartedAt||!this.peerRttSamples.has(sample.peerId)
      ||!Number.isFinite(sample.rttMs)||sample.rttMs<0)return;
    const samples=this.peerRttSamples.get(sample.peerId);
    if(samples.length>=12000)return; // Bound long/backgrounded benchmarks without replacing old samples.
    samples.push(sample.rttMs);
    if(this.current&&sample.startedAt>=this.runPeerRttStartedAt&&this.runPeerRttSamples.has(sample.peerId))
      this.runPeerRttSamples.get(sample.peerId).push(sample.rttMs);
  }
  peerRttSummary(samples){return [...samples].map(([peerId,values])=>({peerId,...distribution(values)}));}
  collect(aborted=false){
    if(!this.current||this.runs.some(r=>r.runId===this.current))return;
    this.cancel(this.timer);this.timer=null;
    const local=this.pulse.local.summary(),remote=this.expectedPeers.filter(id=>this.pulse.reports.has(id))
      .map(peerId=>({peerId,summary:this.pulse.reports.get(peerId)}));
    this.runs.push({runIndex:this.runs.length+1,runId:this.current,requestedIntervalMs:this.profile.intervalMs,
      requestedShots:this.profile.shots,aborted,local,remote,
      missingPeers:this.expectedPeers.filter(id=>!this.pulse.reports.has(id)),
      disconnectedPeers:[...this.disconnectedPeers],
      senderBackgrounded:local.backgrounded,receiverBackgrounded:remote.some(r=>r.summary.backgrounded),
      // Compatibility alias only; it must not decide sender foreground eligibility.
      backgrounded:local.backgrounded||remote.some(r=>r.summary.backgrounded),rttAverageMs:this.getRtt(),
      peerRtt:this.peerRttSummary(this.runPeerRttSamples)});
    this.current=null;
    if(aborted||!this.active)return;
    if(this.runs.length>=this.requestedRuns){this.active=false;this.status='completed';this.phase='done';return;}
    this.phase='pause';this.arm(()=>this.beginRun(),this.config.pauseBetweenRunsMs);
  }
  stop(reason='cancelled'){
    if(!this.active)return;
    this.active=false;++this.generation;this.cancel(this.timer);this.timer=null;
    this.pulse.stop(reason,reason!=='disconnected');
    if(this.current)this.collect(this.phase==='firing');
    this.status=reason;this.phase='done';
  }
  dispose(){this.stop('closed');this.unsubscribe();}
  report(){
    if(!this.runs)return null;
    const completedRuns=this.runs.filter(r=>!r.aborted).length,backgroundedRuns=this.runs.filter(r=>r.backgrounded).length;
    const senderBackgroundedRuns=this.runs.filter(r=>r.senderBackgrounded).length,receiverBackgroundedRuns=this.runs.filter(r=>r.receiverBackgrounded).length;
    return {generatedAt:new Date().toISOString(),...this.metadata,
      note:'Percentiles pool individual samples. Foreground aggregate is selected by sender visibility only; receiver visibility is reported independently. Jitter distributions are absolute deviation from the requested interval, not per-run standard deviation. Receive-to-render measures actual first draws only; hidden receivers, expired or capped visuals may yield no samples (null timings), not zero delay. Missing peer reports are unknown, not zero loss. aggregate.rtt is Server RTT (rolling probe average at run end). peerRtt pools measured sender-relay-peer-relay-sender round trips, separately per peer, during this benchmark including inter-run pauses. Browser clocks are never subtracted across peers.',
      benchmark:{preset:this.preset,label:this.profile.label,status:this.status,requestedRuns:this.requestedRuns,completedRuns,
        partial:this.status!=='completed'||this.runs.some(r=>r.aborted||r.missingPeers.length),disconnectedPeers:[...this.disconnectedPeers],
        abortedRuns:this.runs.length-completedRuns,unstartedRuns:this.requestedRuns-this.runs.length,
        shotsPerRun:this.profile.shots,intervalMs:this.profile.intervalMs,pauseBetweenRunsMs:this.config.pauseBetweenRunsMs,
        reportTimeoutMs:this.config.reportTimeoutMs},
      visuals:{cap:this.config.visualCap,lifetimeMs:this.config.visualLifetimeMs},
      peerRtt:this.peerRttSummary(this.peerRttSamples),
      aggregate:aggregateRuns(this.runs),foregroundAggregate:aggregateRuns(this.runs.filter(r=>r.senderBackgrounded===false)),
      visibility:{senderBackgroundedRuns,receiverBackgroundedRuns,anySenderBackgrounded:senderBackgroundedRuns>0,
        anyReceiverBackgrounded:receiverBackgroundedRuns>0,backgroundedRuns,anyBackgrounded:backgroundedRuns>0},runs:this.runs};
  }
}
