import test from 'node:test';
import assert from 'node:assert/strict';
import { create,join,leave,start,current,expire } from '../convex/arenaLobbies.js';
import { update,inRoom } from '../convex/players.js';
import { send as sendMessage } from '../convex/messages.js';
import { send as sendEmote } from '../convex/emotes.js';
import { ARENA_COOP_CAPACITY,ARENA_LOBBY_LIFETIME_MS,soloArenaRoom,coopArenaRoom,arenaPresenceRoom } from '../src/boss/arenaRooms.js';
import { arenaEntryChoices,coopArenaEnabled,setCoopArenaEnabled } from '../src/boss/devArenaSettings.js';
import { ArenaLobbyClient } from '../src/boss/ArenaLobbyClient.js';
import { ArenaEntryController } from '../src/boss/ArenaEntryController.js';
import { ArenaEncounterController } from '../src/boss/ArenaEncounterController.js';
import { Presence } from '../src/multiplayer/Presence.js';
import { AVAILABLE_EMOTES } from '../src/emotes/config.js';
import { readArenaInvitation,consumeArenaInvitation,arenaLobbyErrorMessage } from '../src/boss/arenaLobbyUi.js';

function fixture(t,count=5){
  t.mock.method(Date,'now',()=>100_000);
  const savedDev=process.env.DEV_TOOLS_ENABLED,savedCloud=process.env.CONVEX_CLOUD_URL;
  process.env.DEV_TOOLS_ENABLED='true';
  t.after(()=>{
    if(savedDev===undefined)delete process.env.DEV_TOOLS_ENABLED;else process.env.DEV_TOOLS_ENABLED=savedDev;
    if(savedCloud===undefined)delete process.env.CONVEX_CLOUD_URL;else process.env.CONVEX_CLOUD_URL=savedCloud;
  });
  const players=Array.from({length:count},(_,i)=>({_id:`p${i}`,playerId:`p${i}`,profileId:`profile${i}`,
    characterId:'felipe',characterBaseId:'felipe',sessionId:`session-${i}`,name:`Player ${i}`,displayName:`Player ${i}`,
    room:'secret-path',x:10,y:20,direction:'down',presenceMode:'playing',lastSeen:Date.now()}));
  const tables={players,arenaLobbies:[],messages:[],emoteEvents:[],profileCharacterState:[]};
  const jobs=[];let next=0;
  const ctx={scheduler:{async runAfter(delay,fn,args){jobs.push({delay,fn,args});return `job${jobs.length}`;}},db:{
    query(table){
      const conditions=[];
      const query={withIndex(_name,build){const q={eq(field,value){conditions.push([field,value]);return q;}};build(q);return query;},
        async collect(){return tables[table].filter(row=>conditions.every(([field,value])=>row[field]===value));},
        async unique(){const rows=await query.collect();assert.ok(rows.length<=1);return rows[0]??null;}};
      return query;
    },
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,value){const _id=`insert-${++next}`;tables[table].push({_id,...structuredClone(value)});return _id;},
    async patch(id,value){Object.assign(await this.get(id),value);},
    async delete(id){for(const rows of Object.values(tables)){const i=rows.findIndex(row=>row._id===id);if(i!==-1)rows.splice(i,1);}},
  }};
  const args=index=>({playerId:players[index].playerId,sessionId:players[index].sessionId});
  const moveArgs=(index,room)=>({...args(index),characterId:'felipe',room,x:20,y:30,direction:'right'});
  return {ctx,tables,players,args,moveArgs,jobs};
}

test('two solo entrants have disjoint presence/chat/emote rooms and normal rooms stay shared',async t=>{
  const {ctx,players,moveArgs,tables}=fixture(t,2);
  for(let i=0;i<2;i++)await update._handler(ctx,moveArgs(i,arenaPresenceRoom(players[i])));
  assert.notEqual(players[0].room,players[1].room);
  assert.deepEqual((await inRoom._handler(ctx,{room:players[0].room})).map(p=>p.playerId),['p0']);
  assert.deepEqual((await inRoom._handler(ctx,{room:players[1].room})).map(p=>p.playerId),['p1']);
  await sendMessage._handler(ctx,{room:players[0].room,playerId:'p0',characterId:'felipe',sessionId:'session-0',text:'Solo chat'});
  await sendEmote._handler(ctx,{room:players[0].room,playerId:'p0',sessionId:'session-0',emote:AVAILABLE_EMOTES[0]});
  assert.equal(tables.emoteEvents[0].room,players[0].room);
  await assert.rejects(sendMessage._handler(ctx,{room:players[1].room,playerId:'p0',characterId:'felipe',sessionId:'session-0',text:'Wrong room'}),/Invalid session/);
  await update._handler(ctx,moveArgs(0,'school'));await update._handler(ctx,moveArgs(1,'school'));
  assert.equal((await inRoom._handler(ctx,{room:'school'})).length,2);
  await update._handler(ctx,moveArgs(0,'arena')); // Legacy publication is normalized too.
  assert.equal(players[0].room,soloArenaRoom('p0'));
  await assert.rejects(update._handler(ctx,moveArgs(0,soloArenaRoom('p1'))),/Invalid solo/);
});

