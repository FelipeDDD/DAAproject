import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { PLAYER_ATTACK_VISUALS,playerAttackSpawn,playerAttackVisual } from '../src/boss/PlayerAttackVisuals.js';

test('arena attack visuals select only Michael and Yassin and reference six source frames',()=>{
  assert.equal(playerAttackVisual('michael').id,'smoke');
  assert.equal(playerAttackVisual('jassine').id,'glasses');
  assert.equal(playerAttackVisual('felipe'),null);
  assert.equal(playerAttackVisual('sarina'),null);
  for(const visual of Object.values(PLAYER_ATTACK_VISUALS)){
    const png=fs.readFileSync(new URL(`../public/${visual.asset}`,import.meta.url));
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png.readUInt32BE(16),visual.frameWidth*visual.frames);
    assert.ok(png.readUInt32BE(20)>=visual.frameTop+visual.frameHeight);
  }
  assert.equal(playerAttackVisual('michael').repeat,0);
  assert.ok(playerAttackVisual('jassine').spin>0);
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
});
