import { RING,groundPoint,playerBox,playerFeetBox,boxCenter,segmentContact,circleTouchesBox,slimeBox,boxesOverlap,clamp } from './combatGeometry.js';
import { SLIMES } from './slimeVariants.js';
import { onSlimeDamaged,updateSlime } from './slimeEnemy.js';
import { GHOST_SCALE,ghostBox,updateGhost } from './ghostEnemy.js';
import { SNAKE } from './snakeEnemy.js';
import { FROG } from './frogEnemy.js';
import { MUSHROOM } from './mushroomEnemy.js';
import { trackAggro } from './combatAggro.js';

const slimeSpec={box:slimeBox,update:updateSlime,onDamaged:onSlimeDamaged,poseMs:350,firstAttack:'jump',deathPose:1440};
export const ENEMIES={
  ...Object.fromEntries(Object.entries(SLIMES).map(([kind,spec])=>[kind,{...slimeSpec,...spec}])),
  ghost:{label:'Ghost',scale:GHOST_SCALE,size:1,maxHp:100,box:ghostBox,update:updateGhost,poseMs:0,firstAttack:'bolt'},
  snake:SNAKE,
  frog:FROG,
  mushroom:MUSHROOM,
};
export const DEATH_MS=460;

export class CombatEnemy{
  constructor(bout,kind,id,spawn,spec=ENEMIES[kind]){
    this.bout=bout;
    this.kind=kind;
    this.id=id;
    this.spec=spec;
    if(this.spec.zigzag)this.zigzagPhase=id*Math.PI/2;
    this.enemy={...spawn,hp:this.spec.maxHp,size:this.spec.size,lift:0,poseMs:this.spec.poseMs};
    this.cooldown=420+id*85;
    this.contactMs=0;
    this.specialMs=0;
    this.aggro=null;
    this.randomState=Math.floor(bout.aiRandom()*2**32)^id;
    this.nextAttack=this.spec.firstAttack;
    this.phase='idle';
    this.elapsed=0;
    this.shots=[];
    this.attack=this.hop=this.land=null;
  }

  get finished(){return !this.enemy.hp||!this.bout.playerHp;}
  get deathMs(){return this.spec.deathMs??DEATH_MS;}

  trackTarget(player,distance,dt){
    return this.navigation?this.navigation.track(this,player,distance,dt):trackAggro(this,distance,dt);
  }

  canContact(player){return this.bout.clearLine(this.enemy,player);}

  planLanding(point,arenaMargin){
    return this.navigation?this.navigation.landing(this,point):groundPoint(point,arenaMargin);
  }

  moveGround(point){
    Object.assign(this.enemy,this.navigation?this.navigation.terrain.move(this.enemy,point):point);
  }

  stop(){
    if(this.boss)this.boss.event=null;
    this.shots=[];
    this.attack=this.land=this.hop=null;
    this.aggro=null;
    this.slow=null;
    this.phase='ended';
    this.elapsed=0;
  }

  windup(kind,to,cooldown){
    this.attack={kind,to};
    this.phase='windup';
    this.elapsed=0;
    this.cooldown=this.attackInterval(cooldown);
  }

  attackInterval(ms){
    if(!this.bout.ai.randomized||!this.spec.timingVariance)return ms;
    const sample=this.aiSample();
    return Math.round(ms*(1+(sample*2-1)*this.spec.timingVariance));
  }

  aiSample(){
    // Each enemy owns its random stream.
    this.randomState=(Math.imul(this.randomState,1664525)+1013904223)>>>0;
    return this.randomState/2**32;
  }

  recover(){
    this.phase='recover';
    this.elapsed=0;
    this.attack=this.hop=null;
  }

  groundImpact(kind,radius,damage,player,status,statusMs,slowSpeed){
    const {x,y}=this.enemy;
    this.land={x,y,kind,radius,elapsed:0};
    if(circleTouchesBox(this.land,radius,playerFeetBox(player))&&this.canContact(player)){
      this.contactMs=this.spec.contactCooldown??0;
      this.bout.hurt(damage,boxCenter(playerBox(player)),status,statusMs,slowSpeed);
    }
  }

  createCloud(point){
    if(this.kind!=='slime'||!this.bout.cloudEnabled)return;
    const center=this.navigation?this.navigation.landing(this,point):groundPoint(point);
    this.bout.addArea('haze',this.id,center);
  }

