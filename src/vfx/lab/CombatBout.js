import { handOf,lashTip } from './precisionDemo.js';
import { SKILLS } from './combatSkills.js';
import { clamp,toward,playerBox,boxCenter,circleTouchesBox,segmentContact,cleaveContact } from './combatGeometry.js';
import { CombatEnemy,ENEMIES } from './combatEnemy.js';
import { AREAS,groundArea,updateArea } from './combatAreas.js';
import { initMushroomBoss,mushroomDamage,deliverFinalSummon } from './mushroomBoss.js';

export const POISON={ticks:4,interval:1000,damage:3};
export const SLOW_MS=1700;
const DEFAULT_SLOW_SPEED=0.72;
const CONTACT_GRACE_MS=200;
export const MAX_PER_KIND=3;
const spawns=[{x:476,y:304},{x:440,y:214},{x:440,y:383},{x:517,y:237},{x:517,y:373},{x:357,y:183}];
export const MAX_ENEMIES=spawns.length;
const HP=100;

export class CombatBout{
  constructor(onHit,random=Math.random,aiRandom=Math.random){
    this.onHit=onHit;
    this.random=random;
    this.aiRandom=aiRandom;
    this.ai={randomized:false,antiKiting:false,specialMode:'variant'};
    this.reset();
  }

  reset(composition='slime',mushroomPhase=1){
    const kinds=typeof composition==='string'?[composition]:composition;
    if(kinds.length>MAX_ENEMIES||kinds.some(k=>!Object.hasOwn(ENEMIES,k)||
      kinds.filter(x=>x===k).length>(ENEMIES[k].maxPerEncounter??MAX_PER_KIND))){
      throw new RangeError('Invalid sandbox composition');
    }
    this.enemies=kinds.map((kind,i)=>new CombatEnemy(this,kind,i,spawns[i]));
    const boss=this.enemies.find(a=>a.kind==='mushroom');
    if(boss)initMushroomBoss(boss,mushroomPhase);
    this.playerHp=HP;
    this.areas=[];
    this.poison=null;
    this.cloudEnabled=false;
    this.onIce=false;
    this.slows=new Map();
    this.contactGraceMs=0;
    this.specialGraceMs=0;
    this.stunMs=0;
    this.started=false;
  }

  get alive(){return this.enemies.filter(e=>e.enemy.hp>0).length;}
  get freeEnemySlots(){return MAX_ENEMIES-this.alive;}

  summonSlime(owner,variant,point,emergeMs){
    if(!this.freeEnemySlots)return;
    const base=ENEMIES[variant.kind];
    const spec={...base,...variant,scale:base.scale*(variant.scaleFactor??1)};
    const actor=new CombatEnemy(this,variant.kind,this.enemies.length,point,spec);
    actor.summonerId=owner.id;
    actor.phase='emerging';
    actor.emergeMs=emergeMs;
    actor.aggro={outsideMs:0};
    this.enemies.push(actor);
  }
  get finished(){
    return !this.playerHp||(!this.alive&&!this.areas.length&&!this.poison&&this.enemies.every(e=>e.elapsed>=e.deathMs));
  }
  get slowMs(){return Math.max(0,...this.slows.values());}
  get speedFactor(){return Math.min(this.onIce?AREAS.ice.speed:1,...this.slows.keys());}

  playerStrike(id,player,aim){
    if(!this.started||!this.playerHp||this.stunMs)return null;
    const skill=SKILLS[id],hand=handOf(player),hits=[];
    for(const actor of this.enemies){
      if(!actor.enemy.hp)continue;
      const box=actor.spec.box(actor.enemy);
      let point,band,critical=false;
      if(skill.shape==='tip'){
        const tip=lashTip(hand,aim);
        if(circleTouchesBox(tip,skill.radius,box)){
          critical=this.random()<skill.criticalChance;
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
      if(point)hits.push({actor,point,band,critical,distance:Math.hypot(point.x-hand.x,point.y-hand.y)});
    }
    if(!hits.length)return null;
    if(skill.shape==='ray'){
      hits.sort((a,b)=>a.distance-b.distance);
      const [{actor,point,band}]=hits;
      const damage=this.hitEnemy(band,actor,point,player);
      return {...point,heal:damage?band.heal:0};
    }
    for(const {actor,critical,point} of hits)this.hitEnemy(skill,actor,point,player,critical);
    return hits[0].point;
  }

  hitEnemy(skill,actor,point,player,critical=false){
    if(!actor.enemy.hp||!this.playerHp)return 0;
    const damage=critical?skill.critical:skill.damage;
    const applied=actor.boss?mushroomDamage(actor,damage):Math.min(damage,actor.enemy.hp);
    if(!applied){
      this.onHit?.('enemy',0,point,{actor,immune:true});
      return 0;
    }
    actor.enemy.hp-=applied;
    if(actor.enemy.hp)actor.spec.onDamaged?.(actor,player);
    if(skill.status&&actor.enemy.hp)actor.slow={...skill.status};
    this.onHit?.('enemy',applied,point,{critical,actor,status:skill.status?.name});
    if(!actor.enemy.hp){
      actor.stop();
      if(actor.boss)this.areas=this.areas.filter(area=>area.sourceId!==actor.id);
      if(actor.spec.hazard)this.addArea(actor.spec.hazard,actor.id,actor.enemy);
    }
    return applied;
  }

  restoreHp(amount){
    const restored=this.playerHp?Math.min(amount,HP-this.playerHp):0;
    this.playerHp+=restored;
    return restored;
  }

  addArea(kind,sourceId,point){
    if(kind==='haze')this.areas=this.areas.filter(area=>area.kind!=='haze'||area.sourceId!==sourceId);
    this.areas.push(groundArea(kind,sourceId,point));
  }

  renewPoison(){
    if(!this.poison)this.poison={remaining:POISON.ticks,untilTick:POISON.interval};
    else this.poison.remaining=POISON.ticks;
  }

  stun(duration){
    if(this.playerHp)this.stunMs=Math.max(this.stunMs,duration);
  }

  touch(damage,point){
    if(this.contactGraceMs||!this.playerHp)return false;
    this.contactGraceMs=CONTACT_GRACE_MS;
    this.hurt(damage,point);
    return true;
  }

  hurt(damage,point,status,statusMs,slowSpeed=DEFAULT_SLOW_SPEED){
    if(!this.playerHp)return;
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
        if(actor.boss)actor.boss.finalPending=false;
        if(actor.enemy.hp)actor.stop();
      }
      this.poison=null;
      this.areas=[];
      this.slows.clear();
      this.stunMs=0;
      this.onIce=false;
    }
  }

  update(dt,player,paused=false){
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
        this.hurt(POISON.damage,boxCenter(playerBox(player)));
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
      if(actor.boss?.finalPending)deliverFinalSummon(actor,player);
      actor.update(dt,player);
    });
    if(this.finished){
      this.slows.clear();
      this.stunMs=0;
    }
  }
}
