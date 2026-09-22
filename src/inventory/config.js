import { BOSS_REWARDS,hasBossReward,normalizeBossProgress } from '../boss/BossRewards.js';
import { CHARACTER_ITEMS,characterInventoryItems } from './characterItems.js';

export const INVENTORY_SLOT_COUNT=6;
export const INVENTORY_POSITION_STORAGE_KEY='daa-inventory-bar-position';
export const ITEM_TYPES=Object.freeze(['key','quest','consumable','character_item']);
export const ITEM_CATALOG=Object.freeze({
  [BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]:Object.freeze({
    itemId:BOSS_REWARDS.DIRECTOR_ACCESS_BADGE,type:'key',quantity:1,
    icon:'assets/school-key.png',presentationImage:'assets/school-key.png',useBehavior:'presentation',
    name:'Director Access Badge',description:'Opens restricted school areas.',
  }),
  ...CHARACTER_ITEMS,
});

export function normalizeInventoryItems(items){
  const unique=new Map();
  for(const item of items??[]){
    if(!item?.itemId||!ITEM_TYPES.includes(item.type)||unique.has(item.itemId))continue;
    unique.set(item.itemId,{...item,quantity:Math.max(1,Number(item.quantity)||1)});
  }
  return [...unique.values()];
}

export function inventoryItemsFromBossProgress(progress){
  const normalized=normalizeBossProgress(progress);
  return normalizeInventoryItems(hasBossReward(normalized,BOSS_REWARDS.DIRECTOR_ACCESS_BADGE)
    ?[ITEM_CATALOG[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]]:[]);
}

export function inventoryItemsFromSources(progress,characterItems,characterId){
  return normalizeInventoryItems([...inventoryItemsFromBossProgress(progress),...characterInventoryItems(characterItems,characterId)]);
}

export function inventorySlots(items,count=INVENTORY_SLOT_COUNT){
  const slots=Array(count).fill(null);
  const normalized=normalizeInventoryItems(items);
  const functional=normalized.filter(item=>item.useBehavior==='functional'||item.activatable);
  const presentable=normalized.filter(item=>!functional.includes(item));
  functional.slice(0,count).forEach((item,index)=>{slots[index]=item;});
  let index=count-1;
  for(const item of presentable){
    while(index>=0&&slots[index])index--;
    if(index<0)break;
    slots[index--]=item;
  }
  return slots;
}

export function inventoryItemUseBehavior(item){
  if(item?.useBehavior==='functional'||item?.activatable)return 'functional';
  return item?.useBehavior==='presentation'||item?.presentationImage||item?.icon?'presentation':null;
}

export function inventoryPresentationAsset(item){return item?.presentationImage??item?.icon??'';}

export function inventoryShortcutSlot(event,activeElement=globalThis.document?.activeElement){
  const editable=element=>Boolean(element?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""]'));
  if(event.repeat||!event.shiftKey||event.ctrlKey||event.altKey||event.metaKey||editable(event.target)||editable(activeElement))return -1;
  const match=/^Digit([1-6])$/.exec(event.code??'');
  return match?Number(match[1])-1:-1;
}
