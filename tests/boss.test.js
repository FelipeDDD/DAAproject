import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  aimedVelocity,BossCombatState,BossPhaseState,BOSS_STATES,PlayerCombatState,ProjectileHitRegistry,
  projectileFromCollision,projectileVelocityToward,
} from '../src/boss/BossCombatState.js';
import { BOSS_FIXED_SPEECH } from '../src/boss/BossDialogue.js';
import { BossEncounterState,BossTutorialState,isWithinActivationRange } from '../src/boss/BossEncounterState.js';
import { ArenaGateState,readArenaGate } from '../src/boss/ArenaGateController.js';
import { ArenaRetryState } from '../src/boss/ArenaRetryOverlay.js';
import { shouldShowBossDevTools } from '../src/boss/BossDevTools.js';
import { isRewardDismissKey,remasteredPreviewAsset,RewardPresentationState } from '../src/boss/BossRewardOverlay.js';
import {
  AreaAttackTarget,BossAttackSequence,BossMovementPlan,BOSS_ATTACK_TYPES,BOSS_PROJECTILE_VISUALS,
  fanProjectileVelocities,homingVelocity,projectileVisualForAttack,
} from '../src/boss/BossAttackPattern.js';
import { readBossPositions } from '../src/maps/bossPositions.js';
import { resolveSpawn } from '../src/maps/tiledObjects.js';
import {
  BOSS_ACTIVATION_RANGE,BOSS_FAN_PROJECTILE_BODY_HEIGHT,BOSS_FAN_PROJECTILE_BODY_WIDTH,
  BOSS_INTRO_COMBAT_DELAY_MS,BOSS_INTRO_FOLLOWUP_DELAY_MS,BOSS_PHASES,BOSS_PHASE_THRESHOLDS,
  BOSS_RETRY_DELAY_MS,BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
  BOSS_SPRITE_FRAME_HEIGHT,BOSS_SPRITE_FRAME_WIDTH,PLAYER_PROJECTILE_SPEED,
} from '../src/boss/config.js';
import { BOSS_VISUAL_ASSETS,phaseVisual } from '../src/boss/BossVisualState.js';
import {
  applyBossDevPreset,applyDirectorRewardChoice,applyDirectorVictory,BOSS_REWARDS,CHARACTER_SKINS,equipCharacterSkin,
  hasBossReward,hasPendingDirectorReward,missingDirectorRewards,normalizeBossProgress,rewardOutcomeForVictory,
  shouldClearDirectorLoot,
} from '../src/boss/BossRewards.js';
import { wardrobeSkinOptions } from '../src/WardrobeController.js';

test('boss damage clamps HP at zero, enters dying, then finishes defeated',()=>{
  const boss=new BossCombatState({maxHp:100});
  assert.equal(boss.takeDamage(35),35);
  assert.equal(boss.hp,65);assert.equal(boss.state,BOSS_STATES.HURT);
  boss.finishAction();
  assert.equal(boss.takeDamage(500),65);
  assert.equal(boss.hp,0);assert.equal(boss.state,BOSS_STATES.DYING);
  assert.equal(boss.startAttack(1000),false);assert.equal(boss.takeDamage(5),0);
  assert.equal(boss.finishDying(),true);assert.equal(boss.state,BOSS_STATES.DEFEATED);
});

test('defeated boss neither attacks nor receives duplicate damage',()=>{
  const boss=new BossCombatState({maxHp:10,attackCooldownMs:100,now:0});
  boss.takeDamage(10);
  assert.equal(boss.canAttack(1000),false);
  assert.equal(boss.startAttack(1000),false);
  assert.equal(boss.takeDamage(5),0);
});

test('attack cooldown prevents continuous projectiles',()=>{
  const boss=new BossCombatState({attackCooldownMs:1000,now:0});
  assert.equal(boss.startAttack(999),false);
  assert.equal(boss.startAttack(1000),true);
  boss.finishAction();
  assert.equal(boss.startAttack(1999),false);
  assert.equal(boss.startAttack(2000),true);
});

test('aimed projectile locks a normalized direction at firing time',()=>{
  const velocity=aimedVelocity({x:10,y:10},{x:13,y:14},200);
  assert.deepEqual(velocity,{x:120,y:160});
});

