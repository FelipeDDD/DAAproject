import { clamp,toward,groundPoint,playerBox,boxCenter,POISON_RADIUS } from './combatGeometry.js';
import { SLIME_SPECIAL } from './slimeVariants.js';
import { acquireAggro,trackAggro } from './combatAggro.js';

function beginHop(bout,to,phase){
  const {x,y}=bout.enemy;
  bout.hop={from:{x,y},to};
  if(phase==='chase'&&bout.spec.zigzag){
    const dx=to.x-x,dy=to.y-y,length=Math.hypot(dx,dy)||1;
    bout.hop.normal={x:-dy/length,y:dx/length};
    bout.hop.startPhase=bout.zigzagPhase;
    bout.zigzagPhase+=2*Math.PI*bout.spec.zigzag.frequencyHz*bout.spec.chaseMs/bout.spec.speed/1000;
  }
  bout.phase=phase;
  bout.elapsed=0;
}

const projectileKinds={slime:'poison',frost:'frost',big:'glob',swift:'spark'};

export function onSlimeDamaged(actor,player){
  const distance=Math.hypot(player.x-actor.enemy.x,player.y-actor.enemy.y);
  const target=acquireAggro(actor);
  if(target.closest===undefined)target.closest=distance;
  if(actor.bout.ai.antiKiting&&!target.counterUsed&&distance>SLIME_SPECIAL.retreatRange){
    target.pending=true;
    target.counterUsed=true;
  }
}

function trackTarget(actor,distance,dt){
  const config=SLIME_SPECIAL;
  actor.specialMs=Math.max(0,actor.specialMs-dt);
  const target=trackAggro(actor,distance,dt);
  if(!target)return;
  if(target.closest===undefined)target.closest=distance;
  target.retreatMs??=0;
  if(!actor.bout.ai.antiKiting){
    target.pending=false;
    target.retreatMs=0;
    return;
  }
  // After a shot, only a fresh close approach arms the next retreat.
  if(distance<=config.engageRange)target.closest=distance;
  if(target.closest===null||target.pending)return;
  target.closest=Math.min(target.closest,distance);
  const trigger=Math.max(config.retreatRange,target.closest+config.retreatRange-config.engageRange);
  if(distance>trigger||(target.retreatMs>0&&distance>=trigger-config.retreatHysteresis)){
    target.retreatMs+=dt;
    if(target.retreatMs>=config.retreatMs)target.pending=true;
  }else target.retreatMs=0;
}

function startSpecial(actor,distance){
  const {ai}=actor.bout,config=SLIME_SPECIAL;
  if(!actor.spec.special||!ai.antiKiting||!actor.aggro?.pending||distance>config.maxRange||actor.specialMs||
    actor.bout.specialGraceMs||actor.shots.length)return false;
  const mode=ai.specialMode==='variant'?actor.spec.special.mode:ai.specialMode;
  actor.attack={kind:mode,windup:config.windupMs};
  actor.phase='windup';
  actor.elapsed=0;
  Object.assign(actor.aggro,{closest:null,retreatMs:0,pending:false,counterUsed:true});
  actor.specialMs=actor.attackInterval(config.cooldown);
  actor.bout.specialGraceMs=config.sharedCooldown;
  return true;
}

function beginRecoil(actor,player){
  const {enemy,spec}=actor;
  const angle=Math.atan2(enemy.y-player.y,enemy.x-player.x);
  const to=groundPoint({x:enemy.x+Math.cos(angle)*spec.special.recoil,y:enemy.y+Math.sin(angle)*spec.special.recoil});
  actor.attack=null;
  if(Math.hypot(to.x-enemy.x,to.y-enemy.y)<1){actor.recover();return;}
  beginHop(actor,to,'recoil');
}

