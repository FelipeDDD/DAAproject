import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { PvpDamageAuthority } from '../src/pvp/PvpDamageAuthority.js';
import { PvpDamageClient } from '../src/pvp/PvpDamageClient.js';
import { PvpCombatController } from '../src/pvp/PvpCombatController.js';
import { SkillRegistry } from '../src/pvp/skills/SkillRegistry.js';
import { SkillClient } from '../src/pvp/skills/SkillClient.js';
import { SkillView } from '../src/pvp/skills/SkillView.js';
import { SkillHud } from '../src/pvp/skills/SkillHud.js';
import { InventoryHotbar } from '../src/inventory/InventoryHotbar.js';
import { SKILL_DEFAULTS,PVP_MODE_SKILLS,SKILL_INPUTS } from '../src/pvp/skills/config.js';
import { FireZoneSkill } from '../src/pvp/skills/skills/FireZoneSkill.js';
import { PVP_MAP_DEFINITION,PVP_RULES,pvpRoom } from '../src/pvp/config.js';
import { pvpRealtimeRoom } from '../src/pvp/movementConfig.js';
import { newFighter } from '../src/pvp/matchState.js';
import { createModeAuthority } from '../src/pvp/modeAuthority.js';
import { validServerMessage,validClientMessage } from '../src/realtime/realtimeMessages.js';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { createRealtimeServer } from '../scripts/realtime-server.mjs';

