import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PVP_MOVEMENT_CONFIG,pvpRealtimeRoom,pvpRealtimeUrl,pvpMovementDebugEnabled } from '../src/pvp/movementConfig.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validClientMessage,validPvpMovement } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { RemotePlayers } from '../src/multiplayer/RemotePlayers.js';
import { Presence } from '../src/multiplayer/Presence.js';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { readPvpTeleportAreas,PvpTeleportController } from '../src/pvp/teleports.js';
import { PVP_MAP_DEFINITION } from '../src/pvp/config.js';
import { requirePvpMap } from '../src/pvp/mapConfig.js';
import { matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings } from '../src/pvp/matchSettings.js';
import { applyLocalAppearance } from '../src/characterAppearance.js';

const match=()=>({arenaMap:PVP_MAP_DEFINITION,round:2,state:'active',participants:[
  {playerId:'alice',displayName:'Alice',characterBaseId:'michael',team:'A',life:0,hp:100},
  {playerId:'bob',displayName:'Bob',characterBaseId:'michael',team:'B',life:0,hp:100},
]});
const movement=(extra={})=>({playerId:'bob',x:950,y:650,vx:180,vy:0,direction:'right',moving:true,sampleSeq:1,life:0,...extra});
class FakeTransport extends RealtimeTransport {
  constructor(){super();this.sent=[];this.clientId='local-peer';}
  connect(){this.setState('connected');return Promise.resolve();}
  disconnect(){this.disconnected=true;this.setState('disconnected');}
  sendReliable(type,payload){this.sent.push({type,payload,channel:'reliable'});return true;}
  sendUnreliable(type,payload){this.sent.push({type,payload,channel:'unreliable'});return true;}
  getStats(){return {clientId:this.clientId};}
}
function fixture(t,{hz=20,...options}={}){
  let now=0;const transport=new FakeTransport(),calls=[],logs=[],rosters=[];
  const remotes={bufferOptions:{},receive:(rows,options)=>rosters.push({rows,options}),receiveMovement:(...args)=>calls.push(args)};
  const client=new PvpMovementClient({matchId:'match-a',match:match(),playerId:'alice',transport,
    remotes,getSpawn:()=>({x:100,y:200}),snapshot:()=>movement({playerId:'alice'}),
    now:()=>now,log:(...args)=>logs.push(args),config:{hz},...options});
  t.after(()=>client.close());
  const emit=(type,payload,extra={})=>transport.emitMessage({type,payload,roomId:client.roomId,...extra});
  const join=()=>{emit('welcome',{});emit('room-state',{peers:[{clientId:'remote-peer',position:null}]});};
  const remote=(payload=movement(),extra={})=>emit('pvp-movement',payload,{senderId:'remote-peer',seq:payload.sampleSeq,sentAt:1,...extra});
  return {client,transport,calls,logs,rosters,emit,join,remote,setTime:value=>now=value};
}

test('PvP room includes match and round; default URL follows localhost or HTTPS tunnel',()=>{
  assert.equal(pvpRealtimeRoom('abc',2),'pvp-abc-2');
  assert.notEqual(pvpRealtimeRoom('abc',2),pvpRealtimeRoom('abc',3));
  assert.equal(PVP_MOVEMENT_CONFIG.hz,20);
  assert.equal(pvpRealtimeUrl({}, {origin:'http://localhost:5173'}),'ws://localhost:5173/pvp-realtime');
  assert.equal(pvpRealtimeUrl({}, {origin:'https://game.trycloudflare.com'}),'wss://game.trycloudflare.com/pvp-realtime');
  assert.equal(pvpRealtimeUrl({VITE_REALTIME_URL:'wss://relay.example/ws'}),'wss://relay.example/ws');
  assert.equal(pvpRealtimeUrl({VITE_REALTIME_URL:'https://relay.example'}),'wss://relay.example/');
  assert.throws(()=>pvpRealtimeUrl({VITE_REALTIME_URL:'ftp://relay.example'}));
});

test('PvP validation allows arena coordinates beyond lab bounds but rejects malformed movement',()=>{
  assert.ok(validPvpMovement(movement()));
  assert.ok(validClientMessage({type:'pvp-movement',payload:movement(),roomId:'pvp-a-0',seq:1,sentAt:1000,channel:'unreliable'}));
  assert.ok(validPvpMovement(movement({teleport:true})));
  for(const extra of [{x:NaN},{x:Infinity},{vx:1001},{direction:'invalid'},{moving:0},{sampleSeq:0},{life:-1},{playerId:''},{teleport:'yes'}])
    assert.equal(validPvpMovement(movement(extra)),false);
});

