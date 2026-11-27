import { PLAYER_MAX_HP } from '../../boss/config.js';
import { handOf,lashTip,lashPrecisionBox } from './precisionDemo.js';
import { BURN_TICK_MS,SKILLS } from './combatSkills.js';
import { clamp,groundPoint,toward,playerBox,boxCenter,circleTouchesBox,segmentContact,cleaveContact } from './combatGeometry.js';
import { CombatEnemy,ENEMIES } from './combatEnemy.js';
import { AREAS,groundArea,updateArea } from './combatAreas.js';
import { initMushroomBoss,mushroomDamage,tickBossSummons } from './mushroomBoss.js';

export const POISON={ticks:4,interval:1000,damage:3};
export const SLOW_MS=1700;
const DEFAULT_SLOW_SPEED=0.72;
const CONTACT_GRACE_MS=200;
export const MAX_PER_KIND=3;
const spawns=[{x:476,y:304},{x:440,y:214},{x:440,y:383},{x:517,y:237},{x:517,y:373},{x:357,y:183}];
export const MAX_ENEMIES=spawns.length;
const COMBAT_DEFAULTS={
  ai:{randomized:false,antiKiting:true,specialMode:'variant'},
  cloudEnabled:true,
};

export class CombatBout{
  constructor(onHit,random=Math.random,aiRandom=Math.random,
    {space=null,continuous=false,mushroomArena=null,allowParry=false,onLashImpact}={}){
    this.onHit=onHit;
    this.random=random;
    this.aiRandom=aiRandom;
    this.space=space;
    this.continuous=continuous;
    this.mushroomArena=mushroomArena;
    this.allowParry=allowParry;
    this.onLashImpact=onLashImpact;
    this.ai={...COMBAT_DEFAULTS.ai};
    this.reset();
  }

  reset(composition='slime',mushroomPhase=1){
    const kinds=typeof composition==='string'?[composition]:composition;
    if(kinds.length>MAX_ENEMIES||kinds.some(k=>!Object.hasOwn(ENEMIES,k)||
      kinds.filter(x=>x===k).length>(ENEMIES[k].maxPerEncounter??MAX_PER_KIND))){
      throw new RangeError('Invalid sandbox composition');
    }
    this.enemies=kinds.map((kind,i)=>new CombatEnemy(this,kind,i,spawns[i]));
    this.nextSummonId=kinds.length;
    const boss=this.enemies.find(a=>a.kind==='mushroom');
    if(boss)initMushroomBoss(boss,mushroomPhase);
    this.playerHp=PLAYER_MAX_HP;
    this.areas=[];
    this.poison=null;
    this.cloudEnabled=COMBAT_DEFAULTS.cloudEnabled;
    this.onIce=false;
    this.slows=new Map();
    this.contactGraceMs=0;
    this.specialGraceMs=0;
    this.stunMs=0;
    this.parry=null;
    this.started=false;
  }

  get alive(){return this.enemies.filter(e=>e.enemy.hp>0).length;}
  summonCreature(owner,variant,player,emergeMs){
    const base=ENEMIES[variant.kind];
    const spec={...base,...variant,scale:base.scale*(variant.scaleFactor??1)};
    const point=this.summonPoint(owner,variant.kind,spec,player);
    if(!point)return;
    const actor=this.mushroomArena?this.mushroomArena.createSummon(owner,variant.kind,point,spec):
      new CombatEnemy(this,variant.kind,this.nextSummonId++,point,spec);
    if(!actor)return;
    actor.summonerId=owner.id;
    actor.phase='emerging';
    actor.emergeMs=emergeMs;
    actor.aggro={outsideMs:0};
    if(!this.mushroomArena)this.enemies.push(actor);
    return actor;
  }

