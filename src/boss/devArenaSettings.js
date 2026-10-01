export const DEV_COOP_ARENA_KEY='daa-dev-coop-arena';
let runtimeOverride;
export function coopArenaEnabled(env,storage=globalThis.localStorage){
  if(env?.DEV!==true)return false;
  if(runtimeOverride!==undefined)return runtimeOverride;
  try{return storage?.getItem(DEV_COOP_ARENA_KEY)==='true';}
  catch{return runtimeOverride===true;}
}
export function setCoopArenaEnabled(enabled,storage=globalThis.localStorage){
  runtimeOverride=Boolean(enabled);
  try{storage?.setItem(DEV_COOP_ARENA_KEY,String(Boolean(enabled)));}catch{}
  return Boolean(enabled);
}
export const arenaEntryChoices=enabled=>enabled?['solo','create','join']:['solo'];