test('player mouse aim produces fixed velocity right, left and diagonally',()=>{
  assert.deepEqual(projectileVelocityToward({x:10,y:10},{x:20,y:10},420),{x:420,y:0});
  assert.deepEqual(projectileVelocityToward({x:10,y:10},{x:0,y:10},420),{x:-420,y:0});
  const target={x:13,y:14};
  const velocity=projectileVelocityToward({x:10,y:10},target,PLAYER_PROJECTILE_SPEED);
  assert.deepEqual(velocity,{x:252,y:336});
  target.x=-500;target.y=-500;
  assert.deepEqual(velocity,{x:252,y:336});
  assert.ok(Math.abs(Math.hypot(velocity.x,velocity.y)-PLAYER_PROJECTILE_SPEED)<1e-9);
});

test('player mouse aim rejects a zero or near-zero direction',()=>{
  assert.equal(projectileVelocityToward({x:10,y:10},{x:10,y:10},420),null);
  assert.equal(projectileVelocityToward({x:10,y:10},{x:10.00001,y:10},420),null);
});

test('boss crosses 67 and 34 percent once and reset restores phase 1',()=>{
  const phases=new BossPhaseState({maxHp:100,thresholds:BOSS_PHASE_THRESHOLDS});
  assert.equal(phases.phase,1);
  assert.equal(phases.update(67),false);assert.equal(phases.phase,1);
  assert.equal(phases.update(66),true);assert.equal(phases.phase,2);
  assert.equal(phases.update(65),false);
  assert.equal(phases.consumeTransition(),true);
  assert.equal(phases.consumeTransition(),false);
  assert.equal(phases.update(34),false);assert.equal(phases.phase,2);
  assert.equal(phases.update(33),true);assert.equal(phases.phase,3);
  assert.equal(phases.update(20),false);
  assert.equal(phases.consumeTransition(),true);
  assert.equal(phases.consumeTransition(),false);
  phases.reset();
  assert.equal(phases.phase,1);assert.equal(phases.transitionPending,false);
});

test('phase transition state blocks attacks until it finishes',()=>{
  const boss=new BossCombatState({attackCooldownMs:0,now:0});
  assert.equal(boss.startPhaseTransition(),true);
  assert.equal(boss.state,BOSS_STATES.PHASE_TRANSITION);
  assert.equal(boss.startAttack(0),false);
  assert.equal(boss.takeDamage(10),0);
  assert.equal(boss.hp,100);
  assert.equal(boss.state,BOSS_STATES.PHASE_TRANSITION);
  assert.equal(boss.finishPhaseTransition(),true);
  assert.equal(boss.state,BOSS_STATES.IDLE);
  assert.equal(boss.startAttack(0),true);
});

test('encounter remains dormant outside range and activates once inside range',()=>{
  const encounter=new BossEncounterState({followupDelayMs:BOSS_INTRO_FOLLOWUP_DELAY_MS});
  const boss={x:500,y:500};
  assert.equal(isWithinActivationRange({x:500-BOSS_ACTIVATION_RANGE-1,y:500},boss,BOSS_ACTIVATION_RANGE),false);
  assert.equal(encounter.active,false);
  assert.equal(isWithinActivationRange({x:500-BOSS_ACTIVATION_RANGE,y:500},boss,BOSS_ACTIVATION_RANGE),true);
  assert.equal(encounter.activate(1000),true);
  assert.equal(encounter.active,true);
  assert.equal(encounter.activate(1001),false);
  assert.equal(BOSS_FIXED_SPEECH.activation,'Es ist bereits 08:01 Uhr, du bist zu spät!');
});

test('encounter emits the fixed followup once after three seconds and resets cleanly',()=>{
  const encounter=new BossEncounterState({followupDelayMs:3000});
  encounter.activate(1000);
  assert.equal(encounter.consumeFollowup(3999),false);
  assert.equal(encounter.consumeFollowup(4000),true);
  assert.equal(encounter.consumeFollowup(5000),false);
  assert.equal(BOSS_FIXED_SPEECH.followup,'Unterschreib sofort die Anwesenheitsliste!');
  encounter.reset();
  assert.equal(encounter.active,false);assert.equal(encounter.followupPending,false);
});

