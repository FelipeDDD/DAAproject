import { objectsIn,propertiesOf } from './tiledObjects.js';

export function readWardrobes(source){
  const candidates=[...objectsIn(source,'Entities'),...objectsIn(source,'Notes')];
  const seen=new Set();
  return candidates.flatMap(object=>{
    if(object.name!=='hanger'&&object.type!=='wardrobe')return [];
    const id=String(propertiesOf(object).id??object.name??object.id);
    if(seen.has(id))return [];seen.add(id);
    const props=propertiesOf(object);
    return [{id,x:object.x,y:object.y,width:props.displayWidth??56,height:props.displayHeight??75,
      interactionRadius:props.interactionRadius??66}];
  });
}

export function nearbyWardrobe(wardrobes,body){
  if(!body)return undefined;const x=body.center?.x??body.x+body.width/2,y=body.center?.y??body.y+body.height/2;
  return wardrobes.map(item=>({...item,distance:Math.hypot(item.x-x,item.y-y)}))
    .filter(item=>item.distance<=item.interactionRadius).sort((a,b)=>a.distance-b.distance)[0];
}
