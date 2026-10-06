import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { PvpRetryCoordinator } from '../src/pvp/PvpRetryCoordinator.js';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { PvpHud } from '../src/pvp/PvpHud.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { newFighter } from '../src/pvp/matchState.js';
import { validClientMessage,validServerMessage } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import * as backend from '../convex/pvpMatches.js';
import { PVP_MAP_DEFINITION } from '../src/pvp/config.js';
import { matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings } from '../src/pvp/matchSettings.js';
import { requirePvpMap } from '../src/pvp/mapConfig.js';
import { PvpReturnFlow } from '../src/pvp/PvpReturnFlow.js';

function clock(){
  let at=10000,serial=0;const jobs=new Map();
  return {jobs,now:()=>at,set(value){at=value;},schedule(fn,delay){const id=++serial;jobs.set(id,{fn,at:at+delay});return id;},cancel(id){jobs.delete(id);},
    tick(value){let count=0;for(;;){const entry=[...jobs].filter(([,j])=>j.at<=value).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;
      assert.ok(++count<20);const [id,j]=entry;jobs.delete(id);at=j.at;j.fn();}at=value;}};
}
const members=()=>['alice','bob'].map((playerId,i)=>newFighter({playerId,sessionId:`session-${playerId}`,displayName:playerId,characterBaseId:'felipe',team:i?'B':'A'}));
const base=()=>({_id:'match-a',arenaMap:PVP_MAP_DEFINITION,matchId:'match-a',room:'pvp-arena-test:match-a',code:'ABCDEF',mode:'tdm',round:0,damageRevision:0,
  state:'active',hostPlayerId:'alice',expiresAt:999999,createdAt:0,startedAt:0,endsAt:190000,endedAt:null,winner:null,reason:null,
  scores:{A:0,B:0},scoreLimit:5,timeLimitMs:180000,respawnMs:2500,participants:members()});
