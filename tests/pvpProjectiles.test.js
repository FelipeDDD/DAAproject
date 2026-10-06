import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { PVP_PROJECTILE_VISUAL } from '../src/pvp/projectileVisual.js';
import { PLAYER_ATTACK_DEPTH,PLAYER_ATTACK_VISUALS,PLAYER_ATTACK_VARIANTS } from '../src/boss/PlayerAttackVisuals.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validPvpProjectile,validClientMessage } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';
import { PVP_RULES } from '../src/pvp/config.js';

const match=()=>({round:0,state:'active',participants:[
  {playerId:'alice',characterBaseId:'michael',team:'A',life:0,hp:100,lastShot:0},
  {playerId:'bob',characterBaseId:'felipe',team:'B',life:0,hp:100,lastShot:0},
]});
const projectile=(extra={})=>({projectileId:'projectile-one',playerId:'bob',life:0,shotSeq:1,x:900,y:700,vx:420,vy:0,ttlMs:1200,...extra});
class Transport extends RealtimeTransport {
  constructor(){super();this.sent=[];}
  connect(){this.setState('connected');return Promise.resolve();}
  disconnect(){this.setState('disconnected');}
  sendReliable(type,payload){this.sent.push({type,payload});return true;}
  sendUnreliable(){return true;}
  getStats(){return {clientId:'local-peer'};}
}
function setup(t,{transport=new Transport(),playerId='alice',matchId='match-a',visual=PVP_PROJECTILE_VISUAL}={}){
  const state=match(),hits=[],dots=[];
  const self=state.participants.find(p=>p.playerId===playerId);
  const sprite={x:playerId==='alice'?100:700,y:722};
  const remotes={bufferOptions:{},players:new Map([[playerId==='alice'?'bob':'alice',{sprite:{x:playerId==='alice'?700:100,y:722}}]]),
    receive(){},receiveMovement(){}};
  const scene={player:sprite,remotes,source:{layers:[{name:'Collision',type:'objectgroup',objects:[]}]},input:{on(){},off(){}},
    add:{circle(x,y,r,color){const dot={x,y,r,color,scene,active:true,visible:true,setDepth(depth){this.depth=depth;return this;},setScale(scale){this.scale=scale;return this;},
      setRotation(rotation){this.rotation=rotation;return this;},setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){this.destroyed=true;}};
      dots.push(dot);return dot;}}};
  scene.children={exists:object=>object.scene===scene&&!object.destroyed};
  const movement=new PvpMovementClient({matchId,match:state,playerId,transport,remotes,getSpawn:()=>({x:100,y:722}),
    snapshot:()=>null,log:()=>{},config:{debug:true}});
  let client;const combat=new PvpCombatController(scene,hit=>hits.push(hit),{
    onSpawn:p=>client.sendSpawn(p),onRemove:p=>client.sendDestroy(p),visual});
  const logs=[];client=new PvpProjectileClient(movement,combat,{log:(...args)=>logs.push(args)});
  combat.update(state,self,0,Date.now());
  const emit=(type,payload,extra={})=>transport.emitMessage({type,payload,roomId:movement.roomId,senderId:'remote-peer',seq:1,...extra});
  const join=()=>{emit('welcome',{});emit('room-state',{peers:[{clientId:'remote-peer',position:null}]});};
  const receive=(p=projectile(),extra={})=>emit('pvp-projectile-spawn',p,extra);
  t.after(()=>{client.close();movement.close();combat.destroy();});
  return {state,self,hits,dots,scene,combat,client,movement,transport,logs,emit,join,receive};
}

test('projectile visual scale and offsets never alter the realtime spawn or local trajectory',t=>{
  const f=setup(t,{visual:{...PVP_PROJECTILE_VISUAL,scale:3,offsetX:17,offsetY:-9,rotation:0.4,depth:123}});
  f.join();assert.equal(f.combat.fire({x:500,y:700},1000),true);
  const shot=f.combat.shots[0],visual=f.dots[0],sent=f.transport.sent.find(m=>m.type==='pvp-projectile-spawn').payload;
  assert.equal(visual.scale,3);assert.equal(visual.rotation,0.4);assert.equal(visual.depth,123);
  assert.equal(visual.x,shot.x+17);assert.equal(visual.y,shot.y-9);
  assert.equal(sent.x,shot.x);assert.equal(sent.y,shot.y);
  assert.equal(sent.vx,shot.velocity.x);assert.equal(sent.vy,shot.velocity.y);
  assert.equal(shot.x,100);assert.equal(shot.y,700);
});

