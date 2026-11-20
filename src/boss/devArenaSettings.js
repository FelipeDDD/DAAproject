export const DEV_COOP_ARENA_KEY='daa-dev-coop-arena';
// Keep co-op closed by default until the shared encounter is ready.
export const coopArenaAvailable=(env=import.meta.env)=>env?.VITE_ARENA_COOP_ENABLED==='true';
let runtimeOverride;
export function coopArenaEnabled(env,storage=globalThis.localStorage){
  if(!coopArenaAvailable(env)||env?.DEV!==true)return false;
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
