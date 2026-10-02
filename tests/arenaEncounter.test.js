import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ArenaEncounter,ARENA_ENCOUNTER_STATES,arenaEncounterFromDestination,
} from '../src/boss/ArenaEncounter.js';
import { createLocalBossAuthority,LocalSoloBossAuthority } from '../src/boss/LocalSoloBossAuthority.js';
import { directorBossConfig } from '../src/boss/encounterConfig.js';
import { BOSS_STATES } from '../src/boss/BossCombatState.js';

test('Solo starts waiting, preserves current effective stats and resets for another attempt',()=>{
  const encounter=arenaEncounterFromDestination({});
  const authority=new LocalSoloBossAuthority({encounter,now:100});
  assert.equal(encounter.mode,'solo');
  assert.equal(encounter.state,ARENA_ENCOUNTER_STATES.WAITING);
  assert.deepEqual(authority.stats,{
    maxHp:100,playerAttackDamage:4,damage:{single:16,fan:16,homing:19,area:31},
  });
  assert.equal(authority.model.nextAttackAt,2300);
  assert.equal(authority.applyDamage(10).damage,0);
  assert.equal(authority.start(),true);
  assert.equal(authority.start(),false);
  assert.equal(encounter.state,ARENA_ENCOUNTER_STATES.ACTIVE);
  authority.applyDamage(20);
  authority.reset(500);
  assert.equal(encounter.state,ARENA_ENCOUNTER_STATES.WAITING);
  assert.equal(authority.model.hp,100);
  assert.equal(authority.model.nextAttackAt,2700);
  assert.equal(authority.phaseState.phase,1);
  assert.equal(authority.start(),true);
  assert.equal(authority.model.hp,100);
});

test('participant scaling is configurable and separate from the Solo effective stats',()=>{
  assert.deepEqual([1,2,3,4].map(count=>directorBossConfig(count).maxHp),[100,175,240,300]);
  assert.deepEqual([1,2,3,4].map(count=>directorBossConfig(count).damage.single),[16,18,19,21]);
  assert.throws(()=>directorBossConfig(5),RangeError);
});

test('local authority emits one attack event and owns attack, damage and phase changes',()=>{
  const authority=new LocalSoloBossAuthority({now:0});
  assert.equal(authority.start(),true);
  const attack=authority.startAttack(2200,{
    type:'single',cooldownMs:2200,origin:{x:10,y:20},target:{x:50,y:60},
    parameters:{projectileSpeed:270},
  });
  assert.equal(attack.type,'single');
  assert.equal(attack.phase,1);
  assert.equal(attack.startedAt,2200);
  assert.equal(attack.executeAt,2200);
  assert.deepEqual(attack.target,{x:50,y:60});
  assert.equal(authority.executeAttack(2200),attack);
  assert.equal(authority.executeAttack(2200),null);
  authority.finishAction();
  const next=authority.startAttack(4400,{type:'fan',cooldownMs:3200,telegraphMs:700,
    origin:{x:10,y:20},target:{x:50,y:60}});
  assert.notEqual(next.eventId,attack.eventId);
  assert.equal(authority.executeAttack(5099),null);
  assert.equal(authority.executeAttack(5100),next);
  authority.finishAction();
  assert.equal(authority.applyDamage(34).phaseChanged,true);
  assert.equal(authority.model.hp,66);
  assert.equal(authority.phaseState.phase,2);
  authority.finishAction();
  assert.equal(authority.beginPhaseTransition(),true);
  assert.equal(authority.model.state,BOSS_STATES.PHASE_TRANSITION);
  assert.equal(authority.finishPhaseTransition(),true);
});

test('defeat, encounter completion and reward callback happen once',()=>{
  const authority=new LocalSoloBossAuthority();
  let rewardCalls=0;
  assert.equal(authority.start(),true);
  assert.equal(authority.applyDamage(100).dying,true);
  assert.equal(authority.defeat(),true);
  assert.equal(authority.defeat(),false);
  assert.equal(authority.encounter.state,ARENA_ENCOUNTER_STATES.DEFEATED);
  assert.equal(authority.complete(()=>rewardCalls++),true);
  assert.equal(authority.complete(()=>rewardCalls++),false);
  assert.equal(rewardCalls,1);
  assert.equal(authority.encounter.state,ARENA_ENCOUNTER_STATES.COMPLETED);
});

test('Co-op retains lobby identity in waiting state and never gets local boss authority',()=>{
  const encounter=arenaEncounterFromDestination({arenaMode:'coop',
    arenaLobbyId:'lobby-42',hostPlayerId:'player-a',participantCount:3});
  assert.equal(encounter.encounterId,'lobby-42');
  assert.equal(encounter.hostPlayerId,'player-a');
  assert.equal(encounter.participantCount,3);
  assert.equal(encounter.bossConfig.maxHp,240);
  assert.equal(encounter.state,ARENA_ENCOUNTER_STATES.WAITING);
  assert.equal(createLocalBossAuthority(encounter),null);
  assert.throws(()=>new LocalSoloBossAuthority({encounter}),/Solo only/);
  assert.equal(encounter.state,ARENA_ENCOUNTER_STATES.WAITING);
});
