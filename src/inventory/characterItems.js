import { baseCharacterId } from '../characters.js';
import { CIGARETTE_QUEST } from '../npc/cigaretteQuest.js';
import { cigarettePack } from '../npc/cigarettePacks.js';
import { DIRECTOR_HIDDEN_KEY_ITEM_ID } from '../office2/directorInvestigation.js';
import { ROULETTE_ITEMS } from '../gamble/rewardCatalog.js';

export const CHARACTER_ITEM_IDS=Object.freeze({
  LUNG_CRUSHER_3000:'lung_crusher_3000',LUNG_CRUSHER_PACK:'lung_crusher_3000_pack',
  OFFICE2_KEY:'office2_key',HEALTH_POTION:'health_potion',
  DIRECTOR_HIDDEN_KEY:DIRECTOR_HIDDEN_KEY_ITEM_ID,
});
export const CHARACTER_ITEM_COOLDOWN_MS=10_000;
// Michael's old equipable cigarette is parked; the collectible pack has its own ID.
export const LUNG_CRUSHER_CIGARETTE_ENABLED=false;
export const isCharacterItemEnabled=itemId=>itemId!==CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000||LUNG_CRUSHER_CIGARETTE_ENABLED;
export const HEALTH_POTION_COOLDOWN_MS=5_000;
export const HEALTH_POTION_HEAL_AMOUNT=70;
export const HEALTH_POTION_MAX_STACK=10;

// key-office.png is a sheet with large/medium/small variants. Cards show only
// the large left-hand variant; the original asset and icon paths stay intact.
const OFFICE_KEY_PRESENTATION=Object.freeze({
  presentationImage:'assets/items/key-office.png',
  presentationFrame:Object.freeze({x:320,y:0,width:620,height:724,sourceWidth:2172,sourceHeight:724}),
  // The source PNG is a three-size sheet; small inventory views need the same
  // single large-key crop used by the presentation card.
  iconFrame:Object.freeze({x:320,y:0,width:620,height:724,sourceWidth:2172,sourceHeight:724}),
});

// The three edition icon PNGs have opaque black canvases. These silhouettes
// keep only each pack visible in the small inventory views; card art is intact.
const PACK_ICON_CLIPS=[
  null,
  'polygon(42.3% 39%,53% 36.8%,56% 37%,58% 39%,58% 58.8%,47% 61%,43% 60%,42.3% 59%)',
  'polygon(43% 39%,54% 37.3%,57.5% 39%,57.5% 59%,47% 61%,43% 59.5%)',
  'polygon(43.5% 39.7%,54% 37.5%,57.5% 39%,57.5% 59%,47% 61%,43.5% 59.5%)',
];

