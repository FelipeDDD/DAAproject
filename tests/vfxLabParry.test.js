import assert from 'node:assert/strict';
import test from 'node:test';
import { CombatBout,POISON } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';

function fight(allowParry=true){
  const heals=[],blocks=[],hits=[];
  const bout=new CombatBout((...hit)=>hits.push(hit),undefined,undefined,{allowParry});
  const runner=new CombatSkillRunner(bout,undefined,{onParryComplete:({blocked,healed})=>{
    blocks.push(blocked);
    if(healed>0)heals.push(healed);
  }});
  const player={x:320,y:304,displayHeight:64,velocity:[60,0],setVelocity(x,y){this.velocity=[x,y];}};
  const aim=()=>({x:400,y:304});
  const slots=['cleaver','healing-parry','drain'];
  const use=slot=>runner.use(slot,slots,player,aim);
  const step=(dt,paused=true)=>{bout.update(dt,player,paused);runner.update(dt,player);};
  bout.started=true;
  bout.playerHp=50;
  return {bout,runner,player,use,step,heals,blocks,hits};
}

test('a weak direct strike is blocked immediately and Michael cannot move or cast through the guard',()=>{
  const {bout,runner,player,use,step,heals,blocks,hits}=fight();
  const slime=bout.enemies[0];
  Object.assign(slime.enemy,{x:player.x+20,y:player.y});
  assert.equal(use(1),true);
  assert.deepEqual(player.velocity,[0,0]);
  assert.equal(runner.castSpeed,0);
  assert.equal(use(0),false);
  assert.equal(use(2),false);
  assert.equal(slime.groundImpact('jump',30,10,player,'Stunned',200),'blocked');
  assert.equal(bout.stunMs,0);
  assert.equal(bout.playerHp,50);
  assert.deepEqual(hits,[]);
  step(299);
  assert.deepEqual(heals,[]);
  assert.deepEqual(blocks,[]);
  step(1);
  assert.equal(runner.castSpeed,1);
  assert.equal(bout.parry,null);
  assert.deepEqual(blocks,[10]);
  assert.deepEqual(heals,[5]);
  assert.equal(bout.playerHp,55);
  bout.hurt(10,player);
  assert.equal(bout.playerHp,45);
});

test('parry sums direct blocks once per impact, without counting duplicate projectiles from one volley',()=>{
  const {bout,player,use,step,heals,blocks,hits}=fight();
  const slime=bout.enemies[0];
  const volley={hit:false};
  assert.equal(use(1),true);
  for(const [damage,group] of [[10],[40,volley],[40,volley],[20],[20]]){
    slime.launchShot({x:player.x+42,y:player.y-24},{x:player.x,y:player.y-24},
      {damage,status:'Poisoned',speed:1000,lifetime:600,radius:5,volley:group,special:Boolean(group)});
    assert.equal(slime.updateShot(slime.shots.pop(),50,player),false);
  }
  bout.hurt(5,player,'Slowed',1000);
  assert.equal(bout.slowMs,0);
  assert.equal(bout.poison,null);
  assert.deepEqual(bout.areas,[]);
  assert.deepEqual(hits,[]);
  step(300);
  assert.deepEqual(blocks,[95]);
  assert.deepEqual(heals,[47.5]);
  assert.equal(bout.playerHp,97.5);
});

test('parry healing respects both the activation cap and max HP',()=>{
  for(const [hp,expected] of [[10,60],[96,4],[100,0]]){
    const {bout,player,use,step,heals,blocks}=fight();
    bout.playerHp=hp;
    use(1);
    bout.hurt(200,player);
    step(300);
    assert.equal(bout.playerHp,hp+expected);
    assert.deepEqual(heals,expected?[expected]:[]);
    assert.deepEqual(blocks,[200]);
  }
});

test('a missed guard takes +20% damage for 400 ms from the exact guard boundary',()=>{
  const {bout,player,use,step,heals,blocks}=fight();
  use(1);
  step(301);
  assert.equal(bout.parry.phase,'recovery');
  assert.equal(bout.parry.remaining,399);
  bout.hurt(10,player);
  assert.equal(bout.playerHp,38);
  step(399);
  assert.equal(bout.parry,null);
  bout.hurt(10,player);
  assert.equal(bout.playerHp,28);
  assert.deepEqual(heals,[]);
  assert.deepEqual(blocks,[]);
});

test('poison and lingering area damage continue through the guard and generate no healing',()=>{
  const {bout,player,use,step,heals}=fight();
  bout.poison={remaining:1,untilTick:10};
  bout.addArea('unstable',-1,player);
  bout.areas[0].exposure=590;
  use(1);
  step(10,false);
  assert.equal(bout.playerHp,50-POISON.damage-9);
  assert.equal(bout.parry.blockedDamage,0);
  step(290);
  assert.equal(bout.parry.phase,'recovery');
  assert.deepEqual(heals,[]);
});

test('cooldown starts at activation and death, reset and encounter interruption clear parry state',()=>{
  const {bout,runner,player,use,step,heals}=fight();
  const id='healing-parry';
  assert.equal(use(1),true);
  assert.equal(runner.cooldowns.get(id),8000);
  assert.equal(SKILLS[id].cooldown,8000);
  step(7999);
  assert.equal(use(1),false);
  step(1);
  assert.equal(use(1),true);
  bout.hurt(10,player);
  bout.hurt(100,player,undefined,undefined,undefined,{periodic:true});
  step(10);
  assert.equal(bout.parry,null);
  assert.equal(runner.cooldowns.size,0);
  assert.deepEqual(heals,[]);
  bout.reset();
  bout.started=true;
  assert.equal(use(1),true);
  step(300);
  bout.reset();
  runner.reset();
  assert.equal(bout.parry,null);
  bout.started=true;
  assert.equal(use(1),true);
  bout.started=false;
  step(10);
  assert.equal(bout.parry,null);
});

test('other combat environments cannot activate Healing Parry',()=>{
  const {bout,runner,use}=fight(false);
  assert.equal(use(1),false);
  assert.equal(bout.parry,null);
  assert.equal(runner.cooldowns.size,0);
});
