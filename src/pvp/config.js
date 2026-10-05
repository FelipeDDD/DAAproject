// Logical scene/room identity is deliberately separate from the physical map.
export const PVP_MAP='pvp-arena-test';
export const PVP_INSPECTION_SCENE='payload-map';
export const PVP_MAP_DEFINITION=Object.freeze({id:'payload-map',file:'payload-map.tmj',revision:1});
export const PVP_MAP_FILE=PVP_MAP_DEFINITION.file;
export const PVP_MAP_LAYOUT=Object.freeze({
  cameraZoom:1.25,
  spawnLayer:'Spawns',
  teamMarkers:Object.freeze({A:{layer:'Notes',name:'spawnBlue',direction:'left'},B:{layer:'Notes',name:'spawnRed',direction:'right'}}),
  // Temporary separation for teammates sharing one base marker. Numbered markers override this.
  spawnOffsets:Object.freeze([{x:0,y:0},{x:0,y:32}]),
  // Used only until PayloadRoute/payload-route is authored. Blue first, red last.
  temporaryPayloadRoute:Object.freeze({fromTeam:'A',toTeam:'B'}),
  teleports:Object.freeze({layer:'Teleport',top:'top',bottom:'bottom',cooldownMs:650}),
});
export const PVP_RULES=Object.freeze({teamSize:2,scoreLimit:5,timeLimitMs:180_000,
  countdownMs:3000,returnMs:10_000,respawnMs:3000,maxHp:100,damage:15,attackCooldownMs:800,
  projectileSpeed:420,projectileLifetimeMs:800,lobbyLifetimeMs:30*60_000});
export const PVP_TEAMS=Object.freeze(['A','B']);
export const pvpRoom=id=>`${PVP_MAP}:${id}`;
export const pvpMatchId=room=>room?.startsWith(`${PVP_MAP}:`)?room.slice(PVP_MAP.length+1):null;
export const DEV_PVP_KEY='daa-dev-pvp-arena';
let override;
export function pvpEnabled(env,storage=globalThis.localStorage){
  if(!env?.DEV)return false;
  try{return override??storage?.getItem(DEV_PVP_KEY)==='true';}catch{return override===true;}
}
export function setPvpEnabled(enabled,storage=globalThis.localStorage){
  override=Boolean(enabled);try{storage?.setItem(DEV_PVP_KEY,String(override));}catch{}return override;
}