function votes(t,participants=members()){
  const time=clock(),resolved=[],changes=[];
  const retry=new PvpRetryCoordinator({...time,onChange:()=>changes.push(retry.snapshot()),onResolve:ids=>resolved.push(ids)});
  t.after(()=>retry.close());retry.begin(time.now(),participants);
  return {time,retry,resolved,changes};
}
test('unanimous Retry resolves immediately once, removes its single timer, and duplicate/unknown/late votes do nothing',async t=>{
  const f=votes(t);assert.equal(f.time.jobs.size,1);assert.equal(f.retry.vote('outsider'),false);
  assert.ok(f.retry.vote('bob'));assert.equal(f.resolved.length,0);assert.equal(f.retry.vote('bob'),false);
  assert.ok(f.retry.vote('alice'));assert.equal(f.retry.resolving,true);assert.equal(f.time.jobs.size,0);
  assert.equal(f.retry.vote('alice'),false);f.time.tick(25000);await f.retry.pending;
  assert.deepEqual(f.resolved,[['alice','bob']]);
});
test('deadline retains only Retry voters; absence of all votes retains nobody',async t=>{
  for(const yes of [true,false]){
    const f=votes(t);if(yes)f.retry.vote('alice');f.time.tick(19999);assert.equal(f.resolved.length,0);
    f.time.tick(20000);assert.equal(f.retry.vote('bob'),false);await f.retry.pending;
    assert.deepEqual(f.resolved,[yes?['alice']:[]]);assert.equal(f.time.jobs.size,0);
  }
});
test('Leave or disconnect removes that participant from unanimity; host has no special vote',async t=>{
  const f=votes(t);f.retry.vote('bob');f.retry.update([members()[1]]);await f.retry.pending;
  assert.deepEqual(f.resolved,[['bob']]);assert.deepEqual(f.retry.snapshot().activePlayerIds,['bob']);
});
test('lease expiry prunes stale votes and participants without polling, and closing cancels pending decisions',async t=>{
  const f=votes(t,members().map((p,i)=>({...p,presenceExpiresAt:i?11000:99999})));
  f.retry.vote('alice');assert.equal(f.time.jobs.size,1);f.time.tick(11000);await f.retry.pending;
  assert.deepEqual(f.resolved,[['alice']]);
  const closed=votes(t);closed.retry.close();closed.time.tick(999999);assert.deepEqual(closed.resolved,[]);
});
test('authority waits for the last combat mirror before resolving Retry; old-round votes and combat remain rejected',async t=>{
  const time=clock(),commits=[],resolved=[];let release;
  const authority=new PvpDamageAuthority(base(),{...time,authorityId:'relay-a',commit:args=>{commits.push(args);return new Promise(r=>release=r);},
    onRetryResolve:ids=>resolved.push(ids)});t.after(()=>authority.close());
  authority.register('alice','peer-a');authority.register('bob','peer-b');authority.requestEnd('peer-a');
  assert.equal(authority.requestRetry('peer-a',99),false);assert.ok(authority.requestRetry('peer-a',0));assert.ok(authority.requestRetry('peer-b',0));
  await Promise.resolve();assert.deepEqual(resolved,[]);assert.equal(commits[0].retryDeadline,20000);
  release({applied:true});await authority.retry.pending;assert.deepEqual(resolved,[['alice','bob']]);
  assert.equal(authority.movement('peer-a',{playerId:'alice',life:0}),false);
  // A new Convex generation may arrive before the relay sends its handoff.
  authority.sync({...base(),round:1});assert.equal(authority.closed,false);
});
test('Retry persistence failure cancels the vote timer and reports departure recovery instead of stranding the end screen',async t=>{
  const time=clock(),errors=[];
  const authority=new PvpDamageAuthority(base(),{...time,authorityId:'relay-a',commit:async()=>({applied:false}),
    onRetryResolve:()=>assert.fail('cannot reset after failed mirror'),onFailure:error=>errors.push(error)});
  t.after(()=>authority.close());authority.register('alice','peer-a');authority.register('bob','peer-b');authority.requestEnd('peer-a');
  await authority.queue;assert.equal(errors.length,1);assert.equal(authority.closed,true);assert.equal(time.jobs.size,0);
});

function database(t){
  const time=clock();t.mock.method(Date,'now',time.now);
  const old=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>{if(old===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=old;});
  let saved=base(),notify=()=>{};delete saved.matchId;delete saved.room;
  const rows=members().map((p,i)=>({_id:`row-${i}`,playerId:p.playerId,sessionId:p.sessionId,room:'pvp-arena-test:match-a',lastSeen:10000}));
  const ctx={db:{async get(id){return id==='match-a'?saved:rows.find(p=>p._id===id)??null;},
    async patch(id,data){assert.equal(id,'match-a');Object.assign(saved,structuredClone(data));await notify();},
    async delete(id){assert.equal(id,'match-a');saved=null;await notify();},
    query(){let filter;const q={withIndex(_name,build){const index={eq(key,value){filter=p=>p[key]===value;return index;}};build(index);return q;},
      async unique(){return rows.find(filter)??null;}};return q;}}};
  return {ctx,time,rows,get saved(){return saved;},setNotify(fn){notify=fn;}};
}
function endStored(f){Object.assign(f.saved,{state:'ended',combatAuthorityId:'relay-a',retryDeadline:20000,endedAt:10000,reason:'score-limit',winner:'A',scores:{A:5,B:2}});
  f.saved.participants=f.saved.participants.map(p=>({...p,hp:0,life:3,kills:2,deaths:3,lastShot:20,lastHitAt:9000}));}
