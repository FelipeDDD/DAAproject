import { RealtimeTransport } from './RealtimeTransport.js';
import { REALTIME_CONFIG as defaults } from './config.js';
import { decodeMessage,validClientMessage,validServerMessage,validRoomId } from './realtimeMessages.js';
import { RealtimeStats } from './realtimeStats.js';
import { PeerRtt } from './PeerRtt.js';

export class WebSocketTransport extends RealtimeTransport {
  constructor({url,roomId,WebSocketImpl=globalThis.WebSocket,config={},now=()=>performance.now(),wallNow=()=>Date.now(),schedule=(callback,delay)=>globalThis.setTimeout(callback,delay),cancel=timer=>globalThis.clearTimeout(timer)}){
    super();if(!['ws:','wss:'].includes(new URL(url).protocol)||!validRoomId(roomId))throw new Error('Invalid WebSocket URL / room ID');
    Object.assign(this,{url,roomId,WebSocketImpl,now,wallNow,schedule,cancel});this.config={...defaults,...config};
    this.stats=new RealtimeStats(now);this.probes=new Map();this.probeSeq=0;this.generation=0;this.seq=0;this.retry=0;this.wanted=false;
    this.peerRtt=new PeerRtt({now});
  }
  connect(){
    if(this.wanted)return this.connectPromise??Promise.resolve();
    this.wanted=true;this.retry=0;return this.open();
  }
  open(){
    if(!this.wanted)return Promise.resolve();
    const generation=++this.generation;this.setState(this.retry?'reconnecting':'connecting');
    this.connectPromise=new Promise((resolve,reject)=>{
      this.pendingReject=reject;let socket;
      try{socket=new this.WebSocketImpl(this.url);}catch(error){this.pendingReject=null;reject(error);this.retryLater();return;}
      this.socket=socket;
      socket.addEventListener('open',()=>{if(generation!==this.generation)return;this.pendingReject=null;this.retry=0;this.setState('connected');resolve();});
      socket.addEventListener('message',event=>{
        if(generation!==this.generation)return;
        const message=decodeMessage(event.data,validServerMessage,this.config.maxMessageBytes);
        if(!message){this.stats.rejected++;return;}
        this.stats.record('received',new TextEncoder().encode(event.data).byteLength);
        if(message.type==='welcome'){this.clientId=message.payload.clientId;this.stats.serverOffsetMs=message.serverTime-this.wallNow();}
        if(message.type==='room-state'){
          this.peerRtt.reset();for(const peer of message.payload.peers)this.peerRtt.addPeer(peer.clientId);
        }
        if(message.type==='peer-joined')this.peerRtt.addPeer(message.payload.clientId);
        if(message.type==='peer-left')this.peerRtt.removePeer(message.payload.clientId);
        if(message.type==='room-left')this.peerRtt.reset();
        if(message.type==='peer-ping'||message.type==='peer-pong')
          this.peerRtt.receive(message,this.clientId,(type,payload)=>this.sendReliable(type,payload));
        if(message.type==='pong'){
          const probe=this.probes.get(message.payload.probeId);
          if(probe){const rtt=this.now()-probe.at;this.stats.recordRtt(rtt,message.serverTime-(probe.wallAt+rtt/2));this.probes.delete(message.payload.probeId);}
        }
        this.emitMessage(message);
      });
      socket.addEventListener('error',()=>{if(generation!==this.generation)return;this.pendingReject?.(new Error('WebSocket connection failed'));this.pendingReject=null;socket.close();});
      socket.addEventListener('close',()=>{if(generation!==this.generation)return;this.pendingReject?.(new Error('WebSocket closed'));this.pendingReject=null;
        this.socket=null;this.clientId=null;this.probes.clear();this.peerRtt.reset();this.retryLater();});
    });
    return this.connectPromise;
  }
  retryLater(){
    if(!this.wanted){this.setState('disconnected');return;}
    this.setState('reconnecting');this.cancel(this.retryTimer);
    const delay=Math.min(this.config.maxReconnectMs,this.config.reconnectMs*2**Math.min(this.retry++,8));
    this.retryTimer=this.schedule(()=>{this.retryTimer=null;this.open().catch(()=>{});},delay);
  }
  disconnect(){
    this.wanted=false;++this.generation;this.cancel(this.retryTimer);this.retryTimer=null;
    this.pendingReject?.(new Error('Disconnected'));this.pendingReject=null;const socket=this.socket;this.socket=null;
    socket?.close();this.probes.clear();this.peerRtt.reset();this.clientId=null;this.connectPromise=null;this.setState('disconnected');
  }
  sendReliable(type,payload){return this.send('reliable',type,payload);}
  sendUnreliable(type,payload){return this.send('unreliable',type,payload);}
  send(channel,type,payload){
    if(this.state!=='connected'||this.socket?.readyState!==1)return false;
    const message={type,roomId:this.roomId,senderId:this.clientId,seq:++this.seq,sentAt:this.wallNow(),channel,payload};
    if(!validClientMessage(message))throw new Error('Invalid realtime message');
    const text=JSON.stringify(message),bytes=new TextEncoder().encode(text).byteLength;
    if(bytes>this.config.maxMessageBytes)throw new Error('Realtime message too large');
    if(this.socket.bufferedAmount>this.config.maxBufferedBytes){this.socket.close(1013,'Backpressure');return false;}
    this.socket.send(text);this.stats.record('sent',bytes);return true;
  }
  probe(){
    const probeId=`probe-${++this.probeSeq}`;
    for(const [id,p] of this.probes)if(this.now()-p.at>30000)this.probes.delete(id);
    if(this.sendReliable('ping',{probeId}))this.probes.set(probeId,{at:this.now(),wallAt:this.wallNow()});
  }
  probePeers(){if(this.state==='connected')this.peerRtt.probe((type,payload)=>this.sendReliable(type,payload));}
  getStats(){return {...this.stats.get(),peerRtt:this.peerRtt.getStats(),state:this.state,clientId:this.clientId??null,roomId:this.roomId};}
}
