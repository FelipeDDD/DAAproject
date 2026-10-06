import { PVP_RULES,PVP_MAP_DEFINITION } from './config.js';
import { PAYLOAD_REGEN } from './payload/config.js';
import { advanceMatch,reconcileParticipants,endMatch,registerPlayerDeath,interruptedMatch } from './matchState.js';
import { combatSnapshot,fighterFields } from './combatSnapshot.js';
import { segmentRect,pvpPlayerHitboxAt } from './projectiles.js';
import { PvpRetryCoordinator } from './PvpRetryCoordinator.js';
import { matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings } from './matchSettings.js';
import { PvpPickupAuthority } from './pickups/PvpPickupAuthority.js';
import { SkillAuthority } from './skills/SkillAuthority.js';

// One instance per authenticated room/round, owned only by the relay process.
// Latest positions + straight segment checks, without historical rewind/rollback.
export class PvpDamageAuthority {
  constructor(state,{now=Date.now,walls=[],getSpawn=()=>({x:0,y:0}),authorityId,onState=()=>{},commit,onFailure=()=>{},onRetryResolve,modeAuthority=null,pickupSpots=[],skillRegistry,log=()=>{},schedule=setTimeout,cancel=clearTimeout}){
    Object.assign(this,{state:structuredClone(state),now,walls,getSpawn,authorityId,onState,commit,onFailure,log,schedule,cancel,mode:modeAuthority});
    this.settings=matchSettingsFor(state);
    if(this.settings.teamOverrides){for(const fields of Object.values(this.settings.teamOverrides))Object.freeze(fields);Object.freeze(this.settings.teamOverrides);}
    Object.freeze(this.settings);this.state.matchSettings=this.settings;
    if(this.mode)this.state.payload=this.mode.current;
    this.round=state.round??0;this.revision=state.damageRevision??0;this.version=0;this.closed=false;this.failed=false;
    this.pickups=new PvpPickupAuthority(pickupSpots,this.round);
    this.regenEnabled=state.mode==='payload'&&state.arenaMap?.id===PVP_MAP_DEFINITION.id
      &&state.arenaMap?.file===PVP_MAP_DEFINITION.file&&state.arenaMap?.revision===PVP_MAP_DEFINITION.revision;
    this.regen=new Map();
    this.members=new Map();this.positions=new Map();this.projectiles=new Map();this.fired=new Map();this.diagnostics=new Map();this.queue=Promise.resolve();
    this.skills=new SkillAuthority(this.round,{state:()=>this.state,fighter:peerId=>this.fighter(peerId),
      position:player=>this.position(player),connected:playerId=>this.members.has(playerId),
      damage:(instance,target,amount,at)=>this.applySkillDamage(instance,target,amount,at)},{registry:skillRegistry});
    if(onRetryResolve)this.retry=new PvpRetryCoordinator({now,schedule,cancel,onChange:()=>this.emit(),onResolve:async playerIds=>{
      await this.queue;if(this.closed||this.failed)return;
      try{await onRetryResolve(playerIds);}catch{this.retry.close();this.onFailure('Retry synchronization failed. Leave and rejoin the lobby.');}
    }});
    this.events=[];this.arm();
  }
  register(playerId,peerId,sessionId){
    if(this.closed||!this.state.participants.some(p=>p.playerId===playerId))return false;
    if(this.members.has(playerId)&&this.members.get(playerId)!==peerId)return false;
    this.members.set(playerId,peerId);
    this.skills.register(playerId,peerId,sessionId);
    this.log({event:'combat player initialized',...this.combatContext(this.fighter(peerId)),peerId});
    this.updateRetry();return true;
  }
  remove(peerId){
    this.skills.remove(peerId);
    const departed=[];
    for(const [playerId,id] of this.members)if(id===peerId){departed.push(playerId);this.members.delete(playerId);this.positions.delete(playerId);}
    if(departed.includes(this.state.hostPlayerId)){
      this.hostLeaveObserved=true;
      this.traceHostLeave('participant disconnected',{peerId,remainingParticipants:[...this.members.keys()]});
    }
    for(const [id,p] of this.projectiles)if(p.peerId===peerId)this.projectiles.delete(id);
    // During play a disconnect cancels that fighter's pending respawn. During
    // the end window it removes their vote/member without changing the result.
    if(departed.length&&['countdown','active'].includes(this.state.state)){
      const previous=this.state;
      this.state=reconcileParticipants(previous,previous.participants.filter(p=>!departed.includes(p.playerId)),this.now());
      this.publish(previous,'peer left');
    }
    if(departed.length)this.updateRetry();
  }
  sync(state){
    if(this.closed)return;
    // Freeze the decided round while draining mirrors and saving its successor.
    // The transaction still validates concurrent Leave/session expiry; an echo
    // must not enqueue another old-round mirror or precede the room handoff.
    if(this.retry?.resolving)return;
    if(!state||(state.round??0)!==this.round){this.close();this.onFailure('PvP round unavailable.');return;}
    // Convex echoes supply membership/leases ONLY, never combat decisions.
    const previous=this.state;
    const participants=state.participants.filter(p=>previous.participants.some(q=>q.playerId===p.playerId)).map(p=>{
      const current=previous.participants.find(q=>q.playerId===p.playerId);
      return current?{...p,...Object.fromEntries(fighterFields.map(k=>[k,current[k]]))}:p;
    });
    this.state=reconcileParticipants({...previous,participants},participants,this.now());
    if(interruptedMatch(state)&&!interruptedMatch(this.state)){
      this.state=endMatch(this.state,this.now(),state.reason);
      this.state={...this.state,reason:state.reason,endedAt:state.endedAt??this.now()};
    }
    if(this.changed(previous))this.publish(previous,'membership');
    this.updateRetry();
    this.advance();
  }
  changed(previous){return JSON.stringify(combatSnapshot(previous))!==JSON.stringify(combatSnapshot(this.state));}
  // TEMP: narrow diagnostics for host departure; no per-tick combat logging.
  traceHostLeave(event,detail={}){
    if(!this.hostLeaveObserved&&!['host_left','host-left'].includes(this.state.reason))return;
    this.hostLeaveObserved=true;
    console.info(`[PVP host leave] ${event}`,{matchId:this.state.matchId,round:this.round,state:this.state.state,
      remainingParticipants:this.state.participants.map(p=>p.playerId),...detail});
  }
  arm(){
    let deadline=null;
    if(!this.closed&&!['waiting','ended'].includes(this.state.state)){
      const m=this.state,deadlines=[m.endsAt,m.expiresAt,...m.participants.map(p=>p.presenceExpiresAt),...m.participants.map(p=>p.respawnAt)];
      if(m.state==='countdown')deadlines.push(m.startedAt);
      if(this.mode)deadlines.push(this.mode.nextDeadline(m));
      deadlines.push(this.pickups.nextDeadline(m));
      deadlines.push(this.skills.nextDeadline());
      if(this.regenEnabled&&m.state==='active')for(const [playerId,entry] of this.regen){
        const player=m.participants.find(p=>p.playerId===playerId);
        if(player?.life===entry.life&&player.hp>0&&player.hp<effectiveMatchSettings(this.state,player.team).maxHp)deadlines.push(entry.nextAt);
      }
      const finite=deadlines.filter(Number.isFinite);if(finite.length)deadline=Math.min(...finite);
    }
    if(deadline===this.deadline)return;
    if(this.timer!==undefined)this.cancel(this.timer);
    this.timer=undefined;this.deadline=deadline;
    if(deadline!==null){
      this.timer=this.schedule(()=>{this.timer=undefined;this.deadline=null;if(!this.closed)this.advance();},Math.max(0,deadline-this.now()));
      this.timer?.unref?.();
    }
  }
  publish(previous,source,detail={}){
    if(this.state.state==='ended')this.advanceObjective(this.now());
    if(this.state.state==='ended')this.pickups.stop();
    this.skills.reconcile();
    this.revision++;this.transitions(previous,source);
    const events=[];
    for(const p of this.state.participants){
      const old=previous.participants.find(q=>q.playerId===p.playerId);if(!old)continue;
      if(old.hp>0&&p.hp===0){
        const event={type:'death',playerId:p.playerId,life:p.life,...detail,respawnAt:p.respawnAt};events.push(event);
        this.log({event:'death accepted',...event,scoreBefore:previous.scores,scoreAfter:this.state.scores});
        if(p.respawnAt!==null)this.log({event:'respawn scheduled',playerId:p.playerId,life:p.life,respawnAt:p.respawnAt});
      }else if(p.life>old.life)events.push({type:'respawn',playerId:p.playerId,life:p.life,hp:p.hp});
    }
    if(previous.state!=='ended'&&this.state.state==='ended'){
      events.push({type:'match-ended',reason:this.state.reason,winner:this.state.winner});
      this.log({event:'match ended',reason:this.state.reason,winner:this.state.winner,scores:this.state.scores});
      this.projectiles.clear();
      if(this.retry&&this.state.reason!=='expired')this.retry.begin(this.state.endedAt,this.retryParticipants());
    }
    this.events=events;this.arm();this.emit();
    if(previous.reason!==this.state.reason&&['host_left','host-left'].includes(this.state.reason))
      this.traceHostLeave('server lifecycle transition',{source,previousState:previous.state,reason:this.state.reason,
        combatTimerActive:this.timer!==undefined,retryTimerActive:this.retry?.timer!==undefined,retryDeadline:this.retry?.deadline});
    const args={matchId:this.state.matchId,round:this.round,authorityId:this.authorityId,
      expectedRevision:this.revision-1,revision:this.revision,snapshot:combatSnapshot(this.state)};
    if(this.retry?.deadline!==undefined)args.retryDeadline=this.retry.deadline;
    this.queue=this.queue.then(()=>{if(this.failed)throw new Error('Authority failed.');return this.commit(args);}).then(response=>{
      if(!response?.applied)throw new Error('Combat mirror rejected.');
    }).catch(()=>{this.failed=true;if(!this.closed){const ended=this.state.state==='ended';this.close();
      this.log({event:'combat mirror rejected',round:this.round,revision:this.revision,reason:'persistence_failed'});
      if(!ended||this.retry?.deadline!==undefined)this.onFailure('Realtime combat synchronization failed. Rejoin the match.');
    }});
  }
  requestEnd(peerId){
    const member=this.fighter(peerId);
    if(this.closed||member?.playerId!==this.state.hostPlayerId||!['countdown','active'].includes(this.state.state)){
      this.log({event:'end rejected',playerId:member?.playerId,reason:'inactive_or_not_host'});return false;
    }
    const previous=this.state;this.state=endMatch(previous,this.now(),'dev-ended');this.publish(previous,'host request');return true;
  }
  retryParticipants(){return this.state.participants.filter(p=>this.members.has(p.playerId)
    &&(p.presenceExpiresAt===undefined||this.now()<p.presenceExpiresAt));}
  updateRetry(){if(this.retry?.deadline!==undefined)this.retry.update(this.retryParticipants());}
  requestRetry(peerId,round){
    const member=this.fighter(peerId);
    if(this.closed||this.state.state!=='ended'||round!==this.round||!member)return false;
    this.updateRetry();return this.retry?.vote(member.playerId)??false;
  }
  transitions(previous,source){
    if(previous.state==='countdown'&&this.state.state==='active')
      this.log({event:'match active',round:this.round,room:this.state.room,
        players:this.state.participants.map(p=>this.combatContext(p))});
    for(const p of this.state.participants){
      const old=previous.participants.find(q=>q.playerId===p.playerId);if(!old)continue;
      if(p.life>old.life){this.positions.delete(p.playerId);
        this.log({event:'respawn applied',source,playerId:p.playerId,lifeBefore:old.life,lifeAfter:p.life,hp:p.hp});}
      else if(old.hp>0&&p.hp===0)this.log({event:'death applied',source,playerId:p.playerId,lifeBefore:old.life,lifeAfter:p.life,hpBefore:old.hp,hpAfter:p.hp});
    }
  }
  firstAfterRespawn(event,member,extra={}){
    if(!member)return;
    const seen=this.diagnostics.get(member.playerId)??{};
    if(seen[event]===member.life)return;
    seen[event]=member.life;this.diagnostics.set(member.playerId,seen);
    this.log({event:`first ${event} ${member.life===0?'after match start':'after respawn'}`,...this.combatContext(member),...extra});
  }
  combatContext(member){
    const position=member&&this.position(member);
    return {matchId:this.state.matchId,room:this.state.room,round:this.round,state:this.state.state,
      playerId:member?.playerId,life:member?.life,hp:member?.hp,alive:Boolean(member&&member.hp>0),
      sessionOwned:Boolean(member&&this.members.has(member.playerId)),presenceRoom:member?.presenceRoom,
      lastShot:member?.lastShot,position:position&&{x:position.x,y:position.y,life:position.life,
        source:this.positions.has(member.playerId)?'movement':'spawn',ageMs:this.now()-position.at}};
  }
  advanceRegen(now){
    if(!this.regenEnabled||this.state.state!=='active')return false;
    let changed=false;
    const participants=this.state.participants.map(player=>{
      const entry=this.regen.get(player.playerId);
      if(!entry)return player;
      const maxHp=effectiveMatchSettings(this.state,player.team).maxHp;
      if(player.life!==entry.life||player.hp<=0||player.hp>=maxHp){this.regen.delete(player.playerId);return player;}
      if(now<entry.nextAt)return player;
      const intervals=Math.floor((now-entry.nextAt)/PAYLOAD_REGEN.intervalMs)+1;
      const hp=Math.min(maxHp,player.hp+intervals*PAYLOAD_REGEN.hpPerInterval);
      entry.nextAt+=intervals*PAYLOAD_REGEN.intervalMs;
      if(hp===maxHp)this.regen.delete(player.playerId);
      changed=true;return {...player,hp};
    });
    for(const playerId of this.regen.keys())if(!participants.some(p=>p.playerId===playerId))this.regen.delete(playerId);
    if(changed)this.state={...this.state,participants};
    return changed;
  }
  advance(){
    if(this.closed||this.retry?.resolving)return;
    const now=this.now(),previous=this.state;
    const modeChanged=this.advanceObjective(Math.min(now,previous.endsAt??now));
    const source=this.state;
    const advanced=advanceMatch(source,now,this.mode?{finish:(m,at)=>this.mode.finishTimeout(m,at)}:undefined);
    this.state=now>=previous.expiresAt?endMatch(advanced,now,'expired'):reconcileParticipants(advanced,
      advanced.participants.filter(p=>p.presenceExpiresAt===undefined||now<p.presenceExpiresAt),now);
    const regenerated=this.advanceRegen(now);
    const pickupsChanged=this.pickups.advance(now,this.state);
    this.skillDamageChanged=false;
    const skillsChanged=this.skills.advance(now);
    let changed=regenerated||this.skillDamageChanged||this.state.state!==previous.state||this.state.participants.length!==previous.participants.length;
    for(const p of this.state.participants)if(previous.participants.find(q=>q.playerId===p.playerId)?.life!==p.life){
      this.positions.delete(p.playerId);changed=true;
    }
    for(const [id,p] of this.projectiles)if(now>p.expiresAt+6000)this.projectiles.delete(id);
    const broadcast=this.mode?.shouldBroadcast(now,previous.payload);
    if(changed)this.publish(previous,'realtime clock');else{if(pickupsChanged||skillsChanged||modeChanged&&broadcast)this.emit();this.arm();}
  }
  advanceObjective(at){
    if(!this.mode)return false;
    let source=this.state;
    if(source.state==='countdown'&&at>=source.startedAt)source=advanceMatch(source,source.startedAt);
    const result=this.mode.advance(at,source,this.positions,this.members,this.getSpawn);
    const changed=JSON.stringify(result.payload)!==JSON.stringify(this.state.payload);
    this.state={...source,payload:result.payload};
    if(result.winner)this.state={...endMatch(this.state,result.endedAt,'payload-delivered'),winner:result.winner};
    return changed;
  }
  fighter(peerId){return this.state.participants.find(p=>this.members.get(p.playerId)===peerId);}
  position(p){return this.positions.get(p.playerId)??{...this.getSpawn(p,this.state),at:this.now(),life:p.life};}
  movement(peerId,p){
    this.advance();const member=this.fighter(peerId);
    const reason=this.closed?'authority_closed':this.state.state==='ended'?'match_ended':!member?'unowned_player':member.playerId!==p.playerId?'player_mismatch':member.life!==p.life?'stale_life':null;
    if(reason){this.log({event:'movement rejected',playerId:p.playerId,life:p.life,expectedLife:member?.life,reason});return false;}
    // The movement adapter remains client-positioned (including authored
    // teleports), but velocity uses the same round speed as local input.
    const maxSpeed=pvpMovementSpeed(this.state,member.team);
    if(Math.hypot(p.vx??0,p.vy??0)>maxSpeed+1){
      this.log({event:'movement rejected',playerId:p.playerId,life:p.life,reason:'movement_speed',maxSpeed});return false;
    }
    this.positions.set(p.playerId,{x:p.x,y:p.y,direction:p.direction,life:p.life,moving:p.moving,at:this.now()});
    this.firstAfterRespawn('movement',member,{sampleSeq:p.sampleSeq});
    if(this.mode)this.advance();
    this.collectPickups(peerId);return true;
  }
  collectPickups(peerId){
    if(this.closed||this.failed||this.state.state!=='active')return false;
    const player=this.fighter(peerId),position=player&&this.positions.get(player.playerId);
    if(!player||!position)return false;
    const result=this.pickups.collectAt(player,position,this.state,this.now());if(!result)return false;
    const previous=this.state;
    this.state={...previous,participants:previous.participants.map(p=>p===player?{...p,...result.changes}:p)};
    this.log({event:'pickup collected',round:this.round,pickupId:result.pickupId,playerId:player.playerId,
      hpBefore:player.hp,hpAfter:result.changes.hp});
    this.publish(previous,'pickup');return true;
  }
  useSkill(peerId,request){
    this.advance();
    const result=this.skills.use(peerId,request,this.now());
    if(result.accepted){this.events=[];this.arm();this.emit();}
    return result;
  }
  applySkillDamage(instance,target,amount,now){
    // Reuse established HP, regen, death/score and respawn rules through a
    // separate adapter. Normal character projectiles stay on their own path.
    const owner=this.state.participants.find(p=>p.playerId===instance.ownerId);
    const victim=this.state.participants.find(p=>p.playerId===target.playerId);
    if(this.closed||this.state.state!=='active'||instance.round!==this.round
      ||!owner||owner.life!==instance.ownerLife||owner.hp<=0||!this.members.has(owner.playerId)
      ||!victim||victim.life!==target.life||victim.hp<=0||!this.members.has(victim.playerId)
      ||owner.playerId===victim.playerId||owner.team===victim.team
      ||victim.presenceRoom!==this.state.room||!Number.isFinite(amount)||amount<=0)return false;
    const hp=Math.max(0,victim.hp-amount);
    this.state={...this.state,participants:this.state.participants.map(p=>p===victim?{...p,hp}:p)};
    if(this.regenEnabled){
      if(hp>0)this.regen.set(victim.playerId,{life:victim.life,nextAt:now+PAYLOAD_REGEN.delayMs});
      else this.regen.delete(victim.playerId);
    }
    if(hp===0)this.state=registerPlayerDeath(this.state,owner.playerId,victim.playerId,now,{scoreVictory:this.mode?.scoreVictory??true});
    this.skillDamageChanged=true;return true;
  }
  spawn(peerId,p){
    this.advance();const member=this.fighter(peerId),now=this.now(),previous=this.fired.get(p.playerId);
    const reject=reason=>{this.log({event:'projectile rejected',...this.combatContext(member),reason,playerId:p.playerId,
      projectileId:p.projectileId,life:p.life,expectedLife:member?.life,shotSeq:p.shotSeq,previousShot:previous,
      origin:{x:p.x,y:p.y}});return false;};
    if(this.closed||this.state.state!=='active')return reject('inactive_authority_or_match');
    if(!member||member.playerId!==p.playerId)return reject('unowned_player');
    if(member.life!==p.life)return reject('stale_life');
    if(member.hp<=0)return reject('dead_shooter');
    if(this.projectiles.has(p.projectileId)||p.shotSeq<=Math.max(member.lastShot??0,previous?.life===p.life?previous.seq:0))return reject('duplicate_or_stale_sequence');
    if(previous?.life===p.life&&now-previous.at<effectiveMatchSettings(this.state,member.team).attackCooldownMs)return reject('cooldown');
    const position=this.position(member),speed=Math.hypot(p.vx,p.vy);
    if(Math.hypot(p.x-position.x,p.y-(position.y-22))>64||Math.abs(speed-PVP_RULES.projectileSpeed)>1
      ||p.ttlMs!==PVP_RULES.projectileLifetimeMs)return reject('invalid_origin_speed_or_ttl');
    this.fired.set(p.playerId,{life:p.life,seq:p.shotSeq,at:now});
    this.projectiles.set(p.projectileId,{...p,peerId,createdAt:now,expiresAt:now+PVP_RULES.projectileLifetimeMs,consumed:false,
      targetLives:Object.fromEntries(this.state.participants.map(q=>[q.playerId,q.life]))});
    this.firstAfterRespawn('projectile spawn',member,{projectileId:p.projectileId,shotSeq:p.shotSeq,registered:true});return true;
  }
  destroy(peerId,p){const projectile=this.projectiles.get(p.projectileId);
    if(projectile?.peerId===peerId&&projectile.playerId===p.playerId&&projectile.life===p.life&&projectile.shotSeq===p.shotSeq){projectile.consumed=true;return true;}return false;}
  attempt(peerId,p){
    this.advance();const now=this.now(),shot=this.projectiles.get(p.projectileId),shooter=this.fighter(peerId);
    const target=this.state.participants.find(member=>member.playerId===p.targetId);
    const context={shooter:this.combatContext(shooter),target:this.combatContext(target),projectileRegistered:Boolean(shot),
      projectileLife:shot?.life,requestedTargetLife:p.targetLife,peerId};
    const reject=reason=>{const result={projectileId:p.projectileId,shooterId:shooter?.playerId??'unknown',targetId:p.targetId,
      accepted:false,reason,damage:0,hpBefore:target?.hp??null,hpAfter:target?.hp??null};
      this.log({event:'hit rejected',...result,...context,shooterLife:shooter?.life,targetLife:target?.life});return result;};
    this.firstAfterRespawn('hit attempt',shooter,{projectileId:p.projectileId,targetId:p.targetId,...context});
    if(this.closed||this.state.state!=='active'||!shooter)return reject('inactive_shooter');
    if(!target||!this.members.has(target.playerId)||target.hp<=0)return reject('inactive_target');
    if(!this.state.room||shooter.presenceRoom!==this.state.room||target.presenceRoom!==this.state.room)return reject('wrong_presence_room');
    if(shooter.playerId===target.playerId)return reject('self_hit');
    if(shooter.team===target.team)return reject('friendly_fire');
    if(!shot)return reject('unknown_projectile');
    if(shot.peerId!==peerId||shot.playerId!==shooter.playerId)return reject('wrong_projectile_owner');
    if(now>=shot.expiresAt)return reject('expired_projectile');
    if(shot.consumed)return reject('projectile_consumed');
    // Spawn was accepted while alive. Death/respawn cannot invalidate that
    // registered flight; TTL, target life, room and single consumption still apply.
    if(shot.life>shooter.life||target.life!==p.targetLife||shot.targetLives[target.playerId]!==target.life)return reject('stale_life');
    const targetPosition=this.positions.get(target.playerId);
    if(targetPosition?.moving&&now-targetPosition.at>1000)return reject('stale_position');
    const elapsed=Math.min(PVP_RULES.projectileLifetimeMs,now-shot.createdAt+80)/1000;
    const end={x:shot.x+shot.vx*elapsed,y:shot.y+shot.vy*elapsed};
    let first=Infinity,victim=null;
    for(const wall of this.walls){const t=segmentRect(shot,end,wall);if(t!==null&&t<first)first=t;}
    for(const member of this.state.participants){
      if(member.playerId===shooter.playerId||member.hp<=0)continue;
      const pos=this.position(member),t=segmentRect(shot,end,pvpPlayerHitboxAt(pos.x,pos.y));
      if(t!==null&&t<first){first=t;victim=member;}
    }
    if(victim?.playerId!==target.playerId)return reject('trajectory_or_cover');
    const previous=structuredClone(this.state),hpBefore=target.hp,hpAfter=Math.max(0,hpBefore-effectiveMatchSettings(this.state,shooter.team).damage);
    shot.consumed=true;target.hp=hpAfter;
    if(this.regenEnabled){
      if(hpAfter>0)this.regen.set(target.playerId,{life:target.life,nextAt:now+PAYLOAD_REGEN.delayMs});
      else this.regen.delete(target.playerId);
    }
    if(shooter.life===shot.life)shooter.lastShot=Math.max(shooter.lastShot??0,shot.shotSeq);
    shooter.lastHitAt=now;
    if(hpAfter===0)this.state=registerPlayerDeath(this.state,shooter.playerId,target.playerId,now,{scoreVictory:this.mode?.scoreVictory??true});
    this.advanceObjective(now);
    const result={projectileId:p.projectileId,shooterId:shooter.playerId,targetId:target.playerId,accepted:true,
      reason:'accepted',damage:hpBefore-hpAfter,hpBefore,hpAfter};this.log({event:'hit accepted',...result,...context});
    this.publish(previous,'hit',{projectileId:p.projectileId,shooterId:shooter.playerId});
    return result;
  }
  emit(){if(!this.closed)this.onState({authorityId:this.authorityId,version:++this.version,round:this.round,
    damageRevision:this.revision,...combatSnapshot(this.state),pickups:this.pickups.snapshot(),skills:this.skills.snapshot(),events:this.events,
    ...(this.retry?.deadline!==undefined?{retry:this.retry.snapshot()}: {})});}
  close(){if(this.timer!==undefined)this.cancel(this.timer);this.timer=undefined;this.deadline=null;
    this.retry?.close();this.pickups.close();this.skills.close();
    this.closed=true;this.members.clear();this.positions.clear();this.projectiles.clear();this.fired.clear();this.diagnostics.clear();this.regen.clear();}
}
