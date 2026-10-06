import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as backend from '../convex/pvpMatches.js';
import { DEFAULT_MATCH_SETTINGS,normalizeMatchSettings,matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings,resolveMatchSettings,hasCustomMatchSettings } from '../src/pvp/matchSettings.js';
import { PVP_RULES,PVP_MAP_DEFINITION,pvpRoom } from '../src/pvp/config.js';
import { PLAYER_SPEED } from '../src/game/settings.js';
import { newFighter,advanceMatch } from '../src/pvp/matchState.js';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { PvpMatchSettingsPanel } from '../src/pvp/PvpMatchSettingsPanel.js';
import { validServerMessage } from '../src/realtime/realtimeMessages.js';
import { WebSocket } from 'ws';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';
import { PvpMovementClient } from '../src/pvp/PvpMovementClient.js';
import { PvpProjectileClient } from '../src/pvp/PvpProjectileClient.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpReturnFlow } from '../src/pvp/PvpReturnFlow.js';
import { RealtimeTransport } from '../src/realtime/RealtimeTransport.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { endMatch } from '../src/pvp/matchState.js';

const custom={maxHp:250,damage:50,attackCooldownMs:1200,movementSpeedMultiplier:1.5};
const teamSettings={...DEFAULT_MATCH_SETTINGS,teamOverrides:{A:{},B:{maxHp:180,damage:25,attackCooldownMs:1200,movementSpeedMultiplier:1.5}}};
function database(t){
  let now=100000,serial=0;
  t.mock.method(Date,'now',()=>now);
  const dev=process.env.DEV_TOOLS_ENABLED;process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>dev===undefined?delete process.env.DEV_TOOLS_ENABLED:process.env.DEV_TOOLS_ENABLED=dev);
  const tables={players:['host','guest'].map(id=>({_id:`row-${id}`,playerId:id,sessionId:`session-${id}`,
    characterBaseId:'felipe',displayName:id,name:id,room:'school',lastSeen:now})),pvpMatches:[]};
  const ctx={scheduler:{async runAfter(){return 'expiry';}},db:{
    query(table){const filters=[];const q={withIndex(_name,build){const index={eq(key,value){filters.push([key,value]);return index;}};build(index);return q;},
      async collect(){return tables[table].filter(row=>filters.every(([k,v])=>row[k]===v));},
      async unique(){const rows=await q.collect();assert.ok(rows.length<=1);return rows[0]??null;}};return q;},
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,row){const id=`match-${++serial}`;tables[table].push({_id:id,...structuredClone(row)});return id;},
    async patch(id,patch){Object.assign(await this.get(id),structuredClone(patch));},
    async delete(id){for(const rows of Object.values(tables)){const index=rows.findIndex(row=>row._id===id);if(index>=0)rows.splice(index,1);}},
  }};
  const identity=id=>({playerId:id,sessionId:`session-${id}`});
  return {ctx,tables,identity,now:()=>now,setTime(value){now=value;tables.players.forEach(row=>row.lastSeen=value);},
    async lobby(mode='tdm'){
      const result=await backend.create._handler(ctx,{...identity('host'),mode});
      await backend.join._handler(ctx,{...identity('guest'),code:result.code});
      const args=id=>({...identity(id),matchId:result.matchId,round:0});
      return {result,args,get saved(){return tables.pvpMatches.find(row=>row._id===result.matchId);}};
    }};
}

test('common defaults reuse current rules and reject non-finite, out-of-range or unknown settings',()=>{
  assert.deepEqual(DEFAULT_MATCH_SETTINGS,{maxHp:PVP_RULES.maxHp,damage:PVP_RULES.damage,
    attackCooldownMs:PVP_RULES.attackCooldownMs,movementSpeedMultiplier:1});
  assert.deepEqual(matchSettingsFor({}),DEFAULT_MATCH_SETTINGS);
  assert.equal(pvpMovementSpeed({}),PLAYER_SPEED);
  assert.equal(newFighter({playerId:'host'}).hp,PVP_RULES.maxHp);
  const state={state:'active',startedAt:0,endsAt:9999,participants:[{...newFighter({playerId:'host'}),hp:0,respawnAt:100}]};
  assert.equal(advanceMatch(state,100).participants[0].hp,PVP_RULES.maxHp);
  for(const patch of [{maxHp:501},{damage:0},{attackCooldownMs:99},{movementSpeedMultiplier:NaN},{damage:Infinity},{extra:1}])
    assert.throws(()=>normalizeMatchSettings({...custom,...patch}));
});

