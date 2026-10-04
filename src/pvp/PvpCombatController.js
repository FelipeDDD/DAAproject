import { PVP_RULES } from './config.js';
import { aimedVelocity } from '../boss/BossCombatState.js';
import { collisionAreas } from '../maps/collision.js';
import { objectsIn } from '../maps/tiledObjects.js';
import { segmentRect } from './projectiles.js';

// Local projectile geometry is a disposable test adapter, not combat authority.
export class PvpCombatController {
  constructor(scene,onHit,{onSpawn=()=>{},onRemove=()=>{},canFire=()=>true}={}){
    Object.assign(this,{scene,onHit,onSpawn,onRemove,canFire});this.shots=[];this.remoteShots=new Map();this.nextShotAt=0;this.serial=0;
    this.walls=collisionAreas(objectsIn(scene.source,'Collision'));
    this.pointer=pointer=>{
      if(pointer.button!==0)return;
      const target=scene.cameras.main.getWorldPoint(pointer.x,pointer.y);
      this.fire(target,Date.now());
    };
    scene.input.on('pointerdown',this.pointer);
  }
  fire(target,now){
    const self=this.self;
    if(this.state?.state!=='active'||!self||self.hp<=0||now<this.nextShotAt||!this.canFire())return false;
    const origin={x:this.scene.player.x,y:this.scene.player.y-22};
    if(Math.hypot(target.x-origin.x,target.y-origin.y)<1)return false;
    this.nextShotAt=now+PVP_RULES.attackCooldownMs;
    this.serial=Math.max(this.serial,self.lastShot)+1;
    const dot=this.scene.add.circle(origin.x,origin.y,4,self.team==='A'?0x80d2fa:0xf4a290).setDepth(10000);
    const velocity=aimedVelocity(origin,target,PVP_RULES.projectileSpeed);
    const event={projectileId:globalThis.crypto?.randomUUID?.()??`shot-${now.toString(36)}-${Math.random().toString(36).slice(2)}`,
      playerId:self.playerId,life:self.life,shotSeq:this.serial,...origin,vx:velocity.x,vy:velocity.y,ttlMs:PVP_RULES.projectileLifetimeMs};
    this.shots.push({...origin,velocity,dot,event,
      shot:this.serial,attackerLife:self.life,expiresAt:now+PVP_RULES.projectileLifetimeMs});
    // Render first. Transport failure must never cancel the local shot/hit flow.
    try{this.onSpawn(event);}catch(error){console.debug('[PvP projectile] send failed',String(error));}
    return true;
  }
  update(state,self,delta,now){
    if(self&&this.life!==self.life){this.serial=0;this.nextShotAt=0;this.life=self.life;}
    this.state=state;this.self=self;
    if(state.state!=='active'||!self){this.clear();return;}
    // Existing shots belong to their spawn, not the shooter's current health/life.
    // fire() still blocks dead players from creating new shots.
    for(const shot of [...this.shots]){
      const target={x:shot.x+shot.velocity.x*delta/1000,y:shot.y+shot.velocity.y*delta/1000};
      let first=Infinity,victim=null;
      for(const wall of this.walls){const t=segmentRect(shot,target,wall);if(t!==null&&t<first)first=t;}
      for(const p of state.participants){
        // Direct shots collide with every other living body; allies consume the
        // shot locally without submitting a damage event. This is not an AoE rule.
        if(p.playerId===self.playerId||p.hp<=0)continue;
        const remote=this.scene.remotes.players.get(p.playerId);if(!remote)continue;
        const t=segmentRect(shot,target,{x:remote.sprite.x-13,y:remote.sprite.y-46,width:26,height:44});
        if(t!==null&&t<first){first=t;victim=p;}
      }
      if(first!==Infinity||now>=shot.expiresAt){
        // Request validation before publishing destroy; otherwise the relay would
        // see an already-consumed projectile when it receives the hit attempt.
        if(victim&&victim.team!==self.team&&now<shot.expiresAt)this.onHit({projectileId:shot.event.projectileId,
          victimId:victim.playerId,victimLife:victim.life,attackerLife:shot.attackerLife,shot:shot.shot});
        this.removeLocal(shot);
      }else{shot.x=target.x;shot.y=target.y;shot.dot.setPosition(shot.x,shot.y);}
    }
    this.updateRemote(delta,now);
  }
  receiveProjectile(p,participant,ageMs=0){
    if(this.remoteShots.has(p.projectileId)||this.remoteShots.size>=64)return false;
    const dot=this.scene.add.circle(p.x,p.y,4,participant.team==='A'?0x80d2fa:0xf4a290).setDepth(10000);
    this.remoteShots.set(p.projectileId,{...p,dot,pendingAgeMs:ageMs,expiresAt:Date.now()+p.ttlMs-ageMs});return true;
  }
  updateRemote(delta,now){
    // Mirrors visual collision only; received shots never invoke onHit.
    for(const [id,shot] of this.remoteShots){
      const elapsed=delta+shot.pendingAgeMs;shot.pendingAgeMs=0;
      const target={x:shot.x+shot.vx*elapsed/1000,y:shot.y+shot.vy*elapsed/1000};
      let collided=this.walls.some(wall=>segmentRect(shot,target,wall)!==null);
      for(const p of this.state.participants){
        if(collided||p.playerId===shot.playerId||p.hp<=0)continue;
        const sprite=p.playerId===this.self.playerId?this.scene.player:this.scene.remotes.players.get(p.playerId)?.sprite;
        if(sprite&&segmentRect(shot,target,{x:sprite.x-13,y:sprite.y-46,width:26,height:44})!==null)collided=true;
      }
      if(collided||now>=shot.expiresAt)this.removeRemote(id);
      else{shot.x=target.x;shot.y=target.y;shot.dot.setPosition(shot.x,shot.y);}
    }
  }
  removeRemote(id,playerId){
    const shot=this.remoteShots.get(id);if(!shot||(playerId!==undefined&&shot.playerId!==playerId))return;
    shot.dot.destroy();this.remoteShots.delete(id);
  }
  removeLocal(shot){
    shot.dot.destroy();this.shots.splice(this.shots.indexOf(shot),1);
    try{this.onRemove(shot.event);}catch(error){console.debug('[PvP projectile] removal send failed',String(error));}
  }
  clearLocal(){for(const shot of [...this.shots])this.removeLocal(shot);}
  clearRemote(){for(const id of this.remoteShots.keys())this.removeRemote(id);}
  clear(){this.clearLocal();this.clearRemote();}
  destroy(){this.clear();this.scene.input.off('pointerdown',this.pointer);}
}
