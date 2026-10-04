import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { routeFromMap,makeRoute,pointAt } from '../src/pvp/payload/route.js';
import { PAYLOAD_RULES } from '../src/pvp/payload/config.js';
import { PAYLOAD_VIEW_CONFIG,payloadTheme } from '../src/pvp/payload/visualConfig.js';
import { PayloadAuthority } from '../src/pvp/payload/PayloadAuthority.js';
import { PayloadView,PAYLOAD_COLORS } from '../src/pvp/payload/PayloadView.js';
import { createModeAuthority } from '../src/pvp/modeAuthority.js';
import { gameMode } from '../src/pvp/gameModes.js';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpHud } from '../src/pvp/PvpHud.js';
import { newFighter } from '../src/pvp/matchState.js';
import { combatSnapshot } from '../src/pvp/combatSnapshot.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { validServerMessage } from '../src/realtime/realtimeMessages.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { teamSpawn } from '../src/pvp/spawns.js';
import { segmentRect } from '../src/pvp/projectiles.js';
import { collisionAreas } from '../src/maps/collision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { PVP_MAP_FILE } from '../src/pvp/config.js';
import * as backend from '../convex/pvpMatches.js';

const map=JSON.parse(readFileSync(new URL(`../public/assets/maps/${PVP_MAP_FILE}`,import.meta.url),'utf8'));
const route=routeFromMap(map),center=pointAt(route,route.length/2);
const members=()=>['alice','bob'].map((playerId,i)=>({...newFighter({playerId,sessionId:`session-${playerId}`,displayName:playerId,
  characterBaseId:'felipe',team:i?'B':'A'}),presenceRoom:'pvp-arena-test:match-a'}));
const state=()=>({matchId:'match-a',room:'pvp-arena-test:match-a',round:0,mode:'payload',state:'active',hostPlayerId:'alice',
  damageRevision:0,expiresAt:999999,startedAt:0,endsAt:190000,endedAt:null,winner:null,reason:null,scores:{A:0,B:0},
  scoreLimit:5,respawnMs:3000,timeLimitMs:180000,participants:members()});
function clock(){let at=10000,serial=0;const jobs=new Map();return {jobs,now:()=>at,set(value){at=value;},
  schedule(fn,ms){const id=++serial;jobs.set(id,{fn,at:at+ms});return id;},cancel(id){jobs.delete(id);},
  tick(value){let count=0;for(;;){const entry=[...jobs].filter(([,j])=>j.at<=value).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;
    assert.ok(++count<3000,'bounded single deadline loop');const [id,j]=entry;jobs.delete(id);at=j.at;j.fn();}at=value;}};}