const nextArgs=(ids,startedAt=13000)=>({matchId:'match-a',round:0,authorityId:'relay-a',playerIds:ids,startedAt});
test('stored next round keeps match/code/team/session, resets combat completely, increments life/round and is idempotent',async t=>{
  const f=database(t);endStored(f);const before=structuredClone(f.saved),args=nextArgs(['alice','bob']);
  const next=await backend.advanceRealtimeRound._handler(f.ctx,args);
  assert.equal(next.matchId,'match-a');assert.equal(next.code,before.code);assert.equal(next.round,1);assert.equal(next.state,'countdown');
  assert.equal(next.startedAt,13000);assert.equal(next.endsAt,193000);assert.deepEqual(next.scores,{A:0,B:0});
  assert.equal(next.endedAt,null);assert.equal(next.reason,null);assert.equal(next.winner,null);assert.equal(next.damageRevision,0);
  assert.equal(next.retryDeadline,undefined);assert.equal(next.combatAuthorityId,undefined);
  for(const [i,p] of f.saved.participants.entries()){
    assert.equal(p.sessionId,before.participants[i].sessionId);assert.equal(p.team,before.participants[i].team);assert.equal(p.life,4);
    for(const k of ['kills','deaths','lastShot','lastHitAt'])assert.equal(p[k],0);
    assert.equal(p.hp,100);assert.equal(p.respawnAt,null);
  }
  assert.equal(JSON.stringify(next).includes('sessionId'),false);
  const duplicate=await backend.advanceRealtimeRound._handler(f.ctx,args);assert.equal(duplicate.round,1);assert.equal(duplicate.participants[0].life,4);
  const mirror=await backend.mirrorRealtimeCombat._handler(f.ctx,{matchId:'match-a',round:0,authorityId:'relay-a',expectedRevision:0,revision:1,snapshot:{}});
  assert.deepEqual(mirror,{applied:false});
});
test('one Retry returns to waiting, transfers departed host only for lobby management, and concurrent stale sessions cannot continue',async t=>{
  for(const retained of [['bob'],['alice','bob']]){
    const f=database(t);endStored(f);
    if(retained.length===2)f.rows[0].sessionId='new-session';
    const next=await backend.advanceRealtimeRound._handler(f.ctx,nextArgs(retained));
    assert.equal(next.state,'waiting');assert.equal(next.hostPlayerId,'bob');assert.deepEqual(next.participants.map(p=>p.playerId),['bob']);
    assert.equal(next.startedAt,null);assert.equal(next.endsAt,null);
    await backend.leave._handler(f.ctx,{matchId:'match-a',playerId:'bob',sessionId:'session-bob',round:0});
    assert.equal(f.saved.participants.length,1,'old round Leave cannot remove the survivor');
  }
});
test('same-team survivors wait; no Retry removes abandoned lobby; client return cannot race the relay decision',async t=>{
  const f=database(t);endStored(f);f.saved.participants[1].team='A';
  assert.equal(await backend.returnToLobby._handler(f.ctx,{matchId:'match-a',playerId:'alice',sessionId:'session-alice',round:0}),null);
  assert.equal((await backend.advanceRealtimeRound._handler(f.ctx,nextArgs(['alice','bob']))).state,'waiting');
  const empty=database(t);endStored(empty);assert.equal(await backend.advanceRealtimeRound._handler(empty.ctx,nextArgs([],null)),null);assert.equal(empty.saved,null);
});
test('wrong relay, non-ended round and duplicate participant cannot reset a round',async t=>{
  const f=database(t);endStored(f);
  for(const change of [{authorityId:'other'},{round:1},{playerIds:['alice','alice']}])
    await assert.rejects(backend.advanceRealtimeRound._handler(f.ctx,{...nextArgs(['alice','bob']),...change}));
  f.saved.state='active';await assert.rejects(backend.advanceRealtimeRound._handler(f.ctx,nextArgs(['alice','bob'])));
});
test('concurrent Leave before the handoff cannot be revived or cause solo start, and unknown IDs are never added',async t=>{
  const f=database(t);endStored(f);
  await backend.leave._handler(f.ctx,{matchId:'match-a',playerId:'bob',sessionId:'session-bob',round:0});
  const next=await backend.advanceRealtimeRound._handler(f.ctx,nextArgs(['alice','bob','outsider']));
  assert.equal(next.state,'waiting');assert.deepEqual(next.participants.map(p=>p.playerId),['alice']);
});

