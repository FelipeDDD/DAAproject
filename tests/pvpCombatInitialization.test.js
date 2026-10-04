import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { newFighter } from '../src/pvp/matchState.js';
import { PVP_MAP_DEFINITION } from '../src/pvp/config.js';

const initial=()=>({arenaMap:PVP_MAP_DEFINITION,matchId:'match-a',room:'pvp-arena-test:match-a',round:0,
  damageRevision:0,state:'countdown',hostPlayerId:'alice',expiresAt:999999,startedAt:13000,endsAt:193000,
  endedAt:null,winner:null,reason:null,scores:{A:0,B:0},scoreLimit:5,respawnMs:2500,
  participants:['alice','bob'].map((playerId,i)=>({...newFighter({playerId,team:i?'B':'A'}),presenceRoom:'pvp-arena-test:match-a'}))});
async function waitFor(predicate){const deadline=performance.now()+3000;while(!predicate()){
  if(performance.now()>deadline)throw new Error('Combat initialization timeout');
  await new Promise(resolve=>setTimeout(resolve,5));
}}

test('initial countdown state and post-respawn state have equivalent alive HP/ownership and symmetric first hits',async t=>{
  let now=10000;const logs=[];
  const authority=new PvpDamageAuthority(initial(),{now:()=>now,authorityId:'relay-a',log:l=>logs.push(l),
    getSpawn:p=>({x:p.playerId==='alice'?100:200,y:222}),commit:async()=>({applied:true})});
  t.after(()=>authority.close());
  for(const [playerId,peerId] of [['alice','peer-a'],['bob','peer-b']])assert.ok(authority.register(playerId,peerId));
  now=13000;authority.advance();
  assert.equal(authority.state.state,'active');assert.equal(authority.round,0);
  const alive=p=>({hp:p.hp,respawnAt:p.respawnAt,lastShot:p.lastShot,lastHitAt:p.lastHitAt,
    presenceRoom:p.presenceRoom,owned:authority.members.has(p.playerId)});
  const before=authority.state.participants.map(alive);
  assert.ok(authority.state.participants.every(p=>p.life===0&&p.hp===100&&p.respawnAt===null));
  for(const [playerId,peerId,x,vx,targetId] of [['alice','peer-a',100,420,'bob'],['bob','peer-b',200,-420,'alice']]){
    assert.ok(authority.spawn(peerId,{projectileId:`first-${playerId}`,playerId,life:0,shotSeq:1,x,y:200,vx,vy:0,ttlMs:1200}));
    now+=200;assert.equal(authority.attempt(peerId,{projectileId:`first-${playerId}`,targetId,targetLife:0}).accepted,true);
  }
  assert.ok(authority.state.participants.every(p=>p.hp===75));
  // Exercise the real authoritative death/respawn flow, not a manual state reset.
  for(let shotSeq=2;shotSeq<=4;shotSeq++){
    now+=400;
    for(const [playerId,peerId,x,vx] of [['alice','peer-a',100,420],['bob','peer-b',200,-420]])
      assert.ok(authority.spawn(peerId,{projectileId:`${playerId}-${shotSeq}`,playerId,life:0,shotSeq,x,y:200,vx,vy:0,ttlMs:1200}));
    now+=200;
    for(const [playerId,peerId,targetId] of [['alice','peer-a','bob'],['bob','peer-b','alice']])
      assert.equal(authority.attempt(peerId,{projectileId:`${playerId}-${shotSeq}`,targetId,targetLife:0}).accepted,true);
  }
  assert.ok(authority.state.participants.every(p=>p.hp===0));now+=2500;authority.advance();
  assert.ok(authority.state.participants.every(p=>p.life===1));
  assert.deepEqual(authority.state.participants.map(alive),before);
  assert.ok(logs.some(l=>l.event==='match active'&&l.players.every(p=>p.alive&&p.life===0&&p.sessionOwned)));
  for(const playerId of ['alice','bob']){
    assert.ok(logs.some(l=>l.event==='first projectile spawn after match start'&&l.playerId===playerId&&l.registered));
    assert.ok(logs.some(l=>l.event==='first hit attempt after match start'&&l.playerId===playerId&&l.projectileRegistered
      &&l.shooter.life===0&&l.target.life===0&&l.shooter.alive&&l.target.alive&&l.round===0));
  }
  await authority.queue;
});

