import sheets from '../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};

export const METEOR_SHEET='pfx-combat-meteor';
const frames=sheets[METEOR_SHEET].frameMs;
// Frame 13 is the first atlas sample at or after the PixelFX impact.
export const METEOR_FALL_MS=frames.slice(0,13).reduce((total,ms)=>total+ms,0);
export const METEOR_ART_MS=frames.reduce((total,ms)=>total+ms,0);
