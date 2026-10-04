import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { combatSnapshot } from '../src/pvp/combatSnapshot.js';
import { newFighter } from '../src/pvp/matchState.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validClientMessage,validServerMessage } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';
import { PVP_MAP_DEFINITION } from '../src/pvp/config.js';

const match=()=>({arenaMap:PVP_MAP_DEFINITION,matchId:'match-a',room:'pvp-arena-test:match-a',round:0,damageRevision:0,state:'active',hostPlayerId:'alice',expiresAt:999999,
  startedAt:0,endsAt:999999,scores:{A:0,B:0},scoreLimit:5,respawnMs:2500,
  participants:[newFighter({playerId:'alice',team:'A'}),newFighter({playerId:'bob',team:'B'}),newFighter({playerId:'friend',team:'A'})]
    .map(p=>({...p,presenceRoom:'pvp-arena-test:match-a'}))});
const packet=(extra={})=>({authorityId:'authority-a',version:1,round:0,damageRevision:1,...combatSnapshot(match()),events:[],...extra,
  players:combatSnapshot(match()).players.map(p=>({...p,...extra.players?.find(q=>q.playerId===p.playerId)}))});
const shot=(extra={})=>({projectileId:'shot-one',playerId:'alice',life:0,shotSeq:1,x:100,y:200,vx:420,vy:0,ttlMs:1200,...extra});
const attempt=(extra={})=>({projectileId:'shot-one',targetId:'bob',targetLife:0,...extra});
function fixture(options={}){
  let now=10000;const commits=[],states=[],errors=[],logs=[];
  const authority=new PvpDamageAuthority(match(),{now:()=>now,authorityId:'authority-a',
    onState:s=>states.push(structuredClone(s)),onFailure:e=>errors.push(e),log:r=>logs.push(r),
    commit:async args=>{commits.push(args);return {applied:true};},...options});
  for(const [playerId,peerId,x,y] of [['alice','peer-a',100,222],['bob','peer-b',200,222],['friend','peer-f',200,422]]){
    assert.ok(authority.register(playerId,peerId));authority.movement(peerId,{playerId,life:0,x,y,moving:false});
  }
  return {authority,commits,states,errors,logs,setTime:n=>now=n,spawn(extra={}){return authority.spawn('peer-a',shot(extra));},
    hit(extra={}){return authority.attempt('peer-a',attempt(extra));}};
}

test('valid hit applies fixed server damage once and serializes one lifecycle commit',async()=>{
  const f=fixture();assert.ok(f.spawn());f.setTime(10200);
  assert.deepEqual(f.hit(),{projectileId:'shot-one',shooterId:'alice',targetId:'bob',accepted:true,reason:'accepted',damage:25,hpBefore:100,hpAfter:75});
  assert.equal(f.hit().reason,'projectile_consumed');
  await f.authority.queue;assert.equal(f.commits.length,1);assert.equal(f.commits[0].expectedRevision,0);
  assert.equal(f.states.at(-1).players.find(p=>p.playerId==='bob').hp,75);
  assert.equal(f.logs.filter(log=>['hit accepted','hit rejected'].includes(log.event)).length,2);
});

for(const [name,prepare,request,reason] of [
  ['nonexistent projectile',()=>{}, {},'unknown_projectile'],
  ['expired projectile',f=>{f.spawn();f.setTime(11200);}, {},'expired_projectile'],
  ['self hit',f=>f.spawn(),{targetId:'alice'},'self_hit'],
  ['friendly fire',f=>f.spawn(),{targetId:'friend'},'friendly_fire'],
  ['target in another room',f=>f.spawn(),{targetId:'outsider'},'inactive_target'],
  ['registered target left arena',f=>{f.spawn();f.authority.state.participants[1].presenceRoom='school';},{},'wrong_presence_room'],
  ['target disconnect',f=>{f.spawn();f.authority.remove('peer-b');}, {},'inactive_shooter'],
  ['dead target',f=>{f.spawn();f.authority.state.participants[1].hp=0;}, {},'inactive_target'],
  ['old target life',f=>{f.spawn();f.authority.state.participants[1].life=1;}, {},'stale_life'],
  ['wrong shooter owns projectile',f=>{f.spawn();f.authority.projectiles.get('shot-one').peerId='peer-f';}, {},'wrong_projectile_owner'],
  ['unreachable trajectory',f=>f.spawn(),{},'trajectory_or_cover'],
  ['wall cover',f=>{f.spawn();f.setTime(10200);f.authority.walls=[{x:140,y:150,width:10,height:100}];}, {},'trajectory_or_cover'],
])test(`relay rejects ${name} without HP writes`,async()=>{
  const f=fixture();prepare(f);assert.equal(f.hit(request).reason,reason);await f.authority.queue;
  assert.equal(f.commits.filter(c=>c.snapshot.players.some(p=>p.hp<100)).length,0);
});

