import { BOSS_REWARDS,hasBossReward,normalizeBossProgress } from '../boss/BossRewards.js';

export const INVENTORY_SLOT_COUNT=6;
export const INVENTORY_POSITION_STORAGE_KEY='daa-inventory-bar-position';
export const ITEM_TYPES=Object.freeze(['key','quest','consumable']);
export const ITEM_CATALOG=Object.freeze({
  [BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]:Object.freeze({
    itemId:BOSS_REWARDS.DIRECTOR_ACCESS_BADGE,type:'key',quantity:1,
    icon:'assets/school-key.png',name:'Director Access Badge',description:'Opens restricted school areas.',
  }),
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

export function inventorySlots(items,count=INVENTORY_SLOT_COUNT){
  const normalized=normalizeInventoryItems(items).slice(0,count);
  return Array.from({length:count},(_,index)=>normalized[index]??null);
}
