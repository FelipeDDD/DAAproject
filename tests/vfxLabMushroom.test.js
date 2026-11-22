import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CombatBout,POISON } from '../src/vfx/lab/CombatBout.js';
import { AREAS } from '../src/vfx/lab/combatAreas.js';
import { RING,boxCenter,playerBox } from '../src/vfx/lab/combatGeometry.js';
import { MUSHROOM_SHEETS,mushroomPose } from '../src/vfx/lab/mushroomArt.js';
import { MUSHROOM_BOSS,nextMark } from '../src/vfx/lab/mushroomBoss.js';

const player={x:389,y:304,displayHeight:64};
const dodge={...player,y:414};

function fight(composition='mushroom'){
  const bout=new CombatBout();
  bout.reset(composition);
  bout.started=true;
  return bout;
}

function advance(bout,ms,target=player){
  for(let t=0;t<ms;t+=10)bout.update(Math.min(ms-t,10),target);
}

// Death-only tests start after all gates; the full HP progression is tested separately.
function lastHit(bout,actor){
  actor.boss.cursor=MUSHROOM_BOSS.marks.length;
  bout.hitEnemy({damage:actor.enemy.hp},actor,actor.enemy,player);
}

test('Mushroom uses the original transparent strips and plays the full native death sequence',()=>{
  assert.deepEqual(Object.values(MUSHROOM_SHEETS).map(art=>art.frames),[12,12,14]);
  for(const art of Object.values(MUSHROOM_SHEETS)){
    const png=readFileSync(new URL(art.url));
    assert.equal(png.readUInt32BE(16),art.width*art.frames);
    assert.equal(png.readUInt32BE(20),art.height);
    assert.equal(png.readUInt8(25),6);
  }
  const bout=fight(),[actor]=bout.enemies;
  advance(bout,210);
  assert.deepEqual(mushroomPose(actor),['mushroom-idle',2]);
  lastHit(bout,actor);
  assert.deepEqual(mushroomPose(actor),['mushroom-death',0]);
  advance(bout,actor.deathMs-1);
  assert.deepEqual(mushroomPose(actor),['mushroom-death',13]);
  assert.equal(bout.finished,false);
  advance(bout,1);
  assert.equal(bout.finished,true);
});

test('Mushroom is idle outside detection, acquires aggro from hits and uses a body-sized hurtbox',()=>{
  const bout=fight(),[actor]=bout.enemies;
  const far={...player,x:275,y:148};
  advance(bout,600,far);
  assert.equal(actor.enemy.x,476);
  assert.equal(actor.aggro,null);
  bout.hitEnemy({damage:10},actor,actor.enemy,far);
  assert.ok(actor.aggro);
  advance(bout,400,far);
  assert.ok(actor.enemy.x<476&&actor.enemy.x>=476-44*0.4);
  const box=actor.spec.box(actor.enemy);
  assert.equal(box.y+box.height,actor.enemy.y);
  assert.ok(box.height<actor.spec.capHeight&&box.width<80);
  const approach=fight();
  approach.update(10,player);
  assert.ok(approach.enemies[0].aggro);
});

test('Spore Burst emits three spores after charging, damages once per volley and can be dodged',()=>{
  for(const scenario of ['hit','dodge','overlap']){
    const bout=fight(),[actor]=bout.enemies;
    actor.cooldown=0;
    bout.update(1,player);
    assert.equal(actor.attack.kind,'spore');
    advance(bout,799);
    assert.equal(actor.shots.length,0);
    assert.deepEqual(mushroomPose(actor),['mushroom-attack',3]);
    bout.update(1,player);
    assert.equal(actor.shots.length,3);
    assert.equal(new Set(actor.shots.map(shot=>shot.angle)).size,3);
    if(scenario==='overlap'){
      for(const shot of actor.shots)Object.assign(shot,boxCenter(playerBox(player)));
    }
    advance(bout,1600,scenario==='dodge'?dodge:player);
    assert.equal(bout.playerHp,scenario==='dodge'?100:84);
    assert.equal(actor.shots.length,0);
  }
});

