import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_ZOOM,cameraZoomForMap } from '../src/game/settings.js';
import {
  DEFAULT_VIEWPORT_PRESET,GAME_LOGICAL_SIZE,loadViewportPreset,saveViewportPreset,VIEWPORT_PRESETS,
  viewportAspectRatio,
} from '../src/ui/displaySettings.js';
import {
  clampFloatingPosition,loadFloatingPosition,resetFloatingPosition,saveFloatingPosition,snapFloatingPosition,
} from '../src/ui/FloatingHotbar.js';
import { INVENTORY_POSITION_STORAGE_KEY } from '../src/inventory/config.js';
import { EMOTE_POSITION_STORAGE_KEY } from '../src/emotes/config.js';
import { shouldShowArenaCrosshair } from '../src/boss/ArenaCrosshair.js';
import { worldToViewport } from '../src/ui/WorldPrompt.js';

function memoryStorage(){
  const values=new Map();return {values,getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}

test('viewport presets share a fixed 16:9 logical aspect and persist safely',()=>{
  assert.deepEqual(GAME_LOGICAL_SIZE,{width:960,height:540});
  for(const preset of Object.values(VIEWPORT_PRESETS))assert.equal(preset.width/preset.height,16/9);
  assert.equal(viewportAspectRatio('large'),16/9);
  const storage=memoryStorage();assert.equal(loadViewportPreset(storage),DEFAULT_VIEWPORT_PRESET);
  assert.equal(saveViewportPreset('large',storage),'large');assert.equal(loadViewportPreset(storage),'large');
  assert.equal(saveViewportPreset('unknown',storage),DEFAULT_VIEWPORT_PRESET);
});

test('school and arena use independent camera zoom without changing physics scale',()=>{
  assert.equal(cameraZoomForMap('school'),CAMERA_ZOOM.default);
  assert.equal(cameraZoomForMap('outside'),CAMERA_ZOOM.default);
  assert.equal(cameraZoomForMap('arena'),CAMERA_ZOOM.arena);
  assert.equal(CAMERA_ZOOM.default,1.6);assert.equal(CAMERA_ZOOM.arena,1.3);
});

test('floating hotbars stay in the viewport and snap near canvas or each other',()=>{
  const size={width:120,height:50},viewport={width:800,height:600};
  assert.deepEqual(clampFloatingPosition({x:900,y:-20},size,viewport),{x:680,y:0});
  const canvas={left:100,top:80,right:700,bottom:500,width:600,height:420};
  assert.deepEqual(snapFloatingPosition({x:104,y:447},size,viewport,[canvas],10),{x:100,y:450});
});

test('emote and inventory positions persist and reset independently',()=>{
  const storage=memoryStorage();
  saveFloatingPosition(EMOTE_POSITION_STORAGE_KEY,{x:300,y:400},storage);
  saveFloatingPosition(INVENTORY_POSITION_STORAGE_KEY,{x:40,y:50},storage);
  assert.deepEqual(loadFloatingPosition(EMOTE_POSITION_STORAGE_KEY,storage),{x:300,y:400});
  assert.deepEqual(loadFloatingPosition(INVENTORY_POSITION_STORAGE_KEY,storage),{x:40,y:50});
  resetFloatingPosition(INVENTORY_POSITION_STORAGE_KEY,storage);
  assert.equal(loadFloatingPosition(INVENTORY_POSITION_STORAGE_KEY,storage),null);
  assert.deepEqual(loadFloatingPosition(EMOTE_POSITION_STORAGE_KEY,storage),{x:300,y:400});
});

test('world HUD coordinates respect the scaled canvas bounds',()=>{
  const scene={cameras:{main:{getViewMatrix:()=>({transformPoint:(x,y)=>({x,y})})}},
    game:{canvas:{getBoundingClientRect:()=>({left:50,top:30,width:480,height:270,right:530,bottom:300})}},
    scale:{gameSize:{width:960,height:540}}};
  const point=worldToViewport(scene,960,540);
  assert.deepEqual({x:point.x,y:point.y},{x:530,y:300});
});

test('arena crosshair yields to menus and disappears outside the arena canvas',()=>{
  assert.equal(shouldShowArenaCrosshair({arenaActive:true,pointerInside:true,interfaceBlocked:false}),true);
  assert.equal(shouldShowArenaCrosshair({arenaActive:true,pointerInside:true,interfaceBlocked:true}),false);
  assert.equal(shouldShowArenaCrosshair({arenaActive:false,pointerInside:true,interfaceBlocked:false}),false);
  assert.equal(shouldShowArenaCrosshair({arenaActive:true,pointerInside:false,interfaceBlocked:false}),false);
});
