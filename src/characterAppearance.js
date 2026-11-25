import { characterBaseIdFor,characterById } from './characters.js';
import { previewVisual } from './characterPreviewSkins.js';
import { visualStyleForActiveItem } from './characterVisuals.js';

export const normalizeEquippedSkin=skin=>skin==='remastered'?'remastered':'classic';
export function appearanceStyle(character,state={}){
  const style=visualStyleForActiveItem(state.activeCharacterItem,state.equippedSkin);
  if(style==='lungCrusher')return style;
  return previewVisual(character,state.previewSkin)?`preview:${state.previewSkin}`:style;
}
function devPreviewKey(identity,env){
  const baseId=characterBaseIdFor(identity);
  if(env?.DEV===true&&identity?.profileId&&baseId)return 'daa:dev-tier3:'+identity.profileId+':'+baseId;
}

export function selectPreviewSkin(identity,character,env=import.meta.env){
  identity.visualPreview='level3Preview';
  identity.previewSkin=character.experimentalVisual.sprite;
  const key=devPreviewKey(identity,env);
  if(key&&identity.devAllSkins){
    try{globalThis.localStorage?.setItem(key,'1');}catch{}
  }
}
export function clearPreviewSkin(identity,env=import.meta.env){
  delete identity.visualPreview;
  delete identity.previewSkin;
  const key=devPreviewKey(identity,env);
  if(key){
    try{globalThis.localStorage?.removeItem(key);}catch{}
  }
}
export function restoreDevPreviewSkin(identity,character,env=import.meta.env){
  const key=devPreviewKey(identity,env);
  if(!key||!character?.experimentalVisual)return;
  try{
    if(globalThis.localStorage?.getItem(key)!=='1')return;
  }catch{return;}
  selectPreviewSkin(identity,character,env);
  identity.devAllSkins=true;
}
export function applyLocalAppearance(scene,{activeCharacterItem=scene.activeCharacterItem??null}={}){
  const identity=scene.presence?.identity;
  const character=characterById(characterBaseIdFor(identity));
  scene.equippedSkin=normalizeEquippedSkin(identity?.equippedSkin);
  if(character)scene.player.setCharacter(character,appearanceStyle(character,{...identity,activeCharacterItem}));
  return scene.equippedSkin;
}
export function logPlayerSkin(scene,state,visual,role,source,sprite){
  let enabled=false;
  try{enabled=globalThis.localStorage?.getItem('daa-player-skin-debug')==='true'
    ||new URLSearchParams(globalThis.location?.search).get('playerSkinDebug')==='1';}catch{}
  if(enabled)console.debug('[PLAYER SKIN]',{scene:scene.mapKey??scene.scene?.key,
    playerId:state?.playerId,role,characterBaseId:characterBaseIdFor(state),
    equippedSkin:state?.equippedSkin,previewSkin:state?.previewSkin??null,source,
    requestedTexture:visual?.sprite,texture:sprite?.texture?.key??visual?.sprite});
}
