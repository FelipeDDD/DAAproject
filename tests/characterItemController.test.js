import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTER_ITEM_IDS,characterItemDefinition,normalizeCharacterItem } from '../src/inventory/characterItems.js';

// Exercise the real controller with a minimal scene; Phaser's renderer needs a browser.
const source=readFileSync(new URL('../src/inventory/CharacterItemController.js',import.meta.url),'utf8')
  .replace(/^import .*;\r?\n/gm,'').replace('export const ','const ').replace('export class ','class ');
const Controller=new Function('Phaser','CHARACTER_ITEM_IDS','characterItemDefinition','normalizeCharacterItem','CharacterItemClient','ItemRewardOverlay',
  `${source}\nreturn CharacterItemController;`)(
  {Animations:{Events:{ANIMATION_COMPLETE:'complete'}}},CHARACTER_ITEM_IDS,characterItemDefinition,normalizeCharacterItem,class {},class {destroy(){}});

function fixture(){
  let finish;const animations=[];const visuals=[];
  const sprite={setOrigin(){return this;},setDisplaySize(){return this;},setDepth(){return this;},
    once(event,fn){finish=fn;},play(){},destroy(){this.destroyed=true;}};
  const player={x:100,y:150,setVelocity(){},setVisible(value){this.visible=value;}};
  const scene={player,equippedSkin:'remastered',hint:{},add:{sprite:()=>sprite},anims:{exists:()=>false,
    create:config=>animations.push(config),generateFrameNumbers:(key,range)=>range}};
  const c=new Controller(scene,{identity:{characterId:'michael'}},{onVisualChange:(...args)=>visuals.push(args)});
  c.pickup={setVisible(value){this.visible=value;},destroy(){}};
  return {c,player,sprite,animations,visuals,finish:()=>finish()};
}

test('transformation keeps the owned item and hides pickup before and after completion',async()=>{
  const f=fixture();
  const pending=f.c.applyActiveItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:true});
  assert.equal(f.c.items.length,1);assert.equal(f.c.pickup.visible,false);assert.equal(f.player.visible,false);
  assert.deepEqual(f.animations[0].frames,{start:0,end:5});
  f.finish();await pending;
  assert.equal(f.c.items.length,1);assert.equal(f.c.pickup.visible,false);assert.equal(f.player.visible,true);
  await f.c.applyActiveItem({...f.c.items[0],active:false});
  assert.equal(f.c.items.length,1);assert.equal(f.c.pickup.visible,false);
  assert.equal(f.visuals.at(-1)[1].restoreSkin,'remastered');
});

test('leaving during transformation destroys sprite and prevents stale visual changes',async()=>{
  const f=fixture();const pending=f.c.applyActiveItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:true});
  f.c.destroy();await pending;
  assert.equal(f.sprite.destroyed,true);assert.equal(f.player.visible,true);
  assert.equal(f.c.transforming,null);assert.equal(f.visuals.length,0);
});
