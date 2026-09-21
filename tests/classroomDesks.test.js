import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classroomDeskPlacements } from '../src/art/classroomDesks.js';

const classroom = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));

test('six classroom desks follow their Tiled collision footprints and use every tabletop', () => {
  const desks = classroomDeskPlacements(classroom);
  assert.equal(desks.length, 6);
  assert.deepEqual(new Set(desks.map((desk) => desk.variant)), new Set([1, 2, 3, 4]));
  assert.deepEqual(desks.filter((desk) => desk.variant === 4).map((desk) => desk.name),
    ['block-30-17', 'block-30-25']);
  for (const desk of desks) {
    assert.equal(desk.width, 64);
    assert.equal(desk.height, 128);
  }
});