test('server rejects untrusted speed, lifetime, origin, fire cadence and replayed spawn',()=>{
  for(const extra of [{vx:999},{ttlMs:9999},{x:1000},{life:1},{playerId:'bob'}])assert.equal(fixture().spawn(extra),false);
  const f=fixture();assert.ok(f.spawn());assert.equal(f.spawn(),false);
  f.setTime(10399);assert.equal(f.spawn({projectileId:'too-fast',shotSeq:2}),false);
  f.setTime(10400);assert.ok(f.spawn({projectileId:'second',shotSeq:2}));
});

test('pending hits keep newer HP/shot sequence when an earlier Convex result arrives',async()=>{
  const f=fixture(),old=match();f.spawn();f.setTime(10200);assert.ok(f.hit().accepted);
  f.authority.sync(old);assert.equal(f.authority.state.participants[1].hp,75);
  assert.equal(f.authority.state.participants[0].lastShot,1);
  f.setTime(10400);f.spawn({projectileId:'second',shotSeq:2});f.setTime(10600);
  assert.ok(f.hit({projectileId:'second'}).accepted);await f.authority.queue;
  assert.deepEqual(f.commits.map(c=>[c.expectedRevision,c.snapshot.players.find(p=>p.playerId==='bob').hp]),[[0,75],[1,50]]);
});

test('distinct registered flights can land out of order without being mistaken for replays',async()=>{
  const f=fixture();f.spawn();f.setTime(10400);f.spawn({projectileId:'second',shotSeq:2});f.setTime(10600);
  assert.ok(f.hit({projectileId:'second'}).accepted);assert.ok(f.hit().accepted);
  assert.equal(f.hit().reason,'projectile_consumed');
  await f.authority.queue;assert.equal(f.commits.length,2);
});

test('respawn generation and obsolete round reject delayed shots',()=>{
  const f=fixture();f.spawn();f.setTime(10200);
  const state=match();state.participants[1]={...state.participants[1],hp:0,respawnAt:10100};f.authority.state=state;f.authority.advance();
  assert.equal(f.authority.state.participants[1].life,1);assert.equal(f.hit().reason,'stale_life');
  f.authority.sync({...state,round:1});assert.equal(f.hit().accepted,false);assert.equal(f.errors.length,1);
});

test('dead shooter registered flight remains valid, but dead shooter cannot create a new flight',async()=>{
  const f=fixture();f.spawn();f.authority.state.participants[0].hp=0;f.setTime(10200);
  assert.ok(f.hit().accepted);await f.authority.queue;assert.equal(f.commits.length,1);
  f.setTime(10400);assert.equal(f.spawn({projectileId:'dead-new',shotSeq:2}),false);
  assert.ok(f.logs.some(log=>log.reason==='dead_shooter'));
});

test('dead shooter flight expires and cannot be recreated/replayed as an old-life spawn',()=>{
  const f=fixture();f.spawn();f.authority.state.participants[0].hp=0;f.setTime(11200);
  assert.equal(f.hit().reason,'expired_projectile');assert.equal(f.commits.length,0);
});