test('Director remains protected until the second speech plus the combat delay',()=>{
  const encounter=new BossEncounterState({
    followupDelayMs:BOSS_INTRO_FOLLOWUP_DELAY_MS,combatStartDelayMs:BOSS_INTRO_COMBAT_DELAY_MS,
  });
  encounter.activate(1000);
  assert.equal(encounter.canFight(1000+BOSS_INTRO_FOLLOWUP_DELAY_MS),false);
  assert.equal(encounter.consumeFollowup(1000+BOSS_INTRO_FOLLOWUP_DELAY_MS),true);
  assert.equal(encounter.canFight(1000+BOSS_INTRO_FOLLOWUP_DELAY_MS+BOSS_INTRO_COMBAT_DELAY_MS-1),false);
  assert.equal(encounter.canFight(1000+BOSS_INTRO_FOLLOWUP_DELAY_MS+BOSS_INTRO_COMBAT_DELAY_MS),true);
});

test('attack tutorial appears once per encounter and reset enables it again',()=>{
  const tutorial=new BossTutorialState();
  assert.equal(tutorial.show(),true);assert.equal(tutorial.visible,true);
  assert.equal(tutorial.show(),false);
  assert.equal(tutorial.dismiss(),true);assert.equal(tutorial.visible,false);
  assert.equal(tutorial.dismiss(),false);
  tutorial.reset();
  assert.equal(tutorial.show(),true);
});

test('scripted homing can bypass cooldown without bypassing combat state safety',()=>{
  const boss=new BossCombatState({attackCooldownMs:10000,now:0});
  assert.equal(boss.startAttack(3000,{type:'homing',force:true}),true);
  assert.equal(boss.activeAttack.type,'homing');
  assert.equal(boss.startAttack(3000,{type:'homing',force:true}),false);
});

test('phase visual mappings use intro poses and the final laser-eye combat loop',()=>{
  assert.equal(phaseVisual(1).texture,'director-phase1');
  assert.equal(phaseVisual(2,{intro:true}).animation,'director-phase2-intro-play');
  assert.equal(phaseVisual(2).frame,0);
  assert.equal(phaseVisual(3,{intro:true}).animation,'director-phase3-intro-play');
  assert.equal(phaseVisual(3).animation,'director-phase3-combat-loop');
});

test('normalized boss visual sheets have their own complete fixed-size frames',()=>{
  for(const asset of BOSS_VISUAL_ASSETS){
    const png=fs.readFileSync(new URL(`../public/assets/boss/${asset.file}`,import.meta.url));
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png.readUInt32BE(16),asset.frameWidth*asset.frames);
    assert.equal(png.readUInt32BE(20),asset.frameHeight);
  }
});

test('Director defeat sheet is the dedicated four-frame death sequence',()=>{
  const defeat=BOSS_VISUAL_ASSETS.find(asset=>asset.key==='director-defeat');
  assert.deepEqual(defeat,{key:'director-defeat',file:'director-defeat.png',frames:4,frameWidth:543,frameHeight:724});
});

test('defeated boss cannot begin a phase transition',()=>{
  const boss=new BossCombatState({maxHp:10,attackCooldownMs:0,now:0});
  boss.takeDamage(10);
  assert.equal(boss.state,BOSS_STATES.DYING);
  assert.equal(boss.startPhaseTransition(),false);
});

test('all phases use their configured fan, area, homing and timing intensity',()=>{
  const phase1=BOSS_PHASES[1],phase2=BOSS_PHASES[2],phase3=BOSS_PHASES[3];
  assert.deepEqual([phase1.fanProjectiles,phase2.fanProjectiles,phase3.fanProjectiles],[7,9,11]);
  assert.deepEqual([phase1.areaTelegraphMs,phase2.areaTelegraphMs,phase3.areaTelegraphMs],[900,800,675]);
  assert.deepEqual([phase1.homingSpeed,phase2.homingSpeed,phase3.homingSpeed],[145,158,170]);
  assert.ok(phase2.singleCooldownMs<phase1.singleCooldownMs);
  assert.ok(phase3.singleCooldownMs<phase2.singleCooldownMs);
  assert.ok(phase2.fanCooldownMs<phase1.fanCooldownMs);
  assert.ok(phase3.fanCooldownMs<phase2.fanCooldownMs);
  assert.ok(phase2.areaCooldownMs<phase1.areaCooldownMs);
  assert.ok(phase3.areaCooldownMs<phase2.areaCooldownMs);
  assert.ok(phase2.homingCooldownMs<phase1.homingCooldownMs);
  assert.ok(phase3.homingCooldownMs<phase2.homingCooldownMs);
  assert.ok(phase2.moveDurationMs<phase1.moveDurationMs);
  assert.ok(phase3.moveDurationMs<phase2.moveDurationMs);
  for(const phase of [phase1,phase2,phase3]){
    const fan=fanProjectileVelocities({x:0,y:0},{x:100,y:0},phase.projectileSpeed,
      phase.fanProjectiles,phase.fanSpreadDegrees);
    assert.equal(fan.length,phase.fanProjectiles);
  }
});

