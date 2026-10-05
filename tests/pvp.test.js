import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as backend from '../convex/pvpMatches.js';
import { combatSnapshot } from '../src/pvp/combatSnapshot.js';
import { update,inRoom } from '../convex/players.js';
import { newFighter,startMatch,advanceMatch,applyPlayerDamage,registerPlayerDeath,canStartMatch,endMatch } from '../src/pvp/matchState.js';
import { PVP_RULES,pvpRoom,PVP_MAP,PVP_MAP_FILE,PVP_MAP_DEFINITION,PVP_INSPECTION_SCENE,setPvpEnabled,pvpEnabled } from '../src/pvp/config.js';
import { teamSpawn } from '../src/pvp/spawns.js';
import { collisionAreas } from '../src/maps/collision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { isPersistentClassRoom } from '../src/maps/classState.js';
import { PvpMatchClient } from '../src/pvp/PvpMatchClient.js';
import { PvpLobbyController } from '../src/pvp/PvpLobbyController.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { PvpHud } from '../src/pvp/PvpHud.js';
import { PvpReturnFlow } from '../src/pvp/PvpReturnFlow.js';
import { segmentRect } from '../src/pvp/projectiles.js';
import { pvpArenaDestination,requirePvpMap } from '../src/pvp/mapConfig.js';

const source=JSON.parse(readFileSync(new URL(`../public/assets/maps/${PVP_MAP_FILE}`,import.meta.url)));
function match(){return {mode:'tdm',state:'waiting',participants:[newFighter({playerId:'a',team:'A'}),newFighter({playerId:'b',team:'B'})],
  scores:{A:0,B:0},scoreLimit:5,timeLimitMs:180_000,respawnMs:2500,startedAt:null,endsAt:null,endedAt:null,winner:null};}
function fixture(t){
  let now=100_000,nextId=0;
  t.mock.method(Date,'now',()=>now);const previous=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>{if(previous===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=previous;});
  const tables={players:Array.from({length:5},(_,i)=>({_id:`row${i}`,playerId:`p${i}`,sessionId:`s${i}`,guestId:`g${i}`,
    characterId:'felipe',characterBaseId:'felipe',name:`Name ${i}`,displayName:`Name ${i}`,room:'school',lastSeen:now,x:50,y:50,direction:'down'})),pvpMatches:[]};
  const jobs=[],writes=[];
  const ctx={scheduler:{async runAfter(delay,fn,args){jobs.push({delay,fn,args});return 'job';}},db:{
    query(table){const filters=[],query={withIndex(name,build){const q={eq(key,value){filters.push([key,value]);return q;}};build(q);return query;},
      async collect(){return tables[table].filter(p=>filters.every(([key,value])=>p[key]===value));},
      async unique(){const rows=await query.collect();assert.ok(rows.length<=1);return rows[0]??null;}};return query;},
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,row){const _id=`id${++nextId}`;tables[table].push({_id,...structuredClone(row)});writes.push(table);return _id;},
    async patch(id,row){Object.assign(await this.get(id),structuredClone(row));writes.push(id);},
    async delete(id){for(const rows of Object.values(tables)){const i=rows.findIndex(row=>row._id===id);if(i>=0)rows.splice(i,1);}},
  }};
  const args=i=>({playerId:`p${i}`,sessionId:`s${i}`});
  const move=(i,room)=>({...args(i),characterId:'felipe',room,x:96+i*100,y:240,direction:'right'});
  return {ctx,tables,jobs,writes,args,move,setTime(value){now=value;for(const p of tables.players)p.lastSeen=value;}};
}

test('PvP lifecycle waits, counts down for 3s, starts a 180s match, and draws at expiry',()=>{
  const waiting=match(),countdown=startMatch(waiting,1000);
  assert.equal(waiting.state,'waiting');assert.equal(countdown.state,'countdown');assert.equal(countdown.startedAt,4000);
  assert.equal(advanceMatch(countdown,3999).state,'countdown');
  assert.equal(advanceMatch(countdown,4000).state,'active');
  const ended=advanceMatch(countdown,184000);assert.equal(ended.state,'ended');assert.equal(ended.winner,'draw');
  assert.equal(ended.endedAt,184000);assert.equal(advanceMatch(ended,999999),ended);
});

test('host and joiner receive the same authoritative map for TDM and Payload; browser overrides cannot select the old map',async t=>{
  const f=fixture(t);
  for(const mode of ['tdm','payload']){
    const lobby=await backend.create._handler(f.ctx,{...f.args(0),mode});
    await backend.join._handler(f.ctx,{...f.args(1),code:lobby.code});
    const member=i=>({...f.args(i),matchId:lobby.matchId});
    await backend.start._handler(f.ctx,{...member(0),round:0});
    const host=await backend.current._handler(f.ctx,member(0)),joiner=await backend.current._handler(f.ctx,member(1));
    assert.ok(Number.isFinite(host.serverNow));
    assert.deepEqual(host.arenaMap,PVP_MAP_DEFINITION);assert.deepEqual(joiner.arenaMap,host.arenaMap);
    assert.deepEqual(pvpArenaDestination(lobby.matchId,host),pvpArenaDestination(lobby.matchId,joiner));
    assert.equal(pvpArenaDestination(lobby.matchId,{...joiner,mapId:'old',arenaId:'old',targetMap:'old'}).targetMap,PVP_MAP);
    assert.equal(requirePvpMap(host).file,PVP_MAP_FILE);
  }
});

test('DEV inspection room accepts ordinary presence while real PvP still requires match membership',async t=>{
  const f=fixture(t);
  await update._handler(f.ctx,f.move(0,PVP_INSPECTION_SCENE));
  assert.equal(f.tables.players[0].room,PVP_INSPECTION_SCENE);
  const visible=await inRoom._handler(f.ctx,{room:PVP_INSPECTION_SCENE});
  assert.equal(visible[0].playerId,'p0');
  await assert.rejects(update._handler(f.ctx,f.move(0,PVP_MAP)),/Missing PvP match/);
});

test('friendly fire blocked, enemy hits reduce health, replayed hits and old lives are ignored',()=>{
  let m=advanceMatch(startMatch(match(),1000),5000);m.participants.push(newFighter({playerId:'friend',team:'A'}));
  const hit={attackerId:'a',victimId:'friend',attackerLife:0,victimLife:0,shot:1};
  m=applyPlayerDamage(m,hit,5000);assert.equal(m.participants[2].hp,100);
  hit.victimId='b';m=applyPlayerDamage(m,hit,5000);assert.equal(m.participants[1].hp,90);
  m=applyPlayerDamage(m,hit,5500);assert.equal(m.participants[1].hp,90);
  m=applyPlayerDamage(m,{...hit,shot:2,victimLife:99},6000);assert.equal(m.participants[1].hp,90);
  m=applyPlayerDamage(m,{...hit,shot:2,attackerLife:99},6000);assert.equal(m.participants[1].hp,90);
});

