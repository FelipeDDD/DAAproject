import { PVP_RULES } from './config.js';
import { advanceMatch,reconcileParticipants,endMatch } from './matchState.js';
import { segmentRect } from './projectiles.js';

// One instance per authenticated room/round, owned only by the relay process.
// Latest positions + straight segment checks, without historical rewind/rollback.
export class PvpDamageAuthority {
  constructor(state,{now=Date.now,walls=[],getSpawn=()=>({x:0,y:0}),authorityId,onState=()=>{},commit,onFailure=()=>{},log=()=>{}}){
    Object.assign(this,{state:structuredClone(state),now,walls,getSpawn,authorityId,onState,commit,onFailure,log});
    this.round=state.round??0;this.revision=state.damageRevision??0;this.version=0;this.closed=false;this.failed=false;
    this.members=new Map();this.positions=new Map();this.projectiles=new Map();this.fired=new Map();this.queue=Promise.resolve();
  }
  register(playerId,peerId){
    if(this.closed||!this.state.participants.some(p=>p.playerId===playerId))return false;
    if(this.members.has(playerId)&&this.members.get(playerId)!==peerId)return false;
    this.members.set(playerId,peerId);return true;
  }
  remove(peerId){
    for(const [playerId,id] of this.members)if(id===peerId){this.members.delete(playerId);this.positions.delete(playerId);}
    for(const [id,p] of this.projectiles)if(p.peerId===peerId)this.projectiles.delete(id);
  }
  sync(state){
    if(this.closed)return;
    if(!state||(state.round??0)!==this.round){this.closed=true;this.onFailure('PvP round unavailable.');return;}
    // Do not let a reactive commit of an earlier queued hit restore newer HP.
    const old=this.state;
    const incoming=advanceMatch(structuredClone(state),this.now());
    this.state={...incoming,participants:incoming.participants.map(p=>{
      const current=old.participants.find(q=>q.playerId===p.playerId);
      if(current&&current.life>p.life)return {...p,life:current.life,hp:current.hp,respawnAt:current.respawnAt,lastShot:current.lastShot};
      return current&&current.life===p.life&&(state.damageRevision??0)<this.revision?
        {...p,hp:current.hp,lastShot:Math.max(p.lastShot??0,current.lastShot??0)}:p;
    })};
    this.revision=Math.max(this.revision,state.damageRevision??0);this.emit();
  }
  advance(){
    const now=this.now(),previous=this.state;
    this.state=now>=previous.expiresAt?endMatch(previous,now,'expired'):reconcileParticipants(advanceMatch(previous,now),
      previous.participants.filter(p=>p.presenceExpiresAt===undefined||now<p.presenceExpiresAt),now);
    let changed=this.state.state!==previous.state||this.state.participants.length!==previous.participants.length;
    for(const p of this.state.participants)if(previous.participants.find(q=>q.playerId===p.playerId)?.life!==p.life){
      this.positions.delete(p.playerId);changed=true;
    }
    for(const [id,p] of this.projectiles)if(now>p.expiresAt+6000)this.projectiles.delete(id);
    if(changed)this.emit();
  }
  fighter(peerId){return this.state.participants.find(p=>this.members.get(p.playerId)===peerId);}
  position(p){return this.positions.get(p.playerId)??{...this.getSpawn(p,this.state),at:this.now(),life:p.life};}
  movement(peerId,p){
    this.advance();const member=this.fighter(peerId);
    if(this.closed||!member||member.playerId!==p.playerId||member.life!==p.life)return false;
    this.positions.set(p.playerId,{x:p.x,y:p.y,life:p.life,moving:p.moving,at:this.now()});return true;
  }
  spawn(peerId,p){
    this.advance();const member=this.fighter(peerId),now=this.now(),previous=this.fired.get(p.playerId);
    if(this.closed||this.state.state!=='active'||!member||member.playerId!==p.playerId||member.hp<=0||member.life!==p.life
      ||this.projectiles.has(p.projectileId)||p.shotSeq<=Math.max(member.lastShot??0,previous?.seq??0)
      ||(previous&&now-previous.at<PVP_RULES.attackCooldownMs))return false;
    const position=this.position(member),speed=Math.hypot(p.vx,p.vy);
    if(Math.hypot(p.x-position.x,p.y-(position.y-22))>64||Math.abs(speed-PVP_RULES.projectileSpeed)>1
      ||p.ttlMs!==PVP_RULES.projectileLifetimeMs)return false;
    this.fired.set(p.playerId,{seq:p.shotSeq,at:now});
    this.projectiles.set(p.projectileId,{...p,peerId,createdAt:now,expiresAt:now+PVP_RULES.projectileLifetimeMs,consumed:false});return true;
  }
  destroy(peerId,p){const projectile=this.projectiles.get(p.projectileId);
    if(projectile?.peerId===peerId){projectile.consumed=true;return true;}return false;}
  attempt(peerId,p){
    this.advance();const now=this.now(),shot=this.projectiles.get(p.projectileId),shooter=this.fighter(peerId);
    const target=this.state.participants.find(member=>member.playerId===p.targetId);
    const reject=reason=>{const result={projectileId:p.projectileId,shooterId:shooter?.playerId??'unknown',targetId:p.targetId,
      accepted:false,reason,damage:0,hpBefore:target?.hp??null,hpAfter:target?.hp??null};this.log(result);return result;};
    if(this.closed||this.state.state!=='active'||!shooter||shooter.hp<=0)return reject('inactive_shooter');
    if(!target||!this.members.has(target.playerId)||target.hp<=0)return reject('inactive_target');
    if(!this.state.room||shooter.presenceRoom!==this.state.room||target.presenceRoom!==this.state.room)return reject('wrong_presence_room');
    if(shooter.playerId===target.playerId)return reject('self_hit');
    if(shooter.team===target.team)return reject('friendly_fire');
    if(!shot)return reject('unknown_projectile');
    if(shot.peerId!==peerId||shot.playerId!==shooter.playerId)return reject('wrong_projectile_owner');
    if(now>=shot.expiresAt)return reject('expired_projectile');
    if(shot.consumed)return reject('projectile_consumed');
    if(shot.life!==shooter.life||target.life!==p.targetLife)return reject('stale_life');
    if(shot.shotSeq<=(shooter.lastShot??0))return reject('stale_shot');
    if([shooter,target].some(member=>{const pos=this.positions.get(member.playerId);return pos?.moving&&now-pos.at>1000;}))return reject('stale_position');
    const elapsed=Math.min(PVP_RULES.projectileLifetimeMs,now-shot.createdAt+80)/1000;
    const end={x:shot.x+shot.vx*elapsed,y:shot.y+shot.vy*elapsed};
    let first=Infinity,victim=null;
    for(const wall of this.walls){const t=segmentRect(shot,end,wall);if(t!==null&&t<first)first=t;}
    for(const member of this.state.participants){
      if(member.playerId===shooter.playerId||member.hp<=0)continue;
      const pos=this.position(member),t=segmentRect(shot,end,{x:pos.x-25,y:pos.y-58,width:50,height:68});
      if(t!==null&&t<first){first=t;victim=member;}
    }
    if(victim?.playerId!==target.playerId)return reject('trajectory_or_cover');
    const hpBefore=target.hp,hpAfter=Math.max(0,hpBefore-PVP_RULES.damage),expectedRevision=this.revision++;
    shot.consumed=true;target.hp=hpAfter;shooter.lastShot=shot.shotSeq;
    const result={projectileId:p.projectileId,shooterId:shooter.playerId,targetId:target.playerId,accepted:true,
      reason:'accepted',damage:hpBefore-hpAfter,hpBefore,hpAfter};this.log(result);this.emit();
    const args={matchId:this.state.matchId,round:this.round,expectedRevision,shooterId:shooter.playerId,targetId:target.playerId,
      attackerLife:shooter.life,targetLife:target.life,shotSeq:shot.shotSeq,hpBefore,hpAfter,acceptedAt:now};
    this.queue=this.queue.then(()=>{if(this.failed)throw new Error('Authority failed.');return this.commit(args);}).then(response=>{
      if(!response?.applied)throw new Error('Damage commit rejected.');
    }).catch(()=>{this.failed=true;if(!this.closed){this.closed=true;
      // An end/host departure can win the transaction race against a queued hit.
      // Keep the existing match-end recovery instead of replacing its reason.
      if(this.state.state!=='ended')this.onFailure('Realtime damage synchronization failed. Rejoin the match.');
    }});
    return result;
  }
  emit(){if(!this.closed)this.onState({authorityId:this.authorityId,version:++this.version,round:this.round,
    damageRevision:this.revision,players:this.state.participants.map(({playerId,life,hp})=>({playerId,life,hp}))});}
  close(){this.closed=true;this.members.clear();this.positions.clear();this.projectiles.clear();this.fired.clear();}
}
