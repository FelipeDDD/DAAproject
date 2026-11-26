import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CombatBout,POISON } from '../src/vfx/lab/CombatBout.js';
import { AREAS } from '../src/vfx/lab/combatAreas.js';
import { RING,boxCenter,playerBox } from '../src/vfx/lab/combatGeometry.js';
import { MUSHROOM_SHEETS,mushroomPose } from '../src/vfx/lab/mushroomArt.js';
import { MUSHROOM_BOSS,PHASE_HEAL_IMPACT_MS,PHASE_HEAL_TOTAL_MS,bloomTargets,nextMark,tickSummonWave } from '../src/vfx/lab/mushroomBoss.js';
import { CombatEnemy } from '../src/vfx/lab/combatEnemy.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';

const player={x:389,y:304,displayHeight:64};
const dodge={...player,y:414};

function fight(composition='mushroom'){
  const bout=new CombatBout();
  bout.reset(composition);
  bout.started=true;
  return bout;
}

function advance(bout,ms,target=player){
  for(let t=0;t<ms;t+=10)bout.update(Math.min(ms-t,10),target);
}

test('a world arena projects casts onto valid ground and summons with unrelated mobs alive',()=>{
  const bounds={left:1000,top:1000,right:1500,bottom:1500};
  const clear=point=>point.x<=1250;
  const created=[];
  const arena={
    bounds,clear,canSummon:(_owner,_kind,point)=>clear(point),
    createSummon(owner,kind,point,spec){
      const actor=new CombatEnemy(owner.bout,kind,owner.bout.enemies.length,point,spec);
      owner.bout.enemies.push(actor);
      created.push(actor);
      return actor;
    },
  };
  const bout=new CombatBout(undefined,()=>0.1,()=>0.1,{mushroomArena:arena,continuous:true});
  bout.reset('mushroom');
  const [boss]=bout.enemies;
  Object.assign(boss.enemy,{x:1210,y:1200});
  boss.aiSample=()=>0.1;
  const target={...player,x:1238,y:1300};
  for(let i=1;i<=7;i++)bout.enemies.push(new CombatEnemy(bout,'slime',i,{x:100,y:100}));
  assert.equal(bout.alive,8);
  const blooms=bloomTargets(target,44,arena);
  assert.equal(blooms.length,3);
  assert.ok(blooms.every(p=>p.x>=bounds.left&&p.y>=bounds.top&&clear(p)));
  bout.hitEnemy({damage:100},boss,boss.enemy,target);
  boss.update(16,target);
  boss.update(MUSHROOM_BOSS.releaseMs,target);
  assert.equal(created.length,1);
  const [summon]=created;
  assert.equal(summon.summonerId,boss.id);
  assert.equal(summon.phase,'emerging');
  assert.equal(summon.enemy.hp,45);
  assert.ok(summon.enemy.x>=bounds.left&&summon.enemy.y>=bounds.top&&clear(summon.enemy));
});

// Death-only tests start after all gates; the full HP progression is tested separately.
function lastHit(bout,actor){
  actor.boss.cursor=MUSHROOM_BOSS.marks.length;
  bout.hitEnemy({damage:actor.enemy.hp},actor,actor.enemy,player);
}

test('Mushroom uses the original transparent strips and plays the full native death sequence',()=>{
  assert.deepEqual(Object.values(MUSHROOM_SHEETS).map(art=>art.frames),[12,12,14]);
  for(const art of Object.values(MUSHROOM_SHEETS)){
    const png=readFileSync(new URL(art.url));
    assert.equal(png.readUInt32BE(16),art.width*art.frames);
    assert.equal(png.readUInt32BE(20),art.height);
    assert.equal(png.readUInt8(25),6);
  }
  const bout=fight(),[actor]=bout.enemies;
  advance(bout,210);
  assert.deepEqual(mushroomPose(actor),['mushroom-idle',2]);
  lastHit(bout,actor);
  assert.deepEqual(mushroomPose(actor),['mushroom-death',0]);
  advance(bout,actor.deathMs-1);
  assert.deepEqual(mushroomPose(actor),['mushroom-death',13]);
  assert.equal(bout.finished,false);
  advance(bout,1);
  assert.equal(bout.finished,true);
});

