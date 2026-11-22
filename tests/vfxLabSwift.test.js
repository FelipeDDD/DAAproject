import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatBout} from '../src/vfx/lab/CombatBout.js';

const player={x:410,y:304,displayHeight:64};
const distant={...player,x:280,y:150};
function fight(kinds='swift'){
  const bout=new CombatBout();
  bout.reset(kinds);
  bout.started=true;
  return bout;
}
function advance(bout,ms,target=player){
  for(let t=0;t<ms;t+=5)bout.update(Math.min(ms-t,5),target);
}

test('Swift approaches on alternating sides and converges smoothly to Quick Jump range',()=>{
  const bout=fight(),actor=bout.enemies[0],target={...player,x:305};
  let low=304,high=304;
  for(let tick=0;tick<600&&actor.phase!=='windup';tick++){
    const {x,y}=actor.enemy;
    bout.update(5,target);
    assert.ok(Math.hypot(actor.enemy.x-x,actor.enemy.y-y)<3);
    low=Math.min(low,actor.enemy.y);
    high=Math.max(high,actor.enemy.y);
  }
  assert.ok(low<296&&high>312);
  assert.equal(actor.attack.kind,'jump');
  assert.ok(actor.enemy.x-target.x<=actor.spec.jumpRange);
  assert.equal(actor.enemy.hp,60);
  assert.equal(actor.spec.box(actor.enemy).width,24);
});

test('Quick Jump locks its landing, stuns once on hit, and can be dodged during the 400 ms warning',()=>{
  for(const dodge of [true,false]){
    const bout=fight(),actor=bout.enemies[0];
    actor.cooldown=0;
    bout.update(5,player);
    const target=dodge?distant:player;
    advance(bout,395,target);
    assert.equal(actor.phase,'windup');
    advance(bout,5,target);
    assert.equal(actor.phase,'jump');
    advance(bout,315,target);
    assert.equal(bout.playerHp,dodge?100:83);
    assert.equal(bout.stunMs,dodge?0:1000);
    assert.equal(actor.nextAttack,'jump');
    bout.update(300,target,true);
    advance(bout,995,distant);
    assert.equal(bout.stunMs,dodge?0:5);
    advance(bout,5,distant);
    assert.equal(bout.stunMs,0);
  }
});

test('electric death field grants a brief stun on entry and requires a fresh entry after cooldown',()=>{
  const bout=fight(),actor=bout.enemies[0];
  actor.enemy.hp=1;
  assert.ok(bout.playerStrike('drain',player,actor.enemy));
  const point={...player,x:actor.enemy.x,y:actor.enemy.y};
  assert.equal(bout.areas[0].kind,'electric');
  bout.update(5,point);
  assert.equal(bout.stunMs,500);
  advance(bout,500,point);
  bout.update(5,distant);
  bout.update(5,point);
  assert.equal(bout.stunMs,0);
  advance(bout,1000,point);
  assert.equal(bout.stunMs,0);
  bout.update(5,distant);
  bout.update(5,point);
  assert.equal(bout.stunMs,500);
  advance(bout,10000-bout.areas[0].age-5,point);
  assert.equal(bout.areas.length,1);
  assert.equal(bout.finished,false);
  advance(bout,5,point);
  assert.equal(bout.areas.length,0);
  assert.equal(bout.finished,true);
  assert.equal(bout.stunMs,0);
});

test('three Swift Slimes in a six-enemy fight have independent phases, cooldowns and electric fields',()=>{
  const kinds=['swift','swift','swift','ghost','big','frost'];
  const bout=fight(kinds),[a,b,c]=bout.enemies;
  assert.equal(bout.alive,6);
  assert.equal(new Set([a.cooldown,b.cooldown,c.cooldown]).size,3);
  a.cooldown=0;
  bout.update(5,player);
  assert.equal(a.phase,'windup');
  assert.equal(b.phase,'chase');
  assert.notEqual(b.zigzagPhase,c.zigzagPhase);
  bout.addArea('electric',a.id,player);
  bout.addArea('electric',b.id,distant);
  bout.update(5,player);
  advance(bout,400,player);
  bout.update(5,distant);
  assert.equal(bout.stunMs,500);
  assert.notEqual(bout.areas[0].nextPulse,bout.areas[1].nextPulse);
  assert.equal(a.phase,'jump');
  bout.reset(kinds);
  assert.equal(bout.stunMs,0);
  assert.deepEqual(bout.areas,[]);
  assert.ok(bout.enemies.every(e=>e.phase==='idle'&&!e.hop&&!e.attack&&e.enemy.hp===e.spec.maxHp));
  bout.started=true;
  bout.stun(1000);
  bout.hurt(100,player);
  assert.equal(bout.stunMs,0);
});