test('team inheritance is per field, accepts missing/null/partial overrides and rejects unknown teams/ranges',()=>{
  for(const teamOverrides of [undefined,null,{}, {A:null,B:{}},{B:{maxHp:null,damage:undefined}}]){
    const settings={damage:20,teamOverrides};
    for(const team of ['A','B'])assert.deepEqual(resolveMatchSettings(settings,team),{...DEFAULT_MATCH_SETTINGS,damage:20});
  }
  const partial={matchSettings:{damage:20,teamOverrides:{B:{maxHp:180}}}};
  assert.deepEqual(effectiveMatchSettings(partial,'A'),{...DEFAULT_MATCH_SETTINGS,damage:20});
  assert.deepEqual(effectiveMatchSettings(partial,'B'),{...DEFAULT_MATCH_SETTINGS,damage:20,maxHp:180});
  assert.equal(hasCustomMatchSettings({matchSettings:teamSettings}),true);
  assert.equal(hasCustomMatchSettings({matchSettings:{teamOverrides:{B:{maxHp:100}}}}),false);
  for(const teamOverrides of [{C:{}},{B:{damage:999}},{B:{maxHp:NaN}},{B:{extra:1}},[],{B:12}])
    assert.throws(()=>normalizeMatchSettings({teamOverrides}));
});

test('only host/session/waiting can save team overrides; changing team changes HP without transferring host',async t=>{
  const f=database(t),l=await f.lobby();
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('guest'),matchSettings:teamSettings}),/Only the host/);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),sessionId:'stale',matchSettings:teamSettings}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:{teamOverrides:{B:{damage:101}}}}),/allowed ranges/);
  await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:teamSettings});
  assert.deepEqual(l.saved.participants.map(p=>p.hp),[100,180]);
  await backend.chooseTeam._handler(f.ctx,{...l.args('host'),team:'B'});
  assert.equal(l.saved.participants[0].hp,180);assert.equal(l.saved.hostPlayerId,'host');
  await backend.chooseTeam._handler(f.ctx,{...l.args('host'),team:'A'});
  await backend.start._handler(f.ctx,l.args('host'));
  assert.deepEqual(l.saved.participants.map(p=>p.hp),[100,180]);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:teamSettings}),/locked/);
  const fresh=await f.lobby();assert.deepEqual(fresh.saved.matchSettings,DEFAULT_MATCH_SETTINGS);
});

test('realtime resolves damage/cooldown/velocity from owned attacker team, respawns at team HP and pins overrides',async t=>{
  const f=database(t),l=await f.lobby();
  await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:teamSettings});await backend.start._handler(f.ctx,l.args('host'));
  f.tables.players.forEach(row=>row.room=pvpRoom(l.result.matchId));
  const initial=await backend.acquireRealtimeCombat._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay'});
  const authority=new PvpDamageAuthority(initial,{now:f.now,schedule:()=>1,cancel(){},authorityId:'relay',
    commit:args=>backend.mirrorRealtimeCombat._handler(f.ctx,args)});
  t.after(()=>authority.close());authority.register('host','peer-host');authority.register('guest','peer-guest');
  f.setTime(initial.startedAt);authority.advance();
  const move=(id,x,vx=0)=>authority.movement(`peer-${id}`,{playerId:id,life:0,x,y:222,vx,vy:0,moving:vx!==0,team:'B'});
  assert.ok(move('host',100));assert.ok(move('guest',200));
  assert.equal(move('host',100,216),false,'claimed team in movement cannot change server rules');
  assert.equal(move('guest',200,216),true);assert.equal(pvpMovementSpeed(initial,'B'),216);move('guest',200);
  const start=f.now(),spawn=(id,seq)=>authority.spawn(`peer-${id}`,{projectileId:`${id}-${seq}`,playerId:id,life:0,shotSeq:seq,
    x:id==='host'?100:200,y:200,vx:id==='host'?420:-420,vy:0,ttlMs:PVP_RULES.projectileLifetimeMs,team:'B',damage:999});
  assert.ok(spawn('host',1));assert.ok(spawn('guest',1));f.setTime(start+200);
  const hit=(id,target,seq)=>authority.attempt(`peer-${id}`,{projectileId:`${id}-${seq}`,targetId:target,targetLife:0});
  assert.equal(hit('host','guest',1).damage,15);assert.equal(hit('guest','host',1).damage,25);
  assert.deepEqual(authority.state.participants.map(p=>p.hp),[75,165]);
  f.setTime(start+800);assert.ok(spawn('host',2));assert.equal(spawn('guest',2),false);
  f.setTime(start+1000);authority.state.participants[1].hp=15;assert.ok(hit('host','guest',2).accepted);
  const respawnAt=authority.state.participants[1].respawnAt;f.setTime(respawnAt);authority.advance();await authority.queue;
  assert.equal(authority.state.participants[1].hp,180);assert.equal(authority.state.participants[1].life,1);
  assert.equal(l.saved.participants[1].hp,180);
  authority.sync({...initial,matchSettings:DEFAULT_MATCH_SETTINGS});assert.deepEqual(authority.settings,teamSettings);
  assert.ok(Object.isFrozen(authority.settings.teamOverrides.B));
  const invalid={...authority.state,participants:authority.state.participants.map(p=>({...p,hp:180}))};
  const {combatSnapshot}=await import('../src/pvp/combatSnapshot.js');
  assert.deepEqual(await backend.mirrorRealtimeCombat._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay',
    expectedRevision:l.saved.damageRevision,revision:l.saved.damageRevision+1,snapshot:combatSnapshot(invalid)}),{applied:false});
});

