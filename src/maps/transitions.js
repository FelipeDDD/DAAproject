import { objectsIn,propertiesOf } from './tiledObjects.js';

// A transition point can live beside the destination spawn markers in Tiled.
// Coordinates stay in the map; code only supplies interaction behavior.
export function readMapTransitions(source){
  return objectsIn(source,'Spawns').flatMap(object=>{
    const props=propertiesOf(object);
    if(props.transition!==true)return [];
    if(!props.targetMap||!props.targetSpawn)throw new Error(`Transition ${object.name||object.id}: targetMap and targetSpawn are required.`);
    const radius=props.interactionRadius??40;
    if(!Number.isFinite(radius)||radius<=0)throw new Error(`Transition ${object.name||object.id}: interactionRadius must be positive.`);
    return [{
      id:String(props.id??object.name??object.id),x:object.x,y:object.y,radius,
      label:props.label??object.name??'area',targetMap:props.targetMap,targetSpawn:props.targetSpawn,
      auto:props.autoTransition===true,
    }];
  });
}

export function nearbyMapTransition(transitions,body){
  if(!body)return undefined;
  const x=body.center?.x??body.x+body.width/2;
  const y=body.center?.y??body.y+body.height/2;
  return transitions
    .map(item=>({...item,distance:Math.hypot(item.x-x,item.y-y)}))
    .filter(item=>item.distance<=item.radius)
    .sort((a,b)=>a.distance-b.distance)[0];
}
