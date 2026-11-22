import assert from 'node:assert/strict';
import test from 'node:test';
import {CombatBout} from '../src/vfx/lab/CombatBout.js';
import {SLIME_SPECIAL} from '../src/vfx/lab/slimeVariants.js';
import {boxCenter,playerBox,groundPoint} from '../src/vfx/lab/combatGeometry.js';

const near={x:450,y:304,displayHeight:64};
const far={...near,x:280};
const outside={...far,y:150};

function encounter(kinds=['slime'],seed=0.42){
  const bout=new CombatBout(undefined,undefined,()=>seed);
  bout.reset(kinds);
  bout.ai={randomized:false,antiKiting:true,specialMode:'variant'};
  bout.started=true;
  for(const actor of bout.enemies){
    Object.assign(actor.enemy,{x:520,y:304});
    actor.cooldown=10000;
  }
  return bout;
}
function advance(bout,ms,player){
  for(let t=0;t<ms;t+=10)bout.update(Math.min(10,ms-t),player);
}
function until(bout,player,ready){
  for(let t=0;t<3000&&!ready();t+=10)bout.update(10,player);
  assert.ok(ready(),'expected combat transition within 3 s');
}
function charge(bout,actor=bout.enemies[0],player=far){
  until(bout,player,()=>actor.attack?.windup===SLIME_SPECIAL.windupMs);
}

test('Slimes sample independent bounded attack cooldowns while the telegraph keeps its original clock',()=>{
  const kinds=['slime','slime','frost','big','swift','ghost'];
  const bout=encounter(kinds);
  bout.ai.randomized=true;
  const [first,second,,,swift,ghost]=bout.enemies;
  const reference=encounter(kinds);
  reference.ai.randomized=true;
  for(let n=0;n<40;n++){
    first.attackInterval(1800);
    const ms=second.attackInterval(1800);
    assert.equal(ms,reference.enemies[1].attackInterval(1800));
    assert.ok(ms>=1440&&ms<=2160);
  }
  assert.notEqual(first.attackInterval(1800),second.attackInterval(1800));
  assert.equal(ghost.attackInterval(1800),1800);
  swift.cooldown=0;
  swift.update(1,near);
  assert.equal(swift.attack.kind,'jump');
  swift.update(399,near);assert.equal(swift.phase,'windup');
  swift.update(1,near);assert.equal(swift.phase,'jump');
  bout.ai.randomized=false;
  assert.equal(first.attackInterval(1800),1800);
});

test('fast retreat beyond 285 is remembered through pursuit, and leaving cast range cannot cancel release',()=>{
  const bout=encounter(),[actor]=bout.enemies;
  const corner={...near,x:273,y:425};
  Object.assign(actor.enemy,{x:536,y:151});
  const close={...near,x:500,y:165};
  advance(bout,500,corner);
  assert.equal(actor.aggro,null);
  bout.update(10,close);
  assert.ok(actor.aggro);
  advance(bout,449,corner);
  assert.equal(actor.attack,null);
  assert.ok(actor.enemy.x<536&&actor.enemy.y>151);
  charge(bout,actor,corner);
  advance(bout,SLIME_SPECIAL.windupMs-1,corner);
  assert.equal(actor.shots.length,0);
  const beyondCast={...corner,x:0};
  bout.update(1,beyondCast);
  assert.equal(actor.shots.length,1);
  assert.equal(actor.phase,'recoil');
  const start=actor.enemy.x;
  advance(bout,150,corner);
  assert.ok(actor.enemy.x>start);
  assert.deepEqual(groundPoint(actor.enemy),{x:actor.enemy.x,y:actor.enemy.y});
  advance(bout,150,corner);
  assert.equal(actor.phase,'recover');
});

