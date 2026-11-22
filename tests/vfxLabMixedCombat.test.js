import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatBout,POISON} from '../src/vfx/lab/CombatBout.js';
import {AREAS} from '../src/vfx/lab/combatAreas.js';
import {ENEMIES} from '../src/vfx/lab/combatEnemy.js';
import {handOf,LASH} from '../src/vfx/lab/precisionDemo.js';

import {CombatArenaEffects,drawGroundArea} from '../src/vfx/lab/CombatArenaEffects.js';
import sheets from '../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};

const player={x:400,y:304,displayHeight:64};
const safe={x:275,y:148,displayHeight:64};
function encounter(...kinds){
  const bout=new CombatBout();
  bout.reset(kinds);
  bout.started=true;
  return bout;
}
function advance(bout,ms,target=player){
  for(let time=0;time<ms;time+=10)bout.update(Math.min(ms-time,10),target);
}
function groupAtHand(bout,distance=25){
  const hand=handOf(player);
  for(const actor of bout.enemies)Object.assign(actor.enemy,{x:hand.x+distance,y:hand.y+12});
  return {x:hand.x+120,y:hand.y};
}

test('mixed composition has six independent spawn points, with at most three of each kind',()=>{
  const bout=encounter('slime','slime','frost','frost','big','ghost');
  const starts=bout.enemies.map(a=>[a.enemy.x,a.enemy.y].join(','));
  assert.equal(new Set(starts).size,6);
  assert.equal(bout.alive,6);
  assert.throws(()=>bout.reset(Array(4).fill('big')),RangeError);
  assert.throws(()=>bout.reset(['big','big','slime','slime','ghost','ghost','frost']),RangeError);
  const [small,,,,big]=bout.enemies;
  assert.equal(big.spec.scale,small.spec.scale*1.5);
  assert.equal(big.spec.box(big.enemy).width,small.spec.box(small.enemy).width*1.5);
  assert.ok(big.enemy.hp>small.enemy.hp);
  advance(bout,500);
  assert.ok(bout.enemies.some(actor=>actor.attack||actor.hop));
});

test('frost fires a faster shard that slows on contact; heavy shots and jumps deal more damage',()=>{
  for(const kind of ['frost','big']){
    const bout=encounter(kind),actor=bout.enemies[0];
    actor.nextAttack=actor.spec.shot.kind;
    actor.cooldown=0;
    advance(bout,actor.spec.shotWindup+30);
    assert.equal(actor.shots[0].kind,actor.spec.shot.kind);
    if(kind==='frost')assert.ok(actor.shots[0].speed>ENEMIES.slime.shot.speed);
    advance(bout,650);
    assert.equal(bout.playerHp,100-actor.spec.shot.damage);
    assert.equal(bout.slowMs>0,kind==='frost');
    const jump=encounter(kind),other=jump.enemies[0];
    other.cooldown=0;
    jump.update(1,player);
    advance(jump,other.spec.jumpWindup-1);
    assert.equal(other.phase,'windup');
    jump.update(1,player);
    assert.equal(other.phase,'jump');
    advance(jump,other.spec.jumpMs);
    assert.equal(jump.playerHp,100-other.spec.damage);
    assert.equal(jump.speedFactor,kind==='frost'?0.5:1);
    assert.ok(other.land);
  }
});

test('cleave contacts each body once, lash uses only the tip, drain hits the first body on its ray',()=>{
  const bout=encounter('big','frost','slime');
  const aim=groupAtHand(bout,33),[big,frost,green]=bout.enemies;
  green.enemy.y+=80;
  bout.playerStrike('cleaver',player,aim);
  assert.deepEqual([big.enemy.hp,frost.enemy.hp,green.enemy.hp],[156,76,100]);
  groupAtHand(bout,LASH.reach);
  green.enemy.x-=48;
  bout.playerStrike('lash',player,aim);
  assert.equal(green.enemy.hp,100);
  assert.ok(big.enemy.hp<156&&frost.enemy.hp<76);
  bout.playerHp=59;
  const before=big.enemy.hp;
  bout.playerStrike('drain',player,aim);
  assert.deepEqual([bout.playerHp,green.enemy.hp,big.enemy.hp],[59,80,before]);
});