test('authorization publishes the initial pose before enabling hits, bypasses an already advanced deadline, and is idempotent',t=>{
  const f=fixture(t);f.join();f.client.update(); // Relay discards this pre-auth tick.
  let damage;const beforeAuthorized=[];
  const send=f.transport.sendReliable.bind(f.transport);
  f.transport.sendReliable=(type,payload)=>{
    if(type==='pvp-movement')beforeAuthorized.push(damage.authorized);
    return send(type,payload);
  };
  damage=new PvpDamageClient(f.client,{matchId:'match-a',sessionId:'session-a',onState(){}});
  t.after(()=>damage.close());
  f.setTime(5);f.emit('pvp-authorized',{playerId:'alice',round:2});
  const sent=f.transport.sent.filter(m=>m.type==='pvp-movement');
  assert.equal(sent.length,2);assert.equal(sent[1].channel,'reliable');
  assert.equal(sent[1].payload.sampleSeq,2);assert.equal(sent[1].payload.life,0);
  assert.deepEqual(beforeAuthorized,[false]);assert.equal(damage.authorized,true);
  assert.equal(f.client.authorizedPoseSent,true);
  f.emit('pvp-authorized',{playerId:'alice',round:2});f.client.update(5);
  assert.equal(f.transport.sent.filter(m=>m.type==='pvp-movement').length,2);
  f.client.update(55);assert.equal(f.transport.sent.filter(m=>m.type==='pvp-movement').length,3);
  f.client.switchRound({...match(),round:3,state:'countdown',matchId:'match-a'});
  assert.equal(f.client.authorizedPoseSent,false);
  f.emit('room-state',{peers:[]});f.emit('pvp-authorized',{playerId:'alice',round:2});
  assert.equal(f.client.authorizedPoseSent,false,'old-round auth cannot initialize a new round');
  f.emit('pvp-authorized',{playerId:'alice',round:3});assert.equal(f.client.authorizedPoseSent,true);
});

test('teleport marks the next realtime position for immediate remote snapping',t=>{
  const {remotes}=rendererFixture(),f=fixture(t,{remotes});f.join();
  f.client.receiveRoster([{playerId:'bob',x:100,y:200,displayName:'Bob',characterBaseId:'michael'}]);
  f.remote(movement({x:300,y:200,sampleSeq:1}));
  const remote=remotes.players.get('bob');assert.equal(remote.buffer.snapshots.length,1);
  f.client.markTeleport();f.setTime(50);f.client.update(50);
  const sent=f.transport.sent.filter(message=>message.type==='pvp-movement').at(-1);
  assert.equal(sent.payload.teleport,true);assert.equal(sent.payload.x,950);
  f.remote(movement({x:950,y:200,sampleSeq:2,teleport:true}));
  assert.equal(remote.buffer.snapshots.length,1,'teleport clears old interpolation snapshots');
  assert.equal(remote.sprite.x,950,'remote sprite snaps to the new position');
});

for(const hz of [20,25,30,40,50])test(`movement cadence ${hz} Hz uses one configuration and skips missed slots`,t=>{
  const f=fixture(t,{hz});f.client.update();assert.equal(f.transport.sent.length,0);
  f.join();
  for(let at=0;at<1000;at+=5){f.setTime(at);f.client.update();}
  let sent=f.transport.sent.filter(m=>m.type==='pvp-movement');
  assert.equal(sent.length,hz);assert.equal(sent[0].channel,'unreliable');
  assert.deepEqual(sent.map(m=>m.payload.sampleSeq),Array.from({length:hz},(_,i)=>i+1));
  f.setTime(10000);f.client.update();f.client.update();
  sent=f.transport.sent.filter(m=>m.type==='pvp-movement');assert.equal(sent.length,hz+1);
});

