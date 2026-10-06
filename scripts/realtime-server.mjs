import { WebSocketServer,WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { REALTIME_CONFIG } from '../src/realtime/config.js';
import { decodeMessage,validClientMessage } from '../src/realtime/realtimeMessages.js';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PVP_RULES,PVP_MAP_FILE,PVP_MAP_DEFINITION } from '../src/pvp/config.js';
import { requirePvpMap } from '../src/pvp/mapConfig.js';
import { createModeAuthority } from '../src/pvp/modeAuthority.js';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';
import { teamSpawn } from '../src/pvp/spawns.js';
import { collisionAreas } from '../src/maps/collision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { createLocalPvpBridge } from './pvp-convex-bridge.mjs';
import { pickupSpotsFromMap } from '../src/pvp/pickups/spots.js';

export function rateAllowed(client,now,limit){
  if(now-client.windowAt>=1000){client.windowAt=now;client.count=0;}
  return ++client.count<=limit;
}
export function createRealtimeServer(options={}){
  const config={...REALTIME_CONFIG,...options};const now=options.now??Date.now;
  const wss=new WebSocketServer({host:config.host,port:config.port,maxPayload:config.maxMessageBytes,perMessageDeflate:false});
  const clients=new Map(),rooms=new Map();
  const authorities=new Map(),pendingMirrors=new Set(),bridge=options.pvpBridge;
  const map=JSON.parse(readFileSync(new URL(`../public/assets/maps/${PVP_MAP_FILE}`,import.meta.url),'utf8'));
  const pickupSpots=pickupSpotsFromMap(map);
  const send=(client,type,payload,extra={})=>{
    if(client.ws.readyState!==WebSocket.OPEN)return;
    if(client.ws.bufferedAmount>config.maxBufferedBytes){client.ws.close(1013,'Backpressure');return;}
    client.ws.send(JSON.stringify({type,payload,serverTime:now(),...extra}));
  };
  const broadcast=(client,type,payload,extra={})=>{
    for(const id of rooms.get(client.roomId)??[]){const peer=clients.get(id);if(peer&&peer!==client)send(peer,type,payload,{roomId:client.roomId,senderId:client.id,...extra});}
  };
  const combatBroadcast=(roomId,type,payload)=>{
    const authority=authorities.get(roomId)?.authority;
    if(authority?.hostLeaveObserved||['host_left','host-left'].includes(authority?.state.reason))
      console.info('[PVP host leave] snapshot/broadcast',{roomId,type,state:authority.state.state,
        recipients:[...(rooms.get(roomId)??[])].filter(id=>clients.get(id)?.combat&&clients.get(id).ws.readyState===WebSocket.OPEN),
        retryDeadline:payload.retry?.deadline});
    for(const id of rooms.get(roomId)??[]){const client=clients.get(id);if(client?.combat)send(client,type,payload,{roomId});}
  };
  const authorize=async(client,args)=>{
    const generation=++client.authGeneration,roomId=client.roomId;
    try{
      if(!bridge||roomId!==pvpRealtimeRoom(args.matchId,args.round))throw new Error('No local PvP authority.');
      if(args.mapId!==PVP_MAP_DEFINITION.id||args.mapRevision!==PVP_MAP_DEFINITION.revision)
        throw new Error('PvP map configuration mismatch. Reload both browsers and restart the realtime server.');
      if(client.pvpPlayerId&&client.pvpPlayerId!==args.playerId)throw new Error('PvP player changed.');
      const state=await bridge.authenticate(args);
      requirePvpMap(state);
      if(generation!==client.authGeneration||client.roomId!==roomId||client.ws.readyState!==WebSocket.OPEN)return;
      let entry=authorities.get(roomId);
      if(!entry){
        entry={};authorities.set(roomId,entry);
        entry.ready=(async()=>{
          const authorityId=randomUUID();
          const initial=bridge.acquire?await bridge.acquire({matchId:args.matchId,round:args.round,authorityId}):state;
          requirePvpMap(initial);
          if(authorities.get(roomId)!==entry)return;
          const authority=new PvpDamageAuthority(initial,{now,authorityId,
            pickupSpots,
            schedule:options.schedule??setTimeout,cancel:options.cancel??clearTimeout,walls:collisionAreas(objectsIn(map,'Collision')),
            modeAuthority:createModeAuthority(initial.mode,map,{now}),
            getSpawn:(p,m)=>teamSpawn(map,p.team,m.participants.filter(q=>q.team===p.team).findIndex(q=>q.playerId===p.playerId)),
            commit:args=>bridge.commit(args),onState:state=>combatBroadcast(roomId,'pvp-combat-state',state),
            ...(bridge.nextRound?{onRetryResolve:async playerIds=>{
              const retained=authority.retryParticipants().filter(p=>playerIds.includes(p.playerId));
              const startedAt=retained.length>=2&&['A','B'].every(team=>retained.some(p=>p.team===team))?now()+PVP_RULES.countdownMs:null;
              const match=await bridge.nextRound({matchId:args.matchId,round:args.round,authorityId,
                playerIds:retained.map(p=>p.playerId),startedAt});
              if(authority.closed)return;
              authority.traceHostLeave('server return/waiting transition',{nextState:match?.state??'leave',nextRound:match?.round,
                remainingParticipants:match?.participants.map(p=>p.playerId)??[]});
              // The old subscription is finished before clients join the next room.
              entry.off?.();entry.off=null;
              combatBroadcast(roomId,'pvp-round-transition',{fromRound:args.round,match});
              authority.close();
            }}:{}),
            onFailure:reason=>combatBroadcast(roomId,'pvp-combat-error',{reason}),
            log:result=>console.debug('[PvP combat]',{roomId,...result})});
          entry.authority=authority;
          entry.off=bridge.subscribe(args.matchId,state=>authority.sync(state),()=>{
            authority.close();combatBroadcast(roomId,'pvp-combat-error',{reason:'Local PvP state unavailable.'});
          });
        })().catch(error=>{entry.off?.();entry.authority?.close();
          if(authorities.get(roomId)===entry)authorities.delete(roomId);throw error;});
      }
      await entry.ready;
      if(generation!==client.authGeneration||client.roomId!==roomId||client.ws.readyState!==WebSocket.OPEN)return;
      if(!entry.authority)throw new Error('PvP room unavailable.');
      if(!entry.authority.register(args.playerId,client.id,args.sessionId))throw new Error('PvP player already connected or inactive.');
      client.combat=entry;client.pvpPlayerId=args.playerId;
      send(client,'pvp-authorized',{playerId:args.playerId,round:args.round,matchSettings:entry.authority.settings},{roomId});
      entry.authority.advance();entry.authority.emit();
    }catch(error){
      if(generation===client.authGeneration&&client.roomId===roomId)
        send(client,'pvp-combat-error',{reason:error.message?.startsWith('PvP map configuration mismatch')
          ?error.message:'PvP session/authority unavailable. Start local Convex and rejoin.'},{roomId});
    }
  };
  const leave=client=>{
    if(!client.roomId)return;
    const authority=client.combat?.authority;
    if(authority&&authority.state.hostPlayerId===client.pvpPlayerId)
      console.info('[PVP host leave] disconnect detected',{roomId:client.roomId,playerId:client.pvpPlayerId,
        state:authority.state.state,remainingParticipants:[...authority.members.keys()].filter(id=>id!==client.pvpPlayerId),
        combatTimerActive:authority.timer!==undefined,retryTimerActive:authority.retry?.timer!==undefined});
    ++client.authGeneration;client.combat?.authority.remove(client.id);client.combat=null;
    broadcast(client,'peer-left',{clientId:client.id});const room=rooms.get(client.roomId);room?.delete(client.id);
    if(!room?.size){rooms.delete(client.roomId);const entry=authorities.get(client.roomId);
      entry?.off?.();entry?.authority?.close();
      if(entry?.authority){const pending=entry.authority.queue;pendingMirrors.add(pending);void pending.finally(()=>pendingMirrors.delete(pending));}
      authorities.delete(client.roomId);}
    client.roomId=null;client.position=null;client.movement=null;client.pvpPlayerId=null;
  };
  const remove=client=>{leave(client);clients.delete(client.id);};
  const sweep=()=>{for(const client of clients.values()){
    if(!client.alive){client.ws.terminate();remove(client);}else{client.alive=false;client.ws.ping();}
  }};
  const interval=setInterval(sweep,config.heartbeatMs);interval.unref();
  wss.on('connection',ws=>{
    if(clients.size>=config.maxClients){ws.close(1013,'Lab full');return;}
    const client={id:randomUUID(),ws,alive:true,roomId:null,position:null,windowAt:now(),count:0,lastSeq:0,authGeneration:0};clients.set(client.id,client);
    ws.on('pong',()=>client.alive=true);ws.on('error',()=>{});ws.on('close',()=>remove(client));
    send(client,'welcome',{clientId:client.id});
    ws.on('message',(raw,binary)=>{
      if(ws.readyState!==WebSocket.OPEN)return;
      if(binary||!rateAllowed(client,now(),config.maxMessagesPerSecond)){ws.close(1008,'Invalid message/rate');return;}
      const m=decodeMessage(raw.toString(),validClientMessage,config.maxMessageBytes);
      if(!m){ws.close(1008,'Malformed message');return;}
      if(m.seq<=client.lastSeq)return;client.lastSeq=m.seq;
      if(m.type==='ping'){send(client,'pong',{probeId:m.payload.probeId});return;}
      if(m.type==='join-room'){
        if(client.roomId===m.roomId)return;
        const room=rooms.get(m.roomId)??new Set();if(room.size>=config.maxRoomClients){ws.close(1008,'Room full');return;}
        leave(client);client.roomId=m.roomId;rooms.set(m.roomId,room);
        send(client,'room-state',{peers:[...room].map(id=>({clientId:id,position:clients.get(id).position}))},{roomId:m.roomId});
        room.add(client.id);broadcast(client,'peer-joined',{clientId:client.id});return;
      }
      if(!client.roomId||m.roomId!==client.roomId){ws.close(1008,'Not a room member');return;}
      if(m.type==='leave-room'){leave(client);send(client,'room-left',{}, {roomId:m.roomId});return;}
      if(m.type==='pvp-authorize'){void authorize(client,m.payload);return;}
      if(m.type==='pvp-end-request'){client.combat?.authority.requestEnd(client.id);return;}
      if(m.type==='pvp-retry'){client.combat?.authority.requestRetry(client.id,m.payload.round);return;}
      if(m.type==='pvp-skill-use'){
        const result=client.combat?.authority.useSkill(client.id,m.payload)??{accepted:false,reason:'unauthorized'};
        const {skillId,round,castSeq}=m.payload;
        send(client,'pvp-skill-result',{skillId,round,castSeq,...result},{roomId:client.roomId});return;
      }
      if(m.type==='pvp-hit-attempt'){
        console.debug('[PvP hit] attempt',{roomId:client.roomId,projectileId:m.payload.projectileId,shooterId:client.pvpPlayerId,targetId:m.payload.targetId});
        const result=client.combat?.authority.attempt(client.id,m.payload);
        if(result){if(result.accepted)combatBroadcast(client.roomId,'pvp-hit-result',result);
          else send(client,'pvp-hit-result',result,{roomId:client.roomId});}
        else send(client,'pvp-combat-error',{reason:'PvP hit requires an authenticated local authority.'},{roomId:client.roomId});
        return;
      }
      if(m.type==='peer-ping'||m.type==='peer-pong'){
        const peer=clients.get(m.payload.peerId);
        if(peer&&peer!==client&&peer.roomId===client.roomId)
          send(peer,m.type,{peerId:peer.id,pingId:m.payload.pingId},{roomId:client.roomId,senderId:client.id,seq:m.seq,sentAt:m.sentAt,channel:'reliable'});
        return;
      }
      let payload;
      // Copy only allowed payload fields; identity always comes from the server.
      if(['pvp-movement','pvp-projectile-spawn','pvp-projectile-destroy'].includes(m.type)){
        if(client.pvpPlayerId&&client.pvpPlayerId!==m.payload.playerId){ws.close(1008,'PvP player changed');return;}
        client.pvpPlayerId=m.payload.playerId;
      }
      if(m.type==='pvp-movement'){
        const {playerId,x,y,vx,vy,direction,moving,sampleSeq,life,teleport}=m.payload;
        payload={playerId,x,y,vx,vy,direction,moving,sampleSeq,life,...(teleport===true?{teleport:true}:{})};
        // A peer cannot switch players mid-room. With the local PvP bridge,
        // membership is also authenticated before samples are forwarded.
        if(client.movement&&playerId!==client.movement.playerId){ws.close(1008,'Movement player changed');return;}
        if(client.movement&&(life<client.movement.life||(life===client.movement.life&&sampleSeq<=client.movement.sampleSeq))){
          console.debug('[PvP movement] discarded stale', {roomId:client.roomId,peerId:client.id,playerId,sampleSeq,life,previousLife:client.movement.life});return;
        }
        if(bridge&&!client.combat?.authority.movement(client.id,payload))return;
        client.movement=payload;
      }else if(m.type==='pvp-projectile-spawn'){
        const {projectileId,playerId,life,shotSeq,x,y,vx,vy,ttlMs}=m.payload;
        payload={projectileId,playerId,life,shotSeq,x,y,vx,vy,ttlMs};
        if(bridge&&!client.combat?.authority.spawn(client.id,payload))return;
      }else if(m.type==='pvp-projectile-destroy'){
        const {projectileId,playerId,life,shotSeq}=m.payload;payload={projectileId,playerId,life,shotSeq};
        if(bridge&&!client.combat?.authority.destroy(client.id,payload))return;
      }else if(m.type==='position'){const {x,y,vx,vy}=m.payload;payload={x,y,vx,vy,sampleSeq:m.payload.sampleSeq??m.seq};
        if(client.position&&payload.sampleSeq<=client.position.sampleSeq)return;client.position=payload;}
      else if(m.type==='projectile-spawn'){
        const {id,x,y,vx,vy,ttlMs}=m.payload;
        if(!id.startsWith(client.id+'-')){ws.close(1008,'Invalid projectile owner');return;}
        payload={id,x,y,vx,vy,ttlMs,startedAt:Math.max(now()-ttlMs,Math.min(now()+1000,m.payload.startedAt))};
        if(m.payload.pulse)payload.pulse={...m.payload.pulse};
      }else if(m.type==='projectile-destroy'){
        if(!m.payload.id.startsWith(client.id+'-')){ws.close(1008,'Invalid projectile owner');return;}payload={id:m.payload.id};
      }else if(m.type==='test-event')payload={value:m.payload.value};
      else if(m.type==='pulse-start'||m.type==='pulse-end')payload={...m.payload};
      else payload={targetId:m.payload.targetId,summary:m.payload.summary};
      broadcast(client,m.type,payload,{seq:m.seq,sentAt:m.sentAt,channel:m.channel});
    });
  });
  const ready=new Promise((resolve,reject)=>{wss.once('listening',resolve);wss.once('error',reject);});
  return {wss,clients,rooms,authorities,ready,sweep,close:async()=>{clearInterval(interval);
    const pending=[...pendingMirrors,...[...authorities.values()].map(async entry=>{await entry.ready;return entry.authority?.queue;})];
    for(const entry of authorities.values()){entry.off?.();entry.authority?.close();}authorities.clear();
    for(const c of clients.values())c.ws.terminate();await new Promise(resolve=>wss.close(resolve));
    await Promise.allSettled(pending);await bridge?.close?.();}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const host=process.env.REALTIME_HOST||REALTIME_CONFIG.host,port=Number(process.env.REALTIME_PORT||REALTIME_CONFIG.port);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid REALTIME_PORT');
  let pvpBridge;
  try{pvpBridge=await createLocalPvpBridge();}catch{console.warn('PvP damage disabled: start the project LOCAL Convex backend, then restart this relay. Lab remains available.');}
  const server=createRealtimeServer({host,port,pvpBridge});
  await server.ready;console.log(`DEV Realtime relay: ws://${host}:${port}; local PvP authority ${pvpBridge?'enabled':'unavailable'}`);
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close().then(()=>process.exit(0)));
}
