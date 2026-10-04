import { interruptedMatch } from './matchState.js';
import { mergeCombatSnapshot } from './combatSnapshot.js';
import { PVP_MAP_DEFINITION } from './config.js';

// Full combat snapshots are relay-authored; Convex supplies ownership/membership.
export class PvpDamageClient {
  constructor(movement,{matchId,sessionId,onState,onRound=()=>{},onError=()=>{},log=(event,data)=>console.debug('[PvP hit]',event,data)}){
    Object.assign(this,{movement,matchId,sessionId,onState,onRound,onError,log});this.closed=false;this.authorized=false;this.hp=null;this.retrySent=false;
    this.raw=movement.match;
    this.previousPlayers=new Map(this.raw.participants.map(p=>[p.playerId,{life:p.life,hp:p.hp}]));
    this.unsubscribe=[movement.transport.onMessage(m=>this.receive(m)),movement.transport.onConnectionState(state=>{
      if(state!=='connected'){const lost=this.authorized;this.authorized=false;
        if(lost&&!this.closed&&!movement.closed)this.onError(new Error('Realtime combat connection lost. Rejoin the match.'));}
    })];
    if(movement.joined)this.authorize();
  }
  authorize(){
    if(!this.closed)this.movement.transport.sendReliable('pvp-authorize',{playerId:this.movement.playerId,
      sessionId:this.sessionId,matchId:this.matchId,round:this.movement.round,
      mapId:PVP_MAP_DEFINITION.id,mapRevision:PVP_MAP_DEFINITION.revision});
  }
  receive(message){
    const m=this.movement;if(this.closed||message.roomId!==m.roomId)return;
    if(message.type==='pvp-round-transition'){
      if(!this.authorized||!this.hp?.retry||message.payload.fromRound!==m.round)return;
      const next=message.payload.match;
      if(next&&(next.matchId!==this.matchId||next.round!==m.round+1))return;
      this.hp=null;this.authorized=false;this.retrySent=false;this.previousPlayers.clear();
      if(next)this.raw=next;
      this.onRound(next);return;
    }
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
    if(this.hp&&p.authorityId!==this.hp.authorityId){this.onError(new Error('PvP combat authority changed. Rejoin the match.'));return;}
    this.hp=p;this.onState(this.project(this.raw));
  }
  project(state){
    // Convex may publish the new generation before the relay handoff arrives.
    // Keep the ended view until the authoritative transition, and reject echoes
    // of a prior round after that handoff.
    if(state&&(state.round??0)<this.movement.round)return this.movement.match;
    if(this.hp?.retry&&(!state||(state.round??0)!==this.hp.round))return this.project(this.raw);
    this.raw=state;if(!state||!this.hp||(state.round??0)!==this.hp.round)return state;
    const projected=mergeCombatSnapshot(state,this.hp);
    projected.participants=projected.participants.filter(p=>this.hp.players.some(q=>q.playerId===p.playerId));
    projected.damageRevision=this.hp.damageRevision;
    if(this.hp.retry)projected.retry=this.hp.retry;
    // Convex still owns participant departure. Preserve the established return
    // countdown even after the ended relay snapshot closed the combat socket.
    if(interruptedMatch(state))Object.assign(projected,{state:'ended',reason:state.reason,endedAt:state.endedAt});
    for(const p of projected.participants){
      const old=this.previousPlayers.get(p.playerId);
      if(this.movement.config.debug&&old){
        if(p.life>old.life)this.log('respawn received',{playerId:p.playerId,lifeBefore:old.life,lifeAfter:p.life,hp:p.hp});
        else if(old.hp>0&&p.hp===0)this.log('death received/applied',{playerId:p.playerId,lifeBefore:old.life,lifeAfter:p.life,hp:p.hp});
      }
      this.previousPlayers.set(p.playerId,{life:p.life,hp:p.hp});
    }
    return projected;
  }
  attempt({projectileId,victimId,victimLife}){
    const m=this.movement;if(this.closed||!this.authorized||m.closed||m.match.state!=='active')return false;
    return m.transport.sendReliable('pvp-hit-attempt',{projectileId,targetId:victimId,targetLife:victimLife});
  }
  requestEnd(){
    const m=this.movement;return !this.closed&&this.authorized&&!m.closed&&m.match.hostPlayerId===m.playerId
      &&m.transport.sendReliable('pvp-end-request',{});
  }
  requestRetry(){
    const m=this.movement;
    if(this.closed||!this.authorized||m.closed||this.retrySent||m.match.state!=='ended'||!this.hp?.retry
      ||this.hp.retry.resolving||!this.hp.retry.activePlayerIds.includes(m.playerId))return false;
    this.retrySent=m.transport.sendReliable('pvp-retry',{round:m.round});return this.retrySent;
  }
  close(){if(this.closed)return;this.closed=true;this.authorized=false;this.hp=null;this.previousPlayers.clear();for(const off of this.unsubscribe)off();this.unsubscribe=[];}
}
