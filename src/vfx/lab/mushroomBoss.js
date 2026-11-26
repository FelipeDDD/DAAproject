import { groundPoint,RING } from './combatGeometry.js';

export const MUSHROOM_BOSS={
  maxHp:800,marks:[90,80,70,60,50,40,35,25,15],
  releaseMs:1000,recoveryMs:600,emergeMs:420,summonSpacingMs:260,summonRetryMs:350,
  reinforcementMs:20000,phaseHeal:{chargeMs:400,travelMs:600,impactMs:350},
  bloomPrediction:{seconds:0.4,maxLeadPx:55},
  sporecap:{minCount:2,maxCount:3,maxActive:5,radii:[80,112,144],separation:76,playerClearance:60},
  phases:[
    {name:'Infection',start:100,cooldown:1,control:['bloom']},
    {name:'Proliferation',start:70,cooldown:0.88,control:['bloom','sporecap'],sporecapInterval:[9000,12000]},
    {name:'Enraged',start:35,cooldown:0.76,control:['bloom','sporecap'],sporecapInterval:[7000,10000]},
  ],
};

export const SUMMONS={
  mini:{kind:'slime',label:'Mini Poison Slime',maxHp:45,size:0.65,scaleFactor:0.65,
    damage:12,contactDamage:3,jumpRadius:19,jumpStatus:'Poisoned',shot:null,special:null},
  poison:{kind:'slime',label:'Poison Slime'},
  swift:{kind:'swift'},
  frog:{kind:'frog'},
  snake:{kind:'snake'},
  final:{kind:'big',label:'Enraged Big Slime',maxHp:260,size:1.7,scaleFactor:1.7/1.5,damage:42,contactDamage:12},
};

const waves={90:['mini','mini','mini'],70:['poison','poison']};
export const eventNames={wave:'Summoning Wave',bloom:'Toxic Bloom',sporecap:'Sporecap',
  heal:'Healing Michael',reinforcements:'Reinforcements'};
const {chargeMs,travelMs,impactMs}=MUSHROOM_BOSS.phaseHeal;
export const PHASE_HEAL_IMPACT_MS=chargeMs+travelMs;
export const PHASE_HEAL_TOTAL_MS=PHASE_HEAL_IMPACT_MS+impactMs;

const {marks,phases}=MUSHROOM_BOSS;
const thresholdHp=(actor,percent)=>Math.round(actor.spec.maxHp*percent/100);
export const nextMark=actor=>marks[actor.boss.cursor];

export function initMushroomBoss(actor,startPhase){
  const phase=phases[startPhase-1];
  actor.enemy.hp=thresholdHp(actor,phase.start);
  actor.boss={phase,cursor:0,event:null,last:null,pendingSummons:[],summonWaitMs:0,
    waveMark:null,reinforcementRemaining:null};
  if(startPhase>1){
    actor.boss.cursor=marks.indexOf(phase.start);
    armMilestone(actor);
  }
}

function armMilestone(actor){
  const boss=actor.boss,mark=marks[boss.cursor++];
  const phase=phases.find(p=>p.start===mark);
  if(phase&&phase!==boss.phase){
    boss.phase=phase;
    boss.sporecapMs=undefined;
    boss.waveMark=null;
    boss.reinforcementRemaining=null;
    boss.pendingSummons=boss.pendingSummons.filter(summon=>!summon.reinforcement);
  }
  // A scheduled cast can yield to a milestone. Only milestones shield HP.
  if(actor.phase==='BossEvent')actor.phase='idle';
  // Shield immediately, but let any committed cast and its native recovery finish.
  boss.event={mark,id:null,released:false};
}

