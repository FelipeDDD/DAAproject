import { endMatch,reconcileParticipants,interruptedMatch } from './matchState.js';

// Temporary transport adapter. UI/combat consume snapshots and discrete commands.
// The local timer expires membership only. It never advances combat/respawn/results.
export class PvpMatchClient {
  constructor(presence,matchId,onState,onError=()=>{}, {monotonicNow=()=>globalThis.performance?.now?.()??Date.now()}={}){
    Object.assign(this,{presence,matchId,onState,onError,monotonicNow});this.closed=false;this.queue=Promise.resolve();
    this.identity={playerId:presence.identity.playerId,sessionId:presence.identity.sessionId};
    this.unsubscribe=presence.client.onUpdate(presence.api.pvpMatches.current,this.args(),state=>{
      if(this.closed)return;
      if(state&&this.snapshot&&(state.round??0)<(this.snapshot.round??0))return;
      if(state&&this.snapshot?.state==='ended'&&state.state!=='ended'&&(state.round??0)===(this.snapshot.round??0))return;
      if(state?.state==='ended'&&this.snapshot?.state==='ended'&&(state.round??0)===(this.snapshot.round??0)){
        // A delayed result must not erase a host departure in the same round.
        if(['host_left','host-left'].includes(this.snapshot.reason))state={...state,reason:this.snapshot.reason,
          participants:state.participants.filter(p=>p.playerId!==state.hostPlayerId),endedAt:this.snapshot.endedAt};
        else if(this.snapshot.reason==='team_empty'&&!interruptedMatch(state))state={...state,reason:'team_empty',
          participants:state.participants.filter(p=>this.snapshot.participants.some(member=>member.playerId===p.playerId)),
          endedAt:this.snapshot.endedAt};
        // Stabilize equivalent end clocks, but don't backdate a NEW interruption
        // to an earlier ordinary victory: survivors need their full exit countdown.
        if(interruptedMatch(state)===interruptedMatch(this.snapshot))
          state={...state,endedAt:Math.min(state.endedAt,this.snapshot.endedAt)};
      }
      if(Number.isFinite(state?.serverNow))this.syncServerClock(state.serverNow);
      this.snapshot=state;this.received=true;
      queueMicrotask(()=>this.tick());
    },error=>{if(!this.closed)onError(error);});
    this.timer=setInterval(()=>this.tick(),100);
  }
  args(){return {...this.identity,matchId:this.matchId};}
  syncServerClock(serverNow){this.serverClock={serverNow,monotonicNow:this.monotonicNow()};}
  now(){return this.serverClock?this.serverClock.serverNow+(this.monotonicNow()-this.serverClock.monotonicNow):Date.now();}
  tick(){
    if(this.closed||!this.received)return;
    if(!this.snapshot){this.onState(null);return;}
    const now=this.now(),state=this.snapshot;
    const next=now>=state.expiresAt?endMatch(state,now,'expired'):reconcileParticipants(state,
      state.participants.filter(p=>p.presenceExpiresAt===undefined||now<p.presenceExpiresAt),now);
    if(next.state==='ended')this.snapshot=next;
    this.onState(next);
  }
  request(action,extra={}){
    const args={...this.args(),round:this.snapshot?.round??0,...extra};
    const run=this.queue.catch(()=>{}).then(()=>{
      if(this.closed&&action!=='leave')return;
      return this.presence.client.mutation(this.presence.api.pvpMatches[action],args);
    });
    this.queue=run;return run;
  }
  close(){if(this.closed)return;this.closed=true;this.unsubscribe?.();clearInterval(this.timer);}
}
