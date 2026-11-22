import { MUSHROOM_BOSS } from './mushroomBoss.js';

export const MUSHROOM_SHEETS={
  'mushroom-idle':{
    url:new URL('../../../tools/vfx-lab/mushroom/mushroom_idle_sheet.png',import.meta.url).href,
    width:154,height:207,anchor:[77,196],frames:12,
  },
  'mushroom-attack':{
    url:new URL('../../../tools/vfx-lab/mushroom/mushroom_attack_sheet_aligned.png',import.meta.url).href,
    width:134,height:239,anchor:[67,239],frames:12,
  },
  'mushroom-death':{
    url:new URL('../../../tools/vfx-lab/mushroom/mushroom_death_sheet_aligned.png',import.meta.url).href,
    width:156,height:152,anchor:[78,152],frames:14,
  },
};

export function mushroomPose(actor){
  const {enemy,phase,elapsed,spec,attack}=actor;
  if(!enemy.hp)return ['mushroom-death',Math.min(13,Math.floor(elapsed/90))];
  if(phase==='BossEvent'){
    const {releaseMs,recoveryMs}=MUSHROOM_BOSS;
    const frame=elapsed<releaseMs?Math.floor(4*elapsed/releaseMs):4+Math.floor(8*(elapsed-releaseMs)/recoveryMs);
    return ['mushroom-attack',Math.min(11,frame)];
  }
  if(phase==='windup')return ['mushroom-attack',Math.min(3,Math.floor(4*elapsed/spec[attack.kind].windupMs))];
  if(phase==='recover')return ['mushroom-attack',Math.min(11,4+Math.floor(8*elapsed/spec.recoverMs))];
  return ['mushroom-idle',Math.floor(enemy.poseMs/95)%12];
}