export function mushroomDamage(actor,damage){
  const boss=actor.boss;
  if(boss.event?.mark!==undefined)return 0;
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

export function bloomTargets(player,spacing,arena){
  const bounds=arena?.bounds??RING;
  const center=bloomCenter(player,arena,bounds);
  const dx=center.x<(bounds.left+bounds.right)/2?spacing:-spacing;
  const dy=center.y<(bounds.top+bounds.bottom)/2?spacing:-spacing;
  const horizontal={x:center.x+dx,y:center.y},vertical={x:center.x,y:center.y+dy};
  if(!arena)return [center,horizontal,vertical];
  const valid=point=>point.x>=bounds.left&&point.x<=bounds.right&&point.y>=bounds.top&&point.y<=bounds.bottom&&arena.clear(point);
  return [center,valid(horizontal)?horizontal:{x:center.x-dx,y:center.y},
    valid(vertical)?vertical:{x:center.x,y:center.y-dy}].filter(valid);
}

function bloomCenter(player,arena,bounds){
  const origin=groundPoint(player,10,bounds);
  const velocity=player.body?.velocity;
  const speed=Math.hypot(velocity?.x,velocity?.y);
  if(!Number.isFinite(speed)||!speed)return origin;
  const {seconds,maxLeadPx}=MUSHROOM_BOSS.bloomPrediction;
  const time=Math.min(seconds,maxLeadPx/speed);
  for(const fraction of [1,0.75,0.5,0.25]){
    const point=groundPoint({x:player.x+velocity.x*time*fraction,y:player.y+velocity.y*time*fraction},10,bounds);
    if(!arena||arena.clear(point)&&(!arena.canProject||arena.canProject(origin,point)))return point;
  }
  return origin;
}

function sporecapTargets(actor,player){
  const {bout,enemy}=actor,arena=bout.mushroomArena;
  const {minCount,maxCount,maxActive,radii,separation,playerClearance}=MUSHROOM_BOSS.sporecap;
  const active=bout.areas.filter(a=>a.sourceId===actor.id&&a.kind==='sporecap');
  if(maxActive-active.length<minCount)return [];
  const count=Math.min(maxActive-active.length,minCount+Math.floor(bout.aiRandom()*(maxCount-minCount+1)));
  const angleOffset=bout.aiRandom()*2*Math.PI;
  const points=[];
  for(let i=0;i<12*radii.length&&points.length<count;i++){
    const angle=angleOffset+i*Math.PI*11/18;
    const radius=radii[i%radii.length];
    const point=groundPoint({x:enemy.x+Math.cos(angle)*radius,y:enemy.y+Math.sin(angle)*radius},24,arena?.bounds);
    if(Math.hypot(point.x-player.x,point.y-player.y)<playerClearance||
      Math.hypot(point.x-enemy.x,point.y-enemy.y)<radii[0]*0.7||
      arena&&(!arena.clear(point)||!bout.clearLine(enemy,point))||
      [...active,...points].some(p=>Math.hypot(p.x-point.x,p.y-point.y)<separation))continue;
    points.push(point);
  }
  return points.length>=minCount?points:[];
}

function rollSporecapDelay(actor){
  const [min,max]=actor.boss.phase.sporecapInterval;
  return min+(max-min)*actor.bout.aiRandom();
}

export function tickSporecapClock(actor,dt){
  const {boss}=actor;
  if(boss.phase.sporecapInterval)
    boss.sporecapMs=Math.max(0,(boss.sporecapMs??rollSporecapDelay(actor))-dt);
}

export function releaseBloom(actor,points){
  const bout=actor.bout;
  bout.areas=bout.areas.filter(a=>a.sourceId!==actor.id||a.kind!=='toxic-bloom');
  for(const point of points)bout.addArea('toxic-bloom',actor.id,point);
}

function pick(actor,options){return options[Math.floor(actor.aiSample()*options.length)];}

function finalWave(actor){
  return ['final',...(actor.aiSample()<0.5?['swift','swift']:[pick(actor,['frog','snake']),'mini'])];
}

function queueWave(actor,player,ids,mark,reinforcement=false){
  const {boss}=actor;
  if(!boss.pendingSummons.length)boss.summonWaitMs=0;
  boss.pendingSummons.push(...ids.map(id=>({id,mark,reinforcement})));
  tickSummonWave(actor,player,0);
}

export function tickSummonWave(actor,player,dt){
  const {boss,bout}=actor;
  boss.summonWaitMs=Math.max(0,boss.summonWaitMs-dt);
  if(boss.summonWaitMs)return;
  const tried=new Set();
  const index=boss.pendingSummons.findIndex(({id,mark,reinforcement})=>{
    if(tried.has(id))return false;
    tried.add(id);
    const summon=bout.summonCreature(actor,SUMMONS[id],player,MUSHROOM_BOSS.emergeMs);
    if(!summon)return false;
    summon.summonWaveMark=mark;
    summon.reinforcement=reinforcement;
    return true;
  });
  if(index!==-1)boss.pendingSummons.splice(index,1);
  boss.summonWaitMs=index===-1?MUSHROOM_BOSS.summonRetryMs:MUSHROOM_BOSS.summonSpacingMs;
}

export function tickBossSummons(actor,player,dt){
  const {boss,bout}=actor;
  if(boss.pendingSummons.length)tickSummonWave(actor,player,dt);
  const mark=boss.waveMark;
  if(!waves[mark]||boss.pendingSummons.some(summon=>summon.mark===mark)||
    bout.enemies.some(mob=>mob.enemy.hp&&mob.summonerId===actor.id&&mob.summonWaveMark===mark))return;
  boss.reinforcementRemaining=(boss.reinforcementRemaining??MUSHROOM_BOSS.reinforcementMs)-dt;
  if(boss.reinforcementRemaining>0)return;
  boss.reinforcementRemaining=null;
  queueWave(actor,player,waves[mark],mark,true);
  boss.last=eventNames.reinforcements;
}

export function updateBossEvent(actor,player,engaged){
  const {boss}=actor;
  if(!boss.event&&engaged&&boss.sporecapMs===0){
    const points=sporecapTargets(actor,player);
    if(points.length)boss.event={id:'sporecap',points,released:false};
    else boss.sporecapMs=rollSporecapDelay(actor);
  }
  const event=boss.event;
  if(!event)return false;
  if(actor.phase!=='BossEvent'){
    actor.phase='BossEvent';
    actor.elapsed=0;
    if(!event.id){
      event.id=event.mark===35?'heal':waves[event.mark]?'wave':pick(actor,boss.phase.control);
    }
    const arena=actor.bout.mushroomArena;
    if(event.id==='sporecap'){
      event.points??=sporecapTargets(actor,player);
      boss.sporecapMs=rollSporecapDelay(actor);
    }else if(event.id==='bloom')event.points=bloomTargets(player,actor.spec.bloom.spacing,arena);
  }
  if(event.id==='heal'){
    if(!event.released&&actor.elapsed>=PHASE_HEAL_IMPACT_MS){
      event.released=true;
      actor.bout.completePhaseHeal();
      boss.last=eventNames.heal;
    }
    if(actor.elapsed<PHASE_HEAL_TOTAL_MS)return true;
    queueWave(actor,player,finalWave(actor),event.mark);
    boss.last=eventNames.wave;
    finishBossEvent(actor);
    return true;
  }
  if(!event.released&&actor.elapsed>=MUSHROOM_BOSS.releaseMs){
    event.released=true;
    const {id}=event;
    if(id==='wave'){
      boss.waveMark=event.mark;
      queueWave(actor,player,waves[event.mark],event.mark);
    }
    if(id==='bloom')releaseBloom(actor,event.points);
    if(id==='sporecap')for(const point of event.points)actor.bout.addArea(id,actor.id,point);
    boss.last=eventNames[id];
  }
  if(actor.elapsed>=MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs)finishBossEvent(actor);
  return true;
}

function finishBossEvent(actor){
  actor.boss.event=null;
  actor.phase='idle';
  actor.elapsed=0;
}