test('Mushroom is idle outside detection, acquires aggro from hits and uses a body-sized hurtbox',()=>{
  const bout=fight(),[actor]=bout.enemies;
  const far={...player,x:275,y:148};
  advance(bout,600,far);
  assert.equal(actor.enemy.x,476);
  assert.equal(actor.aggro,null);
  bout.hitEnemy({damage:10},actor,actor.enemy,far);
  assert.ok(actor.aggro);
  advance(bout,400,far);
  assert.ok(actor.enemy.x<476&&actor.enemy.x>=476-44*0.4);
  const box=actor.spec.box(actor.enemy);
  assert.equal(box.y+box.height,actor.enemy.y);
  assert.ok(box.height<actor.spec.capHeight&&box.width<80);
  const approach=fight();
  approach.update(10,player);
  assert.ok(approach.enemies[0].aggro);
});

test('Spore Burst emits three spores after charging, damages once per volley and can be dodged',()=>{
  for(const scenario of ['hit','dodge','overlap']){
    const bout=fight(),[actor]=bout.enemies;
    actor.cooldown=0;
    bout.update(1,player);
    assert.equal(actor.attack.kind,'spore');
    advance(bout,799);
    assert.equal(actor.shots.length,0);
    assert.deepEqual(mushroomPose(actor),['mushroom-attack',3]);
    bout.update(1,player);
    assert.equal(actor.shots.length,3);
    assert.equal(new Set(actor.shots.map(shot=>shot.angle)).size,3);
    if(scenario==='overlap'){
      for(const shot of actor.shots)Object.assign(shot,boxCenter(playerBox(player)));
    }
    advance(bout,1600,scenario==='dodge'?dodge:player);
    assert.equal(bout.playerHp,scenario==='dodge'?100:84);
    assert.equal(actor.shots.length,0);
  }
});

test('Toxic Bloom freezes three distinct warnings and shares one Poisoned effect for five-second areas',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.cooldown=0;
  actor.nextAttack='bloom';
  bout.update(1,player);
  const points=actor.attack.points;
  assert.deepEqual(points[0],{x:player.x,y:player.y});
  assert.equal(new Set(points.map(point=>[point.x,point.y].join(','))).size,3);
  assert.ok(points.every(({x,y})=>x>RING.left&&x<RING.right&&y>RING.top&&y<RING.bottom));
  advance(bout,999,dodge);
  assert.equal(bout.areas.length,0);
  bout.update(1,dodge);
  assert.deepEqual(bout.areas.map(({x,y})=>({x,y})),points);
  assert.equal(bout.poison,null);
  actor.cooldown=10000;
  bout.update(10,player);
  const poison=bout.poison;
  assert.equal(poison.remaining,POISON.ticks);
  advance(bout,1900);
  assert.equal(bout.poison,poison);
  advance(bout,AREAS['toxic-bloom'].lifetime-1910,dodge);
  assert.equal(bout.areas.length,0);
});

test('Toxic Bloom predicts motion once, caps the lead and allows a change of direction',()=>{
  const bout=fight(),[actor]=bout.enemies;
  const moving={...player,body:{velocity:{x:500,y:0}}};
  actor.cooldown=0;
  actor.nextAttack='bloom';
  bout.update(1,moving);
  const points=actor.attack.points;
  assert.deepEqual(points[0],{x:player.x+55,y:player.y});
  assert.equal(bloomTargets({...moving,body:{velocity:{x:100,y:0}}},44)[0].x,player.x+40);
  const arena={bounds:RING,clear:point=>point.x<420,canProject:(_from,to)=>to.x<420};
  assert.equal(bloomTargets(moving,44,arena)[0].x,player.x+27.5);
  moving.body.velocity.x=-128;
  advance(bout,1000,{...moving,x:player.x-60});
  assert.deepEqual(bout.areas.map(({x,y})=>({x,y})),points);
  assert.equal(bout.poison,null);
});

