import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CombatBout,POISON } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { RING,boxCenter } from '../src/vfx/lab/combatGeometry.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import sheets from '../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};

const near={x:410,y:304,displayHeight:64};
const far={...near,x:280,y:148};

function fight(...kinds){
  const bout=new CombatBout();
  bout.reset(kinds);
  bout.started=true;
  return bout;
}

function advance(bout,time,player=near){
  for(let elapsed=0;elapsed<time;elapsed+=10)bout.update(Math.min(10,time-elapsed),player);
}

test('the two exported PixelFX atlases have complete 20 FPS loops and valid ground anchors',()=>{
  for(const [kind,count] of [['snake',48],['frog',52]]){
    const {width,height,anchor,frameMs}=sheets['pfx-'+kind];
    const png=readFileSync(new URL('../tools/vfx-lab/sheets/pfx-'+kind+'.png',import.meta.url));
    assert.equal(png.readUInt32BE(16),width*8);
    assert.equal(png.readUInt32BE(20),height*Math.ceil(count/8));
    assert.ok(anchor[0]>0&&anchor[0]<width&&anchor[1]>0&&anchor[1]<height);
    assert.deepEqual(frameMs,Array(count).fill(50));
  }
});

test('approaching or dealing damage acquires aggro; Snake crawls and Frog follows in short hops',()=>{
  for(const kind of ['snake','frog']){
    const bout=fight(kind),[actor]=bout.enemies;
    actor.aiSample=()=>0.5;
    const spawn={...actor.enemy};
    advance(bout,520,far);
    assert.equal(actor.aggro,null);
    assert.equal(actor.enemy.x,spawn.x);
    if(kind==='snake')bout.hitEnemy({damage:1},actor,actor.enemy,far);
    advance(bout,180,kind==='snake'?far:{...near,x:328});
    assert.ok(actor.aggro);
    assert.ok(actor.enemy.x<spawn.x);
    assert.equal(actor.enemy.facing,-1);
    assert.equal(actor.enemy.lift>0,kind==='frog');
    const box=actor.spec.box(actor.enemy);
    if(kind==='snake')assert.ok(box.width>box.height*4);
    else assert.ok(box.y<actor.enemy.y-actor.enemy.lift);
    advance(bout,100,{...far,x:-500});
    assert.ok(actor.aggro);
    advance(bout,actor.spec.leashGraceMs,{...far,x:-500});
    assert.equal(actor.aggro,null);
    assert.ok(actor.enemy.x>=RING.left&&actor.enemy.y>=RING.top);
  }
  const frogBout=fight('frog');
  const [frog]=frogBout.enemies;
  const fireball=new CombatSkillRunner(frogBout);
  // A player can move between launching the projectile and its impact.
  fireball.use(0,['fireball'],near,()=>boxCenter(frog.spec.box(frog.enemy)));
  fireball.update(300,far);
  assert.equal(frog.enemy.hp,90-SKILLS.fireball.damage);
  assert.ok(frog.aggro);
});

test('Venom Bite locks its target, sweeps the head once and reuses Poisoned',()=>{
  for(const dodge of [false,true]){
    const bout=fight('snake'),[actor]=bout.enemies;
    actor.cooldown=0;
    bout.update(1,near);
    assert.equal(actor.attack.kind,'bite');
    const {windupMs,lungeMs,damage}=actor.spec.bite;
    advance(bout,windupMs-1);
    assert.equal(bout.playerHp,100);
    assert.ok(actor.enemy.stretchX<0.8);
    bout.update(1,near);
    assert.equal(actor.phase,'bite');
    advance(bout,lungeMs,dodge?{...near,y:350}:near);
    assert.equal(actor.phase,'recover');
    assert.equal(bout.playerHp,dodge?100:100-damage);
    assert.equal(bout.poison?.remaining,dodge?undefined:POISON.ticks);
  }
});

test('Snake alternates diagonals toward a vertical target and turns inward from both edges',()=>{
  for(const direction of [-1,1]){
    const bout=fight('snake'),[actor]=bout.enemies;
    const target={...near,x:416,y:288+direction*124};
    Object.assign(actor.enemy,{x:416,y:288});
    actor.cooldown=10000;
    actor.aiSample=()=>0.5;
    advance(bout,350,target);
    assert.equal(actor.enemy.facing,1);
    assert.ok(actor.enemy.x>425);
    advance(bout,400,target);
    assert.equal(actor.enemy.facing,-1);
    assert.ok((actor.enemy.y-288)*direction>40);
  }
  for(const [x,side] of [[RING.left+39,1],[RING.right-39,-1]]){
    const bout=fight('snake'),[actor]=bout.enemies;
    Object.assign(actor.enemy,{x,y:300});
    actor.aggro={outsideMs:0,diagonal:{side,remaining:0}};
    advance(bout,50,{...near,x,y:150});
    assert.equal(actor.enemy.facing,side);
    assert.ok((actor.enemy.x-x)*side>0);
  }
});

