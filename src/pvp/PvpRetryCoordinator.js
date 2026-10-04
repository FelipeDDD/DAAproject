import { PVP_RULES } from './config.js';

// Relay-only votes. One deadline and one resolution for an ended round.
export class PvpRetryCoordinator {
  constructor({now=Date.now,schedule=setTimeout,cancel=clearTimeout,onChange=()=>{},onResolve}){
    Object.assign(this,{now,schedule,cancel,onChange,onResolve});
    this.votes=new Set();this.active=[];this.closed=false;this.resolving=false;
  }
  begin(endedAt,participants){
    if(this.deadline!==undefined||this.closed)return;
    this.deadline=endedAt+PVP_RULES.returnMs;this.active=participants;
    this.arm();
  }
  arm(){
    if(this.timer!==undefined)this.cancel(this.timer);this.timer=undefined;
    if(this.closed||this.resolving||this.deadline===undefined)return;
    const at=Math.min(this.deadline,...this.active.map(p=>p.presenceExpiresAt).filter(Number.isFinite));
    this.timer=this.schedule(()=>{this.timer=undefined;this.update(this.active);},Math.max(0,at-this.now()));
    this.timer?.unref?.();
  }
  update(participants){
    if(this.closed||this.resolving||this.deadline===undefined)return;
    this.active=participants.filter(p=>p.presenceExpiresAt===undefined||this.now()<p.presenceExpiresAt);
    for(const id of this.votes)if(!this.active.some(p=>p.playerId===id))this.votes.delete(id);
    this.onChange();
    if(this.now()>=this.deadline||!this.active.length||this.active.every(p=>this.votes.has(p.playerId)))this.resolve();
    else this.arm();
  }
  vote(playerId){
    if(this.closed||this.resolving||this.deadline===undefined)return false;
    // A late click cannot extend the decision window.
    if(this.now()>=this.deadline){this.update(this.active);return false;}
    if(!this.active.some(p=>p.playerId===playerId)||this.votes.has(playerId))return false;
    this.votes.add(playerId);this.update(this.active);return true;
  }
  resolve(){
    if(this.closed||this.resolving)return;
    this.resolving=true;if(this.timer!==undefined)this.cancel(this.timer);this.timer=undefined;
    this.onChange();
    this.pending=Promise.resolve().then(()=>this.closed?null:this.onResolve(this.active.filter(p=>this.votes.has(p.playerId)).map(p=>p.playerId)));
  }
  snapshot(){return {deadline:this.deadline,activePlayerIds:this.active.map(p=>p.playerId),playerIds:[...this.votes],resolving:this.resolving};}
  close(){this.closed=true;if(this.timer!==undefined)this.cancel(this.timer);this.timer=undefined;this.votes.clear();}
}
