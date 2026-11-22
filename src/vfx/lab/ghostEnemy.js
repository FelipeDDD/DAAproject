import { clamp,toward,groundPoint,playerBox,boxCenter } from './combatGeometry.js';

export const GHOST_SCALE=1.35;
export const HAUNT_RADIUS=27;
const AGGRO=226,HAUNT_RANGE=104,HAUNT_WINDUP=450,BOLT_WINDUP=490;
const bolt={kind:'bolt',radius:6,speed:132,lifetime:1600,damage:17};

export function ghostBox(ghost){
  // Use the same 50 ms sample as the sheet to follow its baked drift and bob.
  const angle=Math.floor(ghost.poseMs/50)*50/2400*2*Math.PI;
  const x=ghost.x+4*GHOST_SCALE*Math.sin(angle);
  const y=ghost.y-(14+3*Math.sin(2*angle+0.8))*GHOST_SCALE;
  return {x:x-15,y:y-38,width:30,height:41};
}

export function updateGhost(bout,player,dt){
  const ghost=bout.enemy;
  ghost.poseMs=(ghost.poseMs+dt)%2400;
  const {elapsed,attack}=bout;
  if(bout.phase==='windup'){
    if(attack.kind==='haunt'){
      if(elapsed>=HAUNT_WINDUP){
        bout.hop={from:{x:ghost.x,y:ghost.y},to:attack.to};
        bout.phase='dash';bout.elapsed=0;
      }
    }else if(elapsed>=BOLT_WINDUP){
      bout.launchShot(boxCenter(ghostBox(ghost)),attack.to,bolt);
      bout.recover();
    }
    return;
  }
  if(bout.phase==='dash'){
    Object.assign(ghost,toward(ghost,bout.hop.to,330*dt/1000));
    if(Math.hypot(ghost.x-bout.hop.to.x,ghost.y-bout.hop.to.y)>0.1)return;
    const retreat=toward(ghost,bout.hop.from,42);
    bout.groundImpact('haunt',HAUNT_RADIUS,22,player,'Slowed');
    if(!bout.finished){
      bout.recover();
      bout.hop={to:retreat};
    }
    return;
  }
  if(bout.phase==='recover'){
    if(elapsed<380){
      if(bout.hop)Object.assign(ghost,toward(ghost,bout.hop.to,118*dt/1000));
      return;
    }
    bout.hop=null;
    bout.phase='idle';
  }

  const dx=player.x-ghost.x,dy=player.y-ghost.y,distance=Math.hypot(dx,dy);
  if(distance>AGGRO)return;
  if(!bout.cooldown&&!bout.shots.length&&distance<=187){
    const haunt=distance<=HAUNT_RANGE&&bout.nextAttack==='haunt';
    // Close the last few pixels before committing Haunt, as long as the target is in sight.
    if(haunt||bout.nextAttack==='bolt'){
      const kind=haunt?'haunt':'bolt';
      const to=haunt?groundPoint(toward(ghost,player,HAUNT_RANGE)):boxCenter(playerBox(player));
      bout.windup(kind,to,haunt?2050:1900);
      bout.nextAttack=haunt?'bolt':'haunt';
      return;
    }
  }
  const preferred=bout.nextAttack==='haunt'&&!bout.cooldown?88:118;
  const radial=clamp((distance-preferred)/20,-1,1)*59;
  const drift=Math.cos(ghost.poseMs/2400*2*Math.PI)*29;
  const norm=distance||1;
  Object.assign(ghost,groundPoint({
    x:ghost.x+(radial*dx-drift*dy)/norm*dt/1000,
    y:ghost.y+(radial*dy+drift*dx)/norm*dt/1000,
  }));
}
