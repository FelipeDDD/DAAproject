import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CollectionsMenu } from '../src/collections/CollectionsMenu.js';
import { createPreviewCollections } from '../src/collections/catalog.js';

import { menuFixture } from './helpers/menuFixture.js';
const fixture=()=>menuFixture(CollectionsMenu);
const key=(value,type='keydown')=>({key:value,type,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}});

test('sample collections have stable IDs and valid existing assets without changing inventory data',()=>{
  const collections=createPreviewCollections(),items=collections[0].items;
  assert.equal(collections.length,4);assert.equal(new Set(items.map(item=>item.id)).size,items.length);
  assert.ok(items.some(item=>item.rarity==='rare'&&!item.unlocked));
  for(const item of items.filter(item=>item.image))assert.ok(readFileSync(new URL(`../public/${item.image}`,import.meta.url)).length);
  items[0].unlocked=false;assert.equal(createPreviewCollections()[0].items[0].unlocked,true);
});

test('overview navigates to the item grid, selection updates preview, and back returns to collections',()=>{
  const {menu,doc}=fixture();assert.equal(menu.open(),true);
  assert.equal(menu.body.querySelectorAll('button').length,4);assert.equal(menu.back.hidden,true);
  menu.body.querySelectorAll('button')[0].events.click();
  assert.equal(menu.collectionId,'cigarettes');assert.equal(menu.itemButtons.size,6);
  assert.equal(menu.selectedId,'lung-3000');assert.equal(menu.back.hidden,false);
  menu.itemButtons.get('lung-flying').events.click();
  assert.equal(menu.selectedId,'lung-flying');assert.equal(menu.itemButtons.get('lung-flying')['aria-pressed'],'true');
  assert.equal(menu.itemButtons.get('lung-3000')['aria-pressed'],'false');
  assert.match(menu.preview.querySelector('h3').textContent,/Flying/);
  assert.match(menu.preview.querySelector('img').src,/lung-crusher-3000-blue/);
  menu.back.events.click();assert.equal(menu.collectionId,null);assert.equal(menu.back.hidden,true);
  assert.equal(doc.activeElement,menu.body.querySelector('button'));
});

test('Escape returns from a collection page to the directory, then closes the inventory',()=>{
  const f=fixture();f.menu.open();f.menu.showCollection('cigarettes',false);
  const firstEscape=key('Escape');f.menu.handleKey(firstEscape);
  assert.equal(f.menu.active,true);assert.equal(f.menu.collectionId,null);
  assert.equal(f.menu.panel.dataset.view,'overview');
  f.menu.handleKey(key('Escape','keyup'));
  f.menu.handleKey(key('Escape'));
  assert.equal(f.menu.active,false);
});

test('the close button still closes immediately from a collection page',()=>{
  const f=fixture();f.menu.open();f.menu.showCollection('cigarettes',false);
  f.menu.closeButton.events.click();assert.equal(f.menu.active,false);
});

test('rare/locked items do not reveal their artwork, empty collections have a useful fallback',()=>{
  const {menu}=fixture();menu.open();menu.showCollection('cigarettes');menu.selectItem('rare-variant');
  assert.equal(menu.preview.dataset.rarity,'rare');assert.equal(menu.preview.querySelectorAll('img').length,0);
  assert.equal(menu.preview.children[0].textContent,'NOT DISCOVERED');
  menu.showCollection('weird-food');assert.equal(menu.body.querySelector('button'),undefined);
  assert.equal(menu.body.children[1].querySelector('h3').textContent,'Coming soon');
  menu.setCollections([{id:'empty',name:'Empty',items:[]}]);menu.showCollection('empty');
  assert.equal(menu.body.children[1].querySelector('h3').textContent,'No items yet');
});

test('live structured data updates preserve selection and can unlock an item without rebuilding the modal',()=>{
  const {menu}=fixture();menu.open();menu.showCollection('cigarettes');menu.selectItem('rare-variant');
  const data=createPreviewCollections();data[0].items.at(-1).unlocked=true;menu.setCollections(data);
  assert.equal(menu.selectedId,'rare-variant');assert.match(menu.preview.querySelector('img').src,/green/);
  const image=menu.preview.querySelector('img');image.events.error();
  assert.equal(menu.preview.querySelectorAll('img').length,0);assert.equal(menu.active,true);
  menu.setCollections([]);assert.equal(menu.collectionId,null);
});

test('modal stops held movement/pointer input, traps focus and consumes Escape keyup before restoring gameplay',()=>{
  const f=fixture();f.menu.open();assert.equal(f.stops,1);assert.equal(f.scene.input.enabled,false);
  assert.equal(f.scene.input.keyboard.enabled,false);assert.equal(f.doc.activeElement,f.menu.closeButton);
  const tab=key('Tab');f.menu.handleKey(tab);assert.ok(tab.prevented&&tab.stopped);
  assert.equal(f.doc.activeElement,f.menu.body.querySelector('button'));
  const hotkey=key('1');f.menu.handleKey(hotkey);assert.equal(hotkey.stopped,true);
  const escape=key('Escape');f.menu.handleKey(escape);
  assert.equal(f.menu.active,false);assert.equal(f.scene.input.enabled,true);assert.equal(f.scene.input.keyboard.enabled,true);
  assert.equal(f.doc.activeElement,f.game);assert.equal(f.resets,2);
  const up=key('Escape','keyup');f.menu.handleKey(up);assert.ok(up.prevented&&up.stopped);
  f.frames.forEach(fn=>fn());assert.equal(f.doc.activeElement,f.game);
  f.menu.open();f.menu.destroy();assert.equal(f.listeners.size,0);assert.equal(f.menu.root.removed,true);
  assert.equal(f.scene.input.keyboard.enabled,true);
});

test('collections respects other modal sessions and restores an already disabled keyboard unchanged',()=>{
  const f=fixture();f.scene.puzzleTerminal={active:true};assert.equal(f.menu.open(),false);
  f.scene.puzzleTerminal.active=false;f.scene.input.keyboard.enabled=false;
  f.menu.open();f.menu.close();assert.equal(f.scene.input.keyboard.enabled,false);
  f.doc.querySelector=()=>({});assert.equal(f.menu.open(),false);
});
