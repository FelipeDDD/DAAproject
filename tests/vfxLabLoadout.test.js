import assert from 'node:assert/strict';
import test from 'node:test';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { SKILLS,DEFAULT_SLOTS,skillTooltip } from '../src/vfx/lab/combatSkills.js';
import { LOADOUT_KEY,readLoadout,loadPreset,savePreset,slotShortcut } from '../src/vfx/lab/combatLoadout.js';
import { labSheets } from '../src/vfx/lab/sheetCatalog.js';
import { CombatSkillView } from '../src/vfx/lab/CombatSkillView.js';
import { DRAIN_ORBS,handOf,orbArrivalProgress,orbPosition } from '../src/vfx/lab/precisionDemo.js';

function fight(kinds=['slime','ghost'],onDrainComplete){
  const bout=new CombatBout();
  bout.reset(kinds);
  bout.started=true;
  const runner=new CombatSkillRunner(bout,onDrainComplete);
  const player={x:400,y:304,displayHeight:64};
  return {bout,runner,player,cast:(id,i=0)=>runner.use(i,Array(4).fill(id),player,()=>({x:476,y:284})),
    tick:ms=>runner.update(ms,player)};
}

test('all seven registered skills can launch in each slot, using the same stats as the tooltip',()=>{
  assert.equal(Object.keys(SKILLS).length,7);
  for(const skill of Object.values(SKILLS)){
    assert.ok(labSheets[skill.icon]||skill.iconSymbol==='blood-drop');
    if(skill.damage)assert.ok(skillTooltip(skill).includes('Damage: '+skill.damage));
    else for(const band of skill.bands)assert.ok(skillTooltip(skill).includes(band.range+' px · '+band.damage+' / '+band.heal));
    for(let slot=0;slot<4;slot++)assert.ok(fight().cast(skill.id,slot));
  }
});

test('duplicate slots and equipment changes share one cooldown by ID, while unrelated skills remain ready',()=>{
  const {cast,tick,runner}=fight();
  assert.ok(cast('fireball'));assert.equal(cast('fireball',1),false);
  assert.ok(cast('lance',2));
  tick(SKILLS.fireball.cooldown-1);
  assert.equal(cast('fireball',3),false);
  tick(1);assert.ok(cast('fireball',3));
  assert.equal(runner.cooldowns.get('lance'),undefined);
});

test('cast locks, interruptions, player death and reset discard pending impacts and flights',()=>{
  const {cast,tick,bout,runner}=fight();
  assert.ok(cast('meteor'));assert.equal(cast('cleaver'),false);
  bout.stun(1000);tick(50);
  assert.equal(runner.casting,undefined);assert.equal(cast('lance'),false);
  bout.stunMs=0;
  assert.ok(cast('lance'));bout.hurt(100,{x:0,y:0});tick(10);
  assert.equal(runner.actions.length,0);assert.equal(runner.cooldowns.size,0);
  assert.equal(cast('cleaver'),false);
  bout.reset();runner.reset();assert.equal(cast('drain'),false);
});

test('Fireball explodes once on first contact, Ice Lance only slows the front target',()=>{
  for(const id of ['fireball','lance']){
    const {cast,tick,bout}=fight(['slime','slime','big']);
    bout.enemies.forEach((actor,i)=>Object.assign(actor.enemy,{x:[440,455,540][i],y:294}));
    cast(id);tick(500);tick(500);
    const skill=SKILLS[id];
    assert.deepEqual(bout.enemies.map(a=>a.enemy.hp),
      [100-skill.damage,id==='fireball'?100-skill.damage:100,180]);
    assert.deepEqual(bout.enemies.map(actor=>Boolean(actor.aggro)),[true,id==='fireball',false]);
    if(id==='lance')assert.deepEqual(bout.enemies[0].slow,skill.status);
  }
});

