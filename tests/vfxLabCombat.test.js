import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {CombatBout,SLOW_MS} from '../src/vfx/lab/CombatBout.js';
import {RING,slimeBox,playerBox,segmentContact} from '../src/vfx/lab/combatGeometry.js';
import {VFX_LAB_MAP} from '../src/vfx/lab/layout.js';
import {LASH,handOf} from '../src/vfx/lab/precisionDemo.js';
import {ENEMIES} from '../src/vfx/lab/combatEnemy.js';

import {AREAS} from '../src/vfx/lab/combatAreas.js';

const first=bout=>bout.enemies[0];
const haze=bout=>bout.areas.find(a=>a.kind==='haze')??null;
const advance=(bout,ms,player,paused=false)=>{
  for(let elapsed=0;elapsed<ms;elapsed+=10)bout.update(Math.min(10,ms-elapsed),player,paused);
};
const playerAt=(x,y=304)=>({x,y,displayHeight:64});

test('the combat ring and both spawn points fit the clear central lane',()=>{
  const map=JSON.parse(readFileSync(new URL('../public/assets/maps/'+VFX_LAB_MAP,import.meta.url)));
  for(const o of map.layers.find(l=>l.name==='Collision').objects){
    assert.ok(o.x+o.width<=RING.left||o.x>=RING.right||o.y+o.height<=RING.top||o.y>=RING.bottom);
  }
  for(const p of [playerAt(320),first(new CombatBout()).enemy]){
    assert.ok(p.x>RING.left&&p.x<RING.right&&p.y>RING.top&&p.y<RING.bottom);
  }
});

test('slime stays dormant outside aggro and moves during the native airborne frames',()=>{
  const bout=new CombatBout();
  const start=first(bout).enemy.x;
  bout.started=true;
  advance(bout,800,playerAt(280,151));
  assert.equal(first(bout).enemy.x,start);
  const player=playerAt(320);
  advance(bout,340,player);
  assert.equal(first(bout).phase,'chase');
  assert.ok(first(bout).enemy.x<start&&first(bout).enemy.lift>0&&first(bout).enemy.poseMs>900);
  const sample={...first(bout).enemy};
  advance(bout,1000,player,true);
  assert.deepEqual(first(bout).enemy,sample);
});

test('jump warns at a fixed destination, then registers one landing hit or can be dodged',()=>{
  for(const dodge of [false,true]){
    const hits=[],bout=new CombatBout((...args)=>hits.push(args)),player=playerAt(395);
    bout.started=true;
    advance(bout,430,player);
    assert.equal(first(bout).phase,'windup');
    const destination={...first(bout).attack.to};
    assert.equal(bout.playerHp,100);
    if(dodge)player.y+=70;
    advance(bout,750,player);
    assert.equal(first(bout).phase,'jump');
    assert.deepEqual(first(bout).attack.to,destination);
    assert.equal(bout.playerHp,100);
    advance(bout,450,player);
    assert.equal(bout.playerHp,dodge?100:76);
    assert.equal(hits.length,dodge?0:1);
  }
});

test('Poison Shot uses the body and a swept path, applying Poisoned only on contact',()=>{
  for(const dodge of [true,false]){
    const hits=[],bout=new CombatBout((...args)=>hits.push(args)),player=playerAt(378);
    bout.started=true;first(bout).nextAttack='poison';first(bout).cooldown=0;
    advance(bout,10,player);
    assert.equal(first(bout).attack.kind,'poison');
    if(dodge)player.y+=60;
    advance(bout,560,player);
    assert.equal(first(bout).shots.length,1);
    advance(bout,800,player);
    assert.equal(bout.playerHp,dodge?100:84);
    assert.equal(hits.length,dodge?0:1);
    if(!dodge)assert.deepEqual(hits[0][3],{status:'Poisoned'});
  }
  const box=playerBox(playerAt(370));
  assert.ok(segmentContact({x:300,y:280},{x:430,y:280},box));
  assert.equal(segmentContact({x:300,y:310},{x:430,y:310},box),null);
});

test('Cleave respects reach, Lash hits only at its tip, and a drain miss cannot start healing',()=>{
  const hits=[],bout=new CombatBout((...args)=>hits.push(args),()=>0.1);
  bout.started=true;bout.playerHp=96;
  const y=first(bout).enemy.y-12,player=playerAt(first(bout).enemy.x-LASH.reach,y+64*0.34);
  const aim={x:first(bout).enemy.x,y:handOf(player).y};
  assert.equal(bout.playerStrike('cleaver',player,aim),null);
  assert.ok(bout.playerStrike('lash',player,aim));
  assert.equal(first(bout).enemy.hp,70);
  assert.equal(hits[0][3].critical,true);
  player.x=first(bout).enemy.x-35;
  assert.equal(bout.playerStrike('lash',player,aim),null);
  assert.ok(bout.playerStrike('cleaver',player,aim));
  assert.equal(bout.playerStrike('drain',player,{x:aim.x,y:y-95}),null);
  assert.equal(bout.playerHp,96);
  assert.ok(bout.playerStrike('drain',player,aim));
  assert.equal(bout.playerHp,96);
  assert.equal(first(bout).enemy.hp,26);
  assert.equal(slimeBox(first(bout).enemy).y+24,first(bout).enemy.y-first(bout).enemy.lift);
});

