import { objectsIn } from '../../maps/tiledObjects.js';
import { PVP_PICKUP_SPOTS } from './config.js';

// Reuse the map's existing object-layer reader, including layer offsets.
// Points are centers; rectangle markers use their geometric centers.
export function pickupSpotsFromMap(source){
  const spots=[],ids=new Set();
  for(const layer of source.layers??[]){
    if(layer.type!=='objectgroup')continue;
    for(const object of objectsIn(source,layer.name)){
      const type=PVP_PICKUP_SPOTS[object.name];if(!Object.hasOwn(PVP_PICKUP_SPOTS,object.name))continue;
      if(ids.has(object.name))throw new Error(`Duplicate PvP pickup: ${object.name}`);
      const angle=(object.rotation??0)*Math.PI/180;
      const dx=object.point?0:(object.width??0)/2,dy=object.point?0:(object.height??0)/2;
      const x=object.x+dx*Math.cos(angle)-dy*Math.sin(angle),y=object.y+dx*Math.sin(angle)+dy*Math.cos(angle);
      if(!Number.isFinite(x)||!Number.isFinite(y))throw new Error(`Invalid PvP pickup position: ${object.name}`);
      ids.add(object.name);spots.push({id:object.name,type,layer:layer.name,x,y});
    }
  }
  return spots;
}