test('death and kill score once, respawn after 2.5s restores HP and rejects projectiles from the old life',()=>{
  let m=advanceMatch(startMatch(match(),1000),5000);
  const hit={attackerId:'a',victimId:'b',attackerLife:0,victimLife:0};
  for(let shot=1;shot<=10;shot++)m=applyPlayerDamage(m,{...hit,shot},5000+shot*500);
  assert.deepEqual(m.scores,{A:1,B:0});assert.equal(m.participants[0].kills,1);assert.equal(m.participants[1].deaths,1);
  assert.equal(m.participants[1].respawnAt,12500);
  assert.equal(registerPlayerDeath(m,'a','b',10500),m);
  assert.equal(advanceMatch(m,12499).participants[1].hp,0);
  m=advanceMatch(m,12500);assert.equal(m.participants[1].hp,100);assert.equal(m.participants[1].life,1);
  m=applyPlayerDamage(m,{...hit,shot:5},13000);assert.equal(m.participants[1].hp,100);
  m=applyPlayerDamage(m,{...hit,victimLife:1,shot:11},13000);assert.equal(m.participants[1].hp,90);
});

test('fifth kill ends the match immediately; timer chooses higher score and ended games cannot score',()=>{
  let m=advanceMatch(startMatch(match(),0),4000);m.scores.A=4;m.participants[1].hp=10;
  m=applyPlayerDamage(m,{attackerId:'a',victimId:'b',attackerLife:0,victimLife:0,shot:1},5000);
  assert.equal(m.state,'ended');assert.equal(m.winner,'A');assert.equal(m.reason,'score-limit');assert.equal(m.scores.A,5);
  assert.equal(applyPlayerDamage(m,{attackerId:'a',victimId:'b',shot:2},8000),m);
  const timed=startMatch(match(),0);timed.scores.B=2;
  assert.equal(advanceMatch(timed,timed.endsAt).winner,'B');
});

test('lobby creates short code, joins idempotently, caps 4 players / 2 per team and hides sessions',async t=>{
  const f=fixture(t),a=await backend.create._handler(f.ctx,f.args(0));
  assert.match(a.code,/^[A-Z2-9]{6}$/);assert.equal(f.jobs.length,1);assert.equal(f.jobs[0].delay,PVP_RULES.lobbyLifetimeMs);
  for(const i of [1,1,2,3])await backend.join._handler(f.ctx,{...f.args(i),code:` ${a.code.toLowerCase()} `});
  const state=await backend.current._handler(f.ctx,{...f.args(0),matchId:a.matchId});
  assert.equal(state.participants.length,4);assert.equal(state.participants.filter(p=>p.team==='A').length,2);
  assert.equal(JSON.stringify(state).includes('sessionId'),false);
  assert.ok(state.participants.every(p=>p.characterBaseId==='felipe'));
  await assert.rejects(backend.join._handler(f.ctx,{...f.args(4),code:a.code}),/full/);
  await assert.rejects(backend.chooseTeam._handler(f.ctx,{...f.args(1),matchId:a.matchId,team:'A'}),/team is full/);
  await backend.start._handler(f.ctx,{...f.args(0),matchId:a.matchId});
  assert.equal(f.tables.pvpMatches[0].state,'countdown'); // 2v2 uses the same start rule.
});

test('waiting host keeps identity and start authority across A/B/A team changes',async t=>{
  const f=fixture(t),created=await backend.create._handler(f.ctx,f.args(0));
  const member=i=>({...f.args(i),matchId:created.matchId});
  const initial=await backend.current._handler(f.ctx,member(0));
  const host=structuredClone(f.tables.pvpMatches[0].participants[0]);
  assert.equal(initial.hostPlayerId,'p0');assert.equal(initial.participants[0].team,'A');
  for(const team of ['B','A','B']){
    await backend.chooseTeam._handler(f.ctx,{...member(0),team});
    const state=await backend.current._handler(f.ctx,member(0));
    assert.equal(state.state,'waiting');assert.equal(state.hostPlayerId,'p0');
    assert.deepEqual(f.tables.pvpMatches[0].participants[0],{...host,team});
  }
  await backend.join._handler(f.ctx,{...f.args(1),code:created.code});
  await backend.start._handler(f.ctx,member(0));
  assert.equal(f.tables.pvpMatches[0].state,'countdown');
  assert.equal(f.tables.pvpMatches[0].hostPlayerId,'p0');
});

test('non-host team changes and stale sessions cannot take host authority',async t=>{
  const f=fixture(t),created=await backend.create._handler(f.ctx,f.args(0));
  const member=i=>({...f.args(i),matchId:created.matchId});
  await backend.join._handler(f.ctx,{...f.args(1),code:created.code});
  for(const team of ['A','B']){
    await backend.chooseTeam._handler(f.ctx,{...member(1),team});
    assert.equal(f.tables.pvpMatches[0].hostPlayerId,'p0');
    await assert.rejects(backend.start._handler(f.ctx,member(1)),/Only the host/);
  }
  const before=structuredClone(f.tables.pvpMatches[0]);
  await assert.rejects(backend.chooseTeam._handler(f.ctx,{...member(0),sessionId:'old',team:'B'}),/CHARACTER_SESSION_LOST/);
  assert.deepEqual(f.tables.pvpMatches[0],before);
});

test('host starts 2v1; teams freeze; all members enter one room and outsiders cannot enter',async t=>{
  const f=fixture(t),a=await backend.create._handler(f.ctx,f.args(0)),member=i=>({...f.args(i),matchId:a.matchId});
  for(const i of [1,2])await backend.join._handler(f.ctx,{...f.args(i),code:a.code});
  await assert.rejects(backend.start._handler(f.ctx,member(1)),/Only the host/);
  await backend.start._handler(f.ctx,member(0));
  const state=await backend.current._handler(f.ctx,member(1));assert.equal(state.state,'countdown');
  assert.equal(state.participants.filter(p=>p.team==='A').length,2);assert.equal(state.participants.filter(p=>p.team==='B').length,1);
  await assert.rejects(backend.chooseTeam._handler(f.ctx,{...member(2),team:'B'}),/locked/);
  await assert.rejects(backend.join._handler(f.ctx,{...f.args(3),code:a.code}),/started/);
  for(const i of [0,1,2])await update._handler(f.ctx,f.move(i,state.room));
  assert.equal((await inRoom._handler(f.ctx,{room:state.room})).length,3);
  await assert.rejects(update._handler(f.ctx,f.move(3,state.room)),/Invalid PvP/);
  await assert.rejects(update._handler(f.ctx,f.move(0,PVP_MAP)),/Missing PvP/);
  const fake=await f.ctx.db.insert('pvpMatches',{hostPlayerId:'p0',participants:[f.args(0)],status:'started',expiresAt:999999});
  await assert.rejects(update._handler(f.ctx,f.move(0,pvpRoom(fake))),/Invalid PvP/); // A boss-lobby shape is not a PvP match.
});

