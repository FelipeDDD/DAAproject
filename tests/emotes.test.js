import test from 'node:test';
import assert from 'node:assert/strict';
import { inRoom,send } from '../convex/emotes.js';
import { cooldownReady } from '../src/emotes/EmoteSync.js';
import { EmoteState } from '../src/emotes/EmoteState.js';
import {
  ACTIVE_EMOTE_PACK_ID,activeEmotePack,AVAILABLE_EMOTES,clampHotbarPosition,DEFAULT_EMOTE_SLOTS,
  EMOTE_COOLDOWN_MS,EMOTE_PACKS,emoteDefinition,emoteStorageKey,loadEmoteBarPosition,loadEmoteSlots,
  resetEmoteBarPosition,saveEmoteBarPosition,saveEmoteSlots,shortcutSlot,
} from '../src/emotes/config.js';

function editable(selector){return {closest:query=>query.includes(selector)?{}:null};}

test('Shift + 1–6 retains all emote slots without taking inventory shortcuts or text input',()=>{
  const base={repeat:false,shiftKey:true,ctrlKey:false,altKey:false,metaKey:false,target:{closest:()=>null}};
  assert.equal(shortcutSlot({...base,code:'Digit1'},null),0);assert.equal(shortcutSlot({...base,code:'Digit6'},null),5);
  assert.equal(shortcutSlot({...base,shiftKey:false,code:'Digit1'},null),-1);
  assert.equal(shortcutSlot({...base,code:'Digit7'},null),-1);assert.equal(shortcutSlot({...base,code:'Digit2',target:editable('input')},null),-1);
  assert.equal(shortcutSlot({...base,code:'Digit3'},editable('textarea')),-1);
});

test('six customizable slots are stored independently for each character',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  assert.deepEqual(loadEmoteSlots('michael',storage),DEFAULT_EMOTE_SLOTS);
  const changed=['❤️','👏','🔥','😮','😢','😡'];saveEmoteSlots('michael',changed,storage);
  assert.deepEqual(loadEmoteSlots('michael',storage),changed);
  assert.deepEqual(loadEmoteSlots('felipe',storage),DEFAULT_EMOTE_SLOTS);
  assert.notEqual(emoteStorageKey('michael'),emoteStorageKey('felipe'));
});

test('default emote pack supplies named icons for all six default slots',()=>{
  assert.equal(ACTIVE_EMOTE_PACK_ID,'default');assert.equal(activeEmotePack(),EMOTE_PACKS.default);
  assert.ok(DEFAULT_EMOTE_SLOTS.every(icon=>AVAILABLE_EMOTES.includes(icon)));
  assert.ok(DEFAULT_EMOTE_SLOTS.every(icon=>emoteDefinition(icon)?.name));
});

test('emote bar position is clamped, persisted and reset independently from slot choices',()=>{
  assert.deepEqual(clampHotbarPosition({x:-20,y:900},{width:300,height:70},{width:800,height:600}),{x:0,y:530});
  const values=new Map(),storage={
    getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),
  };
  assert.equal(loadEmoteBarPosition(storage),null);
  assert.deepEqual(saveEmoteBarPosition({x:123.6,y:44.2},storage),{x:124,y:44});
  assert.deepEqual(loadEmoteBarPosition(storage),{x:124,y:44});
  resetEmoteBarPosition(storage);assert.equal(loadEmoteBarPosition(storage),null);
});

test('client cooldown allows one emote per configured interval',()=>{
  assert.equal(cooldownReady(1000,1000+EMOTE_COOLDOWN_MS-1),false);
  assert.equal(cooldownReady(1000,1000+EMOTE_COOLDOWN_MS),true);
});

test('changing room clears old emotes and only accepts events from the active room',()=>{
  const state=new EmoteState(2500),now=10_000;
  state.enter('school');state.receive([
    {playerId:'michael',room:'school',emote:'😂',createdAt:now},
    {playerId:'jassine',room:'outside',emote:'👍',createdAt:now},
  ],now);
  assert.deepEqual(state.active(now).map(event=>event.playerId),['michael']);
  state.enter('outside');assert.deepEqual(state.active(now),[]);
});

test('fresh emote is shown for the remainder of its original createdAt lifetime',()=>{
  const state=new EmoteState(2500),createdAt=10_000;
  state.enter('school');state.receive([
    {playerId:'michael',room:'school',emote:'😂',createdAt},
  ],createdAt+500);
  assert.equal(state.active(createdAt+2499).length,1);
  assert.equal(state.active(createdAt+2500).length,0);
});

test('expired subscription events are ignored on receive and direct show',()=>{
  const state=new EmoteState(2500),now=10_000;
  state.enter('school');state.receive([
    {playerId:'michael',room:'school',emote:'😂',createdAt:now-2500},
  ],now);
  state.show({playerId:'michael',room:'school',emote:'😂',createdAt:now-2501},now);
  assert.deepEqual(state.active(now),[]);
});

test('receiving the same event again never restarts its lifetime',()=>{
  const state=new EmoteState(2500),createdAt=10_000;
  const event={playerId:'michael',room:'school',emote:'😂',createdAt};
  state.enter('school');state.receive([event],createdAt+100);
  state.receive([event],createdAt+2000);
  assert.equal(state.active(createdAt+2499).length,1);
  state.receive([event],createdAt+2500);
  assert.deepEqual(state.active(createdAt+2500),[]);
});

