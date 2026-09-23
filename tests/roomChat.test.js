import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomChat } from '../src/RoomChat.js';

class FakeElement {
  constructor(tagName){
    Object.assign(this,{tagName,events:new Map(),children:[],dataset:{},attributes:{},classList:{
      toggle:()=>{},remove:()=>{},
    },value:'',scrollTop:0,scrollHeight:0,clientHeight:100});
  }
  addEventListener(type,callback){this.events.set(type,callback);}
  removeEventListener(type){this.events.delete(type);}
  setAttribute(key,value){this.attributes[key]=value;}
  removeAttribute(key){delete this.attributes[key];}
  replaceChildren(...children){this.children=children;}
  append(...children){this.children.push(...children);}
  closest(){return null;}
  focus(){globalThis.document.activeElement=this;this.events.get('focus')?.();}
  blur(){if(globalThis.document.activeElement===this)globalThis.document.activeElement=null;this.events.get('blur')?.();}
}

function setup(){
  const nodes=new Map(['room-chat','chat-messages','chat-input','chat-status','chat-pin','game','profile-auth']
    .map(id=>[id,new FakeElement(id)]));
  nodes.get('profile-auth').hidden=true;
  const listeners=new Map(),sent=[];
  const documentRef={getElementById:id=>nodes.get(id),createElement:tag=>new FakeElement(tag),
    createTextNode:text=>({textContent:text}),activeElement:null};
  const windowRef={addEventListener:(type,callback)=>listeners.set(type,callback),
    removeEventListener:type=>listeners.delete(type)};
  const previous={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  const storage=new Map();
  globalThis.document=documentRef;globalThis.window=windowRef;
  globalThis.localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
  const keyboard={enabled:true,resets:0,resetKeys(){this.resets++;}};
  const player={stops:0,setVelocity(){this.stops++;}};
  const scene={mapKey:'school',input:{keyboard},player};
  const presence={identity:{characterId:'michael',sessionId:'session'},api:{messages:{inRoom:'inRoom',send:'send'}},client:{
    onUpdate:(_fn,_args,callback)=>{presence.receive=callback;return ()=>{presence.unsubscribed=true;};},
    mutation:async(_fn,args)=>{sent.push(args);},
  }};
  const event=(key,target=nodes.get('game'))=>({type:'keydown',key,target,repeat:false,
    preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}});
  const restore=()=>Object.assign(globalThis,previous);
  return {nodes,listeners,sent,scene,presence,event,restore};
}

test('Enter opens chat, Enter sends, Esc closes, and scene keyboard stays blocked during typing',async()=>{
  const h=setup();
  try{
    const chat=new RoomChat(h.scene,h.presence);
    assert.equal(chat.visibility.state,'hidden');
    const open=h.event('Enter');h.listeners.get('keydown')(open);
    assert.equal(open.prevented,true);assert.equal(chat.visibility.state,'active');
    assert.equal(h.nodes.get('chat-input'),globalThis.document.activeElement);
    assert.equal(h.scene.input.keyboard.enabled,false);assert.ok(h.scene.player.stops>=1);
    const movement=h.event('w',h.nodes.get('chat-input'));h.listeners.get('keydown')(movement);
    assert.equal(movement.stopped,true);
    h.nodes.get('chat-input').value='Hello room';
    const send=h.event('Enter',h.nodes.get('chat-input'));h.listeners.get('keydown')(send);
    await Promise.resolve();
    assert.equal(h.sent.length,1);assert.equal(h.sent[0].text,'Hello room');
    assert.equal(chat.visibility.state,'peek');assert.equal(h.scene.input.keyboard.enabled,true);
    h.listeners.get('keydown')(h.event('Enter'));
    h.listeners.get('keydown')(h.event('Escape',h.nodes.get('chat-input')));
    assert.equal(chat.visibility.state,'hidden');
    assert.equal(h.scene.input.keyboard.enabled,true);
    chat.close();assert.equal(h.listeners.size,0);assert.equal(h.presence.unsubscribed,true);
  }finally{h.restore();}
});