test('relay clock respawns once, retains new participants, and accepts next-life movement/shot/hit',async()=>{
  const f=fixture();f.spawn({shotSeq:20});const dead=structuredClone(f.authority.state);
  dead.participants[0]={...dead.participants[0],hp:0,respawnAt:12500,lastShot:20};f.authority.state=structuredClone(dead);
  f.setTime(12500);f.authority.advance();f.authority.advance();
  assert.equal(f.authority.state.participants[0].life,1);assert.equal(f.authority.state.participants[0].hp,100);
  assert.equal(f.authority.members.size,3);
  assert.ok(f.authority.movement('peer-a',{playerId:'alice',life:1,x:100,y:222,moving:false,sampleSeq:1}));
  assert.equal(f.authority.movement('peer-a',{playerId:'alice',life:0,x:900,y:900,moving:false,sampleSeq:99999}),false);
  assert.ok(f.spawn({projectileId:'new-life',life:1,shotSeq:1}));
  assert.equal(f.spawn({projectileId:'old-life-new-id',life:0,shotSeq:99}),false);
  f.setTime(12700);assert.ok(f.hit({projectileId:'new-life'}).accepted);await f.authority.queue;
  assert.equal(f.errors.length,0);assert.equal(f.authority.closed,false);
  assert.equal(f.logs.filter(log=>log.event==='respawn applied').length,1);
  for(const event of ['first movement after respawn','first projectile spawn after respawn','first hit attempt after respawn'])
    assert.ok(f.logs.some(log=>log.event===event));
});

test('late previous-life Convex snapshot cannot undo an already projected respawn',()=>{
  const f=fixture(),dead=structuredClone(f.authority.state);
  dead.participants[0]={...dead.participants[0],hp:0,respawnAt:12500};f.authority.state=structuredClone(dead);
  f.setTime(12500);f.authority.advance();f.setTime(12499);f.authority.sync(dead);
  assert.equal(f.authority.state.participants[0].life,1);assert.equal(f.authority.state.participants[0].hp,100);
  f.setTime(12500);f.authority.advance();assert.equal(f.authority.state.participants[0].life,1);
});

test('damage persistence failure closes authority instead of falling back to attacker damage',async()=>{
  const f=fixture({commit:async()=>({applied:false})});f.spawn();f.setTime(10200);assert.ok(f.hit().accepted);
  await f.authority.queue;assert.equal(f.authority.closed,true);assert.equal(f.errors.length,1);
  f.authority.close();f.authority.close();assert.equal(f.authority.projectiles.size,0);
});

test('host departure racing a queued hit keeps the existing ended recovery',async()=>{
  const f=fixture({commit:async()=>({applied:false})});f.spawn();f.setTime(10200);f.hit();
  f.authority.sync({...match(),state:'ended',reason:'host_left',endedAt:10200});
  await f.authority.queue;assert.equal(f.authority.closed,true);assert.equal(f.errors.length,0);
  assert.equal(f.authority.state.reason,'host_left');
});

test('peer ownership cannot be reassigned and logical presence expiry stops combat without a timer',()=>{
  const f=fixture();assert.equal(f.authority.register('alice','forged-peer'),false);
  f.spawn();f.setTime(10200);f.authority.state.participants[0].presenceExpiresAt=10200;
  assert.equal(f.hit().accepted,false);assert.equal(f.authority.state.reason,'host_left');
});

const envelope=(type,payload)=>({type,payload,roomId:'pvp-match-a-0',seq:1,sentAt:1,channel:'reliable'});
test('client cannot choose damage or forge server HP/result messages',()=>{
  assert.ok(validClientMessage(envelope('pvp-hit-attempt',attempt())));
  assert.equal(validClientMessage(envelope('pvp-hit-attempt',{...attempt(),damage:9999})),false);
  const hp=packet({players:[{playerId:'bob',life:0,hp:75}]});
  assert.equal(validClientMessage(envelope('pvp-combat-state',hp)),false);
  assert.ok(validServerMessage({...envelope('pvp-combat-state',hp),serverTime:1}));
  const f=fixture();f.spawn();f.setTime(10200);assert.equal(f.hit({damage:9999}).damage,25);
});