test('new emote from the same character replaces the older event',()=>{
  const state=new EmoteState(2500),createdAt=10_000;
  state.enter('school');
  state.receive([{playerId:'michael',room:'school',emote:'😂',createdAt}],createdAt);
  const replacement={playerId:'michael',room:'school',emote:'👍',createdAt:createdAt+1000};
  state.receive([replacement],createdAt+1000);
  assert.deepEqual(state.active(createdAt+1000),[replacement]);
  assert.deepEqual(state.active(createdAt+3499),[replacement]);
  assert.deepEqual(state.active(createdAt+3500),[]);
});

function backendContext({existing=null}={}) {
  const rows=[],patched=[];
  const player={playerId:'michael',characterId:'michael',name:'Michael',sessionId:'session-123456789',room:'school',lastSeen:Date.now()};
  return {rows,patched,db:{
    query:table=>({withIndex:(_name,build)=>{
      let room;const q={eq:(field,value)=>{if(field==='room')room=value;return q;}};build(q);
      return {unique:async()=>table==='players'?player:existing,collect:async()=>rows.filter(row=>row.room===room)};
    }}),
    insert:async(_table,row)=>rows.push(row),patch:async(id,row)=>patched.push({id,row}),delete:async()=>{},
  }};
}

test('backend sends an emote event and room query exposes only that room',async()=>{
  const ctx=backendContext();
  const event=await send._handler(ctx,{room:'school',playerId:'michael',sessionId:'session-123456789',emote:'☕'});
  assert.equal(event.emote,'☕');assert.equal(event.playerId,'michael');assert.equal(ctx.rows.length,1);
  ctx.rows.push({...event,playerId:'felipe',room:'outside'});
  assert.deepEqual(await inRoom._handler(ctx,{room:'school'}),[event]);
});

test('backend enforces cooldown and rejects unknown emotes',async()=>{
  const recent={_id:'event',createdAt:Date.now(),playerId:'michael',room:'school',emote:'😂'};
  await assert.rejects(send._handler(backendContext({existing:recent}),{room:'school',playerId:'michael',sessionId:'session-123456789',emote:'👍'}),/EMOTE_COOLDOWN/);
  await assert.rejects(send._handler(backendContext(),{room:'school',playerId:'michael',sessionId:'session-123456789',emote:'not-an-emote'}),/Invalid emote/);
});


test('emote renderer uses only the exact live identity, never the class or old slot',async()=>{
  const {EmoteRenderer}=await import('../src/emotes/EmoteRenderer.js');
  const sprite={id:'remote'};
  const renderer=new EmoteRenderer({player:{id:'local'}},'school','felipe',
    {players:new Map([['independent-live-id',{sprite,playerId:'michael-2'}]])});
  assert.equal(renderer.spriteFor('independent-live-id'),sprite);
  assert.equal(renderer.spriteFor('michael-2'),undefined);
  assert.equal(renderer.spriteFor('obsolete-live-id'),undefined);
});

test('same-base live players keep independent emote rows and visual state',async()=>{
  const now=Date.now();
  const players=['live-one','live-two'].map((playerId,index)=>({
    _id:`player-${index}`,playerId,characterId:'michael',
    characterBaseId:'michael',sessionId:`session-${index}`,room:'school',lastSeen:now,
  }));
  const events=[];
  const ctx={db:{query(table){
    const conditions=[];
    const q={withIndex(_index,build){const b={eq(field,value){conditions.push([field,value]);return b;}};build(b);return q;},
      async unique(){return (table==='players'?players:events).find(row=>conditions.every(([key,value])=>row[key]===value))??null;},
      async collect(){return (table==='players'?players:events).filter(row=>conditions.every(([key,value])=>row[key]===value));}};
    return q;
  },async insert(_table,row){events.push({_id:`event-${events.length}`, ...row});},async patch(id,row){Object.assign(events.find(e=>e._id===id),row);}}};
  const first=await send._handler(ctx,{room:'school',playerId:'live-one',sessionId:'session-0',emote:AVAILABLE_EMOTES[0]});
  const second=await send._handler(ctx,{room:'school',playerId:'live-two',sessionId:'session-1',emote:AVAILABLE_EMOTES[1]});
  assert.equal(first.characterBaseId,second.characterBaseId);
  assert.deepEqual(events.map(e=>e.playerId),['live-one','live-two']);
  const state=new EmoteState();state.enter('school');state.receive(events);
  assert.equal(state.active().length,2);
  const renderer=new (await import('../src/emotes/EmoteRenderer.js')).EmoteRenderer(
    {player:{id:'local'}},'school','local',
    {players:new Map([['live-one',{sprite:{id:'one'}}],['live-two',{sprite:{id:'two'}}]])});
  assert.equal(renderer.spriteFor('live-one').id,'one');
  assert.equal(renderer.spriteFor('live-two').id,'two');
  assert.equal(renderer.spriteFor('michael'),undefined);
  assert.equal(renderer.spriteFor('retired-live-id'),undefined);
});