test('mixed composition allows one Mushroom and clears its hazards on death and reset',()=>{
  const kinds=['mushroom','slime','ghost','frog','snake','frost'];
  const bout=fight(kinds),[actor,slime]=bout.enemies;
  assert.equal(bout.alive,6);
  assert.throws(()=>bout.reset(['mushroom','mushroom']),RangeError);
  bout.addArea('toxic-bloom',actor.id,player);
  bout.addArea('haze',slime.id,player);
  lastHit(bout,actor);
  assert.equal(actor.shots.length,0);
  assert.deepEqual(bout.areas.map(area=>area.kind),['haze']);
  bout.reset(kinds);
  assert.equal(bout.enemies[0].enemy.hp,800);
  assert.equal(bout.areas.length,0);
});

const farAway={...player,x:275,y:148};
function cross(bout,actor){
  bout.hitEnemy({damage:9999},actor,actor.enemy,farAway);
  bout.update(1,farAway);
}
function settle(bout){
  advance(bout,MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs,farAway);
}

test('large and repeated hits stop at each mark once, phase transitions and CC survive a full fight',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.aiSample=()=>0.99;
  assert.equal(actor.enemy.hp,800);
  for(const percent of MUSHROOM_BOSS.marks){
    bout.restoreHp(100);
    assert.equal(nextMark(actor),percent);
    cross(bout,actor);
    assert.equal(actor.enemy.hp,8*percent);
    assert.equal(actor.phase,'BossEvent');
    const phase=percent>70?'Infection':percent>35?'Proliferation':'Enraged';
    assert.equal(actor.boss.phase.name,phase);
    assert.equal(bout.hitEnemy({damage:90},actor,actor.enemy,player),0);
    assert.equal(actor.enemy.hp,8*percent);
    for(let t=0;t<MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs;t+=10){
      bout.update(10,farAway);
      bout.restoreHp(100);
    }
    assert.equal(actor.boss.event,null);
    assert.equal(actor.boss.last,[90,70,35].includes(percent)?'Summoning Wave':percent>70?'Toxic Bloom':'Sporecap');
  }
  assert.equal(bout.enemies.length,9);
  assert.ok(bout.enemies.some(enemy=>enemy.enemy.hp===260));
  assert.equal(nextMark(actor),undefined);
  bout.hitEnemy({damage:999},actor,actor.enemy,player);
  assert.equal(actor.enemy.hp,0);
  assert.equal(bout.finished,false);
  assert.equal(bout.areas.some(a=>a.sourceId===actor.id),false);
});

test('threshold shield lets committed Spore Burst and its recovery play through, including while paused',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.cooldown=0;
  bout.update(1,player);
  const aim=actor.attack;
  advance(bout,200);
  bout.hitEnemy({damage:10},actor,actor.enemy,player);
  assert.equal(actor.attack,aim);
  cross(bout,actor);
  assert.equal(actor.attack,aim);
  assert.equal(actor.elapsed,201);
  advance(bout,599,dodge);
  assert.equal(actor.shots.length,3);
  assert.equal(actor.phase,'recover');
  advance(bout,650,dodge);
  assert.equal(actor.phase,'BossEvent');
  bout.update(10000,player,true);
  assert.equal(actor.elapsed,0);
  settle(bout);
  assert.equal(actor.boss.event,null);
  assert.equal(bout.hitEnemy({damage:1},actor,actor.enemy,player),1);
});

