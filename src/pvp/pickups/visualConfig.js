// Presentation only: changing art/scale/animation never changes collection area.
export const PVP_PICKUP_VISUAL=Object.freeze({
  health:Object.freeze({texture:null,scale:1,offsetX:0,offsetY:0,depth:'y',depthOffset:2,
    placeholderRadius:12,color:0x289568,borderColor:0x718e89,
    caseColor:0xf3f4e8,caseShadeColor:0xd5dfd7,handleColor:0x8a9f98,latchColor:0xc8b57c,
    // Durations are one leg of the smooth sine/yoyo motion (full cycle = 2x).
    bobDistance:4,bobDurationMs:1200,
    rotationMode:'sway',rotationAmount:.07,rotationDurationMs:1800,
    // With rotationMode:'spin', rotationDurationMs is one full revolution.
    glowEnabled:true,glowColor:0x63d692,glowWidth:30,glowHeight:10,
    glowOffsetX:0,glowOffsetY:14,glowDepth:-1.8,glowAlpha:.18,glowScale:1,
    glowPulse:true,glowPulseAlpha:.18,glowPulseScale:.04,glowPulseDurationMs:1400,
    collectEffect:true,collectDurationMs:200,collectScale:1.18,collectGlowScale:1.12,collectEase:'Sine.Out',
    respawnEffect:true,respawnDurationMs:320,respawnStartScale:.8,respawnGlowBoost:1.4,respawnEase:'Sine.Out'}),
});
export function pickupDebugEnabled(env={},storage=globalThis.localStorage){
  if(!env.DEV)return false;
  try{return env.VITE_PVP_PICKUP_DEBUG==='true'||storage?.getItem('daa-pvp-pickup-debug')==='true';}
  catch{return env.VITE_PVP_PICKUP_DEBUG==='true';}
}
