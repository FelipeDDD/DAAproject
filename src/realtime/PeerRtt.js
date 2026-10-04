// Lab-only application round trip through the relay and the actual remote browser.
// All elapsed times come from the initiator's monotonic clock, never a peer clock.
export class PeerRtt {
  constructor({now=()=>performance.now(),timeoutMs=10000,maxSamples=30}={}){
    Object.assign(this,{now,timeoutMs,maxSamples});this.sequence=0;this.listeners=new Set();this.reset();
  }
  reset(){this.peers=new Map();this.pending=new Map();this.answered=new Map();}
  onSample(fn){this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
  addPeer(peerId){if(!this.peers.has(peerId))this.peers.set(peerId,{samples:[],lastSequence:0});}
  removePeer(peerId){
    this.peers.delete(peerId);
    for(const [id,p] of this.pending)if(p.peerId===peerId)this.pending.delete(id);
    this.answered.delete(peerId);
  }
  prune(){
    const cutoff=this.now()-this.timeoutMs;
    for(const [id,p] of this.pending)if(p.startedAt<=cutoff)this.pending.delete(id);
    for(const [peerId,ids] of this.answered){
      for(const [id,at] of ids)if(at<=cutoff)ids.delete(id);
      if(!ids.size)this.answered.delete(peerId);
    }
  }
  probe(send){
    this.prune();
    for(const peerId of this.peers.keys()){
      const sequence=++this.sequence,pingId=`peer-ping-${sequence}`,startedAt=this.now();
      // Register BEFORE sending (also safe with synchronous test transports).
      this.pending.set(pingId,{peerId,sequence,startedAt});
      if(!send('peer-ping',{peerId,pingId}))this.pending.delete(pingId);
    }
  }
  receive(message,clientId,send){
    this.prune();
    const {senderId,payload:p,type}=message;
    if(p.peerId!==clientId||!this.peers.has(senderId))return false;
    if(type==='peer-ping'){
      const answered=this.answered.get(senderId)??new Map();
      if(answered.has(p.pingId))return false;
      answered.set(p.pingId,this.now());this.answered.set(senderId,answered);
      // Bound dedup state even if a peer sends many unique probes.
      if(answered.size>256)answered.delete(answered.keys().next().value);
      return send('peer-pong',{peerId:senderId,pingId:p.pingId});
    }
    if(type!=='peer-pong')return false;
    const pending=this.pending.get(p.pingId),peer=this.peers.get(senderId);
    if(!pending||pending.peerId!==senderId||pending.sequence<=peer.lastSequence)return false;
    const receivedAt=this.now(),rttMs=receivedAt-pending.startedAt;
    if(rttMs<0||rttMs>=this.timeoutMs)return false;
    this.pending.delete(p.pingId);peer.lastSequence=pending.sequence;
    // A late pong must not replace a more recent measurement.
    for(const [id,old] of this.pending)if(old.peerId===senderId&&old.sequence<=pending.sequence)this.pending.delete(id);
    peer.samples.push(rttMs);if(peer.samples.length>this.maxSamples)peer.samples.shift();
    const sample={peerId:senderId,pingId:p.pingId,startedAt:pending.startedAt,receivedAt,rttMs};
    for(const fn of this.listeners)fn(sample);
    return true;
  }
  getStats(){
    return [...this.peers].map(([peerId,{samples}])=>({peerId,count:samples.length,current:samples.at(-1)??null,
      average:samples.length?samples.reduce((n,s)=>n+s,0)/samples.length:null,
      // Mean absolute successive RTT difference (not one-way arrival jitter).
      jitter:samples.length>1?samples.slice(1).reduce((n,s,i)=>n+Math.abs(s-samples[i]),0)/(samples.length-1):null}));
  }
}
