import { boxCenter,playerBox } from './combatGeometry.js';

const deathAreaMs=10000;
export const AREAS={
  haze:{radius:23,squash:0.62,lifetime:2700,interval:1000,damage:2},
  poison:{radius:33,squash:0.65,lifetime:deathAreaMs,interval:1000},
  'toxic-bloom':{radius:25,squash:0.76,lifetime:5000,interval:1000},
  sporecap:{radius:32,squash:0.76,lifetime:5900,damage:12,burstMs:1000},
  ice:{radius:35,squash:0.65,lifetime:deathAreaMs,speed:0.45},
  unstable:{radius:49,squash:0.65,lifetime:deathAreaMs,interval:600,damage:9},
  electric:{radius:25,squash:0.65,lifetime:deathAreaMs,interval:1300,stunMs:500},
};

export function groundArea(kind,sourceId,{x,y}){
  return {...AREAS[kind],kind,x,y,sourceId,team:'enemy',age:0,contact:false,exposure:0};
}

// World-space foot pivot and the same ellipse drawn by the floor effect.
export function updateArea(area,dt,player,bout){
  const activeMs=Math.min(dt,area.lifetime-area.age);
  area.age+=activeMs;
  const inside=Math.hypot(player.x-area.x,(player.y-area.y)/area.squash)<=area.radius&&
    (!bout.space||bout.clearLine(area,player));
  if(inside){
    if(area.kind==='sporecap'){
      if(area.triggeredAt===undefined){
        area.triggeredAt=area.age;
        area.lifetime=area.age+area.burstMs;
        bout.hurt(area.damage,boxCenter(playerBox(player)),'Poisoned');
      }
    }else if(area.kind==='electric'){
      if(!area.contact&&area.age>=(area.nextPulse??0)){
        bout.stun(area.stunMs);
        area.nextPulse=area.age+area.interval;
      }
    }else if(area.kind==='ice')bout.onIce||=area.age<area.lifetime&&!bout.protectingPhaseHeal;
    else if(area.kind==='poison'||area.kind==='toxic-bloom'){
      if(!area.contact)bout.renewPoison();
      area.exposure+=activeMs;
      if(area.exposure>=area.interval){
        area.exposure%=area.interval;
        bout.renewPoison();
      }
    }else if(area.kind==='haze'&&bout.poison)area.exposure=0;
    else{
      area.exposure+=activeMs;
      while(area.exposure>=area.interval&&bout.playerHp){
        area.exposure-=area.interval;
        bout.hurt(area.damage,boxCenter(playerBox(player)),area.kind==='haze'?'Cloud':undefined,
          undefined,undefined,{periodic:true});
      }
    }
  }else area.exposure=0;
  area.contact=inside;
}
