import { objectsIn } from '../maps/tiledObjects.js';
import { PVP_MAP_LAYOUT } from './config.js';

export function readPvpTeleportAreas(source,config=PVP_MAP_LAYOUT.teleports){
  const layer=source.layers.find(entry=>entry.name===config.layer&&entry.type==='objectgroup');
  if(!layer)return [];
  const objects=objectsIn(source,config.layer),areas={};
  for(const name of [config.top,config.bottom]){
    const marker=objects.find(object=>object.name===name);
    if(!marker)continue;
    if(marker.rotation||marker.point||marker.polygon||marker.ellipse||marker.polyline||marker.gid
      ||!Number.isFinite(marker.x)||!Number.isFinite(marker.y)||!Number.isFinite(marker.width)||!Number.isFinite(marker.height)
      ||marker.width<=0||marker.height<=0)
      throw new Error(`PvP Teleport/${name} must be an unrotated rectangle with positive width and height.`);
    areas[name]={name,x:marker.x,y:marker.y,width:marker.width,height:marker.height};
  }
  if(Object.keys(areas).length===0)return [];
  if(!areas[config.top]||!areas[config.bottom])
    throw new Error(`Add both rectangle objects ${config.layer}/${config.top} and ${config.layer}/${config.bottom}.`);
  return [areas[config.top],areas[config.bottom]];
}

const overlaps=(body,area)=>body.x<area.x+area.width&&body.x+body.width>area.x
  &&body.y<area.y+area.height&&body.y+body.height>area.y;

// Sprite x/y are the foot anchor, not the center of its Arcade body. Small edge
// triggers land the feet towards the map interior so they do not straddle the
// adjacent wall. This changes no collision geometry.
export function pvpTeleportArrival(teleport,areas,body,player){
  const target=areas.find(area=>area.name===teleport.to);
  const centerY=target===areas[0]?Math.max(teleport.y,target.y+body.height/2)
    :Math.min(teleport.y,target.y+target.height-body.height/2);
  // Use the intrinsic offset: during Scene.update the body's physics position
  // may already include this frame's movement while the sprite has not caught up.
  const offsetX=body.transform&&body.offset?body.transform.scaleX*(body.offset.x-body.transform.displayOriginX):body.x-player.x;
  const offsetY=body.transform&&body.offset?body.transform.scaleY*(body.offset.y-body.transform.displayOriginY):body.y-player.y;
  return {x:teleport.x-offsetX-body.width/2,y:centerY-offsetY-body.height/2};
}

export class PvpTeleportController{
  constructor(areas,{cooldownMs=PVP_MAP_LAYOUT.teleports.cooldownMs}={}){
    if(!Number.isFinite(cooldownMs)||cooldownMs<0)throw new Error('Invalid PvP teleport cooldown.');
    Object.assign(this,{areas,cooldownMs});this.cooldownUntil=0;this.lockedDestination=null;
  }
  update(body,now){
    if(!body||!Number.isFinite(now)||this.areas.length!==2)return null;
    if(this.lockedDestination){
      if(overlaps(body,this.lockedDestination)||now<this.cooldownUntil)return null;
      this.lockedDestination=null;
    }
    if(now<this.cooldownUntil)return null;
    const source=this.areas.find(area=>overlaps(body,area));
    if(!source)return null;
    const target=this.areas.find(area=>area!==source);
    this.lockedDestination=target;this.cooldownUntil=now+this.cooldownMs;
    return {from:source.name,to:target.name,x:target.x+target.width/2,y:target.y+target.height/2};
  }
  reset(){this.cooldownUntil=0;this.lockedDestination=null;}
}