function fixture(t,{match=state(),tuning={}}={}){
  const time=clock(),snapshots=[],commits=[];
  const mode=createModeAuthority(match.mode,map,{now:time.now,...tuning});
  const authority=new PvpDamageAuthority(match,{...time,authorityId:'relay-a',modeAuthority:mode,
    getSpawn:p=>teamSpawn(map,p.team,0),commit:async args=>{commits.push(args);return {applied:true};},onState:s=>snapshots.push(structuredClone(s))});
  t.after(()=>authority.close());for(const p of match.participants)authority.register(p.playerId,`peer-${p.playerId}`);
  const move=(id,x,y=center.y,extra={})=>authority.movement(`peer-${id}`,{playerId:id,life:authority.state.participants.find(p=>p.playerId===id).life,
    x,y,moving:false,...extra});
  return {time,mode,authority,move,snapshots,commits};
}
for(const [id,team,sign] of [['alice','A',1],['bob','B',-1]])
test(`${team} alone moves toward the opposite base at configured constant speed`,t=>{
  const f=fixture(t);f.move(id,center.x);f.time.tick(11000);
  const expected=pointAt(route,route.length/2+sign*PAYLOAD_RULES.speed);
  assert.ok(Math.abs(f.authority.state.payload.x-expected.x)<1e-8);
  assert.ok(Math.abs(f.authority.state.payload.y-expected.y)<1e-8);
  assert.equal(f.authority.state.payload.control,team);assert.equal(f.authority.state.payload.contested,false);
  assert.equal(f.authority.state.payload.moving,true);assert.equal(f.commits.length,0,'objective ticks are not Convex mutations');
  assert.equal(f.time.jobs.size,1);
});
test('no escort, outside radius, dead player, old life, disconnected peer and stale moving sample cannot push',t=>{
  for(const variant of ['none','outside','dead','old-life','disconnected','stale']){
    const f=fixture(t);
    if(variant!=='none')f.move('alice',variant==='outside'
      ?center.x+PAYLOAD_RULES.radius+PAYLOAD_RULES.payloadPresenceBox.width/2+1:center.x);
    if(variant==='dead')f.authority.state.participants[0].hp=0;
    if(variant==='old-life')f.authority.state.participants[0].life=1;
    if(variant==='disconnected')f.authority.members.delete('alice');
    if(variant==='stale')f.authority.positions.set('alice',{...center,life:0,moving:true,at:0});
    f.time.tick(11000);assert.equal(f.authority.state.payload.x,center.x,variant);assert.equal(f.authority.state.payload.control,null,variant);
  }
});
test('both teams produce distinct contested state and stop completely; leaving radius resumes control',t=>{
  const f=fixture(t);f.move('alice',center.x);f.move('bob',center.x);
  assert.equal(f.authority.state.payload.contested,true);assert.equal(f.authority.state.payload.control,null);
  f.time.tick(11000);assert.equal(f.authority.state.payload.distance,route.length/2);assert.equal(f.authority.state.payload.moving,false);
  f.move('bob',teamSpawn(map,'B').x);f.time.tick(12000);assert.equal(f.authority.state.payload.control,'A');assert.ok(f.authority.state.payload.distance>route.length/2);
});
test('the feet box counts when its edge intersects the payload circle, while a fully outside box does not',t=>{
  const inside=fixture(t);inside.move('alice',center.x+PAYLOAD_RULES.radius+9);
  assert.equal(inside.authority.state.payload.control,'A');
  const outside=fixture(t);outside.move('alice',center.x+PAYLOAD_RULES.radius+11);
  assert.equal(outside.authority.state.payload.control,null);
});
test('presence hysteresis tolerates 1-2 px edge movement and exits beyond the configured margin',t=>{
  const f=fixture(t),{width,hysteresisPx}=PAYLOAD_RULES.payloadPresenceBox;
  f.move('alice',center.x+PAYLOAD_RULES.radius+width/2-1);
  assert.equal(f.authority.state.payload.control,'A');
  f.move('alice',center.x+PAYLOAD_RULES.radius+width/2+2);
  assert.equal(f.authority.state.payload.control,'A','previously inside player stays present within hysteresis');
  f.move('alice',center.x+PAYLOAD_RULES.radius+width/2+hysteresisPx+1);
  assert.equal(f.authority.state.payload.control,null,'presence ends beyond the hysteresis margin');
});
test('a dead player stops counting while a surviving feet box at the contested edge keeps control',t=>{
  const f=fixture(t),edge=center.x+PAYLOAD_RULES.radius+PAYLOAD_RULES.payloadPresenceBox.width/2-1;
  f.move('alice',edge);f.move('bob',edge);
  assert.equal(f.authority.state.payload.contested,true);
  f.authority.state.participants.find(p=>p.playerId==='bob').hp=0;
  f.authority.advance();
  assert.equal(f.authority.state.payload.contested,false);
  assert.equal(f.authority.state.payload.control,'A');
});
test('two same-team escorts do not increase speed; server broadcasts at most its objective cadence during movement',t=>{
  const one=fixture(t),match=state();match.participants.push({...members()[0],playerId:'friend'});
  const two=fixture(t,{match});one.move('alice',center.x);two.move('alice',center.x);two.move('friend',center.x);
  const before=two.snapshots.length;
  for(let at=10050;at<=11000;at+=50){one.time.tick(at);two.time.tick(at);two.move('friend',center.x);}
  assert.ok(Math.abs(two.authority.state.payload.distance-one.authority.state.payload.distance)<1e-8);
  assert.ok(two.snapshots.length-before<=10);assert.equal(two.commits.length,0);
});
test('route interpolation follows physical bends and clamps at endpoints; Tiled test route does not cross any collision',()=>{
  const bent=makeRoute([{x:0,y:0},{x:100,y:0},{x:100,y:100}]);
  assert.deepEqual(pointAt(bent,150),{x:100,y:50});assert.deepEqual(pointAt(bent,-1),{x:0,y:0});assert.deepEqual(pointAt(bent,999),{x:100,y:100});
  for(const wall of collisionAreas(objectsIn(map,'Collision')))for(let i=1;i<route.points.length;i++)
    assert.equal(segmentRect(route.points[i-1],route.points[i],wall),null);
  assert.equal(createModeAuthority('tdm',{layers:[]}),null,'TDM never requires a payload route');
  assert.throws(()=>routeFromMap({layers:[]}));assert.throws(()=>makeRoute([{x:0,y:0},{x:0,y:0}]));
});
for(const [id,winner,endpoint] of [['alice','A',route.length],['bob','B',0]])
test(`delivery at ${endpoint} ends once with winner ${winner}, freezes objective and cancels combat timers`,async t=>{
  const f=fixture(t,{tuning:{speed:10000}});f.move(id,center.x);f.time.tick(10100);
  assert.equal(f.authority.state.state,'ended');assert.equal(f.authority.state.winner,winner);assert.equal(f.authority.state.reason,'payload-delivered');
  assert.equal(f.authority.state.payload.distance,endpoint);assert.equal(f.authority.state.payload.moving,false);assert.equal(f.time.jobs.size,0);
  assert.equal(f.authority.state.participants.every(p=>p.respawnAt===null),true);f.time.tick(20000);f.authority.advance();
  assert.equal(f.authority.state.payload.distance,endpoint);await f.authority.queue;assert.equal(f.commits.length,1);
});
test('countdown stays centered/neutral and Payload timeout draws without kill-based victory',async t=>{
  const waiting={...state(),state:'countdown',startedAt:13000,endsAt:14000,scores:{A:50,B:0}};
  const f=fixture(t,{match:waiting});f.move('alice',center.x);f.time.tick(12999);
  assert.equal(f.authority.state.payload.distance,route.length/2);assert.equal(f.authority.state.payload.control,null);
  f.time.tick(13000);assert.equal(f.authority.state.state,'active');f.time.tick(14000);
  assert.equal(f.authority.state.winner,'draw');assert.equal(f.authority.state.reason,'timer');
  await f.authority.queue;assert.equal(f.authority.state.endedAt,14000);
});
test('Payload fifth kill records stats without victory and respawns after exactly 3 seconds',async t=>{
  const match=state();match.scores.A=4;match.participants[1].hp=25;const f=fixture(t,{match});
  f.move('alice',100,222);f.move('bob',200,222);
  assert.ok(f.authority.spawn('peer-alice',{projectileId:'shot-a',playerId:'alice',life:0,shotSeq:1,x:100,y:200,vx:420,vy:0,ttlMs:1200}));
  f.time.tick(10200);assert.ok(f.authority.attempt('peer-alice',{projectileId:'shot-a',targetId:'bob',targetLife:0}).accepted);
  assert.equal(f.authority.state.scores.A,5);assert.equal(f.authority.state.state,'active');assert.equal(f.authority.state.participants[1].respawnAt,13200);
  f.time.tick(13199);assert.equal(f.authority.state.participants[1].hp,0);f.time.tick(13200);assert.equal(f.authority.state.participants[1].hp,100);
  assert.equal(f.authority.state.participants[1].life,1);await f.authority.queue;
});
test('Payload state is validated independently and render colors/geometry are separate from server rules',()=>{
  const payload=new PayloadAuthority(route,{now:()=>0}).current;
  const packet={type:'pvp-combat-state',roomId:'pvp-match-a-0',serverTime:10000,payload:{authorityId:'relay-a',version:1,round:0,damageRevision:0,
    ...combatSnapshot({...state(),payload}),events:[]}};
  assert.ok(validServerMessage(packet));assert.equal(validServerMessage({...packet,payload:{...packet.payload,payload:{...payload,distance:-1}}}),false);
  assert.notEqual(PAYLOAD_COLORS.contested,PAYLOAD_COLORS.B);
  const objects=[],node=()=>{const p={destroy(){this.destroyed=true;},setPosition(x,y){Object.assign(this,{x,y});return this;},
    setVisible(v){this.visible=v;return this;},setDepth(d){this.depth=d;return this;},setAlpha(a){this.alpha=a;return this;},setText(t){this.text=t;return this;}};
    for(const method of ['setOrigin','lineStyle','beginPath','lineTo','moveTo','strokePath','fillStyle','fillCircle','clear','strokeCircle','fillRect','fillRoundedRect','strokeRoundedRect'])p[method]=()=>p;
    objects.push(p);return p;};
  let now=0;const view=new PayloadView({source:map,add:{graphics:node,text:node},player:{}},{now:()=>now});
  view.render({...state(),payload});assert.equal(view.cart.x,center.x);
  view.render({...state(),payload:{...payload,x:center.x+10}});now=100;view.render({...state(),payload:{...payload,x:center.x+10}});
  assert.equal(view.cart.x,center.x+10);assert.equal(payload.x,center.x,'render interpolation cannot mutate authoritative state');
  view.reset();view.render({...state(),state:'countdown'});assert.equal(view.cart.x,center.x);view.destroy();assert.ok(objects.every(p=>p.destroyed));
  const doc={createElement:()=>({append(){},setAttribute(){}}),body:{append(){}}};const hud=new PvpHud({documentRef:doc,onLeave(){}});
  hud.render({...state(),payload:{...payload,contested:true}},state().participants[0],10000);assert.match(hud.score.textContent,/CONTESTED/);
  hud.render({...state(),state:'ended',reason:'payload-delivered',winner:'A'},state().participants[0],10000);assert.match(hud.result.textContent,/A WINS/);
});