test('fan attack uses animated paper with a centered body smaller than its visual frame',()=>{
  assert.equal(projectileVisualForAttack(BOSS_ATTACK_TYPES.FAN),BOSS_PROJECTILE_VISUALS.PAPER);
  assert.equal(projectileVisualForAttack(BOSS_ATTACK_TYPES.SINGLE),BOSS_PROJECTILE_VISUALS.PAPER);
  assert.ok(BOSS_FAN_PROJECTILE_BODY_WIDTH<BOSS_SINGLE_PROJECTILE_FRAME_SIZE);
  assert.ok(BOSS_FAN_PROJECTILE_BODY_HEIGHT<BOSS_SINGLE_PROJECTILE_FRAME_SIZE);
  assert.ok(BOSS_FAN_PROJECTILE_BODY_WIDTH>=BOSS_SINGLE_PROJECTILE_FRAME_SIZE*.4);
  assert.ok(BOSS_FAN_PROJECTILE_BODY_HEIGHT<=BOSS_SINGLE_PROJECTILE_FRAME_SIZE*.6);
});

test('boss starts at 100 HP and needs exactly ten 10-damage hits',()=>{
  const boss=new BossCombatState({maxHp:100});
  assert.equal(boss.hp,100);
  assert.equal(boss.takeDamage(10),10);assert.equal(boss.hp,90);
  boss.finishAction();
  for(let hit=2;hit<=9;hit++){boss.takeDamage(10);boss.finishAction();}
  assert.equal(boss.hp,10);assert.equal(boss.state,BOSS_STATES.IDLE);
  boss.takeDamage(10);
  assert.equal(boss.hp,0);assert.equal(boss.state,BOSS_STATES.DYING);
});

test('the same projectile can resolve only one hit',()=>{
  const registry=new ProjectileHitRegistry(),projectile={};
  registry.prepare(projectile);
  assert.equal(registry.claim(projectile),true);
  assert.equal(registry.claim(projectile),false);
});

test('collision callback finds the projectile regardless of argument order',()=>{
  const target={getData:()=>undefined};
  const projectile={getData:key=>key==='projectileKind'?'player':undefined};
  assert.equal(projectileFromCollision(projectile,target,'player'),projectile);
  assert.equal(projectileFromCollision(target,projectile,'player'),projectile);
  assert.equal(projectileFromCollision(target,projectile,'boss'),null);
});

test('player takes one damage and immediate double-hit is blocked',()=>{
  const player=new PlayerCombatState({maxHp:3,invulnerabilityMs:650});
  assert.equal(player.takeHit(1000),1);assert.equal(player.hp,2);
  assert.equal(player.takeHit(1001),0);assert.equal(player.hp,2);
  assert.equal(player.takeHit(1650),1);assert.equal(player.hp,1);
});

test('combat state reset restores HP, cooldown and active state',()=>{
  const boss=new BossCombatState({maxHp:100,attackCooldownMs:500,now:0});
  boss.takeDamage(100);boss.reset(2000);
  assert.equal(boss.hp,100);assert.equal(boss.state,BOSS_STATES.IDLE);
  assert.equal(boss.canAttack(2499),false);assert.equal(boss.canAttack(2500),true);
  const player=new PlayerCombatState({maxHp:3});
  player.takeHit(1,3);player.reset();
  assert.equal(player.hp,3);assert.equal(player.defeated,false);
});