test('lobby stores a unique ID, host and bounded same-base participants; public state hides session IDs',async t=>{
  const {ctx,tables,args,jobs}=fixture(t);
  const lobby=await create._handler(ctx,args(0));
  assert.equal(lobby.hostPlayerId,'p0');assert.equal(lobby.maxParticipants,ARENA_COOP_CAPACITY);
  assert.equal(jobs.length,1);assert.equal(jobs[0].delay,ARENA_LOBBY_LIFETIME_MS);
  await join._handler(ctx,{...args(1),lobbyId:lobby.lobbyId});
  const state=await current._handler(ctx,{...args(1),lobbyId:lobby.lobbyId});
  assert.deepEqual(state.participants.map(p=>p.playerId),['p0','p1']);
  assert.deepEqual(state.participants.map(p=>p.characterBaseId),['felipe','felipe']);
  assert.equal(JSON.stringify(state).includes('session-'),false);
  await join._handler(ctx,{...args(1),lobbyId:lobby.lobbyId});assert.equal(tables.arenaLobbies[0].participants.length,2);
  for(const i of [2,3])await join._handler(ctx,{...args(i),lobbyId:lobby.lobbyId});
  await assert.rejects(join._handler(ctx,{...args(4),lobbyId:lobby.lobbyId}),/ARENA_LOBBY_FULL/);
  assert.equal(tables.arenaLobbies[0].participants.length,4);
});

test('only host starts; members share the co-op room and other lobbies/outsiders cannot enter',async t=>{
  const {ctx,args,moveArgs}=fixture(t);
  const a=await create._handler(ctx,args(0));await join._handler(ctx,{...args(1),lobbyId:a.lobbyId});
  const b=await create._handler(ctx,args(2));
  await assert.rejects(update._handler(ctx,moveArgs(0,a.room)),/invalid membership/);
  await assert.rejects(start._handler(ctx,{...args(1),lobbyId:a.lobbyId}),/ARENA_HOST_ONLY/);
  await start._handler(ctx,{...args(0),lobbyId:a.lobbyId});await start._handler(ctx,{...args(2),lobbyId:b.lobbyId});
  for(const i of [0,1])await update._handler(ctx,moveArgs(i,a.room));
  await update._handler(ctx,moveArgs(2,b.room));
  assert.deepEqual((await inRoom._handler(ctx,{room:a.room})).map(p=>p.playerId),['p0','p1']);
  assert.deepEqual((await inRoom._handler(ctx,{room:b.room})).map(p=>p.playerId),['p2']);
  await assert.rejects(update._handler(ctx,moveArgs(3,a.room)),/invalid membership/);
  await assert.rejects(join._handler(ctx,{...args(3),lobbyId:a.lobbyId}),/ARENA_LOBBY_STARTED/);
});

test('leave respects session ownership, releases only that participant; host departure closes without migration',async t=>{
  const {ctx,args}=fixture(t);
  const a=await create._handler(ctx,args(0));await join._handler(ctx,{...args(1),lobbyId:a.lobbyId});
  assert.equal((await leave._handler(ctx,{...args(1),sessionId:'stale',lobbyId:a.lobbyId})).left,false);
  assert.equal((await current._handler(ctx,{...args(0),lobbyId:a.lobbyId})).participants.length,2);
  assert.equal((await leave._handler(ctx,{...args(1),lobbyId:a.lobbyId})).left,true);
  await join._handler(ctx,{...args(1),lobbyId:a.lobbyId});
  await leave._handler(ctx,{...args(0),lobbyId:a.lobbyId});
  assert.equal((await current._handler(ctx,{...args(1),lobbyId:a.lobbyId})).closedReason,'host-left');
});

