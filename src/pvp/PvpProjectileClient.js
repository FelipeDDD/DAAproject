import { validPvpProjectile,validPvpProjectileIdentity } from '../realtime/realtimeMessages.js';
import { createPvpProjectileVisual,inspectPvpAttackVisual,pvpAttackVisual,PVP_PROJECTILE_VISUAL } from './projectileVisual.js';

// Visual events share the movement adapter's socket/room. They never submit hits.
export class PvpProjectileClient {
  constructor(movement,combat,{now=()=>performance.now(),wallNow=()=>Date.now(),log=(event,data)=>console.debug('[PvP projectile]',event,data)}={}){
    Object.assign(this,{movement,combat,now,wallNow,log});this.closed=false;this.seen=new Map();this.latest=new Map();
    this.unsubscribe=[movement.transport.onMessage(message=>this.receive(message)),
      movement.transport.onConnectionState(state=>{if(state!=='connected')this.reset();})];
  }
  debug(event,p,reason){if(this.movement.config.debug)this.log(event,{roomId:this.movement.roomId,
    projectileId:p?.projectileId,shooterId:p?.playerId,life:p?.life,shotSeq:p?.shotSeq,reason});}
  // TEMP: targeted receiver diagnostics; remove after the two-browser regression is identified.
  remoteTrace(stage,data){console.info(`[PVP projectile remote] ${stage}`,data);}
  sendSpawn(p){
    const m=this.movement;if(this.closed||m.closed||!m.joined||m.match.state!=='active')return false;
    const sent=m.transport.sendReliable('pvp-projectile-spawn',p);
    if(sent)this.debug('spawn sent',p);return sent;
  }
  sendDestroy(p){
    const m=this.movement;if(this.closed||m.closed||!m.joined)return false;
    const {projectileId,playerId,life,shotSeq}=p;
    return m.transport.sendReliable('pvp-projectile-destroy',{projectileId,playerId,life,shotSeq});
  }
  receive(message){
    if(this.closed)return;
    if(message.type==='peer-left'){
      if(message.roomId!==this.movement.roomId)return;
      const previous=this.latest.get(message.payload.clientId);this.latest.delete(message.payload.clientId);
      if(previous)for(const [id,shot] of this.combat.remoteShots)if(shot.playerId===previous.playerId)this.combat.removeRemote(id);
      return;
    }
    if(!['pvp-projectile-spawn','pvp-projectile-destroy'].includes(message.type))return;
    const m=this.movement,p=message.payload,spawn=message.type==='pvp-projectile-spawn';
    if(spawn)this.remoteTrace('spawn received',{playerId:p?.playerId,projectileId:p?.projectileId,
      roomId:message.roomId,senderId:message.senderId});
    this.debug(spawn?'spawn received':'removal received',p);
    const discard=reason=>{
      this.debug('projectile discarded',p,reason);
      if(spawn)this.remoteTrace('spawn discarded',{playerId:p?.playerId,projectileId:p?.projectileId,reason});
    };
    if(this.closed||m.closed||!m.joined||m.match.state!=='active'){discard('inactive');return;}
    if(message.roomId!==m.roomId){discard('room_mismatch');return;}
    if(!m.peers.has(message.senderId)){discard('unknown_peer');return;}
    if(!(spawn?validPvpProjectile(p):validPvpProjectileIdentity(p))){discard('invalid_payload');return;}
    if(p.playerId===m.playerId){discard('self_player');return;}
    const participant=m.match.participants.find(member=>member.playerId===p.playerId);
    if(!participant||(spawn&&participant.life!==p.life)){discard('stale_participant_life');return;}
    const owner=m.playerPeers.get(p.playerId);
    if((owner&&owner!==message.senderId)||[...m.playerPeers].some(([id,peer])=>peer===message.senderId&&id!==p.playerId)){
      discard('peer_owner_mismatch');return;
    }
    m.playerPeers.set(p.playerId,message.senderId);
    const at=this.now();for(const [id,expiry] of this.seen)if(at>=expiry)this.seen.delete(id);
    const key=message.senderId,last=this.latest.get(key);
    if(spawn&&(this.seen.has(p.projectileId)||(last&&(p.life<last.life||message.seq<=last.seq
      ||(p.life===last.life&&p.shotSeq<=last.shotSeq))))){
      discard('duplicate_or_stale');return;
    }
    const offset=m.transport.getStats().serverOffsetMs;
    // Estimate delivery age from the relay's clock, never another browser's.
    const age=Number.isFinite(offset)&&Number.isFinite(message.serverTime)?Math.max(0,this.wallNow()+offset-message.serverTime):0;
    if(spawn&&age>=p.ttlMs){discard('expired_in_transit');return;}
    // Tombstone a destroy received before its spawn. Sequence high-water marks
    // remain bounded to room peers, rejecting duplicates after tombstones expire.
    this.seen.set(p.projectileId,at+6000);
    while(this.seen.size>256)this.seen.delete(this.seen.keys().next().value);
    if(!spawn){
      const shot=this.combat.remoteShots.get(p.projectileId);
      this.remoteTrace('removal received',{playerId:p.playerId,projectileId:p.projectileId,
        visualAlive:Boolean(shot?.dot&&shot.dot.active!==false&&shot.dot.visible!==false)});
      this.combat.removeRemote(p.projectileId,p.playerId);return;
    }
    this.latest.set(key,{playerId:p.playerId,life:p.life,shotSeq:p.shotSeq,seq:message.seq});
    const characterBaseId=participant.characterBaseId;
    const attackVisual=pvpAttackVisual(characterBaseId);
    const readiness=inspectPvpAttackVisual(this.combat.scene,attackVisual);
    this.remoteTrace('player and attack visual resolved',{playerId:p.playerId,characterBaseId,
      definitionFound:Boolean(attackVisual),texture:readiness.texture,textureExists:readiness.textureExists,
      preparedFrameCount:readiness.frameCount,expectedFrameCount:readiness.expectedFrameCount,
      frameReady:readiness.frameReady,animationKey:readiness.animationKey,animationExists:readiness.animationExists});
    let visualResult=null,received=false;
    try{
      received=this.combat.receiveProjectile(p,participant,age,result=>{visualResult=result;});
    }catch(error){
      this.remoteTrace('visual renderer threw; forcing circle fallback',{playerId:p.playerId,
        characterBaseId,error:String(error)});
    }
    let shot=this.combat.remoteShots.get(p.projectileId);
    if(!shot){
      const dot=createPvpProjectileVisual(this.combat.scene,{...p,team:participant.team},null,
        this.combat.visual??PVP_PROJECTILE_VISUAL,{x:0,y:0},result=>{visualResult=result;});
      shot={...p,dot,attackVisual:null,visualOffset:{x:0,y:0},pendingAgeMs:age,
        expiresAt:Date.now()+p.ttlMs-age};
      this.combat.remoteShots.set(p.projectileId,shot);
      received=true;
    }
    const visual=shot.dot,scene=this.combat.scene;
    const addedToScene=scene?.children?.exists?scene.children.exists(visual):visual?.scene===scene;
    this.remoteTrace('visual created',{playerId:p.playerId,characterBaseId,projectileId:p.projectileId,
      visualCreated:Boolean(visual),fallbackUsed:visualResult?.fallbackUsed??!attackVisual,
      active:visual?.active!==false,visible:visual?.visible!==false,addedToScene:Boolean(addedToScene),
      texture:visualResult?.texture??readiness.texture,textureExists:visualResult?.textureExists??readiness.textureExists,
      animationKey:visualResult?.animationKey??readiness.animationKey,
      animationExists:visualResult?.animationExists??readiness.animationExists,received});
  }
  setMatch(match){
    if(this.closed)return;
    if(this.movement.closed||!match||(match.state==='ended'&&!match.retry)){this.close();return;}
    if(match.state==='ended'){this.reset();return;}
    for(const [id,shot] of this.combat.remoteShots)if(!match.participants.some(p=>p.playerId===shot.playerId))
      this.combat.removeRemote(id,shot.playerId);
    for(const peer of this.latest.keys())if(!this.movement.peers.has(peer))this.latest.delete(peer);
  }
  reset(){this.seen.clear();this.latest.clear();this.combat.clearRemote();}
  close(){if(this.closed)return;this.closed=true;for(const off of this.unsubscribe)off();this.unsubscribe=[];this.reset();}
}