test('1v2 is valid and a team without opponents cannot start',async t=>{
  const f=fixture(t),a=await backend.create._handler(f.ctx,f.args(0)),member=i=>({...f.args(i),matchId:a.matchId});
  await assert.rejects(backend.start._handler(f.ctx,member(0)),/Each team needs/);
  for(const i of [1,2])await backend.join._handler(f.ctx,{...f.args(i),code:a.code});
  await backend.chooseTeam._handler(f.ctx,{...member(2),team:'B'});
  await backend.start._handler(f.ctx,member(0));assert.equal(f.tables.pvpMatches[0].state,'countdown');
});

test('guest leave releases only owned membership; stale generation cannot leave, hit or start',async t=>{
  const f=fixture(t),a=await backend.create._handler(f.ctx,f.args(0)),member=i=>({...f.args(i),matchId:a.matchId});
  await backend.join._handler(f.ctx,{...f.args(1),code:a.code});
  await backend.leave._handler(f.ctx,{...member(1),sessionId:'old'});assert.equal(f.tables.pvpMatches[0].participants.length,2);
  await assert.rejects(backend.start._handler(f.ctx,{...member(0),sessionId:'old'}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(backend.hit._handler(f.ctx,{...member(1),sessionId:'old',victimId:'p0',victimLife:0,attackerLife:0,shot:1}),/CHARACTER_SESSION_LOST/);
  await backend.leave._handler(f.ctx,member(1));assert.equal(f.tables.pvpMatches[0].participants.length,1);
  await backend.join._handler(f.ctx,{...f.args(1),code:a.code});
  await backend.leave._handler(f.ctx,member(0));
  assert.equal((await backend.current._handler(f.ctx,member(1))).reason,'host_left');
});

// Test-only relay decision fixture. Production Convex does not execute these rules.
async function serverHit(f,shooterId,targetId,shotSeq,extra={}){
  const m=f.tables.pvpMatches[0],shooter=m.participants.find(p=>p.playerId===shooterId),target=m.participants.find(p=>p.playerId===targetId);
  const next=applyPlayerDamage(m,{attackerId:shooterId,victimId:targetId,attackerLife:extra.attackerLife??shooter?.life??0,
    victimLife:extra.targetLife??target?.life??0,shot:shotSeq},Date.now());
  if(!target||next.participants.find(p=>p.playerId===targetId)?.hp===target.hp)return {applied:false};
  if(!m.combatAuthorityId)await backend.acquireRealtimeCombat._handler(f.ctx,{matchId:m._id,round:m.round??0,authorityId:'test-relay'});
  return backend.mirrorRealtimeCombat._handler(f.ctx,{matchId:m._id,round:extra.round??m.round??0,authorityId:'test-relay',
    expectedRevision:extra.expectedRevision??m.damageRevision??0,revision:(extra.expectedRevision??m.damageRevision??0)+1,snapshot:combatSnapshot(next)});
}

test('legacy attacker and hit-only mirror are disabled; Convex clocks never decide timeout',async t=>{
  const f=await runningFixture(t,2);
  await assert.rejects(backend.hit._handler(f.ctx,{...f.member(0),victimId:'p1',victimLife:0,attackerLife:0,shot:1}),/realtime server/);
  assert.deepEqual(await backend.applyRealtimeDamage._handler(f.ctx,{}),{applied:false});
  f.setTime(283000);const state=await backend.current._handler(f.ctx,f.member(0));
  assert.equal(state.state,'active');assert.equal(state.participants[1].hp,100);
  await backend.finish._handler(f.ctx,f.member(0));assert.equal(f.tables.pvpMatches[0].state,'active');
  await assert.rejects(backend.finish._handler(f.ctx,{...f.member(0),force:true}),/realtime server/);
  assert.equal(isPersistentClassRoom(pvpRoom(f.lobby.matchId)),false);
});

test('host disconnect and expiry end logically before GC; physical GC is bounded to match lifetime',async t=>{
  const f=fixture(t),a=await backend.create._handler(f.ctx,f.args(0));
  await backend.join._handler(f.ctx,{...f.args(1),code:a.code});f.tables.players[0].lastSeen=0;
  assert.equal((await backend.current._handler(f.ctx,{...f.args(1),matchId:a.matchId})).reason,'host_left');
  await backend.expire._handler(f.ctx,a);assert.equal(f.tables.pvpMatches.length,1);
  f.setTime(100000+PVP_RULES.lobbyLifetimeMs);
  assert.equal((await backend.current._handler(f.ctx,{...f.args(1),matchId:a.matchId})).reason,'expired');
  await backend.expire._handler(f.ctx,a);assert.equal(f.tables.pvpMatches.length,0);
});

test('PvP create/join retain the deployment DEV guard',async t=>{
  const f=fixture(t),previous=process.env.CONVEX_CLOUD_URL;process.env.CONVEX_CLOUD_URL='https://prod.convex.cloud';
  t.after(()=>{if(previous===undefined)delete process.env.CONVEX_CLOUD_URL;else process.env.CONVEX_CLOUD_URL=previous;});
  process.env.DEV_TOOLS_ENABLED='false';
  await assert.rejects(backend.create._handler(f.ctx,f.args(0)),/disabled/);
  await assert.rejects(backend.join._handler(f.ctx,{...f.args(1),code:'ABC234'}),/disabled/);
});

test('configured PvP map owns team spawns, collision and the clear central path between bases',()=>{
  const walls=collisionAreas(objectsIn(source,'Collision'));
  assert.ok(walls.length>0);assert.ok(source.layers.some(l=>l.type==='imagelayer'&&l.image));
  for(const team of ['A','B'])for(const index of [0,1]){
    const spawn=teamSpawn(source,team,index);assert.match(spawn.name,/^spawn(Blue|Red)$/);
    assert.equal(walls.some(r=>spawn.x>=r.x&&spawn.x<=r.x+r.width&&spawn.y>=r.y&&spawn.y<=r.y+r.height),false);
  }
  const single=structuredClone(source);single.layers.find(l=>l.name==='Spawns').objects=[{name:'teamA_spawn1',x:1323,y:495}];
  assert.equal(teamSpawn(single,'A',1).name,'teamA_spawn1');
  assert.throws(()=>teamSpawn(single,'Z'),/marker/);
  assert.equal(walls.some(r=>segmentRect(teamSpawn(source,'A'),teamSpawn(source,'B'),r)!==null),false);
});

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.hidden=false;this.value='';}
  append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){(this.attributes??={})[name]=value;}focus(){}select(){this.selected=true;}
  addEventListener(name,cb){this.events[name]=cb;}removeEventListener(name){delete this.events[name];}remove(){this.removed=true;}
  querySelectorAll(){return this.children.flatMap(n=>[...(['button','input'].includes(n.tag)?[n]:[]),...n.querySelectorAll()]);}
}
function ui(t){
  const callbacks=[],calls=[],travel=[],ticks=[];let subscriptions=0;
  t.mock.method(globalThis,'setInterval',fn=>{ticks.push(fn);return ticks.length;});t.mock.method(globalThis,'clearInterval',()=>{});
  const documentRef={body:new Element('body'),createElement:tag=>new Element(tag),addEventListener(){},removeEventListener(){}};
  const presence={identity:{playerId:'a',sessionId:'sa'},api:{pvpMatches:{current:'current',create:'create',join:'join',leave:'leave',start:'start',chooseTeam:'chooseTeam'}},
    client:{onUpdate(_fn,_args,cb){callbacks.push(cb);subscriptions++;return()=>subscriptions--;},async mutation(fn,args){calls.push({fn,args});return {matchId:'match-a',code:'ABC234'};}}};
  const scene={presence,input:{enabled:true,keyboard:{enabled:true,resetKeys(){}}},player:{setVelocity(){}},travelTo:dest=>travel.push(dest)};
  const state={...match(),arenaMap:PVP_MAP_DEFINITION,matchId:'match-a',hostPlayerId:'a',code:'ABC234',expiresAt:Date.now()+1800000};
  state.participants.forEach((p,i)=>Object.assign(p,{displayName:`Player ${i}`,characterBaseId:'felipe'}));
  return {documentRef,presence,scene,state,callbacks,calls,travel,ticks,subscriptions:()=>subscriptions};
}