test('abandoned/expired host closes logically and one-shot GC deletes after deadline, not before',async t=>{
  const {ctx,args,players,tables}=fixture(t);
  const a=await create._handler(ctx,args(0));await join._handler(ctx,{...args(1),lobbyId:a.lobbyId});
  players[0].lastSeen=0;
  assert.equal((await current._handler(ctx,{...args(1),lobbyId:a.lobbyId})).closedReason,'host-disconnected');
  await assert.rejects(join._handler(ctx,{...args(2),lobbyId:a.lobbyId}),/ARENA_HOST_LEFT/);
  await expire._handler(ctx,{lobbyId:a.lobbyId});assert.equal(tables.arenaLobbies.length,1);
  t.mock.method(Date,'now',()=>a.expiresAt);await expire._handler(ctx,{lobbyId:a.lobbyId});
  assert.equal(tables.arenaLobbies.length,0);
});

test('new lobby creation closes old hosted lobby; guest session security is preserved and production rejects co-op creation',async t=>{
  const {ctx,args,players,tables}=fixture(t);
  delete players[0].profileId;players[0].guestId='guest-owner';
  await assert.rejects(create._handler(ctx,{...args(0),sessionId:'wrong'}),/CHARACTER_SESSION_LOST/);
  const a=await create._handler(ctx,args(0)),b=await create._handler(ctx,args(0));
  assert.notEqual(a.lobbyId,b.lobbyId);assert.equal(tables.arenaLobbies[0].status,'closed');
  process.env.DEV_TOOLS_ENABLED='false';process.env.CONVEX_CLOUD_URL='https://prod.convex.cloud';
  await assert.rejects(create._handler(ctx,args(1)),/ARENA_DEV_DISABLED/);
  await assert.rejects(join._handler(ctx,{...args(1),lobbyId:b.lobbyId}),/ARENA_DEV_DISABLED/);
  // Disabling new entries never forcibly ends an existing lobby.
  assert.ok(await current._handler(ctx,{...args(0),lobbyId:b.lobbyId}));
});

class Element {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.hidden=false;this.value='';}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){(this.attributes??={})[name]=value;}
  addEventListener(event,callback){this.events[event]=callback;}
  removeEventListener(event){delete this.events[event];}
  remove(){this.removed=true;}
  focus(){this.focused=true;}
  select(){this.selected=true;}
  querySelectorAll(){return this.children.flatMap(node=>[...(['button','input'].includes(node.tag)?[node]:[]),...node.querySelectorAll()]);}
}
function uiFixture(t){
  const callbacks=[],calls=[],travel=[];let subscribed=0;
  t.mock.method(globalThis,'setInterval',()=>({timer:true}));t.mock.method(globalThis,'clearInterval',()=>{});
  const documentRef={body:new Element('body'),createElement:tag=>new Element(tag),addEventListener(){},removeEventListener(){}};
  const presence={identity:{playerId:'a',sessionId:'session-a'},api:{arenaLobbies:{current:'current',create:'create',join:'join',start:'start',leave:'leave'}},
    client:{onUpdate(_fn,_args,cb){callbacks.push(cb);subscribed++;return()=>subscribed--;},async mutation(fn,args){calls.push({fn,args});return {lobbyId:'lobby-a',code:'A7K4Q2'};}}};
  const scene={presence,input:{enabled:true,keyboard:{enabled:true,resetKeys(){}}},player:{setVelocity(){}},
    gate:{reset(){},open(){}},retryOverlay:{close(){}},travelTo:dest=>travel.push(dest),returnToSecretPath:()=>travel.push('return')};
  const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  const state={lobbyId:'lobby-a',code:'A7K4Q2',status:'waiting',hostPlayerId:'a',maxParticipants:4,expiresAt:Date.now()+60_000,
    participants:[{playerId:'a',displayName:'Alex',characterBaseId:'felipe',activeUntil:Date.now()+60_000}]};
  return {documentRef,presence,scene,callbacks,calls,travel,storage,state,subscriptions:()=>subscribed};
}

test('DEV toggle switches entrance choices immediately and is never enabled in production',t=>{
  const {storage}=uiFixture(t);
  setCoopArenaEnabled(false,storage);assert.deepEqual(arenaEntryChoices(coopArenaEnabled({DEV:true},storage)),['solo']);
  setCoopArenaEnabled(true,storage);assert.deepEqual(arenaEntryChoices(coopArenaEnabled({DEV:true},storage)),['solo','create','join']);
  assert.equal(coopArenaEnabled({DEV:false},storage),false);
  setCoopArenaEnabled(false,storage);
});

