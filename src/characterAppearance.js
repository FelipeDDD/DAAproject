import { characterBaseIdFor,characterById } from './characters.js';
import { previewVisual } from './characterPreviewSkins.js';
import { visualStyleForActiveItem } from './characterVisuals.js';

export const normalizeEquippedSkin=skin=>skin==='remastered'?'remastered':'classic';
export function appearanceStyle(character,state={}){
  const style=visualStyleForActiveItem(state.activeCharacterItem,state.equippedSkin);
  if(style==='lungCrusher')return style;
  return previewVisual(character,state.previewSkin)?`preview:${state.previewSkin}`:style;
}
export function selectPreviewSkin(identity,character){
  identity.visualPreview='level3Preview';
  identity.previewSkin=character.experimentalVisual.sprite;
}
export function clearPreviewSkin(identity){delete identity.visualPreview;delete identity.previewSkin;}
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
