import test from 'node:test';
import assert from 'node:assert/strict';
import { applySmoothDecorativeTextureFilters } from '../src/maps/decorativeTextureFilters.js';

test('only the four high-resolution school prop textures get linear filtering', () => {
  const tilesets = [
    { name: 'school-floor' },
    { name: 'modern-beer-cans' },
    { name: 'modern-desk-plant' },
    { name: 'modern-sandwiches' },
    { name: 'modern-coffee-cups' },
    { name: 'school-walls' },
  ];
  const calls = [];
  const textureManager = {
    get(key) {
      return { setFilter(mode) { calls.push([key, mode]); } };
    },
  };

  const keys = applySmoothDecorativeTextureFilters({
    tilesets,
    textureManager,
    textureKeyPrefix: 'school-tileset-',
    linearFilter: 0,
  });

  assert.deepEqual(keys, [
    'school-tileset-1',
    'school-tileset-2',
    'school-tileset-3',
    'school-tileset-4',
  ]);
  assert.deepEqual(calls, keys.map((key) => [key, 0]));
});