test('lobby UI creates once, displays two teams, keeps guest Start hidden and transitions through one match ID',async t=>{
  const f=ui(t);setPvpEnabled(true);const lobby=new PvpLobbyController(f.scene,{env:{DEV:true},documentRef:f.documentRef});
  const pending=lobby.acquire('create');await lobby.acquire('create');await pending;assert.equal(f.calls.length,1);
  f.callbacks[0](f.state);await Promise.resolve();assert.equal(lobby.teams.children.length,2);assert.equal(lobby.startButton.hidden,false);
  assert.equal(lobby.teams.children[0].children[1].textContent,'Player 0 · HOST · YOU (Felipe)');
  assert.match(lobby.teams.children[0].className,/pvp-team-selected/);
  assert.doesNotMatch(lobby.teams.children[1].className,/pvp-team-selected/);
  assert.equal(lobby.teams.children[0].children[1].className,'pvp-member-self');
  assert.doesNotMatch(lobby.teams.children[1].children[1].textContent,/YOU/);
  f.callbacks[0]({...f.state,hostPlayerId:'b'});await Promise.resolve();assert.equal(lobby.startButton.hidden,true);
  f.callbacks[0]({...f.state,state:'countdown',startedAt:Date.now()+3000,endsAt:Date.now()+183000});await Promise.resolve();
  assert.equal(f.travel.length,1);assert.equal(f.travel[0].pvpMatchId,'match-a');assert.equal(f.subscriptions(),0);
  f.callbacks[0](f.state);await Promise.resolve();assert.equal(f.travel.length,1);setPvpEnabled(false);
});

test('lobby with missing or old authoritative map keeps Leave available and reports mismatch instead of entering a fallback arena',async t=>{
  const f=ui(t),lobby=new PvpLobbyController(f.scene,{env:{DEV:true},documentRef:f.documentRef,resumeMatchId:'match-a'});
  t.after(()=>lobby.close());
  for(const arenaMap of [undefined,{id:'pvp-arena-test',file:'pvp-arena-test.tmj',revision:1}]){
    f.callbacks[0]({...f.state,state:'countdown',arenaMap});await Promise.resolve();
    assert.equal(f.travel.length,0);assert.equal(lobby.active,true);
    assert.match(lobby.status.textContent,/map configuration mismatch/);
  }
});

test('team-change subscription snapshots move the HOST badge and preserve host Start in the lobby UI',async t=>{
  const f=fixture(t),u=ui(t);u.presence.identity=f.args(0);
  u.presence.client.mutation=async(action,args)=>{
    u.calls.push({fn:action,args});
    const result=await backend[action]._handler(f.ctx,args);
    if(action==='chooseTeam')u.callbacks[0](await backend.current._handler(f.ctx,args));
    return result;
  };
  const lobby=new PvpLobbyController(u.scene,{env:{DEV:true},documentRef:u.documentRef});
  setPvpEnabled(true);t.after(()=>setPvpEnabled(false));
  await lobby.acquire('create');
  const snapshot=()=>backend.current._handler(f.ctx,{...f.args(0),matchId:lobby.matchId});
  u.callbacks[0](await snapshot());await Promise.resolve();
  const check=team=>{
    const index=team==='A'?0:1;
    assert.equal(lobby.matchState.hostPlayerId,'p0');
    assert.match(lobby.teams.children[index].children[1].textContent,/Name 0.*HOST.*YOU/);
    const rows=lobby.teams.children.flatMap(section=>section.children);
    assert.equal(rows.filter(row=>row.textContent.includes('HOST')).length,1);
    assert.equal(lobby.startButton.hidden,false);
    assert.equal(lobby.matchState.state,'waiting');
  };
  check('A');
  for(const team of ['B','A','B']){await lobby.chooseTeam(team);check(team);}
  await backend.join._handler(f.ctx,{...f.args(1),code:lobby.copyInput.value});
  u.callbacks[0](await snapshot());await Promise.resolve();
  assert.equal(lobby.startButton.disabled,false);
  await lobby.start();assert.equal(f.tables.pvpMatches[0].state,'countdown');
  lobby.transferred=true;lobby.close();assert.equal(u.subscriptions(),0);
});

test('non-host switching teams remains a guest in the lobby UI',async t=>{
  const u=ui(t);u.presence.identity={playerId:'b',sessionId:'sb'};
  const lobby=new PvpLobbyController(u.scene,{documentRef:u.documentRef,resumeMatchId:'match-a'});
  for(const team of ['B','A','B']){
    u.callbacks[0]({...u.state,participants:u.state.participants.map(p=>p.playerId==='b'?{...p,team}:p)});
    await Promise.resolve();
    const rows=lobby.teams.children.flatMap(section=>section.children);
    assert.equal(rows.filter(row=>row.textContent.includes('HOST')).length,1);
    assert.match(rows.find(row=>row.textContent.includes('HOST')).textContent,/Player 0/);
    assert.doesNotMatch(rows.find(row=>row.textContent.includes('YOU')).textContent,/HOST/);
    assert.equal(lobby.startButton.hidden,true);
  }
  await lobby.start();assert.equal(u.calls.length,0);lobby.close();
});

test('PvP join works with toggle OFF without enabling it; cancelled pending create releases late result',async t=>{
  const f=ui(t);setPvpEnabled(false);
  const lobby=new PvpLobbyController(f.scene,{env:{DEV:true},documentRef:f.documentRef});lobby.renderJoin();
  assert.equal(lobby.buttons.some(b=>b.textContent==='Create PvP Lobby'),false);
  await lobby.acquire('join',' abc234 ');assert.equal(f.calls[0].args.code,'ABC234');assert.equal(pvpEnabled({DEV:true}),false);
  lobby.close();assert.equal(f.scene.input.keyboard.enabled,true);
  setPvpEnabled(true);let resolve;f.presence.client.mutation=(fn,args)=>{f.calls.push({fn,args});return fn==='create'?new Promise(done=>resolve=done):Promise.resolve({});};
  const other=new PvpLobbyController(f.scene,{env:{DEV:true},documentRef:f.documentRef});
  const pending=other.acquire('create');other.close();resolve({matchId:'late',code:'ABC234'});await pending;
  assert.equal(f.calls.at(-1).fn,'leave');assert.equal(f.calls.at(-1).args.matchId,'late');assert.equal(f.travel.length,0);
  setPvpEnabled(false);
});