test('ranged damage acquires aggro outside detection and queues only one counter while closing to cast range',()=>{
  const bout=encounter(),[actor]=bout.enemies;
  Object.assign(actor.enemy,{x:540,y:150});
  const corner={...near,x:273,y:426};
  const hit=()=>bout.hitEnemy({damage:1},actor,actor.enemy,corner);
  hit();
  const aggro=actor.aggro;
  assert.ok(aggro.pending);
  bout.update(10,corner);
  assert.equal(actor.phase,'chase');
  advance(bout,150,corner);
  hit();
  assert.equal(actor.aggro,aggro);
  charge(bout,actor,corner);
  hit();
  assert.equal(aggro.pending,false);
  const from={...actor.enemy};
  advance(bout,SLIME_SPECIAL.windupMs,corner);
  assert.equal(actor.shots.length,1);
  assert.equal(actor.phase,'recoil');
  hit();
  advance(bout,SLIME_SPECIAL.recoilMs,corner);
  assert.ok(actor.enemy.x>=from.x&&actor.enemy.y<=from.y);
  assert.deepEqual(groundPoint(actor.enemy),{x:actor.enemy.x,y:actor.enemy.y});
  assert.equal(actor.phase,'recover');
  advance(bout,2000,corner);
  assert.equal(aggro.pending,false);
  assert.equal(aggro.closest,null);
});

test('a brief leash excursion preserves pursuit; sustained separation drops the target',()=>{
  const bout=encounter(),[actor]=bout.enemies;
  const distant={...far,x:-1000};
  bout.update(10,near);
  advance(bout,actor.spec.leashGraceMs-1,distant);
  assert.ok(actor.aggro);
  bout.update(1,far);
  assert.equal(actor.aggro.outsideMs,0);
  advance(bout,actor.spec.leashGraceMs,distant);
  assert.equal(actor.aggro,null);
  advance(bout,1200,distant);
  assert.equal(actor.phase,'idle');
  bout.update(10,{...near,x:actor.enemy.x,y:actor.enemy.y});
  assert.ok(actor.aggro);
});

test('Homing Shot has bounded steering and expires even if the player dodges',()=>{
  const bout=encounter(['swift']),[actor]=bout.enemies;
  bout.update(10,near);
  charge(bout);advance(bout,SLIME_SPECIAL.windupMs,far);
  const [shot]=actor.shots;
  assert.ok(shot);
  const heading=shot.angle;
  advance(bout,600,far);
  advance(bout,100,outside);
  assert.ok(Math.abs(shot.angle-heading)>0);
  assert.ok(Math.abs(shot.angle-heading)<=SLIME_SPECIAL.homing.turnRate*0.1+1e-9);
  advance(bout,SLIME_SPECIAL.homing.lifetime,outside);
  assert.equal(actor.shots.length,0);
  assert.equal(bout.playerHp,100);
});

test('Spread Volley snapshots the aim at release, keeps three straight paths and can miss',()=>{
  const bout=encounter(['slime']),[actor]=bout.enemies;
  bout.ai.specialMode='spread';
  bout.update(10,near);
  charge(bout);
  const shifted={...far,y:325};
  advance(bout,SLIME_SPECIAL.windupMs,shifted);
  assert.equal(actor.shots.length,3);
  const [left,center,right]=actor.shots,target=boxCenter(playerBox(shifted));
  assert.equal(center.angle,Math.atan2(target.y-center.y,target.x-center.x));
  assert.ok(Math.abs((right.angle-center.angle)-SLIME_SPECIAL.spread.angle)<1e-9);
  assert.ok(Math.abs((center.angle-left.angle)-SLIME_SPECIAL.spread.angle)<1e-9);
  const angles=actor.shots.map(shot=>shot.angle);
  advance(bout,150,outside);
  assert.deepEqual(actor.shots.map(shot=>shot.angle),angles);
  advance(bout,1500,outside);
  assert.equal(actor.shots.length,0);
  assert.equal(bout.playerHp,100);
});

