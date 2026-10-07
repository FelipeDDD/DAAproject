import { createRealtimeTransport } from '../realtime/createTransport.js';
import { validPvpMovement } from '../realtime/realtimeMessages.js';
import { PVP_MOVEMENT_CONFIG,pvpRealtimeRoom } from './movementConfig.js';

// Movement uses this adapter; projectile events reuse its socket and room.
// Convex still supplies participants and cosmetics.
export class PvpMovementClient {
  constructor({matchId,match,playerId,url,remotes,getSpawn,snapshot,
    config={},transport,now=()=>performance.now(),log=(event,data)=>console.debug('[PvP movement]',event,data)}){
    Object.assign(this,{playerId,remotes,getSpawn,snapshot,now,log});
    this.config={...PVP_MOVEMENT_CONFIG,...config};
    if(!Number.isFinite(this.config.hz)||this.config.hz<1||this.config.hz>50)throw new Error('Invalid PvP movement Hz');
    this.round=match.round??0;this.roomId=pvpRealtimeRoom(matchId,this.round);
    this.transport=transport??createRealtimeTransport({url,roomId:this.roomId});
    this.closed=false;this.joined=false;this.sampleSeq=0;this.nextSendAt=0;
    this.teleportPending=false;this.authorizedPoseSent=false;
    this.peers=new Set();this.received=new Map();this.playerPeers=new Map();this.rows=[];
    this.previousDebug=remotes.movementDebug;
    this.previousDebugInterval=remotes.movementDebugIntervalMs;
    remotes.movementDebug=this.config.debug?(event,data)=>this.debug(event,data):null;
    remotes.movementDebugIntervalMs=this.config.debugRenderIntervalMs;
    remotes.bufferOptions={...remotes.bufferOptions,delayMs:this.config.interpolationMs};
    this.setMatch(match);
    if(this.closed)return;
    this.unsubscribe=[
      this.transport.onMessage(message=>this.receive(message)),
      this.transport.onConnectionState(state=>{
        if(this.closed)return;
        this.log(state,{roomId:this.roomId,playerId});
        if(state!=='connected'){this.joined=false;this.authorizedPoseSent=false;this.peers.clear();this.received.clear();this.playerPeers.clear();}
      }),
    ];
    this.transport.connect().catch(error=>{if(!this.closed)this.log('connection failed',{roomId:this.roomId,error:String(error)});});
  }

  debug(event,data){if(this.config.debug)this.log(event,{roomId:this.roomId,localPlayerId:this.playerId,...data});}

  setMatch(match){
    if(this.closed)return;
    this.match=match;
    // A Convex departure can arrive before the relay's ended/Retry snapshot.
    // End combat sends now, but keep the shared lifecycle socket until explicit
    // scene exit or the authoritative round handoff, regardless of echo order.
    if(!match||!['countdown','active','ended'].includes(match.state)||(match.round??0)!==this.round){this.close();return;}
    this.renderRoster();
  }
  switchRound(match){
    if(this.closed||match.round!==this.round+1||match.state!=='countdown')return false;
    this.round=match.round;this.roomId=pvpRealtimeRoom(match.matchId,this.round);this.transport.roomId=this.roomId;
    this.joined=false;this.sampleSeq=0;this.nextSendAt=0;this.teleportPending=false;this.authorizedPoseSent=false;
    this.peers.clear();this.received.clear();this.playerPeers.clear();
    this.remotes.receive([]);this.setMatch(match);
    this.transport.sendReliable('join-room',{});return true;
  }