test('client timer cannot start, respawn or finish combat; closed callbacks stay ignored',async t=>{
  const f=ui(t);let state;
  const client=new PvpMatchClient(f.presence,'match-a',s=>state=s);
  const now=Date.now();f.callbacks[0]({...f.state,state:'countdown',startedAt:now+3000,endsAt:now+183000});await Promise.resolve();
  assert.equal(state.state,'countdown');t.mock.method(Date,'now',()=>now+3100);
  for(const tick of f.ticks)tick();assert.equal(state.state,'countdown');assert.equal(f.calls.length,0);
  client.close();f.callbacks[0](f.state);await Promise.resolve();assert.equal(state.state,'countdown');assert.equal(f.subscriptions(),0);
});

test('match adapter serializes hit commands and cancels queued combat after leaving',async t=>{
  const f=ui(t);let resolve,active=0,max=0;
  f.presence.client.mutation=async(fn,args)=>{active++;max=Math.max(max,active);f.calls.push({fn,args});if(fn==='hit')await new Promise(done=>resolve=done);active--;};
  f.presence.api.pvpMatches.hit='hit';const c=new PvpMatchClient(f.presence,'m',()=>{});
  const one=c.request('hit',{shot:1}),two=c.request('hit',{shot:2});await Promise.resolve();await Promise.resolve();
  assert.equal(f.calls.length,1);c.close();const leaving=c.request('leave');resolve();await Promise.all([one,two,leaving]);
  assert.equal(max,1);assert.deepEqual(f.calls.map(c=>c.fn),['hit','leave']);
});

test('direct shots are consumed by teammates without hit reports; enemies and cover still collide',()=>{
  const hits=[],handlers={};
  const dot=()=>({setDepth(){return this;},setScale(){return this;},setRotation(){return this;},setPosition(){return this;},destroy(){}});
  const scene={source:{layers:[{name:'Collision',type:'objectgroup',objects:[]}]},player:{x:0,y:22},
    input:{on:(name,fn)=>handlers[name]=fn,off:name=>delete handlers[name]},add:{circle:dot},
    remotes:{players:new Map([['b',{sprite:{x:70,y:22}}],['friend',{sprite:{x:30,y:22}}]])}};
  const c=new PvpCombatController(scene,hit=>hits.push(hit));
  const m=advanceMatch(startMatch(match(),0),4000);m.participants.push(newFighter({playerId:'friend',team:'A'}));
  c.update(m,m.participants[0],0,4000);assert.equal(c.fire({x:100,y:0},4000),true);
  c.update(m,m.participants[0],250,4250);assert.equal(hits.length,0);assert.equal(c.shots.length,0);
  assert.equal(m.participants[2].hp,100);assert.deepEqual(m.scores,{A:0,B:0});
  scene.remotes.players.get('friend').sprite.y=200;
  c.fire({x:100,y:0},4500);c.update(m,m.participants[0],250,4750);
  assert.equal(hits.length,1);assert.equal(hits[0].victimId,'b');
  c.update(m,m.participants[0],250,4800);assert.equal(hits.length,1);
  c.walls=[{x:20,y:-50,width:10,height:100}];c.fire({x:100,y:0},5000);c.update(m,m.participants[0],250,5250);
  assert.equal(hits.length,1);
  c.update({...m,state:'ended'},m.participants[0],0,5000);assert.equal(c.fire({x:100,y:0},5000),false);
  c.destroy();assert.equal(handlers.pointerdown,undefined);
});

test('HUD consumes match scores and displays result/respawn without changing state',t=>{
  const f=ui(t),hud=new PvpHud({documentRef:f.documentRef,onLeave(){},onEnd(){},dev:false});
  const m=startMatch(f.state,1000);hud.render(m,m.participants[0],2000);assert.equal(hud.result.textContent,'2');
  const ended=endMatch({...m,scores:{A:5,B:1}},5000,'score-limit');hud.render(ended,ended.participants[0],5000);
  assert.equal(hud.result.textContent,'TEAM A WINS');assert.match(hud.score.textContent,/5.*1/);assert.equal(hud.diagnostics,undefined);
  hud.destroy();assert.equal(hud.root.removed,true);
});

async function runningFixture(t,count){
  const f=fixture(t),lobby=await backend.create._handler(f.ctx,f.args(0));
  f.member=i=>({...f.args(i),matchId:lobby.matchId});f.lobby=lobby;
  for(let i=1;i<count;i++)await backend.join._handler(f.ctx,{...f.args(i),code:lobby.code});
  await backend.start._handler(f.ctx,f.member(0));
  for(let i=0;i<count;i++)await update._handler(f.ctx,f.move(i,pvpRoom(lobby.matchId)));
  f.setTime(104000);await f.ctx.db.patch(lobby.matchId,advanceMatch(f.tables.pvpMatches[0],104000));return f;
}

test('full combat mirror copies authoritative death/score/respawn once, without recomputing',async t=>{
  const f=await runningFixture(t,2),m=f.tables.pvpMatches[0];
  await backend.acquireRealtimeCombat._handler(f.ctx,{matchId:m._id,round:0,authorityId:'test-relay'});
  const snapshot=combatSnapshot({...m,scores:{A:1,B:0},participants:m.participants.map(p=>p.playerId==='p1'?{...p,hp:0,deaths:1,respawnAt:106500}:p)});
  const args={matchId:m._id,round:0,authorityId:'test-relay',expectedRevision:0,revision:1,snapshot};
  assert.equal((await backend.mirrorRealtimeCombat._handler(f.ctx,args)).applied,true);
  const writes=f.writes.length;assert.deepEqual(await backend.mirrorRealtimeCombat._handler(f.ctx,args),{applied:true,duplicate:true});
  assert.equal(f.writes.length,writes);assert.deepEqual(m.scores,{A:1,B:0});assert.equal(m.participants[1].deaths,1);
  f.setTime(108500);let state=await backend.realtimeState._handler(f.ctx,{matchId:m._id});
  assert.equal(state.participants[1].hp,0,'time passing in Convex cannot respawn');
  snapshot.players[1]={...snapshot.players[1],hp:100,life:1,respawnAt:null};
  assert.equal((await backend.mirrorRealtimeCombat._handler(f.ctx,{...args,expectedRevision:1,revision:2})).applied,true);
  state=await backend.realtimeState._handler(f.ctx,{matchId:m._id});assert.equal(state.participants[1].life,1);
  assert.equal(JSON.stringify(state).includes('sessionId'),false);assert.equal(state.participants[1].presenceRoom,pvpRoom(m._id));
});

