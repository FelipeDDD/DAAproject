import test from 'node:test';
import assert from 'node:assert/strict';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { newFighter } from '../src/pvp/matchState.js';
import { combatSnapshot } from '../src/pvp/combatSnapshot.js';
import * as backend from '../convex/pvpMatches.js';

function fixture(t,extra={}){
  let now=10000,nextId=0;const jobs=new Map(),commits=[],states=[],logs=[];
  const state={matchId:'match-a',room:'pvp-arena-test:match-a',round:0,damageRevision:0,state:'active',hostPlayerId:'alice',
    expiresAt:999999,startedAt:0,endsAt:180000,endedAt:null,winner:null,reason:null,scores:{A:0,B:0},scoreLimit:5,respawnMs:2500,
    participants:['alice','bob'].map((playerId,i)=>({...newFighter({playerId,team:i?'B':'A'}),hp:10,presenceRoom:'pvp-arena-test:match-a'})),...extra};
  const authority=new PvpDamageAuthority(state,{now:()=>now,authorityId:'relay-a',getSpawn:p=>({x:p.playerId==='alice'?100:200,y:222}),
    schedule(fn,delay){const id=++nextId;jobs.set(id,{fn,at:now+delay});return id;},cancel:id=>jobs.delete(id),
    commit:async args=>{commits.push(structuredClone(args));return {applied:true};},onState:s=>states.push(s),log:l=>logs.push(l)});
  t.after(()=>authority.close());authority.register('alice','peer-a');authority.register('bob','peer-b');
  const tickTo=at=>{
    let iterations=0;
    for(;;){const entry=[...jobs].filter(([,j])=>j.at<=at).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;
      assert.ok(++iterations<20,'no busy loop or duplicate deadlines');const [id,j]=entry;jobs.delete(id);now=j.at;j.fn();}
    now=at;
  };
  const spawn=(playerId='alice',id='shot-a',shotSeq=1)=>authority.spawn(playerId==='alice'?'peer-a':'peer-b',{
    projectileId:id,playerId,life:authority.state.participants.find(p=>p.playerId===playerId).life,shotSeq,
    x:playerId==='alice'?100:200,y:200,vx:playerId==='alice'?420:-420,vy:0,ttlMs:1200});
  const hit=(shooter='alice',targetId='bob',projectileId='shot-a',targetLife=0)=>authority.attempt(shooter==='alice'?'peer-a':'peer-b',
    {projectileId,targetId,targetLife});
  return {authority,state,jobs,states,logs,commits,tickTo,spawn,hit};
}

test('zero HP emits one death and exactly one point; duplicates cannot repeat either',async t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);assert.ok(f.hit().accepted);
  for(let i=0;i<3;i++)assert.equal(f.hit().accepted,false);
  assert.deepEqual(f.authority.state.scores,{A:1,B:0});
  assert.equal(f.authority.state.participants[1].deaths,1);assert.equal(f.authority.state.participants[0].kills,1);
  assert.equal(f.states.flatMap(s=>s.events).filter(e=>e.type==='death').length,1);
  assert.equal(f.logs.filter(l=>l.event==='death accepted').length,1);
  await f.authority.queue;assert.equal(f.commits.length,1);
});

test('server deadline respawns after exactly 2.5s without traffic, restores HP 100 and increments life once',async t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);f.hit();
  assert.equal(f.authority.state.participants[1].respawnAt,12700);assert.equal(f.jobs.size,1);
  f.tickTo(12699);assert.equal(f.authority.state.participants[1].hp,0);
  f.tickTo(12700);const p=f.authority.state.participants[1];
  assert.equal(p.hp,100);assert.equal(p.life,1);assert.equal(p.respawnAt,null);
  f.tickTo(12701);assert.equal(f.logs.filter(l=>l.event==='respawn applied').length,1);
  assert.deepEqual(f.states.at(-1).events,[{type:'respawn',playerId:'bob',life:1,hp:100}]);
  await f.authority.queue;assert.equal(f.commits.length,2);
});

test('previous target life and previous shooter-life spawn cannot affect a respawned fighter',t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);f.hit();
  f.tickTo(10400);f.spawn('alice','old-flight',2);
  // Extend this flight in the fixture to exercise the life guard independently
  // of the normal 1.2s TTL (which is already shorter than respawn).
  f.authority.projectiles.get('old-flight').expiresAt=14000;
  f.tickTo(12700);assert.equal(f.hit('alice','bob','old-flight',1).reason,'stale_life');
  assert.equal(f.hit('alice','bob','old-flight',0).reason,'stale_life');
  assert.equal(f.authority.spawn('peer-b',{projectileId:'old-b',playerId:'bob',life:0,shotSeq:99,x:200,y:200,vx:-420,vy:0,ttlMs:1200}),false);
});

