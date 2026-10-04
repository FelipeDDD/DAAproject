import { objectsIn,propertiesOf } from '../../maps/tiledObjects.js';
import { PAYLOAD_RULES } from './config.js';
import { PVP_MAP_LAYOUT } from '../config.js';
import { teamSpawn } from '../spawns.js';

// Route order runs from the BLUE/A base to the RED/B base. One authored polyline.
export function routeFromMap(source){
  const object=objectsIn(source,PAYLOAD_RULES.routeLayer).find(p=>p.name==='payload-route');
  if(!object){
    const {fromTeam,toTeam,initialFraction}=PVP_MAP_LAYOUT.temporaryPayloadRoute;
    const points=[fromTeam,toTeam].map(team=>{const {x,y}=teamSpawn(source,team);return {x,y};});
    return makeRoute(points,initialFraction);
  }
  if(!object.polyline)throw new Error('Use a payload-route polyline in PayloadRoute (blue base first, red base last).');
  if(object.rotation)throw new Error('Author payload-route without object rotation.');
  return makeRoute(object.polyline.map(p=>({x:object.x+p.x,y:object.y+p.y})),propertiesOf(object).initialFraction??0.5);
}
export function makeRoute(points,initialFraction=0.5){
  if(points.length<2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))||!Number.isFinite(initialFraction)
    ||initialFraction<=0||initialFraction>=1)throw new Error('Invalid payload route.');
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));
  if(lengths.some(n=>n<=0))throw new Error('Payload waypoints must be distinct.');
  return {points,lengths,length:lengths.reduce((sum,n)=>sum+n,0),initialFraction};
}
export function pointAt(route,distance){
  let remaining=Math.max(0,Math.min(route.length,distance));
  for(let i=0;i<route.lengths.length;i++){
    const length=route.lengths[i];
    if(remaining<=length||i===route.lengths.length-1){
      const a=route.points[i],b=route.points[i+1],fraction=remaining/length;
      return {x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction};
    }
    remaining-=length;
  }
}