test('combat mirror requires the bound relay and round; competing authority and revision gaps are rejected',async t=>{
  const f=await runningFixture(t,2),m=f.tables.pvpMatches[0],args={matchId:m._id,round:0,authorityId:'test-relay'};
  await backend.acquireRealtimeCombat._handler(f.ctx,args);
  await assert.rejects(backend.acquireRealtimeCombat._handler(f.ctx,{...args,authorityId:'other'}),/authority/);
  for(const extra of [{authorityId:'other'},{round:1},{expectedRevision:1,revision:2}])
    assert.equal((await backend.mirrorRealtimeCombat._handler(f.ctx,{...args,expectedRevision:0,revision:1,snapshot:combatSnapshot(m),...extra})).applied,false);
  assert.equal(m.damageRevision,0);assert.equal(backend.mirrorRealtimeCombat.isInternal,true);
});

for(const [count,leaving,expected,reason,a,b] of [
  [4,3,'active',null,2,1],[3,2,'active',null,1,1],
  [3,1,'ended','team_empty',2,0],[2,1,'ended','team_empty',1,0],
  [4,0,'ended','host_left',1,2],
])test(`${count} players: leaving p${leaving} yields ${a}v${b}, ${expected} ${reason??''}`,async t=>{
  const f=await runningFixture(t,count);
  await backend.leave._handler(f.ctx,f.member(leaving));
  const saved=structuredClone(f.tables.pvpMatches[0]);
  assert.equal(saved.state,expected);assert.equal(saved.reason,reason);
  assert.equal(saved.participants.filter(p=>p.team==='A').length,a);
  assert.equal(saved.participants.filter(p=>p.team==='B').length,b);
  assert.equal(saved.participants.some(p=>p.playerId===`p${leaving}`),false);
  f.setTime(105000);await backend.leave._handler(f.ctx,f.member(leaving));
  assert.deepEqual(f.tables.pvpMatches[0],saved,'duplicate leave cannot remove twice or restart the end clock');
  const current=await backend.current._handler(f.ctx,f.member(leaving===0?1:0));
  assert.equal(current.reason,reason);assert.equal(current.state,expected);
  if(expected==='ended'){assert.equal(saved.winner,null);assert.ok(saved.participants.every(p=>p.respawnAt===null));}
});

test('expired non-host presence prunes only that participant, while host expiry ends and persists once',async t=>{
  const f=await runningFixture(t,4);
  f.tables.players[3].lastSeen=0;
  let state=await backend.current._handler(f.ctx,f.member(0));
  assert.equal(state.state,'active');assert.equal(state.participants.length,3);
  f.tables.players[0].lastSeen=0;
  state=await backend.current._handler(f.ctx,f.member(1));assert.equal(state.reason,'host_left');
  await backend.finish._handler(f.ctx,f.member(1));
  const at=f.tables.pvpMatches[0].endedAt;
  // The host remains expired; another end acknowledgement cannot change the first end time.
  await backend.finish._handler(f.ctx,f.member(1));assert.equal(f.tables.pvpMatches[0].endedAt,at);
  assert.equal(await backend.returnToLobby._handler(f.ctx,f.member(1)),null);
});

test('death/leave race removes pending respawn and cannot grant a second kill or late damage',async t=>{
  const f=await runningFixture(t,4);
  for(let shot=1;shot<=10;shot++){f.setTime(104000+shot*500);assert.equal((await serverHit(f,'p0','p3',shot)).applied,true);}
  assert.equal(f.tables.pvpMatches[0].scores.A,1);
  assert.ok(f.tables.pvpMatches[0].participants.find(p=>p.playerId==='p3').respawnAt);
  await backend.leave._handler(f.ctx,f.member(3));
  assert.equal((await serverHit(f,'p0','p3',11)).applied,false);
  assert.equal(f.tables.pvpMatches[0].scores.A,1);
  assert.equal(f.tables.pvpMatches[0].participants.some(p=>p.playerId==='p3'),false);
  await backend.leave._handler(f.ctx,f.member(1));
  assert.equal((await serverHit(f,'p0','p1',12)).applied,false);
  assert.equal(f.tables.pvpMatches[0].reason,'team_empty');
  assert.equal(f.tables.pvpMatches[0].scores.A,1);
});

test('survivors return to the same lobby once, with accurate counts and stale-round protection',async t=>{
  const f=await runningFixture(t,3);
  await backend.leave._handler(f.ctx,f.member(1));f.setTime(114000);
  const result=await backend.returnToLobby._handler(f.ctx,{...f.member(0),round:0});
  assert.equal(result.matchId,f.lobby.matchId);
  assert.deepEqual(await backend.returnToLobby._handler(f.ctx,{...f.member(2),round:0}),result);
  const saved=f.tables.pvpMatches[0];assert.equal(f.tables.pvpMatches.length,1);
  assert.equal(saved.state,'waiting');assert.equal(saved.round,1);assert.equal(saved.code,f.lobby.code);
  assert.equal(saved.participants.length,2);assert.ok(saved.participants.every(p=>p.life===1&&p.hp===100&&p.respawnAt===null));
  await backend.leave._handler(f.ctx,{...f.member(0),round:0});assert.equal(saved.participants.length,2);
  await backend.join._handler(f.ctx,{...f.args(3),code:f.lobby.code});
  await assert.rejects(backend.start._handler(f.ctx,{...f.member(0),round:1}),/return from the arena/);
  // Presence updates remain allowed during the brief reset-to-room-transition window.
  await update._handler(f.ctx,f.move(0,pvpRoom(f.lobby.matchId)));
  for(const i of [0,2])await update._handler(f.ctx,f.move(i,'school'));
  await backend.start._handler(f.ctx,{...f.member(0),round:1});
  await assert.rejects(backend.hit._handler(f.ctx,{...f.member(0),round:0,victimId:'p3',victimLife:0,attackerLife:0,shot:5}),/round/);
  await assert.rejects(backend.finish._handler(f.ctx,{...f.member(0),round:0,force:true}),/round/);
  assert.equal(saved.state,'countdown');
});

test('missing/expired lobbies and host departure return no resumable lobby; stale sessions cannot reset it',async t=>{
  const f=await runningFixture(t,2);
  await backend.leave._handler(f.ctx,f.member(0));
  assert.equal(await backend.returnToLobby._handler(f.ctx,f.member(1)),null);
  await assert.rejects(backend.returnToLobby._handler(f.ctx,{...f.member(1),sessionId:'old'}),/CHARACTER_SESSION_LOST/);
  await f.ctx.db.delete(f.lobby.matchId);
  assert.equal(await backend.current._handler(f.ctx,f.member(1)),null);
  assert.equal(await backend.returnToLobby._handler(f.ctx,f.member(1)),null);
});