test('the first two waves accumulate, preserve the mini stats and do not replace defeated members',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.aiSample=()=>0;
  for(const percent of [90,80,70]){
    cross(bout,actor);
    advance(bout,1000,player);
    if(percent===90){
      const mini=bout.enemies[1];
      assert.equal(mini.phase,'emerging');
      assert.equal(mini.enemy.hp,45);
      assert.equal(mini.spec.jumpStatus,'Poisoned');
      assert.equal(mini.spec.box(mini.enemy).width,32*0.65);
      assert.ok(Math.hypot(mini.enemy.x-player.x,mini.enemy.y-player.y)>=54);
      assert.ok(mini.enemy.x>=RING.left&&mini.enemy.x<=RING.right);
    }
    advance(bout,600,farAway);
    assert.equal(actor.boss.last,percent===80?'Toxic Bloom':'Summoning Wave');
  }
  assert.equal(bout.enemies.length,6);
  const mini=bout.enemies[1];
  bout.playerStrike('meteor',player,mini.enemy);
  assert.equal(mini.enemy.hp,0);
  cross(bout,actor);
  settle(bout);
  assert.equal(actor.boss.last,'Toxic Bloom');
  assert.equal(bout.enemies.length,6);
  assert.equal(mini.enemy.hp,0);
});

test('debug starts enter their own wave, and reset cancels protected casts and summons',()=>{
  const bout=fight();
  for(const start of [2,3]){
    bout.reset('mushroom',start);
    bout.started=true;
    const [actor]=bout.enemies;
    actor.aiSample=(()=>{const samples=[0,0.99];return ()=>samples.shift()??0;})();
    assert.equal(actor.enemy.hp,start===2?560:280);
    assert.equal(nextMark(actor),start===2?60:25);
    bout.update(1,farAway);
    assert.equal(actor.boss.event.id,start===2?'wave':'heal');
    advance(bout,(start===2?MUSHROOM_BOSS.releaseMs:PHASE_HEAL_TOTAL_MS)-1);
    assert.equal(bout.alive,1);
    bout.update(1,player);
    assert.equal(bout.enemies[1].phase,'emerging');
    assert.equal(bout.enemies[1].enemy.hp,start===2?100:260);
    bout.reset('mushroom');
    assert.equal(bout.alive,1);
    assert.equal(bout.enemies[0].boss.event,null);
    assert.equal(nextMark(bout.enemies[0]),90);
  }
  bout.started=true;
  cross(bout,bout.enemies[0]);
  bout.hurt(100,player);
  assert.equal(bout.enemies[0].boss.event,null);
  advance(bout,3000);
  assert.equal(bout.enemies.length,1);
});

test('a blocked final wave remains pending without shielding the boss after the milestone',()=>{
  const bout=fight();
  let open=false;
  bout.mushroomArena={
    bounds:RING,clear:()=>true,canSummon:()=>open,
    createSummon(owner,kind,point,spec){
      const summon=new CombatEnemy(bout,kind,bout.enemies.length,point,spec);
      bout.enemies.push(summon);
      return summon;
    },
  };
  bout.reset(['mushroom','ghost','frog','big','frost','snake'],3);
  bout.started=true;
  const [actor]=bout.enemies;
  actor.aiSample=()=>0.99;
  bout.update(1,farAway);
  settle(bout);
  assert.deepEqual(actor.boss.pendingSummons.map(summon=>summon.id),['final','snake','mini']);
  assert.equal(bout.hitEnemy({damage:1},actor,actor.enemy,player),1);
  assert.equal(bout.alive,6);
  bout.hitEnemy({damage:900},actor,actor.enemy,player);
  assert.equal(actor.boss.event.mark,25);
  actor.update(1,farAway);
  actor.update(MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs,farAway);
  assert.equal(actor.boss.event,null);
  assert.deepEqual(actor.boss.pendingSummons.map(summon=>summon.id),['final','snake','mini']);
  open=true;
  tickSummonWave(actor,farAway,MUSHROOM_BOSS.summonRetryMs);
  assert.equal(bout.enemies[6].spec.label,'Enraged Big Slime');
  tickSummonWave(actor,farAway,MUSHROOM_BOSS.summonSpacingMs-1);
  assert.equal(bout.alive,7);
  tickSummonWave(actor,farAway,1);
  tickSummonWave(actor,farAway,MUSHROOM_BOSS.summonSpacingMs);
  assert.deepEqual(bout.enemies.slice(6).map(mob=>mob.spec.label),['Enraged Big Slime','Snake','Mini Poison Slime']);
  assert.equal(actor.boss.pendingSummons.length,0);
  bout.hurt(100,farAway);
  assert.ok(bout.enemies.every(mob=>mob.summonerId===undefined));
});

