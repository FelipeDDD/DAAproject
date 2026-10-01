import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MENDIGA_VISUAL, patrolStep, readMendigaPatrol } from '../src/npc/mendigaPatrol.js';
import { MendigaNpc } from '../src/npc/MendigaNpc.js';
import { collisionAreas } from '../src/maps/collision.js';

const source = JSON.parse(readFileSync(new URL('../public/assets/maps/outside.tmj', import.meta.url)));

test('outside patrol is authored in Notes and avoids walls/gardens over its entire loop', () => {
  const route = readMendigaPatrol(source);
  assert.equal(route.length, 4);
  const obstacles = collisionAreas(source.layers.find(layer => layer.name === 'Collision').objects);
  for (let i = 0; i < route.length; i++) {
    const a = route[i], b = route[(i + 1) % route.length];
    for (let step = 0; step <= 100; step++) {
      const x = a.x + (b.x - a.x) * step / 100, y = a.y + (b.y - a.y) * step / 100;
      for (const wall of obstacles) assert.ok(
        x + 8 <= wall.x || x - 8 >= wall.x + wall.width || y <= wall.y || y - 8 >= wall.y + wall.height,
        `Patrol feet overlap ${JSON.stringify(wall)}`,
      );
    }
  }
});

test('patrol points sort numerically, use layer offsets and ignore unrelated notes', () => {
  const map = {layers: [{type: 'objectgroup', name: 'Notes', offsetx: 10, offsety: 20, objects: [
    {name: 'mendiga-patrol-10', point: true, x: 1, y: 2},
    {name: 'other', point: true, x: 99, y: 99},
    {name: 'mendiga-patrol-2', point: true, x: 3, y: 4},
  ]}]};
  assert.deepEqual(readMendigaPatrol(map), [{x: 13, y: 24}, {x: 11, y: 22}]);
  assert.deepEqual(readMendigaPatrol({layers: []}), []);
});

test('movement chooses all four directions, clamps long frames and never overshoots', () => {
  for (const [target, direction] of [[{x: 10, y: 0}, 'right'], [{x: -10, y: 0}, 'left'],
    [{x: 0, y: 10}, 'down'], [{x: 0, y: -10}, 'up']]) {
    const step = patrolStep({x: 0, y: 0}, target, 1000);
    assert.equal(step.direction, direction);
    assert.ok(Math.hypot(step.x, step.y) <= 3.2);
  }
  assert.deepEqual(patrolStep({x: 0, y: 0}, {x: 1, y: 0}, 100),
    {x: 1, y: 0, direction: 'right', arrived: true});
});

test('registered art uses 16 uniform frames with a shared foot baseline', () => {
  const png = readFileSync(new URL('../public/assets/npc/mendiga-walk.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), 512);
  assert.equal(png.readUInt32BE(20), 576);
  const registration = JSON.parse(readFileSync(new URL('../public/assets/npc/mendiga-walk-registration.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
  assert.equal(registration.frames.length, 16);
  assert.equal(registration.frameWidth, MENDIGA_VISUAL.frameWidth);
  assert.equal(registration.frameHeight, MENDIGA_VISUAL.frameHeight);
  assert.equal(registration.baseline, 143);
  assert.deepEqual(MENDIGA_VISUAL.rows, ['down', 'right', 'left', 'up']);
});

test('NPC creates four looping walks, follows the route, pauses and cleans up', () => {
  const animations = [];
  const sprite = {x: 0, y: 0, setOrigin() {return this;}, setScale() {return this;},
    setDepth() {return this;}, setPosition(x, y) {this.x = x; this.y = y; return this;},
    play(key) {this.key = key; return this;}, stop() {this.stopped = true; return this;},
    destroy() {this.destroyed = true;}};
  const scene = {source, add: {sprite(x, y) {return sprite.setPosition(x, y);}}, anims: {
    exists() {return false;}, create(config) {animations.push(config);},
    generateFrameNumbers(texture, range) {return range;},
  }};
  const npc = new MendigaNpc(scene);
  assert.equal(animations.length, 4);
  assert.deepEqual(animations[1].frames, {start: 4, end: 7});
  assert.ok(animations.every(animation => animation.repeat === -1));
  npc.update(0, 100);
  assert.equal(sprite.key, 'outside-mendiga-walk-right');
  sprite.setPosition(559, 416);
  npc.update(100, 100);
  assert.equal(sprite.x, 560);
  assert.equal(npc.target, 2);
  npc.update(200, 100);
  assert.equal(sprite.y, 416);
  npc.update(400, 100);
  assert.ok(sprite.y > 416);
  npc.destroy();
  assert.equal(sprite.destroyed, true);
  npc.update(500, 100);
});

test('missing patrol does not create an NPC or invent coordinates', () => {
  const npc = new MendigaNpc({source: {layers: []}});
  npc.update(0, 16);
  npc.destroy();
  assert.equal(npc.sprite, null);
});
