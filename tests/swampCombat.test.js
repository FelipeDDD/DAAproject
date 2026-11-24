import assert from 'node:assert/strict';
import test from 'node:test';
import { readFootObstacles } from '../src/maps/footCollision.js';
import { SWAMP_AGGRO, SWAMP_MOB_TERRAIN } from '../src/swamp/mobConfig.js';
import { createCombatSpace, createMobTerrain, SwampMob } from '../src/swamp/mobMovement.js';
import { CombatBout, POISON } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { RING, boxCenter } from '../src/vfx/lab/combatGeometry.js';
import { ENEMIES } from '../src/vfx/lab/combatEnemy.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import { SLIME_SPECIAL } from '../src/vfx/lab/slimeVariants.js';

const bounds={left:0,right:1920,top:0,bottom:1920};
const player={x:200,y:160,displayHeight:64};
const wall=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
  {x:190,y:60,polygon:[{x:0,y:0},{x:4,y:0},{x:4,y:220},{x:0,y:220}]},
]}]});
const setup=(kind,{obstacles=[],playerHit=()=>{},spawn={x:140,y:160},random=()=>0.5}={})=>{
  const space=createCombatSpace(obstacles,bounds);
  const bout=new CombatBout(playerHit,random,random,{space,continuous:true});
  bout.reset([]);
  bout.started=true;
  const terrain=createMobTerrain(obstacles,bounds,SWAMP_MOB_TERRAIN[kind].footRadius);
  const enemy=new SwampMob(bout,{id:kind,kind,...spawn},terrain,0);
  bout.enemies.push(enemy);
  return {bout,enemy,runner:new CombatSkillRunner(bout)};
};
const advance=(ms,update)=>{
  for(let t=0;t<ms;t+=10)update(Math.min(10,ms-t));
};

function setupSandbox(kind,spawn){
  const bout=new CombatBout(undefined,()=>0.5,()=>0.5);
  bout.reset([kind]);
  bout.started=true;
  const [enemy]=bout.enemies;
  Object.assign(enemy.enemy,spawn);
  return {bout,enemy,runner:new CombatSkillRunner(bout)};
}

test('Homing Shot settings and actual steering match in Sandbox and Swamp',t=>{
  const settings=SLIME_SPECIAL.homing;
  const original=settings.turnRate;
  t.after(()=>{settings.turnRate=original;});
  settings.turnRate=0.5;
  const spawn={x:RING.left+58,y:300};
  const target={...player,x:spawn.x+180,y:spawn.y};
  const results=[setupSandbox('slime',spawn),setup('slime',{spawn})].map(({bout,enemy})=>{
    assert.equal(enemy.spec,ENEMIES.slime);
    assert.deepEqual(bout.ai,{randomized:false,antiKiting:true,specialMode:'variant'});
    assert.equal(bout.cloudEnabled,true);
    bout.hitEnemy({damage:1},enemy,spawn,target);
    enemy.update(10,target);
    assert.equal(enemy.attack.reason,'ranged hit');
    enemy.update(SLIME_SPECIAL.windupMs,target);
    const [shot]=enemy.shots;
    const initialAngle=shot.angle;
    advance(100,dt=>enemy.updateShot(shot,dt,{...target,y:390}));
    assert.ok(Math.abs(shot.angle-initialAngle-settings.turnRate*0.1)<1e-9);
    return shot;
  });
  assert.deepEqual(...results);
});

test('both environments use the same Venom Bite settings, hit and tactics',t=>{
  const {bite}=ENEMIES.snake;
  const original={...bite};
  t.after(()=>{Object.assign(bite,original);});
  Object.assign(bite,{cooldown:2400,damage:12});
  const spawn={x:380,y:304};
  const target={...player,x:446,y:304};
  for(const {bout,enemy} of [setupSandbox('snake',spawn),setup('snake',{spawn})]){
    assert.equal(enemy.spec,ENEMIES.snake);
    enemy.aiSample=()=>0.1;
    enemy.cooldown=0;
    enemy.update(1,target);
    assert.equal(enemy.phase,'windup');
    assert.equal(enemy.cooldown,bite.cooldown);
    enemy.update(bite.windupMs-1,target);
    assert.equal(enemy.phase,'windup');
    enemy.update(1,target);
    assert.equal(enemy.phase,'bite');
    advance(bite.lungeMs,dt=>enemy.update(dt,target));
    assert.equal(bout.playerHp,88);
    assert.equal(bout.poison.remaining,POISON.ticks);
    const moves=new Set();
    advance(7000,dt=>{
      enemy.update(dt,target);
      if(enemy.snakeManeuver)moves.add(enemy.snakeManeuver.kind);
    });
    assert.deepEqual([...moves],['retreat','flank','feint']);
  }
});