const map=JSON.parse(readFileSync(new URL('../public/assets/maps/payload-map.tmj',import.meta.url),'utf8'));
function match(mode='payload',round=0){
  const room=pvpRoom('skill-match');
  return {mode,round,arenaMap:PVP_MAP_DEFINITION,matchId:'skill-match',room,damageRevision:0,matchSettings:{},
    state:'active',hostPlayerId:'alice',startedAt:0,endsAt:999999,expiresAt:999999,
    scores:{A:0,B:0},scoreLimit:5,respawnMs:PVP_RULES.respawnMs,
    participants:[['alice','A'],['bob','B'],['ally','A']].map(([playerId,team])=>newFighter({playerId,team,presenceRoom:room}))};
}
function clock(){
  let at=10000,serial=0;const jobs=new Map();
  return {jobs,now:()=>at,schedule(fn,delay){const id=++serial;jobs.set(id,{fn,at:at+delay});return id;},cancel(id){jobs.delete(id);},
    tick(to){for(let count=0;;count++){
      const next=[...jobs].filter(([,job])=>job.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;assert.ok(count<1000,'no deadline spin');
      const [id,job]=next;jobs.delete(id);at=job.at;job.fn();
    }at=to;}};
}
function fixture({mode='payload',round=0,registry}={}){
  const time=clock(),packets=[],commits=[],errors=[],state=match(mode,round);
  const authority=new PvpDamageAuthority(state,{...time,authorityId:'skill-authority',skillRegistry:registry,
    modeAuthority:createModeAuthority(mode,map,{now:time.now}),getSpawn:()=>({x:100,y:100,direction:'right'}),
    onState:packet=>packets.push(packet),onFailure:error=>errors.push(error),commit:async args=>{commits.push(args);return {applied:true};}});
  for(const player of state.participants)authority.register(player.playerId,`peer-${player.playerId}`,`session-${player.playerId}`);
  const f={authority,time,packets,commits,errors,
    player:id=>authority.state.participants.find(p=>p.playerId===id),
    request:(changes={})=>({skillId:'fire-zone',playerId:'alice',sessionId:'session-alice',round,life:0,castSeq:1,...changes}),
    use(changes={},peer='peer-alice'){return authority.useSkill(peer,f.request(changes));},
    move(id,x=180,y=100,direction='right',life=f.player(id).life){return authority.movement(`peer-${id}`,{playerId:id,
      life,x,y,direction,moving:false,vx:0,vy:0,sampleSeq:1});}};
  f.move('alice',100);f.move('bob');f.move('ally');return f;
}

test('mode permissions: TDM rejects, Payload permits only registered fire-zone',()=>{
  for(const mode of ['tdm','payload']){
    const f=fixture({mode});try{
      assert.equal(f.use().accepted,mode==='payload');
      assert.equal(f.use({skillId:'dash',castSeq:2}).reason,'skill_disabled');
      assert.deepEqual(f.authority.skills.snapshot().enabled,mode==='payload'?['fire-zone']:[]);
    }finally{f.authority.close();}
  }
});
test('mode overrides replace defaults without mutating global defaults or copying implementation',()=>{
  const modes=structuredClone(PVP_MODE_SKILLS);modes.payload.skillOverrides={'fire-zone':{cooldownMs:20000,placementDistance:60}};
  const registry=new SkillRegistry([FireZoneSkill],SKILL_DEFAULTS,modes),resolved=registry.resolve('payload','fire-zone');
  assert.equal(resolved.definition,FireZoneSkill);assert.equal(resolved.config.cooldownMs,20000);
  assert.equal(resolved.config.radius,56);assert.equal(SKILL_DEFAULTS['fire-zone'].cooldownMs,25000);
  assert.equal(registry.resolve('tdm','fire-zone'),null);
  const f=fixture({registry});try{
    assert.equal(f.use().accepted,true);const snapshot=f.authority.skills.snapshot();
    assert.equal(snapshot.cooldowns[0].readyAt,30000);assert.equal(snapshot.instances[0].x,160);
  }finally{f.authority.close();}
  modes.payload.skillOverrides['fire-zone'].unknown=1;
  assert.throws(()=>new SkillRegistry([FireZoneSkill],SKILL_DEFAULTS,modes),/Unknown skill override/);
});
test('common cooldown is server-owned and independent per owner; duplicate intents cannot create zones',()=>{
  const f=fixture();try{
    assert.equal(f.use().accepted,true);
    assert.equal(f.use().reason,'stale_sequence');
    assert.equal(f.use({castSeq:2}).reason,'cooldown');
    assert.equal(f.use({playerId:'bob',sessionId:'session-bob'},'peer-bob').accepted,true);
    f.time.tick(14999);assert.equal(f.use({castSeq:3}).reason,'cooldown');
    f.time.tick(15000);assert.equal(f.use({castSeq:4}).accepted,true);
    assert.equal(f.authority.skills.snapshot().cooldowns.find(c=>c.playerId==='alice').readyAt,20000);
  }finally{f.authority.close();assert.equal(f.time.jobs.size,0);}
});
test('common authority rejects wrong owner/session/round/life, dead or absent players and inactive matches',()=>{
  const f=fixture();try{
    for(const [changes,peer,reason] of [
      [{},'stranger','unowned_player'],[{playerId:'bob'},'peer-alice','unowned_player'],
      [{sessionId:'session-bob'},'peer-alice','invalid_session'],[{round:1},'peer-alice','stale_round'],
      [{life:99},'peer-alice','stale_life'],[{x:999},'peer-alice','invalid_request'],
    ])assert.equal(f.use(changes,peer).reason,reason);
    f.player('alice').hp=0;assert.equal(f.use().reason,'dead_player');f.player('alice').hp=100;
    f.player('alice').presenceRoom='wrong';assert.equal(f.use().reason,'invalid_presence');
    f.player('alice').presenceRoom=f.authority.state.room;
    f.authority.state.state='countdown';f.authority.state.startedAt=20000;
    assert.equal(f.use().reason,'match_inactive');assert.equal(f.authority.skills.instances.size,0);
    f.authority.register('alice','peer-alice');f.authority.state.state='active';f.authority.state.startedAt=0;
    assert.equal(f.use().reason,'invalid_session','membership without verified session cannot cast');
  }finally{f.authority.close();}
});
test('Fire Zone telegraphs for 500ms, deals 5 HP/s for 5s, ignores allies/self and mirrors authoritative HP',async()=>{
  const f=fixture();try{
    f.move('alice',100);assert.equal(f.use().accepted,true);
    const initial=f.authority.skills.snapshot().instances[0];
    assert.equal(initial.x,180);assert.equal(initial.radius,56);assert.equal(initial.phase,'telegraph');
    f.move('alice',180);f.time.tick(10499);assert.equal(f.player('bob').hp,100);
    f.time.tick(10500);assert.equal(f.authority.skills.snapshot().instances[0].phase,'active');assert.equal(f.player('bob').hp,100);
    f.time.tick(11500);assert.equal(f.player('bob').hp,95);
    assert.equal(f.player('alice').hp,100);assert.equal(f.player('ally').hp,100);
    f.time.tick(15500);assert.equal(f.player('bob').hp,75);assert.equal(f.authority.skills.instances.size,0);
    assert.equal(f.authority.skills.snapshot().cooldowns[0].readyAt,15000);
    for(const packet of f.packets)assert.equal(validServerMessage({type:'pvp-combat-state',roomId:'room',serverTime:f.time.now(),payload:packet}),true);
    await f.authority.queue;assert.deepEqual(f.errors,[]);
    assert.equal(f.commits.at(-1).snapshot.players.find(p=>p.playerId==='bob').hp,75);
    assert.equal(f.commits.at(-1).snapshot.skills,undefined,'only HP/deaths enter the trusted combat mirror');
    f.time.tick(18499);assert.equal(f.player('bob').hp,75);
    f.time.tick(18500);assert.equal(f.player('bob').hp,78,'regen resumes after three seconds without skill damage');
  }finally{f.authority.close();}
});
test('leaving the radius stops damage; reentering resumes without catch-up or accumulated damage',()=>{
  const f=fixture();try{
    f.use();f.time.tick(11500);assert.equal(f.player('bob').hp,95);
    f.move('bob',237);f.time.tick(12500);assert.equal(f.player('bob').hp,95);
    f.move('bob',236);f.time.tick(12750);assert.equal(f.player('bob').hp,93.75);
    f.move('bob',300);f.time.tick(15500);assert.equal(f.authority.skills.instances.size,0);
  }finally{f.authority.close();}
});
test('skill lethal damage uses existing kills/deaths/respawn and never ends Payload on the score limit',()=>{
  const f=fixture();try{
    f.authority.state.scores.A=4;f.player('bob').hp=2.5;f.use();f.time.tick(11000);
    assert.equal(f.player('bob').hp,0);assert.equal(f.player('bob').deaths,1);assert.equal(f.player('alice').kills,1);
    assert.equal(f.authority.state.scores.A,5);assert.equal(f.authority.state.state,'active');
    const deadline=f.player('bob').respawnAt;assert.ok(deadline>f.time.now());
    f.time.tick(deadline);assert.equal(f.player('bob').life,1);assert.equal(f.player('bob').hp,100);
    assert.equal(f.authority.regen.has('bob'),false);
  }finally{f.authority.close();}
});
test('end, owner death/life change, disconnect, round change and close remove obsolete instances',()=>{
  for(const action of ['end','death','life','disconnect','round','close']){
    const f=fixture();try{
      f.use();const previousTimer=f.authority.timer;
      if(action==='end')f.authority.requestEnd('peer-alice');
      if(action==='death'){f.player('alice').hp=0;f.authority.advance();}
      if(action==='life'){f.player('alice').life++;f.authority.advance();}
      if(action==='disconnect')f.authority.remove('peer-alice');
      if(action==='round')f.authority.sync({...f.authority.state,round:1});
      if(action==='close')f.authority.close();
      assert.equal(f.authority.skills.instances.size,0,action);
      assert.equal(f.authority.skills.nextDeadline(),null,action);
      if(!['death','life'].includes(action))assert.equal(f.time.jobs.has(previousTimer),false,action);
      if(['death','life'].includes(action))assert.equal(f.authority.skills.cooldowns.size,1,'death cannot bypass cooldown');
      else assert.equal(f.authority.skills.cooldowns.size,0);
      if(action==='round'){
        const next=fixture({round:1});try{
          assert.equal(next.use({round:0}).reason,'stale_round');assert.equal(next.authority.skills.instances.size,0);
          assert.equal(next.use().accepted,true);assert.ok(next.authority.skills.snapshot().instances[0].id.startsWith('skill-1-'));
        }finally{next.authority.close();}
      }
    }finally{f.authority.close();assert.equal(f.time.jobs.size,0);}
  }
});
test('skill wire accepts only intent, rejects injected damage/position/config and keeps snapshots round-scoped',()=>{
  const f=fixture();try{
    const message={type:'pvp-skill-use',roomId:'room',channel:'reliable',seq:1,sentAt:10000,payload:f.request()};
    assert.equal(validClientMessage(message),true);
    for(const extra of [{x:0,y:0},{damagePerSecond:999},{cooldownMs:0},{ownerId:'bob'}])
      assert.equal(validClientMessage({...message,payload:{...message.payload,...extra}}),false);
    assert.equal(validClientMessage({...message,channel:'unreliable'}),false);
    f.use();const packet=f.packets.at(-1),envelope={type:'pvp-combat-state',roomId:'room',serverTime:10000,payload:packet};
    assert.equal(validServerMessage(envelope),true);
    assert.equal(validServerMessage({...envelope,payload:{...packet,round:1}}),false);
    assert.ok(JSON.stringify(envelope).length<8192);
    assert.equal(JSON.stringify(packet).includes('session-alice'),false);
  }finally{f.authority.close();}
});

function fakeTransport(){
  const listeners=new Set(),sent=[];return {listeners,sent,onMessage(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
    sendReliable(type,payload){sent.push({type,payload});return true;},emit(message){for(const fn of listeners)fn(message);}};
}
test('SkillClient uses configurable input, current reliable pose and verified snapshots; resets and removes keys/listeners',()=>{
  const f=fixture(),transport=fakeTransport(),keys=new Map(),removed=[];
  f.use();const packet=f.packets.at(-1);
  const movement={transport,round:0,roomId:'room',playerId:'alice',match:f.authority.state,closed:false,
    update(_at,options){assert.deepEqual(options,{force:true,reliable:true});transport.sendReliable('pose',{});return true;}};
  const damage={movement,sessionId:'session-alice',authorized:false,hp:packet};
  const client=new SkillClient(damage,{keyboard:{addKey(key){const object={isDown:false};keys.set(key,object);return object;},removeKey(key){removed.push(key);}},
    bindings:SKILL_INPUTS,getAimPoint:()=>({x:180,y:100})});
  try{
    assert.equal(SKILL_INPUTS['fire-zone'].slot,2);assert.equal(keys.size,1);
    keys.get('TWO').isDown=true;client.update();assert.equal(transport.sent.length,0);
    keys.get('TWO').isDown=false;client.update();damage.authorized=true;keys.get('TWO').isDown=true;client.update();
    assert.equal(transport.sent.length,0,'key 2 arms targeting without casting');
    assert.equal(client.targeting.skillId,'fire-zone');client.handlePointer({button:0});
    assert.deepEqual(transport.sent.map(m=>m.type),['pose','pvp-skill-use']);
    assert.deepEqual(transport.sent[1].payload.aim,{x:180,y:100});assert.equal(client.targeting,null);
    assert.equal(transport.sent[1].payload.life,0);assert.equal(transport.sent[1].payload.sessionId,'session-alice');
    client.update();assert.equal(transport.sent.length,2,'holding the key does not create per-frame casts');
    movement.round=1;movement.match={...movement.match,round:1};client.reset(1);
    transport.emit({type:'pvp-skill-result',roomId:'room',payload:{round:0,skillId:'fire-zone',castSeq:1,accepted:true}});
    assert.equal(client.lastResult,null);assert.equal(client.snapshot(),null);
    client.close();client.close();assert.equal(removed.length,1);assert.equal(transport.listeners.size,0);
  }finally{client.close();f.authority.close();}
});

test('ground targeting previews the authoritative limit, confirms on click and cancels cleanly',()=>{
  const f=fixture(),transport=fakeTransport(),events=new Map();let aim={x:1000,y:500};
  const movement={transport,round:0,roomId:'room',playerId:'alice',match:f.authority.state,closed:false,
    update:()=>true};
  const damage={movement,sessionId:'session-alice',authorized:true,hp:{round:0,skills:f.authority.skills.snapshot()}};
  const keyboard={enabled:true,addKey:()=>({isDown:false}),removeKey(){},
    on:(event,handler)=>events.set(event,handler),off:event=>events.delete(event)};
  const client=new SkillClient(damage,{keyboard,getAimPoint:()=>aim,getOrigin:()=>({x:100,y:100}),now:f.time.now});
  const combat=new PvpCombatController({source:{layers:[]},input:{on(){},off(){}},
    cameras:{main:{getWorldPoint:()=>aim}}},()=>{},{consumePointer:pointer=>client.handlePointer(pointer)});
  let ordinaryShots=0;combat.fire=()=>ordinaryShots++;
  try{
    assert.equal(client.activate('fire-zone'),true);assert.equal(transport.sent.length,0);
    const preview=client.targetingPreview();assert.equal(preview.clamped,true);
    assert.ok(Math.abs(Math.hypot(preview.x-100,preview.y-100)-192)<1e-9);
    assert.equal(preview.radius,SKILL_DEFAULTS['fire-zone'].radius);
    combat.pointer({button:0});assert.equal(ordinaryShots,0,'confirmation consumes the ordinary attack click');
    assert.equal(client.targeting,null);
    const intent=transport.sent.at(-1);assert.equal(intent.type,'pvp-skill-use');
    assert.equal(f.authority.useSkill('peer-alice',intent.payload).accepted,true);
    transport.emit({type:'pvp-skill-result',roomId:'room',payload:{round:0,skillId:'fire-zone',castSeq:intent.payload.castSeq,accepted:true}});
    const instance=f.authority.skills.snapshot().instances[0];
    assert.equal(instance.x,preview.x);assert.equal(instance.y,preview.y);
    assert.equal(client.handlePointer({button:0}),false,'ordinary clicks resume after confirmation');
    combat.pointer({button:0});assert.equal(ordinaryShots,1);
    damage.hp.skills=f.authority.skills.snapshot();
    assert.equal(client.activate('fire-zone'),false,'cannot arm during authoritative cooldown');
    f.time.tick(15000);assert.equal(client.activate('fire-zone'),true);
    events.get('keydown-ESC')();assert.equal(client.targeting,null);
    client.activate('fire-zone');assert.equal(client.handlePointer({button:2}),true);assert.equal(client.targeting,null);
    client.activate('fire-zone');client.activate('fire-zone');assert.equal(client.targeting,null);
    client.activate('fire-zone');f.player('alice').life++;client.update();assert.equal(client.targeting,null);
    client.activate('fire-zone');client.reset(1);assert.equal(client.targeting,null);
    assert.equal(transport.sent.length,1,'preview and cancellation never submit casts');
    client.close();assert.equal(events.size,0);assert.equal(transport.listeners.size,0);
  }finally{combat.destroy();client.close();f.authority.close();}
});
test('skill views/HUD consume snapshots only and destroy/recreate without stale-round objects',()=>{
  const f=fixture();f.use();const objects=[];
  const scene={add:{graphics(){const object={destroyed:false};objects.push(object);
    for(const method of ['setDepth','setPosition','clear','fillStyle','fillCircle','lineStyle','strokeCircle'])object[method]=()=>object;
    object.destroy=()=>object.destroyed=true;return object;}}};
  const view=new SkillView(scene),state={...f.authority.state,skills:f.authority.skills.snapshot()};
  const original=structuredClone(state);view.render(state,10000);assert.equal(objects.length,1);
  for(let frame=0;frame<30;frame++)view.render(state,999999);
  assert.equal(objects.length,1,'no per-frame allocation or local expiry');assert.deepEqual(state,original);
  view.render({...state,state:'ended'},10000);assert.equal(view.items.size,0);assert.equal(objects[0].destroyed,true);
  view.reset(1);view.render(state,10000);assert.equal(view.items.size,0,'old round cannot return');
  view.render({...state,round:1,skills:{...state.skills,instances:state.skills.instances.map(i=>({...i,round:1}))}},10000);
  assert.equal(view.items.size,1);view.destroy();assert.ok(objects.every(o=>o.destroyed));
  f.authority.close();
});

test('normal inventory bar shows Fire Zone in slot 2 without loading items, uses server cooldowns and cleans up',()=>{
  const f=fixture(),casts=[];
  const createElement=()=>({children:[],dataset:{},style:{},
    classList:{add(){},toggle(){}},
    setAttribute(name,value){this[name]=value;},append(...nodes){this.children.push(...nodes);},
    replaceChildren(...nodes){this.children=nodes;},
    remove(){this.removed=true;}});
  const parent=createElement(),documentRef={createElement,createElementNS:createElement};
  const hud=new SkillHud(parent,{documentRef,onUse:id=>casts.push(id)});
  try{
    assert.ok(hud.hotbar instanceof InventoryHotbar);assert.equal(hud.hotbar.slots.length,4);
    assert.equal(hud.root.className,'school-hotbar inventory-hotbar');assert.equal(parent.children.length,1);
    assert.equal(hud.hotbar.client,null);assert.equal(hud.hotbar.overlay,null);assert.equal(hud.hotbar.backpack,undefined);
    assert.equal(hud.hotbar.onKeyDown,undefined,'no competing inventory hotkey handler');
    const slot=hud.hotbar.actionViews.get('fire-zone'),button=slot.slot;
    assert.equal(button.dataset.slot,'2');
    let state={...f.authority.state,skills:f.authority.skills.snapshot()};
    const self=state.participants[0];
    hud.render(state,self,10000);assert.equal(slot.status.textContent,'READY');
    assert.equal(button.disabled,false);button.onclick();assert.deepEqual(casts,['fire-zone']);
    assert.deepEqual(hud.hotbar.slots.map(item=>item?.id??null),[null,'fire-zone',null,null]);
    f.use();state={...state,skills:f.authority.skills.snapshot()};const original=structuredClone(state);
    hud.render(state,self,10000);assert.equal(slot.status.textContent,'5s');assert.equal(button.disabled,true);
    button.onclick();assert.equal(casts.length,1,'cooldown blocks the UI action');
    hud.render(state,self,14001);assert.equal(slot.status.textContent,'1s');
    hud.render(state,self,15000);assert.equal(slot.status.textContent,'READY');assert.equal(button.disabled,false);
    hud.render(state,{...self,hp:0},15000);assert.equal(button.disabled,true);
    hud.render({...state,state:'countdown'},self,15000);assert.equal(button.disabled,true);
    hud.render({...state,skills:{enabled:[],cooldowns:[]}},self,15000);assert.equal(hud.root.hidden,true);
    hud.render({...state,state:'ended'},self,15000);assert.equal(hud.root.hidden,true);
    hud.render({...state,round:1,skills:{enabled:['fire-zone'],cooldowns:[]}},self,15000);
    assert.equal(slot.status.textContent,'READY');assert.equal(button.disabled,false);
    assert.deepEqual(state,original,'HUD never mutates cooldown/gameplay state');
    hud.destroy();hud.destroy();assert.equal(hud.root.removed,true);assert.equal(button.onclick,null);
    const next=new SkillHud(parent,{documentRef});
    next.render(state,self,11000);assert.equal(next.hotbar.actionViews.get('fire-zone').status.textContent,'4s');next.destroy();
  }finally{hud.destroy();f.authority.close();}
});

async function waitFor(predicate){
  const deadline=Date.now()+4000;
  while(!predicate()){if(Date.now()>deadline)throw new Error('Skill relay timeout');await new Promise(resolve=>setTimeout(resolve,5));}
}
test('relay recovers when Convex starts later; concurrent joins share one bridge initialization',async()=>{
  const time=clock(),current=match();let backendReady=false,attempts=0,closed=0;
  const bridge={async authenticate(){return structuredClone(current);},subscribe(){return ()=>{};},
    async commit(){return {applied:true};},async close(){closed++;}};
  const server=createRealtimeServer({...time,port:0,heartbeatMs:60000,pvpBridgeFactory:async()=>{
    attempts++;if(!backendReady)throw new Error('Local Convex not started');
    await new Promise(resolve=>setTimeout(resolve,20));return bridge;
  }});
  await server.ready;const peers=[];
  async function connect(playerId){
    const errors=[],transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,
      roomId:pvpRealtimeRoom(current.matchId),WebSocketImpl:WebSocket});
    transport.onMessage(m=>{if(m.type==='welcome')transport.sendReliable('join-room',{});});
    const movement={transport,match:current,playerId,round:0,roomId:transport.roomId,closed:false,config:{debug:false}};
    const client=new PvpDamageClient(movement,{matchId:current.matchId,sessionId:`session-${playerId}`,
      onState:state=>movement.match=state,onError:error=>errors.push(error),log:()=>{}});
    const peer={transport,movement,client,errors};peers.push(peer);await transport.connect();return peer;
  }
  try{
    const a=await connect('alice');await waitFor(()=>a.errors.length===1);
    assert.equal(a.client.authorized,false);assert.equal(server.authorities.size,0);assert.equal(attempts,1);
    backendReady=true;
    const b=await connect('bob');a.client.authorize();
    await waitFor(()=>a.client.authorized&&b.client.authorized&&a.client.hp&&b.client.hp);
    assert.equal(attempts,2,'failed initialization is retried once, concurrent joins reuse the pending attempt');
    assert.equal(a.movement.match.state,'active');assert.equal(b.movement.match.state,'active');
    assert.deepEqual(a.client.hp.skills.enabled,['fire-zone']);assert.equal(server.authorities.size,1);
  }finally{
    for(const peer of peers){peer.client.close();peer.transport.disconnect();}
    await server.close();assert.equal(closed,1);assert.equal(time.jobs.size,0);
  }
});