test('Frost Knives follow the hand to hit once; Slowed reduces travel while attack cooldowns keep time',()=>{
  const {cast,tick,bout,player}=fight(['slime','slime']);
  bout.enemies.forEach(actor=>Object.assign(actor.enemy,{x:490,y:300}));
  cast('flurry');tick(389);
  assert.equal(bout.enemies[0].enemy.hp,100);
  player.x=455;tick(1);tick(500);
  for(const actor of bout.enemies){
    assert.equal(actor.enemy.hp,100-SKILLS.flurry.damage);
    actor.phase='chase';
    actor.hop={from:{x:490,y:300},to:{x:455,y:304}};
    const cooldown=actor.cooldown;
    actor.update(100,player);assert.equal(actor.elapsed,70);
    assert.equal(actor.cooldown,cooldown-100);
    assert.equal(actor.slow.ms,1500);
  }
});

test('Meteor locks its warning position and samples all current occupants once at impact',()=>{
  const {runner,bout,player,tick}=fight(['slime','swift','ghost']);
  const aim={x:475,y:300};
  runner.use(0,['meteor'],player,()=>aim);
  aim.x=310;
  bout.enemies.forEach((actor,i)=>Object.assign(actor.enemy,{x:i<2?480:385,y:300}));
  tick(SKILLS.meteor.cast-1);
  assert.deepEqual(bout.enemies.map(a=>a.enemy.hp),[100,60,100]);
  tick(1);tick(100);
  assert.deepEqual(bout.enemies.map(a=>a.enemy.hp),[45,5,100]);
  assert.ok(bout.enemies[0].aggro&&bout.enemies[1].aggro);
});

test('Life Steal checks contact, uses inclusive distance tiers and restores at most max HP',()=>{
  for(const [distance,amount] of [[40,20],[41,15],[90,15],[91,10],[150,10],[151,5],[240,5],[241,0]]){
    const {bout,runner,player,tick}=fight(['slime']);
    const hand=handOf(player),{enemy}=bout.enemies[0];
    Object.assign(enemy,{x:hand.x+distance,y:hand.y+12});
    bout.playerHp=50;
    assert.equal(bout.playerStrike('drain',player,{x:enemy.x,y:hand.y+100}),null);
    assert.equal(bout.playerHp,50);
    const skill=SKILLS.drain,flight=skill.visualMs-skill.cast;
    runner.use(0,['drain'],player,()=>({x:enemy.x,y:hand.y}));
    tick(skill.cast);
    assert.equal(enemy.hp,100-amount);
    assert.equal(bout.playerHp,50);
    let previous=0;
    for(let i=0;i<DRAIN_ORBS;i++){
      const progress=orbArrivalProgress(i);
      const arrival=Math.ceil(progress*flight);
      assert.deepEqual(orbPosition(i,progress,enemy,hand),{...hand,done:true});
      tick(arrival-previous-1);
      assert.equal(bout.playerHp,50+Math.ceil(i*amount/DRAIN_ORBS));
      tick(1);
      assert.equal(bout.playerHp,50+Math.ceil((i+1)*amount/DRAIN_ORBS));
      previous=arrival;
    }
    tick(4000);
    assert.equal(bout.playerHp,50+amount);
  }
});

test('Life Steal reports only effective healing at the fourth arrival and skips zero',()=>{
  for(const [hp,targetHp,healed] of [[60,100,20],[92,100,8],[100,100,0],[99,3,1]]){
    const results=[];
    const {bout,runner,player,tick}=fight(['slime'],(...result)=>results.push(result));
    const hand=handOf(player),actor=bout.enemies[0];
    Object.assign(actor.enemy,{x:hand.x+30,y:hand.y+12,hp:targetHp});
    bout.playerHp=hp;
    runner.use(0,['drain'],player,()=>({x:actor.enemy.x,y:hand.y}));
    const skill=SKILLS.drain;
    const lastArrival=skill.cast+Math.ceil((skill.visualMs-skill.cast)*orbArrivalProgress(3));
    tick(lastArrival-1);
    assert.deepEqual(results,[]);
    tick(1);tick(3000);
    assert.deepEqual(results,healed?[[healed]]:[]);
  }
});

