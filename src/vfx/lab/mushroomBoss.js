import { groundPoint,RING } from './combatGeometry.js';

export const MUSHROOM_BOSS={
  maxHp:800,marks:[90,80,70,60,50,40,35,25,15],
  summonChance:0.5,summonLimit:2,releaseMs:1000,recoveryMs:600,emergeMs:420,
  phases:[
    {name:'Infection',start:100,cooldown:1,summons:['mini'],control:['bloom']},
    {name:'Proliferation',start:70,cooldown:0.88,summons:['poison','big'],control:['bloom','sporecap']},
    {name:'Enraged',start:35,cooldown:0.76,summons:[],control:['bloom','sporecap']},
  ],
};

export const SUMMONS={
  mini:{kind:'slime',label:'Mini Poison Slime',maxHp:45,size:0.65,scaleFactor:0.65,
    damage:12,contactDamage:3,jumpRadius:19,jumpStatus:'Poisoned',shot:null,special:null},
  poison:{kind:'slime',label:'Poison Slime'},
  big:{kind:'big',label:'Big Slime'},
  final:{kind:'big',label:'Enraged Big Slime',maxHp:260,size:1.7,scaleFactor:1.7/1.5,damage:42,contactDamage:12},
};

export const eventNames={...Object.fromEntries(Object.entries(SUMMONS).map(([id,s])=>[id,s.label])),
  bloom:'Toxic Bloom',sporecap:'Sporecap'};

const {marks,phases}=MUSHROOM_BOSS;
const thresholdHp=(actor,percent)=>Math.round(actor.spec.maxHp*percent/100);
export const nextMark=actor=>marks[actor.boss.cursor];

export function initMushroomBoss(actor,startPhase){
  const phase=phases[startPhase-1];
  actor.enemy.hp=thresholdHp(actor,phase.start);
  actor.boss={phase,cursor:0,event:null,last:null,finalPending:false};
  if(startPhase>1){
    actor.boss.cursor=marks.indexOf(phase.start);
    armMilestone(actor);
  }
}

function armMilestone(actor){
  const boss=actor.boss,mark=marks[boss.cursor++];
  boss.phase=phases.find(p=>p.start===mark)??boss.phase;
  // Shield immediately, but let any committed cast and its native recovery finish.
  boss.event={mark,id:null,released:false};
}

export function mushroomDamage(actor,damage){
  const boss=actor.boss;
  if(boss.event)return 0;
  const mark=nextMark(actor);
  if(mark!==undefined){
    const room=actor.enemy.hp-thresholdHp(actor,mark);
    if(damage>=room){
      armMilestone(actor);
      return room;
    }
  }
  return Math.min(actor.enemy.hp,damage);
}

export function bloomTargets(player,spacing){
  const center=groundPoint(player,10);
  const dx=center.x<(RING.left+RING.right)/2?spacing:-spacing;
  const dy=center.y<(RING.top+RING.bottom)/2?spacing:-spacing;
  return [center,{x:center.x+dx,y:center.y},{x:center.x,y:center.y+dy}];
}

export function releaseBloom(actor,points){
  const bout=actor.bout;
  bout.areas=bout.areas.filter(a=>a.sourceId!==actor.id||a.kind!=='toxic-bloom');
  for(const point of points)bout.addArea('toxic-bloom',actor.id,point);
}

function canSummon(actor){
  const {bout}=actor;
  return bout.freeEnemySlots>0&&bout.enemies.filter(a=>a.summonerId===actor.id&&a.enemy.hp).length<MUSHROOM_BOSS.summonLimit;
}

function pick(actor,options){return options[Math.floor(actor.aiSample()*options.length)];}

function chooseEvent(actor){
  const {boss}=actor;
  if(boss.event.mark===phases[2].start)return 'final';
  if(boss.phase.summons.length&&actor.aiSample()<MUSHROOM_BOSS.summonChance&&canSummon(actor)){
    return pick(actor,boss.phase.summons);
  }
  return pick(actor,boss.phase.control);
}

function spawnPoint(actor,player){
  // Choose the clearest nearby landing, checking Michael again at materialization.
  const others=actor.bout.enemies.filter(a=>a.enemy.hp);
  let best,clearance=-Infinity;
  for(let i=0;i<12;i++){
    const angle=i*Math.PI/6;
    const point=groundPoint({x:actor.enemy.x+78*Math.cos(angle),y:actor.enemy.y+78*Math.sin(angle)},30);
    const fromPlayer=Math.hypot(point.x-player.x,point.y-player.y);
    if(fromPlayer<54)continue;
    const free=Math.min(fromPlayer,...others.map(a=>Math.hypot(point.x-a.enemy.x,point.y-a.enemy.y)));
    if(free>clearance){clearance=free;best=point;}
  }
  return best;
}

function summon(actor,id,player){
  const point=spawnPoint(actor,player);
  if(!point||!actor.bout.freeEnemySlots)return false;
  actor.bout.summonSlime(actor,SUMMONS[id],point,MUSHROOM_BOSS.emergeMs);
  return true;
}

export function deliverFinalSummon(actor,player){
  if(actor.boss.finalPending&&summon(actor,'final',player)){
    actor.boss.finalPending=false;
    actor.boss.last=eventNames.final;
  }
}

export function updateBossEvent(actor,player){
  const {boss}=actor,event=boss.event;
  if(!event)return false;
  if(actor.phase!=='BossEvent'){
    actor.phase='BossEvent';
    actor.elapsed=0;
    event.id=chooseEvent(actor);
    event.points=bloomTargets(player,actor.spec.bloom.spacing);
  }
  if(!event.released&&actor.elapsed>=MUSHROOM_BOSS.releaseMs){
    event.released=true;
    let id=event.id;
    if(id==='final'){
      boss.finalPending=true;
      deliverFinalSummon(actor,player);
      if(boss.finalPending)id='bloom';
    }else if(SUMMONS[id]&&(!canSummon(actor)||!summon(actor,id,player)))id='bloom';
    if(id==='bloom')releaseBloom(actor,event.points);
    if(id==='sporecap'){
      actor.bout.areas=actor.bout.areas.filter(a=>a.sourceId!==actor.id||a.kind!=='sporecap');
      actor.bout.addArea(id,actor.id,event.points[0]);
    }
    boss.last=eventNames[id];
  }
  if(actor.elapsed>=MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs){
    boss.event=null;
    actor.phase='idle';
    actor.elapsed=0;
  }
  return true;
}
