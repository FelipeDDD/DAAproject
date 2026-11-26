import { MUSHROOM_BOSS,PHASE_HEAL_TOTAL_MS } from './mushroomBoss.js';

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

export function preloadMushroomSheets(scene){
  for(const [name,atlas] of Object.entries(MUSHROOM_SHEETS)){
    if(!scene.textures.exists(name))scene.load.spritesheet(name,atlas.url,{
      frameWidth:atlas.width,frameHeight:atlas.height,endFrame:atlas.frames-1,
    });
  }
}

export function mushroomPose(actor){
  const {enemy,phase,elapsed,spec,attack,boss}=actor;
  if(!enemy.hp)return ['mushroom-death',Math.min(13,Math.floor(elapsed/90))];
  if(phase==='BossEvent'){
    const healing=boss.event.id==='heal';
    const releaseMs=healing?MUSHROOM_BOSS.phaseHeal.chargeMs:MUSHROOM_BOSS.releaseMs;
    const recoveryMs=healing?PHASE_HEAL_TOTAL_MS-releaseMs:MUSHROOM_BOSS.recoveryMs;
    const frame=elapsed<releaseMs?Math.floor(4*elapsed/releaseMs):4+Math.floor(8*(elapsed-releaseMs)/recoveryMs);
    return ['mushroom-attack',Math.min(11,frame)];
  }
  if(phase==='windup')return ['mushroom-attack',Math.min(3,Math.floor(4*elapsed/spec[attack.kind].windupMs))];
  if(phase==='recover')return ['mushroom-attack',Math.min(11,4+Math.floor(8*elapsed/spec.recoverMs))];
  return ['mushroom-idle',Math.floor(enemy.poseMs/95)%12];
}

export function drawMushroomSprite(sprite,actor){
  const {enemy,spec}=actor;
  const fade=enemy.hp?0:Math.min(1,actor.elapsed/actor.deathMs);
  const [key,frame]=mushroomPose(actor);
  const art=MUSHROOM_SHEETS[key];
  sprite.setPosition(enemy.x,enemy.y).setDepth(enemy.y).setVisible(fade<1)
    .setTexture(key,frame).setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height)
    .setScale(spec.scale).setFlipX(enemy.facing<0).setAlpha(Math.min(1,(1-fade)*6));
  if(actor.boss.phase===MUSHROOM_BOSS.phases[2])sprite.setTint(0xffad9e);
}
