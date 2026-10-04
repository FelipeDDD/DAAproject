import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import * as backend from '../convex/pvpMatches.js';
import { newFighter } from '../src/pvp/matchState.js';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';

async function waitFor(predicate){const until=performance.now()+3000;while(!predicate()){
  if(performance.now()>until)throw new Error('Respawn relay timeout');await new Promise(resolve=>setTimeout(resolve,5));}}

test('two actual sockets: posthumous double kill, realtime deaths with Convex snapshot mirror, respawn and next-life movement/shot/hit without reconnect',async t=>{
  let now=10000; t.mock.method(Date,'now',()=>now);
  const oldDev=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>{if(oldDev===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=oldDev;});
  const room='pvp-arena-test:match-a',ids=['alice','bob'];
  const rows=ids.map((playerId,i)=>({_id:`row-${i}`,playerId,sessionId:`session-${playerId}`,lastSeen:now,room}));
  const saved={_id:'match-a',mode:'tdm',round:0,damageRevision:0,state:'active',hostPlayerId:'alice',expiresAt:999999,
    startedAt:0,endsAt:999999,endedAt:null,winner:null,reason:null,scores:{A:0,B:0},scoreLimit:5,respawnMs:2500,
    participants:ids.map((playerId,i)=>({...newFighter({playerId,sessionId:`session-${playerId}`,team:i?'B':'A'}),hp:25,lastShot:8}))};
  const ctx={db:{async get(id){return id==='match-a'?saved:rows.find(row=>row._id===id)??null;},
    async patch(_id,data){Object.assign(saved,structuredClone(data));},
    query(){let filter;const query={withIndex(_name,build){const q={eq(key,value){filter=row=>row[key]===value;return q;}};build(q);return query;},
      async unique(){return rows.find(filter)??null;}};return query;}}};
  const args=playerId=>({playerId,sessionId:`session-${playerId}`,matchId:'match-a'});
  const initial=await backend.current._handler(ctx,args('alice'));
  let subscriptions=0,offCount=0,acquisitions=0,onServerState;const clients=[],commits=[];
  const deliverConvex=async()=>{
    const state=await backend.realtimeState._handler(ctx,{matchId:'match-a'});onServerState?.(state);
    for(const client of clients){const raw=await backend.current._handler(ctx,args(client.playerId));
      client.apply(client.damage.project(raw));}
  };
  const bridge={authenticate:input=>backend.current._handler(ctx,input),subscribe(_id,onState){
    subscriptions++;onServerState=onState;void deliverConvex();return ()=>offCount++;
  },acquire:input=>{acquisitions++;return backend.acquireRealtimeCombat._handler(ctx,input);},async commit(input){commits.push(input);const result=await backend.mirrorRealtimeCombat._handler(ctx,input);
    await deliverConvex();return result;}};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:()=>now,pvpBridge:bridge});await server.ready;
  const url=`ws://127.0.0.1:${server.wss.address().port}`;
  try{
    for(const [i,playerId] of ids.entries()){
      const peer={playerId,state:structuredClone(initial),messages:[],movementCalls:[],logs:[]};
      const remoteId=ids[1-i],sprite={x:i?900:1000,y:722};
      const remotes={bufferOptions:{},players:new Map([[remoteId,{sprite}]]),receive(){},
        receiveMovement(id,state){peer.movementCalls.push({id,...state});Object.assign(sprite,{x:state.x,y:state.y});}};
      const scene={player:{x:i?1000:900,y:722},remotes,source:{layers:[{name:'Collision',type:'objectgroup',objects:[]}]},
        input:{on(){},off(){}},add:{circle(x,y){return {x,y,setDepth(){return this;},setPosition(x,y){Object.assign(this,{x,y});},destroy(){this.destroyed=true;}};}}};
      peer.transport=new WebSocketTransport({url,roomId:'pvp-match-a-0',WebSocketImpl:WebSocket});
      peer.transport.onMessage(m=>peer.messages.push(m));
      peer.movement=new PvpMovementClient({matchId:'match-a',match:peer.state,playerId,transport:peer.transport,remotes,
        getSpawn:p=>({x:p.playerId==='alice'?900:1000,y:722}),snapshot:()=>null,config:{debug:false},log:()=>{}});
      peer.combat=new PvpCombatController(scene,hit=>peer.damage.attempt(hit),{
        onSpawn:p=>peer.projectiles.sendSpawn(p),onRemove:p=>peer.projectiles.sendDestroy(p)});
      peer.projectiles=new PvpProjectileClient(peer.movement,peer.combat);
      peer.apply=state=>{peer.state=state;peer.movement.setMatch(state);peer.projectiles.setMatch(state);};
      peer.damage=new PvpDamageClient(peer.movement,{matchId:'match-a',sessionId:`session-${playerId}`,onState:state=>peer.apply(state)});
      peer.tick=delta=>peer.combat.update(peer.state,peer.state.participants.find(p=>p.playerId===playerId),delta,now);
      peer.move=(life,sampleSeq,x=scene.player.x)=>peer.transport.sendUnreliable('pvp-movement',
        {playerId,life,sampleSeq,x,y:722,vx:0,vy:0,moving:false,direction:i?'left':'right'});
      clients.push(peer);peer.tick(0);
    }
    const [a,b]=clients;
    await waitFor(()=>clients.every(p=>p.damage.authorized));await deliverConvex();
    const peerIds=clients.map(p=>p.transport.getStats().clientId);
    const handlers=clients.map(p=>[p.transport.messageHandlers.size,p.transport.stateHandlers.size]);
    a.move(0,99);b.move(0,99);
    await waitFor(()=>server.authorities.get('pvp-match-a-0').authority.positions.size===2);
    assert.ok(a.combat.fire({x:1000,y:700},now));assert.ok(b.combat.fire({x:900,y:700},now));
    const aShot=a.combat.shots[0].event,bShot=b.combat.shots[0].event;
    await waitFor(()=>clients.every(p=>p.combat.remoteShots.size===1));
    now=10200;assert.ok(b.damage.attempt({projectileId:bShot.projectileId,victimId:'alice',victimLife:0}));
    b.combat.removeLocal(b.combat.shots[0]); // Same request-before-destroy order as local collision.
    await waitFor(()=>saved.damageRevision===1&&a.state.participants[0].hp===0);
    assert.equal(a.combat.shots.length,1);assert.ok(b.combat.remoteShots.has(aShot.projectileId));
    assert.equal(a.movement.closed,false);assert.equal(a.damage.authorized,true);
    a.tick(100);assert.equal(a.combat.shots.length,1,'dead shooter flight keeps moving');
    now=10300;a.tick(200); // Alice's already-fired flight kills Bob posthumously.
    await waitFor(()=>saved.damageRevision===2&&b.state.participants[1].hp===0);
    assert.deepEqual(saved.scores,{A:1,B:1});assert.ok(saved.participants.every(p=>p.deaths===1&&p.kills===1));
    assert.equal(server.authorities.get('pvp-match-a-0').authority.closed,false);
    for(const c of clients)assert.equal(c.transport.state,'connected');

    // Advance the injected server clock. A movement arriving at the deadline
    // exercises the same authoritative transition as the server deadline timer.
    const movementCounts=clients.map(c=>c.movementCalls.length);
    now=12800;a.move(1,1);b.move(1,1);
    await waitFor(()=>clients.every(c=>c.state.participants.every(p=>p.life===1&&p.hp===100))
      &&clients.every((c,i)=>c.movementCalls.length>movementCounts[i])
      &&server.authorities.get('pvp-match-a-0').authority.positions.size===2);
    assert.ok(clients.every(c=>c.movement.match.participants.every(p=>p.life===1)));
    a.move(0,999999);a.move(5,999999);a.move(1,2,910); // Rejected lives cannot poison the current sequence cache.
    await waitFor(()=>server.authorities.get('pvp-match-a-0').authority.positions.get('alice')?.x===910);
    assert.ok(b.movementCalls.some(p=>p.x===910));
    a.tick(0);b.tick(0);assert.ok(a.combat.fire({x:1000,y:700},now));
    const fresh=a.combat.shots[0].event;assert.equal(fresh.life,1);assert.equal(fresh.shotSeq,1);
    await waitFor(()=>b.combat.remoteShots.has(fresh.projectileId));
    a.transport.sendReliable('pvp-projectile-spawn',{...aShot,projectileId:'stale-new-id',shotSeq:999});
    a.transport.sendReliable('pvp-hit-attempt',{projectileId:aShot.projectileId,targetId:'bob',targetLife:1});
    await waitFor(()=>a.messages.some(m=>m.type==='pvp-hit-result'&&m.payload.reason==='expired_projectile'));
    assert.equal(server.authorities.get('pvp-match-a-0').authority.projectiles.has('stale-new-id'),false);
    now=13000;a.tick(250);
    await waitFor(()=>saved.damageRevision===4&&b.state.participants[1].hp===75);
    assert.equal(commits.length,4);assert.deepEqual(saved.scores,{A:1,B:1});
    assert.equal(subscriptions,1);assert.equal(acquisitions,1);assert.equal(server.rooms.size,1);assert.equal(server.clients.size,2);
    clients.forEach((c,i)=>{assert.equal(c.transport.getStats().clientId,peerIds[i]);
      assert.deepEqual([c.transport.messageHandlers.size,c.transport.stateHandlers.size],handlers[i]);});
    assert.equal(saved.participants[0].life,1);assert.equal(saved.participants[1].life,1);
    assert.equal(bShot.life,0);assert.ok(!clients.some(c=>c.messages.some(m=>m.type==='pvp-combat-error')));
  }finally{
    for(const c of clients){c.damage.close();c.projectiles.close();c.movement.close();c.combat.destroy();}
    await server.close();
  }
  assert.equal(offCount,1);
});