test('PayloadView accepts a future sprite theme, ground depth, offsets, radius tint and optional route',()=>{
  const objects=[];
  const node=()=>{const p={calls:[],destroy(){this.destroyed=true;},setPosition(x,y){this.x=x;this.y=y;return this;},
    setVisible(v){this.visible=v;return this;},setDepth(d){this.depth=d;return this;},setAlpha(a){this.alpha=a;return this;},
    setText(t){this.text=t;return this;},setScale(s){this.scale=s;return this;}};
    for(const method of ['setOrigin','lineStyle','beginPath','lineTo','moveTo','strokePath','fillStyle','fillCircle','clear','strokeCircle','fillRect','fillRoundedRect','strokeRoundedRect'])
      p[method]=(...args)=>{p.calls.push([method,...args]);return p;};objects.push(p);return p;};
  const scene={source:map,textures:{exists:key=>key==='payload-bed'},player:{},add:{graphics:node,text:node,
    image:(x,y,key)=>Object.assign(node(),{x,y,key})}};
  const theme={sprite:'payload-bed',scale:1.4,offsetX:4,offsetY:-7,depth:'y',depthOffset:3,radiusScale:.8,
    labelOffsetY:-40,colors:{neutral:0xeeeeee,A:0x0000ff,B:0xff0000,contested:0xffaa00}};
  let now=1000;const view=new PayloadView(scene,{now:()=>now,theme,config:{showRoute:false}});
  const payload={...new PayloadAuthority(route,{now:()=>0}).current,x:center.x+20,y:center.y+10,control:'B',contested:false};
  view.render({...state(),payload});
  now+=PAYLOAD_RULES.tickMs;view.render({...state(),payload});
  assert.equal(PAYLOAD_VIEW_CONFIG.showRoute,true);assert.equal(PAYLOAD_VIEW_CONFIG.routeDepth,-1.8);
  assert.equal(view.path,null,'route can be disabled without changing objective state');
  assert.equal(view.usesSprite,true);assert.equal(view.cart.key,'payload-bed');assert.equal(view.cart.scale,1.4);
  assert.deepEqual([view.cart.x,view.cart.y],[payload.x+4,payload.y-7]);assert.equal(view.cart.depth,payload.y-7+3);
  assert.equal(view.label.depth,view.cart.depth+1);assert.equal(view.label.y,payload.y-7-40);
  assert.ok(view.ring.calls.some(call=>call[0]==='fillCircle'&&call[3]===PAYLOAD_RULES.radius*.8));
  assert.ok(view.ring.calls.some(call=>call[0]==='fillStyle'&&call[1]===0xff0000));
  assert.equal(payload.x,center.x+20,'theme offsets never enter authoritative state');
  view.destroy();assert.ok(objects.every(p=>p.destroyed));
  assert.equal(payloadTheme('equipmentCart').id,'equipmentCart');
  assert.throws(()=>payloadTheme('missing-theme'),/Unknown Payload visual theme/);
});