test('final wave can roll two Swift Slimes and uses distinct positions in the Sandbox',()=>{
  const bout=fight();
  bout.reset('mushroom',3);
  bout.started=true;
  const [actor]=bout.enemies;
  actor.aiSample=()=>0;
  bout.update(1,farAway);
  advance(bout,PHASE_HEAL_TOTAL_MS+2*MUSHROOM_BOSS.summonSpacingMs,farAway);
  const summons=bout.enemies.slice(1);
  assert.deepEqual(summons.map(mob=>mob.spec.label),['Enraged Big Slime','Swift Slime','Swift Slime']);
  for(const [i,mob] of summons.entries())assert.ok(summons.slice(i+1).every(other=>
    Math.hypot(mob.enemy.x-other.enemy.x,mob.enemy.y-other.enemy.y)>=16*(mob.spec.size+other.spec.size)));
});

const livingWave=(bout,mark)=>bout.enemies.filter(mob=>mob.enemy.hp&&mob.summonWaveMark===mark);
const clearWave=(bout,mark)=>{
  for(const mob of livingWave(bout,mark))bout.hitEnemy({damage:mob.enemy.hp},mob,mob.enemy,farAway);
};
function advanceReinforcementClock(bout,ms){
  for(let elapsed=0;elapsed<ms;elapsed+=25){
    bout.restoreHp(100);
    bout.update(Math.min(ms-elapsed,25),farAway);
  }
}

for(const [phase,mark,count,hp] of [[1,90,3,45],[2,70,2,100]])
  test('phase '+phase+' reinforces 20 seconds after losing its whole wave, with one living group at a time',()=>{
    const bout=fight();
    bout.reset('mushroom',phase);
    bout.started=true;
    const [actor]=bout.enemies;
    actor.update(1,farAway);
    if(phase===1)cross(bout,actor);
    settle(bout);
    // Keep the player out of harm and space available while exercising the combat clock.
    actor.cooldown=1000000;
    const initial=livingWave(bout,mark);
    assert.equal(initial.length,count);
    for(const mob of initial.slice(1))bout.hitEnemy({damage:mob.enemy.hp},mob,mob.enemy,farAway);
    advanceReinforcementClock(bout,MUSHROOM_BOSS.reinforcementMs);
    assert.deepEqual(livingWave(bout,mark),initial.slice(0,1));
    for(let cycle=0;cycle<2;cycle++){
      clearWave(bout,mark);
      advanceReinforcementClock(bout,MUSHROOM_BOSS.reinforcementMs-1);
      assert.equal(livingWave(bout,mark).length,0);
      bout.update(1,farAway);
      assert.equal(livingWave(bout,mark).length,1);
      advance(bout,(count-1)*MUSHROOM_BOSS.summonSpacingMs,farAway);
      assert.equal(livingWave(bout,mark).length,count);
      assert.ok(livingWave(bout,mark).every(mob=>mob.enemy.hp===hp&&mob.reinforcement));
      assert.equal(bout.enemies.filter(mob=>mob.reinforcement).length,count);
    }
  });