test('remote movement ignores self, unrelated rooms/players/peers/lives and stale sequences',t=>{
  const f=fixture(t);f.join();
  f.remote(movement({playerId:'alice'}));
  f.remote(movement(),{roomId:'another-room'});
  f.emit('peer-joined',{clientId:'outsider-peer'});
  f.remote(movement({playerId:'outsider'}),{senderId:'outsider-peer'});
  f.remote(movement(),{senderId:'unknown-peer'});
  f.remote(movement({life:1}));assert.equal(f.calls.length,0);
  f.remote(movement({sampleSeq:2}),{seq:10,sentAt:9000});
  assert.equal(f.calls.length,1);assert.deepEqual(f.calls[0][2],{reset:true});
  f.remote(movement({sampleSeq:1}),{seq:11,sentAt:10000});
  f.remote(movement({sampleSeq:2}),{seq:12});
  f.remote(movement({sampleSeq:3}),{seq:9});assert.equal(f.calls.length,1);
  // Remote clocks may differ: ordering uses sequences, not cross-client timestamps.
  f.remote(movement({sampleSeq:3}),{seq:13,sentAt:1});assert.equal(f.calls.length,2);
  assert.equal(f.logs.filter(([event])=>event==='discarded stale').length,3);
  assert.ok(f.logs.some(([event,data])=>event==='remote sender'&&data.playerId==='bob'));
});

test('metadata cannot overwrite movement; peer departure/reconnection resets ordering and interpolation',t=>{
  const f=fixture(t);f.join();f.remote();
  f.client.receiveRoster([{playerId:'bob',x:9999,y:9999,lastSeen:Date.now(),equippedSkin:'remastered'}]);
  assert.deepEqual(f.rosters.at(-1).options,{movement:false});
  assert.equal(f.rosters.at(-1).rows[0].x,100);assert.equal(f.calls.length,1);
  f.emit('peer-joined',{clientId:'new-peer'});
  f.remote(movement(),{senderId:'new-peer'});assert.equal(f.calls.length,1);
  f.emit('peer-left',{clientId:'remote-peer'});
  f.remote(movement(),{senderId:'new-peer'});assert.equal(f.calls.length,2);
  assert.equal(f.calls.at(-1)[2].reset,true);
  const next=match();next.participants[1].life=1;f.client.setMatch(next);
  f.remote(movement({sampleSeq:2}),{senderId:'new-peer'});assert.equal(f.calls.length,2);
  f.remote(movement({sampleSeq:3,life:1}),{senderId:'new-peer'});
  assert.equal(f.calls.at(-1)[2].reset,true);
});

test('explicit teleport movement clears remote interpolation and snaps the sprite immediately',t=>{
  const {remotes}=rendererFixture(),f=fixture(t,{remotes});f.join();
  f.client.receiveRoster([{playerId:'bob',x:100,y:200,displayName:'Bob',characterBaseId:'michael'}]);
  f.remote(movement({x:300,y:200,sampleSeq:1}));
  const remote=remotes.players.get('bob');assert.equal(remote.buffer.snapshots.length,1);
  f.remote(movement({x:950,y:200,sampleSeq:2,teleport:true}));
  assert.equal(remote.buffer.snapshots.length,1,'pre-teleport snapshots are discarded');
  assert.equal(remote.sprite.x,950);assert.equal(remote.sprite.y,200);

  const local=fixture(t);local.join();local.client.markTeleport();local.client.update(0);
  const sent=local.transport.sent.filter(message=>message.type==='pvp-movement').at(-1);
  assert.equal(sent.payload.teleport,true);assert.equal(sent.payload.x,950);
});

test('remote renderer interpolates the realtime stream and holds on underrun without Convex positions',t=>{
  let at=0;
  const object=(x,y)=>({x,y,anims:{stop(){},play(){}},setOrigin(){return this;},setTexture(){return this;},
    setScale(){return this;},setFlipX(){return this;},setText(){return this;},setDepth(){return this;},
    setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){}});
  const remotes=new RemotePlayers({add:{sprite:object,text:object}},{clock:()=>at});
  const f=fixture(t,{remotes});f.join();
  f.remote(movement({x:900}));at=50;f.remote(movement({x:910,sampleSeq:2}));
  at=125;remotes.update();assert.equal(remotes.players.get('bob').sprite.x,905);
  f.client.receiveRoster([{playerId:'bob',x:0,y:0,lastSeen:999999}]);
  remotes.update();assert.equal(remotes.players.get('bob').sprite.x,905);
  at=1000;remotes.update();assert.equal(remotes.players.get('bob').sprite.x,910);
  assert.equal(remotes.players.get('bob').buffer.sample(at).moving,false);
});

