import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { BACKGROUNDS,BACKGROUND_STORAGE_KEY,DEFAULT_BACKGROUND_ID,
  loadBackgroundId,normalizeBackgroundId,saveBackgroundId } from '../src/ui/backgroundSettings.js';

test('background choices are unique and every generated image is available',()=>{
  assert.equal(BACKGROUNDS.length,8);
  assert.equal(new Set(BACKGROUNDS.map(background=>background.id)).size,BACKGROUNDS.length);
  for(const background of BACKGROUNDS){
    const file=new URL(`../public/assets/backgrounds/${background.file}`,import.meta.url);
    assert.ok(fs.statSync(file).size>100_000);
  }
});

test('chosen background persists and an obsolete choice falls back to Slate Blueprint',()=>{
  assert.equal(DEFAULT_BACKGROUND_ID,'slate-blueprint');
  const items=new Map();
  const storage={getItem:key=>items.get(key),setItem:(key,value)=>items.set(key,value)};
  assert.equal(loadBackgroundId(storage),DEFAULT_BACKGROUND_ID);
  assert.equal(saveBackgroundId('gothic-charcoal',storage),'gothic-charcoal');
  assert.equal(items.get(BACKGROUND_STORAGE_KEY),'gothic-charcoal');
  assert.equal(loadBackgroundId(storage),'gothic-charcoal');
  assert.equal(normalizeBackgroundId('removed-background'),DEFAULT_BACKGROUND_ID);
});
