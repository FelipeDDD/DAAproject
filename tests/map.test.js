import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readDoors } from '../src/maps/doors.js';
import { tileObjectFrame } from '../src/maps/tiledTileObjects.js';

const map = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));
const classroomDoors = readDoors(map);
const collision = map.layers.find((layer) => layer.name === 'Collision');
const blocked = (x, y) => collision.objects.some((area) =>
  x * map.tilewidth >= area.x && x * map.tilewidth < area.x + area.width &&
  y * map.tileheight >= area.y && y * map.tileheight < area.y + area.height);

test('maps keep their required layers and the classroom supports object decoration', () => {
  const empty = JSON.parse(readFileSync(new URL('../public/assets/maps/outside.tmj', import.meta.url)));
  const required = [
    ['Floor', 'tilelayer'], ['Walls', 'tilelayer'], ['Decoration', 'tilelayer'],
    ['Entities', 'objectgroup'], ['Collision', 'objectgroup'], ['Doors', 'objectgroup'],
    ['Spawns', 'objectgroup'], ['Notes', 'objectgroup'],
  ];
  for (const source of [map, empty]) {
    const layers = source.layers.map((layer) => [layer.name, layer.type]);
    for (const layer of required) assert.ok(layers.some((entry) => entry[0] === layer[0] && entry[1] === layer[1]));
    const ids = source.layers.flatMap((layer) => (layer.objects ?? []).map((object) => object.id));
    assert.equal(new Set(ids).size, ids.length, 'Tiled object IDs must remain unique');
  }
  assert.equal(map.layers.find((layer) => layer.name === 'objectDecoration')?.type, 'objectgroup');
});

test('objectDecoration contains visual tile objects without owning collision', () => {
  const decorationObjects = map.layers.find((layer) => layer.name === 'objectDecoration')?.objects ?? [];
  assert.ok(decorationObjects.length > 0);
  assert.ok(decorationObjects.every((object) => object.gid));
  assert.ok(decorationObjects.every((object) => !object.properties?.some((property) => property.name === 'collides' && property.value)));
  for (const object of decorationObjects) {
    const resolved = tileObjectFrame(object.gid, map.tilesets.map((tileset, index, all) => ({
      ...tileset,
      tilecount: index + 1 < all.length ? all[index + 1].firstgid - tileset.firstgid : 18,
    })));
    assert.ok(resolved, `Missing tileset frame for object ${object.id}`);
  }
});

test('tile object frames strip Tiled flip flags without changing the local frame', () => {
  const tilesets = [{ firstgid: 1, tilecount: 10 }, { firstgid: 20, tilecount: 18 }];
  assert.deepEqual(tileObjectFrame(25, tilesets), { tilesetIndex: 1, frame: 5 });
  assert.deepEqual(tileObjectFrame((25 | 0x80000000) >>> 0, tilesets), { tilesetIndex: 1, frame: 5 });
});

test('visual tiles moved into notes are preserved in Decoration with their annotations', () => {
  const decoration = map.layers.find((layer) => layer.name === 'Decoration');
  const notes = map.layers.find((layer) => layer.name === 'Notes');
  for (const object of notes.objects) {
    const gid = object.properties?.find((prop) => prop.name === 'originalGid')?.value;
    if (!gid) continue;
    const index = (object.y / map.tileheight) * map.width + object.x / map.tilewidth;
    assert.equal(decoration.data[index], gid);
    assert.equal(object.properties.find((prop) => prop.name === 'replaceWith').value, 'sink');
  }
});

test('Collision is a separate object layer with all six desk footprints', () => {
  // Editor visibility is independent of the non-rendering physics zones in-game.
  assert.equal(collision.type, 'objectgroup');
  for (const x of [26, 30, 34]) {
    for (const y of [17, 25]) {
      for (let dx = 0; dx < 2; dx++) {
        for (let dy = 0; dy < 4; dy++) assert.equal(blocked(x + dx, y + dy), true);
      }
    }
  }
  assert.equal(blocked(22, 24), false, 'spawn must be free');
});

test('doorways have no permanent collision tiles', () => {
  for (const door of classroomDoors) {
    for (let y = door.y; y < door.y + door.height; y += 32) {
      for (let x = door.x; x < door.x + door.width; x += 32) {
        assert.equal(blocked(x / 32, y / 32), false, door.id);
      }
    }
  }
});

// Tile-center reachability checks the authored layout, not a substitute for a physics playtest.
function canReach(target, closedDoors) {
  const pending = [[22, 24]];
  const visited = new Set();
  while (pending.length) {
    const [x, y] = pending.shift();
    const key = `${x},${y}`;
    if (x < 0 || y < 0 || x >= map.width || y >= map.height || visited.has(key) || blocked(x, y)) continue;
    visited.add(key);
    if (closedDoors.some((door) =>
      x * 32 >= door.x && x * 32 < door.x + door.width &&
      y * 32 >= door.y && y * 32 < door.y + door.height)) continue;
    if (x === target[0] && y === target[1]) return true;
    pending.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }
  return false;
}

test('classroom exit cannot be bypassed when closed and opens to the corridor', () => {
  assert.equal(canReach([19, 14], classroomDoors.filter(d => d.id.startsWith('note-door-'))), false);
  assert.equal(canReach([19, 14], []), true);
});

test('bathroom is reachable only after its doorway is opened', () => {
  assert.equal(canReach([12, 6], classroomDoors.filter(d => d.id === 'bathroom-entry')), false);
  assert.equal(canReach([12, 6], []), true);
});