function rendererFixture(){
  const sprites=[];
  const object=(x,y)=>({x,y,visible:true,alpha:1,depth:0,texture:{key:'student'},anims:{stop(){},play(){}},
    setOrigin(){return this;},setTexture(key){this.texture={key};return this;},setScale(){return this;},
    setFlipX(){return this;},setText(){return this;},setDepth(value){this.depth=value;return this;},
    setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){this.destroyed=true;}});
  const remotes=new RemotePlayers({add:{sprite:(x,y)=>{const sprite=object(x,y);sprites.push(sprite);return sprite;},text:object}}, {clock:()=>100});
  return {remotes,sprites};
}

test('late PvP skin metadata applies without movement and survives roster gaps and Retry',t=>{
  const {remotes}=rendererFixture();const f=fixture(t,{remotes});
  const remote=remotes.players.get('bob');assert.equal(remote.visual.sprite,'character-michael');
  f.client.receiveRoster([{playerId:'bob',characterBaseId:'michael',equippedSkin:'remastered'}]);
  assert.equal(remote.visual.sprite,'character-michael-new');
  f.client.receiveRoster([]);assert.equal(remote.visual.sprite,'character-michael-new');
  assert.equal(f.client.switchRound({...match(),round:3,state:'countdown'}),true);
  assert.equal(remotes.players.get('bob').visual.sprite,'character-michael-new');
  // Subsequent Presence delivery confirms the same choice without requiring
  // a movement packet in the new round.
  f.client.receiveRoster([{playerId:'bob',characterBaseId:'michael',equippedSkin:'remastered'}]);
  assert.equal(remotes.players.get('bob').visual.sprite,'character-michael-new');
});

test('snapshot before Convex participant data is replayed after roster creation without another network message',t=>{
  const {remotes,sprites}=rendererFixture();const initial=match();initial.participants=initial.participants.slice(0,1);
  const f=fixture(t,{remotes,match:initial,config:{debug:true}});f.join();
  f.remote(movement({x:620,y:300,sampleSeq:2}));
  f.remote(movement({x:10,y:10,sampleSeq:1}));
  assert.equal(remotes.players.size,0);
  f.client.setMatch(match());remotes.update();
  const remote=remotes.players.get('bob');assert.ok(remote);
  assert.equal(sprites.length,1);assert.equal(remote.sprite.x,620);assert.equal(remote.sprite.y,300);
  assert.equal(remote.sprite.texture.key,'character-michael');assert.equal(remote.sprite.visible,true);
  assert.equal(remote.sprite.depth,300);assert.equal(remote.buffer.snapshots.length,1);
  f.client.setMatch(match());assert.equal(remote.buffer.snapshots.length,1);
});

test('snapshot received while the sprite is unavailable survives until the renderer is ready',t=>{
  const {remotes}=rendererFixture();const f=fixture(t,{remotes});f.join();
  remotes.receive([]);f.remote(movement({x:620,y:300}));assert.equal(remotes.players.size,0);
  f.client.receiveRoster([]);remotes.update();
  assert.equal(remotes.players.get('bob').sprite.x,620);
  assert.equal(remotes.players.get('bob').buffer.snapshots.length,1);
  // A renderer recreation must also restore the last applied state without a new packet.
  remotes.receive([]);f.client.receiveRoster([]);remotes.update();
  assert.equal(remotes.players.get('bob').sprite.x,620);
});

test('PvP metadata creates a visible sprite and places its label/depth before the first snapshot',t=>{
  const {remotes}=rendererFixture();fixture(t,{remotes});
  const remote=remotes.players.get('bob');
  assert.equal(remote.sprite.depth,200);assert.equal(remote.label.depth,201);
  assert.equal(remote.label.y,200-remote.visual.labelOffset);
  assert.equal(remote.sprite.texture.key,'character-michael');assert.equal(remote.sprite.visible,true);
  assert.equal(remote.buffer.snapshots.length,0);
});