test('before the initial authenticated pose, fallback spawn can reject a valid moved shooter; publishing that pose fixes the first shot',t=>{
  const logs=[],state={...initial(),state:'active',startedAt:0};
  const authority=new PvpDamageAuthority(state,{now:()=>10000,authorityId:'relay-a',log:l=>logs.push(l),
    getSpawn:()=>({x:0,y:0}),commit:async()=>({applied:true})});t.after(()=>authority.close());
  authority.register('alice','peer-a');authority.register('bob','peer-b');
  const shot={projectileId:'first-alice',playerId:'alice',life:0,shotSeq:1,x:100,y:200,vx:420,vy:0,ttlMs:1200};
  assert.equal(authority.spawn('peer-a',shot),false);
  assert.ok(logs.some(l=>l.event==='projectile rejected'&&l.reason==='invalid_origin_speed_or_ttl'
    &&l.position.source==='spawn'&&l.alive&&l.life===0));
  assert.ok(authority.movement('peer-a',{playerId:'alice',life:0,x:100,y:222,moving:false,sampleSeq:2}));
  assert.equal(authority.spawn('peer-a',shot),true,'initial rejection must not consume sequence/cooldown');
  assert.equal(authority.state.participants[0].life,0,'no death/respawn is needed to initialize shooting');
});

test('two sockets: discarded pre-auth positions are republished before the first host/joiner projectile, without waiting for the periodic tick',async t=>{
  let now=10000;const peers=[],state=initial();
  t.mock.method(Date,'now',()=>now);
  const bridge={authenticate:async()=>structuredClone(state),subscribe(){return ()=>{};},
    commit:async()=>({applied:true})};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:()=>now,pvpBridge:bridge});await server.ready;
  try{
    for(const [i,playerId] of ['alice','bob'].entries()){
      const peer={playerId,state:structuredClone(state),messages:[]},remoteId=i?'alice':'bob';
      const remote={sprite:{x:i?900:1000,y:722}};
      const remotes={bufferOptions:{},players:new Map([[remoteId,remote]]),receive(){},
        receiveMovement(_id,p){Object.assign(remote.sprite,{x:p.x,y:p.y});}};
      const scene={player:{x:i?1000:900,y:722},remotes,source:{layers:[]},input:{on(){},off(){}},
        add:{circle(){return {setDepth(){return this;},setPosition(){},destroy(){}};}}};
      peer.transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:'pvp-match-a-0',WebSocketImpl:WebSocket});
      peer.movement=new PvpMovementClient({matchId:'match-a',match:peer.state,playerId,transport:peer.transport,remotes,
        getSpawn:()=>({x:0,y:0}),snapshot:()=>({x:scene.player.x,y:scene.player.y,direction:i?'left':'right',moving:false,vx:0,vy:0,life:0}),
        now:()=>0,log:()=>{}});
      // Reproduce the window: the initial periodic pose is sent before async
      // authentication and discarded. Its next deadline is still in the future.
      peer.transport.onMessage(m=>{peer.messages.push(m);if(m.type==='room-state')peer.movement.update(0);});
      peer.combat=new PvpCombatController(scene,hit=>peer.damage.attempt(hit),{
        canFire:()=>peer.damage.authorized&&peer.damage.hp?.state==='active'&&peer.movement.authorizedPoseSent,
        onSpawn:p=>peer.projectiles.sendSpawn(p),onRemove:p=>peer.projectiles.sendDestroy(p)});
      peer.projectiles=new PvpProjectileClient(peer.movement,peer.combat);
      peer.damage=new PvpDamageClient(peer.movement,{matchId:'match-a',sessionId:`session-${playerId}`,onState:s=>{
        peer.state=s;peer.movement.setMatch(s);peer.projectiles.setMatch(s);
        peer.combat.update(s,s.participants.find(p=>p.playerId===playerId),0,now);
      }});
      peers.push(peer);
    }
    await waitFor(()=>peers.every(p=>p.damage.authorized));
    const authority=server.authorities.get('pvp-match-a-0').authority;
    await waitFor(()=>authority.positions.size===2);
    assert.deepEqual([...authority.positions.values()].map(p=>p.x).sort((a,b)=>a-b),[900,1000]);
    assert.ok(peers.every(p=>p.movement.sampleSeq===2&&p.movement.nextSendAt===50));
    assert.ok(authority.state.participants.every(p=>p.hp===100&&p.life===0));
    now=13000;authority.advance();await waitFor(()=>peers.every(p=>p.state.state==='active'));
    for(const [i,peer] of peers.entries()){
      assert.ok(peer.combat.fire({x:i?900:1000,y:700},now));
      const shot=peer.combat.shots[0].event;
      assert.equal(shot.life,0);assert.equal(shot.shotSeq,1);
      await waitFor(()=>authority.projectiles.has(shot.projectileId));
      now+=250;peer.combat.update(peer.state,peer.combat.self,250,now);
      await waitFor(()=>peer.messages.some(m=>m.type==='pvp-hit-result'&&m.payload.projectileId===shot.projectileId&&m.payload.accepted));
    }
    assert.ok(authority.state.participants.every(p=>p.hp===75&&p.life===0));
    assert.ok(peers.every(p=>p.damage.authorized&&!p.movement.closed));
    await authority.queue;
  }finally{
    for(const p of peers){p.damage.close();p.projectiles.close();p.movement.close();p.combat.destroy();}
    await server.close();
  }
});