test('fan attack creates configured trajectories with an exact central shot',()=>{
  const velocities=fanProjectileVelocities({x:0,y:0},{x:100,y:0},190,7,80);
  assert.equal(velocities.length,7);
  assert.ok(Math.abs(velocities[3].x-190)<1e-9);
  assert.ok(Math.abs(velocities[3].y)<1e-9);
  assert.equal(new Set(velocities.map(item=>item.angle)).size,7);
  assert.ok(velocities[0].angle<velocities[3].angle);
  assert.ok(velocities[6].angle>velocities[3].angle);
});

test('fan direction is based on the captured target and does not home',()=>{
  const captured={x:0,y:100};
  const velocities=fanProjectileVelocities({x:0,y:0},captured,100,7,80);
  captured.x=100;captured.y=0;
  assert.ok(Math.abs(velocities[3].x)<1e-9);
  assert.ok(Math.abs(velocities[3].y-100)<1e-9);
});

test('fan telegraph must finish before its attack can execute',()=>{
  const boss=new BossCombatState({attackCooldownMs:100,now:0});
  assert.equal(boss.startAttack(100,{type:'fan',cooldownMs:1000,telegraphMs:700}),true);
  assert.equal(boss.attackReady(799),false);
  assert.equal(boss.attackReady(800),true);
  assert.equal(boss.markAttackExecuted(),true);
  assert.equal(boss.attackReady(801),false);
});

test('attack state blocks overlap and alternates single fan area homing single',()=>{
  const boss=new BossCombatState({attackCooldownMs:100,now:0});
  const sequence=new BossAttackSequence();
  assert.equal(sequence.advance(),BOSS_ATTACK_TYPES.SINGLE);
  assert.equal(sequence.advance(),BOSS_ATTACK_TYPES.FAN);
  assert.equal(sequence.advance(),BOSS_ATTACK_TYPES.AREA);
  assert.equal(sequence.advance(),BOSS_ATTACK_TYPES.HOMING);
  assert.equal(sequence.advance(),BOSS_ATTACK_TYPES.SINGLE);
  assert.equal(boss.startAttack(100),true);
  assert.equal(boss.startAttack(100),false);
});

test('homing steering turns gradually while preserving configured speed',()=>{
  const velocity=homingVelocity({x:145,y:0},{x:0,y:0},{x:0,y:100},145,Math.PI/2,100);
  const angle=Math.atan2(velocity.y,velocity.x);
  assert.ok(angle>0);
  assert.ok(angle<=Math.PI/20+1e-9);
  assert.ok(Math.abs(Math.hypot(velocity.x,velocity.y)-145)<1e-9);
});

test('homing steering continuously responds to the current player position',()=>{
  const first=homingVelocity({x:145,y:0},{x:0,y:0},{x:100,y:100},145,Math.PI,100);
  const second=homingVelocity(first,{x:10,y:2},{x:100,y:-100},145,Math.PI,100);
  assert.ok(first.y>0);
  assert.ok(second.angle<first.angle);
});

test('area attack captures its initial position and never follows the source object',()=>{
  const player={x:120,y:240};
  const area=new AreaAttackTarget(player,64);
  player.x=500;player.y=500;
  assert.deepEqual(area.center,{x:120,y:240});
});

test('area impact only resolves after telegraph and damages only inside its radius',()=>{
  const boss=new BossCombatState({attackCooldownMs:0,now:0});
  boss.startAttack(0,{type:'area',telegraphMs:900});
  const inside=new AreaAttackTarget({x:100,y:100},64);
  assert.equal(inside.resolve({x:110,y:110},{ready:boss.attackReady(899)}),false);
  assert.equal(inside.active,true);
  assert.equal(inside.resolve({x:110,y:110},{ready:boss.attackReady(900)}),true);
  const playerHit=new PlayerCombatState({maxHp:3});
  assert.equal(playerHit.takeHit(900,1),1);
  assert.equal(playerHit.hp,2);

  const outside=new AreaAttackTarget({x:100,y:100},64);
  assert.equal(outside.resolve({x:165,y:100}),false);
  assert.equal(outside.active,false);
  const playerSafe=new PlayerCombatState({maxHp:3});
  assert.equal(playerSafe.hp,3);
});

