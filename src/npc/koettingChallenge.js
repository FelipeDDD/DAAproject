import { objectsIn } from '../maps/tiledObjects.js';

export const KOETTING_STREAK_TARGET=3;
export const KOETTING_REWARD_AMOUNT=3;

export function koettingMarker(source){
  const marker=objectsIn(source,'Notes').find(object=>object.name==='koetting-NPC');
  if(!marker)throw new Error('Missing koetting-NPC point in secret-path Notes.');
  return {x:marker.x,y:marker.y};
}

export function nextKoettingStreak(count,correct){
  return correct?Math.min(KOETTING_STREAK_TARGET,count+1):0;
}
