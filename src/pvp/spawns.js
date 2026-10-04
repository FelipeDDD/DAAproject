import { objectsIn,propertiesOf } from '../maps/tiledObjects.js';
import { PVP_MAP_LAYOUT } from './config.js';
export function teamSpawn(source,team,index=0){
  const slot=Math.abs(index);
  const markers=objectsIn(source,PVP_MAP_LAYOUT.spawnLayer).filter(p=>new RegExp(`^team${team}_spawn[0-9]+$`).test(p.name))
    .sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
  const definition=PVP_MAP_LAYOUT.teamMarkers[team];
  if(markers.length){
    const marker=markers[slot%markers.length];
    return {...marker,direction:propertiesOf(marker).direction??definition?.direction??'down'};
  }
  const marker=definition&&objectsIn(source,definition.layer).find(p=>p.name===definition.name);
  if(!marker||!Number.isFinite(marker.x)||!Number.isFinite(marker.y))
    throw new Error(`Add a team${team}_spawn1 marker to Spawns or configure a valid team marker in PVP_MAP_LAYOUT.`);
  const offset=PVP_MAP_LAYOUT.spawnOffsets[slot%PVP_MAP_LAYOUT.spawnOffsets.length];
  return {...marker,x:marker.x+offset.x,y:marker.y+offset.y,direction:propertiesOf(marker).direction??definition.direction};
}