test('Payload regeneration caps independently at each team max HP',t=>{
  const state={state:'active',mode:'payload',arenaMap:PVP_MAP_DEFINITION,matchSettings:teamSettings,round:0,
    participants:[newFighter({playerId:'host',team:'A'},teamSettings),newFighter({playerId:'guest',team:'B'},teamSettings)]};
  const authority=new PvpDamageAuthority(state,{now:()=>10000,schedule:()=>1,cancel(){},commit:async()=>({applied:true})});
  t.after(()=>authority.close());authority.state.participants.forEach(p=>{p.hp-=1;authority.regen.set(p.playerId,{life:0,nextAt:10000});});
  assert.ok(authority.advanceRegen(10000));assert.deepEqual(authority.state.participants.map(p=>p.hp),[100,180]);assert.equal(authority.regen.size,0);
});

test('Retry preserves team overrides and resets each fighter to its team cap, including wire handoff',async t=>{
  const f=database(t),l=await f.lobby();await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:teamSettings});
  Object.assign(l.saved,{state:'ended',combatAuthorityId:'relay',retryDeadline:f.now()+10000,endedAt:f.now(),reason:'score-limit'});
  l.saved.participants.forEach(p=>{p.hp=0;p.life=2;});
  const next=await backend.advanceRealtimeRound._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay',
    playerIds:['host','guest'],startedAt:f.now()+3000});
  assert.deepEqual(next.matchSettings,teamSettings);assert.deepEqual(next.participants.map(p=>[p.hp,p.life]),[[100,3],[180,3]]);
  const message={type:'pvp-round-transition',roomId:'pvp-test',serverTime:f.now(),payload:{fromRound:0,match:next}};
  assert.equal(validServerMessage(message),true);
  assert.equal(validServerMessage({...message,payload:{fromRound:0,match:{...next,participants:next.participants.map(p=>({...p,hp:180}))}}}),false);
});

test('only the current host session can change waiting-round settings, including after a team switch',async t=>{
  const f=database(t),l=await f.lobby();
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('guest'),matchSettings:custom}),/Only the host/);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),sessionId:'stale',matchSettings:custom}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),round:99,matchSettings:custom}),/round/);
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:{...custom,maxHp:999}}),/allowed ranges/);
  await backend.chooseTeam._handler(f.ctx,{...l.args('host'),team:'B'});
  await backend.chooseTeam._handler(f.ctx,{...l.args('guest'),team:'A'});
  await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:custom});
  assert.equal(l.saved.hostPlayerId,'host');assert.deepEqual(l.saved.matchSettings,custom);
  await backend.start._handler(f.ctx,l.args('host'));
  await assert.rejects(backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:DEFAULT_MATCH_SETTINGS}),/locked/);
});

test('TDM and Payload expose identical common settings to both clients and the trusted relay; new lobbies reset defaults',async t=>{
  const f=database(t);
  for(const mode of ['tdm','payload']){
    const l=await f.lobby(mode),modeRules={respawnMs:l.saved.respawnMs,timeLimitMs:l.saved.timeLimitMs,scoreLimit:l.saved.scoreLimit};
    assert.deepEqual(l.saved.matchSettings,DEFAULT_MATCH_SETTINGS);
    await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:custom});
    for(const id of ['host','guest'])assert.deepEqual((await backend.current._handler(f.ctx,l.args(id))).matchSettings,custom);
    await backend.start._handler(f.ctx,l.args('host'));
    assert.deepEqual(l.saved.participants.map(p=>p.hp),[250,250]);
    assert.deepEqual(modeRules,{respawnMs:l.saved.respawnMs,timeLimitMs:l.saved.timeLimitMs,scoreLimit:l.saved.scoreLimit});
    const relay=await backend.acquireRealtimeCombat._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay'});
    assert.deepEqual(relay.matchSettings,custom);
  }
  const fresh=await f.lobby();assert.deepEqual(fresh.saved.matchSettings,DEFAULT_MATCH_SETTINGS);
});

