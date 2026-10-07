import { readNamedMapMarker } from '../maps/namedMapMarkers.js';
import { GAMBLE_MACHINE } from './config.js';

export function gambleMachinePlacement(source,{dev=false,warn=console.warn,config=GAMBLE_MACHINE}={}){
  let marker=readNamedMapMarker(source,config.markerName);
  if(!marker&&dev){
    marker=readNamedMapMarker(source,config.devFallbackMarkerName);
    warn(marker
      ?`[GAMBLE MACHINE DEV] Using Tiled fallback ${config.devFallbackMarkerName}. Create ${config.markerName} in Notes.`
      :`[GAMBLE MACHINE DEV] Missing ${config.markerName} in Notes; machine disabled. Add a point at its floor/base position.`);
  }
  if(!marker)return null;
  const tileWidth=source.tilewidth,tileHeight=source.tileheight;
  const width=config.baseWidthTiles*tileWidth,height=config.baseHeightTiles*tileHeight;
  const x=marker.x+config.baseOffsetX,y=marker.y+config.baseOffsetY;
  return {marker,x:marker.x,y:marker.y,
    maxWidth:config.maxWidthTiles*tileWidth,maxHeight:config.maxHeightTiles*tileHeight,
    base:{x:x-width/2,y:y-height,width,height},interactionDistance:config.interactionDistanceTiles*tileWidth};
}

export function machineDisplaySize(frame,placement){
  const scale=Math.min(placement.maxWidth/frame.width,placement.maxHeight/frame.height);
  return {width:frame.width*scale,height:frame.height*scale,scale};
}

export function nearMachineBase(body,placement){
  if(!body?.center||!placement)return false;
  const base=placement.base,p=body.center;
  const dx=Math.max(base.x-p.x,p.x-(base.x+base.width),0);
  const dy=Math.max(base.y-p.y,p.y-(base.y+base.height),0);
  return Math.hypot(dx,dy)<=placement.interactionDistance;
}