  receiveRoster(rows){
    if(this.closed)return;
    // Participants can precede Presence during a transition. Retain the last
    // known appearance for current members; Retry recreates sprites, not skins.
    this.rows=this.match.participants.map(p=>rows.find(row=>row.playerId===p.playerId)
      ??this.rows.find(row=>row.playerId===p.playerId)
      ??this.remotes.players?.get(p.playerId)?.row).filter(Boolean);
    this.renderRoster();
  }
  markTeleport(){
    if(this.closed)return false;
    this.teleportPending=true;this.nextSendAt=Math.min(this.nextSendAt,this.now());return true;
  }
  renderRoster(){
    const rows=this.match.participants.filter(p=>p.playerId!==this.playerId).map(p=>{
      const metadata=this.rows.find(row=>row.playerId===p.playerId)??this.remotes.players?.get(p.playerId)?.row;
      const spawn=this.getSpawn(p,this.match);
      // Presence coordinates/timestamps never enter the movement buffer.
      return {...metadata,...p,x:spawn.x,y:spawn.y,direction:spawn.direction??'down',
        characterBaseId:metadata?.characterBaseId??p.characterBaseId,
        equippedSkin:metadata?.equippedSkin??'classic',activeCharacterItem:null};
    });
    this.remotes.receive(rows,{movement:false});
    for(const [playerId,peerId] of this.playerPeers)if(!rows.some(row=>row.playerId===playerId)){
      this.playerPeers.delete(playerId);this.received.delete(peerId);
    }
    // A realtime sample may have arrived before this Convex roster or its sprite.
    for(const [peerId,state] of this.received)this.applyLatest(peerId,state);
  }

  receive(message){
    const movement=message.type==='pvp-movement';
    if(movement)this.debug('snapshot received',{peerId:message.senderId,playerId:message.payload?.playerId,
      snapshotRoom:message.roomId,sampleSeq:message.payload?.sampleSeq,seq:message.seq,
      playerIdType:typeof message.payload?.playerId,localPlayerIdType:typeof this.playerId});
    const discard=reason=>this.debug('snapshot discarded',{reason,peerId:message.senderId,
      playerId:message.payload?.playerId,snapshotRoom:message.roomId,sampleSeq:message.payload?.sampleSeq});
    if(this.closed){if(movement)discard('closed');return;}
    if(message.type==='welcome'){this.transport.sendReliable('join-room',{});return;}
    if(message.roomId!==this.roomId){if(movement)discard('room_mismatch');return;}
    if(message.type==='room-state'){
      this.joined=true;this.nextSendAt=this.now();
      this.peers=new Set(message.payload.peers.map(peer=>peer.clientId));
      this.log('joined',{roomId:this.roomId,peerId:this.transport.getStats().clientId,playerId:this.playerId});return;
    }
    if(message.type==='pvp-authorized'){
      if(!this.authorizedPoseSent&&message.payload.playerId===this.playerId&&message.payload.round===this.round){
        // Pre-auth ticks are discarded by the relay. Publish the current pose
        // through the same sequence/path before the damage listener enables fire,
        // even if the next periodic movement deadline has not arrived yet.
        this.authorizedPoseSent=Boolean(this.update(this.now(),{force:true,reliable:true}));
      }
      return;
    }
    if(message.type==='peer-joined'){this.peers.add(message.payload.clientId);return;}
    if(message.type==='peer-left'){
      const peerId=message.payload.clientId;this.peers.delete(peerId);this.received.delete(peerId);
      for(const [playerId,id] of this.playerPeers)if(id===peerId)this.playerPeers.delete(playerId);
      return;
    }
    if(!movement)return;
    if(this.match.state==='ended'){discard('match_ended');return;}
    if(!this.joined){discard('room_not_joined');return;}
    if(!this.peers.has(message.senderId)){discard('unknown_peer');return;}
    const p=message.payload;
    if(!validPvpMovement(p)){discard('invalid_payload');return;}
    if(p.playerId===this.playerId){discard('self_player');return;}
    const participant=this.match.participants.find(member=>member.playerId===p.playerId);
    if(participant&&p.life<participant.life){discard('old_life');return;}
    const previous=this.received.get(message.senderId);
    if(previous&&((p.life<previous.life&&previous.life<=participant?.life)||message.seq<=previous.seq
      ||(p.life===previous.life&&p.sampleSeq<=previous.sampleSeq))){
      this.log('discarded stale',{roomId:this.roomId,peerId:message.senderId,playerId:p.playerId,sampleSeq:p.sampleSeq});
      discard('stale_sequence');return;
    }
    const owner=this.playerPeers.get(p.playerId);
    if(owner&&owner!==message.senderId){discard('player_owned_by_other_peer');return;}
    if(previous?.authorized&&previous.playerId!==p.playerId){discard('peer_player_changed');return;}
    if(!previous)this.log('remote sender',{roomId:this.roomId,peerId:message.senderId,playerId:p.playerId});
    // Bounded to one latest sample per known room peer. Do not mark delivery as
    // successful until the participant AND renderer are ready.
    const state={playerId:p.playerId,sampleSeq:p.sampleSeq,seq:message.seq,life:p.life,payload:{...p},
      applied:false,authorized:Boolean(participant),reset:Boolean(p.teleport)||!previous?.applied||previous.life!==p.life,entity:previous?.entity};
    this.received.set(message.senderId,state);
    this.debug('snapshot accepted',{peerId:message.senderId,playerId:p.playerId,sampleSeq:p.sampleSeq});
    this.applyLatest(message.senderId,state);
  }