test('entrance hides normal Create/Join when OFF, permits explicit code entry; cancelling restores controls',t=>{
  const {scene,documentRef,storage,travel}=uiFixture(t);
  const options={env:{DEV:true},documentRef,storage};setCoopArenaEnabled(false,storage);
  let entry=new ArenaEntryController(scene,{targetMap:'arena'},options);
  const labels=()=>entry.panel.children.filter(node=>node.tag==='button').map(node=>node.textContent);
  assert.deepEqual(labels(),['Enter Solo','Have an invitation code?','Cancel']);assert.equal(scene.input.keyboard.enabled,false);
  entry.close();assert.equal(scene.input.keyboard.enabled,true);
  setCoopArenaEnabled(true,storage);entry=new ArenaEntryController(scene,{targetMap:'arena'},options);
  assert.deepEqual(labels(),['Enter Solo','Create Co-op Lobby','Join Co-op Lobby','Cancel']);
  entry.enterSolo();assert.equal(travel[0].arenaMode,'solo');assert.equal(scene.input.keyboard.enabled,true);
  setCoopArenaEnabled(false,storage);
});

test('started lobby transitions exactly once; stale lobby callbacks cannot re-enter after cancellation',async t=>{
  const {scene,documentRef,storage,state,callbacks,travel,calls,subscriptions}=uiFixture(t);
  setCoopArenaEnabled(true,storage);
  const entry=new ArenaEntryController(scene,{targetMap:'arena'}, {env:{DEV:true},documentRef,storage});
  await entry.acquire('create');callbacks[0](state);
  assert.equal(entry.list.children[0].children[1].children[0].textContent,'Alex');
  assert.equal(entry.list.children[0].children[2].textContent,'HOST');
  callbacks[0]({...state,status:'started'});assert.equal(travel[0].arenaMode,'coop');assert.equal(travel[0].arenaLobbyId,'lobby-a');
  callbacks[0]({...state,status:'started'});assert.equal(travel.length,1);assert.equal(subscriptions(),0);
  assert.equal(calls.filter(call=>call.fn==='leave').length,0);
  setCoopArenaEnabled(false,storage);
});

test('cancelled in-flight lobby creation is released when response arrives and never opens a scene',async t=>{
  const {scene,documentRef,storage,presence,travel,calls}=uiFixture(t);
  setCoopArenaEnabled(true,storage);let complete;
  presence.client.mutation=(fn,args)=>{calls.push({fn,args});return fn==='create'?new Promise(resolve=>complete=resolve):Promise.resolve({});};
  const entry=new ArenaEntryController(scene,{targetMap:'arena'}, {env:{DEV:true},documentRef,storage});
  const pending=entry.acquire('create');entry.close();complete({lobbyId:'late'});await pending;
  assert.equal(travel.length,0);assert.equal(calls.at(-1).fn,'leave');assert.equal(calls.at(-1).args.lobbyId,'late');
  setCoopArenaEnabled(false,storage);
});

test('local host/deadline expiry closes lobby view without network polling, and obsolete subscriptions stay silent',t=>{
  const {presence,state,callbacks,calls,subscriptions}=uiFixture(t);let updates=[];
  const lobby=new ArenaLobbyClient(presence,'lobby-a',value=>updates.push(value));callbacks[0](state);
  assert.equal(updates[0].lobbyId,'lobby-a');
  t.mock.method(Date,'now',()=>state.expiresAt);lobby.check();assert.equal(updates.at(-1).closedReason,'expired');
  lobby.close();const n=updates.length;callbacks[0](state);lobby.check();assert.equal(updates.length,n);
  assert.equal(subscriptions(),0);assert.equal(calls.length,0);
});

test('solo resets its own boss on reentry; co-op never creates one and repeated cycles have no duplicate subscriptions',t=>{
  const {scene,documentRef,callbacks,state,subscriptions}=uiFixture(t);let bosses=0,destroyed=0,crosshairs=0;
  const encounter=new ArenaEncounterController(scene,{documentRef,
    createBoss:()=>{bosses++;return {reset(){},suspend(){},destroy(){destroyed++;}};},
    createCrosshair:()=>{crosshairs++;return {resume(){},suspend(){},destroy(){}};}});
  scene.arenaMode='solo';encounter.start();assert.equal(bosses,1);
  encounter.stop();encounter.start();assert.equal(bosses,1);assert.equal(destroyed,0);
  scene.arenaMode='coop';scene.arenaLobbyId='lobby-a';encounter.start();
  assert.equal(bosses,1);assert.equal(destroyed,1);assert.equal(scene.boss,null);assert.equal(scene.crosshair,null);
  callbacks[0]({...state,status:'started'});assert.equal(subscriptions(),1);
  encounter.stop();assert.equal(subscriptions(),0);
  encounter.start();assert.equal(subscriptions(),1);encounter.stop();assert.equal(subscriptions(),0);
  assert.equal(bosses,1);assert.equal(crosshairs,1);
});

