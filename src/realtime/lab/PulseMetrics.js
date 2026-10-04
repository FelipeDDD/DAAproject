class Samples {
  constructor(){this.count=0;this.mean=0;this.m2=0;this.min=null;this.max=null;}
  add(value){this.count++;const d=value-this.mean;this.mean+=d/this.count;this.m2+=d*(value-this.mean);this.min=this.min===null?value:Math.min(this.min,value);this.max=this.max===null?value:Math.max(this.max,value);}
  get(){return {count:this.count,average:this.count?this.mean:null,min:this.min,max:this.max,jitter:this.count?Math.sqrt(this.m2/this.count):null};}
}
export class PulseMetrics {
  constructor({runId,intervalMs,role,settings={}}){
    Object.assign(this,{runId,intervalMs,role,settings});this.records=new Map();this.seen=new Set();this.highest=0;this.samples=0;this.outOfOrder=0;
    this.intervals=new Samples();this.errors=new Samples();this.renderDelays=new Samples();this.backgrounded=false;this.visibilityChanges=0;this.completed=false;
  }
  recordLocal(shotId,pulse){
    if(this.lastActual!==undefined)this.intervals.add(pulse.actualFireAt-this.lastActual);this.lastActual=pulse.actualFireAt;
    this.errors.add(pulse.actualFireAt-pulse.scheduledAt);this.samples++;this.addRecord(shotId,{shotId,...pulse,sentAt:null,receivedAt:null,renderedAt:null});
  }
  recordArrival(shotId,pulse,receivedAt,wireReceivedAt=receivedAt){
    if(this.completed)return false;
    if(this.seen.has(pulse.sequence)||pulse.sequence<=this.highest-512){this.outOfOrder++;return false;}
    if(pulse.sequence<this.highest)this.outOfOrder++;
    this.highest=Math.max(this.highest,pulse.sequence);this.seen.add(pulse.sequence);this.samples++;
    for(const seq of this.seen)if(seq<=this.highest-512)this.seen.delete(seq);
    if(this.lastArrival!==undefined)this.intervals.add(receivedAt-this.lastArrival);this.lastArrival=receivedAt;
    this.addRecord(shotId,{shotId,...pulse,receivedAt,wireReceivedAt,renderedAt:null});return true;
  }
  addRecord(id,record){this.records.set(id,record);if(this.records.size>512)this.records.delete(this.records.keys().next().value);}
  markSent(id,sentAt){const record=this.records.get(id);if(record)record.sentAt=sentAt;}
  markRendered(id,at){const record=this.records.get(id);if(record&&record.renderedAt===null){record.renderedAt=at;if(record.receivedAt!==null)this.renderDelays.add(at-record.receivedAt);}}
  visibility(state){this.visibilityChanges++;if(state==='hidden')this.backgrounded=true;}
  finish({lastSequence=this.highest,skipped=0,maxWakeLateness=0,reason='completed'}={}){this.completed=true;Object.assign(this,{lastSequence,skipped,maxWakeLateness,reason});}
  timingSamples(){
    const records=[...this.records.values()],time=this.role==='sender'?'actualFireAt':'receivedAt';
    const intervals=records.slice(1).map((r,i)=>r[time]-records[i][time]);
    return {scheduleError:this.role==='sender'?records.map(r=>r.actualFireAt-r.scheduledAt):[],
      intervals,intervalVariation:intervals.map(ms=>Math.abs(ms-this.intervalMs)),
      receiveToRender:records.filter(r=>r.receivedAt!==null&&r.renderedAt!==null).map(r=>r.renderedAt-r.receivedAt)};
  }
  summary(){return {runId:this.runId,role:this.role,configuredIntervalMs:this.intervalMs,sampleCount:this.samples,
    intervalsMs:this.intervals.get(),scheduleErrorMs:this.errors.get(),receiveToRenderMs:this.renderDelays.get(),
    missingSequences:Math.max(0,(this.lastSequence??this.highest)-this.samples),missingIsProvisional:!this.completed,
    outOfOrder:this.outOfOrder,skippedScheduledSlots:this.skipped??0,maxWakeLatenessMs:this.maxWakeLateness??0,
    backgrounded:this.backgrounded,visibilityChanges:this.visibilityChanges,completed:this.completed,reason:this.reason??'running',settings:this.settings,
    ...(this.benchmark?{timingSamples:this.timingSamples()}: {})};}
}
export function pulseResults({local,remote=[],transport,simulation,rtt,userAgent,records=[]}){
  return {version:1,note:'Local performance timestamps are not synchronized across browsers. Missing sequences are application-level observations, not TCP packet loss.',
    userAgent,transport,simulation,rtt,local,remote,records};
}
