import { objectsIn } from '../maps/tiledObjects.js';

export const KOETTING_STREAK_TARGET=3;
export const KOETTING_REWARD_AMOUNT=2;
const GIFT_OFFSETS=Object.freeze([[-8,0],[8,0],[0,-7]].map(offset=>Object.freeze(offset)));

export function koettingGiftOffsets(amount){
  return GIFT_OFFSETS.slice(0,Math.max(0,amount));
}

export function koettingMarker(source){
  const marker=objectsIn(source,'Notes').find(object=>object.name==='koetting-NPC');
  if(!marker)throw new Error('Missing koetting-NPC point in secret-path Notes.');
  return {x:marker.x,y:marker.y};
}

export function nextKoettingStreak(count,correct,target=KOETTING_STREAK_TARGET){
  return correct?Math.min(target,count+1):0;
}
