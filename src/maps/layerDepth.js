import { propertiesOf } from './tiledObjects.js';

export const isForegroundLayer=layer=>['overlay','foreground'].includes(layer.name?.toLowerCase());

// Players use their foot y as depth. Foreground defaults above every map y;
// an authored numeric depth always wins, including the existing overlay's 1200.
export function mapLayerDepth(layer,map,defaultDepth=-3){
  const depth=propertiesOf(layer).depth;
  if(Number.isFinite(depth))return depth;
  return isForegroundLayer(layer)?map.height*map.tileheight+100:defaultDepth;
}