test('a spread volley only damages once when all three projectiles touch the same body',()=>{
  const bout=encounter(['frost']),[actor]=bout.enemies;
  bout.update(10,near);
  charge(bout);advance(bout,SLIME_SPECIAL.windupMs,far);
  assert.equal(actor.shots.length,3);
  actor.contactMs=1000;
  bout.update(10,{...near,x:actor.enemy.x});
  assert.equal(actor.shots.length,0);
  assert.equal(bout.playerHp,100-actor.spec.special.damage);
});

test('six mixed enemies stagger specials, pause their clocks and clean up on death or reset',()=>{
  const bout=encounter(['slime','frost','big','swift','slime','ghost']);
  bout.update(10,near);
  const [first,second]=bout.enemies;
  charge(bout,first);
  assert.equal(first.attack.kind,'homing');
  assert.equal(second.attack,null);
  advance(bout,SLIME_SPECIAL.windupMs,far);
  assert.equal(first.shots.length,1);
  assert.ok(first.specialMs>0&&second.specialMs===0);
  const clocks=[first.specialMs,bout.specialGraceMs,first.shots[0].elapsed];
  bout.update(200,far,true);
  assert.deepEqual([first.specialMs,bout.specialGraceMs,first.shots[0].elapsed],clocks);
  charge(bout,second);
  assert.equal(second.attack.kind,'spread');
  bout.hitEnemy({damage:100},first,first.enemy);
  assert.equal(first.shots.length,0);
  bout.hurt(100,near);
  assert.ok(bout.enemies.every(actor=>actor.shots.length===0&&actor.attack===null));
  bout.reset(['slime','frost','big','swift','slime','ghost']);
  assert.equal(bout.specialGraceMs,0);
  assert.ok(bout.enemies.every(actor=>actor.specialMs===0&&!actor.aggro));
});

test('switching anti-kiting off during a charge prevents its launch',()=>{
  const bout=encounter(['big']),[actor]=bout.enemies;
  bout.update(10,near);
  charge(bout);
  assert.equal(actor.attack.kind,'spread');
  bout.ai.antiKiting=false;
  advance(bout,430,far);
  assert.equal(actor.shots.length,0);
  assert.equal(actor.attack,null);
});

test('both specials use the fixed charge, variant damage and travel speed; a blocked recoil ends safely',()=>{
  for(const [kind,damage,speed,count] of [['slime',16,220,1],['frost',16,260,3],['big',20,260,3],['swift',12,220,1]]){
    const bout=encounter([kind]),[actor]=bout.enemies;
    Object.assign(actor.enemy,{x:540,y:304});
    bout.hitEnemy({damage:1},actor,actor.enemy,far);
    charge(bout);
    advance(bout,549,far);
    assert.equal(actor.shots.length,0);
    bout.update(1,far);
    assert.equal(actor.shots.length,count);
    assert.ok(actor.shots.every(s=>s.damage===damage&&s.speed===speed));
    assert.equal(actor.phase,'recover');
    assert.equal(actor.enemy.x,540);
    advance(bout,1200,far);
    assert.ok(actor.enemy.x<540);
  }
});

test('death and Reset discard pursuit, queued attacks, charge and recoil',()=>{
  for(const stage of ['pending','windup','recoil']){
    for(const end of ['enemy death','player death','reset']){
      const bout=encounter(),[actor]=bout.enemies;
      bout.hitEnemy({damage:1},actor,actor.enemy,far);
      if(stage!=='pending')charge(bout);
      if(stage==='recoil')advance(bout,SLIME_SPECIAL.windupMs,far);
      if(stage==='pending')assert.ok(actor.aggro.pending);
      else assert.equal(actor.phase,stage);
      if(end==='enemy death')bout.hitEnemy({damage:100},actor,actor.enemy,far);
      if(end==='player death')bout.hurt(100,far);
      if(end==='reset')bout.reset();
      const [current]=bout.enemies;
      advance(bout,900,far);
      assert.equal(current.aggro,null);
      assert.equal(current.attack,null);
      assert.equal(current.hop,null);
      assert.equal(current.shots.length,0);
    }
  }
});
