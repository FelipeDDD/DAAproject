import test from 'node:test';
import assert from 'node:assert/strict';
import { Door } from '../src/entities/Door.js';
import { classroomDoors } from '../src/maps/doors.js';

// Headless adapter for render/physics ports; tests exercise Door's actual state logic.
function makeDoor(overrides = {}) {
  const visual = {
    setOrigin() { return this; }, setDepth() { return this; },
    setTexture(texture, frame) { this.texture = texture; this.frame = frame; return this; },
    setDisplaySize() { return this; },
  };
  const blocker = { setOrigin() { return this; } };
  const scene = {
    add: { image: () => visual, zone: () => blocker },
    physics: { add: { existing: (zone) => { zone.body = { enable: true }; } } },
  };
  return new Door(scene, { ...classroomDoors[0], ...overrides });
}
const outside = { x: 0, y: 0, right: 23, bottom: 14 };

test('closed -> open -> closed updates the blocker and visual together', () => {
  const door = makeDoor();
  assert.equal(door.blocker.body.enable, true);
  assert.equal(door.getDestination(), null);
  door.toggle(outside);
  assert.equal(door.open, true);
  assert.equal(door.blocker.body.enable, false);
  assert.equal(door.visual.texture, door.openVisual.texture);
  assert.deepEqual(door.getDestination(), {
    targetMap: 'empty-area', targetX: 320, targetY: 256,
  });
  door.toggle(outside);
  assert.equal(door.blocker.body.enable, true);
  assert.equal(door.visual.texture, door.closedVisual.texture);
  assert.equal(door.getDestination(), null);
});

test('locked doors remain closed even with contradictory initial open: true', () => {
  const door = makeDoor({ open: true, locked: true });
  door.toggle(outside);
  assert.equal(door.open, false);
  assert.equal(door.blocker.body.enable, true);
  assert.equal(door.getDestination(), null);
});

test('door cannot close over feet, but can close after the player leaves', () => {
  const door = makeDoor({ open: true });
  const inside = { x: door.x + 4, y: door.y + 4, right: door.x + 27, bottom: door.y + 18 };
  door.toggle(inside);
  assert.equal(door.open, true);
  assert.equal(door.blocker.body.enable, false);
  door.toggle(outside);
  assert.equal(door.open, false);
});

test('bathroom can open without ever providing a destination', () => {
  const door = makeDoor(classroomDoors[1]);
  // Do not inherit the test factory's classroom destination.
  delete door.targetMap;
  door.toggle(outside);
  assert.equal(door.blocker.body.enable, false);
  assert.equal(door.getDestination(), null);
});

test('interaction measures the feet against the full doorway width', () => {
  const door = makeDoor();
  assert.equal(door.isNear({ x: door.x, right: door.x + 23, y: door.y + 60, bottom: door.y + 74 }), true);
  assert.equal(door.isNear(outside), false);
});

test('custom open and closed frames are selected without animation', () => {
  const door = makeDoor({
    closedVisual: { texture: 'my-doors', frame: 2 },
    openVisual: { texture: 'my-doors', frame: 5 },
  });
  assert.equal(door.visual.frame, 2);
  door.toggle(outside);
  assert.equal(door.visual.texture, 'my-doors');
  assert.equal(door.visual.frame, 5);
});