test('Life Steal reads the same mutable balance data and uses effective damage in both environments',t=>{
  const band=SKILLS.drain.bands[2];
  const original=band.heal;
  t.after(()=>{band.heal=original;});
  band.heal=7;
  const spawn={x:460,y:304};
  const caster={...player,x:350,y:304};
  for(const [targetHp,healed,remaining] of [[2,2,0],[100,7,90]]){
    for(const {bout,enemy,runner} of [setupSandbox('slime',spawn),setup('slime',{spawn})]){
      bout.playerHp=40;
      enemy.enemy.hp=targetHp;
      const popups=[];
      runner.onDrainComplete=amount=>popups.push(amount);
      assert.ok(runner.use(0,['drain'],caster,()=>boxCenter(enemy.spec.box(enemy.enemy))));
      advance(SKILLS.drain.visualMs,dt=>runner.update(dt,caster));
      assert.equal(enemy.enemy.hp,remaining);
      assert.equal(bout.playerHp,40+healed);
      assert.deepEqual(popups,[healed]);
    }
  }
});

for(const [kind,phase,damage] of [['snake','bite',15],['frog','jump',18],['slime','jump',24]]){
  test(kind+' reuses windup, native attack motion and damage at Swamp coordinates',()=>{
    const {bout,enemy}=setup(kind);
    enemy.cooldown=0;
    const phases=new Set();
    advance(1350,dt=>{
      if(bout.playerHp<100)return;
      bout.update(dt,player);
      phases.add(enemy.phase);
      assert.ok(enemy.terrain.clear(enemy.enemy));
    });
    assert.equal(phases.has('windup'),true);
    assert.equal(phases.has(phase)||enemy.phase==='recover',true);
    assert.equal(bout.playerHp,100-damage);
    if(kind==='snake')assert.equal(bout.poison.remaining,POISON.ticks);
    if(kind==='slime')assert.ok(bout.areas.some(area=>area.kind==='haze'));
  });
}

test('equipped skills preserve cooldown, melee crit, slow and Life Steal healing',()=>{
  const {bout,enemy,runner}=setup('frog',{spawn:{x:200,y:160},random:()=>0});
  const from={...player,x:164};
  const aim=()=>boxCenter(enemy.spec.box(enemy.enemy));
  bout.playerHp=52;
  assert.equal(runner.use(3,['drain','lance','lash'],from,aim),false);
  assert.equal(runner.use(0,['drain','lance','lash'],from,aim),true);
  advance(3000,dt=>runner.update(dt,from));
  assert.ok(bout.playerHp>52);
  assert.ok(enemy.enemy.hp<enemy.spec.maxHp);
  assert.equal(runner.use(0,['drain'],from,aim),false);
  assert.equal(runner.use(1,[null,'lance'],from,aim),true);
  advance(170,dt=>runner.update(dt,from));
  assert.equal(enemy.slow.percent,35);
  const hp=enemy.enemy.hp;
  // This specific target occupies the original whip tip.
  Object.assign(enemy.enemy,{x:164+SKILLS.lash.range+8,y:151,lift:0});
  assert.equal(bout.playerStrike('lash',from,{x:400,y:137})!==null,true);
  assert.equal(enemy.enemy.hp,hp-SKILLS.lash.critical);
});

test('Fireball can defeat a Slime; it stops acting and leaves its native poison field',()=>{
  const {bout,enemy,runner}=setup('slime',{spawn:{x:271,y:160}});
  const aim=()=>boxCenter(enemy.spec.box(enemy.enemy));
  enemy.cooldown=60000;
  for(let shot=0;shot<4;shot++){
    assert.ok(runner.use(0,['fireball'],player,aim));
    advance(SKILLS.fireball.cooldown,dt=>runner.update(dt,player));
  }
  assert.equal(enemy.enemy.hp,0);
  assert.equal(enemy.phase,'ended');
  assert.deepEqual(enemy.shots,[]);
  assert.ok(bout.areas.some(area=>area.kind==='poison'));
  advance(enemy.deathMs,dt=>bout.update(dt,player));
  assert.equal(enemy.elapsed,enemy.deathMs);
  assert.equal(bout.finished,false);
});