test('PvP renders the shared class attack sprites and animation configs for all four characters',t=>{
  const entries=[['michael',PLAYER_ATTACK_VISUALS.michael],['jassine',PLAYER_ATTACK_VISUALS.jassine],
    ['felipe',PLAYER_ATTACK_VISUALS.felipe],['sarina',PLAYER_ATTACK_VARIANTS.sarina[0]]];
  for(const [characterBaseId,definition] of entries){
    const f=setup(t);f.self.characterBaseId=characterBaseId;
    f.join();
    const rendered=[];
    f.scene.textures={exists:key=>key===definition.texture,get:()=>({has:frame=>/^attack-[0-5]$/.test(frame)})};
    f.scene.anims={exists:key=>key===definition.animation};
    f.scene.add.sprite=(x,y,texture,frame)=>{
      const sprite={x,y,texture,frame,setDepth(value){this.depth=value;return this;},setScale(value){this.scale=value;return this;},
        setRotation(value){this.rotation=value;return this;},setTint(value){this.tint=value;return this;},play(value){this.animation=value;return this;},
        destroy(){this.destroyed=true;}};
      rendered.push(sprite);return sprite;
    };
    f.combat.fire({x:500,y:700},1000);
    const shot=f.combat.shots[0],sprite=rendered[0];
    assert.equal(sprite.texture,definition.texture);assert.equal(sprite.frame,'attack-0');
    assert.equal(sprite.animation,definition.animation);assert.equal(sprite.scale,definition.scale);
    assert.equal(sprite.depth,PLAYER_ATTACK_DEPTH);
    assert.ok(Math.abs(sprite.rotation-Math.atan2(shot.velocity.y,shot.velocity.x))<1e-9);
    assert.equal(sprite.x,shot.x+shot.visualOffset.x);assert.equal(sprite.y,shot.y+shot.visualOffset.y);
    if(definition.tint)assert.equal(sprite.tint,definition.tint);
    assert.deepEqual(f.transport.sent.find(m=>m.type==='pvp-projectile-spawn').payload,shot.event);
  }
});

test('remote projectiles received through realtime use each remote player class visual',t=>{
  const entries=[['michael',PLAYER_ATTACK_VISUALS.michael],['jassine',PLAYER_ATTACK_VISUALS.jassine],
    ['felipe',PLAYER_ATTACK_VISUALS.felipe],['sarina',PLAYER_ATTACK_VARIANTS.sarina[0]]];
  const traces=[];t.mock.method(console,'info',(...args)=>traces.push(args));
  for(const [characterBaseId,definition] of entries){
    const f=setup(t);f.state.participants[1].characterBaseId=characterBaseId;
    f.scene.textures={exists:key=>key===definition.texture,get:()=>({has:frame=>/^attack-[0-5]$/.test(frame)})};
    f.scene.anims={exists:key=>key===definition.animation};
    const rendered=[];
    f.scene.add.sprite=(x,y,texture,frame)=>{
      const sprite={x,y,texture,frame,scene:f.scene,active:true,visible:true,setDepth(value){this.depth=value;return this;},setScale(value){this.scale=value;return this;},
        setRotation(value){this.rotation=value;return this;},setTint(value){this.tint=value;return this;},play(value){this.animation=value;return this;},
        setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){this.destroyed=true;}};
      rendered.push(sprite);return sprite;
    };
    f.join();f.receive();
    const shot=f.combat.remoteShots.get('projectile-one');
    assert.ok(shot,`${characterBaseId}: remote shot is tracked`);assert.equal(rendered.length,1);
    assert.equal(shot.dot,rendered[0]);assert.equal(shot.dot.texture,definition.texture);
    assert.equal(shot.dot.animation,definition.animation);assert.equal(shot.dot.scale,definition.scale);
    assert.ok(f.logs.some(([event])=>event==='spawn received'));
    const created=traces.find(([label,data])=>label==='[PVP projectile remote] visual created'
      &&data.projectileId==='projectile-one'&&data.characterBaseId===characterBaseId);
    assert.ok(created,`${characterBaseId}: remote visual diagnostics were emitted`);
    assert.equal(created[1].playerId,'bob');assert.equal(created[1].characterBaseId,characterBaseId);
    assert.equal(created[1].texture,definition.texture);assert.equal(created[1].textureExists,true);
    assert.equal(created[1].animationKey,definition.animation);assert.equal(created[1].animationExists,true);
    assert.equal(created[1].visualCreated,true);assert.equal(created[1].fallbackUsed,false);
    assert.equal(created[1].active,true);assert.equal(created[1].visible,true);assert.equal(created[1].addedToScene,true);
    f.client.close();f.movement.close();f.combat.destroy();
  }
});