async function waitFor(fn){const until=performance.now()+4000;while(!fn()){
  if(performance.now()>until)throw new Error('Payload relay timeout');await new Promise(r=>setTimeout(r,5));}}
test('two actual WebSocket clients share Payload position/result, Retry resets objective on the same sockets, and stale rounds are ignored',async t=>{
  let now=10000;t.mock.method(Date,'now',()=>now);t.mock.method(console,'debug',()=>{});
  const old=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';t.after(()=>{if(old===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=old;});
  let saved={...state(),_id:'match-a',code:'ABCDEF',createdAt:10000};delete saved.matchId;delete saved.room;
  saved.participants=saved.participants.map(({presenceRoom,...p})=>p);
  // Real arena Presence keeps a fixed entry snapshot and acquires a stationary
  // lease. The new longer route must not expire this test's simulated players.
  const rows=saved.participants.map((p,i)=>({_id:`row-${i}`,playerId:p.playerId,sessionId:p.sessionId,lastSeen:10000,
    presenceMode:'stationary',stationaryLeaseExpiresAt:310000,room:'pvp-arena-test:match-a'}));
  const callbacks=new Set(),clients=[],commits=[];
  const publish=async()=>{const s=await backend.realtimeState._handler(ctx,{matchId:'match-a'});for(const cb of callbacks)cb(s);
    for(const c of clients)try{c.apply(c.damage.project(await backend.current._handler(ctx,c.args)));}catch{}};
  const ctx={db:{async get(id){return id==='match-a'?saved:rows.find(p=>p._id===id)??null;},async patch(_id,data){Object.assign(saved,structuredClone(data));await publish();},
    query(){let filter;const q={withIndex(_index,build){const index={eq(k,v){filter=p=>p[k]===v;return index;}};build(index);return q;},async unique(){return rows.find(filter)??null;}};return q;}}};
  const bridge={authenticate:a=>backend.current._handler(ctx,a),acquire:a=>backend.acquireRealtimeCombat._handler(ctx,a),
    async commit(a){commits.push(a);return backend.mirrorRealtimeCombat._handler(ctx,a);},nextRound:a=>backend.advanceRealtimeRound._handler(ctx,a),
    subscribe(_id,cb){callbacks.add(cb);return ()=>callbacks.delete(cb);}};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,pvpBridge:bridge,now:()=>now});await server.ready;
  t.after(async()=>{for(const c of clients){c.damage.close();c.movement.close();}await server.close();});
  const initial=await backend.current._handler(ctx,{matchId:'match-a',playerId:'alice',sessionId:'session-alice'});
  for(const playerId of ['alice','bob']){
    const c={args:{matchId:'match-a',playerId,sessionId:`session-${playerId}`},state:structuredClone(initial),messages:[]};
    const remotes={bufferOptions:{},receive(){},receiveMovement(){}};
    c.transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:'pvp-match-a-0',WebSocketImpl:WebSocket});
    c.transport.onMessage(m=>c.messages.push(m));
    c.movement=new PvpMovementClient({matchId:'match-a',match:c.state,playerId,transport:c.transport,remotes,getSpawn:p=>teamSpawn(map,p.team,0),snapshot:()=>null,log:()=>{}});
    c.apply=s=>{c.state=s;c.movement.setMatch(s);};
    c.damage=new PvpDamageClient(c.movement,{matchId:'match-a',sessionId:c.args.sessionId,onState:c.apply,onError:e=>assert.fail(e.message),onRound:s=>{
      assert.equal(s.state,'countdown');c.state=s;c.movement.switchRound(s);
    }});
    clients.push(c);
  }
  await waitFor(()=>clients.every(c=>c.damage.authorized&&c.state.payload));
  const [a,b]=clients,ids=clients.map(c=>c.transport.clientId),listenerCounts=clients.map(c=>c.transport.messageHandlers.size);
  const authority=server.authorities.get(a.movement.roomId).authority;
  const move=(c,x,y=center.y)=>c.transport.sendUnreliable('pvp-movement',{playerId:c.args.playerId,life:c.state.participants.find(p=>p.playerId===c.args.playerId).life,
    sampleSeq:(c.sequence=(c.sequence??0)+1),x,y,vx:0,vy:0,direction:'right',moving:false});
  move(a,center.x);move(b,teamSpawn(map,'B').x);
  await waitFor(()=>a.state.payload.control==='A'&&b.state.payload.control==='A');
  now=10500;authority.advance();await waitFor(()=>a.state.payload.distance>route.length/2&&a.state.payload.x===b.state.payload.x);
  assert.deepEqual(a.state.payload,b.state.payload);assert.equal(commits.length,0,'no per-tick Convex persistence');
  move(b,a.state.payload.x);await waitFor(()=>a.state.payload.contested&&b.state.payload.contested);
  const contested=a.state.payload.distance;now=11000;authority.advance();assert.equal(authority.state.payload.distance,contested);
  // Leave the entire route, not just the current cart radius: otherwise the
  // defender at the destination correctly contests delivery on this longer map.
  move(b,teamSpawn(map,'B').x,center.y+PAYLOAD_RULES.radius*3);await waitFor(()=>!a.state.payload.contested);
  const maxEscortTicks=Math.ceil(route.length/(PAYLOAD_RULES.speed*PAYLOAD_RULES.tickMs/1000))+20;
  for(let i=0;i<maxEscortTicks&&authority.state.state!=='ended';i++){
    move(a,authority.state.payload.x);await waitFor(()=>authority.positions.get('alice')?.x===a.state.payload.x);
    now+=100;authority.advance();await new Promise(r=>setTimeout(r,2));
  }
  await waitFor(()=>clients.every(c=>c.state.state==='ended'&&c.state.retry));
  assert.equal(a.state.winner,'A');assert.equal(b.state.winner,'A');assert.equal(a.state.payload.distance,route.length);
  assert.ok(a.damage.requestRetry());assert.ok(b.damage.requestRetry());
  await waitFor(()=>saved.round===1&&clients.every(c=>c.movement.round===1&&c.damage.authorized&&c.state.payload));
  clients.forEach((c,i)=>{assert.equal(c.transport.clientId,ids[i]);assert.equal(c.transport.messageHandlers.size,listenerCounts[i]);
    assert.equal(c.state.mode,'payload');assert.equal(c.state.respawnMs,3000);assert.equal(c.state.payload.distance,route.length/2);
    assert.equal(c.state.payload.control,null);assert.equal(c.state.payload.contested,false);assert.equal(c.state.payload.moving,false);});
  assert.equal(callbacks.size,1);assert.equal(server.rooms.size,1);assert.equal(server.authorities.size,1);
  const current=structuredClone(a.state.payload);
  const oldPacket=a.messages.find(m=>m.type==='pvp-combat-state'&&m.payload.payload?.control==='A');a.transport.emitMessage(oldPacket);
  assert.deepEqual(a.state.payload,current);assert.equal(a.damage.project({...initial,payload:{...current,x:0}}).round,1);
});

