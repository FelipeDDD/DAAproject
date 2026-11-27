import { SKILLS } from './combatSkills.js';
import { DRAIN_ORBS,handOf,orbArrivalProgress } from './precisionDemo.js';
import { toward,segmentContact,circleTouchesBox,boxCenter } from './combatGeometry.js';
import { proximityTrigger,SENTRY_FLASH_MS } from './proximityDemo.js';

// One clock for cast locks, cooldowns, projectile travel and their visuals.
export class CombatSkillRunner{
  constructor(bout,onDrainComplete,{onParryComplete,sentrySpace=bout.space}={}){
    this.bout=bout;
    this.onDrainComplete=onDrainComplete;
    this.onParryComplete=onParryComplete;
    this.sentrySpace=sentrySpace;
    this.reset();
  }

  reset(){
    this.cooldowns=new Map();
    this.actions=[];
  }

  get casting(){return this.actions.find(action=>!action.released);}
  get castSpeed(){
    if(this.bout.defending)return SKILLS['healing-parry'].castSpeed;
    if(this.bout.stunMs||this.bout.finished)return 1;
    const action=this.casting;
    if(action?.skill.rampCastSpeed){
      const {cast,castSpeed}=action.skill;
      return 1+(castSpeed-1)*Math.min(1,action.age/cast);
    }
    return action?.skill.castSpeed??1;
  }

  use(slot,slots,player,captureAim){
    const skill=SKILLS[slots[slot]],bout=this.bout;
    if(!skill||!bout.started||!(bout.canCast??bout.alive)||bout.finished||bout.stunMs||bout.defending||
      this.casting||this.cooldowns.get(skill.id)>0)return false;
    if(skill.shape==='sentry'&&this.actions.some(action=>action.sentry))return false;
    if(skill.parry){
      if(!bout.beginParry(skill.parry,this.onParryComplete))return false;
      if(skill.castSpeed===0)player.setVelocity?.(0,0);
      this.cooldowns.set(skill.id,skill.cooldown);
      return true;
    }
    const aim=skill.shape==='self-area'?{x:player.x,y:player.y}:
      toward(skill.shape==='sentry'?player:handOf(player),captureAim(),skill.range);
    const anchor=(skill.shape==='ground'&&bout.space?.trace(player,aim).point)||
      (skill.shape==='sentry'&&this.sentrySpace?.trace(player,aim,4).point)||aim;
    const action={skill,anchor,captureAim,age:0,released:false};
    this.cooldowns.set(skill.id,skill.cooldown);
    this.actions.push(action);
    if(!skill.cast)this.release(action,player);
    return true;
  }

  release(action,player){
    if(action.released)return;
    const {skill}=action;
    action.released=true;
    if(skill.shape==='missile'){
      const hand=handOf(player),aim=action.captureAim();
      const muzzle=this.bout.space?.trace(player,hand);
      if(muzzle?.blocked){
        action.impactAt=action.age;
        action.anchor=muzzle.point;
        return;
      }
      const angle=Math.atan2(aim.y-hand.y,aim.x-hand.x);
      action.shot={...hand,angle,traveled:0};
    }else if(skill.shape==='sentry'){
      const {anchor}=action;
      const trigger=proximityTrigger(skill.radius,Infinity,skill.targetCooldownMs,0,
        ({actor})=>!this.sentrySpace?.trace(anchor,actor.enemy).blocked);
      action.sentry={trigger,flashes:new Map()};
    }else{
      if(skill.shape==='self-area')action.anchor={x:player.x,y:player.y};
      else if(skill.shape!=='ground')action.anchor=toward(handOf(player),action.captureAim(),skill.range);
      action.contact=this.bout.playerStrike(skill.id,player,action.anchor);
      if(action.contact?.heal){
        action.returnedOrbs=0;
        action.restoredHp=0;
      }
    }
  }