test('Toxic Bloom freezes three distinct warnings and shares one Poisoned effect for five-second areas',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.cooldown=0;
  actor.nextAttack='bloom';
  bout.update(1,player);
  const points=actor.attack.points;
  assert.equal(new Set(points.map(point=>[point.x,point.y].join(','))).size,3);
  assert.ok(points.every(({x,y})=>x>RING.left&&x<RING.right&&y>RING.top&&y<RING.bottom));
  advance(bout,999,dodge);
  assert.equal(bout.areas.length,0);
  bout.update(1,dodge);
  assert.deepEqual(bout.areas.map(({x,y})=>({x,y})),points);
  assert.equal(bout.poison,null);
  actor.cooldown=10000;
  bout.update(10,player);
  const poison=bout.poison;
  assert.equal(poison.remaining,POISON.ticks);
  advance(bout,1900);
  assert.equal(bout.poison,poison);
  advance(bout,AREAS['toxic-bloom'].lifetime-1910,dodge);
  assert.equal(bout.areas.length,0);
});

test('mixed composition allows one Mushroom and clears its hazards on death and reset',()=>{
  const kinds=['mushroom','slime','ghost','frog','snake','frost'];
  const bout=fight(kinds),[actor,slime]=bout.enemies;
  assert.equal(bout.alive,6);
  assert.throws(()=>bout.reset(['mushroom','mushroom']),RangeError);
  bout.addArea('toxic-bloom',actor.id,player);
  bout.addArea('haze',slime.id,player);
  lastHit(bout,actor);
  assert.equal(actor.shots.length,0);
  assert.deepEqual(bout.areas.map(area=>area.kind),['haze']);
  bout.reset(kinds);
  assert.equal(bout.enemies[0].enemy.hp,800);
  assert.equal(bout.areas.length,0);
});

const farAway={...player,x:275,y:148};
function cross(bout,actor){
  bout.hitEnemy({damage:9999},actor,actor.enemy,farAway);
  bout.update(1,farAway);
}
function settle(bout){
  advance(bout,MUSHROOM_BOSS.releaseMs+MUSHROOM_BOSS.recoveryMs,farAway);
}

test('large and repeated hits stop at each mark once, phase transitions and CC survive a full fight',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.aiSample=()=>0.99;
  assert.equal(actor.enemy.hp,800);
  for(const percent of MUSHROOM_BOSS.marks){
    bout.restoreHp(100);
    assert.equal(nextMark(actor),percent);
    cross(bout,actor);
    assert.equal(actor.enemy.hp,8*percent);
    assert.equal(actor.phase,'BossEvent');
    const phase=percent>70?'Infection':percent>35?'Proliferation':'Enraged';
    assert.equal(actor.boss.phase.name,phase);
    assert.equal(bout.hitEnemy({damage:90},actor,actor.enemy,player),0);
    assert.equal(actor.enemy.hp,8*percent);
    settle(bout);
    assert.equal(actor.boss.event,null);
    assert.equal(actor.boss.last,percent===35?'Enraged Big Slime':percent>70?'Toxic Bloom':'Sporecap');
  }
  assert.equal(bout.enemies.length,2);
  assert.equal(bout.enemies[1].enemy.hp,260);
  assert.equal(nextMark(actor),undefined);
  bout.hitEnemy({damage:999},actor,actor.enemy,player);
  assert.equal(actor.enemy.hp,0);
  assert.equal(bout.finished,false);
  assert.equal(bout.areas.some(a=>a.sourceId===actor.id),false);
});

test('threshold shield lets committed Spore Burst and its recovery play through, including while paused',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.cooldown=0;
  bout.update(1,player);
  const aim=actor.attack;
  advance(bout,200);
  bout.hitEnemy({damage:10},actor,actor.enemy,player);
  assert.equal(actor.attack,aim);
  cross(bout,actor);
  assert.equal(actor.attack,aim);
  assert.equal(actor.elapsed,201);
  advance(bout,599,dodge);
  assert.equal(actor.shots.length,3);
  assert.equal(actor.phase,'recover');
  advance(bout,650,dodge);
  assert.equal(actor.phase,'BossEvent');
  bout.update(10000,player,true);
  assert.equal(actor.elapsed,0);
  settle(bout);
  assert.equal(actor.boss.event,null);
  assert.equal(bout.hitEnemy({damage:1},actor,actor.enemy,player),1);
});