test('profile/guest lobby creation can select Payload without contaminating participants, and default TDM is unchanged',async t=>{
  t.mock.method(Date,'now',()=>10000);const old=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>{if(old===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=old;});
  const player={playerId:'alice',sessionId:'session-alice',name:'Alice',characterBaseId:'felipe',lastSeen:10000},matches=[];
  const ctx={scheduler:{async runAfter(){}},db:{query(table){const filters=[],q={withIndex(_name,build){const index={eq(k,v){filters.push([k,v]);return index;}};build(index);return q;},
    async unique(){return table==='players'?player:null;},async collect(){return table==='pvpMatches'?matches.filter(m=>filters.every(([k,v])=>m[k]===v)):[];}};return q;},
    async insert(_table,data){matches.push(data);return 'match-a';},async patch(_id,data){Object.assign(matches.at(-1),data);}}};
  await backend.create._handler(ctx,{playerId:player.playerId,sessionId:player.sessionId,mode:'payload'});
  assert.equal(matches[0].mode,'payload');assert.equal(matches[0].respawnMs,3000);assert.equal(matches[0].timeLimitMs,180000);
  assert.equal(matches[0].participants[0].mode,undefined);assert.equal(matches[0].participants[0].sessionId,'session-alice');
  ctx.db.get=async()=>matches[0];matches[0].state='countdown';
  await backend.requirePvpMembership(ctx,player,'match-a');
  await assert.rejects(backend.requirePvpMembership(ctx,{...player,sessionId:'stale'},'match-a'));
  matches[0].state='ended';await backend.create._handler(ctx,{playerId:player.playerId,sessionId:player.sessionId});
  assert.equal(matches[1].mode,'tdm');assert.equal(matches[1].respawnMs,2500);assert.equal(gameMode('tdm').timeLimitMs,180000);
});