test('Frog marks a fixed landing, rises with the native leap, and hits feet only on landing',()=>{
  for(const dodge of [false,true]){
    const bout=fight('frog'),[actor]=bout.enemies;
    actor.cooldown=0;
    bout.update(1,near);
    assert.equal(actor.attack.kind,'frog-leap');
    const target={...actor.attack.to};
    const {windupMs,flightMs,damage}=actor.spec.leap;
    const player=dodge?{...near,y:355}:near;
    advance(bout,windupMs+Math.floor(flightMs/2),player);
    assert.equal(actor.phase,'jump');
    assert.ok(actor.enemy.lift>20);
    assert.equal(bout.playerHp,100);
    advance(bout,Math.ceil(flightMs/2),player);
    assert.equal(actor.phase,'recover');
    assert.equal(actor.enemy.lift,0);
    assert.deepEqual([actor.land.x,actor.land.y],[target.x,target.y]);
    assert.equal(bout.playerHp,dodge?100:100-damage);
  }
});

test('mixed encounters keep independent enemies and clear paused attacks on defeat, death and Reset',()=>{
  const kinds=['snake','frog','slime','ghost','snake','frog'];
  const bout=fight(...kinds);
  const [snake,frog]=bout.enemies;
  Object.assign(snake.enemy,{x:470,y:304});
  Object.assign(frog.enemy,{x:466,y:304});
  snake.cooldown=frog.cooldown=0;
  bout.update(1,near);
  advance(bout,frog.spec.leap.windupMs);
  const positions=bout.enemies.map(actor=>[actor.enemy.x,actor.enemy.y,actor.elapsed]);
  bout.update(1000,near,true);
  assert.deepEqual(bout.enemies.map(actor=>[actor.enemy.x,actor.enemy.y,actor.elapsed]),positions);
  bout.playerStrike('meteor',near,{x:467,y:304});
  assert.deepEqual([snake.enemy.hp,frog.enemy.hp],[80-SKILLS.meteor.damage,90-SKILLS.meteor.damage]);
  bout.hitEnemy({damage:100},frog,frog.enemy,near);
  assert.equal(frog.phase,'ended');
  assert.equal(frog.hop,null);
  bout.hurt(100,near);
  assert.ok(bout.enemies.every(actor=>!actor.attack&&!actor.hop&&!actor.aggro));
  bout.reset(kinds);
  assert.deepEqual(bout.enemies.map(actor=>actor.enemy.hp),[80,90,100,100,80,90]);
  assert.throws(()=>bout.reset(['frog','frog','frog','frog']),RangeError);
});

test('Long Leap rolls once per opportunity, locks its landing and keeps an independent cooldown',()=>{
  for(const dodge of [false,true]){
    const bout=fight('frog','frog'),[frog,other]=bout.enemies;
    frog.enemy.x=other.enemy.x=488;
    frog.cooldown=other.cooldown=0;
    const target={...near,x:296};
    let rolls=0;
    frog.aiSample=()=>{rolls++;return 0.39;};
    other.aiSample=()=>0.40;
    advance(bout,10,target);
    assert.equal(frog.attack.kind,'frog-long-leap');
    assert.equal(other.phase,'chase');
    assert.ok(other.longLeapMs<frog.longLeapMs);
    assert.deepEqual(frog.attack.to,{x:296,y:304});
    advance(bout,499,target);
    assert.equal(frog.phase,'windup');
    assert.equal(bout.playerHp,100);
    bout.update(1,target);
    advance(bout,560,dodge?{...target,y:355}:target);
    assert.equal(frog.land.kind,'frog-long-leap');
    assert.equal(bout.playerHp,dodge?100:82);
    assert.equal(rolls,1);
    assert.ok(frog.longLeapMs>5000);
    bout.hitEnemy({damage:100},frog,frog.enemy,target);
    assert.equal(frog.land,null);
    bout.reset(['frog','frog']);
    assert.ok(bout.enemies.every(actor=>!actor.longLeapMs&&!actor.attack));
  }
});

test('Frog still chooses the normal slam at its new 118 px boundary',()=>{
  const bout=fight('frog'),[frog]=bout.enemies;
  frog.cooldown=0;
  frog.aiSample=()=>assert.fail('short-range slam should not roll Long Leap');
  bout.update(1,{...near,x:358});
  assert.equal(frog.attack.kind,'frog-leap');
});
