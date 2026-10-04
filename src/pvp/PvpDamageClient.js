// Receives relay-authored HP. Convex retains the rest of match/life projection.
export class PvpDamageClient {
  constructor(movement,{matchId,sessionId,onState,onError=()=>{},log=(event,data)=>console.debug('[PvP hit]',event,data)}){
    Object.assign(this,{movement,matchId,sessionId,onState,onError,log});this.closed=false;this.authorized=false;this.hp=null;
    this.raw=movement.match;
    this.unsubscribe=[movement.transport.onMessage(m=>this.receive(m)),movement.transport.onConnectionState(state=>{
      if(state!=='connected'){this.authorized=false;this.hp=null;}
    })];
    if(movement.joined)this.authorize();
  }
  authorize(){
    if(!this.closed)this.movement.transport.sendReliable('pvp-authorize',{playerId:this.movement.playerId,
      sessionId:this.sessionId,matchId:this.matchId,round:this.movement.round});
  }
  receive(message){
    const m=this.movement;if(this.closed||message.roomId!==m.roomId)return;
    if(message.type==='room-state'){this.authorize();return;}
    if(message.type==='pvp-authorized'){
      if(message.payload.playerId===m.playerId&&message.payload.round===m.round)this.authorized=true;return;
    }
    if(message.type==='pvp-combat-error'){this.authorized=false;this.onError(new Error(message.payload.reason));return;}
    if(message.type==='pvp-hit-result'){
      if(m.config.debug)this.log('result',message.payload);return;
    }
    if(message.type!=='pvp-combat-state'||!this.authorized||message.payload.round!==m.round)return;
    const p=message.payload;
    if(this.hp&&p.authorityId===this.hp.authorityId&&p.version<=this.hp.version)return;
    this.hp=p;this.onState(this.project(this.raw));
  }
  project(state){
    this.raw=state;if(!state||!this.hp||(state.round??0)!==this.hp.round)return state;
    return {...state,participants:state.participants.map(p=>{
      const hp=this.hp.players.find(q=>q.playerId===p.playerId&&q.life===p.life);
      return hp&&(state.damageRevision??0)<=this.hp.damageRevision?{...p,hp:hp.hp}:p;
    })};
  }
  attempt({projectileId,victimId,victimLife}){
    const m=this.movement;if(this.closed||!this.authorized||m.closed||m.match.state!=='active')return false;
    return m.transport.sendReliable('pvp-hit-attempt',{projectileId,targetId:victimId,targetLife:victimLife});
  }
  close(){if(this.closed)return;this.closed=true;this.authorized=false;this.hp=null;for(const off of this.unsubscribe)off();this.unsubscribe=[];}
}