  advanceSentry(action,player){
    const {anchor,skill,sentry:{trigger,flashes}}=action;
    const elapsed=action.age-skill.cast;
    for(const [actor,shotAt] of flashes)if(elapsed-shotAt>=SENTRY_FLASH_MS)flashes.delete(actor);
    const targets=this.bout.enemies.filter(({enemy})=>enemy.hp>0).map(actor=>({
      actor,id:actor.id,team:'red',x:actor.enemy.x-anchor.x,y:actor.enemy.y-anchor.y,
    }));
    for(const {actor} of trigger(targets,elapsed)){
      const impact=boxCenter(actor.spec.box(actor.enemy));
      flashes.set(actor,elapsed);
      this.bout.hitEnemy(skill,actor,impact,player);
    }
  }

  advanceShot(action,dt,player){
    const {skill,shot}=action;
    const distance=Math.min(skill.speed*dt/1000,skill.range-shot.traveled);
    const desired={x:shot.x+distance*Math.cos(shot.angle),y:shot.y+distance*Math.sin(shot.angle)};
    const trace=this.bout.space?.trace(shot,desired,skill.missileRadius);
    const end=trace?.point??desired;
    let nearest=null,min=Infinity;
    for(const actor of this.bout.enemies){
      if(!actor.enemy.hp)continue;
      const point=segmentContact(shot,end,actor.spec.box(actor.enemy),skill.missileRadius);
      if(!point)continue;
      if(trace?.blocked&&Math.hypot(point.x-end.x,point.y-end.y)<1e-6)continue;
      if(this.bout.space&&!this.bout.clearLine(point,actor.enemy))continue;
      const d=Math.hypot(point.x-shot.x,point.y-shot.y);
      if(d<min){min=d;nearest={actor,point};}
    }
    Object.assign(shot,nearest?.point??end);
    shot.traveled+=distance;
    if(!nearest&&!trace?.blocked&&shot.traveled<skill.range)return;
    action.impactAt=action.age;
    action.anchor={x:shot.x,y:shot.y};
    action.shot=null;
    if(skill.radius){
      for(const actor of this.bout.enemies){
        const box=actor.spec.box(actor.enemy);
        if(actor.enemy.hp&&circleTouchesBox(action.anchor,skill.radius,box)&&
          (!this.bout.space||this.bout.clearLine(action.anchor,actor.enemy)))this.bout.hitEnemy(skill,actor,boxCenter(box),player);
      }
    }else if(nearest)this.bout.hitEnemy(skill,nearest.actor,nearest.point,player);
  }

  update(dt,player){
    if(!this.bout.started||!this.bout.playerHp){
      if(this.actions.length||this.cooldowns.size)this.reset();
      return;
    }
    for(const [id,ms] of this.cooldowns){
      if(ms<=dt)this.cooldowns.delete(id);
      else this.cooldowns.set(id,ms-dt);
    }
    this.actions=this.actions.filter(action=>{
      const {skill}=action;
      if(this.bout.finished&&action.returnedOrbs===undefined)return false;
      action.age+=dt;
      if(!action.released){
        if(this.bout.stunMs)return false;
        if(action.age>=skill.cast)this.release(action,player);
      }
      if(action.shot)this.advanceShot(action,dt,player);
      if(action.sentry){
        if(action.age>=skill.visualMs)return false;
        this.advanceSentry(action,player);
      }
      if(action.returnedOrbs!==undefined){
        const progress=(action.age-skill.cast)/(skill.visualMs-skill.cast);
        const total=action.contact.heal;
        while(action.returnedOrbs<DRAIN_ORBS&&progress>=orbArrivalProgress(action.returnedOrbs)){
          const arrived=++action.returnedOrbs;
          action.restoredHp+=this.bout.restoreHp(Math.ceil(arrived*total/DRAIN_ORBS)-Math.ceil((arrived-1)*total/DRAIN_ORBS));
          if(arrived===DRAIN_ORBS&&action.restoredHp>0)this.onDrainComplete?.(action.restoredHp);
        }
      }
      if(skill.shape==='missile')return Boolean(action.shot)||action.age-action.impactAt<skill.impactMs;
      return action.age<skill.visualMs;
    });
  }
}
