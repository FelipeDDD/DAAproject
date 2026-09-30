import { readNamedMapMarker } from './namedMapMarkers.js';

// Tiled rectangles are map-space interaction zones, independent of collision layers.
export function readNamedInteractionArea(source,name){
  const area=readNamedMapMarker(source,name);
  if(!area)return null;
  if(area.point||area.width<=0||area.height<=0){
    throw new Error(`Tiled interaction area "${name}" must be a non-empty rectangle.`);
  }
  return area;
}

export function pointInsideInteractionArea(area,x,y){
  if(!area||![x,y,area.x,area.y,area.width,area.height].every(Number.isFinite)||
    area.width===0||area.height===0)return false;
  const left=Math.min(area.x,area.x+area.width),right=Math.max(area.x,area.x+area.width);
  const top=Math.min(area.y,area.y+area.height),bottom=Math.max(area.y,area.y+area.height);
  return x>=left&&x<=right&&y>=top&&y<=bottom;
}