test('lost input focus cannot leak E to a nearby interaction or prevent Enter and Esc',async()=>{
  const h=setup();
  try{
    const chat=new RoomChat(h.scene,h.presence);
    h.listeners.get('keydown')(h.event('Enter'));
    h.nodes.get('chat-input').blur();
    assert.equal(chat.focused,false);
    assert.equal(chat.isInputActive,true);
    assert.equal(h.scene.input.keyboard.enabled,false);
    const interact=h.event('e');h.listeners.get('keydown')(interact);
    assert.equal(interact.stopped,true);
    assert.equal(interact.prevented,true);
    assert.equal(globalThis.document.activeElement,h.nodes.get('chat-input'));
    h.nodes.get('chat-input').value='Near the door';
    h.listeners.get('keydown')(h.event('Enter'));
    await Promise.resolve();
    assert.equal(h.sent[0].text,'Near the door');
    assert.equal(h.scene.input.keyboard.enabled,true);
    h.listeners.get('keydown')(h.event('Enter'));
    h.nodes.get('chat-input').blur();
    h.listeners.get('keydown')(h.event('Escape'));
    assert.equal(chat.visibility.state,'hidden');
    assert.equal(h.scene.input.keyboard.enabled,true);
    chat.close();
  }finally{h.restore();}
});

test('an open profile form receives E and WASD even if chat had been active',()=>{
  const h=setup();
  try{
    const chat=new RoomChat(h.scene,h.presence);
    h.listeners.get('keydown')(h.event('Enter'));
    h.nodes.get('profile-auth').hidden=false;
    for(const key of ['e','w','a','s','d']){
      const typed=h.event(key,h.nodes.get('profile-auth'));
      h.listeners.get('keydown')(typed);
      h.listeners.get('keyup')(typed);
      assert.equal(typed.prevented,undefined);
      assert.equal(typed.stopped,undefined);
    }
    chat.close();
  }finally{h.restore();}
});

test('a second Enter sends immediately even while the first Convex mutation is pending',async()=>{
  const h=setup(),resolvers=[];
  h.presence.client.mutation=(_fn,args)=>{
    h.sent.push(args);
    return new Promise(resolve=>resolvers.push(resolve));
  };
  try{
    const chat=new RoomChat(h.scene,h.presence),input=h.nodes.get('chat-input');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='First';h.listeners.get('keydown')(h.event('Enter',input));
    assert.equal(chat.visibility.state,'peek');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='Second';h.listeners.get('keydown')(h.event('Enter',input));
    assert.deepEqual(h.sent.map(message=>message.text),['First','Second']);
    assert.equal(input.value,'');assert.equal(chat.visibility.state,'peek');
    resolvers.forEach(resolve=>resolve());
    chat.close();
  }finally{h.restore();}
});

test('sending or closing chat restores game focus after the key event',()=>{
  const h=setup(),frames=[];
  const previousFrame=globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame=callback=>{frames.push(callback);};
  try{
    const chat=new RoomChat(h.scene,h.presence),input=h.nodes.get('chat-input');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='First';h.listeners.get('keydown')(h.event('Enter',input));
    globalThis.document.activeElement=null;frames.splice(0).forEach(callback=>callback());
    assert.equal(globalThis.document.activeElement,h.nodes.get('game'));
    assert.equal(h.scene.input.keyboard.enabled,true);

    h.listeners.get('keydown')(h.event('Enter'));
    assert.equal(globalThis.document.activeElement,input);
    h.listeners.get('keydown')(h.event('Escape',input));
    globalThis.document.activeElement=null;frames.splice(0).forEach(callback=>callback());
    assert.equal(globalThis.document.activeElement,h.nodes.get('game'));
    assert.equal(h.scene.input.keyboard.enabled,true);
    chat.close();
  }finally{globalThis.requestAnimationFrame=previousFrame;h.restore();}
});