test('Swamp walls intercept missiles, melee, lunges, landing splash and poison fields',()=>{
  const {bout,enemy,runner}=setup('slime',{obstacles:wall,spawn:{x:210,y:160}});
  const left={...player,x:170};
  const aim=()=>boxCenter(enemy.spec.box(enemy.enemy));
  assert.equal(bout.playerStrike('cleaver',left,aim()),null);
  assert.equal(bout.playerStrike('meteor',left,{x:188,y:160}),null);
  assert.ok(runner.use(0,['fireball'],left,aim));
  advance(300,dt=>runner.update(dt,left));
  assert.equal(enemy.enemy.hp,100);
  // A shot already in flight must still stop when the player ducks behind the wall.
  enemy.launchShot({x:210,y:136},{x:170,y:136},enemy.spec.shot);
  assert.equal(enemy.shots.length,1);
  advance(250,dt=>bout.update(dt,left));
  assert.equal(enemy.shots.length,0);
  assert.equal(bout.playerHp,100);
  enemy.groundImpact('jump',32,24,left);
  assert.equal(bout.playerHp,100);
  bout.addArea('poison',enemy.id,enemy.enemy);
  advance(1500,dt=>bout.update(dt,{...left,x:178}));
  assert.equal(bout.poison,null);
  for(const kind of ['snake','frog','slime']){
    const {enemy:mob}=setup(kind,{obstacles:wall});
    const landing=mob.planLanding({x:215,y:160});
    assert.ok(mob.terrain.clear(landing));
    assert.ok(landing.x<=190-mob.footRadius+1e-6);
  }
});

test('Slime labels the normal shot, ranged hit and true re-aggro without changing the windup',()=>{
  const start={x:300,y:300};
  const target={...player,x:485,y:300};
  const {bout:fresh,enemy:first}=setup('slime',{spawn:start});
  fresh.ai.antiKiting=true;
  advance(1200,dt=>first.update(dt,target));
  assert.equal(first.aggro.reengaged,undefined);
  assert.notEqual(first.attack?.kind,'homing');
  assert.equal(first.lastShot,undefined);
  for(const reason of ['normal','ranged hit','re-aggro']){
    const {bout,enemy}=setup('slime',{spawn:start});
    bout.ai.antiKiting=true;
    enemy.cooldown=0;
    if(reason==='normal')enemy.nextAttack='poison';
    if(reason==='ranged hit')bout.hitEnemy({damage:1},enemy,start,target);
    if(reason==='re-aggro'){
      const distant={...target,x:1000};
      enemy.navigation.track(enemy,target,185,1);
      enemy.navigation.track(enemy,distant,700,SWAMP_AGGRO.releaseAfterMs-1);
      assert.equal(enemy.aggro.reengaged,undefined);
      enemy.navigation.track(enemy,distant,700,1);
      assert.equal(enemy.aggro,null);
    }
    enemy.update(1,target);
    assert.equal(enemy.attack.kind,reason==='normal'?'poison':'homing');
    if(reason!=='re-aggro')assert.equal(enemy.aggro.reengaged,undefined);
    else assert.equal(enemy.navigation.counterMs,SWAMP_AGGRO.counterCooldownMs);
    const windup=reason==='normal'?enemy.spec.shotWindup:SLIME_SPECIAL.windupMs;
    enemy.update(windup-1,target);
    assert.equal(enemy.lastShot,undefined);
    enemy.update(1,target);
    assert.equal(enemy.shots.length,1);
    assert.deepEqual(enemy.lastShot,{kind:reason==='normal'?'Poison Shot':'Homing Shot',reason});
    if(reason!=='normal'){
      for(const [key,value] of Object.entries(SLIME_SPECIAL.homing))assert.equal(enemy.shots[0][key],value);
      assert.equal(enemy.specialMs,SLIME_SPECIAL.cooldown-windup);
    }
  }
});