test('deferred snapshots stay bounded per peer, wait for matching life and are cleared on departure',t=>{
  const initial=match();initial.participants[1].life=0;
  const f=fixture(t,{match:initial,config:{debug:true}});f.join();
  for(let sampleSeq=1;sampleSeq<=50;sampleSeq++)f.remote(movement({life:1,sampleSeq}));
  assert.equal(f.calls.length,0);assert.equal(f.client.received.size,1);
  const next=match();next.participants[1].life=1;f.client.setMatch(next);
  assert.equal(f.calls.length,1);assert.equal(f.client.received.get('remote-peer').sampleSeq,50);
  f.emit('peer-left',{clientId:'remote-peer'});assert.equal(f.client.received.size,0);
  f.client.setMatch(next);assert.equal(f.calls.length,1);
});

test('PvP debug records each stage and specific discard reasons, and stops on cleanup',t=>{
  const {remotes}=rendererFixture();const f=fixture(t,{remotes,config:{debug:true}});f.join();
  f.remote(movement({x:620,y:300}));remotes.update();
  for(const event of ['remote created','snapshot received','snapshot accepted','movement buffered','snapshot applied','position rendered'])
    assert.ok(f.logs.some(([name])=>name===event),event);
  const rendered=f.logs.find(([name])=>name==='position rendered')[1];
  assert.equal(rendered.texture,'character-michael');assert.equal(rendered.visible,true);assert.equal(rendered.x,620);
  f.remote(movement({playerId:'alice',sampleSeq:2}));
  f.remote(movement({sampleSeq:2}),{roomId:'wrong-room'});
  f.remote(movement({sampleSeq:2}),{senderId:'unknown-peer'});
  f.remote(movement());
  for(const reason of ['self_player','room_mismatch','unknown_peer','stale_sequence'])
    assert.ok(f.logs.some(([name,data])=>name==='snapshot discarded'&&data.reason===reason),reason);
  assert.ok(f.logs.filter(([name])=>name==='snapshot received').every(([,data])=>data.roomId===f.client.roomId&&data.localPlayerId==='alice'));
  f.client.close();assert.equal(remotes.movementDebug,undefined);
  assert.equal(f.transport.messageHandlers.size,0);
  assert.equal(pvpMovementDebugEnabled({}, {getItem:()=> 'true'}),true);
  assert.equal(pvpMovementDebugEnabled({}, {getItem:()=>{throw new Error('Blocked storage');}}),false);
});

test('end, round change and repeated close disconnect and remove listeners; late events cannot move remotes',t=>{
  for(const state of [{...match(),state:'ended'},{...match(),round:3}]){
    const f=fixture(t);f.join();f.client.setMatch(state);f.client.close();
    assert.equal(f.transport.disconnected,true);assert.equal(f.transport.messageHandlers.size,0);
    assert.equal(f.transport.stateHandlers.size,0);f.remote();f.client.update();
    assert.equal(f.calls.length,0);assert.equal(f.transport.sent.filter(m=>m.type==='pvp-movement').length,0);
  }
  const f=fixture(t);f.join();f.remote();f.transport.setState('reconnecting');
  f.client.update();assert.equal(f.transport.sent.filter(m=>m.type==='pvp-movement').length,0);
  f.transport.setState('connected');f.join();f.remote();assert.equal(f.calls.at(-1)[2].reset,true);
});

