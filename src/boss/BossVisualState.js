export const BOSS_VISUAL_TEXTURES=Object.freeze({
  PHASE1:'director-phase1',
  PHASE2:'director-phase2-intro',
  PHASE3_INTRO:'director-phase3-intro',
  PHASE3_COMBAT:'director-phase3-combat',
  DEFEAT:'director-defeat',
});

export const BOSS_VISUAL_ANIMATIONS=Object.freeze({
  PHASE2_INTRO:'director-phase2-intro-play',
  PHASE3_INTRO:'director-phase3-intro-play',
  PHASE3_COMBAT:'director-phase3-combat-loop',
  DEFEAT:'director-defeat-play',
});

export const BOSS_VISUAL_ASSETS=Object.freeze([
  Object.freeze({key:BOSS_VISUAL_TEXTURES.PHASE1,file:'director-phase1.png',frames:1,frameWidth:128,frameHeight:160}),
  Object.freeze({key:BOSS_VISUAL_TEXTURES.PHASE2,file:'director-phase2-intro.png',frames:6,frameWidth:128,frameHeight:160}),
  Object.freeze({key:BOSS_VISUAL_TEXTURES.PHASE3_INTRO,file:'director-phase3-intro.png',frames:6,frameWidth:192,frameHeight:176}),
  Object.freeze({key:BOSS_VISUAL_TEXTURES.PHASE3_COMBAT,file:'director-phase3-combat.png',frames:4,frameWidth:192,frameHeight:176}),
  Object.freeze({key:BOSS_VISUAL_TEXTURES.DEFEAT,file:'director-defeat.png',frames:4,frameWidth:543,frameHeight:724}),
]);

export function createBossVisualAnimations(scene){
  const definitions=[
    [BOSS_VISUAL_ANIMATIONS.PHASE2_INTRO,BOSS_VISUAL_TEXTURES.PHASE2,5,4,false],
    [BOSS_VISUAL_ANIMATIONS.PHASE3_INTRO,BOSS_VISUAL_TEXTURES.PHASE3_INTRO,5,4,false],
    [BOSS_VISUAL_ANIMATIONS.PHASE3_COMBAT,BOSS_VISUAL_TEXTURES.PHASE3_COMBAT,3,5,true],
    [BOSS_VISUAL_ANIMATIONS.DEFEAT,BOSS_VISUAL_TEXTURES.DEFEAT,3,2,false],
  ];
  for(const [key,texture,end,frameRate,loop] of definitions){
    if(scene.anims.exists(key))continue;
    scene.anims.create({key,frames:scene.anims.generateFrameNumbers(texture,{start:0,end}),frameRate,repeat:loop?-1:0});
  }
}

export function phaseVisual(phase,{intro=false}={}){
  if(phase===3)return intro
    ?{texture:BOSS_VISUAL_TEXTURES.PHASE3_INTRO,animation:BOSS_VISUAL_ANIMATIONS.PHASE3_INTRO,frameWidth:192,frameHeight:176}
    :{texture:BOSS_VISUAL_TEXTURES.PHASE3_COMBAT,animation:BOSS_VISUAL_ANIMATIONS.PHASE3_COMBAT,frameWidth:192,frameHeight:176};
  if(phase===2)return intro
    ?{texture:BOSS_VISUAL_TEXTURES.PHASE2,animation:BOSS_VISUAL_ANIMATIONS.PHASE2_INTRO,frameWidth:128,frameHeight:160}
    :{texture:BOSS_VISUAL_TEXTURES.PHASE2,frame:0,frameWidth:128,frameHeight:160};
  return {texture:BOSS_VISUAL_TEXTURES.PHASE1,frame:0,frameWidth:128,frameHeight:160};
}