class Transport extends RealtimeTransport{
  constructor(){super();this.sent=[];}
  sendReliable(type,payload){this.sent.push({type,payload});return true;}
}
test('authoritative HP updates client, ignores stale HP/lives, and sends only a minimal realtime hit',()=>{
  const transport=new Transport(),updates=[];
  const movement={transport,match:match(),playerId:'alice',round:0,roomId:'pvp-match-a-0',joined:true,closed:false,config:{debug:false}};
  const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'session-a',onState:s=>updates.push(s)});
  const emit=(type,payload)=>transport.emitMessage({type,payload,roomId:movement.roomId});
  assert.equal(client.attempt({projectileId:'shot-one',victimId:'bob',victimLife:0}),false);
  emit('pvp-authorized',{playerId:'alice',round:0});
  const hp=packet({version:2,players:[{playerId:'bob',life:0,hp:75}]});
  emit('pvp-combat-state',hp);assert.equal(updates.at(-1).participants[1].hp,75);
  assert.equal(client.project(match()).participants[1].hp,75,'stale Convex query cannot restore HP');
  emit('pvp-combat-state',{...hp,version:1,players:[{playerId:'bob',life:0,hp:100}]});assert.equal(updates.length,1);
  const next=match();next.damageRevision=2;next.participants[1].life=1;
  assert.equal(client.project(next).participants[1].hp,75,'Convex never overrides relay combat');
  assert.ok(client.attempt({projectileId:'shot-one',victimId:'bob',victimLife:0,damage:9999}));
  assert.deepEqual(transport.sent.at(-1),{type:'pvp-hit-attempt',payload:attempt()});
  client.close();client.close();assert.equal(transport.messageHandlers.size,0);assert.equal(transport.stateHandlers.size,0);
  const scene=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8');
  assert.doesNotMatch(scene,/request\(['"]hit['"]/);assert.match(scene,/damageClient\?\.attempt\(hit\)/);
});

test('relay respawn generation updates client even before delayed Convex death metadata',()=>{
  const transport=new Transport(),states=[],logs=[];
  const movement={transport,match:match(),playerId:'alice',round:0,roomId:'pvp-match-a-0',joined:true,closed:false,config:{debug:true}};
  const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'session-a',onState:s=>states.push(s),log:(...args)=>logs.push(args)});
  const emit=(version,life,hp)=>transport.emitMessage({type:'pvp-combat-state',roomId:movement.roomId,
    payload:packet({version,players:[{playerId:'alice',life,hp}]})});
  transport.emitMessage({type:'pvp-authorized',roomId:movement.roomId,payload:{playerId:'alice',round:0}});
  const handlers=[transport.messageHandlers.size,transport.stateHandlers.size];
  emit(1,0,0);emit(2,1,100);emit(3,1,100);
  assert.equal(states.at(-1).participants[0].life,1);assert.equal(states.at(-1).participants[0].hp,100);
  assert.equal(client.project(match()).participants[0].life,1,'late old query cannot restore the previous life');
  assert.equal(client.project(match()).participants[0].lastShot,0);
  assert.equal(client.authorized,true);assert.deepEqual([transport.messageHandlers.size,transport.stateHandlers.size],handlers);
  assert.equal(logs.filter(([event])=>event==='death received/applied').length,1);
  assert.equal(logs.filter(([event])=>event==='respawn received').length,1);client.close();
});

async function waitFor(predicate){const until=Date.now()+3000;while(!predicate()){
  if(Date.now()>until)throw new Error('Damage relay test timeout');await new Promise(resolve=>setTimeout(resolve,5));}}
