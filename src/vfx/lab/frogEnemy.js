import { acquireAggro,DEFAULT_AGGRO,trackAggro } from './combatAggro.js';
import { clamp,groundPoint,toward } from './combatGeometry.js';

const SCALE=1.5;
// Native PixelFX time in milliseconds, sampled at the atlas's 20 FPS.
const CROUCH=950,TAKEOFF=1200,LANDING=1650;
const AIRBORNE_MS=420,NATIVE_APEX=22.05;

export const FROG={
  ...DEFAULT_AGGRO,label:'Frog',size:1,scale:SCALE,maxHp:90,poseMs:0,
  box:frogBox,update:updateFrog,onDamaged:acquireAggro,
  preferredRange:70,hopDistance:33,hopMs:360,pauseMs:330,
  leap:{name:'Leaping Slam',range:118,windupMs:420,flightMs:430,recoverMs:540,cooldown:2050,damage:18,radius:24},
  longLeap:{name:'Long Leap',range:192,windupMs:500,flightMs:560,chance:0.40,retryMs:2400,cooldown:6500},
};

function frogBox(frog){
  return {x:frog.x-12*SCALE,y:frog.y-17*SCALE-frog.lift,width:24*SCALE,height:18*SCALE};
}

function face(enemy,x){
  if(Math.abs(x-enemy.x)>3)enemy.facing=Math.sign(x-enemy.x);
}

function chooseLeap(actor,distance){
  const {leap,longLeap}=actor.spec;
  if(actor.cooldown)return null;
  if(distance<=leap.range)return leap;
  if(distance>longLeap.range||actor.longLeapMs)return null;
  const selected=actor.aiSample()<longLeap.chance;
  actor.longLeapMs=selected?longLeap.cooldown:longLeap.retryMs;
  return selected?{...leap, ...longLeap}:null;
}

function updateFrog(actor,player,movementDt,dt){
  const {enemy,spec,attack,elapsed}=actor;
  const leap=attack?.leap;
  actor.longLeapMs=Math.max(0,(actor.longLeapMs??0)-dt);
  const distance=Math.hypot(player.x-enemy.x,player.y-enemy.y);
  const aggro=trackAggro(actor,distance,dt);
  if(actor.phase==='windup'){
    enemy.poseMs=CROUCH+(TAKEOFF-CROUCH)*Math.min(elapsed/leap.windupMs,1);
    if(elapsed>=leap.windupMs){
      actor.phase='jump';
      actor.elapsed=0;
      actor.hop={from:{x:enemy.x,y:enemy.y},to:attack.to};
    }
    return;
  }
  if(actor.phase==='jump'||actor.phase==='chase'){
    const offensive=actor.phase==='jump';
    const t=clamp(elapsed/(offensive?leap.flightMs:spec.hopMs),0,1);
    const {from,to}=actor.hop;
    enemy.x=from.x+(to.x-from.x)*t;
    enemy.y=from.y+(to.y-from.y)*t;
    enemy.poseMs=TAKEOFF+(LANDING-TAKEOFF)*t;
    const air=clamp((Math.floor(enemy.poseMs/50)*50-TAKEOFF)/AIRBORNE_MS,0,1);
    // The sprite already contains its vertical displacement and shadow.
    enemy.lift=Math.round(4*NATIVE_APEX*air*(1-air))*SCALE;
    if(t===1){
      if(offensive)actor.groundImpact(attack.kind,leap.radius,leap.damage,player);
      if(!actor.finished){
        actor.recover();
        actor.frogPauseMs=offensive?leap.recoverMs:spec.pauseMs;
      }
    }
    return;
  }
  if(actor.phase==='recover'){
    enemy.poseMs=Math.min(2000,LANDING+elapsed);
    if(elapsed<actor.frogPauseMs)return;
    actor.phase='idle';
    actor.elapsed=0;
  }
  enemy.poseMs=actor.elapsed%900;
  if(!aggro)return;
  const choice=chooseLeap(actor,distance);
  if(choice){
    const to=groundPoint(player,24);
    face(enemy,to.x);
    actor.windup(choice===spec.leap?'frog-leap':'frog-long-leap',to,spec.leap.cooldown);
    actor.attack.leap=choice;
  }else if(distance>spec.preferredRange+10||distance<spec.preferredRange-20){
    const target=distance>=spec.preferredRange?player:{x:2*enemy.x-player.x,y:2*enemy.y-player.y};
    const to=groundPoint(toward(enemy,target,spec.hopDistance),24);
    if(to.x===enemy.x&&to.y===enemy.y)return;
    face(enemy,to.x);
    actor.hop={from:{x:enemy.x,y:enemy.y},to};
    actor.phase='chase';
    actor.elapsed=0;
  }
}
