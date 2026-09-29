import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { koettingMarker, KOETTING_REWARD_AMOUNT, KOETTING_STREAK_TARGET, nextKoettingStreak } from '../src/npc/koettingChallenge.js';

test('Mysterious Man follows the Tiled marker used by the running map',()=>{
  const map=JSON.parse(readFileSync(new URL('../public/assets/maps/secret-path.tmj',import.meta.url),'utf8'));
  const marker=map.layers.find(layer=>layer.name==='Notes').objects.find(object=>object.name==='koetting-NPC');
  assert.ok(marker);
  assert.deepEqual(koettingMarker(map),{x:marker.x,y:marker.y});
  const moved=structuredClone(map);
  moved.layers.find(layer=>layer.name==='Notes').objects.find(object=>object.name==='koetting-NPC').x+=32;
  assert.equal(koettingMarker(moved).x,marker.x+32);
});

test('three consecutive answers earn one three-potion stack; a mistake resets progress',()=>{
  let streak=nextKoettingStreak(0,true);
  streak=nextKoettingStreak(streak,true);
  assert.equal(streak,2);
  streak=nextKoettingStreak(streak,false);
  assert.equal(streak,0);
  for(let index=0;index<3;index++)streak=nextKoettingStreak(streak,true);
  assert.equal(streak,KOETTING_STREAK_TARGET);
  assert.equal(KOETTING_REWARD_AMOUNT,3);
});