test('remote projectile falls back when its attack art, animation or sprite creation is unavailable',t=>{
  const traces=[];t.mock.method(console,'info',(...args)=>traces.push(args));
  for(const unavailable of ['texture','animation','sprite-creation']){
    const f=setup(t),definition=PLAYER_ATTACK_VISUALS.michael;
    f.state.participants[1].characterBaseId='michael';
    const textureAvailable=unavailable!=='texture',animationAvailable=unavailable!=='animation';
    f.scene.textures={exists:key=>textureAvailable&&key===definition.texture,get:()=>({has:frame=>/^attack-[0-5]$/.test(frame)})};
    f.scene.anims={exists:key=>animationAvailable&&key===definition.animation};
    let spriteAttempts=0;
    f.scene.add.sprite=()=>{spriteAttempts++;throw new Error('Phaser rejected attack sprite');};
    f.join();f.receive(projectile({projectileId:`missing-${unavailable}`}));
    const shot=f.combat.remoteShots.get(`missing-${unavailable}`);
    assert.ok(shot,`${unavailable}: the remote shot remains tracked`);
    assert.equal(spriteAttempts,unavailable==='sprite-creation'?1:0,`${unavailable}: sprite readiness is respected`);
    assert.equal(shot.dot.r,PVP_PROJECTILE_VISUAL.circleRadius);
    assert.equal(shot.dot.depth,PVP_PROJECTILE_VISUAL.depth);
    assert.equal(shot.dot.destroyed,undefined);
    const created=traces.find(([label,data])=>label==='[PVP projectile remote] visual created'
      &&data.projectileId===`missing-${unavailable}`);
    assert.ok(created);assert.equal(created[1].visualCreated,true);assert.equal(created[1].fallbackUsed,true);
    assert.equal(created[1].visible,true);assert.equal(created[1].addedToScene,true);
    f.client.close();f.movement.close();f.combat.destroy();
  }
});

test('PvP projectile validation is separate from Lab bounds and rejects invalid vectors/identity',()=>{
  assert.ok(validPvpProjectile(projectile()));
  assert.ok(validClientMessage({type:'pvp-projectile-spawn',payload:projectile(),roomId:'pvp-a-0',seq:1,sentAt:1,channel:'reliable'}));
  for(const extra of [{x:NaN},{vx:Infinity},{vx:0,vy:0},{projectileId:''},{life:-1},{shotSeq:0},{ttlMs:9999}])
    assert.equal(validPvpProjectile(projectile(extra)),false);
});

test('local shot is rendered before network send and works without a joined relay',t=>{
  const f=setup(t);assert.equal(f.combat.fire({x:500,y:700},1000),true);
  assert.equal(f.combat.shots.length,1);assert.equal(f.dots.length,1);
  assert.equal(f.transport.sent.length,0);
  f.join();let rendered=false;
  f.transport.sendReliable=(type,p)=>{if(type==='pvp-projectile-spawn')rendered=f.combat.shots.some(s=>s.event.projectileId===p.projectileId);return true;};
  assert.equal(f.combat.fire({x:500,y:700},1000+PVP_RULES.attackCooldownMs),true);assert.equal(rendered,true);
  assert.notEqual(f.combat.shots[0].event.projectileId,f.combat.shots[1].event.projectileId);
  f.client.close();assert.equal(f.combat.fire({x:500,y:700},1000+2*PVP_RULES.attackCooldownMs),true);
});

