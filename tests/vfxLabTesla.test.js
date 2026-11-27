import assert from 'node:assert/strict';
import test from 'node:test';
import { createCombatSpace,readFootObstacles } from '../src/maps/footCollision.js';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { RING } from '../src/vfx/lab/combatGeometry.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import { SUMMONS } from '../src/vfx/lab/mushroomBoss.js';
import { LAB_EFFECTS } from '../src/vfx/lab/effects.js';
import { SENTRY_DEFAULTS,SENTRY_SHEET } from '../src/vfx/lab/proximityDemo.js';

function fight(kinds,space){
  const hits=[];
  const bout=new CombatBout((side,damage,_point,detail)=>{
    if(side==='enemy')hits.push({damage,...detail});
  });
  bout.reset(kinds);
  bout.started=true;
  const runner=new CombatSkillRunner(bout,undefined,{sentrySpace:space});
  const player={x:310,y:305,displayHeight:56};
  const cast=(x=415,y=305)=>runner.use(3,[null,null,null,'tesla'],player,()=>({x,y}));
  return {bout,runner,player,cast,hits,tick:ms=>runner.update(ms,player)};
}

const place=(actor,x,y=305)=>Object.assign(actor.enemy,{x,y});

test('Sentry shares the preview sheet, native radius, duration and per-target cooldown',()=>{
  const skill=SKILLS.tesla,preview=LAB_EFFECTS.tesla;
  assert.equal(skill.icon,SENTRY_SHEET);
  assert.equal(preview.defaultVariant,'Sentry');
  assert.equal(preview.variants.Sentry[0].ms,SENTRY_DEFAULTS.durationMs);
  assert.ok(preview.variants['Relay array']);
  const {bout,runner,player,cast,hits,tick}=fight(['slime','slime','big','frog']);
  const [a,b,c,d]=bout.enemies;
  place(a,415);place(b,430);place(c,469);place(d,471);
  assert.ok(cast());
  player.x=350;
  tick(skill.cast-1);
  assert.equal(hits.length,0);
  tick(1);
  const [coil]=runner.actions;
  assert.deepEqual(coil.anchor,{x:415,y:305});
  assert.deepEqual(hits.map(hit=>hit.actor),[a,b,c]);
  assert.deepEqual(hits.map(hit=>hit.damage),[12,12,12]);
  assert.ok(hits.every(hit=>hit.reaction==='Electrified'));
  tick(300);
  assert.equal(coil.sentry.flashes.size,0);
  place(a,475);place(d,464);
  tick(500);
  assert.deepEqual(hits.map(hit=>hit.actor),[a,b,c,d]);
  place(a,448);
  tick(199);
  assert.equal(hits.length,4);
  tick(1);
  assert.deepEqual(hits.slice(-3).map(hit=>hit.actor),[a,b,c]);
  assert.equal(d.enemy.hp,78);
  tick(skill.durationMs-1000);
  assert.equal(runner.actions.length,0);
});

test('placement and pulses respect walls, and active sentries cannot stack',()=>{
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',
    objects:[{x:430,y:270,width:10,height:70}]}]});
  const {bout,runner,cast,hits,tick}=fight(['slime','big'],createCombatSpace(obstacles,RING));
  const [a,b]=bout.enemies;
  place(a,415);place(b,455);
  assert.ok(cast(515));
  const [coil]=runner.actions;
  assert.deepEqual(coil.anchor,{x:426,y:305});
  tick(SKILLS.tesla.cast);
  assert.deepEqual(hits.map(hit=>hit.actor),[a]);
  runner.cooldowns.delete('tesla');
  assert.equal(cast(),false);
  assert.equal(runner.actions.length,1);
  bout.playerHp=0;
  tick(1);
  assert.equal(runner.actions.length,0);
  assert.equal(runner.cooldowns.size,0);
});

test('boss, summons, lethal damage and encounter cleanup use the central HP flow',()=>{
  const {bout,runner,player,cast,hits,tick}=fight(['mushroom']);
  const [boss]=bout.enemies;
  place(boss,427);
  const summon=bout.summonCreature(boss,SUMMONS.mini,player,420);
  place(summon,447);
  summon.enemy.hp=2;
  assert.ok(cast());
  tick(SKILLS.tesla.cast);
  assert.deepEqual(hits.map(hit=>hit.damage),[12,2]);
  assert.equal(boss.enemy.hp,788);
  assert.equal(summon.enemy.hp,0);
  boss.enemy.hp=725;
  tick(SKILLS.tesla.targetCooldownMs);
  assert.equal(boss.enemy.hp,720);
  assert.equal(hits.at(-1).damage,5);
  boss.enemy.hp=0;
  for(const actor of bout.enemies)actor.elapsed=actor.deathMs;
  bout.areas.length=0;
  assert.ok(bout.finished);
  tick(50);
  assert.equal(runner.actions.length,0);
  bout.reset();runner.reset();
  assert.equal(runner.cooldowns.size,0);
});
