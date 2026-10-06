import { effectiveMatchSettings } from '../matchSettings.js';

export function withinPickupArea(pickup,position,radius){
  return Number.isFinite(position?.x)&&Number.isFinite(position?.y)
    &&Math.hypot(position.x-pickup.x,position.y-pickup.y)<=radius;
}

// Extend this table when another pickup gains gameplay. Reserved buff spots
// deliberately have no effect handler and cannot be consumed.
const effects={
  health(player,match,rules){
    const maxHp=effectiveMatchSettings(match,player.team).maxHp;
    return player.hp>0&&player.hp<maxHp?{changes:{hp:maxHp},respawnMs:rules.healRespawnMs}:null;
  },
};
export const pickupEnabled=type=>Object.hasOwn(effects,type);
export function pickupEffect(type,player,match,rules){return Object.hasOwn(effects,type)?effects[type](player,match,rules):null;}
