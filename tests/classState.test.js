import assert from 'node:assert/strict';
import test from 'node:test';
import { classRestoreDestination,classRestoreRoom,isValidClassPosition } from '../src/maps/classState.js';

test('missing, old or unsafe class state falls back to the default school spawn',()=>{
  assert.equal(classRestoreRoom(null),'school');
  assert.equal(classRestoreRoom({version:0,room:'office2',x:10,y:20}),'school');
  assert.equal(classRestoreRoom({version:1,room:'arena',x:10,y:20}),'school');
  assert.equal(isValidClassPosition('school',NaN,20),false);
});

test('saved position is used only for its room and within the current Tiled bounds',()=>{
  const state={version:1,room:'office2',x:200,y:150},source={width:23,height:13,tilewidth:32,tileheight:32};
  assert.equal(classRestoreRoom(state),'office2');
  assert.deepEqual(classRestoreDestination(state,'office2',source),{targetX:200,targetY:150});
  assert.deepEqual(classRestoreDestination(state,'school',source),{});
  assert.deepEqual(classRestoreDestination({...state,x:999},'office2',source),{});
});
