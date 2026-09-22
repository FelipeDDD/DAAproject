import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { allPlayerAttackVisuals,playerAttackSpawn,playerAttackVisual } from '../src/boss/PlayerAttackVisuals.js';

test('arena attack visuals select each character and reference six source frames',()=>{
  assert.equal(playerAttackVisual('michael').id,'smoke');
  assert.equal(playerAttackVisual('jassine').id,'glasses');
  assert.equal(playerAttackVisual('felipe').id,'monster-attack1');
  assert.equal(playerAttackVisual('sarina',()=>0).id,'tiramisu-attack1');
  assert.equal(playerAttackVisual('sarina',()=>.999).id,'tiramisu-attack2');
  assert.equal(allPlayerAttackVisuals().length,5);
  for(const visual of allPlayerAttackVisuals()){
    const png=fs.readFileSync(new URL(`../public/${visual.asset}`,import.meta.url));
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png.readUInt32BE(16),visual.frameWidth*visual.frames);
    assert.ok(png.readUInt32BE(20)>=visual.frameTop+visual.frameHeight);
  }
  assert.equal(playerAttackVisual('michael').repeat,0);
  assert.ok(playerAttackVisual('jassine').spin>0);
});

test('Sarina chooses both tiramisu attacks across equal random halves',()=>{
  assert.equal(playerAttackVisual('sarina',()=>0.49).id,'tiramisu-attack1');
  assert.equal(playerAttackVisual('sarina',()=>0.5).id,'tiramisu-attack2');
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
