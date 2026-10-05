import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allPlayerAttackVisuals,playerAttackSpawn,playerAttackVisual,preparePlayerAttackVisuals } from '../src/boss/PlayerAttackVisuals.js';

test('arena attack visuals select each character and reference six source frames',()=>{
  assert.equal(playerAttackVisual('michael').id,'smoke');
  assert.equal(playerAttackVisual('jassine').id,'glasses');
  assert.equal(playerAttackVisual('felipe').id,'monster-attack1');
  assert.equal(playerAttackVisual('sarina',()=>0).id,'tiramisu-attack1');
  assert.equal(playerAttackVisual('sarina',()=>.999).id,'tiramisu-attack1');
  assert.equal(allPlayerAttackVisuals().length,4);
  for(const visual of allPlayerAttackVisuals()){
    const png=fs.readFileSync(new URL(`../public/${visual.asset}`,import.meta.url));
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png.readUInt32BE(16),visual.frameWidth*visual.frames);
    assert.ok(png.readUInt32BE(20)>=visual.frameTop+visual.frameHeight);
  }
  assert.equal(playerAttackVisual('michael').repeat,0);
  assert.ok(playerAttackVisual('jassine').spin>0);
});

test('Sarina uses the remaining tiramisu attack after the defective variant is repurposed',()=>{
  for(const random of [()=>0,()=>0.49,()=>0.5,()=>0.999])assert.equal(playerAttackVisual('sarina',random).id,'tiramisu-attack1');
  assert.equal(allPlayerAttackVisuals().some(visual=>visual.texture==='sarina-tiramisu-attack2'),false);
});

test('attack spawn tracks cigarette and glasses by appearance and facing',()=>{
  const michael=playerAttackVisual('michael');
  const player={x:100,y:200,facing:'right',visual:{style:'lungCrusher'}};
  assert.deepEqual(playerAttackSpawn(player,michael,{x:1,y:0}),{x:134,y:163});
  player.facing='left';
  assert.deepEqual(playerAttackSpawn(player,michael,{x:-1,y:0}),{x:62,y:163});
  player.visual.style='new';
  assert.deepEqual(playerAttackSpawn(player,michael,{x:-1,y:0}),{x:74,y:163});
  const yassin=playerAttackVisual('jassine');
  player.visual.style='new';player.facing='down';
  assert.deepEqual(playerAttackSpawn(player,yassin,{x:0,y:1}),{x:100,y:157});
  const felipe=playerAttackVisual('felipe');player.visual.style='new';player.facing='right';
  assert.deepEqual(playerAttackSpawn(player,felipe,{x:1,y:0}),{x:122,y:162});
});

test('shared attack preparation registers the same cropped frames and animation settings for PvP and Arena',()=>{
  const definitions=allPlayerAttackVisuals(),textures=new Map(),animations=[];
  for(const visual of definitions){
    const frames=new Set();textures.set(visual.texture,{has:frame=>frames.has(frame),add(name,_source,x,y,width,height){
      frames.add(name);this.rectangles??=[];this.rectangles.push({name,x,y,width,height});
    }});
  }
  preparePlayerAttackVisuals({textures:{exists:key=>textures.has(key),get:key=>textures.get(key)},
    anims:{exists:key=>animations.some(animation=>animation.key===key),create:animation=>animations.push(animation)}});
  for(const visual of definitions){
    assert.equal(textures.get(visual.texture).rectangles.length,visual.frames);
    assert.deepEqual(textures.get(visual.texture).rectangles[0],{name:'attack-0',x:0,y:visual.frameTop,
      width:visual.frameWidth,height:visual.frameHeight});
    const animation=animations.find(item=>item.key===visual.animation);
    assert.equal(animation.frames.length,visual.frames);assert.equal(animation.frameRate,visual.frameRate);
    assert.equal(animation.repeat,visual.repeat);
  }
});
