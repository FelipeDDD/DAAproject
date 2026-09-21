import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { officeDoorPlacement } from '../src/art/officeDoor.js';
import { readMapTransitions } from '../src/maps/transitions.js';
import { objectsIn } from '../src/maps/tiledObjects.js';

const classroom = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));

test('office door uses the existing E transition and its saved-map position', () => {
  const transition = readMapTransitions(classroom).find((item) => item.targetMap === 'office2');
  const note = objectsIn(classroom, 'Notes').find((item) => item.name === 'door-office2');
  assert.equal(transition?.label, 'Office');
  assert.equal(transition?.targetSpawn, 'office2-spawn');
  assert.ok(note);
  assert.deepEqual(officeDoorPlacement(classroom), {
    x: note.x, bottom: note.y, width: 80, height: 44,
  });
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