test('relay pins custom HP/damage/cooldown/velocity, respawns at custom max HP and mirrors without changing rules',async t=>{
  const f=database(t),l=await f.lobby();
  await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:custom});
  await backend.start._handler(f.ctx,l.args('host'));
  f.tables.players.forEach(row=>row.room=pvpRoom(l.result.matchId));
  const initial=await backend.acquireRealtimeCombat._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay'});
  const states=[];
  const authority=new PvpDamageAuthority(initial,{now:f.now,schedule:()=>1,cancel(){},authorityId:'relay',
    onState:s=>states.push(s),commit:args=>backend.mirrorRealtimeCombat._handler(f.ctx,args)});
  t.after(()=>authority.close());authority.register('host','peer-host');authority.register('guest','peer-guest');
  f.setTime(initial.startedAt);authority.advance();await authority.queue;
  authority.movement('peer-host',{playerId:'host',life:0,x:100,y:222,moving:false,vx:0,vy:0});
  authority.movement('peer-guest',{playerId:'guest',life:0,x:200,y:222,moving:false,vx:0,vy:0});
  assert.equal(authority.movement('peer-host',{playerId:'host',life:0,x:100,y:222,moving:true,vx:216,vy:0}),true);
  assert.equal(authority.movement('peer-host',{playerId:'host',life:0,x:100,y:222,moving:true,vx:300,vy:0}),false);
  const start=f.now(),spawn=(n)=>authority.spawn('peer-host',{projectileId:`shot-${n}`,playerId:'host',life:0,shotSeq:n,
    x:100,y:200,vx:PVP_RULES.projectileSpeed,vy:0,ttlMs:PVP_RULES.projectileLifetimeMs,damage:9999});
  assert.equal(spawn(1),true);f.setTime(start+200);
  const first=authority.attempt('peer-host',{projectileId:'shot-1',targetId:'guest',targetLife:0,damage:9999});
  assert.equal(first.damage,50);assert.equal(first.hpAfter,200);
  f.setTime(start+1199);assert.equal(spawn(2),false,'custom cooldown enforced on server');
  for(let n=2;n<=5;n++){
    f.setTime(start+(n-1)*1200);assert.equal(spawn(n),true);
    f.setTime(f.now()+200);assert.equal(authority.attempt('peer-host',{projectileId:`shot-${n}`,targetId:'guest',targetLife:0}).accepted,true);
  }
  const dead=authority.state.participants.find(p=>p.playerId==='guest');assert.equal(dead.hp,0);
  f.setTime(dead.respawnAt);authority.advance();await authority.queue;
  const alive=authority.state.participants.find(p=>p.playerId==='guest');assert.equal(alive.hp,250);assert.equal(alive.life,1);
  assert.deepEqual(l.saved.matchSettings,custom);assert.equal(l.saved.participants.find(p=>p.playerId==='guest').hp,250);
  authority.sync({...initial,matchSettings:DEFAULT_MATCH_SETTINGS});
  assert.deepEqual(authority.settings,custom,'membership echoes cannot rewrite round rules');
  assert.equal(validServerMessage({type:'pvp-combat-state',roomId:'pvp-test',serverTime:f.now(),payload:states.at(-1)}),true);
  const changed={...states.at(-1),matchSettings:DEFAULT_MATCH_SETTINGS};
  assert.deepEqual(await backend.mirrorRealtimeCombat._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay',
    expectedRevision:l.saved.damageRevision,revision:l.saved.damageRevision+1,snapshot:changed}),{applied:false});
});

test('Retry preserves common settings and resets HP to their max; custom HP survives the round-transition validator',async t=>{
  const f=database(t),l=await f.lobby();
  await backend.updateSettings._handler(f.ctx,{...l.args('host'),matchSettings:custom});
  Object.assign(l.saved,{state:'ended',combatAuthorityId:'relay',retryDeadline:f.now()+10000,endedAt:f.now(),reason:'score-limit',winner:'A'});
  l.saved.participants=l.saved.participants.map(p=>({...p,hp:0,life:3,kills:4}));
  const next=await backend.advanceRealtimeRound._handler(f.ctx,{matchId:l.result.matchId,round:0,authorityId:'relay',
    playerIds:['host','guest'],startedAt:f.now()+PVP_RULES.countdownMs});
  assert.deepEqual(next.matchSettings,custom);assert.equal(next.round,1);
  assert.deepEqual(next.participants.map(p=>[p.hp,p.life,p.kills]),[[250,4,0],[250,4,0]]);
  assert.equal(validServerMessage({type:'pvp-round-transition',roomId:'pvp-test',serverTime:f.now(),payload:{fromRound:0,match:next}}),true);
  const wrong={...next,participants:next.participants.map(p=>({...p,hp:100}))};
  assert.equal(validServerMessage({type:'pvp-round-transition',roomId:'pvp-test',serverTime:f.now(),payload:{fromRound:0,match:wrong}}),false);
});