function releaseSpecial(actor,player,mode){
  const {enemy,spec}=actor;
  const from={x:enemy.x,y:enemy.y-14*spec.size};
  const aim=boxCenter(playerBox(player));
  const {speed,lifetime,turnRate,angle}=SLIME_SPECIAL[mode];
  const settings={kind:projectileKinds[actor.kind],speed,lifetime,turnRate,radius:POISON_RADIUS,
    damage:spec.special.damage,special:true};
  if(mode==='spread'){
    const volley={hit:false};
    for(const offset of [-angle,0,angle])actor.launchShot(from,aim,{...settings,volley},offset);
  }else actor.launchShot(from,aim,settings);
}

export function updateSlime(bout,player,_movementDt,dt){
  const slime=bout.enemy;
  const {elapsed,attack,spec}=bout;
  const distance=Math.hypot(player.x-slime.x,player.y-slime.y);
  trackTarget(bout,distance,dt);
  switch(bout.phase){
    case 'recoil':{
      const t=clamp(elapsed/SLIME_SPECIAL.recoilMs,0,1);
      const {from,to}=bout.hop;
      slime.x=from.x+(to.x-from.x)*t;
      slime.y=from.y+(to.y-from.y)*t;
      slime.poseMs=900+540*t;
      slime.lift=6*4*t*(1-t);
      if(t===1)bout.recover();
      return;
    }
    case 'chase':
    case 'jump':{
      const jump=bout.phase==='jump',duration=jump?spec.jumpMs:spec.chaseMs/spec.speed;
      const t=clamp(elapsed/duration,0,1);
      const {from,to}=bout.hop;
      Object.assign(slime,{
        x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,
        poseMs:900+540*t,lift:24*spec.scale*4*t*(1-t),
      });
      if(bout.hop.normal&&t<1){
        // Taper at both ends so retargeting the next hop never snaps the sprite.
        const phase=bout.hop.startPhase+t*(bout.zigzagPhase-bout.hop.startPhase);
        const lateral=spec.zigzag.amplitude*Math.sin(phase)*Math.sin(Math.PI*t);
        Object.assign(slime,groundPoint({x:slime.x+bout.hop.normal.x*lateral,y:slime.y+bout.hop.normal.y*lateral}));
      }
      if(t<1)return;
      if(jump){
        bout.createCloud(slime);
        bout.groundImpact('jump',spec.jumpRadius,spec.damage,player,spec.jumpStatus,
          spec.jumpSlow?.ms??spec.stunMs,spec.jumpSlow?.speed);
      }
      if(!bout.finished)bout.recover();
      return;
    }
    case 'windup':{
      const {kind,to}=attack;
      const special=attack.windup!==undefined;
      if(special&&!bout.bout.ai.antiKiting){bout.recover();return;}
      const windup=attack.windup??(kind==='jump'?spec.jumpWindup:spec.shotWindup);
      slime.poseMs=500+340*clamp(elapsed/windup,0,1);
      if(elapsed<windup)return;
      if(special){
        releaseSpecial(bout,player,kind);
        beginRecoil(bout,player);
        return;
      }
      if(kind==='jump')beginHop(bout,to,'jump');
      else{
        bout.launchShot({x:slime.x,y:slime.y-14*spec.size},to,spec.shot);
        bout.recover();
      }
      return;
    }
    case 'recover':
      slime.poseMs=Math.min(1780,1440+elapsed*spec.speed);
      if(elapsed>=spec.recoverMs/spec.speed){bout.phase='idle';bout.elapsed=0;}
      return;
    default:{
      if(!bout.aggro||startSpecial(bout,distance))return;
      const kind=bout.nextAttack;
      if(!bout.cooldown&&(kind==='jump'||!bout.shots.length)&&distance<=(kind==='jump'?spec.jumpRange:spec.shotRange)){
        const to=kind==='jump'?groundPoint(toward(slime,player,spec.jumpRange)):boxCenter(playerBox(player));
        bout.windup(kind,to,kind==='jump'?spec.jumpCooldown:spec.shotCooldown);
        bout.nextAttack=kind==='jump'&&spec.shot?spec.shot.kind:'jump';
      }else if(distance>58&&(bout.cooldown===0||distance>84)){
        beginHop(bout,groundPoint(toward(slime,player,Math.min(spec.step,distance-52))),'chase');
      }
    }
  }
}