test('actual PvP scene keeps local input immediate and Convex presence fixed while movement uses the adapter',async()=>{
  const writes=[],transport=new FakeTransport();let at=0,scene;
  const presence=new Presence({onUpdate:()=>()=>{},mutation:async(type,args)=>writes.push({type,args})},
    {players:{inRoom:'inRoom',update:'update',heartbeat:'heartbeat'}},
    {playerId:'alice',characterId:'michael',characterBaseId:'michael',equippedSkin:'remastered',sessionId:'session-alice',displayName:'Alice'});
  const state=match();
  const chain=function(){return this;};
  class MapScene {
    constructor(){
      this.cameras={main:{setZoom(){return this;}}};this.source={layers:[]};
      this.player={x:100,y:200,facing:'right',body:{enable:true,velocity:{x:0,y:0},
        reset:(x,y)=>{this.player.x=x;this.player.y=y;},deltaX:()=>1,deltaY:()=>0},
        setVelocity:(x,y)=>{this.player.body.velocity={x,y};return this.player;},
        setFacing:(direction)=>{this.player.facing=direction;return this.player;},
        update:()=>{this.localUpdates=(this.localUpdates??0)+1;this.player.setVelocity(180,0);},
        setVisible:chain,setAlpha:chain,clearTint:chain,
        setCharacter:(_character,style)=>{this.appliedStyle=style;return this.player;},setCombatHudVisible:chain,setCombatHealth:chain};
      this.remotes={players:new Map(),bufferOptions:{},receive(){},receiveMovement(){},update(){}};
      this.hint={};this.input={keyboard:{resetKeys(){}}};
    }
    travelTo(destination){this.destination=destination;}
    initializePvpTeleports(){this.teleports=new PvpTeleportController(readPvpTeleportAreas(this.source));}
    updatePvpTeleports(){return null;}
  }
  class MatchClient {close(){}request(){return Promise.resolve();}}
  class Hud {constructor(){this.status={};}destroy(){}render(){}}
  class Combat {constructor(){this.remoteShots=new Map();}clear(){}clearRemote(){}destroy(){}update(){}}
  class ReturnFlow {close(){}update(){}remaining(){return null;}}
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replace('export class PvpArenaScene','class PvpArenaScene')
    .replaceAll('import.meta.env','({DEV:true})');
  const Scene=runInNewContext(`${source}\nPvpArenaScene`,{PvpMapScene:MapScene,requirePvpMap,getPresence:()=>presence,createModeView:()=>null,
    PVP_MAP:'pvp-arena-test',PVP_MAP_FILE:'payload-map.tmj',matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings,pvpRoom:id=>`pvp-arena-test:${id}`,
    applyLocalAppearance,isPersistentClassRoom:()=>false,teamSpawn:()=>({x:100,y:200}),pvpRealtimeUrl:()=> 'ws://localhost:8787',
    startSceneEmotes:scene=>{scene.emotesStarted=true;},stopSceneEmotes:scene=>{scene.emotesStarted=false;},
    PvpPickupView:class {reset(){}receive(){}render(){}update(){}destroy(){}},pickupDebugEnabled:()=>false,
    SkillClient:class {reset(){}close(){}update(){}receive(){}},SkillView:class {reset(){}update(){}render(){}renderTargeting(){}receive(){}destroy(){}},
    SkillHud:class {update(){}render(){}destroy(){}},
    pvpMovementDebugEnabled:()=>false,cameraZoomForMap:()=>1.25,readPvpTeleportAreas,PvpTeleportController,
    resolvedMovementState:body=>({moving:true,velocityX:body.velocity.x,velocityY:body.velocity.y}),
    PvpMovementClient:class extends PvpMovementClient {constructor(options){super({...options,transport,now:()=>at,log:()=>{}});}},
    PvpDamageClient,PvpProjectileClient,PvpMatchClient:MatchClient,PvpHud:Hud,PvpCombatController:Combat,PvpReturnFlow:ReturnFlow,endMatch:()=>state,Date});
  try{
    scene=new Scene();scene.enter({pvpMatchId:'match-a',pvpSnapshot:state});
    assert.equal(scene.appliedStyle,'new');
    assert.equal(scene.emotesStarted,true);
    await Promise.resolve();await Promise.resolve();
    assert.equal(writes[0].type,'update');assert.equal(writes[0].args.room,'pvp-arena-test:match-a');
    // The relay is still awaiting its room acknowledgement; input already works.
    scene.update(0,16);assert.equal(scene.localUpdates,1);
    transport.emitMessage({type:'welcome',payload:{}});
    transport.emitMessage({type:'room-state',roomId:scene.movementClient.roomId,payload:{peers:[]}});
    scene.player.x=950;at=50;scene.update(50,16);
    const sent=transport.sent.find(message=>message.type==='pvp-movement');
    assert.equal(sent.payload.x,950);assert.equal(sent.payload.playerId,'alice');
    assert.equal(presence.active.snapshot().x,100);
    await presence.send(presence.active.sentAt+10000);
    assert.equal(writes.at(-1).type,'heartbeat');
    state.participants[0].life=1;scene.update(70,16);
    assert.equal(scene.appliedStyle,'new');assert.equal(presence.identity.equippedSkin,'remastered');
    scene.applyNextRound({...state,round:3,state:'countdown'});
    assert.equal(scene.appliedStyle,'new');assert.equal(presence.identity.equippedSkin,'remastered');
    assert.equal(scene.emotesStarted,true);
    scene.leavePvp();assert.equal(transport.disconnected,true);assert.equal(transport.messageHandlers.size,0);
    scene.stopPvp();scene.stopPvp();assert.equal(scene.movementClient,null);
  }finally{scene?.stopPvp();presence.leave();}
});

