import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CHARACTERS,baseCharacterId } from '../src/characters.js';
import {
  NEW_CHARACTER_FRAME,characterVisual,footBodyForVisual,idleFrame,normalizeCharacterStyle,
  preloadCharacterTextures,saveCharacterStyle,updateCharacterVisual,visualStyleForActiveItem,
  visualStyleForEquippedSkin,walkFrames,
} from '../src/characterVisuals.js';

const michael=CHARACTERS.find(character=>character.id==='michael');
const sarina=CHARACTERS.find(character=>character.id==='sarina');
const yassin=CHARACTERS.find(character=>character.id==='jassine');
const felipe=CHARACTERS.find(character=>character.id==='felipe');

test('new character sheets expose four directions with fixed idle and walk frames',()=>{
  assert.deepEqual(['down','left','right','up'].map(idleFrame),[0,6,12,18]);
  assert.deepEqual(walkFrames('down'),[2,3,4,5]);
  assert.deepEqual(walkFrames('up'),[20,21,22,23]);
});

test('new style applies to all four character test spritesheets',()=>{
  assert.equal(characterVisual(michael,'new').animated,true);
  assert.equal(characterVisual(sarina,'new').frameWidth,64);
  assert.equal(characterVisual(yassin,'new').animated,true);
  assert.equal(characterVisual(felipe,'new').style,'new');
  assert.equal(normalizeCharacterStyle('unknown'),'old');
});

test('ten selectable slots keep unique identities while reusing the four existing visuals',()=>{
  assert.equal(CHARACTERS.length,10);
  assert.equal(new Set(CHARACTERS.map(character=>character.id)).size,10);
  assert.equal(new Set(CHARACTERS.map(character=>character.newVisual.previewAsset)).size,4);
  for(const character of CHARACTERS){
    const original=CHARACTERS.find(item=>item.id===baseCharacterId(character.id));
    assert.equal(character.sprite,original.sprite);
    assert.equal(character.newVisual.previewAsset,original.newVisual.previewAsset);
  }
});

test('shared visuals are queued once when all ten slots preload',()=>{
  const loaded=[];
  const scene={textures:{exists:()=>false},load:{
    svg:key=>loaded.push(key),spritesheet:key=>loaded.push(key),
  }};
  preloadCharacterTextures(scene,CHARACTERS,'/');
  assert.equal(loaded.length,new Set(loaded).size);
  assert.equal(loaded.length,9); // Four classic, four Remastered, one Michael item sheet.
});

test('style preference persists with a safe old-style fallback',()=>{
  const values=new Map();const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  assert.equal(saveCharacterStyle('new',storage),'new');
  assert.equal([...values.values()][0],'new');
  assert.equal(saveCharacterStyle('invalid',storage),'old');
});

test('persistent equipped skin defaults to Classic and only Remastered selects new art',()=>{
  assert.equal(visualStyleForEquippedSkin(undefined),'old');
  assert.equal(visualStyleForEquippedSkin('classic'),'old');
  assert.equal(visualStyleForEquippedSkin('remastered'),'new');
  assert.equal(visualStyleForActiveItem('lung_crusher_3000','classic'),'lungCrusher');
  assert.equal(visualStyleForActiveItem(null,'remastered'),'new');
});

test('Michael has a separate normalized Lung Crusher walking sheet',()=>{
  const visual=characterVisual(michael,'lungCrusher');
  assert.equal(visual.sprite,'character-michael-lung-crusher');assert.equal(visual.animated,true);
  const png=readFileSync(new URL('../public/assets/characters/michael-bigzig-normalized.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),96*6);
  assert.equal(png.readUInt32BE(20),NEW_CHARACTER_FRAME.height*4);
});

test('wide Lung Crusher art keeps the same small foot-only collision body',()=>{
  const normal=characterVisual(michael,'new'),lungCrusher=characterVisual(michael,'lungCrusher');
  const normalBody=footBodyForVisual(normal),lungBody=footBodyForVisual(lungCrusher);
  assert.equal(normalBody.width*normal.scale,lungBody.width*lungCrusher.scale);
  assert.equal(normalBody.height*normal.scale,lungBody.height*lungCrusher.scale);
  assert.equal(lungBody.offsetY+lungBody.height,lungCrusher.frameHeight);
});

test('old and new art retain the same world-space foot hitbox',()=>{
  const oldVisual=characterVisual(michael,'old'),newVisual=characterVisual(michael,'new');
  const oldBody=footBodyForVisual(oldVisual),newBody=footBodyForVisual(newVisual);
  assert.equal(oldBody.width*oldVisual.scale,newBody.width*newVisual.scale);
  assert.equal(oldBody.height*oldVisual.scale,newBody.height*newVisual.scale);
  assert.equal(newBody.offsetY+newBody.height,NEW_CHARACTER_FRAME.height);
});

test('direction changes choose animations without mirroring new art',()=>{
  const calls=[];const sprite={
    anims:{play:(key)=>calls.push(['play',key]),stop:()=>calls.push(['stop'])},
    setFlipX:value=>calls.push(['flip',value]),setFrame:value=>calls.push(['frame',value]),
  };
  const visual=characterVisual(michael,'new');
  updateCharacterVisual(sprite,visual,'left',true);
  updateCharacterVisual(sprite,visual,'right',false);
  assert.deepEqual(calls,[
    ['flip',false],['play','character-michael-new-walk-left'],
    ['flip',false],['play','character-michael-new-idle-right'],
  ]);
});

test('normalized PNG sheets contain exactly 24 frames of 64 by 72',()=>{
  for(const file of [
    'public/assets/characters/michael-new.png','public/assets/characters/sarina-new.png',
    'public/assets/characters/yassin-new.png','public/assets/characters/felipe-new.png',
  ]){
    const png=readFileSync(new URL(`../${file}`,import.meta.url));
    assert.equal(png.toString('ascii',1,4),'PNG');
    assert.equal(png.readUInt32BE(16),NEW_CHARACTER_FRAME.width*6);
    assert.equal(png.readUInt32BE(20),NEW_CHARACTER_FRAME.height*4);
  }
});