test('arena readiness gate blocks unregistered initial shots without consuming cooldown or sequence',t=>{
  const f=setup(t);let ready=false;f.combat.canFire=()=>ready;
  assert.equal(f.combat.fire({x:500,y:700},1000),false);
  assert.equal(f.dots.length,0);assert.equal(f.combat.serial,0);assert.equal(f.combat.nextShotAt,0);
  ready=true;assert.equal(f.combat.fire({x:500,y:700},1000),true);
  assert.equal(f.combat.shots[0].event.life,0);assert.equal(f.combat.shots[0].event.shotSeq,1);
});

test('spawn duplicates, stale sequences, self echo, wrong rooms/peers/lives and unknown players are ignored',t=>{
  const f=setup(t);f.join();f.receive();f.receive();
  assert.equal(f.combat.remoteShots.size,1);assert.equal(f.dots.length,1);
  f.receive(projectile({projectileId:'old',shotSeq:1}),{seq:2});
  f.receive(projectile({projectileId:'self',playerId:'alice',shotSeq:2}),{seq:3});
  f.receive(projectile({projectileId:'room',shotSeq:2}),{seq:3,roomId:'pvp-other-0'});
  f.receive(projectile({projectileId:'peer',shotSeq:2}),{seq:3,senderId:'unknown'});
  f.receive(projectile({projectileId:'life',shotSeq:2,life:1}),{seq:3});
  f.receive(projectile({projectileId:'outsider',shotSeq:2,playerId:'outsider'}),{seq:3});
  assert.equal(f.dots.length,1);assert.equal(f.hits.length,0);
  f.receive(projectile({projectileId:'new',shotSeq:2}),{seq:4});assert.equal(f.combat.remoteShots.size,2);
  assert.ok(f.logs.some(([event,p])=>event==='projectile discarded'&&p.reason==='duplicate_or_stale'));
});

test('remote trajectories and expiry are simulated locally without hit reports',t=>{
  t.mock.method(Date,'now',()=>1000);const f=setup(t);f.join();
  f.receive(projectile());f.combat.update(f.state,f.self,100,1100);
  assert.equal(f.combat.remoteShots.get('projectile-one').x,942);
  f.combat.update(f.state,f.self,0,2200);assert.equal(f.combat.remoteShots.size,0);assert.equal(f.dots[0].destroyed,true);
  // Bodies and walls consume remote visuals, never damage the local player.
  f.receive(projectile({projectileId:'body',shotSeq:2,x:200,vx:-420}),{seq:2});
  f.combat.update(f.state,f.self,300,1100);assert.equal(f.combat.remoteShots.size,0);
  f.combat.walls=[{x:250,y:690,width:20,height:20}];
  f.receive(projectile({projectileId:'wall',shotSeq:3,x:200}),{seq:3});
  f.combat.update(f.state,f.self,300,1100);assert.equal(f.combat.remoteShots.size,0);assert.equal(f.hits.length,0);
});

test('local impact still submits exactly one hit and publishes visual removal',t=>{
  const f=setup(t);f.join();f.combat.fire({x:800,y:700},1000);
  const p=f.combat.shots[0].event;f.combat.update(f.state,f.self,1500,1100);
  assert.equal(f.combat.shots.length,0);assert.equal(f.hits.length,1);
  assert.equal(f.hits[0].victimId,'bob');
  assert.deepEqual(f.transport.sent.filter(m=>m.type.startsWith('pvp-projectile')).map(m=>m.type),['pvp-projectile-spawn','pvp-projectile-destroy']);
  assert.equal(f.transport.sent.at(-1).payload.projectileId,p.projectileId);
  f.combat.update(f.state,f.self,100,1200);assert.equal(f.hits.length,1);
});

