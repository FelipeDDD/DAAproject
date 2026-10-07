import test from 'node:test';
import assert from 'node:assert/strict';
import { startSceneEmotes,stopSceneEmotes } from '../src/emotes/sceneEmotes.js';
import { DEFAULT_EMOTE_SLOTS } from '../src/emotes/config.js';
import { send,inRoom } from '../convex/emotes.js';

function element(){return {hidden:true,dataset:{},children:[],listeners:new Map(),
  append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},
  setAttribute(){},focus(){},addEventListener(type,fn){let handlers=this.listeners.get(type);if(!handlers)this.listeners.set(type,handlers=new Set());handlers.add(fn);},
  removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}};}
test('new maps and PvP load the same saved emote slots, and old scene cleanup cannot hide the new bar',async t=>{
  const nodes=new Map(),windowListeners=new Map(),subscriptions=[],writes=[];
  const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},
    createElement:element,querySelector:()=>null};
  const window={addEventListener(type,fn){let handlers=windowListeners.get(type);if(!handlers)windowListeners.set(type,handlers=new Set());handlers.add(fn);},
    removeEventListener(type,fn){windowListeners.get(type)?.delete(fn);}};
  for(const [key,value] of Object.entries({document,window,localStorage:{getItem:()=>null,setItem(){}}})){
    const old=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{value,configurable:true});
    t.after(()=>{if(old)Object.defineProperty(globalThis,key,old);else delete globalThis[key];});
  }
  const presence={identity:{characterId:'michael',playerId:'owner',sessionId:'session-123456789'},
    api:{emotes:{inRoom:'inRoom',send:'send'}},fail(error){throw error;},
    client:{onUpdate(_fn,args,cb){const sub={...args,cb,closed:false};subscriptions.push(sub);return()=>{sub.closed=true;};},
      async mutation(_fn,args){writes.push(args);return {...args,createdAt:Date.now()};}}};
  const school={presence,mapKey:'school',remotes:{players:new Map()}},pvp={...school,mapKey:'pvp-arena-test',presenceRoom:'pvp-arena-test:match-one'};
  try{
    startSceneEmotes(school);
    assert.deepEqual(school.emoteBar.slots,[...DEFAULT_EMOTE_SLOTS]);
    assert.equal(document.getElementById('emote-bar').hidden,false);
    startSceneEmotes(pvp);
    assert.equal(document.getElementById('emote-bar').hidden,false);
    stopSceneEmotes(school);
    assert.equal(document.getElementById('emote-bar').hidden,false);
    assert.equal(subscriptions.filter(s=>!s.closed).length,1);
    assert.equal(subscriptions.at(-1).room,pvp.presenceRoom);
    pvp.emoteBar.activate(0);await new Promise(resolve=>setImmediate(resolve));
    assert.equal(writes[0].room,pvp.presenceRoom);assert.equal(writes[0].emote,DEFAULT_EMOTE_SLOTS[0]);
    startSceneEmotes(pvp);assert.equal(subscriptions.filter(s=>!s.closed).length,1);
    assert.equal(windowListeners.get('keydown').size,1);
  }finally{stopSceneEmotes(school);stopSceneEmotes(pvp);}
  assert.equal(document.getElementById('emote-bar').hidden,true);
  assert.equal(windowListeners.get('keydown').size,0);assert.equal(subscriptions.filter(s=>!s.closed).length,0);
});

test('PvP emotes use the current match room and are visible only to that room',async()=>{
  const player={_id:'owner-doc',playerId:'owner',characterId:'michael',characterBaseId:'michael',
    sessionId:'session-123456789',room:'pvp-arena-test:match-one',lastSeen:Date.now()};
  const rows=[];
  const ctx={db:{query:table=>({withIndex(_name,build){let room;const q={eq(key,value){if(key==='room')room=value;return q;}};build(q);
    return {unique:async()=>table==='players'?player:null,collect:async()=>rows.filter(row=>row.room===room)};}}),
    insert:async(_table,event)=>rows.push(event)}};
  const event=await send._handler(ctx,{room:player.room,playerId:player.playerId,sessionId:player.sessionId,emote:DEFAULT_EMOTE_SLOTS[0]});
  assert.deepEqual(await inRoom._handler(ctx,{room:player.room}),[event]);
  assert.deepEqual(await inRoom._handler(ctx,{room:'pvp-arena-test:other-match'}),[]);
});