test('real WebSocket authenticates peers once per room, broadcasts authoritative HP, isolates rooms, and releases subscription',async()=>{
  let now=10000,subscriptions=0,unsubscriptions=0;const commits=[],state=match();let update;
  const bridge={authenticate:async args=>{
    if(args.matchId!==state.matchId||args.round!==0||args.sessionId!==`session-${args.playerId}`)throw new Error('invalid');
    return structuredClone(state);
  },subscribe(_id,callback){subscriptions++;update=callback;return ()=>unsubscriptions++;},
  async commit(args){commits.push(args);return {applied:true};}};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:()=>now,pvpBridge:bridge});await server.ready;
  const peers=[];
  const connect=async(playerId,roomId=pvpRealtimeRoom('match-a',0))=>{
    const transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId,WebSocketImpl:WebSocket});
    const messages=[];transport.onMessage(m=>{messages.push(m);if(m.type==='welcome')transport.sendReliable('join-room',{});});
    peers.push(transport);await transport.connect();await waitFor(()=>messages.some(m=>m.type==='room-state'));
    if(playerId){transport.sendReliable('pvp-authorize',{playerId,sessionId:`session-${playerId}`,matchId:'match-a',round:0,
      mapId:PVP_MAP_DEFINITION.id,mapRevision:PVP_MAP_DEFINITION.revision});
      await waitFor(()=>messages.some(m=>m.type==='pvp-authorized'));}
    return {transport,messages};
  };
  try{
    const a=await connect('alice'),b=await connect('bob'),other=await connect(null,'other-room');
    assert.equal(subscriptions,1);assert.equal(server.authorities.size,1);
    for(const [peer,playerId,x] of [[a,'alice',900],[b,'bob',1000]])peer.transport.sendReliable('pvp-movement',
      {playerId,x,y:722,vx:0,vy:0,direction:'right',moving:false,sampleSeq:1,life:0});
    await waitFor(()=>server.authorities.values().next().value.authority.positions.size===2);
    a.transport.sendReliable('pvp-projectile-spawn',shot({x:900,y:700}));
    await waitFor(()=>b.messages.some(m=>m.type==='pvp-projectile-spawn'));now=10200;
    a.transport.sendReliable('pvp-hit-attempt',attempt());
    await waitFor(()=>b.messages.some(m=>m.type==='pvp-hit-result'&&m.payload.accepted));
    assert.equal(b.messages.filter(m=>m.type==='pvp-combat-state').at(-1).payload.players.find(p=>p.playerId==='bob').hp,75);
    a.transport.sendReliable('pvp-hit-attempt',attempt());
    await waitFor(()=>a.messages.some(m=>m.payload.reason==='projectile_consumed'));
    assert.equal(commits.length,1);assert.ok(other.messages.every(m=>!m.type.startsWith('pvp-')));
    update({...state,state:'ended',reason:'host_left'});
    for(const p of peers)p.disconnect();await waitFor(()=>server.clients.size===0);
    assert.equal(unsubscriptions,1);assert.equal(server.authorities.size,0);
  }finally{for(const p of peers)p.disconnect();await server.close();}
});

test('relay explicitly rejects old client maps and old backend map metadata before initializing combat',async()=>{
  let authenticated=0,staleBackend=true;
  const bridge={async authenticate(){authenticated++;return {...match(),arenaMap:staleBackend?undefined:PVP_MAP_DEFINITION};},
    subscribe(){return ()=>{};},async commit(){return {applied:true};}};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:()=>10000,pvpBridge:bridge});await server.ready;
  const transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:pvpRealtimeRoom('match-a',0),WebSocketImpl:WebSocket});
  const messages=[];transport.onMessage(m=>{messages.push(m);if(m.type==='welcome')transport.sendReliable('join-room',{});});
  const args={playerId:'alice',sessionId:'session-alice',matchId:'match-a',round:0};
  const rejected=async extra=>{
    const before=messages.filter(m=>m.type==='pvp-combat-error').length;
    transport.sendReliable('pvp-authorize',{...args,...extra});
    await waitFor(()=>messages.filter(m=>m.type==='pvp-combat-error').length>before);
    assert.match(messages.at(-1).payload.reason,/map configuration mismatch/);
    assert.equal(server.authorities.size,0);
  };
  try{
    await transport.connect();await waitFor(()=>messages.some(m=>m.type==='room-state'));
    await rejected({});
    await rejected({mapId:'pvp-arena-test',mapRevision:1});
    await rejected({mapId:PVP_MAP_DEFINITION.id,mapRevision:0});assert.equal(authenticated,0);
    const map={mapId:PVP_MAP_DEFINITION.id,mapRevision:PVP_MAP_DEFINITION.revision};
    await rejected(map);assert.equal(authenticated,1);
    staleBackend=false;transport.sendReliable('pvp-authorize',{...args,...map});
    await waitFor(()=>messages.some(m=>m.type==='pvp-authorized'));assert.equal(server.authorities.size,1);
  }finally{transport.disconnect();await server.close();}
});