test('a custom long cooldown resets with the new life, without disabling the first post-respawn shot',t=>{
  let now=10000;
  const settings={...custom,attackCooldownMs:5000};
  const authority=new PvpDamageAuthority({state:'active',room:'arena',hostPlayerId:'host',round:0,startedAt:0,endsAt:50000,
    matchSettings:settings,scores:{A:0,B:0},respawnMs:3000,
    participants:[newFighter({playerId:'host',team:'A',presenceRoom:'arena'},settings),
      newFighter({playerId:'guest',team:'B',presenceRoom:'arena'},settings)]},
  {now:()=>now,getSpawn:()=>({x:100,y:222}),schedule:()=>1,cancel(){},commit:async()=>({applied:true})});
  t.after(()=>authority.close());authority.register('host','peer-host');
  const spawn=(life,shotSeq)=>authority.spawn('peer-host',{projectileId:`shot-${life}-${shotSeq}`,playerId:'host',life,shotSeq,
    x:100,y:200,vx:PVP_RULES.projectileSpeed,vy:0,ttlMs:PVP_RULES.projectileLifetimeMs});
  assert.equal(spawn(0,1),true);
  authority.state.participants[0]={...authority.state.participants[0],hp:0,respawnAt:now+3000};
  now+=3000;authority.advance();assert.equal(authority.state.participants[0].life,1);
  assert.equal(spawn(1,1),true,'the previous life cannot delay a fresh life');
  now+=1000;assert.equal(spawn(1,2),false,'the current life still enforces custom cooldown');
});

test('local input speed, HP HUD/bar limits and firing cadence use the same configured rules as the relay',()=>{
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','({DEV:true})').replace('export class PvpArenaScene','class PvpArenaScene');
  const health=[];
  class Bar {setVisible(){}setHealth(hp,max){health.push([hp,max]);return this;}updatePosition(){}}
  const Scene=runInNewContext(source+'\nPvpArenaScene',{PvpMapScene:class{},PVP_MAP:'pvp-test',matchSettingsFor,pvpMovementSpeed,effectiveMatchSettings,PlayerHealthBar:Bar});
  const scene=new Scene();scene.player={speed:PLAYER_SPEED};scene.gameHud={setHealth:(hp,max)=>health.push([hp,max])};scene.pvpRemoteHealthBars=new Map();
  scene.matchState={matchSettings:custom};scene.applyMatchSettings(scene.matchState);assert.equal(scene.player.speed,216);
  scene.updatePvpHudHealth(200);scene.updateRemoteHealthBar({playerId:'guest',hp:225},{sprite:{x:100,y:200}});
  assert.deepEqual(health,[[200,250],[225,250]]);

  const dot={setDepth(){return this;},setScale(){return this;},setRotation(){return this;},destroy(){}};
  const local={source:{layers:[]},player:{x:100,y:222},input:{on(){},off(){}},add:{circle:()=>dot},textures:{exists:()=>false}};
  const combat=new PvpCombatController(local,()=>{}, {onSpawn(){}});
  combat.update({state:'active',matchSettings:custom,participants:[]},{...newFighter({playerId:'host',team:'A',characterBaseId:'felipe'},custom)},0,10000);
  assert.equal(combat.fire({x:500,y:200},10000),true);assert.equal(combat.nextShotAt,11200);
  assert.equal(combat.fire({x:500,y:200},11199),false);assert.equal(combat.fire({x:500,y:200},11200),true);combat.destroy();
});

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.hidden=false;this.value='';}
  append(...children){this.children.push(...children);}setAttribute(){}focus(){}remove(){}
  addEventListener(type,listener){this.events[type]=listener;}
}
test('Settings panel is read-only for guests, preserves an edited draft across reactive echoes, and saves canonical values for the host',async()=>{
  const documentRef={createElement:tag=>new Element(tag)},calls=[],match={state:'waiting',hostPlayerId:'host',matchSettings:custom};
  const panel=new PvpMatchSettingsPanel({parent:new Element('div'),documentRef,playerId:'host',onSave:async settings=>{calls.push(settings);return true;}});
  panel.update(match);assert.ok([...panel.inputs.values()].every(input=>input.disabled),'closed panel cannot capture lobby Tab focus');
  panel.open();assert.equal(panel.inputs.get('movementSpeedMultiplier').value,'150');
  panel.inputs.get('maxHp').value='300';panel.update(match);assert.equal(panel.inputs.get('maxHp').value,'300');
  await panel.save();assert.equal(calls[0].maxHp,300);assert.equal(calls[0].movementSpeedMultiplier,1.5);assert.equal(panel.root.hidden,true);
  panel.resetButton.events.click();assert.equal(calls.length,1,'Reset defaults changes draft only until Save');
  assert.equal(panel.inputs.get('damage').value,String(PVP_RULES.damage));
  const guest=new PvpMatchSettingsPanel({parent:new Element('div'),documentRef,playerId:'guest',onSave:()=>assert.fail('guest cannot save')});
  guest.update(match);guest.open();assert.ok([...guest.inputs.values()].every(input=>input.disabled));
  assert.equal(guest.saveButton.hidden,true);await guest.save();panel.destroy();guest.destroy();
});

