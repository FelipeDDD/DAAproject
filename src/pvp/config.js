// Logical scene/room identity is deliberately separate from the physical map.
export const PVP_MAP='pvp-arena-test';
export const PVP_INSPECTION_SCENE='payload-map';
export const DEFAULT_MATCH_TIME_LIMIT_MS=10*60_000;
export const PVP_MAP_DEFINITION=Object.freeze({id:'payload-map',file:'payload-map.tmj',revision:2});
export const PVP_MAP_FILE=PVP_MAP_DEFINITION.file;
export const PVP_MAP_LAYOUT=Object.freeze({
  cameraZoom:1.25,
  spawnLayer:'Spawns',
  teamMarkers:Object.freeze({A:{layer:'Notes',name:'spawnBlue',direction:'left'},B:{layer:'Notes',name:'spawnRed',direction:'right'}}),
  // Fallback 2x2 teammate formation. Authored numbered markers override these.
  spawnOffsets:Object.freeze([{x:0,y:0},{x:32,y:0},{x:0,y:32},{x:32,y:32}]),
  // Used only until PayloadRoute/payload-route is authored. Blue first, red last.
  temporaryPayloadRoute:Object.freeze({fromTeam:'A',toTeam:'B'}),
  teleports:Object.freeze({layer:'Teleport',top:'top',bottom:'bottom',cooldownMs:650}),
});
export const PVP_RULES=Object.freeze({teamSize:4,scoreLimit:5,timeLimitMs:DEFAULT_MATCH_TIME_LIMIT_MS,
  countdownMs:3000,returnMs:10_000,respawnMs:3000,maxHp:100,damage:15,attackCooldownMs:800,
  projectileSpeed:420,projectileLifetimeMs:800,lobbyLifetimeMs:30*60_000});
// Lobby presentation capacity is intentionally independent of the current match limit.
export const PVP_LOBBY_DISPLAY_SLOTS=4;
export const PVP_TEAMS=Object.freeze(['A','B']);
export const PVP_MAX_PARTICIPANTS=PVP_RULES.teamSize*PVP_TEAMS.length;
export const pvpRoom=id=>`${PVP_MAP}:${id}`;
export const pvpMatchId=room=>room?.startsWith(`${PVP_MAP}:`)?room.slice(PVP_MAP.length+1):null;
export const DEV_PVP_KEY='daa-dev-pvp-arena';
export const pvpTestBuild=env=>env?.VITE_PVP_TEST_BUILD==='true';
export const pvpLobbyAvailable=env=>env?.DEV===true||pvpTestBuild(env);
let override;
export function pvpEnabled(env,storage=globalThis.localStorage){
  if(pvpTestBuild(env))return true;
  if(!env?.DEV)return false;
  try{return override??storage?.getItem(DEV_PVP_KEY)==='true';}catch{return override===true;}
}
export function setPvpEnabled(enabled,storage=globalThis.localStorage){
  override=Boolean(enabled);try{storage?.setItem(DEV_PVP_KEY,String(override));}catch{}return override;
}
