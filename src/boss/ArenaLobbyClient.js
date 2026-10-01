// One reactive lobby subscription and a local expiry check. No polling/keepalive.
export class ArenaLobbyClient {
  constructor(presence,lobbyId,onState,onError=()=>{}){
    Object.assign(this,{presence,lobbyId,onState,onError});this.closed=false;this.generation=1;
    this.identity={playerId:presence.identity.playerId,sessionId:presence.identity.sessionId};
    const generation=this.generation;this.initializing=true;
    this.unsubscribe=presence.client.onUpdate(presence.api.arenaLobbies.current,this.args(),state=>{
      if(this.closed||generation!==this.generation)return;
      this.state=state;
      // A cached initial result may be synchronous; let the owner attach this client first.
      if(this.initializing)queueMicrotask(()=>{if(!this.closed&&generation===this.generation)this.check();});
      else this.check();
    },error=>{
      const deliver=()=>{if(!this.closed&&generation===this.generation)onError(error);};
      if(this.initializing)queueMicrotask(deliver);else deliver();
    });
    this.timer=setInterval(()=>this.check(),1000);
    this.initializing=false;
  }
  args(){return {...this.identity,lobbyId:this.lobbyId};}
  check(){
    if(this.closed||this.state===undefined)return;
    const now=Date.now(),host=this.state?.participants.find(p=>p.playerId===this.state.hostPlayerId);
    const state=!this.state?null:this.state.status==='closed'?this.state:
      this.state.expiresAt<=now?{...this.state,status:'closed',closedReason:'expired',participants:[]}:
      !host||host.activeUntil<=now?{...this.state,status:'closed',closedReason:'host-disconnected',participants:[]}:
      {...this.state,participants:this.state.participants.filter(p=>p.activeUntil>now)};
    this.onState(state);
  }
  request(action){return this.presence.client.mutation(this.presence.api.arenaLobbies[action],this.args());}
  close(){if(this.closed)return;this.closed=true;this.generation++;this.unsubscribe?.();clearInterval(this.timer);}
}
