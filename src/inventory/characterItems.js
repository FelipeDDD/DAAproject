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
    allowedCharacter:'michael',name:'Lung Crusher 3000',
    description:'A very large cigarette. Click to activate or deactivate.',
    icon:'assets/items/lung-crusher-slot-icon.png',presentationImage:'assets/items/lung-crusher-3000.png',
    activatable:true,useBehavior:'functional',
  }),
});

export function characterItemDefinition(itemId){return CHARACTER_ITEMS[itemId]??null;}
export function canCharacterOwnItem(characterId,itemId){
  const item=characterItemDefinition(itemId);
  return Boolean(item&&(item.allowedCharacter===undefined||item.allowedCharacter===baseCharacterId(characterId)));
}
export function normalizeCharacterItem(row,currentCharacterId=row?.characterId){
  const item=characterItemDefinition(row?.itemId);
  if(!item)return null;
  const selectedCharacterId=typeof currentCharacterId==='string'?currentCharacterId:row?.characterId;
  const compatible=canCharacterOwnItem(selectedCharacterId,row.itemId);
  return {...item,characterId:row.characterId,compatible,active:compatible&&Boolean(row.active),cooldownUntil:Math.max(0,Number(row.cooldownUntil)||0)};
}
export function characterInventoryItems(rows,characterId){
  const unique=new Map();
  for(const row of rows??[]){
    const item=normalizeCharacterItem(row,characterId);
    if(item&&!unique.has(item.itemId))unique.set(item.itemId,item);
  }
  return [...unique.values()];
}
export function itemCooldownRemaining(item,now=Date.now()){
  return Math.max(0,(Number(item?.cooldownUntil)||0)-now);
}
