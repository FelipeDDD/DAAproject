import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyDirectorRewardChoice,applyDirectorVictory,BOSS_REWARDS } from '../src/boss/BossRewards.js';
import {
  INVENTORY_SLOT_COUNT,ITEM_CATALOG,inventoryItemUseBehavior,inventoryItemsFromBossProgress,inventoryItemsFromSources,inventoryPresentationAsset,inventoryShortcutSlot,inventorySlots,normalizeInventoryItems,
} from '../src/inventory/config.js';
import { CHARACTER_ITEM_COOLDOWN_MS,CHARACTER_ITEM_IDS,canCharacterOwnItem,itemCooldownRemaining,normalizeCharacterItem } from '../src/inventory/characterItems.js';

test('inventory starts with six empty slots and the badge appears only after its real unlock',()=>{
  assert.deepEqual(inventorySlots(inventoryItemsFromBossProgress(null)),Array(INVENTORY_SLOT_COUNT).fill(null));
  const victory=applyDirectorVictory(null,'michael').progress;
  const skin=applyDirectorRewardChoice(victory,BOSS_REWARDS.REMASTERED_SKIN).progress;
  assert.equal(inventoryItemsFromBossProgress(skin).length,0);
  const badge=applyDirectorRewardChoice(applyDirectorVictory(null,'felipe').progress,
    BOSS_REWARDS.DIRECTOR_ACCESS_BADGE).progress;
  assert.deepEqual(inventoryItemsFromBossProgress(badge),[ITEM_CATALOG.director_access_badge]);
});

test('unique inventory items cannot occupy duplicate hotbar slots',()=>{
  const badge=ITEM_CATALOG.director_access_badge;
  const items=normalizeInventoryItems([badge,{...badge,quantity:4}]);
  assert.equal(items.length,1);assert.equal(items[0].quantity,1);
  assert.equal(inventorySlots(items).filter(Boolean).length,1);
});

test('functional items fill from slot one while presentation items fill backward from slot six',()=>{
  const cigarette=normalizeCharacterItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:false});
  const badge=ITEM_CATALOG.director_access_badge;
  const slots=inventorySlots([badge,cigarette]);
  assert.equal(slots[0].itemId,CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000);
  assert.equal(slots[5].itemId,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE);
  assert.deepEqual(slots.slice(1,5),[null,null,null,null]);
  assert.equal(inventoryItemUseBehavior(cigarette),'functional');
  assert.equal(inventoryItemUseBehavior(badge),'presentation');
  assert.equal(inventoryPresentationAsset(badge),badge.presentationImage);
});

test('additional presentation items descend from the last inventory slot',()=>{
  const first=ITEM_CATALOG.director_access_badge;
  const second={itemId:'class_photo',type:'quest',quantity:1,icon:'assets/photo.png',name:'Class photo',description:'A memory.'};
  const slots=inventorySlots([first,second]);
  assert.equal(slots[5].itemId,first.itemId);assert.equal(slots[4].itemId,second.itemId);
  assert.equal(inventoryItemUseBehavior(second),'presentation');
  assert.equal(inventoryPresentationAsset(second),second.icon);
});

test('badge metadata provides its key type, icon and tooltip copy',()=>{
  const badge=ITEM_CATALOG.director_access_badge;
  assert.equal(badge.type,'key');assert.equal(badge.quantity,1);
  assert.match(badge.icon,/school-key\.png$/);assert.equal(badge.name,'Director Access Badge');
  assert.equal(badge.description,'Opens restricted school areas.');
});

test('Lung Crusher uses its centered square hotbar icon',()=>{
  const item=ITEM_CATALOG[CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000];
  assert.match(item.icon,/lung-crusher-slot-icon\.png$/);
  const png=readFileSync(new URL(`../public/${item.icon}`,import.meta.url));
  assert.equal(png.readUInt32BE(16),362);assert.equal(png.readUInt32BE(20),362);
});

test('profile items remain owned across characters but activate only for their configured character',()=>{
  const itemId=CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000;
  assert.equal(canCharacterOwnItem('michael',itemId),true);assert.equal(canCharacterOwnItem('sarina',itemId),false);
  const incompatible=normalizeCharacterItem({characterId:'michael',itemId,active:true},'felipe');
  assert.equal(incompatible.compatible,false);assert.equal(incompatible.active,false);
  const item=normalizeCharacterItem({characterId:'michael',itemId,active:true,cooldownUntil:12_000});
  assert.equal(item.type,'character_item');assert.equal(item.active,true);
  assert.equal(inventoryItemsFromSources(null,[item,{...item}], 'michael').filter(Boolean).length,1);
});

test('character-item cooldown is centralized and prevents immediate reactivation',()=>{
  const item={cooldownUntil:10_000+CHARACTER_ITEM_COOLDOWN_MS};
  assert.equal(itemCooldownRemaining(item,10_000),CHARACTER_ITEM_COOLDOWN_MS);
  assert.equal(itemCooldownRemaining(item,10_000+CHARACTER_ITEM_COOLDOWN_MS),0);
});

test('collected item survives repeated normalization when activated and deactivated',()=>{
  let item={characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:false,cooldownUntil:0};
  for(const active of [false,true,false,true]){
    item=normalizeCharacterItem({...item,active});
    const controllerItems=[item].map(normalizeCharacterItem).filter(Boolean);
    assert.equal(controllerItems.length,1,'owned item must not become a ground pickup');
    assert.equal(controllerItems[0].characterId,'michael');
    const slots=inventorySlots(inventoryItemsFromSources(null,controllerItems,'michael'));
    assert.equal(slots.filter(Boolean).length,1);
    assert.equal(slots[0].active,active);
  }
});

test('inventory shortcuts use Shift plus the top-row digits only',()=>{
  const base={repeat:false,shiftKey:true,ctrlKey:false,altKey:false,metaKey:false,target:{closest:()=>null}};
  assert.equal(inventoryShortcutSlot({...base,code:'Digit1'},null),0);
  assert.equal(inventoryShortcutSlot({...base,code:'Digit6'},null),5);
  assert.equal(inventoryShortcutSlot({...base,shiftKey:false,code:'Digit2'},null),-1);
  assert.equal(inventoryShortcutSlot({...base,code:'Numpad2'},null),-1);
});