async function waitFor(fn){const until=performance.now()+4000;while(!fn()){
  if(performance.now()>until)throw new Error('Retry relay timeout');await new Promise(r=>setTimeout(r,5));}}
async function connectedFixture(t){
  const f=database(t);t.mock.method(console,'debug',()=>{});
  const subscribers=new Set(),clients=[];let subscriptions=0,unsubscribed=0,resolutions=0;
  const publish=async()=>{
    const state=await backend.realtimeState._handler(f.ctx,{matchId:'match-a'});for(const cb of subscribers)cb(state);
    for(const c of clients)if(!c.closed){try{c.apply(c.damage.project(await backend.current._handler(f.ctx,c.args)));}
      catch(error){c.convexErrors.push(error);/* Scene deliberately awaits the relay handoff during Retry. */}}
  };
  f.setNotify(publish);
  const bridge={authenticate:args=>backend.current._handler(f.ctx,args),acquire:args=>backend.acquireRealtimeCombat._handler(f.ctx,args),
    commit:args=>backend.mirrorRealtimeCombat._handler(f.ctx,args),nextRound:args=>{resolutions++;return backend.advanceRealtimeRound._handler(f.ctx,args);},
    subscribe(_id,cb){subscriptions++;subscribers.add(cb);return ()=>{unsubscribed++;subscribers.delete(cb);};}};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:f.time.now,schedule:f.time.schedule,cancel:f.time.cancel,pvpBridge:bridge});await server.ready;
  t.after(async()=>{clients.forEach(c=>c.close());await server.close();});
  const initial=await backend.current._handler(f.ctx,{matchId:'match-a',playerId:'alice',sessionId:'session-alice'});
  for(const [i,playerId] of ['alice','bob'].entries()){
    const c={playerId,state:structuredClone(initial),messages:[],transitions:[],errors:[],convexErrors:[],movementCalls:[],
      args:{matchId:'match-a',playerId,sessionId:`session-${playerId}`}};
    const remotes={bufferOptions:{},players:new Map(),receive(){},receiveMovement:(...p)=>c.movementCalls.push(p)};
    const scene={source:{layers:[]},remotes,player:{x:i?1000:900,y:722},input:{on(){},off(){}},
      add:{circle(x,y){return {x,y,setDepth(){return this;},setPosition(x,y){Object.assign(this,{x,y});},destroy(){}};}}};
    c.transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:'pvp-match-a-0',WebSocketImpl:WebSocket});
    c.transport.onMessage(m=>c.messages.push(m));
    c.movement=new PvpMovementClient({matchId:'match-a',match:c.state,playerId,transport:c.transport,remotes,log:()=>{},
      getSpawn:p=>({x:p.team==='A'?900:1000,y:722}),snapshot:()=>null});
    c.combat=new PvpCombatController(scene,hit=>c.damage.attempt(hit),{onSpawn:p=>c.projectiles.sendSpawn(p),onRemove:p=>c.projectiles.sendDestroy(p)});
    c.projectiles=new PvpProjectileClient(c.movement,c.combat);
    c.apply=state=>{c.state=state;c.movement.setMatch(state);c.projectiles.setMatch(state);};
    c.close=()=>{if(c.closed)return;c.closed=true;c.damage.close();c.projectiles.close();c.movement.close();c.combat.destroy();};
    c.damage=new PvpDamageClient(c.movement,{matchId:'match-a',sessionId:c.args.sessionId,onState:c.apply,onError:e=>c.errors.push(e),onRound:next=>{
      c.transitions.push(next);
      if(!next?.participants.some(p=>p.playerId===playerId)||next.state==='waiting'){c.returnedLobby=next?.participants.some(p=>p.playerId===playerId)?next.matchId:null;c.close();return;}
      c.combat.clear();c.projectiles.reset();c.combat.life=undefined;c.combat.serial=0;c.combat.nextShotAt=0;
      c.state=next;c.movement.switchRound(next);c.projectiles.setMatch(next);
    }});
    clients.push(c);
  }
  await waitFor(()=>clients.every(c=>c.damage.authorized));
  return {...f,server,clients,publish,get saved(){return f.saved;},get counts(){return {subscriptions,unsubscribed,resolutions};}};
}
test('two real sockets repeat Retry rounds without reconnect/listener growth, reset sequence caches, and reject old events',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  const ids=f.clients.map(c=>c.transport.clientId),listeners=f.clients.map(c=>[c.transport.messageHandlers.size,c.transport.stateHandlers.size]);
  for(let round=0;round<3;round++){
    const oldRoom=a.movement.roomId;assert.ok(a.damage.requestEnd());await waitFor(()=>f.clients.every(c=>c.state.retry));
    assert.equal(a.movement.closed,false);assert.equal(a.projectiles.closed,false);
    const before=a.transport.seq;a.movement.update();assert.equal(a.transport.seq,before,'no movement during end screen');
    assert.ok(a.damage.requestRetry());assert.equal(a.damage.requestRetry(),false);
    await waitFor(()=>b.state.retry.playerIds.includes('alice'));assert.ok(b.damage.requestRetry());
    await waitFor(()=>f.saved.round===round+1&&f.clients.every(c=>c.damage.authorized&&c.movement.round===round+1));
    assert.equal(f.saved.state,'countdown');assert.equal(f.server.rooms.size,1);assert.equal(f.server.authorities.size,1);
    assert.equal(a.state.startedAt,f.time.now()+3000);assert.equal(a.state.endsAt,a.state.startedAt+180000);
    for(const [i,c] of f.clients.entries()){
      assert.equal(c.transport.clientId,ids[i]);assert.deepEqual([c.transport.messageHandlers.size,c.transport.stateHandlers.size],listeners[i]);
      assert.equal(c.state.retry,undefined);assert.equal(c.state.participants[i].life,round+1);assert.equal(c.state.participants[i].hp,100);
      assert.deepEqual(c.state.scores,{A:0,B:0});assert.equal(c.combat.shots.length,0);assert.equal(c.combat.remoteShots.size,0);
    }
    const previousCalls=b.movementCalls.length;
    b.transport.emitMessage({type:'pvp-movement',roomId:oldRoom,senderId:ids[0],seq:999999,payload:{playerId:'alice',life:round,x:999,y:722,vx:0,vy:0,direction:'right',moving:false,sampleSeq:99999}});
    assert.equal(b.movementCalls.length,previousCalls);
    // Delay metadata/transition from the old round: neither can undo the handoff.
    assert.equal(a.damage.project({...base(),round}).round,round+1);
    a.transport.emitMessage({type:'pvp-round-transition',roomId:oldRoom,payload:{fromRound:round,match:null}});assert.equal(a.closed,undefined);
    f.time.set(a.state.startedAt);f.server.authorities.get(a.movement.roomId).authority.advance();
    await waitFor(()=>a.state.state==='active'&&b.state.state==='active');
    a.transport.sendUnreliable('pvp-movement',{playerId:'alice',life:round+1,sampleSeq:1,x:900,y:722,vx:0,vy:0,direction:'right',moving:false});
    await waitFor(()=>b.movementCalls.length>previousCalls);
    a.transport.sendReliable('pvp-projectile-spawn',{projectileId:`old-${round}`,playerId:'alice',life:round,shotSeq:999,x:900,y:700,vx:420,vy:0,ttlMs:1200});
    a.transport.sendReliable('pvp-hit-attempt',{projectileId:`old-${round}`,targetId:'bob',targetLife:round});
    await waitFor(()=>a.messages.some(m=>m.type==='pvp-hit-result'&&m.payload.projectileId===`old-${round}`));
    assert.equal(f.server.authorities.get(a.movement.roomId).authority.projectiles.has(`old-${round}`),false);
  }
  assert.equal(f.counts.resolutions,3);assert.equal(f.counts.subscriptions,4);assert.equal(f.counts.unsubscribed,3);
  assert.ok(f.clients.every(c=>c.errors.length===0));
});
test('real deadline: sole Retry voter returns to lobby while non-voter exits; departed host is not required',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  a.damage.requestEnd();await waitFor(()=>b.state.retry);assert.ok(b.damage.requestRetry());
  await waitFor(()=>a.state.retry.playerIds.includes('bob'));
  f.time.set(b.state.retry.deadline);f.server.authorities.get(a.movement.roomId).authority.updateRetry();
  await waitFor(()=>a.closed&&b.closed);
  assert.equal(a.returnedLobby,null);assert.equal(b.returnedLobby,'match-a');assert.equal(f.saved.state,'waiting');assert.equal(f.saved.hostPlayerId,'bob');
  assert.deepEqual(f.saved.participants.map(p=>p.playerId),['bob']);assert.equal(f.counts.resolutions,1);
});
test('real final-screen disconnect recalculates unanimity and returns remaining voter to waiting',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  a.damage.requestEnd();await waitFor(()=>b.state.retry);b.damage.requestRetry();await waitFor(()=>a.state.retry.playerIds.includes('bob'));
  a.close();await waitFor(()=>b.closed);assert.equal(b.returnedLobby,'match-a');assert.equal(f.saved.state,'waiting');assert.equal(f.saved.round,1);
});
test('active host leave: Convex-first departure keeps the survivor socket until the relay return handoff',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  await backend.leave._handler(f.ctx,a.args);
  assert.equal(b.movement.closed,false,'an ended membership echo must not disconnect the lifecycle listener');
  assert.equal(b.projectiles.closed,false);
  const sent=b.transport.seq;b.movement.update();assert.equal(b.transport.seq,sent,'keeping lifecycle open does not send movement after end');
  await waitFor(()=>b.state.retry);
  assert.equal(b.state.state,'ended');assert.equal(b.state.reason,'host_left');
  const room=b.movement.roomId,entry=f.server.authorities.get(room);
  a.close();await waitFor(()=>entry.authority.members.size===1);
  const before=b.messages.filter(m=>m.type==='pvp-combat-state').length;
  entry.authority.emit();await waitFor(()=>b.messages.filter(m=>m.type==='pvp-combat-state').length>before);
  assert.equal(f.time.jobs.size,1,'the relay keeps its own return timer after host departure');
  f.time.tick(b.state.retry.deadline);
  await waitFor(()=>b.closed);assert.equal(b.returnedLobby,null);
  assert.equal(f.saved,null);assert.equal(f.counts.resolutions,1);assert.equal(b.errors.length,0);
  assert.equal(f.time.jobs.size,0,'exit cancels the relay timer once');
});
test('active host disconnect: surviving Retry voter returns to waiting without host or extra listeners',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  const listenerCount=b.transport.messageHandlers.size;
  a.close();await waitFor(()=>b.state.retry);
  assert.equal(b.state.reason,'host_left');assert.equal(b.movement.closed,false);
  assert.equal(f.server.rooms.get(b.movement.roomId).size,1);
  assert.equal(b.transport.messageHandlers.size,listenerCount);
  assert.ok(b.damage.requestRetry());await waitFor(()=>b.closed);
  assert.equal(b.returnedLobby,'match-a');assert.equal(f.saved.state,'waiting');assert.equal(f.saved.hostPlayerId,'bob');
  assert.equal(f.counts.resolutions,1);assert.equal(b.errors.length,0);
});
test('active host leave: departed HP bar cleanup keeps frames, countdown and Leave UI running, then exits once',async t=>{
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'')
    .replaceAll('import.meta.env','{}').replace('export class PvpArenaScene','class PvpArenaScene');
  let now=10000,destroyed=0,returned=0,requested=0,closed=0;
  const Arena=runInNewContext(source+'\nPvpArenaScene;',{PvpMapScene:class{},Date,console,
    resolvedMovementState:()=>({moving:false,velocityX:0,velocityY:0})});
  const scene=Object.create(Arena.prototype),documentRef={createElement(){return {append(){},setAttribute(){},remove(){}};},body:{append(){}}};
  Object.assign(scene,{presence:{identity:{playerId:'bob'}},matchClient:{now:()=>now},pvpSettings:{maxHp:100},
    matchState:{...base(),state:'ended',reason:'host_left',endedAt:now,participants:[base().participants[1]]},lastLife:0,
    pvpRemoteHealthBars:new Map([['alice',{anchor:{},bar:{destroy:()=>destroyed++}}]]),
    player:{body:{},facing:'down',setAlpha(){return this;},setCombatHealth(){return this;},setVelocity(){},setFacing(){}},
    remotes:{players:new Map(),update(){}},combat:{update(){}},updatePvpHudHealth(){},
    damageClient:{close:()=>closed++},projectileClient:{close:()=>closed++},movementClient:{update(){},close:()=>closed++},
    returnDestination:{targetMap:'school'},travelTo(destination){assert.equal(destination.targetMap,'school');returned++;}});
  scene.pvpHud=new PvpHud({documentRef,onLeave:()=>scene.leavePvp()});
  scene.returnFlow=new PvpReturnFlow(async()=>{requested++;return null;},id=>scene.leavePvp(id));
  assert.doesNotThrow(()=>scene.update(0,16),'removing a departed player must not abort the Phaser frame');
  assert.equal(destroyed,1);assert.equal(scene.pvpRemoteHealthBars.size,0);
  assert.match(scene.pvpHud.result.textContent,/host left/);assert.match(scene.pvpHud.returnTimer.textContent,/10/);
  now+=1000;scene.update(0,16);assert.match(scene.pvpHud.returnTimer.textContent,/9/);
  now+=9000;scene.update(0,16);await scene.returnFlow.pending;
  assert.equal(returned,1);assert.equal(requested,1);assert.equal(closed,3);
  scene.pvpHud.leave.onclick();scene.update(0,16);assert.equal(returned,1,'late clicks/frames do not repeat exit cleanup');
});
test('real deadline with no votes deletes only the abandoned lobby and delivers normal exit to both clients',async t=>{
  const f=await connectedFixture(t),[a,b]=f.clients;
  a.damage.requestEnd();await waitFor(()=>b.state.retry);
  f.time.set(b.state.retry.deadline);f.server.authorities.get(a.movement.roomId).authority.updateRetry();
  await waitFor(()=>a.closed&&b.closed);
  assert.equal(f.saved,null);assert.equal(a.returnedLobby,null);assert.equal(b.returnedLobby,null);
  assert.ok(f.clients.every(c=>c.errors.length===0));
});
test('Retry protocol separates round intent and validates public handoff',()=>{
  const message={type:'pvp-retry',roomId:'pvp-match-a-0',seq:1,sentAt:1000,channel:'reliable',payload:{round:0}};
  assert.ok(validClientMessage(message));assert.equal(validClientMessage({...message,payload:{round:0,playerId:'other'}}),false);
  const next={...base(),state:'countdown',round:1,participants:members()};
  const event={type:'pvp-round-transition',roomId:'pvp-match-a-0',serverTime:1000,payload:{fromRound:0,match:next}};
  assert.ok(validServerMessage(event));assert.equal(validServerMessage({...event,payload:{fromRound:0,match:{...next,round:2}}}),false);
});
test('HUD displays independent confirmations, keeps Leave, and suppresses pending duplicate clicks',()=>{
  const documentRef={createElement(){return {append(){},setAttribute(){},remove(){}};},body:{append(){}}};let clicks=0,left=0;
  const hud=new PvpHud({documentRef,onRetry:()=>{clicks++;return true;},onLeave:()=>left++});
  const state={...base(),state:'ended',retry:{deadline:20000,activePlayerIds:['alice','bob'],playerIds:[],resolving:false}};
  hud.render(state,state.participants[0],11000);assert.equal(hud.retry.hidden,false);assert.match(hud.returnTimer.textContent,/9s/);
  hud.retry.onclick();hud.render(state,state.participants[0],11000);hud.retry.onclick();assert.equal(clicks,1);
  hud.render({...state,retry:{...state.retry,playerIds:['bob']}},state.participants[0],12000);assert.match(hud.retryStatus.textContent,/1\/2.*bob/);
  hud.leave.onclick();assert.equal(left,1);
  hud.render({...base(),round:1,state:'countdown'},state.participants[0],12000);assert.equal(hud.retry.hidden,true);
});
test('arena handoff resets spawns/combat once, keeps adapters, and returns a lone survivor to lobby',()=>{
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','{}').replace('export class PvpArenaScene','class PvpArenaScene');
  const calls=[];class MapScene{}class PvpReturnFlow{close(){} }
  const Arena=runInNewContext(source+'\nPvpArenaScene;',{PvpMapScene:MapScene,requirePvpMap,PvpReturnFlow,PVP_MAP:'pvp-arena-test',matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings,Date});
  const scene=Object.create(Arena.prototype);Object.assign(scene,{matchId:'match-a',matchClient:{},presence:{identity:{playerId:'alice'}},
    returnFlow:{close:()=>calls.push('close timer')},combat:{clear:()=>calls.push('clear combat'),update:()=>calls.push('countdown')},
    projectileClient:{reset:()=>calls.push('clear projectiles'),setMatch:()=>{}},movementClient:{switchRound:s=>calls.push(`room ${s.round}`)},
    player:{body:{},setAlpha(){return this;},setCombatHealth(){return this;}},placeAtSpawn:p=>calls.push(`spawn ${p.team}`),leavePvp:id=>calls.push(`leave ${id??''}`)});
  const next={...base(),state:'countdown',round:1,participants:members().map(p=>({...p,life:1}))};
  scene.applyNextRound(next);assert.deepEqual(calls,['close timer','clear combat','clear projectiles','spawn A','room 1','countdown']);
  assert.equal(scene.lastLife,1);assert.equal(scene.combat.serial,0);assert.equal(scene.combat.nextShotAt,0);assert.equal(scene.matchClient.snapshot,next);
  scene.applyNextRound({...next,state:'waiting',participants:[next.participants[0]]});assert.equal(calls.at(-1),'leave match-a');
});
test('relay error during Retry clears voting state so the existing ten-second exit flow can run',()=>{
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','{}').replace('export class PvpArenaScene','class PvpArenaScene');
  const Arena=runInNewContext(source+'\nPvpArenaScene;',{PvpMapScene:class{},PVP_MAP:'pvp-arena-test',Date,endMatch:m=>m});
  const scene=Object.create(Arena.prototype);let closed=0;
  Object.assign(scene,{matchState:{...base(),state:'ended',retry:{deadline:20000}},pvpHud:{status:{}},
    damageClient:{close:()=>closed++},movementClient:{close:()=>closed++},projectileClient:{close:()=>closed++}});
  scene.showPvpError(new Error('Relay unavailable'));
  assert.equal(scene.matchState.retry,undefined);assert.equal(scene.matchState.reason,'lobby_unavailable');assert.equal(closed,3);
});