  summonPoint(owner,kind,spec,player){
    const arena=this.mushroomArena;
    const living=this.enemies.filter(a=>a.enemy.hp);
    for(const radius of [78,112,148,184,220]){
      let best,clearance=-Infinity;
      for(let i=0;i<16;i++){
        const angle=i*Math.PI/8;
        const point=groundPoint({x:owner.enemy.x+radius*Math.cos(angle),y:owner.enemy.y+radius*Math.sin(angle)},30,arena?.bounds);
        const distance=Math.hypot(point.x-player.x,point.y-player.y);
        if(distance<54)continue;
        if(arena?!arena.canSummon(owner,kind,point,living):living.some(a=>
          Math.hypot(point.x-a.enemy.x,point.y-a.enemy.y)<16*(spec.size+a.spec.size)))continue;
        const free=Math.min(distance,...living.map(a=>Math.hypot(point.x-a.enemy.x,point.y-a.enemy.y)));
        if(free>clearance){best=point;clearance=free;}
      }
      if(best)return best;
    }
  }
  get finished(){
    return !this.playerHp||(!this.continuous&&!this.alive&&!this.areas.length&&!this.poison&&this.enemies.every(e=>e.elapsed>=e.deathMs));
  }
  get canCast(){return this.continuous||Boolean(this.alive);}
  get defending(){return this.parry?.phase==='active';}
  get protectingPhaseHeal(){
    return this.enemies.some(actor=>actor.enemy.hp&&actor.phase==='BossEvent'&&actor.boss?.event?.id==='heal');
  }
  clearLine(from,to){return !this.space||!this.space.trace(from,to).blocked;}
  get slowMs(){return Math.max(0,...this.slows.values());}
  get speedFactor(){return Math.min(this.onIce?AREAS.ice.speed:1,...this.slows.keys());}

  playerStrike(id,player,aim){
    if(!this.started||!this.playerHp||this.stunMs||this.defending)return null;
    const skill=SKILLS[id],hand=handOf(player),hits=[];
    const ground=skill.shape==='ground'||skill.shape==='self-area';
    const tip=skill.shape==='tip'?lashTip(hand,aim,skill.range):null;
    const targets=tip&&this.onLashImpact?[]:null;
    for(const actor of this.enemies){
      if(!actor.enemy.hp)continue;
      const box=actor.spec.box(actor.enemy);
      const precisionBox=tip?lashPrecisionBox(box):null;
      const target=targets&&{box,precisionBox,result:'miss'};
      if(target)targets.push(target);
      let point,band;
      if(tip){
        if(circleTouchesBox(tip,skill.radius,box)){
          point={x:clamp(tip.x,box.x,box.x+box.width),y:clamp(tip.y,box.y,box.y+box.height)};
        }
      }else if(skill.shape==='ray'){
        const center=boxCenter(box);
        const distance=Math.hypot(center.x-hand.x,center.y-hand.y);
        band=skill.bands.find(band=>distance<=band.range);
        if(band)point=segmentContact(hand,toward(hand,aim,skill.range),box,skill.rayPadding);
      }
      else if(skill.shape==='arc')point=cleaveContact(hand,aim,box,skill.range);
      else if(skill.shape==='ground'&&Math.hypot(actor.enemy.x-aim.x,actor.enemy.y-aim.y)<=skill.radius)point=boxCenter(box);
      else if(skill.shape==='self-area'&&circleTouchesBox(aim,skill.radius,box))point=boxCenter(box);
      if(!point)continue;
      if(!this.clearLine(ground?aim:player,actor.enemy)||!ground&&!this.clearLine(hand,point))continue;
      const precision=Boolean(precisionBox&&circleTouchesBox(tip,0,precisionBox));
      const critical=precision&&this.random()<skill.criticalChance;
      if(target)target.result=critical?'critical':precision?'precision':'normal';
      hits.push({actor,point,band,critical,distance:Math.hypot(point.x-hand.x,point.y-hand.y)});
    }
    if(targets)this.onLashImpact({tip,radius:skill.radius,targets});
    if(!hits.length)return null;
    if(skill.shape==='ray'){
      hits.sort((a,b)=>a.distance-b.distance);
      const [{actor,point,band}]=hits;
      const damage=this.hitEnemy(band,actor,point,player);
      return {...point,heal:Math.min(damage,band.heal)};
    }
    for(const {actor,critical,point} of hits)this.hitEnemy(skill,actor,point,player,critical);
    return hits[0].point;
  }