  applyLatest(peerId,state){
    const p=state.payload,participant=this.match.participants.find(member=>member.playerId===p.playerId);
    const defer=reason=>{
      if(state.waitReason!==reason)this.debug('snapshot deferred',{reason,peerId,playerId:p.playerId,sampleSeq:p.sampleSeq});
      state.waitReason=reason;
    };
    if(!participant){defer('participant_not_ready');return;}
    if(p.life!==participant.life){defer(p.life<participant.life?'old_life':'participant_life_not_ready');return;}
    const owner=this.playerPeers.get(p.playerId);
    if(owner&&owner!==peerId){defer('player_owned_by_other_peer');return;}
    const entity=this.remotes.players?.get(p.playerId);
    if(state.applied&&state.entity===entity)return;
    state.authorized=true;this.playerPeers.set(p.playerId,peerId);
    const applied=this.remotes.receiveMovement(p.playerId,{x:p.x,y:p.y,direction:p.direction,
      moving:p.moving,velocityX:p.vx,velocityY:p.vy},{reset:state.reset||state.entity!==entity});
    if(applied===false){defer('sprite_not_ready');return;}
    if(p.life>0&&state.reset)this.debug('first movement after respawn',{peerId,playerId:p.playerId,life:p.life,sampleSeq:p.sampleSeq});
    state.applied=true;state.entity=entity;state.waitReason=null;
    this.debug('snapshot applied',{peerId,playerId:p.playerId,sampleSeq:p.sampleSeq,x:p.x,y:p.y,
      remoteFound:Boolean(entity),spriteCreated:Boolean(entity?.sprite)});
  }

  update(at=this.now(),{force=false,reliable=false}={}){
    if(this.closed)return;
    for(const [peerId,state] of this.received)this.applyLatest(peerId,state);
    if(!this.joined||this.match.state==='ended'||(!force&&at<this.nextSendAt))return;
    const interval=1000/this.config.hz;
    // Keep the time grid but skip old slots after tab suspension; never burst.
    if(force)this.nextSendAt=at+interval;
    else this.nextSendAt+=(Math.floor((at-this.nextSendAt)/interval)+1)*interval;
    const local=this.snapshot();if(!local)return;
    const payload={...local,playerId:this.playerId,sampleSeq:++this.sampleSeq};
    if(this.teleportPending)payload.teleport=true;
    const sent=reliable?this.transport.sendReliable('pvp-movement',payload):this.transport.sendUnreliable('pvp-movement',payload);
    if(sent)this.teleportPending=false;
    return sent;
  }

  close(){
    if(this.closed)return;this.closed=true;this.joined=false;
    for(const off of this.unsubscribe??[])off();this.unsubscribe=[];
    this.transport.disconnect();this.peers.clear();this.received.clear();this.playerPeers.clear();this.rows=[];
    this.remotes.movementDebug=this.previousDebug;
    this.remotes.movementDebugIntervalMs=this.previousDebugInterval;
  }
}