test('blocked reinforcements wait in one queue and are canceled when the boss leaves the phase',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.cooldown=1000000;
  cross(bout,actor);
  settle(bout);
  assert.equal(livingWave(bout,90).length,3);
  let space=false;
  bout.mushroomArena={bounds:RING,clear:()=>true,canSummon:()=>space,
    createSummon(_owner,kind,point,spec){
      const mob=new CombatEnemy(bout,kind,bout.enemies.length,point,spec);
      bout.enemies.push(mob);
      return mob;
    }};
  clearWave(bout,90);
  advanceReinforcementClock(bout,MUSHROOM_BOSS.reinforcementMs*2);
  assert.deepEqual(actor.boss.pendingSummons.map(summon=>summon.id),['mini','mini','mini']);
  assert.equal(actor.boss.event,null);
  cross(bout,actor);
  settle(bout);
  cross(bout,actor);
  assert.equal(actor.boss.phase.name,'Proliferation');
  assert.deepEqual(actor.boss.pendingSummons,[]);
  assert.equal(actor.boss.reinforcementRemaining,null);
  space=true;
  settle(bout);
  assert.equal(livingWave(bout,90).length,0);
  assert.equal(livingWave(bout,70).length,2);
});

test('phase 2 counts only its own summons and preserves survivors from phase 1',()=>{
  const bout=fight(),[actor]=bout.enemies;
  for(const mark of [90,80,70]){
    assert.equal(nextMark(actor),mark);
    cross(bout,actor);
    settle(bout);
  }
  const survivors=livingWave(bout,90);
  assert.equal(survivors.length,3);
  clearWave(bout,70);
  advanceReinforcementClock(bout,MUSHROOM_BOSS.reinforcementMs+MUSHROOM_BOSS.summonSpacingMs);
  assert.deepEqual(livingWave(bout,90),survivors);
  assert.equal(livingWave(bout,70).length,2);
});

test('the final transition protects, heals and cleanses before any member of the final wave appears',()=>{
  const bout=fight();
  bout.reset('mushroom',3);
  bout.started=true;
  bout.playerHp=27;
  bout.renewPoison();
  bout.slows.set(0.5,5000);
  bout.stun(5000);
  const [actor]=bout.enemies;
  actor.aiSample=()=>0;
  bout.update(1,farAway);
  assert.equal(bout.protectingPhaseHeal,true);
  assert.equal(bout.hurt(35,farAway,'Poisoned'),'blocked');
  advance(bout,PHASE_HEAL_IMPACT_MS-1,farAway);
  assert.equal(bout.playerHp,27);
  assert.equal(livingWave(bout,35).length,0);
  bout.update(1,farAway);
  assert.equal(bout.playerHp,100);
  assert.equal(bout.poison,null);
  assert.equal(bout.stunMs,0);
  assert.equal(bout.slowMs,0);
  bout.renewPoison();
  bout.stun(1500);
  assert.equal(bout.poison,null);
  assert.equal(bout.stunMs,0);
  advance(bout,PHASE_HEAL_TOTAL_MS-PHASE_HEAL_IMPACT_MS-1,farAway);
  assert.equal(livingWave(bout,35).length,0);
  bout.update(1,farAway);
  assert.equal(livingWave(bout,35).length,1);
  assert.equal(bout.protectingPhaseHeal,false);
  bout.hurt(15,farAway);
  assert.equal(bout.playerHp,85);
  advance(bout,2*MUSHROOM_BOSS.summonSpacingMs,farAway);
  clearWave(bout,35);
  advance(bout,MUSHROOM_BOSS.reinforcementMs+1,farAway);
  assert.equal(livingWave(bout,35).length,0);
  assert.ok(bout.playerHp<=85);
  bout.hurt(100,farAway);
  assert.ok(bout.enemies.every(mob=>mob.summonerId===undefined));
  bout.reset('mushroom',3);
  assert.equal(bout.protectingPhaseHeal,false);
  assert.equal(bout.enemies[0].boss.event.released,false);
});

test('resetting during the heal animation never releases an old heal or summon',()=>{
  const bout=fight();
  bout.reset('mushroom',3);
  bout.started=true;
  bout.playerHp=40;
  bout.update(1,farAway);
  advance(bout,PHASE_HEAL_IMPACT_MS-1,farAway);
  assert.equal(bout.protectingPhaseHeal,true);
  bout.reset('mushroom');
  bout.started=true;
  bout.playerHp=60;
  advance(bout,PHASE_HEAL_TOTAL_MS,farAway);
  assert.equal(bout.playerHp,60);
  assert.equal(bout.protectingPhaseHeal,false);
  assert.equal(bout.enemies.length,1);
});

