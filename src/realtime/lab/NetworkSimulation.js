// LAB ONLY: drops/delays whole application messages, never TCP packets.
const gameMessages=new Set(['position','projectile-spawn','projectile-destroy','test-event']);
export class NetworkSimulation {
  constructor({random=Math.random,schedule=(callback,delay)=>globalThis.setTimeout(callback,delay),cancel=timer=>globalThis.clearTimeout(timer)}={}){
    Object.assign(this,{random,schedule,cancel});this.pending=new Set();this.configure({latencyMs:0,jitterMs:0,loss:0});
    this.dropped=0;this.delayed=0;
  }
  configure({latencyMs=0,jitterMs=0,loss=0}){
    this.settings={latencyMs:Math.max(0,Math.min(2000,Number(latencyMs)||0)),jitterMs:Math.max(0,Math.min(1000,Number(jitterMs)||0)),loss:Math.max(0,Math.min(1,Number(loss)||0))};
  }
  deliver(type,callback){
    if(!gameMessages.has(type)){callback();return true;}
    if(this.random()<this.settings.loss){this.dropped++;return false;}
    const delay=Math.max(0,this.settings.latencyMs+(this.random()*2-1)*this.settings.jitterMs);
    if(!delay){callback();return true;}
    this.delayed++;const timer=this.schedule(()=>{this.pending.delete(timer);callback();},delay);this.pending.add(timer);return true;
  }
  clear(){for(const timer of this.pending)this.cancel(timer);this.pending.clear();}
}
