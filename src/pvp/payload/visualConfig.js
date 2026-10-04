// Presentation only. PayloadAuthority reads PAYLOAD_RULES in config.js and does
// not depend on these themes, Phaser assets, or draw depths.
export const PAYLOAD_THEMES=Object.freeze({
  equipmentCart:Object.freeze({
    id:'equipmentCart',sprite:null,scale:1,offsetX:0,offsetY:0,depth:'y',depthOffset:0,
    radiusScale:1,labelOffsetY:-28,
    colors:Object.freeze({neutral:0xcbd0d5,A:0x67bfff,B:0xf17b70,contested:0xf5c65a}),
    cart:Object.freeze({base:0x79878e,outline:0xc9d3d7,wheel:0x171e28,detail:0x303d46}),
  }),
});

export const PAYLOAD_VIEW_CONFIG=Object.freeze({
  theme:'equipmentCart',showRoute:true,routeDepth:-1.8,
  routeColor:0xc7ccd1,routeAlpha:.18,routeWidth:2,routeEndpointRadius:10,
});

export function payloadTheme(nameOrTheme=PAYLOAD_VIEW_CONFIG.theme){
  if(typeof nameOrTheme==='string'){
    const theme=PAYLOAD_THEMES[nameOrTheme];
    if(!theme)throw new Error(`Unknown Payload visual theme: ${nameOrTheme}`);
    return theme;
  }
  if(!nameOrTheme||typeof nameOrTheme!=='object')throw new Error('Invalid Payload visual theme.');
  const base=PAYLOAD_THEMES[PAYLOAD_VIEW_CONFIG.theme];
  return {...base,...nameOrTheme,colors:{...base.colors,...nameOrTheme.colors},cart:{...base.cart,...nameOrTheme.cart}};
}