test('Presence receives only its instance and ignores callbacks from a prior solo/co-op room',async t=>{
  t.mock.method(globalThis,'setInterval',()=>({timer:true}));t.mock.method(globalThis,'clearInterval',()=>{});
  const callbacks=[],calls=[];let rows=[];
  const presence=new Presence({onUpdate(_fn,_args,cb){callbacks.push(cb);return()=>{};},async mutation(fn,args){calls.push(args);}},
    {players:{update:'update'}},{playerId:'me',characterId:'felipe',sessionId:'session',name:'Me'});
  const solo=soloArenaRoom('me'),coop=coopArenaRoom('shared');
  presence.enter(solo,()=>({x:10,y:20,direction:'down'}),value=>rows=value);
  callbacks[0]([{playerId:'other',room:soloArenaRoom('other'),lastSeen:Date.now()}]);assert.deepEqual(rows,[]);
  await Promise.resolve();presence.enter(coop,()=>({x:10,y:20,direction:'down'}),value=>rows=value);
  callbacks[1]([{playerId:'friend',room:coop,lastSeen:Date.now()},{playerId:'stranger',room:coopArenaRoom('different'),lastSeen:Date.now()}]);
  assert.deepEqual(rows.map(row=>row.playerId),['friend']);callbacks[0]([]);assert.equal(rows.length,1);
  presence.leave();
});

test('two solo clients own different bosses, and switching co-op back to solo restores local combat',t=>{
  const a=uiFixture(t),b=uiFixture(t);
  const configure=f=>new ArenaEncounterController(f.scene,{documentRef:f.documentRef,
    createBoss:()=>({suspend(){},reset(){},destroy(){}}),createCrosshair:()=>({suspend(){},resume(){},destroy(){}})});
  const first=configure(a),second=configure(b);a.scene.arenaMode=b.scene.arenaMode='solo';
  first.start();second.start();assert.notEqual(a.scene.boss,b.scene.boss);
  a.scene.arenaMode='coop';a.scene.arenaLobbyId='lobby-a';first.start();assert.equal(a.scene.boss,null);
  first.stop();a.scene.arenaMode='solo';first.start();assert.ok(a.scene.boss);assert.equal(a.subscriptions(),0);
  first.destroy();second.destroy();
});

test('synchronous cached started result is delivered after attaching the owner and cleans up subscriptions',async t=>{
  const f=uiFixture(t);setCoopArenaEnabled(true,f.storage);let subscribed=0;
  f.presence.client.onUpdate=(_fn,_args,callback)=>{
    subscribed++;callback({...f.state,status:'started'});return()=>subscribed--;
  };
  const entry=new ArenaEntryController(f.scene,{targetMap:'arena'}, {env:{DEV:true},documentRef:f.documentRef,storage:f.storage});
  await entry.acquire('create');await Promise.resolve();
  assert.equal(f.travel.length,1);assert.equal(subscribed,0);assert.equal(entry.active,false);
  setCoopArenaEnabled(false,f.storage);
});

test('short invitation codes are allocated uniquely and indexed joins trim/uppercase without duplicate members',async t=>{
  const f=fixture(t);let samples=0;
  t.mock.method(Math,'random',()=>++samples<=12?0:1/32);
  const first=await create._handler(f.ctx,f.args(0));
  const second=await create._handler(f.ctx,f.args(2));
  assert.equal(first.code,'AAAAAA');assert.equal(second.code,'BBBBBB');
  assert.notEqual(first.code,second.code); // Collision is checked through by_code before insertion.
  for(let i=0;i<2;i++)await join._handler(f.ctx,{...f.args(1),code:`  ${first.code.toLowerCase()}  `});
  const state=await current._handler(f.ctx,{...f.args(1),lobbyId:first.lobbyId});
  assert.equal(state.code,first.code);assert.equal(state.participants.length,2);
  assert.equal(JSON.stringify(state).includes('session-'),false);
});

