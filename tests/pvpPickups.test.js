import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpPickupAuthority } from '../src/pvp/pickups/PvpPickupAuthority.js';
import { PvpPickupView } from '../src/pvp/pickups/PvpPickupView.js';
import { PVP_PICKUP_RULES,PVP_PICKUP_SPOTS } from '../src/pvp/pickups/config.js';
import { pickupSpotsFromMap } from '../src/pvp/pickups/spots.js';
import { PVP_MAP_DEFINITION,PVP_RULES,pvpRoom } from '../src/pvp/config.js';
import { newFighter } from '../src/pvp/matchState.js';
import { effectiveMatchSettings } from '../src/pvp/matchSettings.js';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';
import { validServerMessage,validClientMessage } from '../src/realtime/realtimeMessages.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';

const source=JSON.parse(readFileSync(new URL('../public/assets/maps/payload-map.tmj',import.meta.url),'utf8'));
const spots=pickupSpotsFromMap(source),health=spots.find(spot=>spot.type==='health');
function match(mode='tdm',matchSettings={}){
  const room=pvpRoom('pickup-match');
  return {mode,arenaMap:PVP_MAP_DEFINITION,matchId:'pickup-match',room,round:0,damageRevision:0,matchSettings,
    state:'active',hostPlayerId:'alice',startedAt:0,endsAt:999999,expiresAt:999999,
    scores:{A:0,B:0},scoreLimit:5,timeLimitMs:PVP_RULES.timeLimitMs,respawnMs:PVP_RULES.respawnMs,
    participants:[['alice','A'],['bob','B']].map(([playerId,team])=>newFighter({playerId,team,presenceRoom:room},matchSettings))};
}
function clock(){
  let at=10000,serial=0;const jobs=new Map();
  return {jobs,now:()=>at,schedule(fn,delay){const id=++serial;jobs.set(id,{fn,at:at+delay});return id;},cancel(id){jobs.delete(id);},
    tick(to){for(let count=0;;count++){
      const next=[...jobs].filter(([,job])=>job.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;assert.ok(count<1000,'bounded server deadlines');
      const [id,job]=next;jobs.delete(id);at=job.at;job.fn();
    }at=to;}};
}
function fixture({mode='tdm',matchSettings={}}={}){
  const time=clock(),packets=[],commits=[],errors=[];
  const authority=new PvpDamageAuthority(match(mode,matchSettings),{...time,pickupSpots:spots,authorityId:'pickup-authority',
    onState:packet=>packets.push(packet),onFailure:error=>errors.push(error),commit:async args=>{commits.push(args);return {applied:true};}});
  authority.register('alice','peer-alice');authority.register('bob','peer-bob');
  return {authority,time,packets,commits,errors,player:id=>authority.state.participants.find(player=>player.playerId===id),
    pickup:id=>authority.pickups.snapshot().find(pickup=>pickup.id===(id??health.id)),
    move(id='alice',position=health,life=0){return authority.movement(`peer-${id}`,{playerId:id,life,x:position.x,y:position.y,moving:false,vx:0,vy:0,sampleSeq:1});}};
}

test('authored Notes pickup points are centers; reserved buff rectangles and layer offsets are recognized',()=>{
  assert.deepEqual(new Set(spots.map(spot=>spot.id)),new Set(Object.keys(PVP_PICKUP_SPOTS)));
  assert.ok(spots.every(spot=>spot.layer==='Notes'));
  for(const spot of spots){
    const object=source.layers.find(layer=>layer.name==='Notes').objects.find(object=>object.name===spot.id);
    assert.equal(spot.x,object.x+(object.point?0:object.width/2));
    assert.equal(spot.y,object.y+(object.point?0:object.height/2));
  }
  const shifted=pickupSpotsFromMap({layers:[{type:'objectgroup',name:'Existing markers',offsetx:12,offsety:-7,
    objects:[{name:'heal-top-blue',point:true,x:10,y:20}]}]});
  assert.deepEqual(shifted,[{id:'heal-top-blue',type:'health',layer:'Existing markers',x:22,y:13}]);
});

test('TDM and Payload health packs heal to effective Max HP, including the Team B override, and mirror HP atomically',async()=>{
  for(const mode of ['tdm','payload']){
    const f=fixture({mode,matchSettings:{maxHp:135,teamOverrides:{B:{maxHp:180}}}});
    try{
      for(const [id,index,maxHp] of [['alice',0,135],['bob',1,180]]){
        f.player(id).hp=20;
        const spot=spots.filter(spot=>spot.type==='health')[index];
        assert.equal(f.move(id,spot),true);assert.equal(f.player(id).hp,maxHp);
        const packet=f.packets.at(-1);
        assert.equal(packet.players.find(player=>player.playerId===id).hp,maxHp);
        assert.equal(packet.pickups.find(pickup=>pickup.id===spot.id).available,false);
        assert.equal(packet.pickups.find(pickup=>pickup.id===spot.id).respawnAt,f.time.now()+PVP_PICKUP_RULES.healRespawnMs);
        assert.equal(validServerMessage({type:'pvp-combat-state',roomId:pvpRealtimeRoom('pickup-match'),serverTime:f.time.now(),payload:packet}),true);
      }
      await f.authority.queue;assert.equal(f.errors.length,0);
      assert.equal(f.commits.at(-1).snapshot.players.find(player=>player.playerId==='bob').hp,180);
      assert.equal(f.commits.at(-1).snapshot.pickups,undefined,'ephemeral pickup clocks stay in the round relay');
    }finally{f.authority.close();}
  }
});

test('full HP leaves a pack available; simultaneous wounded players consume it only once',()=>{
  const f=fixture();
  try{
    f.move();assert.equal(f.pickup().available,true);assert.equal(f.pickup().respawnAt,null);assert.equal(f.commits.length,0);
    f.player('alice').hp=30;f.player('bob').hp=40;
    f.move('alice');f.move('bob');
    assert.equal(f.player('alice').hp,effectiveMatchSettings(f.authority.state,'A').maxHp);
    assert.equal(f.player('bob').hp,40);assert.equal(f.authority.revision,1);
    assert.equal(f.pickup().available,false);
  }finally{f.authority.close();}
});

test('collection validates authenticated ownership, current life/round, alive status, presence and logical radius',()=>{
  const f=fixture();
  try{
    f.player('alice').hp=25;
    assert.equal(f.authority.movement('stranger',{playerId:'alice',life:0,...health,moving:false}),false);
    assert.equal(f.move('alice',health,99),false);
    f.move('alice',{x:health.x+PVP_PICKUP_RULES.collectionRadius+1,y:health.y});assert.equal(f.pickup().available,true);
    f.player('alice').presenceRoom='other-room';f.move();assert.equal(f.pickup().available,true);
    f.player('alice').presenceRoom=f.authority.state.room;f.player('alice').hp=0;f.move();assert.equal(f.pickup().available,true);
    const state={...f.authority.state,round:1},player={...f.player('alice'),hp:25};
    assert.equal(f.authority.pickups.collect(health.id,player,{...health,life:0},state,f.time.now()),null);
    assert.equal(f.authority.pickups.collect('missing',player,{...health,life:0},f.authority.state,f.time.now()),null);
    for(const spot of spots.filter(spot=>spot.type==='buff')){
      assert.equal(f.authority.pickups.collect(spot.id,player,{...spot,life:0},f.authority.state,f.time.now()),null);
      assert.deepEqual(f.pickup(spot.id),{id:spot.id,type:'buff',x:spot.x,y:spot.y,available:false,respawnAt:null});
    }
    assert.equal(validClientMessage({type:'pvp-combat-state',roomId:'room',channel:'reliable',seq:1,sentAt:1,payload:{pickups:[]}}),false);
    assert.equal(f.pickup().available,true);
  }finally{f.authority.close();}
});

test('the server deadline respawns packs; match end cancels deadlines and never accepts more collections',()=>{
  const f=fixture();
  try{
    f.player('alice').hp=25;f.move();const deadline=f.pickup().respawnAt;
    assert.equal(f.authority.deadline,deadline);
    f.time.tick(deadline-1);assert.equal(f.pickup().available,false);
    f.time.tick(deadline);assert.equal(f.pickup().available,true);assert.equal(f.pickup().respawnAt,null);
    assert.equal(f.packets.at(-1).pickups.find(pickup=>pickup.id===health.id).available,true);
    f.player('alice').hp=25;f.move();const timer=f.authority.timer;
    f.authority.requestEnd('peer-alice');assert.equal(f.time.jobs.has(timer),false);assert.equal(f.pickup().respawnAt,null);
    f.player('alice').hp=25;assert.equal(f.move(),false);f.time.tick(deadline+PVP_PICKUP_RULES.healRespawnMs);
    assert.equal(f.pickup().available,false);assert.equal(f.player('alice').hp,25);
  }finally{f.authority.close();assert.equal(f.time.jobs.size,0);}
});

test('full healing coexists with Payload regen without resetting its schedule',()=>{
  const f=fixture({mode:'payload'});
  try{
    f.player('alice').hp=30;f.player('bob').hp=30;
    f.authority.regen.set('alice',{life:0,nextAt:13000});f.authority.regen.set('bob',{life:0,nextAt:13000});
    f.move();assert.equal(f.player('alice').hp,effectiveMatchSettings(f.authority.state,'A').maxHp);
    assert.equal(f.authority.regen.get('alice').nextAt,13000);
    f.time.tick(13000);assert.equal(f.player('bob').hp,33);assert.equal(f.authority.regen.has('alice'),false);
  }finally{f.authority.close();}
});

function displayObject(){
  const object={visible:true,x:0,y:0};
  for(const name of ['fillStyle','fillCircle','fillEllipse','lineStyle','strokeCircle','fillRect','fillRoundedRect','strokeRoundedRect','setOrigin'])object[name]=()=>object;
  for(const [method,key] of [['setVisible','visible'],['setDepth','depth'],['setScale','scale'],['setRotation','rotation'],['setAlpha','alpha'],['setText','text']])
    object[method]=value=>{object[key]=value;return object;};
  object.setPosition=(x,y)=>{object.x=x;object.y=y;return object;};object.destroy=()=>object.destroyed=true;
  return object;
}
test('the view hides packs until authoritative state and does not infer respawn from a browser clock',()=>{
  const scene={source,add:{graphics:displayObject},textures:{exists:()=>false}};
  const view=new PvpPickupView(scene,{now:()=>0,config:{health:{scale:8,offsetX:77,bobDistance:0,collectEffect:false,respawnEffect:false}}});
  const state=match(),authority=new PvpPickupAuthority(spots,0);
  view.render(state,10000);assert.ok([...view.items.values()].every(item=>!item.icon.visible));
  view.render({...state,pickups:authority.snapshot()},10000);assert.equal(view.items.get(health.id).icon.visible,true);
  const player={...state.participants[0],hp:25};authority.collect(health.id,player,{...health,life:0},state,10000);
  const unavailable={...state,pickups:authority.snapshot()};view.render(unavailable,10000);
  view.render(unavailable,999999);assert.equal(view.items.get(health.id).icon.visible,false);
  view.reset();assert.ok([...view.items.values()].every(item=>!item.icon.visible));
  assert.equal(view.items.size,4,'reserved buffs have no visible gameplay');
  view.destroy();authority.close();
});

test('pickup view transitions reuse objects and clean up on Retry, end and recreation',()=>{
  const active=new Set(),objects=[];let added=0,at=0;
  const scene={source,textures:{exists:()=>false},add:{graphics:()=>{
    const object=displayObject();objects.push(object);return object;
  }},tweens:{
    add(options){const tween={options};active.add(tween);added++;return tween;},
    killTweensOf(target){for(const tween of active)if(tween.options.targets===target)active.delete(tween);},
  }};
  const finish=tween=>{
    for(const key of ['alpha','scale','glowBoost','glowScale'])tween.options.targets[key]=tween.options[key];
    active.delete(tween);tween.options.onComplete();
  };
  const authority=new PvpPickupAuthority(spots,0),state={...match(),pickups:authority.snapshot()};
  const consumed={...state,pickups:state.pickups.map(row=>row.id===health.id?{...row,available:false,respawnAt:30000}:row)};
  const original=structuredClone(consumed);
  const view=new PvpPickupView(scene,{now:()=>at});
  view.render(state);const item=view.items.get(health.id),objectCount=objects.length;
  assert.equal(added,0,'idle needs no tweens');
  const groundY=item.glow.y;at=600;view.render(state);
  assert.notEqual(item.icon.y,health.y);assert.equal(item.glow.y,groundY);
  assert.ok(item.glow.depth<0&&item.glow.depth<item.icon.depth,'glow stays on the ground, below players');
  view.render(consumed);assert.equal(item.icon.visible,true,'collection leaves only a cosmetic afterimage');
  assert.equal(active.size,1);const collected=item.tween;
  for(let frame=0;frame<60;frame++){at+=16;view.render(consumed);}
  assert.equal(added,1);assert.equal(objects.length,objectCount,'no per-frame tween or object allocation');
  finish(collected);assert.equal(item.icon.visible,false);assert.equal(item.glow.visible,false);
  view.render(consumed,999999);assert.equal(item.icon.visible,false,'browser time cannot respawn the pack');
  assert.deepEqual(consumed,original,'visuals never mutate the snapshot');
  view.render(state);assert.equal(item.animation.alpha,0);assert.equal(item.icon.scale,.8);
  assert.equal(active.size,1);finish(item.tween);view.render(state);
  assert.equal(item.icon.alpha,1);assert.equal(item.icon.scale,1);
  view.render(consumed);const cancelled=item.tween;
  view.render({...state,round:1});assert.equal(active.size,0);
  cancelled.options.onComplete();assert.equal(item.icon.visible,true,'old callbacks cannot hide a new round');
  assert.equal(item.icon.alpha,1);assert.equal(item.icon.scale,1);
  view.render({...consumed,round:1});assert.equal(active.size,1);
  view.render({...state,round:1,state:'ended'});assert.equal(active.size,0);
  assert.ok([...view.items.values()].every(row=>!row.icon.visible&&!row.glow.visible));
  view.render({...state,round:2});view.render({...consumed,round:2});assert.equal(active.size,1);
  view.destroy();assert.equal(active.size,0);assert.ok(objects.every(object=>object.destroyed));
  const replacement=new PvpPickupView(scene,{now:()=>at});replacement.render({...state,round:3});
  assert.equal(replacement.items.size,4);assert.equal(active.size,0);
  assert.ok([...replacement.items.values()].every(row=>row.icon.visible&&row.glow.visible));
  replacement.destroy();assert.ok(objects.every(object=>object.destroyed));authority.close();
});

async function waitFor(predicate){
  const deadline=Date.now()+4000;
  while(!predicate()){if(Date.now()>deadline)throw new Error('Pickup relay test timeout');await new Promise(resolve=>setTimeout(resolve,5));}
}
test('real relay synchronizes two clients and Retry creates fresh available packs and cancels the old round clocks',async()=>{
  const time=clock();let current=match();current.participants.forEach(player=>player.hp=25);
  const bridge={async authenticate(args){assert.equal(args.round,current.round);return structuredClone(current);},
    subscribe(){return ()=>{};},async commit(){return {applied:true};},async nextRound(args){
      current={...current,round:args.round+1,state:'countdown',startedAt:args.startedAt,endsAt:args.startedAt+PVP_RULES.timeLimitMs,
        participants:current.participants.map(player=>({...newFighter(player,current.matchSettings),life:player.life+1}))};
      return structuredClone(current);
    }};
  const server=createRealtimeServer({...time,port:0,heartbeatMs:60000,pvpBridge:bridge});await server.ready;
  const peers=[];
  async function connect(playerId){
    const transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:pvpRealtimeRoom(current.matchId,0),WebSocketImpl:WebSocket});
    const messages=[],updates=[];
    transport.onMessage(message=>{messages.push(message);if(message.type==='welcome')transport.sendReliable('join-room',{});});
    const movement={transport,match:current,playerId,round:0,roomId:transport.roomId,joined:false,closed:false,config:{debug:false}};
    const client=new PvpDamageClient(movement,{matchId:current.matchId,sessionId:`session-${playerId}`,
      onError:error=>{throw error;},onState:state=>{movement.match=state;updates.push(state);},onRound:state=>{
        movement.match=state;movement.round=state.round;movement.roomId=pvpRealtimeRoom(state.matchId,state.round);
        transport.roomId=movement.roomId;transport.sendReliable('join-room',{});
      }});
    peers.push({transport,client,movement,messages,updates});
    await transport.connect();await waitFor(()=>client.authorized&&updates.length>0);return peers.at(-1);
  }
  try{
    const a=await connect('alice'),b=await connect('bob');
    const old=server.authorities.get(pvpRealtimeRoom(current.matchId,0)).authority;
    a.transport.sendReliable('pvp-movement',{playerId:'alice',x:health.x,y:health.y,vx:0,vy:0,moving:false,direction:'down',sampleSeq:1,life:0});
    await waitFor(()=>b.updates.at(-1)?.pickups.find(pickup=>pickup.id===health.id)?.available===false);
    assert.deepEqual(a.updates.at(-1).pickups,b.updates.at(-1).pickups);
    assert.equal(b.updates.at(-1).participants.find(player=>player.playerId==='alice').hp,effectiveMatchSettings(old.state,'A').maxHp);
    assert.equal(b.client.project(current).pickups.find(pickup=>pickup.id===health.id).available,false,'a delayed Convex echo cannot restore availability');
    const cooldownTimer=old.timer;
    a.client.requestEnd();await waitFor(()=>a.client.hp.retry&&b.client.hp.retry);
    assert.equal(time.jobs.has(cooldownTimer),false);
    a.client.requestRetry();b.client.requestRetry();
    await waitFor(()=>a.client.authorized&&b.client.authorized&&a.client.hp?.round===1&&b.client.hp?.round===1);
    assert.equal(old.closed,true);assert.equal(old.timer,undefined);assert.equal(old.pickups.snapshot().length,0);
    for(const peer of peers){
      const snapshot=peer.updates.at(-1);
      assert.ok(snapshot.pickups.filter(pickup=>pickup.type==='health').every(pickup=>pickup.available&&pickup.respawnAt===null));
      assert.ok(snapshot.pickups.filter(pickup=>pickup.type==='buff').every(pickup=>!pickup.available&&pickup.respawnAt===null));
    }
    assert.deepEqual(a.updates.at(-1).pickups,b.updates.at(-1).pickups);
  }finally{for(const peer of peers){peer.client.close();peer.transport.disconnect();}await server.close();assert.equal(time.jobs.size,0);}
});