test('defeated combatants and cleanup cancel a pending area impact',()=>{
  const bossDefeated=new AreaAttackTarget({x:0,y:0},64);
  assert.equal(bossDefeated.resolve({x:0,y:0},{bossDefeated:true}),false);
  assert.equal(bossDefeated.active,false);
  const playerDefeated=new AreaAttackTarget({x:0,y:0},64);
  assert.equal(playerDefeated.resolve({x:0,y:0},{playerDefeated:true}),false);
  const cleaned=new AreaAttackTarget({x:0,y:0},64);
  cleaned.cancel();
  assert.equal(cleaned.resolve({x:0,y:0}),false);
  assert.equal(cleaned.active,false);
});

test('defeat and cleanup cancel a pending telegraphed attack',()=>{
  const defeated=new BossCombatState({maxHp:10,attackCooldownMs:0,now:0});
  defeated.startAttack(0,{type:'fan',telegraphMs:700});
  defeated.takeDamage(10);
  assert.equal(defeated.attackReady(700),false);
  assert.equal(defeated.activeAttack,null);
  assert.equal(defeated.startAttack(1000),false);

  const sleeping=new BossCombatState({attackCooldownMs:0,now:0});
  sleeping.startAttack(0,{type:'fan',telegraphMs:700});
  sleeping.cancelAttack();
  assert.equal(sleeping.attackReady(700),false);
  assert.equal(sleeping.activeAttack,null);
});

test('single boss projectile sheet contains six normalized 48px frames',()=>{
  const png=fs.readFileSync(new URL('../public/assets/boss/director-paper-projectile.png',import.meta.url));
  assert.equal(png.toString('ascii',1,4),'PNG');
  assert.equal(png.readUInt32BE(16),48*6);
  assert.equal(png.readUInt32BE(20),48);
});

test('homing projectile sheet contains six normalized yellow 48px frames',()=>{
  const png=fs.readFileSync(new URL('../public/assets/boss/director-paper-homing.png',import.meta.url));
  assert.equal(png.toString('ascii',1,4),'PNG');
  assert.equal(png.readUInt32BE(16),48*6);
  assert.equal(png.readUInt32BE(20),48);
});

test('boss movement plan skips the current point and completes at the exact destination',()=>{
  const plan=new BossMovementPlan([{name:'boss-pos-1',x:10,y:20},{name:'boss-pos-2',x:30,y:40}]);
  assert.deepEqual(plan.begin({x:10,y:20}),{name:'boss-pos-2',x:30,y:40});
  assert.deepEqual(plan.complete(),{name:'boss-pos-2',x:30,y:40});
  assert.equal(plan.activeDestination,null);
});

test('moving state blocks attacks, survives damage, and returns to idle on completion',()=>{
  const boss=new BossCombatState({maxHp:100,attackCooldownMs:0,now:0});
  assert.equal(boss.startMoving(),true);
  assert.equal(boss.state,BOSS_STATES.MOVING);
  assert.equal(boss.startAttack(0),false);
  boss.takeDamage(10);
  assert.equal(boss.hp,90);assert.equal(boss.state,BOSS_STATES.MOVING);
  assert.equal(boss.finishMoving(),true);assert.equal(boss.state,BOSS_STATES.IDLE);
});

test('attack move attack flow remains valid after movement completion',()=>{
  const boss=new BossCombatState({attackCooldownMs:100,now:0});
  assert.equal(boss.startAttack(100),true);
  boss.markAttackExecuted();boss.finishAction();
  assert.equal(boss.startMoving(),true);
  assert.equal(boss.startAttack(200),false);
  assert.equal(boss.finishMoving(),true);
  assert.equal(boss.startAttack(200),true);
});

test('defeat and cleanup cancel movement while reset restarts from the first marker',()=>{
  const plan=new BossMovementPlan([{name:'boss-pos-1',x:10,y:20},{name:'boss-pos-2',x:30,y:40}]);
  plan.begin({x:0,y:0});plan.cancel();
  assert.equal(plan.activeDestination,null);
  plan.begin({x:0,y:0});plan.complete();plan.reset();
  assert.deepEqual(plan.begin({x:0,y:0}),{name:'boss-pos-1',x:10,y:20});

  const boss=new BossCombatState({maxHp:10,attackCooldownMs:0,now:0});
  boss.startMoving();boss.takeDamage(10);
  assert.equal(boss.state,BOSS_STATES.DYING);
  assert.equal(boss.startMoving(),false);
});