test('join distinguishes invalid, missing, full, started, closed and expired codes with friendly UI errors',async t=>{
  const f=fixture(t),a=await create._handler(f.ctx,f.args(0));
  const attempt=code=>join._handler(f.ctx,{...f.args(4),code});
  await assert.rejects(attempt('bad'),/ARENA_CODE_INVALID/);
  await assert.rejects(attempt('ZZZZZZ'),/ARENA_LOBBY_NOT_FOUND/);
  for(const i of [1,2,3])await join._handler(f.ctx,{...f.args(i),code:a.code});
  await assert.rejects(attempt(a.code),/ARENA_LOBBY_FULL/);
  await start._handler(f.ctx,{...f.args(0),lobbyId:a.lobbyId});
  await assert.rejects(attempt(a.code),/ARENA_LOBBY_STARTED/);
  await assert.rejects(start._handler(f.ctx,{...f.args(0),lobbyId:a.lobbyId}),/ARENA_LOBBY_STARTED/);
  await leave._handler(f.ctx,{...f.args(0),lobbyId:a.lobbyId});
  await assert.rejects(attempt(a.code),/ARENA_LOBBY_CLOSED/);
  const b=await create._handler(f.ctx,f.args(0));f.tables.arenaLobbies.at(-1).expiresAt=Date.now();
  await assert.rejects(attempt(b.code),/ARENA_LOBBY_EXPIRED/);
  for(const [code,words] of [['ARENA_CODE_INVALID','valid'],['ARENA_LOBBY_NOT_FOUND','not found'],
    ['ARENA_LOBBY_FULL','full'],['ARENA_LOBBY_CLOSED','closed'],['ARENA_LOBBY_STARTED','started']]){
    assert.ok(arenaLobbyErrorMessage({data:code}).includes(words));
    assert.equal(arenaLobbyErrorMessage({data:code}).includes('ARENA_'),false);
  }
  assert.equal(arenaLobbyErrorMessage(new Error('private-internal-id')), 'Could not reach the lobby. Check your connection and try again.');
});

test('URL invitation is normalized, preserved until explicit join and consumed without changing other URL state',async t=>{
  assert.equal(readArenaInvitation('?coop=%20a7k4q2%20&other=1'),'A7K4Q2');
  assert.equal(readArenaInvitation('?other=1'),null);assert.equal(readArenaInvitation('?coop='),'');
  let replaced;
  const history={state:{page:1},replaceState(...args){replaced=args;}};
  assert.equal(consumeArenaInvitation({href:'https://example.test/game/?other=1&coop=a7k4q2#map',search:'?other=1&coop=a7k4q2'},history),'A7K4Q2');
  assert.deepEqual(replaced,[{page:1},'','/game/?other=1#map']);
  const f=uiFixture(t);setCoopArenaEnabled(false,f.storage);
  const before=f.storage.getItem('daa-dev-coop-arena');
  const entry=new ArenaEntryController(f.scene,{targetMap:'arena'},
    {env:{DEV:true},documentRef:f.documentRef,storage:f.storage,invitationCode:' a7k4q2 '});
  assert.equal(entry.code.value,'A7K4Q2');assert.equal(f.calls.length,0); // Never autojoin.
  entry.key({type:'keydown',key:'Enter',target:entry.code,repeat:false,stopImmediatePropagation(){},preventDefault(){}});
  await Promise.resolve();await Promise.resolve();
  assert.equal(f.calls[0].fn,'join');assert.equal(f.calls[0].args.code,'A7K4Q2');
  assert.equal(f.storage.getItem('daa-dev-coop-arena'),before);assert.equal(coopArenaEnabled({DEV:true},f.storage),false);
  entry.close();
});

test('create double click is serialized and lobby displays names/classes/vacancies without raw IDs',async t=>{
  const f=uiFixture(t);setCoopArenaEnabled(true,f.storage);let complete;
  f.presence.client.mutation=(fn,args)=>{f.calls.push({fn,args});return fn==='create'?new Promise(resolve=>complete=resolve):Promise.resolve({});};
  const entry=new ArenaEntryController(f.scene,{targetMap:'arena'}, {env:{DEV:true},documentRef:f.documentRef,storage:f.storage});
  const pending=entry.acquire('create');await entry.acquire('create');
  assert.equal(f.calls.length,1);assert.ok(entry.buttons.filter(b=>!b.arenaAllowBusy).every(b=>b.disabled));
  complete({lobbyId:'lobby-a',code:'A7K4Q2'});await pending;f.callbacks[0](f.state);
  assert.equal(entry.lobbyView.host.textContent,'Host: Alex');assert.equal(entry.lobbyView.count.textContent,'1 / 4');
  assert.equal(entry.list.children.length,4);assert.equal(entry.list.children[1].textContent,'Waiting...');
  const texts=node=>[node.textContent,...node.children.flatMap(texts)];
  const content=texts(entry.panel).join(' ');
  assert.ok(content.includes('Felipe'));assert.ok(content.includes('HOST'));
  assert.equal(content.includes('lobby-a'),false);assert.equal(content.includes('session-a'),false);
  assert.equal(entry.startButton.hidden,false);assert.equal(entry.startButton.disabled,false);
  assert.equal(f.scene.arenaDiagnostics.lobbyId,'lobby-a');
  entry.close();setCoopArenaEnabled(false,f.storage);
});