test('Copper Lash rolls once per actual hit with the same tip for near and distant cursor positions',()=>{
  let rolls=0;
  const random=()=>[0.49,0.50][rolls++];
  const bout=new CombatBout(undefined,random),player=playerAt(340);
  bout.reset(['slime','frost','swift']);
  bout.started=true;
  const hand=handOf(player);
  for(const [i,actor] of bout.enemies.entries()){
    Object.assign(actor.enemy,{x:hand.x+LASH.reach,y:hand.y+12+(i===2?55:0)});
  }
  const far={x:hand.x+200,y:hand.y},near={x:hand.x+4,y:hand.y};
  bout.playerStrike('lash',player,{x:hand.x-200,y:hand.y});
  assert.equal(rolls,0);
  bout.playerStrike('lash',player,near);
  assert.equal(rolls,2);
  assert.deepEqual(bout.enemies.map(actor=>actor.enemy.hp),[70,90,60]);
  rolls=0;
  bout.playerStrike('lash',player,far);
  assert.equal(rolls,2);
  assert.deepEqual(bout.enemies.map(actor=>actor.enemy.hp),[40,80,60]);
});

test('touch damage uses each Slime body, with a one-second cooldown and no simultaneous contact burst',()=>{
  for(const kind of ['slime','frost','big','swift']){
    const bout=new CombatBout();
    bout.reset(kind);bout.started=true;
    const actor=first(bout),player=playerAt(actor.enemy.x);
    actor.cooldown=10000;
    bout.update(10,{...player,x:player.x+45});
    assert.equal(bout.playerHp,100);
    bout.update(10,player);
    assert.equal(bout.playerHp,100-actor.spec.contactDamage);
    advance(bout,990,player);
    assert.equal(bout.playerHp,100-actor.spec.contactDamage);
    bout.update(10,player);
    assert.equal(bout.playerHp,100-2*actor.spec.contactDamage);
    actor.enemy.hp=0;advance(bout,1100,player);
    assert.equal(bout.playerHp,100-2*actor.spec.contactDamage);
  }
  const bout=new CombatBout();bout.reset(['slime','big']);bout.started=true;
  const [a,b]=bout.enemies;
  Object.assign(b.enemy,{x:a.enemy.x,y:a.enemy.y});
  bout.update(10,playerAt(a.enemy.x,a.enemy.y));
  assert.equal(bout.playerHp,94);
});

test('Frost slow lasts 2.3 s, combines with stronger ground ice and restores the Ghost slow when appropriate',()=>{
  const bout=new CombatBout(),player=playerAt(275,145);
  bout.started=true;
  const {speed,ms}=ENEMIES.frost.shot.slow;
  bout.hurt(1,player,'Slowed',ms,speed);
  assert.equal(bout.speedFactor,0.5);
  bout.addArea('ice',0,player);
  bout.update(10,player);
  assert.equal(bout.speedFactor,0.45);
  const outside=playerAt(560,432);
  advance(bout,1990,outside);
  assert.equal(bout.speedFactor,0.5);
  bout.hurt(1,player,'Slowed');
  advance(bout,299,outside);
  assert.equal(bout.speedFactor,0.5);
  bout.update(1,outside);
  assert.equal(bout.speedFactor,0.72);
  bout.reset();
  assert.equal(bout.speedFactor,1);
});

test('defeat clears in-flight actions and restart restores HP and idle state',()=>{
  const bout=new CombatBout(),player=playerAt(380);
  bout.started=true;first(bout).enemy.hp=1;
  first(bout).launchShot({x:400,y:250},player,first(bout).spec.shot);
  assert.ok(bout.playerStrike('drain',player,first(bout).enemy));
  assert.equal(first(bout).enemy.hp,0);
  assert.equal(first(bout).shots.length,0);
  assert.equal(bout.playerStrike('drain',player,first(bout).enemy),null);
  bout.reset();bout.started=true;bout.playerHp=10;
  bout.hurt(24,player);
  assert.equal(bout.playerHp,0);
  assert.equal(first(bout).phase,'ended');
  bout.reset();
  assert.deepEqual([bout.playerHp,first(bout).enemy.hp,bout.started,first(bout).phase,first(bout).shots,first(bout).attack,first(bout).hop],
    [100,100,false,'idle',[],null,null]);
});

