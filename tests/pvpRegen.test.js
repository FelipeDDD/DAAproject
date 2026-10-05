import test from 'node:test';
import assert from 'node:assert/strict';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { newFighter } from '../src/pvp/matchState.js';
import { PVP_MAP_DEFINITION,PVP_RULES } from '../src/pvp/config.js';

function fixture(mode='payload',arenaMap=PVP_MAP_DEFINITION){
  let now=10000,serial=0;
  const jobs=new Map(),commits=[];
  const state={mode,arenaMap,matchId:'match-a',room:'pvp-arena-test:match-a',round:0,damageRevision:0,
    state:'active',hostPlayerId:'alice',expiresAt:999999,startedAt:0,endsAt:999999,
    scores:{A:0,B:0},scoreLimit:5,respawnMs:3000,
    participants:[newFighter({playerId:'alice',team:'A'}),newFighter({playerId:'bob',team:'B'})]
      .map(p=>({...p,presenceRoom:'pvp-arena-test:match-a'}))};
  const authority=new PvpDamageAuthority(state,{now:()=>now,authorityId:'authority-a',
    schedule(fn,delay){const id=++serial;jobs.set(id,{fn,at:now+delay});return id;},
    cancel(id){jobs.delete(id);},commit:async args=>{commits.push(args);return {applied:true};}});
  authority.register('alice','peer-a');authority.register('bob','peer-b');
  authority.movement('peer-a',{playerId:'alice',life:0,x:100,y:222,moving:false});
  authority.movement('peer-b',{playerId:'bob',life:0,x:200,y:222,moving:false});
  return {authority,commits,hp:()=>authority.state.participants.find(p=>p.playerId==='bob').hp,
    tick(to){let count=0;for(;;){
      const next=[...jobs].filter(([,job])=>job.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;
      assert.ok(++count<1000,'bounded authority deadlines');
      const [id,job]=next;jobs.delete(id);now=job.at;job.fn();
    }now=to;},
    hit(seq=1){
      const projectileId=`shot-${seq}`;
      assert.equal(authority.spawn('peer-a',{projectileId,playerId:'alice',life:0,shotSeq:seq,x:100,y:200,
        vx:PVP_RULES.projectileSpeed,vy:0,ttlMs:PVP_RULES.projectileLifetimeMs}),true);
      now+=200;
      const result=authority.attempt('peer-a',{projectileId,targetId:'bob',targetLife:0});
      assert.equal(result.accepted,true);return result;
    }};
}

test('Payload heals 3 HP at three seconds without damage and each following second, capped at full HP',async()=>{
  const f=fixture();f.hit();
  assert.equal(f.hp(),PVP_RULES.maxHp-PVP_RULES.damage);
  f.tick(13199);assert.equal(f.hp(),PVP_RULES.maxHp-PVP_RULES.damage);
  f.tick(13200);assert.equal(f.hp(),PVP_RULES.maxHp-PVP_RULES.damage+3);
  f.tick(14200);assert.equal(f.hp(),PVP_RULES.maxHp-PVP_RULES.damage+6);
  f.tick(30000);assert.equal(f.hp(),PVP_RULES.maxHp);
  await f.authority.queue;
  assert.equal(f.commits.at(-1).snapshot.players.find(p=>p.playerId==='bob').hp,PVP_RULES.maxHp);
  f.authority.close();
});

test('another Payload hit resets the three-second wait; match end stops regeneration',()=>{
  const f=fixture();f.hit();f.tick(12000);f.hit(2);
  const damaged=f.hp();
  f.tick(15199);assert.equal(f.hp(),damaged);
  f.tick(15200);assert.equal(f.hp(),damaged+3);
  f.authority.requestEnd('peer-a');f.tick(30000);
  assert.equal(f.hp(),damaged+3);
  f.authority.close();
});

test('TDM and a different map never gain Payload regeneration',()=>{
  for(const [mode,map] of [['tdm',PVP_MAP_DEFINITION],['payload',{...PVP_MAP_DEFINITION,revision:0}]]){
    const f=fixture(mode,map);f.hit();f.tick(30000);
    assert.equal(f.hp(),PVP_RULES.maxHp-PVP_RULES.damage);
    f.authority.close();
  }
});