test('valid posthumous double kill awards both teams once and preserves the first flight',t=>{
  const f=fixture(t);f.spawn();f.spawn('bob','shot-b');f.tickTo(10200);
  assert.ok(f.hit('bob','alice','shot-b').accepted);
  assert.ok(f.authority.projectiles.has('shot-a'));assert.ok(f.hit().accepted);
  assert.deepEqual(f.authority.state.scores,{A:1,B:1});
  assert.ok(f.authority.state.participants.every(p=>p.hp===0&&p.kills===1&&p.deaths===1));
  assert.equal(f.jobs.size,1);f.tickTo(12700);assert.ok(f.authority.state.participants.every(p=>p.hp===100&&p.life===1));
});

test('victory threshold ends exactly once, clears respawns and rejects all later combat',async t=>{
  const f=fixture(t,{scores:{A:4,B:0}});f.spawn();f.spawn('bob','shot-b');f.tickTo(10200);f.hit();
  const m=f.authority.state;assert.equal(m.state,'ended');assert.equal(m.winner,'A');assert.equal(m.reason,'score-limit');
  assert.deepEqual(m.scores,{A:5,B:0});assert.equal(f.jobs.size,0);assert.equal(f.authority.projectiles.size,0);
  assert.ok(m.participants.every(p=>p.respawnAt===null));
  assert.equal(f.hit('bob','alice','shot-b').accepted,false);assert.equal(f.spawn('alice','after-end',2),false);
  assert.equal(f.authority.movement('peer-a',{playerId:'alice',life:0,x:999,y:999}),false);
  f.tickTo(50000);f.authority.advance();assert.equal(f.authority.state.participants[1].life,0);
  assert.equal(f.logs.filter(l=>l.event==='match ended').length,1);await f.authority.queue;assert.equal(f.commits.length,1);
});

for(const [scores,winner] of [[{A:2,B:1},'A'],[{A:0,B:3},'B'],[{A:1,B:1},'draw']])
test(`server timeout without packets produces ${winner} at the authoritative deadline`,async t=>{
  const f=fixture(t,{scores,endsAt:13000});f.tickTo(12999);assert.equal(f.authority.state.state,'active');
  f.tickTo(13000);assert.equal(f.authority.state.state,'ended');assert.equal(f.authority.state.winner,winner);
  assert.equal(f.authority.state.endedAt,13000);assert.equal(f.jobs.size,0);await f.authority.queue;assert.equal(f.commits.length,1);
});

test('match timeout takes precedence over a coincident respawn deadline',t=>{
  const f=fixture(t,{endsAt:12700});f.spawn();f.tickTo(10200);f.hit();f.tickTo(12700);
  assert.equal(f.authority.state.state,'ended');assert.equal(f.authority.state.participants[1].life,0);
  assert.equal(f.authority.state.participants[1].respawnAt,null);
});

test('countdown activation uses the server timer even when no client sends movement',t=>{
  const f=fixture(t,{state:'countdown',startedAt:13000,endsAt:193000});
  f.tickTo(12999);assert.equal(f.authority.state.state,'countdown');f.tickTo(13000);assert.equal(f.authority.state.state,'active');
  assert.equal(f.jobs.size,1);assert.equal(f.authority.deadline,193000);
});

test('leave/end/close cancel pending respawns, and late timer callbacks cannot resurrect',t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);f.hit();const callback=[...f.jobs.values()][0].fn;
  f.authority.remove('peer-b');assert.equal(f.authority.state.reason,'team_empty');assert.equal(f.jobs.size,0);
  f.authority.close();f.authority.close();callback();f.tickTo(12700);f.authority.advance();assert.equal(f.jobs.size,0);
  assert.equal(f.authority.state.participants.some(p=>p.playerId==='bob'),false);
});

test('host-only DEV end runs through the relay; repeated requests cannot end twice',t=>{
  const f=fixture(t);assert.equal(f.authority.requestEnd('peer-b'),false);assert.equal(f.authority.requestEnd('peer-a'),true);
  assert.equal(f.authority.requestEnd('peer-a'),false);assert.equal(f.authority.state.reason,'dev-ended');assert.equal(f.jobs.size,0);
});