test('local collision requests realtime validation before destroying the projectile',t=>{
  const f=setup(t);f.join();f.transport.sent.length=0;
  f.combat.onHit=hit=>f.transport.sendReliable('pvp-hit-attempt',{
    projectileId:hit.projectileId,targetId:hit.victimId,targetLife:hit.victimLife});
  f.combat.fire({x:800,y:700},1000);f.combat.update(f.state,f.self,1500,1100);
  assert.deepEqual(f.transport.sent.map(m=>m.type),['pvp-projectile-spawn','pvp-hit-attempt','pvp-projectile-destroy']);
  assert.equal(f.transport.sent[0].payload.projectileId,f.transport.sent[1].payload.projectileId);
});

test('death keeps a local flight alive and reporting collision while new fire remains blocked',t=>{
  const f=setup(t);f.join();f.scene.remotes.players.get('bob').sprite.x=300;
  assert.ok(f.combat.fire({x:400,y:700},1000));const dot=f.dots[0];
  f.self.hp=0;f.combat.update(f.state,f.self,100,1100);
  assert.equal(f.combat.shots.length,1);assert.equal(dot.destroyed,undefined);assert.ok(dot.x>100);
  assert.equal(f.combat.fire({x:400,y:700},1500),false);
  f.combat.update(f.state,f.self,400,1500);
  assert.equal(f.hits.length,1);assert.equal(f.hits[0].victimId,'bob');assert.equal(dot.destroyed,true);
});

test('dead shooter local flight expires at its original TTL instead of death time',t=>{
  const f=setup(t);f.join();f.combat.fire({x:600,y:700},1000);f.self.hp=0;
  f.combat.update(f.state,f.self,100,1100);assert.equal(f.combat.shots.length,1);
  f.combat.update(f.state,f.self,0,1000+PVP_RULES.projectileLifetimeMs-1);assert.equal(f.combat.shots.length,1);
  f.combat.update(f.state,f.self,0,1000+PVP_RULES.projectileLifetimeMs);assert.equal(f.combat.shots.length,0);assert.equal(f.hits.length,0);
});

test('destroy before spawn leaves a tombstone; removed IDs cannot be replayed',t=>{
  const f=setup(t);f.join();f.emit('pvp-projectile-destroy',projectile());f.receive();assert.equal(f.dots.length,0);
  f.receive(projectile({projectileId:'new',shotSeq:2}),{seq:2});
  f.emit('pvp-projectile-destroy',projectile({projectileId:'new',shotSeq:2}),{seq:3});
  f.receive(projectile({projectileId:'new',shotSeq:2}),{seq:4});
  assert.equal(f.combat.remoteShots.size,0);assert.equal(f.dots.length,1);
});

test('relay-clock delivery age rejects expired shots and accounts for remaining visual lifetime',t=>{
  t.mock.method(Date,'now',()=>5000);const f=setup(t);f.join();
  f.transport.getStats=()=>({serverOffsetMs:100000});
  f.receive(projectile(),{serverTime:103000});assert.equal(f.dots.length,0);
  f.receive(projectile({projectileId:'fresh',shotSeq:2}),{seq:2,serverTime:104900});
  const shot=f.combat.remoteShots.get('fresh');assert.equal(shot.expiresAt,6100);
  f.combat.update(f.state,f.self,0,5000);assert.equal(shot.x,942);
});

test('dead local players still see remote shots; registered flights survive shooter respawn until TTL',t=>{
  t.mock.method(Date,'now',()=>1000);
  const f=setup(t);f.join();f.receive();f.self.hp=0;
  f.combat.update(f.state,f.self,50,Date.now());assert.equal(f.combat.remoteShots.size,1);
  f.state.participants[1].life=1;f.client.setMatch(f.state);assert.equal(f.combat.remoteShots.size,1);
  f.combat.update(f.state,f.self,0,2200);assert.equal(f.combat.remoteShots.size,0);
});