test('summoned mini uses the green hitbox and poison jump, emerges away from Michael, and two living summons cap the pool',()=>{
  const bout=fight(),[actor]=bout.enemies;
  actor.aiSample=()=>0;
  for(const percent of [90,80,70]){
    cross(bout,actor);
    advance(bout,1000,player);
    if(percent===90){
      const mini=bout.enemies[1];
      assert.equal(mini.phase,'emerging');
      assert.equal(mini.enemy.hp,45);
      assert.equal(mini.spec.jumpStatus,'Poisoned');
      assert.equal(mini.spec.box(mini.enemy).width,32*0.65);
      assert.ok(Math.hypot(mini.enemy.x-player.x,mini.enemy.y-player.y)>=54);
      assert.ok(mini.enemy.x>=RING.left&&mini.enemy.x<=RING.right);
    }
    advance(bout,600,farAway);
    assert.equal(actor.boss.last,percent===70?'Toxic Bloom':'Mini Poison Slime');
  }
  assert.equal(bout.enemies.length,3);
  const mini=bout.enemies[1];
  bout.playerStrike('meteor',player,mini.enemy);
  assert.equal(mini.enemy.hp,0);
  cross(bout,actor);
  settle(bout);
  assert.equal(actor.boss.last,'Poison Slime');
});

test('debug phase starts omit prior events, phase two can draw Big Slime, reset cancels protected casts and emerging summons',()=>{
  const bout=fight();
  for(const start of [2,3]){
    bout.reset('mushroom',start);
    bout.started=true;
    const [actor]=bout.enemies;
    actor.aiSample=(()=>{const samples=[0,0.99];return ()=>samples.shift()??0;})();
    assert.equal(actor.enemy.hp,start===2?560:280);
    assert.equal(nextMark(actor),start===2?60:25);
    bout.update(1,farAway);
    assert.equal(actor.boss.event.id,start===2?'big':'final');
    advance(bout,999);
    assert.equal(bout.alive,1);
    bout.update(1,player);
    assert.equal(bout.enemies[1].phase,'emerging');
    assert.equal(bout.enemies[1].enemy.hp,start===2?180:260);
    bout.reset('mushroom');
    assert.equal(bout.alive,1);
    assert.equal(bout.enemies[0].boss.event,null);
    assert.equal(nextMark(bout.enemies[0]),90);
  }
  bout.started=true;
  cross(bout,bout.enemies[0]);
  bout.hurt(100,player);
  assert.equal(bout.enemies[0].boss.event,null);
  advance(bout,3000);
  assert.equal(bout.enemies.length,1);
});

test('full mixed encounter uses CC at Enraged, releases the single mandatory summon when a slot opens',()=>{
  const bout=fight();
  bout.reset(['mushroom','ghost','frog','big','frost','snake'],3);
  bout.started=true;
  const [actor,other]=bout.enemies;
  bout.update(1,farAway);
  settle(bout);
  assert.equal(actor.boss.finalPending,true);
  assert.equal(actor.boss.last,'Toxic Bloom');
  assert.equal(bout.alive,6);
  bout.hitEnemy({damage:999},other,other.enemy,player);
  bout.update(10,farAway);
  assert.equal(bout.alive,6);
  const final=bout.enemies.at(-1);
  assert.equal(final.spec.label,'Enraged Big Slime');
  assert.equal(actor.boss.finalPending,false);
  bout.hitEnemy({damage:999},final,final.enemy,player);
  actor.aiSample=()=>0;
  cross(bout,actor);
  settle(bout);
  assert.equal(actor.boss.last,'Toxic Bloom');
  assert.equal(bout.enemies.length,7);
});

test('Sporecap telegraphs the locked ground point and triggers once, with no delayed callbacks after reset',()=>{
  const bout=fight();
  bout.reset('mushroom',2);
  bout.started=true;
  const [actor]=bout.enemies;
  actor.aiSample=()=>0.99;
  bout.update(1,player);
  advance(bout,999,dodge);
  assert.equal(bout.areas.length,0);
  bout.update(1,dodge);
  assert.equal(bout.areas[0].x,player.x);
  assert.equal(bout.areas[0].y,player.y);
  bout.update(1,player);
  assert.equal(bout.playerHp,88);
  advance(bout,400,player);
  assert.equal(bout.playerHp,88);
  bout.reset('mushroom');
  advance(bout,4000);
  assert.equal(bout.poison,null);
  assert.equal(bout.areas.length,0);
});