test('Life Steal cast movement factor combines with the strongest active slow and clears on release or interruption',()=>{
  const {bout,runner,player,cast,tick}=fight();
  bout.hurt(1,player,'Slowed',2300,0.5);
  assert.ok(cast('drain'));
  assert.equal(runner.castSpeed*bout.speedFactor,0.15);
  tick(SKILLS.drain.cast);
  assert.equal(runner.castSpeed*bout.speedFactor,0.5);
  tick(3200);
  assert.ok(cast('drain'));
  bout.stun(1000);tick(10);
  assert.equal(runner.castSpeed,1);
  assert.equal(runner.casting,undefined);
  bout.stunMs=0;tick(3200);
  assert.ok(cast('drain'));
  bout.hurt(100,player);tick(10);
  assert.equal(runner.castSpeed,1);
  bout.reset();runner.reset();
  assert.equal(runner.castSpeed*bout.speedFactor,1);
});

test('Drain finishes after the last Ghost falls but pending healing cannot revive Michael or cross Reset',()=>{
  for(const end of ['victory','death','reset']){
    const results=[];
    const {bout,runner,cast,tick}=fight(['ghost'],(...result)=>results.push(result));
    bout.playerHp=97;
    bout.enemies[0].enemy.hp=1;
    cast('drain');tick(SKILLS.drain.cast);
    assert.equal(bout.enemies[0].enemy.hp,0);
    assert.equal(bout.playerHp,97);
    if(end==='death')bout.hurt(100,{x:0,y:0});
    else if(end==='reset'){bout.reset();runner.reset();}
    else bout.enemies[0].elapsed=460;
    tick(SKILLS.drain.visualMs);
    assert.equal(bout.playerHp,end==='death'?0:100);
    assert.equal(runner.actions.length,0);
    assert.deepEqual(results,end==='victory'?[[3]]:[]);
  }
});

test('Meteor shows the falling rock before damage and enters the first impact frame at release',()=>{
  const {bout,runner,tick,cast}=fight(['slime']);
  const {cast:castMs,meteor}=SKILLS.meteor;
  cast('meteor');
  const frames=[];
  let destroyed=0;
  const gfx=new Proxy({}, {get:()=>()=>gfx});
  const sprite={texture:{setFilter(){}},setOrigin(){return this;},setDepth(){return this;},
    setScale(){return this;},setFrame(frame){frames.push(frame);},destroy(){destroyed++;}};
  const view=new CombatSkillView({add:{graphics:()=>gfx,image:()=>sprite}},runner.casting,0);
  tick(castMs-meteor.fallMs-1);view.draw();
  assert.deepEqual(frames,[]);
  tick(1);view.draw();assert.deepEqual(frames,[0]);
  tick(meteor.fallMs-1);view.draw();
  assert.equal(frames.at(-1),12);
  assert.equal(bout.enemies[0].enemy.hp,100);
  tick(1);view.draw();
  assert.equal(frames.at(-1),13);
  assert.equal(bout.enemies[0].enemy.hp,45);
  view.destroy();
  assert.equal(destroyed,1);
});

test('three named snapshots, selected preset and independent draft survive serialization and obsolete IDs',()=>{
  const storage=new Map();storage.getItem=storage.get.bind(storage);
  const state=readLoadout(storage);
  state.slots[0]='fireball';savePreset(state,2,' Fire study ');
  state.slots[0]='lance';
  storage.set(LOADOUT_KEY,JSON.stringify(state));
  const restored=readLoadout(storage);
  assert.equal(restored.presets.length,3);assert.equal(restored.selected,2);
  assert.equal(restored.slots[0],'lance');loadPreset(restored,2);
  assert.equal(restored.slots[0],'fireball');assert.equal(restored.presets[2].name,'Fire study');
  restored.presets[0].slots=['retired','lance'];
  storage.set(LOADOUT_KEY,JSON.stringify(restored));
  assert.deepEqual(readLoadout(storage).presets[0].slots,['cleaver','lance','drain','meteor']);
  storage.set(LOADOUT_KEY,'{');assert.deepEqual(readLoadout(storage).slots,DEFAULT_SLOTS);
});

test('keyboard shortcuts map Q/E/R but ignore text fields, repeats and modifier chords',()=>{
  for(const [i,key] of ['q','E','r'].entries()){
    assert.equal(slotShortcut({key}),i+1);
    assert.equal(slotShortcut({key,target:{closest:()=>true}}),-1);
    assert.equal(slotShortcut({key,repeat:true}),-1);
    assert.equal(slotShortcut({key,ctrlKey:true}),-1);
  }
});
