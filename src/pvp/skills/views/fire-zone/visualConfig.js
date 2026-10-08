// Presentation only. Radius/position/phase come from the server snapshot.
export const FIRE_ZONE_VISUAL=Object.freeze({depth:-1.6,color:0xf29a51,
  telegraphAlpha:.65,telegraphFillAlpha:.04,activeAlpha:.42,activeFillAlpha:.08,
  lineWidth:1,centerRadius:3,
  pixelSize:2,flameCount:49,edgeFlameCount:16,edgeInset:2,flameFrameMs:110,flameAlpha:.86,
  flameSpread:.98,glowRadius:7,glowAlpha:.1,
  aimCursor:'crosshair',aimColor:0xf2c66d,aimClampedColor:0xff9b59,
  aimFillAlpha:.09,aimLineAlpha:.9,aimLineWidth:1.5,
  flameColors:Object.freeze([0xcf4225,0xf57b28,0xffc34c,0xffec9d]),
  emberColor:0xffbb55,emberAlpha:.6,emberRisePixels:3,
});

// Small hand-drawn pixel frames, back to front: red outline, orange, gold, pale core.
// Empty cells stay transparent. No texture or gameplay radius is derived from them.
export const FIRE_ZONE_FLAME_FRAMES=Object.freeze([
  ['...1...','...1...','..121..','..121..','.1221..','.12321.','112321.','1234321','.23432.','..222..'],
  ['....1..','...11..','...21..','..121..','..2321.','.12321.','.123211','1234321','.23432.','..222..'],
  ['..1....','..11...','..12...','..121..','.1231..','.12321.','112321.','1234321','.23432.','..222..'],
  ['.......','...1...','...11..','..121..','.1221..','112321.','123321.','.234321','.23432.','..222..'],
].map(frame=>Object.freeze(frame)));
