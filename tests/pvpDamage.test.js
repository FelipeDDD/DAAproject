import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { newFighter } from '../src/pvp/matchState.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validClientMessage,validServerMessage } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';

const match=()=>({matchId:'match-a',room:'pvp-arena-test:match-a',round:0,damageRevision:0,state:'active',hostPlayerId:'alice',expiresAt:999999,
  startedAt:0,endsAt:999999,scores:{A:0,B:0},scoreLimit:5,respawnMs:2500,
  participants:[newFighter({playerId:'alice',team:'A'}),newFighter({playerId:'bob',team:'B'}),newFighter({playerId:'friend',team:'A'})]
    .map(p=>({...p,presenceRoom:'pvp-arena-test:match-a'}))});
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
  assert.equal(f.states.at(-1).players.find(p=>p.playerId==='bob').hp,75);assert.equal(f.logs.length,2);
});

for(const [name,prepare,request,reason] of [
  ['nonexistent projectile',()=>{}, {},'unknown_projectile'],
  ['expired projectile',f=>{f.spawn();f.setTime(11200);}, {},'expired_projectile'],
  ['self hit',f=>f.spawn(),{targetId:'alice'},'self_hit'],
  ['friendly fire',f=>f.spawn(),{targetId:'friend'},'friendly_fire'],
  ['target in another room',f=>f.spawn(),{targetId:'outsider'},'inactive_target'],
  ['registered target left arena',f=>{f.spawn();f.authority.state.participants[1].presenceRoom='school';},{},'wrong_presence_room'],
  ['target disconnect',f=>{f.spawn();f.authority.remove('peer-b');}, {},'inactive_target'],
  ['dead target',f=>{f.spawn();f.authority.state.participants[1].hp=0;}, {},'inactive_target'],
  ['dead shooter',f=>{f.spawn();f.authority.state.participants[0].hp=0;}, {},'inactive_shooter'],
  ['old target life',f=>{f.spawn();f.authority.state.participants[1].life=1;}, {},'stale_life'],
  ['old shooter life',f=>{f.spawn();f.authority.state.participants[0].life=1;}, {},'stale_life'],
  ['wrong shooter owns projectile',f=>{f.spawn();f.authority.projectiles.get('shot-one').peerId='peer-f';}, {},'wrong_projectile_owner'],
  ['unreachable trajectory',f=>f.spawn(),{},'trajectory_or_cover'],
  ['wall cover',f=>{f.spawn();f.setTime(10200);f.authority.walls=[{x:140,y:150,width:10,height:100}];}, {},'trajectory_or_cover'],
])test(`relay rejects ${name} without HP writes`,async()=>{
  const f=fixture();prepare(f);assert.equal(f.hit(request).reason,reason);await f.authority.queue;
  assert.equal(f.commits.length,0);
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
  assert.deepEqual(f.commits.map(c=>[c.expectedRevision,c.hpBefore,c.hpAfter]),[[0,100,75],[1,75,50]]);
});

test('older in-flight shot cannot apply after a newer shot has hit',async()=>{
  const f=fixture();f.spawn();f.setTime(10400);f.spawn({projectileId:'second',shotSeq:2});f.setTime(10600);
  assert.ok(f.hit({projectileId:'second'}).accepted);assert.equal(f.hit().reason,'stale_shot');
  await f.authority.queue;assert.equal(f.commits.length,1);
});

test('respawn generation and obsolete round reject delayed shots',()=>{
  const f=fixture();f.spawn();f.setTime(10200);
  const state=match();state.participants[1]={...state.participants[1],hp:0,respawnAt:10100};f.authority.sync(state);
  assert.equal(f.authority.state.participants[1].life,1);assert.equal(f.hit().reason,'stale_life');
  f.authority.sync({...state,round:1});assert.equal(f.hit().accepted,false);assert.equal(f.errors.length,1);
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
  const hp={authorityId:'authority-a',version:1,round:0,damageRevision:1,players:[{playerId:'bob',life:0,hp:75}]};
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
  const hp={authorityId:'authority-a',version:2,round:0,damageRevision:1,players:[{playerId:'bob',life:0,hp:75}]};
  emit('pvp-combat-state',hp);assert.equal(updates.at(-1).participants[1].hp,75);
  assert.equal(client.project(match()).participants[1].hp,75,'stale Convex query cannot restore HP');
  emit('pvp-combat-state',{...hp,version:1,players:[{playerId:'bob',life:0,hp:100}]});assert.equal(updates.length,1);
  const next=match();next.damageRevision=2;next.participants[1].life=1;
  assert.equal(client.project(next).participants[1].hp,100);
  assert.ok(client.attempt({projectileId:'shot-one',victimId:'bob',victimLife:0,damage:9999}));
  assert.deepEqual(transport.sent.at(-1),{type:'pvp-hit-attempt',payload:attempt()});
  client.close();client.close();assert.equal(transport.messageHandlers.size,0);assert.equal(transport.stateHandlers.size,0);
  const scene=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8');
  assert.doesNotMatch(scene,/request\(['"]hit['"]/);assert.match(scene,/damageClient\?\.attempt\(hit\)/);
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
    if(playerId){transport.sendReliable('pvp-authorize',{playerId,sessionId:`session-${playerId}`,matchId:'match-a',round:0});
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
