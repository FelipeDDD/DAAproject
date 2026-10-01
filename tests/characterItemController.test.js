import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHARACTER_ITEM_IDS,characterItemDefinition,isCharacterItemEnabled,normalizeCharacterItem } from '../src/inventory/characterItems.js';
import { baseCharacterId } from '../src/characters.js';
import { readNamedMapMarker } from '../src/maps/namedMapMarkers.js';

// Exercise the real controller with a minimal scene; Phaser's renderer needs a browser.
const source=readFileSync(new URL('../src/inventory/CharacterItemController.js',import.meta.url),'utf8')
  .replace(/^import .*;\r?\n/gm,'').replace('export const ','const ').replace('export class ','class ');
const Controller=new Function('Phaser','CHARACTER_ITEM_IDS','characterItemDefinition','isCharacterItemEnabled','normalizeCharacterItem','CharacterItemClient','ItemRewardOverlay','baseCharacterId','readNamedMapMarker',
  `${source}\nreturn CharacterItemController;`)(
  {Animations:{Events:{ANIMATION_COMPLETE:'complete'}}},CHARACTER_ITEM_IDS,characterItemDefinition,isCharacterItemEnabled,normalizeCharacterItem,class {},class {destroy(){}},baseCharacterId,readNamedMapMarker);

function fixture(){
  let finish;const animations=[];const visuals=[];const spawned=[];const labels=[];
  const sprite={active:true,setOrigin(){return this;},setDisplaySize(width,height){this.displaySize={width,height};return this;},setDepth(){return this;},
    setInteractive(){return this;},setVisible(value){this.visible=value;return this;},on(){return this;},once(event,fn){finish=fn;},play(){},destroy(){this.destroyed=true;this.active=false;}};
  const player={x:100,y:150,setVelocity(){},setVisible(value){this.visible=value;}};
  const scene={player,source:{tilewidth:32,tileheight:32},equippedSkin:'remastered',hint:{},add:{sprite:()=>sprite,
    image:(...args)=>{const image={...sprite,x:args[0],y:args[1],texture:args[2]};spawned.push(image);return image;},
    text:(x,y,text)=>{const label={x,y,text,destroyed:false,setOrigin(){return this;},setDepth(){return this;},setText(value){this.text=value;},destroy(){this.destroyed=true;}};labels.push(label);return label;}},anims:{exists:()=>false,
    create:config=>animations.push(config),generateFrameNumbers:(key,range)=>range}};
  const c=new Controller(scene,{identity:{characterId:'michael'}},{onVisualChange:(...args)=>visuals.push(args)});
  c.pickup={setVisible(value){this.visible=value;},destroy(){}};
  return {c,player,sprite,animations,visuals,spawned,labels,finish:()=>finish()};
}

test('disabled Michael cigarette stays hidden and cannot start its transformation',async()=>{
  const f=fixture();
  f.c.setItems([{characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:true,quantity:1}]);
  assert.equal(f.c.items.length,0);assert.equal(f.c.pickup.visible,false);
  await f.c.applyActiveItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:true});
  assert.equal(f.c.items.length,0);assert.equal(f.player.visible,undefined);
  assert.equal(f.animations.length,0);assert.equal(f.visuals.at(-1)[0],null);
  assert.equal(f.c.spawnDevPickup(CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000),null);
});

test('the Tiled cigarette pack pickup claims its own ID without granting Michael equipment',async()=>{
  const f=fixture();f.c.scene.mapKey='school';const cards=[];f.c.onItemCollected=item=>cards.push(item);
  const marker={layers:[{type:'objectgroup',name:'Notes',objects:[{id:17,name:'lung-crusher',point:true,x:320,y:240}]}]};
  const pickup=f.c.createCollectiblePickup(marker);
  assert.deepEqual([pickup.x,pickup.y],[320,240]);
  assert.equal(pickup.itemId,CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK);
  assert.equal(pickup.sprite.texture,'lung-crusher-pack-ground');
  assert.deepEqual(pickup.sprite.displaySize,{width:8,height:9});
  const claims=[];f.c.client={claim:async itemId=>{claims.push(itemId);return {item:{itemId,quantity:1}};}};
  assert.equal(await f.c.collect(pickup),true);
  assert.deepEqual(claims,[CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK]);
  assert.equal(pickup.sprite.visible,false);
  assert.equal(f.c.lungCrusher,undefined);
  assert.equal(f.c.items[0].useBehavior,'presentation');
  assert.equal(cards[0].itemId,CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK);
  assert.equal(cards[0].presentationImage,'assets/items/lung-crusher-3000.png');
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
  assert.equal(f.c.spawnDevPickup(CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000),null,'disabled equipment never spawns');
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
  assert.deepEqual(f.c.items.map(item=>item.itemId),[]);
});