test('Poisoned has exactly four spaced ticks; a second hit renews one schedule',()=>{
  const hits=[],bout=new CombatBout((victim,damage)=>hits.push(damage)),player=playerAt(280,145);
  bout.started=true;
  bout.hurt(16,player,'Poisoned');
  advance(bout,990,player);
  assert.deepEqual(hits,[16]);
  advance(bout,10,player);
  assert.deepEqual(hits,[16,3]);
  bout.hurt(16,player,'Poisoned');
  advance(bout,999,player);
  assert.deepEqual(hits,[16,3,16]);
  advance(bout,5001,player);
  assert.deepEqual(hits,[16,3,16,3,3,3,3]);
  assert.equal(bout.poison,null);
});

test('optional haze is a single ground patch with limited exposure ticks and reset cleanup',()=>{
  const bout=new CombatBout(),player=playerAt(290,150);
  bout.started=true;
  first(bout).createCloud(player);
  assert.equal(haze(bout),null);
  bout.cloudEnabled=true;
  first(bout).createCloud(player);
  advance(bout,990,player);
  assert.equal(bout.playerHp,100);
  advance(bout,10,player);
  assert.equal(bout.playerHp,100-AREAS.haze.damage);
  const prior=haze(bout);
  first(bout).createCloud({x:355,y:315});
  assert.notEqual(haze(bout),prior);
  advance(bout,AREAS.haze.lifetime+100,player);
  assert.equal(haze(bout),null);
  assert.equal(bout.playerHp,100-AREAS.haze.damage);
  first(bout).createCloud(player);
  bout.hurt(16,player,'Poisoned');
  advance(bout,2000,player);
  assert.equal(bout.playerHp,100-AREAS.haze.damage-16-6);
  bout.reset('ghost');
  assert.deepEqual([haze(bout),bout.poison,bout.playerHp,first(bout).enemy.hp],[null,null,100,100]);
});

test('Ghost closes distance, orbits instead of standing still, and its body follows floating frames',()=>{
  const bout=new CombatBout(),player=playerAt(300);
  bout.reset('ghost');bout.started=true;first(bout).cooldown=10000;
  const initial=first(bout).spec.box(first(bout).enemy);
  advance(bout,500,player);
  assert.ok(first(bout).enemy.x<476&&first(bout).enemy.y!==304);
  assert.notDeepEqual(first(bout).spec.box(first(bout).enemy),initial);
  const saved={...first(bout).enemy};
  advance(bout,500,player,true);
  assert.deepEqual(first(bout).enemy,saved);
  advance(bout,1200,player);
  const d=Math.hypot(first(bout).enemy.x-player.x,first(bout).enemy.y-player.y);
  assert.ok(d>90&&d<145);
});

test('Spectral Bolt can be dodged and Haunt slows only inside its landing area',()=>{
  for(const kind of ['bolt','haunt'])for(const dodge of [false,true]){
    const hits=[],bout=new CombatBout((...args)=>hits.push(args)),player=playerAt(400);
    bout.reset('ghost');bout.started=true;first(bout).nextAttack=kind;first(bout).cooldown=0;
    advance(bout,20,player);
    assert.equal(first(bout).attack.kind,kind);
    const aimed={...first(bout).attack.to};
    if(dodge)player.y+=70;
    advance(bout,440,player);
    assert.deepEqual(first(bout).attack.to,aimed);
    assert.equal(bout.playerHp,100);
    advance(bout,940,player);
    assert.equal(bout.playerHp,dodge?100:kind==='bolt'?83:78);
    assert.equal(hits.length,dodge?0:1);
    if(kind==='haunt'&&!dodge)assert.ok(bout.slowMs>0&&bout.slowMs<SLOW_MS);
    else assert.equal(bout.slowMs,0);
    assert.equal(first(bout).nextAttack,kind==='bolt'?'haunt':'bolt');
  }
});

test('the Ghost uses the same player strike, misses, recovery and death flow',()=>{
  const bout=new CombatBout(),player=playerAt(418,277);
  bout.reset('ghost');bout.started=true;bout.playerHp=85;
  assert.equal(bout.playerStrike('drain',player,{x:520,y:180}),null);
  assert.ok(bout.playerStrike('drain',player,{x:480,y:265}));
  assert.equal(bout.playerHp,85);
  assert.equal(first(bout).enemy.hp,85);
  first(bout).enemy.hp=5;bout.hurt(1,player,'Slowed');first(bout).attack={kind:'haunt'};
  assert.ok(bout.playerStrike('drain',player,{x:480,y:265}));
  assert.equal(first(bout).enemy.hp,0);
  advance(bout,500,player);
  assert.deepEqual([first(bout).phase,first(bout).attack,first(bout).shots,bout.slowMs],['ended',null,[],0]);
});