for(const [label,settings] of [['defaults',DEFAULT_MATCH_SETTINGS],['custom',custom],['absent',undefined],
  ['partial',{damage:23,attackCooldownMs:undefined,maxHp:null}],['team overrides',teamSettings]])
test(`actual client spawn -> WebSocket -> authoritative hit works with ${label} settings`,async t=>{
  t.mock.method(console,'debug',()=>{});t.mock.method(console,'info',()=>{});
  const f=database(t),l=await f.lobby();l.saved.matchSettings=settings;
  const expected=matchSettingsFor(l.saved);
  await backend.start._handler(f.ctx,l.args('host'));
  // Simulate a legacy/partial stored row independently of start canonicalization.
  l.saved.matchSettings=settings;
  f.tables.players.forEach(row=>row.room=pvpRoom(l.result.matchId));
  const bridge={authenticate:args=>backend.current._handler(f.ctx,args),subscribe(){return ()=>{};},
    acquire:args=>backend.acquireRealtimeCombat._handler(f.ctx,args),commit:args=>backend.mirrorRealtimeCombat._handler(f.ctx,args)};
  const server=createRealtimeServer({port:0,heartbeatMs:60000,now:f.now,pvpBridge:bridge});await server.ready;
  const peers=[];
  const waitFor=async check=>{const until=performance.now()+3000;while(!check()){
    if(performance.now()>until)throw new Error('Settings combat relay timed out');await new Promise(resolve=>setTimeout(resolve,5));}};
  try{
    const initial=await backend.current._handler(f.ctx,l.args('host'));
    for(const [i,playerId] of ['host','guest'].entries()){
      const remoteId=i?'host':'guest',remote={sprite:{x:i?900:1000,y:722}};
      const remotes={bufferOptions:{},players:new Map([[remoteId,remote]]),receive(){},
        receiveMovement(_id,p){Object.assign(remote.sprite,{x:p.x,y:p.y});}};
      const dot=()=>({setDepth(){return this;},setScale(){return this;},setRotation(){return this;},setPosition(){return this;},destroy(){}});
      const scene={source:{layers:[]},player:{x:i?1000:900,y:722},remotes,input:{on(){},off(){}},add:{circle:dot}};
      const peer={state:initial,errors:[]};
      peer.transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,
        roomId:`pvp-${l.result.matchId}-0`,WebSocketImpl:WebSocket});
      peer.movement=new PvpMovementClient({matchId:l.result.matchId,match:initial,playerId,transport:peer.transport,remotes,
        getSpawn:()=>({x:0,y:0}),log:()=>{},snapshot:()=>({x:scene.player.x,y:scene.player.y,
          moving:false,vx:0,vy:0,direction:i?'left':'right',life:0})});
      peer.combat=new PvpCombatController(scene,hit=>peer.damage.attempt(hit),{
        canFire:()=>peer.damage.authorized&&peer.damage.hp?.state==='active'&&peer.movement.authorizedPoseSent,
        onSpawn:p=>peer.projectiles.sendSpawn(p),onRemove:p=>peer.projectiles.sendDestroy(p)});
      peer.projectiles=new PvpProjectileClient(peer.movement,peer.combat);
      peer.damage=new PvpDamageClient(peer.movement,{matchId:l.result.matchId,sessionId:`session-${playerId}`,
        onError:error=>peer.errors.push(error),onState:state=>{peer.state=state;peer.movement.setMatch(state);
          peer.projectiles.setMatch(state);peer.combat.update(state,state.participants.find(p=>p.playerId===playerId),0,f.now());}});
      peers.push(peer);
    }
    await waitFor(()=>peers.every(p=>p.damage.authorized));
    const authority=server.authorities.get(`pvp-${l.result.matchId}-0`).authority;
    await waitFor(()=>authority.positions.size===2);
    f.setTime(initial.startedAt);authority.advance();await waitFor(()=>peers.every(p=>p.state.state==='active'));
    assert.deepEqual(authority.settings,expected);
    const host=peers[0],fire=async()=>{
      const hpBefore=host.state.participants.find(p=>p.playerId==='guest').hp;
      assert.equal(host.combat.fire({x:1000,y:700},f.now()),true);
      const shot=host.combat.shots.at(-1);await waitFor(()=>authority.projectiles.has(shot.event.projectileId));
      f.setTime(f.now()+250);host.combat.update(host.state,host.combat.self,250,f.now());
      await waitFor(()=>peers[1].state.participants.find(p=>p.playerId==='guest').hp<hpBefore);
    };
    const start=f.now();await fire();
    const targetHp=effectiveMatchSettings(initial,'B').maxHp;
    assert.equal(peers[1].state.participants.find(p=>p.playerId==='guest').hp,targetHp-expected.damage);
    assert.equal(host.combat.fire({x:1000,y:700},start+expected.attackCooldownMs-1),false);
    f.setTime(start+expected.attackCooldownMs);await fire();await authority.queue;
    assert.equal(l.saved.participants.find(p=>p.playerId==='guest').hp,targetHp-2*expected.damage);
    assert.ok(peers.every(p=>p.errors.length===0&&p.transport.getStats().rejected===0));
  }finally{
    for(const p of peers){p.damage.close();p.projectiles.close();p.movement.close();p.combat.destroy();}
    await server.close();
  }
});

