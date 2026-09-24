import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { officeDoorPlacement, office3DoorPlacement } from '../src/art/officeDoor.js';
import { OFFICE2_LOCKED_DOOR, canUnlockOffice2Door, office2LockedDoorPlacement } from '../src/art/office2LockedDoor.js';
import { BOSS_REWARDS } from '../src/boss/BossRewards.js';
import { CHARACTER_ITEM_IDS } from '../src/inventory/characterItems.js';
import { readMapTransitions } from '../src/maps/transitions.js';
import { objectsIn } from '../src/maps/tiledObjects.js';

const classroom = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));
const office2 = JSON.parse(readFileSync(new URL('../public/assets/maps/office2.tmj', import.meta.url)));

test('office door uses the existing E transition and its saved-map position', () => {
  const transition = readMapTransitions(classroom).find((item) => item.targetMap === 'office2');
  const note = objectsIn(classroom, 'Notes').find((item) => item.name === 'door-office2');
  assert.equal(transition?.label, 'Office');
  assert.equal(transition?.targetSpawn, 'office2-spawn');
  assert.equal(transition?.locked,true);
  assert.ok(note);
  assert.deepEqual(officeDoorPlacement(classroom), {
    x: note.x, bottom: note.y, width: 80, height: 44,
  });
  assert.equal(note.y,430.25);
});

test('a resized Tiled note controls the door art, with the transition as fallback', () => {
  const source = structuredClone(classroom);
  const notes = source.layers.find((layer) => layer.name === 'Notes').objects;
  const note = notes.find((item) => item.name === 'door-office2');
  Object.assign(note, { x: 100, y: 200, width: 96, height: 52 });
  assert.deepEqual(officeDoorPlacement(source), {
    x: 148, bottom: 252, width: 96, height: 52,
  });
  notes.splice(notes.indexOf(note), 1);
  const transition = readMapTransitions(source).find((item) => item.targetMap === 'office2');
  assert.deepEqual(officeDoorPlacement(source), {
    x: transition.x, bottom: transition.y + 24, width: 80, height: 44,
  });
});

test('office3 door follows the new classroom Notes marker beside its transition', () => {
  const note = objectsIn(classroom, 'Notes').find(item => item.name === 'office3-door');
  const transition = readMapTransitions(classroom).find(item => item.targetMap === 'office3');
  assert.ok(note);
  assert.ok(transition);
  assert.deepEqual(office3DoorPlacement(classroom), {
    x: note.x, y: note.y - 18, width: 52, height: 64,
  });
  assert.ok(Math.abs(note.x - transition.x) < 2);
  const moved = structuredClone(classroom);
  const marker = moved.layers.find(layer => layer.name === 'Notes').objects.find(item => item.name === 'office3-door');
  marker.x += 10;
  assert.equal(office3DoorPlacement(moved).x, note.x + 10);
  marker.name = 'another-note';
  assert.equal(office3DoorPlacement(moved), null);
});

test('locked office2 door follows its Tiled point and keeps the seam adjustable', () => {
  const marker = objectsIn(office2, 'Notes').find(item => item.name === 'office2-door-locked');
  assert.ok(marker);
  assert.deepEqual(office2LockedDoorPlacement(office2), {
    x: marker.x + OFFICE2_LOCKED_DOOR.offsetX,
    bottom: marker.y + OFFICE2_LOCKED_DOOR.offsetY,
    width: OFFICE2_LOCKED_DOOR.width,
    height: OFFICE2_LOCKED_DOOR.height,
  });
  const moved = structuredClone(office2);
  const note = moved.layers.find(layer => layer.name === 'Notes').objects.find(item => item.name === marker.name);
  note.y += 12;
  assert.equal(office2LockedDoorPlacement(moved).bottom, marker.y + OFFICE2_LOCKED_DOOR.offsetY + 12);
  note.name = 'another-note';
  assert.equal(office2LockedDoorPlacement(moved), null);
});

test('only the Director badge permits opening the hidden door', () => {
  assert.equal(canUnlockOffice2Door([]), false);
  assert.equal(canUnlockOffice2Door([{ itemId: CHARACTER_ITEM_IDS.OFFICE2_KEY }]), false);
  assert.equal(canUnlockOffice2Door([{ itemId: BOSS_REWARDS.DIRECTOR_ACCESS_BADGE, compatible: false }]), false);
  assert.equal(canUnlockOffice2Door([{ itemId: BOSS_REWARDS.DIRECTOR_ACCESS_BADGE }]), true);
});
