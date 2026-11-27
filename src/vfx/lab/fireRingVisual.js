import { PixelFxView } from './PixelFxView.js';
import * as fireRing from './vendor/pixelfx/fx/fire/fire-ring.js';

export const FIRE_RING_ART_MS=fireRing.meta.duration*1000;
export const FIRE_RING_ART_RADIUS=fireRing.meta.options.reach;
export const FIRE_RING_ART_CHARGE_MS=320;

export function createFireRingView(scene,anchor,filter,options,viewOptions){
  return new PixelFxView(scene,fireRing,anchor,filter,options,viewOptions);
}