test('real relay synchronizes Fire Zone/HP and Retry authenticates a fresh round with clean cooldowns',async()=>{
  const time=clock();let current=match();current.participants=current.participants.filter(p=>p.playerId!=='ally');
  const bridge={async authenticate(args){assert.equal(args.round,current.round);assert.equal(args.sessionId,`session-${args.playerId}`);return structuredClone(current);},
    subscribe(){return ()=>{};},async commit(){return {applied:true};},async nextRound(args){
      current={...current,round:args.round+1,state:'countdown',startedAt:args.startedAt,endsAt:args.startedAt+PVP_RULES.timeLimitMs,
        participants:current.participants.map(p=>({...newFighter(p),life:p.life+1}))};return structuredClone(current);
    }};
  const server=createRealtimeServer({...time,port:0,heartbeatMs:60000,pvpBridge:bridge});await server.ready;
  const peers=[];
  async function connect(playerId){
    const transport=new WebSocketTransport({url:`ws://127.0.0.1:${server.wss.address().port}`,roomId:pvpRealtimeRoom(current.matchId),WebSocketImpl:WebSocket});
    transport.onMessage(m=>{if(m.type==='welcome')transport.sendReliable('join-room',{});});
    const movement={transport,match:current,playerId,round:0,roomId:transport.roomId,closed:false,joined:false,config:{debug:false}};
    let skills;
    const client=new PvpDamageClient(movement,{matchId:current.matchId,sessionId:`session-${playerId}`,log:()=>{},onError:error=>{throw error;},
      onState:state=>movement.match=state,onRound:state=>{
        movement.match=state;movement.round=state.round;movement.roomId=pvpRealtimeRoom(state.matchId,state.round);
        skills.reset(state.round);transport.roomId=movement.roomId;transport.sendReliable('join-room',{});
      }});
    skills=new SkillClient(client);peers.push({transport,client,skills,movement});
    await transport.connect();await waitFor(()=>client.authorized&&client.hp?.skills);return peers.at(-1);
  }
  try{
    const a=await connect('alice'),b=await connect('bob');
    const old=server.authorities.get(pvpRealtimeRoom(current.matchId)).authority;
    for(const [peer,x] of [[a,100],[b,180]])peer.transport.sendReliable('pvp-movement',{playerId:peer.movement.playerId,
      x,y:100,vx:0,vy:0,moving:false,direction:'right',sampleSeq:1,life:0});
    await waitFor(()=>old.positions.size===2);
    assert.equal(a.skills.use('fire-zone'),true);await waitFor(()=>b.client.hp.skills.instances.length===1);
    assert.deepEqual(a.client.hp.skills,b.client.hp.skills);
    time.tick(11500);await waitFor(()=>b.client.hp.players.find(p=>p.playerId==='bob').hp===95);
    assert.equal(b.client.project(current).participants.find(p=>p.playerId==='bob').hp,95);
    assert.deepEqual(a.client.hp.skills,b.client.hp.skills);
    a.client.requestEnd();await waitFor(()=>a.client.hp.retry&&b.client.hp.retry);
    assert.equal(old.skills.instances.size,0);assert.equal(old.skills.cooldowns.size,0);
    a.client.requestRetry();b.client.requestRetry();
    await waitFor(()=>a.client.authorized&&b.client.authorized&&a.client.hp?.round===1&&b.client.hp?.round===1);
    assert.equal(old.closed,true);assert.equal(old.timer,undefined);assert.equal(old.skills.owners.size,0);
    assert.equal(a.client.hp.skills.instances.length,0);assert.equal(a.client.hp.skills.cooldowns.length,0);
    assert.equal(a.skills.snapshot().instances.length,0);
    const next=server.authorities.get(pvpRealtimeRoom(current.matchId,1)).authority;
    time.tick(current.startedAt);await waitFor(()=>a.client.hp.state==='active');
    a.transport.sendReliable('pvp-skill-use',{skillId:'fire-zone',playerId:'alice',sessionId:'session-alice',round:0,life:0,castSeq:99});
    await new Promise(resolve=>setTimeout(resolve,25));assert.equal(next.skills.instances.size,0,'old-round intent cannot cast in new room');
    assert.equal(a.skills.use('fire-zone'),true);await waitFor(()=>next.skills.instances.size===1);
    assert.equal(next.skills.snapshot().instances[0].ownerLife,1);
  }finally{for(const peer of peers){peer.skills.close();peer.client.close();peer.transport.disconnect();}await server.close();assert.equal(time.jobs.size,0);}
});
