import test from 'node:test';
import assert from 'node:assert/strict';
import { inRoom,send } from '../convex/emotes.js';
import { cooldownReady } from '../src/emotes/EmoteSync.js';
import { EmoteState } from '../src/emotes/EmoteState.js';
import {
  DEFAULT_EMOTE_SLOTS,EMOTE_COOLDOWN_MS,emoteStorageKey,loadEmoteSlots,saveEmoteSlots,shortcutSlot,
} from '../src/emotes/config.js';

function editable(selector){return {closest:query=>query.includes(selector)?{}:null};}

test('number shortcuts trigger slots but stay inactive in text inputs',()=>{
  const base={repeat:false,ctrlKey:false,altKey:false,metaKey:false,target:{closest:()=>null}};
  assert.equal(shortcutSlot({...base,key:'1'},null),0);assert.equal(shortcutSlot({...base,key:'6'},null),5);
  assert.equal(shortcutSlot({...base,key:'7'},null),-1);assert.equal(shortcutSlot({...base,key:'2',target:editable('input')},null),-1);
  assert.equal(shortcutSlot({...base,key:'3'},editable('textarea')),-1);
});

test('six customizable slots are stored independently for each character',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  assert.deepEqual(loadEmoteSlots('michael',storage),DEFAULT_EMOTE_SLOTS);
  const changed=['❤️','👏','🔥','😮','😢','😡'];saveEmoteSlots('michael',changed,storage);
  assert.deepEqual(loadEmoteSlots('michael',storage),changed);
  assert.deepEqual(loadEmoteSlots('felipe',storage),DEFAULT_EMOTE_SLOTS);
  assert.notEqual(emoteStorageKey('michael'),emoteStorageKey('felipe'));
});

test('client cooldown allows one emote per configured interval',()=>{
  assert.equal(cooldownReady(1000,1000+EMOTE_COOLDOWN_MS-1),false);
  assert.equal(cooldownReady(1000,1000+EMOTE_COOLDOWN_MS),true);
});

test('changing room clears old emotes and only accepts events from the active room',()=>{
  const state=new EmoteState(2500),now=10_000;
  state.enter('school');state.receive([
    {characterId:'michael',room:'school',emote:'😂',createdAt:now},
    {characterId:'jassine',room:'outside',emote:'👍',createdAt:now},
  ],now);
  assert.deepEqual(state.active(now).map(event=>event.characterId),['michael']);
  state.enter('outside');assert.deepEqual(state.active(now),[]);
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
  const event=await send._handler(ctx,{room:'school',characterId:'michael',sessionId:'session-123456789',emote:'☕'});
  assert.equal(event.emote,'☕');assert.equal(event.playerId,'michael');assert.equal(ctx.rows.length,1);
  ctx.rows.push({...event,characterId:'felipe',playerId:'felipe',room:'outside'});
  assert.deepEqual(await inRoom._handler(ctx,{room:'school'}),[event]);
});

test('backend enforces cooldown and rejects unknown emotes',async()=>{
  const recent={_id:'event',createdAt:Date.now(),characterId:'michael',room:'school',emote:'😂'};
  await assert.rejects(send._handler(backendContext({existing:recent}),{room:'school',characterId:'michael',sessionId:'session-123456789',emote:'👍'}),/EMOTE_COOLDOWN/);
  await assert.rejects(send._handler(backendContext(),{room:'school',characterId:'michael',sessionId:'session-123456789',emote:'not-an-emote'}),/Invalid emote/);
});
