import { objectsIn } from '../maps/tiledObjects.js';
export function teamSpawn(source,team,index=0){
  const markers=objectsIn(source,'Spawns').filter(p=>new RegExp(`^team${team}_spawn[0-9]+$`).test(p.name))
    .sort((a,b)=>a.name.localeCompare(b.name));
  if(!markers.length)throw new Error(`Add a team${team}_spawn1 marker to the PvP map.`);
  return markers[Math.abs(index)%markers.length];
}
