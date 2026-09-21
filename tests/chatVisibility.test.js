import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAT_PEEK_DURATION_MS,CHAT_PEEK_MESSAGE_COUNT,ChatVisibility,loadChatPinned,saveChatPinned,
} from '../src/chat/ChatVisibility.js';

function clock(){
  let next=0;const timers=new Map();
  return {timers,setTimer:(callback,delay)=>{const id=++next;timers.set(id,{callback,delay});return id;},
    clearTimer:id=>timers.delete(id),fire:id=>{const timer=timers.get(id);timers.delete(id);timer?.callback();}};
}

test('incoming activity shows five recent messages, restarts the peek timer, then fades to hidden',()=>{
  const timer=clock(),states=[];
  const visibility=new ChatVisibility(state=>states.push(state),timer);
  assert.equal(visibility.state,'hidden');assert.equal(CHAT_PEEK_MESSAGE_COUNT,5);
  visibility.activity();assert.equal(visibility.state,'peek');
  const first=visibility.timer;assert.equal(timer.timers.get(first).delay,CHAT_PEEK_DURATION_MS);
  visibility.activity();assert.equal(timer.timers.has(first),false);
  timer.fire(first);assert.equal(visibility.state,'peek');
  timer.fire(visibility.timer);assert.equal(visibility.state,'hidden');
  assert.deepEqual(states,['peek','peek','hidden']);
});

test('active chat pauses hiding, sending returns to peek, pin persists and map cleanup cancels timer',()=>{
  const timer=clock(),visibility=new ChatVisibility(()=>{},timer);
  visibility.activity();visibility.open();assert.equal(timer.timers.size,0);
  visibility.change('peek');assert.equal(timer.timers.size,1);
  visibility.pin(true);assert.equal(timer.timers.size,0);
  timer.fire(visibility.timer);assert.equal(visibility.state,'peek');
  visibility.open();visibility.close();assert.equal(visibility.state,'peek');
  visibility.pin(false);assert.equal(timer.timers.size,1);
  visibility.destroy();assert.equal(timer.timers.size,0);
  const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  assert.equal(loadChatPinned(storage),false);
  saveChatPinned(true,storage);assert.equal(loadChatPinned(storage),true);
});
