import { PVP_RULES } from './config.js';
import { aimedVelocity } from '../boss/BossCombatState.js';
import { collisionAreas } from '../maps/collision.js';
import { objectsIn } from '../maps/tiledObjects.js';
import { segmentRect } from './projectiles.js';

// Local projectile geometry is a disposable test adapter, not combat authority.
export class PvpCombatController {
  constructor(scene,onHit){
    Object.assign(this,{scene,onHit});this.shots=[];this.nextShotAt=0;this.serial=0;
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
    if(this.state?.state!=='active'||!self||self.hp<=0||now<this.nextShotAt)return false;
    const origin={x:this.scene.player.x,y:this.scene.player.y-22};
    if(Math.hypot(target.x-origin.x,target.y-origin.y)<1)return false;
    this.nextShotAt=now+PVP_RULES.attackCooldownMs;
    this.serial=Math.max(this.serial,self.lastShot)+1;
    const dot=this.scene.add.circle(origin.x,origin.y,4,self.team==='A'?0x80d2fa:0xf4a290).setDepth(10000);
    this.shots.push({...origin,velocity:aimedVelocity(origin,target,PVP_RULES.projectileSpeed),dot,
      shot:this.serial,attackerLife:self.life,expiresAt:now+PVP_RULES.projectileLifetimeMs});return true;
  }
  update(state,self,delta,now){
    this.state=state;this.self=self;
    if(state.state!=='active'||!self||self.hp<=0){this.clear();return;}
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
        shot.dot.destroy();this.shots.splice(this.shots.indexOf(shot),1);
        if(victim&&victim.team!==self.team&&now<shot.expiresAt)this.onHit({victimId:victim.playerId,victimLife:victim.life,attackerLife:shot.attackerLife,shot:shot.shot});
      }else{shot.x=target.x;shot.y=target.y;shot.dot.setPosition(shot.x,shot.y);}
    }
  }
  clear(){for(const shot of this.shots)shot.dot.destroy();this.shots=[];}
  destroy(){this.clear();this.scene.input.off('pointerdown',this.pointer);}
}