test('return flow waits ten seconds, sends once and chooses existing lobby or safe normal exit',async()=>{
  for(const result of [{matchId:'existing'},null]){
    const calls=[],returns=[],state=endMatch({...match(),round:2},1000,'team_empty');
    const flow=new PvpReturnFlow(async(...args)=>{calls.push(args);return result;},id=>returns.push(id));
    flow.update(state,1000);assert.equal(flow.remaining(1000),10);assert.equal(calls.length,0);
    flow.update(state,10999);assert.equal(flow.remaining(10999),1);
    flow.update(state,11000);flow.update(state,11000);await flow.pending;
    assert.equal(calls.length,1);assert.deepEqual(calls[0],['returnToLobby',{round:2}]);
    assert.deepEqual(returns,[result?.matchId??null]);flow.update(state,20000);assert.equal(calls.length,1);flow.close();
  }
});

test('closing/late callbacks cannot return twice; hung return falls back and releases late membership',async()=>{
  const state=endMatch(match(),1000,'host_left');
  for(const manualClose of [false,true]){
    let resolve;const returns=[],calls=[];
    const flow=new PvpReturnFlow((action,args)=>{calls.push({action,args});return action==='returnToLobby'?new Promise(done=>resolve=done):Promise.resolve();},id=>returns.push(id));
    flow.update(state,11000);await Promise.resolve();
    if(manualClose)flow.close();else flow.update(state,16000);
    resolve({matchId:'late'});await flow.pending;
    assert.deepEqual(returns,manualClose?[]:[null]);
    assert.equal(calls.at(-1).action,'leave');assert.equal(calls.at(-1).args.round,1);
    flow.close();flow.update(state,30000);assert.equal(returns.length,manualClose?0:1);
  }
});

test('return flow handles absent lobby, server-reset waiting state and skips ordinary victories',async()=>{
  for(const state of [null,{...match(),round:1}]){
    const returns=[],flow=new PvpReturnFlow(async()=>null,id=>returns.push(id));
    flow.update(state,1000);flow.update(state,11000);await flow.pending;
    assert.deepEqual(returns,[null]);flow.close();
  }
  const flow=new PvpReturnFlow(()=>assert.fail('ordinary result must not auto-return'),()=>assert.fail());
  flow.update(endMatch(match(),0,'score-limit'),50000);assert.equal(flow.remaining(50000),null);
});

test('client presence deadlines detect disconnect without polling and cached active results cannot restart an ended round',async t=>{
  const f=ui(t);let now=5000,state;
  t.mock.method(Date,'now',()=>now);
  const active={...advanceMatch(startMatch(f.state,0),5000),round:0};
  active.participants[0].presenceExpiresAt=100000;active.participants[1].presenceExpiresAt=6000;
  const client=new PvpMatchClient(f.presence,'match-a',s=>state=s);
  f.callbacks[0](active);await Promise.resolve();assert.equal(state.state,'active');
  now=6000;client.tick();assert.equal(state.reason,'team_empty');assert.equal(state.endedAt,6000);
  now=9000;client.tick();assert.equal(state.endedAt,6000);assert.equal(f.calls.length,0);
  f.callbacks[0](active);await Promise.resolve();assert.equal(state.state,'ended');
  f.callbacks[0]({...f.state,round:1,participants:[active.participants[0]]});await Promise.resolve();
  assert.equal(state.state,'waiting');client.close();
});

test('client uses Convex server time for match deadlines when the local wall clock is ahead',async t=>{
  const f=ui(t);let state,monotonic=1000;t.mock.method(Date,'now',()=>500000);
  const active={...advanceMatch(startMatch(f.state,0),4000),state:'active',round:0,serverNow:100000,
    expiresAt:700000,participants:f.state.participants.map(p=>({...p,presenceExpiresAt:p.playerId==='a'?300000:160000}))};
  const client=new PvpMatchClient(f.presence,'match-a',next=>state=next,()=>{}, {monotonicNow:()=>monotonic});
  f.callbacks[0](active);await Promise.resolve();
  assert.equal(state.state,'active');
  monotonic+=61000;client.tick();
  assert.equal(state.state,'ended');assert.equal(state.reason,'team_empty');client.close();
});

test('resumed lobby keeps code/counts and highlights selected Team B and YOU independently of HOST',async t=>{
  const f=ui(t);f.presence.identity.playerId='b';
  const lobby=new PvpLobbyController(f.scene,{env:{DEV:true},documentRef:f.documentRef,resumeMatchId:'match-a'});
  assert.equal(f.calls.length,0);assert.equal(f.subscriptions(),1);
  f.callbacks[0]({...f.state,round:1});await Promise.resolve();
  assert.equal(lobby.copyInput.value,'ABC234');assert.equal(lobby.teams.children.length,2);
  assert.doesNotMatch(lobby.teams.children[0].className,/selected/);assert.match(lobby.teams.children[1].className,/selected/);
  assert.match(lobby.teams.children[0].children[1].textContent,/HOST/);assert.doesNotMatch(lobby.teams.children[0].children[1].textContent,/YOU/);
  assert.match(lobby.teams.children[1].children[1].textContent,/YOU/);assert.equal(lobby.startButton.hidden,true);
  lobby.close();assert.equal(f.subscriptions(),0);assert.equal(f.calls.at(-1).args.round,1);
});

test('interruption HUD explains the empty team and displays a visible return countdown',t=>{
  const f=ui(t),hud=new PvpHud({documentRef:f.documentRef,onLeave(){}});
  const m=endMatch({...f.state,participants:[f.state.participants[0]]},1000,'team_empty');
  hud.render(m,m.participants[0],1000,10);
  assert.match(hud.result.textContent,/Team B has no remaining players/);assert.doesNotMatch(hud.result.textContent,/WINS/);
  assert.equal(hud.returnTimer.textContent,'Returning in 10...');assert.equal(hud.leave.textContent,'Leave now');
  hud.render(m,m.participants[0],11000,0);assert.equal(hud.returnTimer.textContent,'Returning in 0...');hud.destroy();
});

