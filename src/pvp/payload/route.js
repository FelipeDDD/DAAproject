import { objectsIn,propertiesOf } from '../../maps/tiledObjects.js';
import { PAYLOAD_RULES } from './config.js';
import { PVP_MAP_LAYOUT } from '../config.js';
import { teamSpawn } from '../spawns.js';

const warnedSources=new WeakSet();
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

// Route order runs from the BLUE/A base to the RED/B base. One authored polyline.
export function routeFromMap(source){
  const object=objectsIn(source,PAYLOAD_RULES.routeLayer).find(p=>p.name==='payload-route');
  const fallback=reason=>{
    if(source&&typeof source==='object'&&!warnedSources.has(source)){
      warnedSources.add(source);
      console.warn(`[PvP Payload] ${reason} Falling back to the temporary spawn-to-spawn line. Add an unrotated polyline named "payload-route" in the "PayloadRoute" object layer, starting at BLUE/A and ending at RED/B; keep it clear of Collision.`);
    }
    const {fromTeam,toTeam}=PVP_MAP_LAYOUT.temporaryPayloadRoute;
    const points=[fromTeam,toTeam].map(team=>{const {x,y}=teamSpawn(source,team);return {x,y};});
    return makeRoute(points,0.5);
  };
  if(!object)return fallback(`Missing ${PAYLOAD_RULES.routeLayer}/payload-route.`);
  try{
    if(!object.polyline)throw new Error('the object is not a polyline');
    if(object.rotation)throw new Error('the polyline must not be rotated');
    const points=object.polyline.map(p=>({x:object.x+p.x,y:object.y+p.y}));
    const route=makeRoute(points,0.5);
    const blue=teamSpawn(source,'A'),red=teamSpawn(source,'B');
    const direct=distance(points[0],blue)+distance(points.at(-1),red);
    const reversed=distance(points[0],red)+distance(points.at(-1),blue);
    if(direct>=reversed)throw new Error('point order must start at BLUE/A and end at RED/B');
    const initialFraction=propertiesOf(object).initialFraction;
    if(initialFraction!==undefined&&initialFraction!==0.5)throw new Error('initialFraction must be 0.5 (or omitted)');
    return route;
  }catch(error){
    return fallback(`Invalid ${PAYLOAD_RULES.routeLayer}/payload-route (${error.message}).`);
  }
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
