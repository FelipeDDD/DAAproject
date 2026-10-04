export class RealtimeStats {
  constructor(now=()=>performance.now()){this.now=now;this.reset();}
  reset(){this.events=[];this.rtts=[];this.rtt=null;this.jitter=0;this.rejected=0;this.serverOffsetMs=0;}
  record(direction,bytes){this.events.push({at:this.now(),direction,bytes});this.prune();}
  prune(){const cutoff=this.now()-1000;while(this.events[0]?.at<cutoff)this.events.shift();}
  recordRtt(rtt,offset){
    if(this.rtt!==null)this.jitter+=(Math.abs(rtt-this.rtt)-this.jitter)/16;
    this.rtt=rtt;this.rtts.push(rtt);if(this.rtts.length>30)this.rtts.shift();this.serverOffsetMs=offset;
  }
  get(){this.prune();const sent=this.events.filter(e=>e.direction==='sent'),received=this.events.filter(e=>e.direction==='received');
    return {rtt:this.rtt,averageRtt:this.rtts.length?this.rtts.reduce((a,b)=>a+b,0)/this.rtts.length:null,jitter:this.jitter,
      sentPerSecond:sent.length,receivedPerSecond:received.length,sentBytesPerSecond:sent.reduce((s,e)=>s+e.bytes,0),
      receivedBytesPerSecond:received.reduce((s,e)=>s+e.bytes,0),rejected:this.rejected,serverOffsetMs:this.serverOffsetMs};}
}