test('partial wire settings resolve defaults, but supplied invalid values remain rejected',()=>{
  const payload={authorityId:'relay',version:1,round:0,damageRevision:0,state:'active',scores:{A:0,B:0},
    startedAt:0,endsAt:180000,endedAt:null,winner:null,reason:null,events:[],
    matchSettings:{damage:23,maxHp:200},players:[newFighter({playerId:'host'},{maxHp:200})]};
  const message={type:'pvp-combat-state',roomId:'pvp-test',serverTime:10000,payload};
  assert.equal(validServerMessage(message),true);
  assert.deepEqual(matchSettingsFor(payload),{...DEFAULT_MATCH_SETTINGS,maxHp:200,damage:23});
  assert.equal(validServerMessage({...message,payload:{...payload,matchSettings:{damage:NaN}}}),false);
});

test('a legacy relay cannot silently authorize custom rules it does not enforce',()=>{
  const transport=new RealtimeTransport(),errors=[];
  const movement={transport,playerId:'host',round:0,roomId:'pvp-test',joined:false,
    match:{matchSettings:custom,participants:[newFighter({playerId:'host'},custom)]},config:{debug:false}};
  const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'session-host',onState(){},onError:e=>errors.push(e)});
  const ack=settings=>transport.emitMessage({type:'pvp-authorized',roomId:'pvp-test',payload:{playerId:'host',round:0,
    ...(settings?{matchSettings:settings}:{})}});
  ack();assert.equal(client.authorized,false);assert.match(errors[0].message,/Restart npm run realtime:server/);
  ack(custom);assert.equal(client.authorized,true);client.close();
});

test('relay compatibility includes both teams, compares values rather than object identity, and accepts partial inherited globals',()=>{
  const transport=new RealtimeTransport(),errors=[];
  const movement={transport,playerId:'host',round:0,roomId:'pvp-test',joined:false,config:{debug:false},
    match:{matchSettings:{teamOverrides:{B:{maxHp:180}}},participants:[newFighter({playerId:'host',team:'A'})]}};
  const client=new PvpDamageClient(movement,{matchId:'match-a',sessionId:'session-host',onState(){},onError:e=>errors.push(e)});
  const ack=matchSettings=>transport.emitMessage({type:'pvp-authorized',roomId:'pvp-test',payload:{playerId:'host',round:0,matchSettings}});
  ack(DEFAULT_MATCH_SETTINGS);assert.equal(client.authorized,false);assert.match(errors[0].message,/Restart/);
  ack({teamOverrides:{B:{maxHp:180},A:null}});assert.equal(client.authorized,true);
  ack({teamOverrides:{B:{maxHp:190}}});assert.equal(client.authorized,false);client.close();
});

test('team fields independently switch Use Global/Custom, remain read-only for non-hosts, and survive lobby echoes',async()=>{
  const documentRef={createElement:tag=>new Element(tag)},calls=[],match={state:'waiting',hostPlayerId:'host',matchSettings:DEFAULT_MATCH_SETTINGS};
  const panel=new PvpMatchSettingsPanel({parent:new Element('div'),documentRef,playerId:'host',onSave:async settings=>{calls.push(settings);return true;}});
  panel.update(match);panel.open();const hp=panel.overrides.get('B.maxHp');
  assert.equal(hp.mode.value,'global');assert.equal(hp.input.hidden,true);
  hp.mode.value='custom';hp.mode.events.change();hp.input.value='180';panel.update(structuredClone(match));
  assert.equal(hp.input.value,'180');assert.equal(panel.overrides.get('B.damage').mode.value,'global');
  await panel.save();assert.deepEqual(calls[0],{...DEFAULT_MATCH_SETTINGS,teamOverrides:{A:{},B:{maxHp:180}}});
  panel.update({...match,matchSettings:calls[0]});panel.open();
  panel.resetButton.events.click();assert.equal(hp.mode.value,'global');assert.equal(hp.input.hidden,true);
  panel.open();hp.mode.value='global';hp.mode.events.change();await panel.save();
  assert.deepEqual(calls[1],DEFAULT_MATCH_SETTINGS,'Use Global removes only the overridden field');
  const guest=new PvpMatchSettingsPanel({parent:new Element('div'),documentRef,playerId:'guest',onSave:()=>assert.fail('non-host')});
  guest.update({...match,matchSettings:teamSettings});guest.open();
  assert.ok([...guest.overrides.values()].every(({mode,input})=>mode.disabled&&input.disabled));
  await guest.save();panel.destroy();guest.destroy();
});

