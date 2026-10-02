import { advanceMatch,endMatch,reconcileParticipants } from './matchState.js';

// Temporary transport adapter. UI/combat consume snapshots and discrete commands.
// Clock projection is local; the interval performs no Convex requests.
export class PvpMatchClient {
  constructor(presence,matchId,onState,onError=()=>{}){
    Object.assign(this,{presence,matchId,onState,onError});this.closed=false;this.queue=Promise.resolve();
    this.identity={playerId:presence.identity.playerId,sessionId:presence.identity.sessionId};
    this.unsubscribe=presence.client.onUpdate(presence.api.pvpMatches.current,this.args(),state=>{
      if(this.closed)return;
      if(state&&this.snapshot?.state==='ended'&&state.state!=='ended'&&(state.round??0)===(this.snapshot.round??0))return;
      // Keep the first observed interruption time stable until it is persisted.
      if(state?.state==='ended'&&this.snapshot?.state==='ended'&&(state.round??0)===(this.snapshot.round??0))
        state={...state,endedAt:Math.min(state.endedAt,this.snapshot.endedAt)};
      this.snapshot=state;this.received=true;
      queueMicrotask(()=>this.tick());
    },error=>{if(!this.closed)onError(error);});
    this.timer=setInterval(()=>this.tick(),100);
  }
  args(){return {...this.identity,matchId:this.matchId};}
  tick(){
    if(this.closed||!this.received)return;
    if(!this.snapshot){this.onState(null);return;}
    const now=Date.now(),state=advanceMatch(this.snapshot,now);
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