test('independent deaths leave fixed overlapping hazards and the player can escape the last kills',()=>{
  const bout=encounter('slime','frost','big'),[green,blue,big]=bout.enemies;
  const aim=groupAtHand(bout);
  green.enemy.hp=1;
  bout.playerStrike('cleaver',player,aim);
  assert.equal(bout.alive,2);
  assert.deepEqual(bout.areas.map(a=>[a.kind,a.sourceId,a.team]),[['poison',green.id,'enemy']]);
  blue.enemy.hp=big.enemy.hp=1;
  bout.playerStrike('cleaver',player,aim);
  assert.deepEqual(bout.areas.map(a=>a.kind),['poison','ice','unstable']);
  assert.equal(bout.finished,false);
  const contact={...player,x:green.enemy.x,y:green.enemy.y};
  advance(bout,1010,contact);
  assert.equal(bout.speedFactor,AREAS.ice.speed);
  assert.equal(bout.playerHp,100-AREAS.unstable.damage-POISON.damage);
  assert.equal(bout.areas.length,3);
  const ages=bout.areas.map(a=>a.age);
  bout.update(500,contact,true);
  assert.deepEqual(bout.areas.map(a=>a.age),ages);
  advance(bout,10,safe);
  assert.equal(bout.speedFactor,1);
  advance(bout,8979,safe);
  assert.deepEqual(bout.areas.map(a=>a.kind),['poison','ice','unstable']);
  assert.equal(bout.finished,false);
  advance(bout,1,safe);
  assert.equal(bout.areas.length,0);
  assert.equal(bout.poison,null);
  assert.equal(bout.finished,true);
});

test('overlapping poison renews a single ticking schedule; the last pool can still kill Michael',()=>{
  const bout=encounter('slime','slime');
  const aim=groupAtHand(bout);
  for(const a of bout.enemies)a.enemy.hp=1;
  bout.playerStrike('cleaver',player,aim);
  bout.playerHp=8;
  const contact={...player,...bout.areas[0]};
  advance(bout,2010,contact);
  assert.equal(bout.playerHp,2);
  assert.equal(bout.finished,false);
  advance(bout,1000,contact);
  assert.equal(bout.playerHp,0);
  assert.equal(bout.finished,true);
  assert.equal(bout.areas.length,0);
  assert.equal(bout.poison,null);
});

test('reset during a projectile, status and death field recreates only the selected encounter',()=>{
  const bout=encounter('big','frost','ghost');
  const aim=groupAtHand(bout);
  bout.enemies[0].enemy.hp=1;
  bout.playerStrike('cleaver',player,aim);
  const ghost=bout.enemies[2];
  ghost.nextAttack='bolt';
  ghost.cooldown=0;
  advance(bout,510);
  assert.equal(ghost.shots.length,1);
  assert.ok(bout.areas.length);
  bout.hurt(8,player,'Poisoned');
  bout.hurt(8,player,'Slowed');
  bout.reset(['slime','big']);
  assert.deepEqual([bout.started,bout.enemies.length,bout.playerHp,bout.areas.length,bout.poison,bout.slowMs],
    [false,2,100,0,null,0]);
  assert.ok(bout.enemies.every(a=>!a.shots.length&&!a.attack&&a.enemy.hp===a.spec.maxHp));
});

test('repeated mixed fights release every effect object, including frozen landings and overlapping floor VFX',()=>{
  const live=new Set();
  function object(){
    const view=new Proxy({}, {get(_,key){
      if(key==='destroy')return ()=>assert.ok(live.delete(view));
      return ()=>view;
    }});
    live.add(view);
    return view;
  }
  const scene={add:{graphics:object,image:object}};
  for(let i=0;i<8;i++){
    const bout=encounter('slime','frost','big','ghost','snake','frog');
    const effects=bout.enemies.map(a=>new CombatArenaEffects(scene,a.kind,sheets));
    const floor=object(),limit=live.size;
    for(let t=0;t<2200;t+=20){
      bout.update(20,player);
      bout.enemies.forEach((actor,n)=>effects[n].draw(actor));
    }
    for(const actor of bout.enemies){
      if(actor.spec.hazard)bout.addArea(actor.spec.hazard,actor.id,actor.enemy);
      effects[actor.id].draw(actor,bout.areas.find(a=>a.sourceId===actor.id));
    }
    for(const area of bout.areas)drawGroundArea(floor,area);
    assert.equal(live.size,limit);
    effects.forEach(view=>view.destroy());
    floor.destroy();
    assert.equal(live.size,0);
  }
});
