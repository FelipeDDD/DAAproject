import { SkillRegistry } from './SkillRegistry.js';
import { validSkillUse } from './state.js';

// Round-scoped coordinator. The combat authority owns the scheduler and damage
// adapter; skill modules own placement/effects, never identity or cooldowns.
export class SkillAuthority {
  constructor(round,world,{registry=new SkillRegistry()}={}){
    Object.assign(this,{round,world,registry});this.owners=new Map();this.instances=new Map();
    this.cooldowns=new Map();this.sequences=new Map();this.serial=0;this.closed=false;
  }
  register(playerId,peerId,sessionId){this.owners.set(peerId,{playerId,sessionId});}
  remove(peerId){
    const owner=this.owners.get(peerId);if(!owner)return false;
    this.owners.delete(peerId);this.sequences.delete(owner.playerId);
    for(const [key,row] of this.cooldowns)if(row.playerId===owner.playerId)this.cooldowns.delete(key);
    for(const [id,instance] of this.instances)if(instance.ownerId===owner.playerId)this.instances.delete(id);
    return true;
  }
  use(peerId,request,now){
    const reject=reason=>({accepted:false,reason});
    if(this.closed)return reject('authority_closed');
    if(!validSkillUse(request))return reject('invalid_request');
    const state=this.world.state(),owner=this.owners.get(peerId),player=this.world.fighter(peerId);
    if(!owner||owner.playerId!==request.playerId||player?.playerId!==owner.playerId)return reject('unowned_player');
    if(!owner.sessionId||owner.sessionId!==request.sessionId)return reject('invalid_session');
    if(request.round!==this.round||(state.round??0)!==this.round)return reject('stale_round');
    if(state.state!=='active')return reject('match_inactive');
    if(player.life!==request.life)return reject('stale_life');
    if(player.hp<=0||player.respawnAt!==null)return reject('dead_player');
    if(player.presenceRoom!==state.room||(player.presenceExpiresAt!==undefined&&now>=player.presenceExpiresAt))return reject('invalid_presence');
    const resolved=this.registry.resolve(state.mode,request.skillId);
    if(!resolved)return reject('skill_disabled');
    const previous=this.sequences.get(player.playerId);
    if(previous?.life===player.life&&request.castSeq<=previous.seq)return reject('stale_sequence');
    this.sequences.set(player.playerId,{life:player.life,seq:request.castSeq});
    const key=`${player.playerId}:${request.skillId}`;
    if(now<(this.cooldowns.get(key)?.readyAt??0))return reject('cooldown');
    if(this.instances.size>=16)return reject('instance_limit');
    const position=this.world.position(player);
    if(position.life!==player.life||!Number.isFinite(position.x)||!Number.isFinite(position.y)
      ||(position.moving&&now-position.at>1000))return reject('invalid_position');
    const data=resolved.definition.create({player,position,config:resolved.config,now});
    if(!data)return reject('invalid_placement');
    const instance={id:`skill-${this.round}-${++this.serial}`,skillId:request.skillId,round:this.round,
      ownerId:player.playerId,ownerLife:player.life,team:player.team,config:resolved.config,data};
    this.instances.set(instance.id,instance);
    this.cooldowns.set(key,{playerId:player.playerId,skillId:request.skillId,readyAt:now+resolved.config.cooldownMs});
    return {accepted:true,reason:'accepted'};
  }
  reconcile(){
    const state=this.world.state();
    if(this.closed||state.state==='ended'||(state.round??0)!==this.round){
      const changed=this.instances.size>0||this.cooldowns.size>0;this.stop();return changed;
    }
    let changed=false;
    for(const [peerId,owner] of this.owners)if(!this.world.connected(owner.playerId)
      ||!state.participants.some(p=>p.playerId===owner.playerId)){this.remove(peerId);changed=true;}
    for(const [id,instance] of this.instances){
      const player=state.participants.find(p=>p.playerId===instance.ownerId);
      if(!player||player.hp<=0||player.life!==instance.ownerLife){this.instances.delete(id);changed=true;}
    }
    return changed;
  }
  advance(now){
    let changed=this.reconcile();if(this.closed)return changed;
    for(const [id,instance] of this.instances){
      if(this.world.state().state!=='active')break;
      const definition=this.registry.definitions.get(instance.skillId);
      changed=definition.advance(instance,this.world,now)||changed;
      if(definition.expired(instance,now)){this.instances.delete(id);changed=true;}
    }
    return this.reconcile()||changed;
  }
  nextDeadline(){
    if(this.closed||this.world.state().state!=='active')return null;
    const deadlines=[...this.instances.values()].map(i=>this.registry.definitions.get(i.skillId).nextDeadline(i));
    return deadlines.length?Math.min(...deadlines):null;
  }
  snapshot(){
    const state=this.world.state();return {
      enabled:this.registry.enabled(state.mode),cooldowns:[...this.cooldowns.values()].map(row=>({...row})),
      instances:[...this.instances.values()].map(i=>({id:i.id,skillId:i.skillId,round:i.round,ownerId:i.ownerId,
        ownerLife:i.ownerLife,team:i.team,...this.registry.definitions.get(i.skillId).snapshot(i)})),
    };
  }
  stop(){this.instances.clear();this.cooldowns.clear();this.sequences.clear();this.closed=true;}
  close(){this.stop();this.owners.clear();}
}
