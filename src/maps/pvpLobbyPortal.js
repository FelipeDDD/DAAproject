import { readNamedInteractionArea } from './namedInteractionAreas.js';

export const PVP_LOBBY_PORTAL=Object.freeze({
  id:'pvp-lobby-entry',label:'PvP Lobby',action:'open-pvp-lobby',
  marker:'PVP-LOBBY-INTERACTION',
});

// Wall plaque centered above the Tiled lobby rectangle; offsets are world pixels.
export const PVP_LOBBY_SIGN=Object.freeze({width:84,height:40,offsetX:0,offsetY:-8,depth:-.4});

// Shared standing area, not a seat: opening this menu never reserves a chair.
export function readPvpLobbyEntrance(source){
  const interactionArea=readNamedInteractionArea(source,PVP_LOBBY_PORTAL.marker);
  if(!interactionArea)return null;
  return {...PVP_LOBBY_PORTAL,interactionArea,
    x:interactionArea.x+interactionArea.width/2,y:interactionArea.y+interactionArea.height/2};
}
