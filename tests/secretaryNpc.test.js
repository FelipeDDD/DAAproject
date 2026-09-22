import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readMapTransitions } from '../src/maps/transitions.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { registerSecretaryFrames,secretaryPatrolArea } from '../src/npc/SecretaryNpc.js';
import {
  SECRETARY_DOOR_DELAY_MS,SECRETARY_GREETING_DURATION_MS,SECRETARY_LINES,
  SECRETARY_SECOND_DELAY_MS,SECRETARY_SPEECH_GAP_MS,SecretaryDialogueState,
} from '../src/npc/SecretaryState.js';

const classroom=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url)));
const office=readMapTransitions(classroom).find(item=>item.targetMap==='office2');

test('all four animation rows fit the unevenly spaced PNG without crossing frames',()=>{
  const image=readFileSync(new URL('../public/assets/npc/secretary.png',import.meta.url));
  const width=image.readUInt32BE(16),height=image.readUInt32BE(20);
  const frames=[],animations=[];
  const texture={has:()=>false,add:(name,_source,x,y,w,h)=>frames.push({name,x,y,w,h})};
  const scene={textures:{get:()=>texture},anims:{exists:()=>false,create:definition=>animations.push(definition)}};
  registerSecretaryFrames(scene);
  assert.equal(frames.length,16);
  assert.equal(animations.length,4);
  assert.deepEqual(animations.map(animation=>animation.key),[
    'school-secretary-walk-down','school-secretary-walk-up',
    'school-secretary-walk-left','school-secretary-walk-right',
  ]);
  assert.ok(frames.every(frame=>frame.x>=0&&frame.y>=0&&frame.x+frame.w<=width&&frame.y+frame.h<=height));
  assert.ok(frames.every(frame=>frame.w===180));
  assert.deepEqual(frames.filter(frame=>frame.name.endsWith('-0')).map(frame=>frame.h),[284,262,255,262]);
});

test('secretary patrol remains in the clear corridor near the locked office entrance',()=>{
  assert.equal(office.locked,true);
  const area=secretaryPatrolArea(office);
  assert.ok(area.left<office.x&&area.right>office.x);
  assert.ok(area.right<224);
  const walls=objectsIn(classroom,'Collision');
  for(let x=area.left;x<=area.right;x+=8){
    const feet={x:x-10,y:area.y-7,width:20,height:14};
    assert.ok(!walls.some(w=>feet.x<w.x+w.width&&feet.x+feet.width>w.x&&feet.y<w.y+w.height&&feet.y+feet.height>w.y),
      `Patrol feet hit wall at ${x}`);
  }
});

test('first speech runs once and second needs continued proximity',()=>{
  const state=new SecretaryDialogueState();
  assert.equal(state.update(0,true)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(1000,true)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(SECRETARY_GREETING_DURATION_MS,true),null);
  assert.equal(state.update(SECRETARY_SECOND_DELAY_MS-1,true),null);
  assert.equal(state.update(SECRETARY_SECOND_DELAY_MS,true)?.text,SECRETARY_LINES.followup);
  state.reset();
  assert.equal(state.update(0,true)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(2000,false)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(SECRETARY_GREETING_DURATION_MS-1,false)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(SECRETARY_GREETING_DURATION_MS,false),null);
  assert.equal(state.update(SECRETARY_SECOND_DELAY_MS+500,true),null);
  assert.equal(state.update(SECRETARY_SECOND_DELAY_MS*2+500,true)?.text,SECRETARY_LINES.followup);
  assert.equal(state.update(SECRETARY_SECOND_DELAY_MS*2+700,false)?.text,SECRETARY_LINES.followup);
  assert.equal(state.update(30000,true),null);
});

test('office attempt queues the two key clues after the locked-door message',()=>{
  const state=new SecretaryDialogueState();
  state.update(0,true);
  assert.equal(state.attemptDoor(1000),true);
  assert.equal(state.update(1000,true)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(SECRETARY_GREETING_DURATION_MS,true),null);
  const doorStart=Math.max(1000+SECRETARY_DOOR_DELAY_MS,
    SECRETARY_GREETING_DURATION_MS+SECRETARY_SPEECH_GAP_MS);
  assert.equal(state.update(doorStart,true)?.text,SECRETARY_LINES.door);
  assert.equal(state.attemptDoor(4000),false);
  const firstDoorEnd=doorStart+4800;
  assert.equal(state.update(firstDoorEnd,true),null);
  assert.equal(state.update(firstDoorEnd+SECRETARY_SPEECH_GAP_MS-1,true),null);
  assert.equal(state.update(firstDoorEnd+SECRETARY_SPEECH_GAP_MS,true)?.text,SECRETARY_LINES.spare);
  assert.equal(state.update(30000,true),null);
  assert.equal(state.attemptDoor(31000),false);
  assert.equal(state.update(30000+SECRETARY_SECOND_DELAY_MS,true)?.text,SECRETARY_LINES.followup);
});

test('an active door clue finishes offscreen; an unspoken followup waits for proximity',()=>{
  const state=new SecretaryDialogueState();
  state.update(0,true);
  state.attemptDoor(1000);
  const doorStart=SECRETARY_GREETING_DURATION_MS+SECRETARY_SPEECH_GAP_MS;
  assert.equal(state.update(doorStart,true)?.text,SECRETARY_LINES.door);
  assert.equal(state.update(doorStart+2000,false)?.text,SECRETARY_LINES.door);
  assert.equal(state.update(doorStart+4800-1,false)?.text,SECRETARY_LINES.door);
  assert.equal(state.update(doorStart+4800,false),null);
  assert.equal(state.update(doorStart+4800+SECRETARY_SPEECH_GAP_MS,true),null);
  assert.equal(state.attemptDoor(20000),true);
});

test('leaving during door delay cancels the clue sequence until another attempt',()=>{
  const state=new SecretaryDialogueState();
  state.update(0,true);
  assert.equal(state.attemptDoor(100),true);
  assert.equal(state.update(500,false)?.text,SECRETARY_LINES.greeting);
  assert.equal(state.update(10000,true),null);
  assert.equal(state.attemptDoor(11000),true);
  assert.equal(state.update(11000+SECRETARY_DOOR_DELAY_MS,true)?.text,SECRETARY_LINES.door);
});