  hitEnemy(skill,actor,point,player,critical=false,{periodic=false}={}){
    if(!actor.enemy.hp||!this.playerHp)return 0;
    const damage=critical?skill.critical:skill.damage;
    const applied=actor.boss?mushroomDamage(actor,damage):Math.min(damage,actor.enemy.hp);
    if(!applied){
      this.onHit?.('enemy',0,point,{actor,immune:true});
      return 0;
    }
    actor.enemy.hp-=applied;
    if(!periodic&&actor.enemy.hp&&(!actor.navigation||actor.navigation.onDamaged(actor,player)))actor.spec.onDamaged?.(actor,player);
    if(skill.status&&actor.enemy.hp)actor.slow={...skill.status};
    if(skill.burning&&actor.enemy.hp)actor.burning={damage:skill.burning.damage,remaining:skill.burning.ms,untilTick:BURN_TICK_MS};
    this.onHit?.('enemy',applied,point,{critical,actor,status:skill.status?.name,reaction:skill.reaction});
    if(!actor.enemy.hp){
      actor.burning=undefined;
      actor.stop();
      if(actor.boss){
        actor.boss.pendingSummons.length=0;
        actor.boss.reinforcementRemaining=null;
        this.areas=this.areas.filter(area=>area.sourceId!==actor.id);
      }
      if(actor.spec.hazard)this.addArea(actor.spec.hazard,actor.id,actor.enemy);
    }
    return applied;
  }

  advanceBurning(actor,dt,player){
    const burn=actor.burning;
    if(!burn)return;
    const elapsed=Math.min(dt,burn.remaining);
    burn.remaining-=elapsed;
    burn.untilTick-=elapsed;
    while(actor.burning&&burn.untilTick<=0){
      burn.untilTick+=BURN_TICK_MS;
      this.hitEnemy(burn,actor,boxCenter(actor.spec.box(actor.enemy)),player,false,{periodic:true});
    }
    if(!burn.remaining)actor.burning=undefined;
  }

  restoreHp(amount){
    const restored=this.playerHp?Math.min(amount,PLAYER_MAX_HP-this.playerHp):0;
    this.playerHp+=restored;
    return restored;
  }

  completePhaseHeal(){
    this.restoreHp(PLAYER_MAX_HP);
    this.poison=null;
    this.slows.clear();
    this.stunMs=0;
    this.onIce=false;
  }

  beginParry(config,onComplete){
    if(!this.allowParry||!this.started||this.finished||this.stunMs||this.parry)return false;
    this.parry={phase:'active',remaining:config.activeMs,config,blockedDamage:0,onComplete};
    return true;
  }

  advanceParry(dt){
    const parry=this.parry;
    if(!parry)return;
    parry.remaining-=dt;
    if(parry.remaining>0)return;
    this.parry=null;
    if(parry.phase==='recovery')return;
    const {healFraction,maxHeal,recoveryMs}=parry.config;
    if(parry.blockedDamage>0){
      const healed=this.restoreHp(Math.min(maxHeal,parry.blockedDamage*healFraction));
      parry.onComplete?.({blocked:parry.blockedDamage,healed});
    }else if(parry.remaining+recoveryMs>0){
      this.parry={phase:'recovery',remaining:parry.remaining+recoveryMs,config:parry.config};
    }
  }

  addArea(kind,sourceId,point){
    if(kind==='haze')this.areas=this.areas.filter(area=>area.kind!=='haze'||area.sourceId!==sourceId);
    this.areas.push(groundArea(kind,sourceId,point));
  }

  renewPoison(){
    if(this.protectingPhaseHeal)return;
    if(!this.poison)this.poison={remaining:POISON.ticks,untilTick:POISON.interval};
    else this.poison.remaining=POISON.ticks;
  }

  stun(duration){
    if(this.playerHp&&!this.protectingPhaseHeal)this.stunMs=Math.max(this.stunMs,duration);
  }

  touch(damage,point){
    if(this.contactGraceMs||!this.playerHp||this.protectingPhaseHeal)return false;
    this.contactGraceMs=CONTACT_GRACE_MS;
    this.hurt(damage,point);
    return true;
  }