test('copy code uses Clipboard API, preserves brief feedback through updates, and selects code on failure',async t=>{
  const f=uiFixture(t);setCoopArenaEnabled(true,f.storage);let copied;
  const entry=new ArenaEntryController(f.scene,{}, {env:{DEV:true},documentRef:f.documentRef,storage:f.storage,
    clipboard:{async writeText(code){copied=code;}}});
  await entry.acquire('create');f.callbacks[0](f.state);
  await entry.copyCode();assert.equal(copied,'A7K4Q2');assert.equal(entry.status.textContent,'Lobby code copied.');
  f.callbacks[0](f.state);assert.equal(entry.status.textContent,'Lobby code copied.');
  const now=Date.now();t.mock.method(Date,'now',()=>now+3001);entry.lobby.check();
  assert.equal(entry.status.textContent,'Waiting for the host to start.');
  entry.clipboard={async writeText(){throw new Error('permission denied');}};
  await entry.copyCode();assert.equal(entry.lobbyView.code.selected,true);
  assert.equal(entry.status.textContent,'Copy the selected code with Ctrl+C.');
  entry.close();setCoopArenaEnabled(false,f.storage);
});

test('guest cannot start; failed join/start show actionable errors without losing controls or creating subscriptions',async t=>{
  const f=uiFixture(t);setCoopArenaEnabled(false,f.storage);
  const entry=new ArenaEntryController(f.scene,{}, {env:{DEV:true},documentRef:f.documentRef,storage:f.storage,invitationCode:'A7K4Q2'});
  await entry.acquire('join','bad');assert.equal(f.calls.length,0);
  f.presence.client.mutation=async()=>{throw {data:'ARENA_LOBBY_NOT_FOUND'};};
  await entry.acquire('join','A7K4Q2');assert.equal(entry.busy,false);assert.equal(entry.code.disabled,false);
  assert.equal(f.subscriptions(),0);assert.match(entry.status.textContent,/not found/);
  f.presence.client.mutation=async()=>({lobbyId:'lobby-a',code:'A7K4Q2'});
  await entry.acquire('join','A7K4Q2');f.callbacks[0]({...f.state,hostPlayerId:'b',participants:[
    {...f.state.participants[0],playerId:'b'}, {...f.state.participants[0],displayName:'Guest'}]});
  assert.equal(entry.startButton.hidden,true);await entry.start();assert.equal(f.calls.length,0);
  f.callbacks[0](f.state);assert.equal(entry.startButton.hidden,false);
  f.presence.client.mutation=async()=>{throw {data:'ARENA_LOBBY_STARTED'};};
  await entry.start();assert.match(entry.status.textContent,/already started/);assert.equal(entry.busy,false);
  entry.close();
});

test('closed lobby clears IDs/subscriptions, shows host reason, ignores stale start and reopens cleanly',async t=>{
  const f=uiFixture(t);setCoopArenaEnabled(true,f.storage);
  const options={env:{DEV:true},documentRef:f.documentRef,storage:f.storage};
  const entry=new ArenaEntryController(f.scene,{},options);
  await entry.acquire('create');f.callbacks[0](f.state);
  f.callbacks[0]({...f.state,status:'closed',closedReason:'host-left',participants:[]});
  assert.equal(entry.lobbyId,null);assert.equal(entry.lobbyState,null);assert.equal(f.subscriptions(),0);
  assert.equal(entry.panel.children[1].textContent,'The host closed the lobby.');
  assert.equal(f.scene.arenaDiagnostics,null);
  f.callbacks[0]({...f.state,status:'started'});assert.equal(f.travel.length,0);
  entry.buttons[0].events.click();assert.equal(f.scene.input.enabled,true);assert.equal(f.scene.input.keyboard.enabled,true);
  const next=new ArenaEntryController(f.scene,{},options);
  assert.equal(next.lobbyId,undefined);assert.equal(f.subscriptions(),0);
  next.close();setCoopArenaEnabled(false,f.storage);
});