test('Enter with an empty message closes chat and unlocks movement',()=>{
  const h=setup();
  try{
    const chat=new RoomChat(h.scene,h.presence),input=h.nodes.get('chat-input');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='   ';
    h.listeners.get('keydown')(h.event('Enter',input));
    assert.equal(chat.visibility.state,'hidden');
    assert.equal(h.scene.input.keyboard.enabled,true);
    assert.equal(globalThis.document.activeElement,h.nodes.get('game'));
    assert.equal(h.sent.length,0);
    chat.close();
  }finally{h.restore();}
});

test('opening chat shows room history; peek shows only the latest messages',()=>{
  const h=setup();
  try{
    const chat=new RoomChat(h.scene,h.presence),list=h.nodes.get('chat-messages');
    h.presence.receive(Array.from({length:8},(_,index)=>({
      _id:String(index),characterName:'Felipe',text:`Message ${index}`,
    })));
    assert.equal(list.children.length,5);
    h.listeners.get('keydown')(h.event('Enter'));
    assert.equal(chat.visibility.state,'active');
    assert.equal(list.children.length,8);
    assert.equal(list.children[0].children[1].textContent,'Message 0');
    h.listeners.get('keydown')(h.event('Escape',h.nodes.get('chat-input')));
    assert.equal(list.children.length,5);
    chat.close();
  }finally{h.restore();}
});

test('a rejected send keeps the message and its error visible for retry',async()=>{
  const h=setup(),previousWarn=console.warn;
  console.warn=()=>{};
  h.presence.client.mutation=async()=>{throw new Error('Invalid session or room.');};
  try{
    const chat=new RoomChat(h.scene,h.presence),input=h.nodes.get('chat-input');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='Please deliver';
    h.listeners.get('keydown')(h.event('Enter',input));
    await Promise.resolve();await Promise.resolve();
    assert.equal(input.value,'Please deliver');
    assert.equal(chat.visibility.state,'active');
    assert.match(h.nodes.get('chat-status').textContent,/Message not sent/);
    h.presence.receive([]);
    assert.match(h.nodes.get('chat-status').textContent,/Message not sent/);
    chat.close();
  }finally{console.warn=previousWarn;h.restore();}
});

test('browser-bound timers do not interrupt sending before the Convex mutation',()=>{
  const h=setup(),originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
  const timers=new Map();let nextId=0;
  globalThis.setTimeout=function(callback){
    if(this!==globalThis)throw new TypeError('Illegal invocation');
    const id=++nextId;timers.set(id,callback);return id;
  };
  globalThis.clearTimeout=function(id){
    if(this!==globalThis)throw new TypeError('Illegal invocation');
    timers.delete(id);
  };
  try{
    const chat=new RoomChat(h.scene,h.presence),input=h.nodes.get('chat-input');
    h.listeners.get('keydown')(h.event('Enter'));
    input.value='Delivered';
    h.listeners.get('keydown')(h.event('Enter',input));
    assert.equal(h.sent.length,1);
    assert.equal(h.sent[0].text,'Delivered');
    assert.equal(chat.visibility.state,'peek');
    chat.close();assert.equal(timers.size,0);
  }finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;h.restore();}
});

test('new room messages trigger peek, pin persists, and reentry replaces old handlers',()=>{
  const h=setup();
  try{
    const old=new RoomChat(h.scene,h.presence);
    h.presence.receive([{_id:'first',characterName:'Felipe',text:'Earlier'}]);
    assert.equal(old.visibility.state,'hidden');
    h.presence.receive([{_id:'first',characterName:'Felipe',text:'Earlier'},
      {_id:'second',characterName:'Sarina',text:'New'}]);
    assert.equal(old.visibility.state,'peek');
    h.nodes.get('chat-pin').events.get('click')();
    assert.equal(old.visibility.pinned,true);assert.equal(old.visibility.timer,null);
    old.close();
    const next=new RoomChat(h.scene,h.presence);
    assert.equal(next.visibility.state,'peek');assert.equal(h.listeners.size,2);
    next.close();assert.equal(h.listeners.size,0);
  }finally{h.restore();}
});
