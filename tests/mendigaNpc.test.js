import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MENDIGA_VISUAL, buildMendigaWalkGrid, findMendigaWanderPath, patrolStep,
  readMendigaPatrol, stabilizePatrolDirection } from '../src/npc/mendigaPatrol.js';
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

test('walk grid reaches the full connected courtyard while routing around collision geometry', () => {
  const grid = buildMendigaWalkGrid(source), start = grid.nodes.get('25,26');
  assert.ok(start, 'the current starting area is walkable');
  const visited = new Set([start]), pending = [start];
  for (let index = 0; index < pending.length; index++) for (const next of pending[index].neighbors) {
    if (!visited.has(next)) {visited.add(next); pending.push(next);}
  }
  assert.ok([...visited].some(node => node.x < 100), 'left side is reachable');
  assert.ok([...visited].some(node => node.x > 850), 'right side is reachable');
  assert.ok([...visited].some(node => node.y < 250), 'upper courtyard is reachable');
  assert.ok([...visited].some(node => node.y > 680), 'lower pavement is reachable');
  for (const node of visited) for (const next of node.neighbors) {
    const distance = Math.hypot(next.x - node.x, next.y - node.y);
    const steps = Math.ceil(distance / 4);
    for (let step = 0; step <= steps; step++) {
      const t = step / steps, x = node.x + (next.x - node.x) * t, y = node.y + (next.y - node.y) * t;
      const feet = {x: x - 8, y: y - 8, width: 16, height: 8};
      for (const obstacle of grid.obstacles) assert.ok(
        feet.x + feet.width <= obstacle.x || feet.x >= obstacle.x + obstacle.width
          || feet.y + feet.height <= obstacle.y || feet.y >= obstacle.y + obstacle.height,
        `A navigation edge crosses a collision at ${x},${y}`,
      );
    }
  }
});

test('wander destinations use safe routes and can explore distant parts of the map', () => {
  const grid = buildMendigaWalkGrid(source);
  const path = findMendigaWanderPath(grid, {x: 400, y: 416}, () => 0.5);
  assert.ok(path.length > 5);
  assert.ok(Math.hypot(path.at(-1).x - 400, path.at(-1).y - 416) >= 128);
  assert.deepEqual(findMendigaWanderPath(grid, {x: -100, y: -100}), []);
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

test('walking animation direction does not flicker on rapid axis and up/down reversals', () => {
  let state = stabilizePatrolDirection(null, 'up', 0, -Infinity);
  assert.equal(state.direction, 'up');
  state = stabilizePatrolDirection(state.direction, 'down', 100, state.changedAt);
  assert.equal(state.direction, 'up');
  state = stabilizePatrolDirection(state.direction, 'left', 250, state.changedAt);
  assert.equal(state.direction, 'up');
  state = stabilizePatrolDirection(state.direction, 'left', MENDIGA_VISUAL.directionChangeCooldownMs,
    state.changedAt);
  assert.equal(state.direction, 'left');
  state = stabilizePatrolDirection(state.direction, 'down', 500, state.changedAt);
  assert.equal(state.direction, 'left');
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

test('NPC chooses collision-aware destinations, walks, pauses and cleans up', () => {
  const animations = [];
  const sprite = {x: 0, y: 0, setOrigin() {return this;}, setScale() {return this;},
    setDepth() {return this;}, setPosition(x, y) {this.x = x; this.y = y; return this;},
    setTexture(texture, frame) {this.texture = texture; this.frame = frame; return this;},
    play(key) {this.key = key; return this;}, stop() {this.stopped = true; return this;},
    destroy() {this.destroyed = true;}};
  const scene = {source, add: {sprite(x, y) {return sprite.setPosition(x, y);}}, anims: {
    exists() {return false;}, create(config) {animations.push(config);},
    generateFrameNumbers(texture, range) {return range;},
  }};
  const npc = new MendigaNpc(scene, {random: () => 0.5});
  assert.equal(animations.length, 4);
  assert.deepEqual(animations[1].frames, {start: 4, end: 7});
  assert.ok(animations.every(animation => animation.repeat === -1));
  assert.ok(npc.path.length > 5);
  const firstTarget = npc.path[0];
  npc.update(0, 100);
  assert.ok(sprite.key.startsWith('outside-mendiga-walk-'));
  assert.ok(sprite.x !== 400 || sprite.y !== 416);
  let time = 100;
  sprite.setPosition(firstTarget.x, firstTarget.y);
  npc.update(time, 100);
  while (npc.path.length) {
    const target = npc.path[0];
    sprite.setPosition(target.x, target.y);
    time += 100;
    npc.update(time, 100);
  }
  assert.equal(npc.path.length, 0);
  assert.equal(sprite.stopped, true);
  npc.update(time + 200, 100);
  assert.equal(npc.path.length, 0, 'NPC pauses briefly at each destination');
  npc.update(time + 400, 100);
  assert.ok(npc.path.length > 0, 'NPC selects a fresh walkable destination after pausing');
  npc.destroy();
  assert.equal(sprite.destroyed, true);
  npc.update(500, 100);
});

test('interaction stops the beggar and sets her idle frame toward the player temporarily', () => {
  const sprite = {x: 400, y: 416, setOrigin() {return this;}, setScale() {return this;}, setDepth() {return this;},
    setPosition(x, y) {this.x = x; this.y = y; return this;}, setTexture(texture, frame) {this.texture = texture; this.frame = frame; return this;},
    play() {this.walking = true; return this;}, stop() {this.walking = false; return this;}, destroy() {}};
  const scene = {source, add: {sprite() {return sprite;}}, anims: {exists() {return true;}, create() {}, generateFrameNumbers() {return {};}}};
  const npc = new MendigaNpc(scene);
  npc.update(0, 100);
  npc.lookAtPlayer({x: 400, y: 300}, 100, 6000);
  npc.update(200, 100);
  assert.equal(sprite.walking, false);
  assert.equal(sprite.texture, MENDIGA_VISUAL.texture);
  assert.equal(sprite.frame, 12, 'looking up uses the idle frame in the up row');
  const heldPosition = {x: sprite.x, y: sprite.y};
  npc.update(6099, 100);
  assert.deepEqual({x: sprite.x, y: sprite.y}, heldPosition);
  npc.update(6100, 100);
  assert.ok(npc.path.length > 0, 'wandering resumes after the look-at pause');
});

test('missing patrol does not create an NPC or invent coordinates', () => {
  const npc = new MendigaNpc({source: {layers: []}});
  npc.update(0, 16);
  npc.destroy();
  assert.equal(npc.sprite, null);
});
