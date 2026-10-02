export const PVP_MAP='pvp-arena-test';
export const PVP_RULES=Object.freeze({teamSize:2,scoreLimit:5,timeLimitMs:180_000,
  countdownMs:3000,returnMs:10_000,respawnMs:2500,maxHp:100,damage:25,attackCooldownMs:400,
  projectileSpeed:420,projectileLifetimeMs:1200,lobbyLifetimeMs:30*60_000});
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
