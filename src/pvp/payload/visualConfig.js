// Presentation only. PayloadAuthority reads PAYLOAD_RULES in config.js and does
// not depend on these themes, Phaser assets, or draw depths.
export const PAYLOAD_THEMES=Object.freeze({
  equipmentCart:Object.freeze({
    id:'equipmentCart',sprite:'payload-cart-pixel-v3',scale:1,offsetX:0,offsetY:0,depth:'y',depthOffset:0,
    animation:false,speech:true,originY:.95,radiusScale:1,labelOffsetY:-65,
    colors:Object.freeze({neutral:0xcbd0d5,A:0x67bfff,B:0xf17b70,contested:0xf5c65a}),
    cart:Object.freeze({base:0x79878e,outline:0xc9d3d7,wheel:0x171e28,detail:0x303d46}),
  }),
});

export const PAYLOAD_CART_ASSET=Object.freeze({key:'payload-cart-pixel-v3',path:'assets/pvp/equipment-cart-pixel-v3.png',frameWidth:128,frameHeight:64});

export function payloadCartFrame(time,moving){
  const sequence=moving?[0,1,2,3,2,1]:[0,0,1,0];
  return sequence[Math.floor(Math.max(0,time)/(moving?200:900))%sequence.length];
}

export const PAYLOAD_VIEW_CONFIG=Object.freeze({
  theme:'equipmentCart',showRoute:true,routeDepth:-1.8,
  routeColor:0xc7ccd1,routeAlpha:.18,routeWidth:2,routeEndpointRadius:10,
  field:Object.freeze({
    depth:-1.85,supersample:3,padding:12,
    washAlpha:.035,glowAlpha:.075,glowThickness:8,
    ringAlpha:.62,ringThickness:2.2,
    secondaryInset:8,secondaryAlpha:.24,secondaryThickness:1.1,
    segmentRadiusOffset:4,segmentCount:8,segmentAlpha:.58,segmentThickness:2.4,
    pulsePeriodMs:2600,pulseScale:.012,pulseAlpha:.08,orbitSpeedRadPerSec:.08,
  }),
  collision:Object.freeze({enabled:true,width:64,height:22,offsetX:0,offsetY:-20}),
});

export function payloadTheme(nameOrTheme=PAYLOAD_VIEW_CONFIG.theme){
  if(typeof nameOrTheme==='string'){
    const theme=PAYLOAD_THEMES[nameOrTheme];
    if(!theme)throw new Error(`Unknown Payload visual theme: ${nameOrTheme}`);
    return theme;
  }
  if(!nameOrTheme||typeof nameOrTheme!=='object')throw new Error('Invalid Payload visual theme.');
  const base=PAYLOAD_THEMES[PAYLOAD_VIEW_CONFIG.theme];
  return {...base,...nameOrTheme,animation:nameOrTheme.animation??(!nameOrTheme.sprite||nameOrTheme.sprite===base.sprite?base.animation:false),
    colors:{...base.colors,...nameOrTheme.colors},cart:{...base.cart,...nameOrTheme.cart}};
}

