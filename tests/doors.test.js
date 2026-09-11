import test from 'node:test';
import assert from 'node:assert/strict';
import { Door } from '../src/entities/Door.js';
import { readFileSync } from 'node:fs';
import { readDoors } from '../src/maps/doors.js';

const source = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));
const classroomDoors = readDoors(source);

// Headless adapter for render/physics ports; tests exercise Door's actual state logic.
function makeDoor(overrides = {}, definition = {...classroomDoors.find(d => d.id === 'exit_main_door'), open: false, interactive: true}) {
  const visual = {
    setOrigin() { return this; }, setDepth() { return this; },
    setTexture(texture, frame) { this.texture = texture; this.frame = frame; return this; },
    setDisplaySize() { return this; },
    setPosition(x,y) { this.x=x; this.y=y; return this; },
  };
  const blocker = { setOrigin() { return this; } };
  const scene = {
    add: { image: () => visual, zone: () => blocker },
    physics: { add: { existing: (zone) => { zone.body = { enable: true }; } } },
  };
  return new Door(scene, { ...definition, ...overrides });
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
    targetMap: 'outside', targetSpawn: 'schoolEntrance', targetX: undefined, targetY: undefined,
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
  const door = makeDoor({}, classroomDoors.find(d => d.id === 'bathroom-entry'));
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

test('transition false prevents travel even when a targetMap is configured', () => {
  const door = makeDoor({ transition: false, open: true });
  assert.equal(door.getDestination(), null);
  assert.equal(door.blocker.body.enable, false);
});

test('non-interactive open entrance keeps passage and transition available', () => {
  const door = makeDoor({ interactive: false, open: true });
  door.toggle(outside);
  assert.equal(door.open, true);
  assert.equal(door.blocker.body.enable, false);
  assert.equal(door.getDestination().targetMap, 'outside');
});