test('first Director victory offers exactly two unique rewards',()=>{
  const {progress,outcome}=applyDirectorVictory(null,'felipe');
  assert.equal(progress.wins,1);assert.equal(progress.defeated,true);
  assert.deepEqual(outcome,{type:'choice',options:['remastered_skin','director_access_badge']});
  assert.equal(progress.rewards.length,0);
});

test('choosing each Director reward persists only that unique reward',()=>{
  const first=applyDirectorVictory(null,'sarina').progress;
  const skin=applyDirectorRewardChoice(first,BOSS_REWARDS.REMASTERED_SKIN);
  assert.equal(skin.granted,true);assert.equal(hasBossReward(skin.progress,BOSS_REWARDS.REMASTERED_SKIN),true);
  assert.equal(hasBossReward(skin.progress,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE),false);
  const duplicate=applyDirectorRewardChoice(skin.progress,BOSS_REWARDS.REMASTERED_SKIN);
  assert.equal(duplicate.granted,false);assert.deepEqual(duplicate.progress.rewards,['remastered_skin']);
  const badge=applyDirectorRewardChoice(applyDirectorVictory(null,'felipe').progress,
    BOSS_REWARDS.DIRECTOR_ACCESS_BADGE);
  assert.equal(badge.granted,true);
  assert.equal(hasBossReward(badge.progress,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE),true);
});

test('death dialogue is fixed in German for the dying sequence',()=>{
  assert.equal(BOSS_FIXED_SPEECH.death,'„Ich kann nicht mehr... ich kündige!“');
});

test('second victory grants the missing reward and third victory never duplicates it',()=>{
  const first=applyDirectorRewardChoice(applyDirectorVictory(null,'michael').progress,
    BOSS_REWARDS.DIRECTOR_ACCESS_BADGE).progress;
  const second=applyDirectorVictory(first,'michael');
  assert.equal(second.progress.wins,2);assert.deepEqual(second.outcome,{type:'automatic',rewardId:'remastered_skin'});
  assert.deepEqual(missingDirectorRewards(second.progress),[]);
  const third=applyDirectorVictory(second.progress,'michael');
  assert.equal(third.progress.wins,3);assert.deepEqual(third.outcome,{type:'none'});
  assert.equal(new Set(third.progress.rewards).size,2);
});

test('reward decision logic does not reopen a choice after one or both unlocks',()=>{
  assert.deepEqual(rewardOutcomeForVictory({wins:2,rewards:['remastered_skin']}),
    {type:'automatic',rewardId:'director_access_badge'});
  assert.deepEqual(rewardOutcomeForVictory({wins:3,rewards:['remastered_skin','director_access_badge']}),{type:'none'});
});

test('unfinished first victory remains a recoverable pending reward',()=>{
  const first=applyDirectorVictory(null,'felipe').progress;
  assert.equal(hasPendingDirectorReward(first),true);
  const chosen=applyDirectorRewardChoice(first,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE).progress;
  assert.equal(hasPendingDirectorReward(chosen),false);
});

test('Classic is always available and Remastered requires its persistent unlock',()=>{
  const empty=wardrobeSkinOptions(null);
  assert.deepEqual(empty.map(option=>[option.id,option.unlocked]),[['classic',true],['remastered',false]]);
  assert.throws(()=>equipCharacterSkin(null,CHARACTER_SKINS.REMASTERED,'felipe'),/not been unlocked/);
  assert.equal(equipCharacterSkin(null,CHARACTER_SKINS.CLASSIC,'felipe').equippedSkin,'classic');
  const unlocked=applyDirectorRewardChoice(applyDirectorVictory(null,'felipe').progress,
    BOSS_REWARDS.REMASTERED_SKIN).progress;
  assert.equal(wardrobeSkinOptions(unlocked)[1].unlocked,true);
  assert.equal(equipCharacterSkin(unlocked,CHARACTER_SKINS.REMASTERED).equippedSkin,'remastered');
  assert.equal(normalizeBossProgress({...unlocked,equippedSkin:'remastered'}).equippedSkin,'remastered');
});

