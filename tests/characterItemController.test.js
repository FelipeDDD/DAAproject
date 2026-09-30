import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTER_ITEM_IDS,characterItemDefinition,normalizeCharacterItem } from '../src/inventory/characterItems.js';
import { baseCharacterId } from '../src/characters.js';

// Exercise the real controller with a minimal scene; Phaser's renderer needs a browser.
const source=readFileSync(new URL('../src/inventory/CharacterItemController.js',import.meta.url),'utf8')
  .replace(/^import .*;\r?\n/gm,'').replace('export const ','const ').replace('export class ','class ');
const Controller=new Function('Phaser','CHARACTER_ITEM_IDS','characterItemDefinition','normalizeCharacterItem','CharacterItemClient','ItemRewardOverlay','baseCharacterId',
  `${source}\nreturn CharacterItemController;`)(
  {Animations:{Events:{ANIMATION_COMPLETE:'complete'}}},CHARACTER_ITEM_IDS,characterItemDefinition,normalizeCharacterItem,class {},class {destroy(){}},baseCharacterId);

function fixture(){
  let finish;const animations=[];const visuals=[];const spawned=[];const labels=[];
  const sprite={active:true,setOrigin(){return this;},setDisplaySize(width,height){this.displaySize={width,height};return this;},setDepth(){return this;},
    setInteractive(){return this;},on(){return this;},once(event,fn){finish=fn;},play(){},destroy(){this.destroyed=true;this.active=false;}};
  const player={x:100,y:150,setVelocity(){},setVisible(value){this.visible=value;}};
  const scene={player,source:{tilewidth:32,tileheight:32},equippedSkin:'remastered',hint:{},add:{sprite:()=>sprite,
    image:(...args)=>{const image={...sprite,x:args[0],y:args[1]};spawned.push(image);return image;},
    text:(x,y,text)=>{const label={x,y,text,destroyed:false,setOrigin(){return this;},setDepth(){return this;},setText(value){this.text=value;},destroy(){this.destroyed=true;}};labels.push(label);return label;}},anims:{exists:()=>false,
    create:config=>animations.push(config),generateFrameNumbers:(key,range)=>range}};
  const c=new Controller(scene,{identity:{characterId:'michael'}},{onVisualChange:(...args)=>visuals.push(args)});
  c.pickup={setVisible(value){this.visible=value;},destroy(){}};
  return {c,player,sprite,animations,visuals,spawned,labels,finish:()=>finish()};
}

test('transformation keeps the owned item and hides pickup before and after completion',async()=>{
  const f=fixture();
  const pending=f.c.applyActiveItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:true});
  assert.equal(f.c.items.length,1);assert.equal(f.c.pickup.visible,false);assert.equal(f.player.visible,false);
  assert.deepEqual(f.sprite.displaySize,{width:67,height:67});
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

test('full potion stack still opens the item card without collecting another potion',async()=>{
  const f=fixture();const presentations=[];
  f.c.onItemCollected=(item,options)=>presentations.push({item,options});
  f.c.client={claim:async()=>({full:true,item:{itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,quantity:10}})};
  const pickup={kind:'dev',itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,sprite:{active:true}};
  assert.equal(await f.c.collectDevPickup(pickup),false);
  assert.equal(presentations.length,1);
  assert.equal(presentations[0].item.quantity,10);
  assert.equal(presentations[0].options.eyebrow,'INVENTORY FULL');
  assert.equal(pickup.sprite.active,true);
});

test('identical items spawned on the same tile merge into one pickup with a count',()=>{
  const f=fixture();
  const first=f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  f.player.x=119;f.player.y=159;
  const second=f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  assert.equal(second,first);
  assert.equal(first.amount,2);
  assert.equal(f.c.devPickups.length,1);
  assert.equal(f.spawned.length,1);
  assert.equal(first.countLabel.text,'×2');
  f.player.x=132;
  assert.notEqual(f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION),first,'a different tile has its own pickup');
  f.player.x=100;
  assert.notEqual(f.c.spawnDevPickup(CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000),first,'a different item never merges');
});

test('one interaction claims the whole same-tile potion stack',async()=>{
  const f=fixture();const pickup=f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  const calls=[];
  f.c.client={claim:async(itemId,amount)=>{calls.push({itemId,amount});return {added:amount,item:{itemId,quantity:amount}};}};
  assert.equal(await f.c.collectDevPickup(pickup),true);
  assert.deepEqual(calls,[{itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,amount:2}]);
  assert.equal(pickup.sprite.destroyed,true);
  assert.equal(f.c.devPickups.length,0);
  assert.equal(f.c.items[0].quantity,2);
});

test('a stack above inventory capacity leaves its unclaimed remainder on the floor',async()=>{
  const f=fixture();const pickup=f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  f.c.spawnDevPickup(CHARACTER_ITEM_IDS.HEALTH_POTION);
  f.c.client={claim:async(itemId,amount)=>({added:1,item:{itemId,quantity:10}})};
  assert.equal(await f.c.collectDevPickup(pickup),true);
  assert.equal(pickup.amount,1);
  assert.equal(pickup.sprite.active,true);
  assert.equal(pickup.countLabel, null);
  assert.equal(f.c.devPickups.length,1);
});

test('clearing potions removes only the potion from the local hotbar state',async()=>{
  const f=fixture();
  f.c.setItems([
    {itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,quantity:10},
    {itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,quantity:1},
  ]);
  f.c.client={devClearPotions:async()=>({removed:10})};
  assert.equal(await f.c.clearHealthPotions(),10);
  assert.deepEqual(f.c.items.map(item=>item.itemId),[CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000]);
});
