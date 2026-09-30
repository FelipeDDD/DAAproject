import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyDirectorRewardChoice,applyDirectorVictory,BOSS_REWARDS } from '../src/boss/BossRewards.js';
import {
  INVENTORY_SLOT_COUNT,ITEM_CATALOG,inventoryItemUseBehavior,inventoryItemsFromBossProgress,inventoryItemsFromSources,inventoryPresentationAsset,inventoryShortcutSlot,inventorySlots,isHealthPotionShortcut,normalizeInventoryItems,
} from '../src/inventory/config.js';
import { InventoryHotbar } from '../src/inventory/InventoryHotbar.js';
import { CHARACTER_ITEM_COOLDOWN_MS,CHARACTER_ITEM_IDS,canCharacterOwnItem,itemAppearanceForCharacter,itemCooldownRemaining,normalizeCharacterItem } from '../src/inventory/characterItems.js';

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
  assert.equal(inventoryItemUseBehavior(badge),'presentation');
  assert.equal(inventoryItemUseBehavior(ITEM_CATALOG[CHARACTER_ITEM_IDS.OFFICE2_KEY]),'presentation');
});

test('Lung Crusher uses its centered square hotbar icon',()=>{
  const item=ITEM_CATALOG[CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000];
  assert.match(item.icon,/lung-crusher-slot-icon\.png$/);
  const png=readFileSync(new URL(`../public/${item.icon}`,import.meta.url));
  assert.equal(png.readUInt32BE(16),362);assert.equal(png.readUInt32BE(20),362);
});

test('the cigarette pack is a separate profile collectible in a presentation slot',()=>{
  const equipment=normalizeCharacterItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000});
  const pack=normalizeCharacterItem({characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK},'sarina');
  assert.notEqual(pack.itemId,equipment.itemId);
  assert.equal(pack.type,'quest');assert.equal(pack.compatible,true);
  assert.equal(inventoryItemUseBehavior(pack),'presentation');
  assert.equal(inventoryItemUseBehavior(equipment),'functional');
  assert.match(pack.description,/Eine mysteriöse Zigarettenschachtel/);
  assert.match(pack.icon,/lung-crusher-floor\.png$/);
  assert.match(pack.presentationImage,/lung-crusher-3000\.png$/);
  const slots=inventorySlots([pack,equipment]);
  assert.equal(slots[0].itemId,equipment.itemId);
  assert.equal(slots[5].itemId,pack.itemId);
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

test('health potion keeps shared behavior while Sarina gets her own sprite and card',()=>{
  const item=ITEM_CATALOG[CHARACTER_ITEM_IDS.HEALTH_POTION];
  const sarina=itemAppearanceForCharacter(item,'sarina');
  const michael=itemAppearanceForCharacter(item,'michael');
  assert.equal(sarina.icon,'assets/items/potion-sarina-inventory.png');
  assert.equal(sarina.presentationImage,'assets/items/potion-sarina.png');
  const icon=readFileSync(new URL(`../public/${sarina.icon}`,import.meta.url));
  assert.equal(icon.readUInt32BE(16),430);assert.equal(icon.readUInt32BE(20),430);
  assert.equal(michael.icon,'assets/items/potion-michael-inventory.png');
  assert.equal(michael.presentationImage,'assets/items/potion-michael.png');
  assert.equal(sarina.healAmount,michael.healAmount);
  assert.equal(sarina.cooldownMs,michael.cooldownMs);
  assert.equal(sarina.maxStack,michael.maxStack);
});

test('collected item survives repeated normalization when activated and deactivated',()=>{
  let item={characterId:'michael',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,active:false,cooldownUntil:0};
  for(const active of [false,true,false,true]){
    item=normalizeCharacterItem({...item,active});
    const controllerItems=[item].map(normalizeCharacterItem).filter(Boolean);
    assert.equal(controllerItems.length,1,'owned item must not become a ground pickup');
    assert.equal(controllerItems[0].characterBaseId,'michael');
    const slots=inventorySlots(inventoryItemsFromSources(null,controllerItems,'michael'));
    assert.equal(slots.filter(Boolean).length,1);
    assert.equal(slots[0].active,active);
  }
});

test('inventory shortcuts use unmodified top-row digits only',()=>{
  const base={repeat:false,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,target:{closest:()=>null}};
  assert.equal(inventoryShortcutSlot({...base,code:'Digit1'},null),0);
  assert.equal(inventoryShortcutSlot({...base,code:'Digit6'},null),5);
  assert.equal(inventoryShortcutSlot({...base,shiftKey:true,code:'Digit2'},null),-1);
  assert.equal(inventoryShortcutSlot({...base,code:'Numpad2'},null),-1);
});

test('1 remains the potion slot and top-row 0 or numpad 0 also activate only the potion',()=>{
  const previousDocument=globalThis.document;
  globalThis.document={activeElement:null,querySelector:()=>null};
  try{
    const potion=normalizeCharacterItem({characterBaseId:'felipe',itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,quantity:2,cooldownUntil:0});
    const hotbar=Object.create(InventoryHotbar.prototype);hotbar.slots=[potion];const used=[];
    hotbar.activate=item=>used.push(item.itemId);
    const key=code=>({code,repeat:false,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,target:{closest:()=>null},preventDefault(){this.prevented=true;}});
    const one=key('Digit1'),zero=key('Digit0'),numpadZero=key('Numpad0');
    hotbar.handleHotkey(one);hotbar.handleHotkey(zero);hotbar.handleHotkey(numpadZero);
    assert.deepEqual(used,[CHARACTER_ITEM_IDS.HEALTH_POTION,CHARACTER_ITEM_IDS.HEALTH_POTION,CHARACTER_ITEM_IDS.HEALTH_POTION]);
    assert.equal(one.prevented,true);assert.equal(zero.prevented,undefined);assert.equal(numpadZero.prevented,undefined);
    assert.equal(isHealthPotionShortcut(key('Digit0')),true);
    assert.equal(isHealthPotionShortcut(key('Digit0'),{closest:()=>({})}),false,'text inputs keep their own shortcuts');
    hotbar.slots=[normalizeCharacterItem({characterBaseId:'felipe',itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000})];
    const noPotion=key('Digit0');hotbar.handleHotkey(noPotion);
    assert.equal(used.length,3,'zero does not activate unrelated slot items');
  }finally{
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
});
