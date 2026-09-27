import { baseCharacterId } from '../characters.js';

export const CHARACTER_ITEM_IDS=Object.freeze({LUNG_CRUSHER_3000:'lung_crusher_3000',OFFICE2_KEY:'office2_key'});
export const CHARACTER_ITEM_COOLDOWN_MS=10_000;

export const CHARACTER_ITEMS=Object.freeze({
  [CHARACTER_ITEM_IDS.OFFICE2_KEY]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.OFFICE2_KEY,type:'key',quantity:1,
    name:'Office 2 Key',description:"Opens the Director's office.",
    icon:'assets/items/key-office.png',useBehavior:'presentation',
  }),
  [CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,type:'character_item',quantity:1,
    allowedCharacterBaseId:'michael',name:'Lung Crusher 3000',
    description:'A very large cigarette. Click to activate or deactivate.',
    icon:'assets/items/lung-crusher-slot-icon.png',presentationImage:'assets/items/lung-crusher-3000.png',
    activatable:true,useBehavior:'functional',
  }),
});

export function characterItemDefinition(itemId){return CHARACTER_ITEMS[itemId]??null;}
export function canCharacterOwnItem(characterBaseId,itemId){
  const item=characterItemDefinition(itemId);
  return Boolean(item&&(item.allowedCharacterBaseId===undefined||item.allowedCharacterBaseId===baseCharacterId(characterBaseId)));
}
export function normalizeCharacterItem(row,currentCharacterBaseId=row?.characterBaseId??row?.characterId){
  const item=characterItemDefinition(row?.itemId);
  if(!item)return null;
  const characterBaseId=typeof currentCharacterBaseId==='string'?baseCharacterId(currentCharacterBaseId):baseCharacterId(row?.characterBaseId??row?.characterId);
  const compatible=canCharacterOwnItem(characterBaseId,row.itemId);
  return {...item,characterBaseId,compatible,active:compatible&&Boolean(row.active),cooldownUntil:Math.max(0,Number(row.cooldownUntil)||0)};
}
export function characterInventoryItems(rows,characterBaseId){
  const unique=new Map();
  for(const row of rows??[]){
    const item=normalizeCharacterItem(row,characterBaseId);
    if(item&&!unique.has(item.itemId))unique.set(item.itemId,item);
  }
  return [...unique.values()];
}
export function itemCooldownRemaining(item,now=Date.now()){
  return Math.max(0,(Number(item?.cooldownUntil)||0)-now);
}