  hurt(damage,point,status,statusMs,slowSpeed=DEFAULT_SLOW_SPEED,{periodic=false}={}){
    if(!this.playerHp)return;
    if(this.protectingPhaseHeal)return 'blocked';
    if(this.defending&&!periodic&&damage>0){
      const blocked=damage*this.parry.config.blockFraction;
      if(blocked>0){
        this.parry.blockedDamage+=blocked;
        this.parry.blockRemaining=this.parry.remaining;
        damage-=blocked;
        if(!damage)return 'blocked';
      }
    }
    if(this.parry?.phase==='recovery')damage*=this.parry.config.recoveryDamageMultiplier;
    const applied=Math.min(this.playerHp,damage);
    this.playerHp-=applied;
    if(status==='Poisoned')this.renewPoison();
    if(status==='Slowed'){
      const duration=statusMs??SLOW_MS;
      this.slows.set(slowSpeed,Math.max(duration,this.slows.get(slowSpeed)??0));
    }
    if(status==='Stunned')this.stun(statusMs);
    this.onHit?.('player',applied,point,{status});
    if(!this.playerHp){
      for(const actor of this.enemies){
        actor.burning=undefined;
        if(actor.boss){
          actor.boss.pendingSummons.length=0;
          actor.boss.reinforcementRemaining=null;
        }
        if(actor.enemy.hp)actor.stop();
      }
      this.enemies=this.enemies.filter(actor=>actor.summonerId===undefined);
      this.poison=null;
      this.areas=[];
      this.slows.clear();
      this.stunMs=0;
      this.onIce=false;
      this.parry=null;
    }
  }

  update(dt,player,paused=false){
    // Guard and recovery follow the player clock, even while enemy AI is paused.
    if(this.parry){
      if(!this.started||this.finished)this.parry=null;
      else this.advanceParry(dt);
    }
    if(!this.started||paused)return;
    if(!this.playerHp){
      for(const actor of this.enemies)if(!actor.enemy.hp)actor.elapsed=Math.min(actor.deathMs,actor.elapsed+dt);
      return;
    }
    if(this.finished)return;
    for(const [speed,ms] of this.slows){
      if(ms<=dt)this.slows.delete(speed);
      else this.slows.set(speed,ms-dt);
    }
    this.contactGraceMs=Math.max(0,this.contactGraceMs-dt);
    this.specialGraceMs=Math.max(0,this.specialGraceMs-dt);
    this.stunMs=Math.max(0,this.stunMs-dt);
    if(this.poison){
      this.poison.untilTick-=dt;
      while(this.poison?.untilTick<=0){
        this.poison.untilTick+=POISON.interval;
        if(--this.poison.remaining===0)this.poison=null;
        this.hurt(POISON.damage,boxCenter(playerBox(player)),undefined,undefined,undefined,{periodic:true});
      }
    }
    this.onIce=false;
    for(const area of this.areas){
      if(!this.playerHp)break;
      updateArea(area,dt,player,this);
    }
    this.areas=this.areas.filter(a=>a.age<a.lifetime);
    if(!this.playerHp)return;
    // An actor created during this tick starts its emergence on the following tick.
    this.enemies.forEach(actor=>{
      if(!this.playerHp)return;
      if(this.continuous&&!actor.enemy.hp){
        actor.elapsed=Math.min(actor.deathMs,actor.elapsed+dt);
        return;
      }
      this.advanceBurning(actor,dt,player);
      if(actor.enemy.hp&&actor.boss)tickBossSummons(actor,player,dt);
      actor.update(dt,player);
    });
    if(!this.continuous){
      const expired=actor=>actor.reinforcement&&!actor.enemy.hp&&actor.elapsed>=actor.deathMs&&
        !this.areas.some(area=>area.sourceId===actor.id);
      if(this.enemies.some(expired))this.enemies=this.enemies.filter(actor=>!expired(actor));
    }
    if(this.finished){
      this.slows.clear();
      this.stunMs=0;
      this.parry=null;
    }
  }
}
