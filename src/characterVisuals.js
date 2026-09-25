import { CHARACTER_STYLE_STORAGE_KEY } from './characters.js';
import { NEW_PLAYER_SCALE, PLAYER_SCALE } from './game/settings.js';

export const CHARACTER_STYLES=Object.freeze(['old','new','lungCrusher']);
export const NEW_CHARACTER_FRAME=Object.freeze({width:64,height:72,columns:6,rows:4});
export const WALK_COLUMNS=Object.freeze([2,3,4,5]);
const DIRECTIONS=Object.freeze(['down','left','right','up']);

export function normalizeCharacterStyle(value){return value==='new'?'new':'old';}
export function visualStyleForEquippedSkin(skin){return skin==='remastered'?'new':'old';}
export function visualStyleForActiveItem(activeItem,skin){
  return activeItem==='lung_crusher_3000'?'lungCrusher':visualStyleForEquippedSkin(skin);
}
export function loadCharacterStyle(storage=globalThis.localStorage){
  try{return normalizeCharacterStyle(storage?.getItem(CHARACTER_STYLE_STORAGE_KEY));}catch{return 'old';}
}
export function saveCharacterStyle(style,storage=globalThis.localStorage){
  const normalized=normalizeCharacterStyle(style);
  try{storage?.setItem(CHARACTER_STYLE_STORAGE_KEY,normalized);}catch{}
  return normalized;
}

export function characterVisual(character,style=loadCharacterStyle()){
  if(style==='lungCrusher'&&character?.lungCrusherVisual)return {
    ...character.lungCrusherVisual,style:'lungCrusher',animated:true,scale:NEW_PLAYER_SCALE,
    frameWidth:character.lungCrusherVisual.frameWidth??NEW_CHARACTER_FRAME.width,
    frameHeight:character.lungCrusherVisual.frameHeight??NEW_CHARACTER_FRAME.height,labelOffset:68,
  };
  if(style==='new'&&character?.newVisual)return {
    ...character.newVisual,style:'new',animated:true,scale:NEW_PLAYER_SCALE,
    frameWidth:NEW_CHARACTER_FRAME.width,frameHeight:NEW_CHARACTER_FRAME.height,labelOffset:68,
  };
  return {
    sprite:character?.sprite??'student',asset:character?.asset,previewAsset:character?.asset,
    style:'old',animated:false,scale:PLAYER_SCALE,frameWidth:32,frameHeight:56,labelOffset:58*PLAYER_SCALE,
  };
}

export function idleFrame(direction){
  const row=Math.max(0,DIRECTIONS.indexOf(direction));
  return row*NEW_CHARACTER_FRAME.columns;
}
export function walkFrames(direction,visual){
  const row=Math.max(0,DIRECTIONS.indexOf(direction));
  const columns=visual?.walkColumns?.[direction]??WALK_COLUMNS;
  return columns.map(column=>row*NEW_CHARACTER_FRAME.columns+column);
}
export function animationKey(visual,type,direction){return `${visual.sprite}-${type}-${direction}`;}

export function preloadCharacterTextures(scene,characters,baseUrl){
  const queued=new Set();
  for(const character of characters){
    if(!queued.has(character.sprite)&&!scene.textures.exists(character.sprite))scene.load.svg(character.sprite,`${baseUrl}${character.asset}`);
    queued.add(character.sprite);
    if(character.newVisual&&!queued.has(character.newVisual.sprite)&&!scene.textures.exists(character.newVisual.sprite))scene.load.spritesheet(
      character.newVisual.sprite,`${baseUrl}${character.newVisual.asset}`,
      {frameWidth:NEW_CHARACTER_FRAME.width,frameHeight:NEW_CHARACTER_FRAME.height},
    );
    if(character.newVisual)queued.add(character.newVisual.sprite);
    if(character.lungCrusherVisual&&!queued.has(character.lungCrusherVisual.sprite)&&!scene.textures.exists(character.lungCrusherVisual.sprite))scene.load.spritesheet(
      character.lungCrusherVisual.sprite,`${baseUrl}${character.lungCrusherVisual.asset}`,
      {frameWidth:character.lungCrusherVisual.frameWidth??NEW_CHARACTER_FRAME.width,
        frameHeight:character.lungCrusherVisual.frameHeight??NEW_CHARACTER_FRAME.height},
    );
    if(character.lungCrusherVisual)queued.add(character.lungCrusherVisual.sprite);
  }
}

export function createCharacterAnimations(scene,characters){
  for(const character of characters){
    for(const style of ['new','lungCrusher']){
      const visual=characterVisual(character,style);
      if(!visual.animated)continue;
      for(const direction of DIRECTIONS){
      const idleKey=animationKey(visual,'idle',direction);
      if(!scene.anims.exists(idleKey))scene.anims.create({
        key:idleKey,frames:[{key:visual.sprite,frame:idleFrame(direction)}],frameRate:1,repeat:-1,
      });
      const walkKey=animationKey(visual,'walk',direction);
      if(!scene.anims.exists(walkKey))scene.anims.create({
        key:walkKey,frames:walkFrames(direction,visual).map(frame=>({key:visual.sprite,frame})),frameRate:8,repeat:-1,
      });
      }
    }
  }
}

export function applyCharacterVisual(sprite,character,style=loadCharacterStyle()){
  const visual=characterVisual(character,style);
  sprite.anims?.stop();sprite.setTexture(visual.sprite,visual.animated?idleFrame('down'):undefined);
  sprite.setScale(visual.scale);sprite.setFlipX(false);
  return visual;
}

export function updateCharacterVisual(sprite,visual,direction='down',moving=false){
  const facing=DIRECTIONS.includes(direction)?direction:'down';
  if(!visual?.animated){
    sprite.anims?.stop();sprite.setFlipX(facing==='left');return;
  }
  sprite.setFlipX(false);
  sprite.anims.play(animationKey(visual,moving?'walk':'idle',facing),true);
}

export function footBodyForVisual(visual){
  const worldWidth=20*PLAYER_SCALE,worldHeight=12*PLAYER_SCALE;
  const width=worldWidth/visual.scale,height=worldHeight/visual.scale;
  return {width,height,offsetX:(visual.frameWidth-width)/2,offsetY:visual.frameHeight-height};
}
