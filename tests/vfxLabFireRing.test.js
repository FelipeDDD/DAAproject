import assert from 'node:assert/strict';
import test from 'node:test';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import { SUMMONS } from '../src/vfx/lab/mushroomBoss.js';
import { SWAMP_RUN } from '../src/swamp/runConfig.js';
import { SwampRun } from '../src/swamp/SwampRun.js';
import catalog from '../src/combat/skillCatalog.json' with {type:'json'};

const fire=SKILLS['fire-ring'];
function fight(kinds,options){
  const hits=[];
  const bout=new CombatBout((_victim,damage,_point,hit)=>hits.push({damage,...hit}),()=>0,undefined,options);
  bout.reset(kinds);
  bout.started=true;
  const runner=new CombatSkillRunner(bout);
  const player={x:330,y:304,displayHeight:72,characterBaseId:'sarina'};
  for(const actor of bout.enemies)actor.update=()=>{};
  return {bout,runner,player,hits,
    use:()=>runner.use(0,[fire.id],player,()=>assert.fail('Fire Ring should not use cursor aim')),
    clock:dt=>{bout.update(dt,player);runner.update(dt,player);}};
}

test('Fire Ring is an optional Ultimate with a live self-centered cast and progressive slow',()=>{
  const {bout,runner,player,use}=fight(['big','frost']);
  const [big,frost]=bout.enemies;
  Object.assign(big.enemy,{x:490,y:300});
  Object.assign(frost.enemy,{x:510,y:304});
  assert.equal(catalog[fire.id].category,'ultimate');
  assert.deepEqual(new SwampRun().offers(SWAMP_RUN.checkpoints.at(-1))[0].skills,['meteor']);
  assert.equal(use(),true);
  assert.equal(runner.castSpeed,1);
  runner.update(500,player);
  assert.equal(runner.castSpeed,0.85);
  runner.update(1000,player);
  assert.equal(runner.castSpeed,0.55);
  assert.equal(runner.use(1,[null,'cleaver'],player,()=>player),false);
  player.x=435;
  runner.update(1499,player);
  assert.ok(Math.abs(runner.castSpeed-0.1)<0.001);
  assert.deepEqual(bout.enemies.map(e=>e.enemy.hp),[180,100]);
  runner.update(1,player);
  assert.equal(runner.castSpeed,1);
  assert.deepEqual(runner.actions[0].anchor,{x:435,y:304});
  assert.deepEqual(bout.enemies.map(e=>e.enemy.hp),[120,40]);
  assert.equal(bout.playerHp,100);
  assert.equal(runner.cooldowns.get(fire.id),22000);
  assert.equal(use(),false);
});

test('Burning ticks six times at one-second intervals on a moving target, with independent Slow',()=>{
  const {bout,player,use,clock,hits}=fight('big');
  const [actor]=bout.enemies;
  actor.enemy.x=400;
  actor.slow={name:'Slowed',percent:30,ms:1500};
  use();clock(3000);
  actor.enemy.x=620;
  for(let n=0;n<6;n++){
    clock(999);
    assert.equal(actor.enemy.hp,120-n*10);
    clock(1);
    assert.equal(actor.enemy.hp,110-n*10);
  }
  clock(5000);
  assert.equal(actor.burning,undefined);
  assert.equal(actor.slow.name,'Slowed');
  assert.deepEqual(hits.map(hit=>hit.damage),[60,10,10,10,10,10,10]);
});

test('renewing a burn replaces its duration and tick schedule and death clears it',()=>{
  const {bout,player,hits,clock}=fight('big');
  const [actor]=bout.enemies;
  actor.enemy.x=400;
  bout.playerStrike(fire.id,player,player);
  clock(1500);
  assert.deepEqual(hits.map(hit=>hit.damage),[60,10]);
  bout.playerStrike(fire.id,player,player);
  assert.equal(actor.enemy.hp,50);
  clock(999);
  assert.equal(actor.enemy.hp,50);
  clock(1);
  assert.equal(actor.enemy.hp,40);
  clock(4000);
  assert.equal(actor.enemy.hp,0);
  assert.equal(actor.burning,undefined);
  assert.equal(bout.areas.filter(area=>area.sourceId===actor.id).length,1);
  clock(6000);
  assert.deepEqual(hits.map(hit=>hit.damage),[60,10,60,10,10,10,10,10]);
});

test('the blast respects line of sight, real hurtboxes and the Mushroom phase shield',()=>{
  const space={trace:(_from,to)=>({blocked:to.y>385})};
  const {bout,player,clock}=fight(['mushroom','big','frost'],{space});
  const [boss,blocked,outside]=bout.enemies;
  Object.assign(boss.enemy,{x:390,y:300});
  Object.assign(blocked.enemy,{x:365,y:400});
  Object.assign(outside.enemy,{x:510,y:300});
  const summon=bout.summonCreature(boss,SUMMONS.poison,player,420);
  Object.assign(summon.enemy,{x:player.x-fire.radius-16,y:player.y+10});
  summon.update=()=>{};
  bout.playerStrike(fire.id,player,player);
  assert.equal(boss.enemy.hp,740);
  assert.equal(summon.enemy.hp,40);
  assert.ok(summon.burning);
  assert.equal(blocked.enemy.hp,180);
  assert.equal(outside.enemy.hp,100);
  clock(2000);
  assert.equal(boss.enemy.hp,720);
  assert.equal(boss.boss.event.mark,90);
  clock(1000);
  assert.equal(boss.enemy.hp,720);
  assert.equal(summon.enemy.hp,10);
});

test('stun, death and reset cancel preparation and clear the speed factor',()=>{
  for(const interrupt of ['stun','death','reset']){
    const {bout,runner,player,use,clock}=fight('big');
    bout.enemies[0].enemy.x=420;
    use();clock(1000);
    assert.ok(runner.castSpeed<1);
    if(interrupt==='stun')bout.stun(400);
    if(interrupt==='death')bout.hurt(100,player);
    if(interrupt==='reset'){bout.reset('big');runner.reset();}
    clock(10);
    assert.equal(runner.castSpeed,1);
    assert.equal(runner.actions.length,0);
    assert.equal(bout.enemies[0].burning,undefined);
    assert.equal(bout.enemies[0].enemy.hp,180);
  }
});
