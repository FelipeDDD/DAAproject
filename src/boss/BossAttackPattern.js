import { aimedVelocity } from './BossCombatState.js';

export const BOSS_ATTACK_TYPES=Object.freeze({
  SINGLE:'single',FAN:'fan',AREA:'area',HOMING:'homing',
});

export const BOSS_PROJECTILE_VISUALS=Object.freeze({
  PAPER:'paper',HOMING_PAPER:'homingPaper',ORB:'orb',
});

export function projectileVisualForAttack(type){
  if(type===BOSS_ATTACK_TYPES.SINGLE||type===BOSS_ATTACK_TYPES.FAN)return BOSS_PROJECTILE_VISUALS.PAPER;
  if(type===BOSS_ATTACK_TYPES.HOMING)return BOSS_PROJECTILE_VISUALS.HOMING_PAPER;
  return BOSS_PROJECTILE_VISUALS.ORB;
}

const ATTACK_ORDER=Object.freeze([
  BOSS_ATTACK_TYPES.SINGLE,BOSS_ATTACK_TYPES.FAN,BOSS_ATTACK_TYPES.AREA,BOSS_ATTACK_TYPES.HOMING,
]);

export class BossAttackSequence {
  constructor(){this.reset();}
  peek(){return ATTACK_ORDER[this.index];}
  advance(){
    const current=this.peek();
    this.index=(this.index+1)%ATTACK_ORDER.length;
    return current;
  }
  reset(){this.index=0;}
}

export class BossMovementPlan {
  constructor(points=[]){
    this.points=points.map(point=>({...point}));
    this.reset();
  }

  begin(current){
    if(this.activeDestination||!this.points.length)return null;
    for(let attempt=0;attempt<this.points.length;attempt++){
      const destination=this.points[this.index];
      this.index=(this.index+1)%this.points.length;
      if(destination.x!==current.x||destination.y!==current.y){
        this.activeDestination={...destination};
        return {...this.activeDestination};
      }
    }
    return null;
  }

  complete(){
    if(!this.activeDestination)return null;
    const destination={...this.activeDestination};
    this.activeDestination=null;
    return destination;
  }

  cancel(){this.activeDestination=null;}
  reset(){this.index=0;this.activeDestination=null;}
}

export class AreaAttackTarget {
  constructor(position,radius){
    this.center={x:position.x,y:position.y};
    this.radius=radius;
    this.active=true;
  }

  contains(position){
    return Math.hypot(position.x-this.center.x,position.y-this.center.y)<=this.radius;
  }

  resolve(position,{ready=true,bossDefeated=false,playerDefeated=false}={}){
    if(!this.active||!ready)return false;
    if(bossDefeated||playerDefeated){this.active=false;return false;}
    this.active=false;
    return this.contains(position);
  }

  cancel(){this.active=false;}
}

export function fanProjectileVelocities(from,target,speed,count,totalSpreadDegrees){
  if(!Number.isInteger(count)||count<1)return [];
  const center=aimedVelocity(from,target,speed);
  const centerAngle=Math.atan2(center.y,center.x);
  const totalSpread=totalSpreadDegrees*Math.PI/180;
  const step=count===1?0:totalSpread/(count-1);
  return Array.from({length:count},(_,index)=>{
    const angle=centerAngle-totalSpread/2+step*index;
    return {x:Math.cos(angle)*speed,y:Math.sin(angle)*speed,angle};
  });
}

function shortestAngleDifference(from,to){
  return Math.atan2(Math.sin(to-from),Math.cos(to-from));
}

export function homingVelocity(currentVelocity,position,target,speed,turnRateRadians,deltaMs){
  const currentAngle=Math.atan2(currentVelocity.y,currentVelocity.x);
  const targetAngle=Math.atan2(target.y-position.y,target.x-position.x);
  const maxTurn=Math.max(0,turnRateRadians)*Math.max(0,deltaMs)/1000;
  const difference=shortestAngleDifference(currentAngle,targetAngle);
  const angle=currentAngle+Math.max(-maxTurn,Math.min(maxTurn,difference));
  return {x:Math.cos(angle)*speed,y:Math.sin(angle)*speed,angle};
}