test('peer disconnect, reconnect, end/exit and repeated cleanup remove visuals and listeners',t=>{
  const f=setup(t);f.join();f.receive();
  f.emit('peer-left',{clientId:'remote-peer'},{roomId:'pvp-other-0'});assert.equal(f.combat.remoteShots.size,1);
  f.emit('peer-left',{clientId:'remote-peer'});
  assert.equal(f.combat.remoteShots.size,0);assert.equal(f.client.latest.size,0);
  f.emit('peer-joined',{clientId:'new-peer'});f.receive(projectile({projectileId:'new-peer-shot'}),{senderId:'new-peer'});
  assert.equal(f.combat.remoteShots.size,1);
  f.transport.setState('reconnecting');assert.equal(f.combat.remoteShots.size,0);
  f.transport.setState('connected');f.join();f.receive();assert.equal(f.combat.remoteShots.size,1);
  const listeners=[f.transport.messageHandlers.size,f.transport.stateHandlers.size];
  const ended={...f.state,state:'ended'};f.movement.setMatch(ended);f.client.setMatch(ended);f.combat.update(ended,f.self,0,Date.now());
  assert.deepEqual([f.transport.messageHandlers.size,f.transport.stateHandlers.size],listeners,'keep lifecycle listeners until explicit exit');
  assert.equal(f.combat.remoteShots.size,0);f.client.close();f.movement.close();
  assert.equal(f.transport.messageHandlers.size,0);assert.equal(f.transport.stateHandlers.size,0);
  f.receive(projectile({projectileId:'late',shotSeq:100}));assert.equal(f.combat.remoteShots.size,0);
});

async function waitFor(predicate){const until=Date.now()+3000;while(!predicate()){
  if(Date.now()>until)throw new Error('Projectile relay test timeout');await new Promise(resolve=>setTimeout(resolve,5));}}

test('real WebSocket peers share one projectile once, without echo, cross-room traffic or duplicated damage',async t=>{
  const traces=[];t.mock.method(console,'info',(...args)=>traces.push(args));
  const server=createRealtimeServer({port:0,heartbeatMs:60000});await server.ready;
  const url=`ws://127.0.0.1:${server.wss.address().port}`,fixtures=[];
  const create=(playerId,matchId='match-a')=>{
    const transport=new WebSocketTransport({url,roomId:pvpRealtimeRoom(matchId,0),WebSocketImpl:WebSocket});
    const f=setup(t,{transport,playerId,matchId});fixtures.push(f);return f;
  };
  try{
    const a=create('alice'),b=create('bob'),other=create('bob','other-match');
    await waitFor(()=>fixtures.every(f=>f.movement.joined)&&a.movement.peers.size===1);
    a.combat.fire({x:500,y:700},Date.now());assert.equal(a.combat.shots.length,1);
    const p=a.combat.shots[0].event;
    await waitFor(()=>b.combat.remoteShots.has(p.projectileId));
    const received=traces.find(([label,data])=>label==='[PVP projectile remote] spawn received'
      &&data.projectileId===p.projectileId);
    const created=traces.find(([label,data])=>label==='[PVP projectile remote] visual created'
      &&data.projectileId===p.projectileId);
    assert.equal(received?.[1].playerId,'alice');assert.equal(created?.[1].characterBaseId,'michael');
    assert.equal(created?.[1].visualCreated,true);assert.equal(created?.[1].fallbackUsed,true);
    assert.equal(created?.[1].addedToScene,true);assert.equal(created?.[1].visible,true);
    assert.equal(a.combat.remoteShots.size,0);assert.equal(other.combat.remoteShots.size,0);
    a.transport.sendReliable('pvp-projectile-spawn',p);
    a.transport.sendReliable('test-event',{value:1});let delivered=false;
    const off=b.transport.onMessage(m=>{if(m.type==='test-event')delivered=true;});
    await waitFor(()=>delivered);off();assert.equal(b.dots.length,1);assert.equal(b.hits.length,0);
    a.combat.clearLocal();await waitFor(()=>b.combat.remoteShots.size===0);
    for(const f of fixtures){f.client.close();f.movement.close();f.combat.destroy();}
    await waitFor(()=>server.clients.size===0);assert.equal(server.rooms.size,0);
  }finally{for(const f of fixtures){f.client.close();f.movement.close();}await server.close();}
});