for(const endedReason of [null,'score-limit','timer','dev-ended'])
test(`host departure ${endedReason?'after '+endedReason:'during active match'} reaches survivor, freezes clock and returns once`,async t=>{
  const f=await runningFixture(t,2);
  if(endedReason){
    const ended=endMatch({...f.tables.pvpMatches[0],scores:{A:2,B:5}},104000,endedReason);
    await f.ctx.db.patch(f.lobby.matchId,ended);
  }
  const initial=await backend.current._handler(f.ctx,f.member(1));
  const u=ui(t);u.presence.identity={playerId:'p1',sessionId:'s1'};
  let state,cleanups=0;const returnCalls=[],returns=[],cleared=[];
  t.mock.method(globalThis,'clearInterval',id=>cleared.push(id));
  const client=new PvpMatchClient(u.presence,f.lobby.matchId,next=>state=next);
  const hud=new PvpHud({documentRef:u.documentRef,onLeave(){}});
  const flow=new PvpReturnFlow(async(action,args)=>{
    returnCalls.push({action,args});return backend.returnToLobby._handler(f.ctx,{...f.member(1),...args});
  },id=>{returns.push(id);client.close();flow.close();hud.destroy();cleanups++;});
  t.after(()=>{client.close();flow.close();hud.destroy();});
  u.callbacks[0](initial);await Promise.resolve();flow.update(state,104000);
  assert.equal(flow.remaining(104000),null);assert.equal(u.subscriptions(),1);
  f.setTime(109000);await backend.leave._handler(f.ctx,f.member(0));
  const departed=await backend.current._handler(f.ctx,f.member(1));
  assert.equal(departed.state,'ended');assert.equal(departed.reason,'host_left');assert.equal(departed.endedAt,109000);
  assert.deepEqual(departed.scores,initial.scores);assert.equal(departed.winner,initial.winner);
  u.callbacks[0](departed);await Promise.resolve();flow.update(state,109000);
  assert.equal(flow.remaining(109000),10);assert.equal(u.subscriptions(),1,'match listener survives the result');
  hud.render(state,state.participants[0],109000,flow.remaining(109000));
  assert.match(hud.result.textContent,/host left/);assert.equal(hud.returnTimer.textContent,'Returning in 10...');
  const frozenTimer=hud.timer.textContent;
  // A cached active or ordinary-result callback cannot undo host departure.
  u.callbacks[0](initial);await Promise.resolve();assert.equal(state.reason,'host_left');
  f.setTime(114000);await backend.leave._handler(f.ctx,f.member(0));
  u.callbacks[0](await backend.current._handler(f.ctx,f.member(1)));await Promise.resolve();
  flow.update(state,114000);hud.render(state,state.participants[0],114000,flow.remaining(114000));
  assert.equal(flow.remaining(114000),5);assert.equal(hud.timer.textContent,frozenTimer);
  assert.equal(returnCalls.length,0);
  f.setTime(119000);flow.update(state,119000);flow.update(state,119000);await flow.pending;
  assert.deepEqual(returns,[null]);assert.equal(returnCalls.length,1);assert.equal(cleanups,1);
  assert.equal(u.subscriptions(),0);assert.equal(cleared.length,1);
  client.close();flow.update(state,125000);u.callbacks[0](initial);await Promise.resolve();
  assert.equal(returnCalls.length,1);assert.equal(cleanups,1);assert.equal(cleared.length,1);
});

for(const reason of ['score-limit','timer','dev-ended'])
test(`last opponent leaves after ${reason}: winning host gets one full return countdown`,async t=>{
  const f=await runningFixture(t,2);
  await f.ctx.db.patch(f.lobby.matchId,endMatch({...f.tables.pvpMatches[0],scores:{A:5,B:0}},104000,reason));
  const initial=await backend.current._handler(f.ctx,f.member(0)),u=ui(t);
  u.presence.identity=f.args(0);let state,cleanups=0;const returns=[],calls=[];
  const client=new PvpMatchClient(u.presence,f.lobby.matchId,next=>state=next);
  const hud=new PvpHud({documentRef:u.documentRef,onLeave(){}});
  const flow=new PvpReturnFlow(async(action,args)=>{
    calls.push(action);return backend.returnToLobby._handler(f.ctx,{...f.member(0),...args});
  },id=>{returns.push(id);client.close();flow.close();cleanups++;});
  t.after(()=>{client.close();flow.close();hud.destroy();});
  u.callbacks[0](initial);await Promise.resolve();flow.update(state,104000);
  assert.equal(flow.remaining(104000),null,'ordinary victory alone keeps the existing manual-exit flow');
  f.setTime(109000);await backend.leave._handler(f.ctx,f.member(1));
  const departed=await backend.current._handler(f.ctx,f.member(0));
  assert.equal(departed.reason,'team_empty');assert.equal(departed.endedAt,109000);
  assert.equal(departed.hostPlayerId,'p0');assert.equal(departed.participants.length,1);
  assert.deepEqual(departed.scores,initial.scores);assert.equal(departed.winner,initial.winner);
  u.callbacks[0](departed);await Promise.resolve();flow.update(state,109000);
  hud.render(state,state.participants[0],109000,flow.remaining(109000));
  assert.equal(hud.returnTimer.textContent,'Returning in 10...');
  const frozenClock=hud.timer.textContent;
  u.callbacks[0](initial);await Promise.resolve();
  assert.equal(state.reason,'team_empty');assert.equal(state.participants.length,1);
  f.setTime(114000);await backend.leave._handler(f.ctx,f.member(1));
  u.callbacks[0](await backend.current._handler(f.ctx,f.member(0)));await Promise.resolve();
  flow.update(state,114000);hud.render(state,state.participants[0],114000,flow.remaining(114000));
  assert.equal(flow.remaining(114000),5);assert.equal(hud.timer.textContent,frozenClock);
  assert.equal(calls.length,0);assert.equal(u.subscriptions(),1);
  f.setTime(119000);flow.update(state,119000);flow.update(state,119000);await flow.pending;
  assert.deepEqual(returns,[f.lobby.matchId]);assert.equal(cleanups,1);assert.deepEqual(calls,['returnToLobby']);
  assert.equal(u.subscriptions(),0);assert.equal(f.tables.pvpMatches[0].state,'waiting');
  assert.equal(f.tables.pvpMatches[0].round,1);assert.equal(f.tables.pvpMatches[0].hostPlayerId,'p0');
  flow.update(state,125000);u.callbacks[0](initial);await Promise.resolve();assert.equal(cleanups,1);
});

test('non-host departure after victory does not interrupt when both teams still have members',async t=>{
  const f=await runningFixture(t,4);
  await f.ctx.db.patch(f.lobby.matchId,endMatch({...f.tables.pvpMatches[0],scores:{A:5,B:0}},104000,'score-limit'));
  f.setTime(109000);await backend.leave._handler(f.ctx,f.member(3));
  const state=await backend.current._handler(f.ctx,f.member(0));
  assert.equal(state.reason,'score-limit');assert.equal(state.endedAt,104000);assert.equal(state.winner,'A');
});

test('host presence expiry after a completed match starts one stable departure countdown without polling',async t=>{
  const f=await runningFixture(t,2);
  await f.ctx.db.patch(f.lobby.matchId,endMatch(f.tables.pvpMatches[0],104000,'score-limit'));
  const initial=await backend.current._handler(f.ctx,f.member(1)),u=ui(t);let state;
  const client=new PvpMatchClient(u.presence,f.lobby.matchId,s=>state=s);
  t.after(()=>client.close());
  u.callbacks[0](initial);await Promise.resolve();
  f.setTime(164000);f.tables.players[0].lastSeen=104000;
  client.tick();assert.equal(state.reason,'host_left');assert.equal(state.endedAt,164000);
  f.setTime(165000);client.tick();assert.equal(state.endedAt,164000);
  u.callbacks[0](await backend.current._handler(f.ctx,f.member(1)));await Promise.resolve();
  assert.equal(state.reason,'host_left');assert.equal(state.endedAt,164000);assert.equal(u.calls.length,0);
});