test('phase protection prevents damage without counting the impact as a Healing Parry block',()=>{
  const bout=new CombatBout(undefined,undefined,undefined,{allowParry:true});
  bout.reset('mushroom',3);
  bout.started=true;
  bout.playerHp=40;
  advance(bout,1,farAway);
  let parryHealing=0;
  assert.equal(bout.beginParry(SKILLS['healing-parry'].parry,({healed})=>{parryHealing+=healed;}),true);
  assert.equal(bout.hurt(25,farAway),'blocked');
  assert.equal(bout.parry.blockedDamage,0);
  advance(bout,300,farAway);
  assert.equal(bout.parry.phase,'recovery');
  assert.equal(bout.playerHp,40);
  assert.equal(parryHealing,0);
  advance(bout,PHASE_HEAL_IMPACT_MS-300,farAway);
  assert.equal(bout.playerHp,100);
  assert.equal(bout.parry,null);
});

test('Sporecap telegraphs separated positions and each mine triggers only once',()=>{
  const bout=fight();
  bout.reset('mushroom',2);
  bout.started=true;
  const [actor]=bout.enemies;
  actor.aiSample=()=>0.99;
  bout.aiRandom=()=>0.99;
  bout.update(1,farAway);
  settle(bout);
  bout.enemies.splice(1);
  bout.hitEnemy({damage:999},actor,actor.enemy,player);
  bout.update(1,player);
  const points=actor.boss.event.points;
  assert.equal(points.length,3);
  advance(bout,999,dodge);
  assert.equal(bout.areas.length,0);
  bout.update(1,dodge);
  assert.deepEqual(bout.areas.map(({x,y})=>({x,y})),points);
  for(const [i,point] of points.entries()){
    assert.ok(Math.hypot(point.x-player.x,point.y-player.y)>=60);
    assert.ok(points.slice(i+1).every(other=>Math.hypot(point.x-other.x,point.y-other.y)>=76));
  }
  const onMine={...player,...points[0]};
  bout.update(1,onMine);
  assert.equal(bout.playerHp,88);
  advance(bout,400,onMine);
  assert.equal(bout.playerHp,88);
  bout.reset('mushroom');
  advance(bout,4000);
  assert.equal(bout.poison,null);
  assert.equal(bout.areas.length,0);
});

for(const phase of [2,3])test('phase '+phase+' schedules an unshielded Sporecap that yields to HP milestones',()=>{
  const bout=new CombatBout(undefined,()=>0.1,()=>0);
  bout.reset('mushroom',phase);
  bout.started=true;
  const [actor]=bout.enemies;
  actor.cooldown=100000;
  actor.aiSample=()=>0.99;
  bout.update(1,player);
  const eventMs=MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs;
  advance(bout,eventMs,player);
  const until=actor.boss.sporecapMs;
  const [min,max]=MUSHROOM_BOSS.phases[phase-1].sporecapInterval;
  assert.ok(until>=min-eventMs-1&&until<=max);
  for(let t=0;t<until-1;t+=10)actor.update(Math.min(10,until-1-t),player);
  assert.equal(actor.boss.event,null);
  actor.update(1,player);
  assert.equal(actor.boss.event.id,'sporecap');
  assert.equal(actor.boss.event.mark,undefined);
  assert.equal(bout.hitEnemy({damage:1},actor,actor.enemy,player),1);
  const mark=nextMark(actor);
  bout.hitEnemy({damage:900},actor,actor.enemy,player);
  assert.equal(actor.boss.event.mark,mark);
  assert.equal(bout.hitEnemy({damage:1},actor,actor.enemy,player),0);
});