async function waitFor(predicate,timeout=3000){
  const until=Date.now()+timeout;
  while(!predicate()){if(Date.now()>until)throw new Error('PvP realtime test timeout');await new Promise(resolve=>setTimeout(resolve,5));}
}

test('Vite same-origin WebSocket proxy forwards the PvP adapter to the relay',async()=>{
  const {createServer}=await import('vite');
  const {default:viteConfig}=await import('../vite.config.js');
  const relay=createRealtimeServer({port:0,heartbeatMs:60000});await relay.ready;
  const proxy=viteConfig.server.proxy[PVP_MOVEMENT_CONFIG.proxyPath];
  assert.equal(proxy.ws,true);
  const vite=await createServer({configFile:false,logLevel:'silent',server:{
    host:'127.0.0.1',port:0,proxy:{[PVP_MOVEMENT_CONFIG.proxyPath]:{
      ...proxy,target:`http://127.0.0.1:${relay.wss.address().port}`,
    }},
  }});
  let transport;
  try{
    await vite.listen();
    const url=pvpRealtimeUrl({}, {origin:`http://127.0.0.1:${vite.httpServer.address().port}`});
    transport=new WebSocketTransport({url,roomId:'pvp-proxy-0',WebSocketImpl:WebSocket});
    let joined=false;
    transport.onMessage(message=>{
      if(message.type==='welcome')transport.sendReliable('join-room',{});
      if(message.type==='room-state')joined=true;
    });
    await transport.connect();await waitFor(()=>joined);
    transport.sendUnreliable('pvp-movement',movement());
    await waitFor(()=>[...relay.clients.values()].some(client=>client.movement?.playerId==='bob'));
    assert.equal(relay.rooms.get('pvp-proxy-0').size,1);
  }finally{transport?.disconnect();await vite.close();await relay.close();}
});

test('real WebSocket PvP clients relay movement only within a match; no echo, stale forwarding or leaked rooms',async()=>{
  const server=createRealtimeServer({port:0,heartbeatMs:60000});await server.ready;
  const url=`ws://127.0.0.1:${server.wss.address().port}`,clients=[];
  const create=(playerId,matchId='match-a')=>{
    const calls=[],transport=new WebSocketTransport({url,roomId:pvpRealtimeRoom(matchId,2),WebSocketImpl:WebSocket});
    const client=new PvpMovementClient({url,transport,matchId,match:match(),playerId,log:()=>{},
      remotes:{bufferOptions:{},receive(){},receiveMovement:(...args)=>calls.push(args)},
      getSpawn:()=>({x:100,y:200}),snapshot:()=>movement({playerId})});
    clients.push(client);return {client,transport,calls};
  };
  try{
    const a=create('alice'),b=create('bob'),other=create('bob','other-match');
    await waitFor(()=>clients.every(c=>c.joined)&&a.client.peers.size===1);
    a.client.update();await waitFor(()=>b.calls.length===1);
    assert.equal(a.calls.length,0);assert.equal(other.calls.length,0);assert.equal(b.calls[0][0],'alice');
    assert.equal(b.calls[0][1].x,950);
    a.transport.sendUnreliable('pvp-movement',movement({playerId:'alice',sampleSeq:1,x:1}));
    a.transport.sendUnreliable('pvp-movement',movement({playerId:'alice',sampleSeq:2,x:980}));
    await waitFor(()=>b.calls.length===2);assert.equal(b.calls[1][1].x,980);
    // Keep the client-side sequence aligned with the two packets injected
    // directly above so the teleport packet remains newer at the relay.
    a.client.sampleSeq=2;
    a.client.markTeleport();a.client.update();
    await waitFor(()=>b.calls.length===3);assert.equal(b.calls[2][2].reset,true);
    a.client.close();await waitFor(()=>b.client.peers.size===0);
    const reconnected=create('alice');await waitFor(()=>reconnected.client.joined&&b.client.peers.size===1);
    reconnected.client.update();await waitFor(()=>b.calls.length===3);assert.equal(b.calls[2][2].reset,true);
    for(const client of clients)client.close();await waitFor(()=>server.clients.size===0);
    assert.equal(server.rooms.size,0);
  }finally{for(const client of clients)client.close();await server.close();}
});
