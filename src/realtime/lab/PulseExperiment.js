import { PulseGenerator,validatePulseSettings } from './PulseGenerator.js';
import { PulseMetrics,pulseResults } from './PulseMetrics.js';

export class PulseExperiment {
  constructor({shoot,sendControl,getSettings,getClientId,now=()=>performance.now(),visibility=()=>document.visibilityState,
    schedule=(callback,delay)=>globalThis.setTimeout(callback,delay),cancel=timer=>globalThis.clearTimeout(timer),makeId=()=>crypto.randomUUID()}){
    Object.assign(this,{shoot,sendControl,getSettings,getClientId,now,visibility,schedule,cancel,makeId});
    this.receivers=new Map();this.reports=new Map();this.listeners=new Set();this.startSequences=new Map();this.activePeers=null;
    this.generator=new PulseGenerator({now,schedule,cancel,onShot:shot=>shoot({...shot,runId:this.local.runId,intervalMs:this.local.intervalMs,sentAt:shot.actualFireAt,...(this.local.benchmark?{benchmark:true}:{})}),onComplete:()=>this.stop('completed')});
  }
  onEvent(handler){this.listeners.add(handler);return ()=>this.listeners.delete(handler);}
  emit(type,detail){for(const handler of this.listeners)handler(type,detail);}
  start(intervalMs,count,{benchmark=false}={}){
    validatePulseSettings(intervalMs,count,{benchmark});
    this.stop('stopped');this.reports.clear();
    this.local=new PulseMetrics({runId:this.makeId(),intervalMs,role:'sender',settings:this.getSettings()});
    this.local.benchmark=benchmark;
    if(this.visibility()==='hidden')this.local.visibility('hidden');
    this.sendControl('pulse-start',{runId:this.local.runId,intervalMs,count,simulation:this.local.settings.simulation,...(benchmark?{benchmark:true}:{})});
    this.generator.start({intervalMs,count,benchmark});
  }
  stop(reason='stopped',send=true){
    this.generator.stop();
    if(this.local&&!this.local.completed){
      const end={lastSequence:this.local.samples,skipped:this.generator.skipped??0,maxWakeLateness:this.generator.maxWakeLateness??0};
      this.local.finish({...end,reason});if(send)this.sendControl('pulse-end',{runId:this.local.runId,...end});
      this.emit('local-finished');
    }
  }
  recordLocal(id,pulse){if(this.local?.runId===pulse.runId)this.local.recordLocal(id,pulse);}
  sent(id,at){this.local?.markSent(id,at);}
  rendered(id,at){this.local?.markRendered(id,at);for(const receiver of this.receivers.values())if(!receiver.metrics.completed)receiver.metrics.markRendered(id,at);}
  receive(message,receivedAt,wireReceivedAt=receivedAt){
    const p=message.payload;
    if(message.type==='room-state'){this.activePeers=new Set(p.peers.map(peer=>peer.clientId));return;}
    if(message.type==='peer-joined'){this.activePeers?.add(p.clientId);return;}
    if(message.type==='peer-left'){this.removePeer(p.clientId);return;}
    if(this.activePeers&&!this.activePeers.has(message.senderId))return false;
    if(message.type==='pulse-summary'){
      if(p.targetId===this.getClientId()&&p.summary.runId===this.local?.runId){this.reports.set(message.senderId,p.summary);this.emit('report');}return;
    }
    if(message.type==='pulse-start'){
      const previous=this.startSequences.get(message.senderId);
      if((Number.isSafeInteger(message.seq)&&previous!==undefined&&message.seq<=previous)||this.receivers.get(message.senderId)?.metrics.runId===p.runId)return false;
      if(Number.isSafeInteger(message.seq))this.startSequences.set(message.senderId,message.seq);
      this.removePeer(message.senderId,false);
      const metrics=new PulseMetrics({runId:p.runId,intervalMs:p.intervalMs,role:'receiver',settings:{senderSimulation:p.simulation,receiverSimulation:this.getSettings().simulation}});
      metrics.benchmark=p.benchmark===true;
      if(this.visibility()==='hidden')metrics.visibility('hidden');
      this.receivers.set(message.senderId,{metrics,timer:null});return;
    }
    const receiver=this.receivers.get(message.senderId);
    if(message.type==='projectile-spawn'&&p.pulse){
      if(!receiver||p.pulse.runId!==receiver.metrics.runId)return false;
      return receiver.metrics.recordArrival(p.id,p.pulse,receivedAt,wireReceivedAt);
    }
    if(!receiver)return;
    if(message.type==='pulse-end'&&p.runId===receiver.metrics.runId&&!receiver.metrics.completed){
      this.cancel(receiver.timer);
      const sender=receiver.metrics.settings.senderSimulation,local=this.getSettings().simulation;
      const settleMs=Math.min(6500,sender.latencyMs+sender.jitterMs+local.latencyMs+local.jitterMs+500);
      receiver.timer=this.schedule(()=>{
        if(this.receivers.get(message.senderId)!==receiver||receiver.metrics.completed)return;
        receiver.timer=null;receiver.metrics.finish(p);
        this.sendControl('pulse-summary',{targetId:message.senderId,summary:receiver.metrics.summary()});
      },settleMs);
    }
  }
  visibilityChanged(state){if(this.local&&!this.local.completed)this.local.visibility(state);for(const r of this.receivers.values())if(!r.metrics.completed)r.metrics.visibility(state);}
  removePeer(id,notify=true){const r=this.receivers.get(id);if(r)this.cancel(r.timer);this.receivers.delete(id);if(notify){this.activePeers?.delete(id);this.startSequences.delete(id);this.emit('peer-left',id);}}
  reset(){this.emit('reset');this.stop('disconnected',false);for(const r of this.receivers.values())this.cancel(r.timer);this.receivers.clear();this.reports.clear();this.startSequences.clear();this.activePeers=null;this.local=null;}
  results(rtt,userAgent){return {...pulseResults({local:this.local?.summary()??null,remote:[...this.reports].map(([peerId,summary])=>({peerId,...summary})),
    transport:'websocket',simulation:this.local?.settings.simulation??this.getSettings().simulation,rtt,userAgent,
    records:this.local?[...this.local.records.values()]:[]}),receivedRuns:[...this.receivers].map(([peerId,r])=>({peerId,...r.metrics.summary(),records:[...r.metrics.records.values()]}))};}
}