test('arena gate is authored separately and resets from open to closed',()=>{
  const arena=JSON.parse(fs.readFileSync(new URL('../public/assets/maps/arena.tmj',import.meta.url)));
  const definition=readArenaGate(arena),gate=new ArenaGateState();
  assert.equal(definition.name,'gate');assert.equal(definition.asset,'assets/woodgate');
  assert.equal(gate.collisionActive,true);assert.equal(gate.exitAvailable,false);
  assert.equal(gate.open(),true);assert.equal(gate.collisionActive,false);assert.equal(gate.exitAvailable,true);
  assert.equal(gate.open(),false);
  gate.reset();assert.equal(gate.collisionActive,true);assert.equal(gate.exitAvailable,false);
});

test('arena retry choices remain locked for at least five seconds',()=>{
  const retry=new ArenaRetryState(BOSS_RETRY_DELAY_MS);retry.show(1000);
  assert.equal(retry.canChoose(5999),false);assert.equal(retry.canChoose(6000),true);
  retry.reset();assert.equal(retry.canChoose(9000),false);
});

test('DEV boss presets affect only the supplied character progress',()=>{
  const michael=applyBossDevPreset(null,'skin_only','michael');
  assert.equal(michael.characterId,'michael');assert.equal(michael.wins,1);
  assert.deepEqual(michael.rewards,['remastered_skin']);assert.equal(michael.equippedSkin,'classic');
  const fresh=applyBossDevPreset(michael,'fresh','michael');
  assert.deepEqual({characterId:fresh.characterId,wins:fresh.wins,rewards:fresh.rewards,equippedSkin:fresh.equippedSkin},
    {characterId:'michael',wins:0,rewards:[],equippedSkin:'classic'});
  const sarina=applyBossDevPreset(null,'badge_only','sarina');
  assert.equal(sarina.characterId,'sarina');assert.deepEqual(sarina.rewards,['director_access_badge']);
  assert.equal(michael.characterId,'michael');
});

test('DEV tools render only for a Vite development build',()=>{
  assert.equal(shouldShowBossDevTools({DEV:true}),true);
  assert.equal(shouldShowBossDevTools({DEV:false}),false);
  assert.equal(shouldShowBossDevTools({}),false);
});

test('reward preview resolves the selected character instead of a shared skin',()=>{
  assert.equal(remasteredPreviewAsset('michael'),'assets/characters/michael-new-preview.png');
  assert.equal(remasteredPreviewAsset('sarina'),'assets/characters/sarina-new-preview.png');
  assert.notEqual(remasteredPreviewAsset('michael'),remasteredPreviewAsset('sarina'));
});

test('reward presentation stays open until its lock ends and the player explicitly dismisses it',()=>{
  const presentation=new RewardPresentationState();presentation.begin();
  assert.equal(presentation.canDismiss(false),false);
  assert.equal(presentation.canDismiss(true),false);
  presentation.unlock();
  assert.equal(presentation.canDismiss(false),false);
  assert.equal(presentation.canDismiss(true),true);
  presentation.end();assert.equal(presentation.canDismiss(true),false);
});

test('saving a selected reward does not clean up its active presentation',()=>{
  const progress=applyDirectorRewardChoice(applyDirectorVictory(null,'felipe').progress,
    BOSS_REWARDS.DIRECTOR_ACCESS_BADGE).progress;
  assert.equal(shouldClearDirectorLoot(progress,{rewardOpened:true}),false);
  assert.equal(shouldClearDirectorLoot(progress,{rewardOpened:false}),true);
});

test('reward presentation accepts only click handling or E, SPACE and ENTER keyboard input',()=>{
  for(const key of ['e','E',' ','Enter'])assert.equal(isRewardDismissKey({key,repeat:false}),true);
  for(const key of ['Escape','f','Shift'])assert.equal(isRewardDismissKey({key,repeat:false}),false);
  assert.equal(isRewardDismissKey({key:'Enter',repeat:true}),false);
});

test('arena BossPositions are named points in deterministic order',()=>{
  const arena=JSON.parse(fs.readFileSync(new URL('../public/assets/maps/arena.tmj',import.meta.url)));
  const positions=readBossPositions(arena);
  assert.deepEqual(positions.map(item=>item.name),['boss-pos-1','boss-pos-2','boss-pos-3','boss-pos-4']);
  assert.ok(positions.every(item=>Number.isFinite(item.x)&&Number.isFinite(item.y)));
  assert.deepEqual(resolveSpawn(arena,{targetSpawn:'boss-spawn'}),{x:1300,y:525});
});