export const CHARACTER_ITEMS=Object.freeze({
  ...Object.fromEntries(ROULETTE_ITEMS.map(item=>[item.itemId,Object.freeze(item)])),
  [CHARACTER_ITEM_IDS.DIRECTOR_HIDDEN_KEY]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.DIRECTOR_HIDDEN_KEY,type:'key',quantity:1,questId:'director-hidden-key',
    name:"Director's Hidden Key",description:'A forgotten key, recovered from an unusually safe hiding place.',
    icon:'assets/items/key-office.png',...OFFICE_KEY_PRESENTATION,useBehavior:'presentation',
  }),
  ...Object.fromEntries(CIGARETTE_QUEST.packIds.map((itemId, index) => [itemId, Object.freeze({
    itemId, type:'quest', quantity:1, questId:CIGARETTE_QUEST.id,
    name:cigarettePack(itemId)?.name??`Cigarette Pack ${index + 1}`, description:'A questionable delivery for the woman outside.',
    icon:cigarettePack(itemId).icon,presentationImage:cigarettePack(itemId).card,useBehavior:'presentation',
    ...(index>0?{iconScale:3.4,iconClip:PACK_ICON_CLIPS[index]}:{}),
  })])),
  [CHARACTER_ITEM_IDS.OFFICE2_KEY]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.OFFICE2_KEY,type:'key',quantity:1,
    name:'Office 2 Key',description:"Opens the Director's office.",
    icon:'assets/items/key-office.png',...OFFICE_KEY_PRESENTATION,useBehavior:'presentation',
  }),
  [CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,type:'character_item',quantity:1,
    allowedCharacterBaseId:'michael',name:'Lung Crusher 3000',
    description:'A very large cigarette. Click to activate or deactivate.',
    icon:'assets/items/lung-crusher-slot-icon.png',presentationImage:'assets/items/lung-crusher-3000.png',
    activatable:true,useBehavior:'functional',
  }),
  [CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK,type:'quest',quantity:1,questId:CIGARETTE_QUEST.id,
    name:'Lung Crusher 3000 Pack',
    description:'Eine mysteriöse Zigarettenschachtel. Steht vermutlich nicht im Lehrplan.',
    icon:'assets/items/lung-crusher-floor.png',
    presentationImage:'assets/items/lung-crusher-3000.png',useBehavior:'presentation',
  }),
  [CHARACTER_ITEM_IDS.HEALTH_POTION]:Object.freeze({
    itemId:CHARACTER_ITEM_IDS.HEALTH_POTION,type:'consumable',quantity:1,maxStack:HEALTH_POTION_MAX_STACK,
    name:'Medizinisch Fragwürdig',description:`Restores up to ${HEALTH_POTION_HEAL_AMOUNT} HP. Probably.`,
    icon:'assets/items/potion-michael-inventory.png',presentationImage:'assets/items/potion-michael.png',
    iconsByCharacterBaseId:Object.freeze({michael:'assets/items/potion-michael-inventory.png',sarina:'assets/items/potion-sarina-inventory.png',jassine:'assets/items/potion-yassin-inventory.png',felipe:'assets/items/potion-felipe-inventory.png'}),
    presentationImagesByCharacterBaseId:Object.freeze({michael:'assets/items/potion-michael.png',sarina:'assets/items/potion-sarina.png',jassine:'assets/items/potion-yassin.png',felipe:'assets/items/potion-felipe.png'}),
    preferredSlot:0,consumable:true,useBehavior:'functional',cooldownMs:HEALTH_POTION_COOLDOWN_MS,
    healAmount:HEALTH_POTION_HEAL_AMOUNT,
  }),
});

export function characterItemDefinition(itemId){return CHARACTER_ITEMS[itemId]??null;}
export function canCharacterOwnItem(characterBaseId,itemId){
  const item=characterItemDefinition(itemId);
  return Boolean(item&&(item.allowedCharacterBaseId===undefined||item.allowedCharacterBaseId===baseCharacterId(characterBaseId)));
}
export function itemAppearanceForCharacter(item,characterBaseId){
  const id=baseCharacterId(characterBaseId);
  return {...item,icon:item?.iconsByCharacterBaseId?.[id]??item?.icon,
    presentationImage:item?.presentationImagesByCharacterBaseId?.[id]??item?.presentationImage};
}
export function normalizeCharacterItem(row,currentCharacterBaseId=row?.characterBaseId??row?.characterId){
  const item=characterItemDefinition(row?.itemId);
  if(!item)return null;
  const characterBaseId=typeof currentCharacterBaseId==='string'?baseCharacterId(currentCharacterBaseId):baseCharacterId(row?.characterBaseId??row?.characterId);
  const compatible=canCharacterOwnItem(characterBaseId,row.itemId);
  return {...itemAppearanceForCharacter(item,characterBaseId),characterBaseId,compatible,
    quantity:Math.max(0,Math.min(item.maxStack??1,Number(row.quantity) || (item.maxStack?0:1))),
    active:compatible&&Boolean(item.activatable)&&Boolean(row.active),cooldownUntil:Math.max(0,Number(row.cooldownUntil)||0)};
}
export function characterInventoryItems(rows,characterBaseId){
  const unique=new Map();
  for(const row of rows??[]){
    const item=normalizeCharacterItem(row,characterBaseId);
    if(item&&item.quantity>0&&isCharacterItemEnabled(item.itemId)&&!unique.has(item.itemId))unique.set(item.itemId,item);
  }
  return [...unique.values()];
}
export function itemCooldownRemaining(item,now=Date.now()){
  return Math.max(0,(Number(item?.cooldownUntil)||0)-now);
}