test('Swamp Homing Shot steers early, permits a sidestep at player speed and catches straight retreats',()=>{
  for(const dodge of [false,true]){
    const {bout,enemy}=setup('slime',{spawn:{x:300,y:300}});
    const target={...player,x:480,y:300};
    bout.ai.antiKiting=true;
    bout.hitEnemy({damage:1},enemy,enemy.enemy,target);
    enemy.update(1,target);
    target.x=445;
    enemy.update(SLIME_SPECIAL.windupMs,target);
    const [shot]=enemy.shots;
    const heading=shot.angle;
    let inFlight=true,earlyAngle,lateAngle;
    advance(1700,dt=>{
      if(!inFlight)return;
      if(dodge)target.y+=128*dt/1000;
      else target.x+=128*dt/1000;
      inFlight=enemy.updateShot(shot,dt,target);
      if(shot.elapsed===440)earlyAngle=shot.angle;
      if(shot.elapsed===840)lateAngle=shot.angle;
    });
    assert.equal(bout.playerHp,dodge?100:84);
    assert.equal(inFlight,false);
    if(dodge){
      assert.ok(earlyAngle-heading>0.1);
      assert.ok(lateAngle-earlyAngle<=0.18*0.4+1e-9);
      assert.ok(shot.turnSpent<=SLIME_SPECIAL.homing.maxTurn+1e-9);
    }
  }
});

test('Snake alternates real bites with capped maneuvers and skips fake attacks in a tight corridor',()=>{
  const corridor=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
    {x:0,y:0,width:1920,height:139},
    {x:0,y:181,width:1920,height:1739},
  ]}]});
  for(const obstacles of [[],corridor]){
    const {bout,enemy}=setup('snake',{obstacles});
    enemy.aiSample=()=>0.1;
    enemy.cooldown=0;
    const moves=new Set(),bites=[];
    let time=0;
    advance(10500,dt=>{
      const {x,y}=enemy.enemy;
      const phase=enemy.phase,hp=bout.playerHp;
      time+=dt;
      enemy.update(dt,player);
      if(enemy.phase==='windup'&&phase!=='windup')bites.push(time);
      if(enemy.snakeManeuver)moves.add(enemy.snakeManeuver.kind);
      if(phase!=='bite'){
        assert.equal(bout.playerHp,hp);
        assert.ok(Math.hypot(enemy.enemy.x-x,enemy.enemy.y-y)<=enemy.spec.speed*dt/1000+1e-6);
      }
      assert.ok(enemy.terrain.clear(enemy.enemy));
    });
    assert.ok(bites.length>=2);
    assert.ok(bites.slice(1).every((time,i)=>time-bites[i]>=ENEMIES.snake.bite.cooldown));
    assert.ok(moves.has('retreat'));
    assert.equal(moves.has('feint'),!obstacles.length);
    assert.equal(moves.has('flank'),!obstacles.length);
    assert.ok(bout.playerHp<100);
  }
});

test('Life Steal caps healing by actual damage with one popup and no duplicate hits or orbs',()=>{
  for(const [remaining,healed] of [[2,2],[100,10]]){
    const {bout,enemy}=setup('slime',{spawn:{x:310,y:160}});
    const behind=new SwampMob(bout,{id:'behind',kind:'slime',x:350,y:160},enemy.terrain,1);
    bout.enemies.push(behind);
    enemy.enemy.hp=remaining;
    bout.playerHp=40;
    const popups=[];
    const runner=new CombatSkillRunner(bout,hp=>popups.push(hp));
    const aim=()=>boxCenter(behind.spec.box(behind.enemy));
    assert.ok(runner.use(0,['drain'],player,aim));
    const [action]=runner.actions;
    advance(SKILLS.drain.cast,dt=>runner.update(dt,player));
    runner.release(action,player);
    advance(SKILLS.drain.visualMs,dt=>runner.update(dt,player));
    assert.equal(enemy.enemy.hp,remaining-healed);
    assert.equal(behind.enemy.hp,behind.spec.maxHp,'only the closest target is struck once');
    assert.equal(bout.playerHp,40+healed);
    assert.deepEqual(popups,[healed]);
    assert.equal(action.returnedOrbs,4);
  }
});