  launchShot(from,to,settings,offset=0){
    if(!this.bout.clearLine(this.enemy,from))return;
    const dx=to.x-from.x,dy=to.y-from.y;
    const angle=(dx||dy?Math.atan2(dy,dx):Math.PI)+offset;
    this.shots.push({...settings,...from,angle,elapsed:0});
  }

  updateShot(shot,dt,player){
    const body=playerBox(player);
    const stepMs=Math.min(dt,shot.lifetime-shot.elapsed);
    const seconds=stepMs/1000;
    if(shot.turnRate||shot.lateTurnRate){
      const target=boxCenter(body);
      const error=Math.atan2(target.y-shot.y,target.x-shot.x)-shot.angle;
      const turn=Math.atan2(Math.sin(error),Math.cos(error));
      const trackingMs=clamp((shot.trackingMs??Infinity)-shot.elapsed,0,stepMs);
      const rateLimit=(shot.turnRate*trackingMs+(shot.lateTurnRate??shot.turnRate)*(stepMs-trackingMs))/1000;
      const maxTurn=Math.min(rateLimit,Math.max(0,(shot.maxTurn??Infinity)-(shot.turnSpent??0)));
      const correction=clamp(turn,-maxTurn,maxTurn);
      shot.angle+=correction;
      if(shot.maxTurn!==undefined)shot.turnSpent=(shot.turnSpent??0)+Math.abs(correction);
    }
    const desired={x:shot.x+Math.cos(shot.angle)*shot.speed*seconds,y:shot.y+Math.sin(shot.angle)*shot.speed*seconds};
    const trace=this.bout.space?.trace(shot,desired,shot.radius);
    const end=trace?.point??desired;
    const hit=segmentContact(shot,end,body,shot.radius);
    const beforeWall=!trace?.blocked||hit&&Math.hypot(hit.x-end.x,hit.y-end.y)>1e-6;
    if(hit&&beforeWall&&this.bout.clearLine(hit,player)){
      if(!shot.special)this.createCloud(player);
      if(!shot.volley?.hit){
        if(shot.volley)shot.volley.hit=true;
        this.bout.hurt(shot.damage,hit,shot.status,shot.slow?.ms,shot.slow?.speed);
      }
      return false;
    }
    if(trace?.blocked)return false;
    shot.elapsed+=stepMs;
    Object.assign(shot,end);
    if(shot.elapsed>=shot.lifetime||!trace&&(end.x<RING.left||end.x>RING.right||
      end.y<RING.top-(shot.topClearance??45)||end.y>RING.bottom)){
      if(!shot.special)this.createCloud({x:end.x,y:end.y+24});
      return false;
    }
    return true;
  }

  update(dt,player){
    let movementDt=dt;
    if(this.slow){
      const slowedMs=Math.min(dt,this.slow.ms);
      this.slow.ms-=slowedMs;
      movementDt-=slowedMs*this.slow.percent/100;
      if(this.slow.ms<=0)this.slow=null;
    }
    // Committed travel uses slowed time. Casts and recovery keep their own timing.
    const traveling=this.phase==='chase'||this.phase==='jump'||this.phase==='recoil'||this.phase==='bite';
    this.elapsed+=traveling?movementDt:dt;
    if(this.finished)return;
    if(this.phase==='emerging'){
      if(this.elapsed<this.emergeMs)return;
      this.phase='idle';
      this.elapsed=0;
    }
    this.cooldown=Math.max(0,this.cooldown-dt);
    this.contactMs=Math.max(0,this.contactMs-dt);
    if(this.land){
      this.land.elapsed+=dt;
      if(this.land.elapsed>=360)this.land=null;
    }
    if(this.shots.length){
      const remaining=this.shots.filter(shot=>!this.finished&&this.updateShot(shot,dt,player));
      this.shots=this.finished?[]:remaining;
    }
    if(this.finished)return;
    this.spec.update(this,player,movementDt,dt);
    this.updateContact(player);
  }

  updateContact(player){
    const {spec,bout}=this;
    // A committed attack jump uses the existing landing hit instead of an aerial body hit.
    if(this.finished||!spec.contactDamage||this.contactMs||this.phase==='jump')return;
    const body=playerBox(player);
    if(boxesOverlap(body,spec.box(this.enemy))&&this.canContact(player)&&bout.touch(spec.contactDamage,boxCenter(body))){
      this.contactMs=spec.contactCooldown;
    }
  }
}
