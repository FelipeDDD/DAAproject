import { REALTIME_CONFIG } from '../realtime/config.js';

export const PVP_MOVEMENT_CONFIG=Object.freeze({
  hz:20,
  interpolationMs:REALTIME_CONFIG.interpolationMs,
  debug:false,debugRenderIntervalMs:1000,
  proxyPath:'/pvp-realtime',
});
// Include the round: Convex can reuse the same match document after an interruption.
export const pvpRealtimeRoom=(matchId,round=0)=>`pvp-${matchId}-${round}`;

export function pvpMovementDebugEnabled(env={},storage){
  try{return env.VITE_PVP_MOVEMENT_DEBUG==='true'||(storage??globalThis.localStorage)?.getItem('daa-pvp-movement-debug')==='true';}
  catch{return env.VITE_PVP_MOVEMENT_DEBUG==='true';}
}

export function pvpRealtimeUrl(env={},location=globalThis.location){
  const url=new URL(env.VITE_REALTIME_URL||PVP_MOVEMENT_CONFIG.proxyPath,location?.origin);
  if(url.protocol==='http:')url.protocol='ws:';
  if(url.protocol==='https:')url.protocol='wss:';
  if(!['ws:','wss:'].includes(url.protocol))throw new Error('Invalid PvP realtime URL');
  return url.href;
}