test('reactive Convex echoes cannot undo score/HP/life or resurrect a departed fighter',t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);f.hit();f.authority.sync(f.state);
  assert.deepEqual(f.authority.state.scores,{A:1,B:0});assert.equal(f.authority.state.participants[1].hp,0);
  f.tickTo(12700);f.authority.sync(f.state);assert.equal(f.authority.state.participants[1].life,1);
  f.authority.remove('peer-b');f.authority.sync(f.state);assert.equal(f.authority.state.participants.length,1);
});

test('serialized mirror retry copies the score once and cannot reopen a concurrent host departure',async t=>{
  const f=fixture(t);f.spawn();f.tickTo(10200);f.hit();await f.authority.queue;
  t.mock.method(Date,'now',()=>10200);const old=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>old===undefined?delete process.env.DEV_TOOLS_ENABLED:process.env.DEV_TOOLS_ENABLED=old);
  const m={...structuredClone(f.state),_id:'match-a',combatAuthorityId:'relay-a',
    participants:f.state.participants.map(p=>({...p,sessionId:`s-${p.playerId}`}))};
  const rows=m.participants.map(p=>({playerId:p.playerId,sessionId:p.sessionId,lastSeen:10200}));let writes=0;
  const ctx={db:{get:async()=>m,patch:async(_id,data)=>{Object.assign(m,structuredClone(data));writes++;},
    query(){let filter;const q={withIndex(_name,build){const range={eq(key,value){filter=p=>p[key]===value;return range;}};build(range);return q;},
      unique:async()=>rows.find(filter)??null};return q;}}};
  const request=f.commits[0];assert.equal((await backend.mirrorRealtimeCombat._handler(ctx,request)).applied,true);
  assert.deepEqual(await backend.mirrorRealtimeCombat._handler(ctx,request),{applied:true,duplicate:true});
  assert.equal(writes,1);assert.deepEqual(m.scores,{A:1,B:0});assert.equal(m.participants[1].deaths,1);
  Object.assign(m,{state:'ended',reason:'host_left',endedAt:10201,participants:m.participants.slice(1)});
  const next={...request,expectedRevision:1,revision:2};await backend.mirrorRealtimeCombat._handler(ctx,next);
  assert.equal(m.state,'ended');assert.equal(m.reason,'host_left');assert.equal(m.endedAt,10201);
  assert.equal(m.participants.length,1);assert.equal(m.participants[0].respawnAt,null);assert.deepEqual(m.scores,{A:1,B:0});
});

test('client consumes authoritative score/death/respawn/end without predicting outcomes or replaying events',t=>{
  const f=fixture(t);const transport=new RealtimeTransport();transport.sendReliable=()=>true;
  const movement={transport,match:f.state,round:0,roomId:'pvp-match-a-0',playerId:'alice',joined:true,config:{debug:false}};
  const states=[];const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'s-a',onState:s=>{states.push(s);movement.match=s;}});
  t.after(()=>client.close());const emit=payload=>transport.emitMessage({type:'pvp-combat-state',roomId:movement.roomId,payload});
  transport.emitMessage({type:'pvp-authorized',roomId:movement.roomId,payload:{playerId:'alice',round:0}});
  f.spawn();f.tickTo(10200);f.hit();emit(f.states.at(-1));
  assert.deepEqual(states.at(-1).scores,{A:1,B:0});assert.equal(states.at(-1).participants[1].respawnAt,12700);
  emit(f.states.at(-1));assert.equal(states.length,1);
  f.tickTo(12700);emit(f.states.at(-1));assert.equal(states.at(-1).participants[1].life,1);assert.equal(states.at(-1).participants[1].hp,100);
  const raw={...f.state,scores:{A:99,B:0}};assert.deepEqual(client.project(raw).scores,{A:1,B:0});
  f.tickTo(180000);emit(f.states.at(-1));assert.equal(states.at(-1).reason,'timer');assert.equal(states.at(-1).winner,'A');
  assert.equal(client.project(f.state).state,'ended');assert.equal(states.at(-1).endedAt,180000);
});

test('client cannot recreate a departed fighter from a delayed Convex roster',t=>{
  const f=fixture(t);const transport=new RealtimeTransport();transport.sendReliable=()=>true;
  const movement={transport,match:f.state,round:0,roomId:'pvp-match-a-0',playerId:'alice',joined:true,config:{debug:false}};
  let state;const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'s-a',onState:s=>state=s});
  t.after(()=>client.close());transport.emitMessage({type:'pvp-authorized',roomId:movement.roomId,payload:{playerId:'alice',round:0}});
  f.authority.remove('peer-b');transport.emitMessage({type:'pvp-combat-state',roomId:movement.roomId,payload:f.states.at(-1)});
  assert.equal(state.participants.length,1);assert.equal(client.project(f.state).participants.length,1);
});
