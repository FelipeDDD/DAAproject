import { PVP_MAP,PVP_MAP_DEFINITION } from './config.js';

// Convex publishes this descriptor for host, joiners and Retry; never guess a
// physical map from the room key, mode, saved browser state or a missing field.
export function requirePvpMap(state){
  const map=state?.arenaMap;
  if(!map||map.id!==PVP_MAP_DEFINITION.id||map.file!==PVP_MAP_DEFINITION.file||map.revision!==PVP_MAP_DEFINITION.revision)
    throw new Error('PvP map configuration mismatch. Restart local Convex/realtime and reload both browsers.');
  return PVP_MAP_DEFINITION;
}

export function pvpArenaDestination(matchId,state){
  requirePvpMap(state);
  return {targetMap:PVP_MAP,pvpMatchId:matchId,pvpSnapshot:state};
}
