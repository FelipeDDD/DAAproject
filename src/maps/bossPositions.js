import { objectsIn } from './tiledObjects.js';

export function readBossPositions(source){
  const positions=objectsIn(source,'BossPositions').map(object=>{
    if(!object.point||!object.name)throw new Error('BossPositions must contain named Point objects.');
    if(!Number.isFinite(object.x)||!Number.isFinite(object.y))throw new Error(`Invalid boss position: ${object.name}`);
    return {id:object.id,name:object.name,x:object.x,y:object.y};
  }).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
  if(new Set(positions.map(item=>item.name)).size!==positions.length)throw new Error('BossPositions names must be unique.');
  return positions;
}