test('client movement and local/remote health bars resolve their respective roster teams',()=>{
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','{}').replace('export class PvpArenaScene','class PvpArenaScene');
  const values=[];class Bar{setVisible(){}setHealth(hp,max){values.push([hp,max]);return this;}updatePosition(){}}
  const Scene=runInNewContext(source+'\nPvpArenaScene',{PvpMapScene:class{},PVP_MAP:'pvp-test',pvpMovementSpeed,effectiveMatchSettings,PlayerHealthBar:Bar});
  const scene=new Scene();scene.presence={identity:{playerId:'guest'}};scene.player={};scene.pvpRemoteHealthBars=new Map();
  scene.gameHud={setHealth:(hp,max)=>values.push([hp,max])};
  scene.matchState={matchSettings:teamSettings,participants:[{playerId:'host',team:'A'},{playerId:'guest',team:'B'}]};
  scene.applyMatchSettings(scene.matchState);assert.equal(scene.player.speed,pvpMovementSpeed(scene.matchState,'B'));assert.equal(scene.pvpSettings.maxHp,180);
  scene.updatePvpHudHealth(180);scene.updateRemoteHealthBar({playerId:'host',team:'A',hp:100},{sprite:{x:100,y:222}});
  assert.deepEqual(values,[[180,180],[100,100]]);
  scene.matchState.participants[1].team='A';scene.applyMatchSettings(scene.matchState);assert.equal(scene.player.speed,PLAYER_SPEED);
});

for(const ended of [false,true])
test(`secondary scene completes host departure ${ended?'after end':'during play'} despite a late Retry echo and different wall clock`,async t=>{
  const f=database(t),l=await f.lobby();
  await backend.start._handler(f.ctx,l.args('host'));
  if(ended)Object.assign(l.saved,endMatch(l.saved,f.now(),'score-limit'));
  f.setTime(110000);await backend.leave._handler(f.ctx,l.args('host'));
  const departed=await backend.current._handler(f.ctx,l.args('guest'));
  assert.equal(departed.reason,'host_left');
  const source=readFileSync(new URL('../src/scenes/PvpArenaScene.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','({DEV:true})').replace('export class PvpArenaScene','class PvpArenaScene');
  // Client wall-clock remains behind; the existing match clock advances monotonically.
  const Scene=runInNewContext(source+'\nPvpArenaScene',{PvpMapScene:class{},PVP_MAP:'pvp-test',
    Date:{now:()=>100000},resolvedMovementState:()=>({moving:false})});
  const scene=new Scene(),requests=[],returns=[],rendered=[];
  Object.assign(scene,{matchState:departed,pvpSettings:DEFAULT_MATCH_SETTINGS,pvpRemoteHealthBars:new Map(),
    presence:{identity:{playerId:'guest'}},matchClient:{now:f.now},lastLife:0,
    player:{body:{},setAlpha(){return this;},setCombatHealth(){return this;},setVelocity(){},setFacing(){}},
    remotes:{players:new Map(),update(){}},pvpHud:{render:(_state,_me,_now,remaining)=>rendered.push(remaining)}});
  scene.returnFlow=new PvpReturnFlow(async(action,args)=>{requests.push(action);
    return backend.returnToLobby._handler(f.ctx,{...l.args('guest'),...args});},id=>{returns.push(id);scene.leaving=true;scene.returnFlow.close();});
  scene.update(0,0);assert.equal(rendered.at(-1),10);
  // Before the fix this late field skipped all future returnFlow.update calls.
  scene.matchState={...departed,retry:{deadline:120000,playerIds:[],activePlayerIds:['guest'],resolving:false}};
  f.setTime(115000);scene.update(0,0);assert.equal(rendered.at(-1),5);
  f.setTime(120000);scene.update(0,0);await scene.returnFlow.pending;
  assert.deepEqual(requests,['returnToLobby']);assert.deepEqual(returns,[null]);
  scene.update(0,0);assert.equal(requests.length,1);
});
