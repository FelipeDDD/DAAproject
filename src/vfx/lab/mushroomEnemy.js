import { acquireAggro,DEFAULT_AGGRO,trackAggro } from './combatAggro.js';
import { boxCenter,groundPoint,playerBox,toward } from './combatGeometry.js';
import { MUSHROOM_BOSS,bloomTargets,releaseBloom,updateBossEvent } from './mushroomBoss.js';

export const MUSHROOM={
  ...DEFAULT_AGGRO,label:'Mushroom',maxPerEncounter:1,maxHp:MUSHROOM_BOSS.maxHp,scale:0.65,size:1.6,poseMs:0,
  box:bodyBox,update:updateMushroom,onDamaged:acquireAggro,firstAttack:'spore',deathMs:1260,
  speed:44,capHeight:65,recoverMs:650,accent:0xa5d758,
  spore:{range:230,windupMs:800,cooldown:2850,damage:16,speed:185,lifetime:1600,radius:7,angle:0.21},
  bloom:{range:185,windupMs:1000,cooldown:3550,spacing:44},
};

function bodyBox(enemy){
  return {x:enemy.x-20,y:enemy.y-44,width:40,height:44};
}

function releaseAttack(actor){
  const {attack,enemy,spec}=actor;
  if(attack.kind==='bloom'){
    releaseBloom(actor,attack.points);
  }else{
    const {angle,speed,lifetime,radius,damage}=spec.spore;
    const volley={hit:false};
    const from={x:enemy.x,y:enemy.y-spec.capHeight};
    for(const offset of [-angle,0,angle]){
      actor.launchShot(from,attack.to,{kind:'spore',speed,lifetime,radius,damage,volley,topClearance:spec.capHeight},offset);
    }
  }
  actor.recover();
}

function updateMushroom(actor,player,movementDt,dt){
  const {enemy,spec,elapsed,attack}=actor;
  const dx=player.x-enemy.x,distance=Math.hypot(dx,player.y-enemy.y);
  const aggro=trackAggro(actor,distance,dt);
  if(actor.phase==='windup'){
    if(elapsed>=spec[attack.kind].windupMs)releaseAttack(actor);
    return;
  }
  if(actor.phase==='recover'){
    if(elapsed<spec.recoverMs)return;
    actor.phase='idle';
    actor.elapsed=0;
  }
  if(updateBossEvent(actor,player))return;
  enemy.poseMs+=movementDt;
  if(!aggro)return;
  // The native art faces left. Keep the direction stable when the opponent is in front.
  if(Math.abs(dx)>8)enemy.facing=dx>0?-1:1;
  const kind=actor.nextAttack,config=spec[kind];
  if(!actor.cooldown&&distance<=config.range){
    actor.windup(kind,boxCenter(playerBox(player)),config.cooldown*actor.boss.phase.cooldown);
    if(kind==='bloom')actor.attack.points=bloomTargets(player,config.spacing);
    actor.nextAttack=kind==='spore'?'bloom':'spore';
  }else if(distance>70){
    const step=Math.min(distance-70,spec.speed*movementDt/1000);
    Object.assign(enemy,groundPoint(toward(enemy,player,step),30));
  }
}