test('two independent clients: host ON, guest OFF, leave/rejoin/host closure then shared start without boss',async t=>{
  const db=fixture(t,2),a=uiFixture(t),b=uiFixture(t),watchers=new Set();
  const handlers={create,join,leave,start};
  const flush=async()=>{
    for(const watch of [...watchers]){
      const state=await current._handler(db.ctx,watch.args);
      if(watchers.has(watch))watch.callback(state);
    }
  };
  for(const [index,f] of [a,b].entries()){
    f.presence.identity={...db.args(index)};
    f.presence.client={
      onUpdate(_fn,args,callback){const watch={args,callback};watchers.add(watch);return()=>watchers.delete(watch);},
      async mutation(fn,args){f.calls.push({fn,args});return handlers[fn]._handler(db.ctx,args);},
    };
  }
  const make=f=>new ArenaEntryController(f.scene,{targetMap:'arena',targetSpawn:'arena-spawn'},
    {env:{DEV:true},documentRef:f.documentRef,storage:f.storage});
  setCoopArenaEnabled(true,a.storage);let host=make(a);await host.acquire('create');await flush();
  setCoopArenaEnabled(false,b.storage);let guest=make(b);guest.renderJoin(host.lobbyState.code.toLowerCase());
  const guestFlag=b.storage.getItem('daa-dev-coop-arena');
  await guest.acquire('join',guest.code.value);await flush();
  assert.equal(host.lobbyState.participants.length,2);assert.equal(guest.lobbyState.participants.length,2);
  assert.equal(guest.startButton.hidden,true);assert.equal(b.storage.getItem('daa-dev-coop-arena'),guestFlag);
  guest.close();await Promise.resolve();await flush();assert.equal(host.lobbyState.participants.length,1);
  assert.equal(b.scene.input.enabled,true);
  guest=make(b);guest.renderJoin(host.lobbyState.code);await guest.acquire('join',guest.code.value);await flush();
  host.close();await Promise.resolve();await flush();
  assert.equal(guest.panel.children[1].textContent,'The host closed the lobby.');assert.equal(guest.lobbyId,null);
  guest.close();assert.equal(watchers.size,0);
  setCoopArenaEnabled(true,a.storage);host=make(a);await host.acquire('create');
  setCoopArenaEnabled(false,b.storage);guest=make(b);guest.renderJoin(db.tables.arenaLobbies.at(-1).code);
  await guest.acquire('join',guest.code.value);await flush();
  await guest.start();assert.equal(db.tables.arenaLobbies.at(-1).status,'waiting');
  await host.start();await flush();assert.equal(watchers.size,0);
  assert.equal(a.travel.length,1);assert.equal(b.travel.length,1);
  assert.equal(a.travel[0].arenaLobbyId,b.travel[0].arenaLobbyId);
  const room=coopArenaRoom(a.travel[0].arenaLobbyId);
  for(let index=0;index<2;index++)await update._handler(db.ctx,db.moveArgs(index,room));
  assert.deepEqual((await inRoom._handler(db.ctx,{room})).map(p=>p.playerId),['p0','p1']);
  let bosses=0;
  const encounters=[a,b].map(f=>{
    f.scene.arenaMode='coop';f.scene.arenaLobbyId=a.travel[0].arenaLobbyId;
    const encounter=new ArenaEncounterController(f.scene,{documentRef:f.documentRef,
      createBoss:()=>{bosses++;},createCrosshair:()=>assert.fail('co-op must not create crosshair')});
    encounter.start();return encounter;
  });
  await flush();assert.equal(bosses,0);assert.equal(watchers.size,2);
  for(const encounter of encounters)encounter.stop();
  await Promise.resolve();assert.equal(watchers.size,0);
});

test('in-arena host closure returns to saved entrance once with clear notice and stops old callbacks',t=>{
  const f=uiFixture(t);f.scene.arenaMode='coop';f.scene.arenaLobbyId='lobby-a';
  f.scene.returnFromCoopArena=message=>f.travel.push({message});
  const encounter=new ArenaEncounterController(f.scene,{documentRef:f.documentRef,
    createBoss:()=>assert.fail('no boss'),createCrosshair:()=>assert.fail('no crosshair')});
  encounter.start();f.callbacks[0]({...f.state,status:'started'});
  f.callbacks[0]({...f.state,status:'closed',closedReason:'host-left',participants:[]});
  assert.deepEqual(f.travel,[{message:'The host closed the lobby.'}]);assert.equal(f.subscriptions(),0);
  assert.equal(f.scene.arenaLobbyId,null);assert.equal(encounter.leaveButton.disabled,true);
  encounter.returnToEntrance();assert.equal(f.travel.length,1);
  f.callbacks[0]({...f.state,status:'closed'});assert.equal(f.travel.length,1);
  encounter.stop();
});
