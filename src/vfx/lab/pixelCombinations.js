import { handOf, LASH } from './precisionDemo.js';

const shot=(sheet,at,ms,props={})=>({sheet,at,ms,...props});
const fx=(name,at,ms,props)=>shot('pfx-'+name,at,ms,props);
const field=(name,at,ms,props={})=>({field:name,at,ms,...props});

export const smokeRadius={defaultPx:48,minPx:32,maxPx:144,stepPx:16};

export function smokeScreen(radius=smokeRadius.defaultPx){
  const r=Math.min(smokeRadius.maxPx,Math.max(smokeRadius.minPx,radius));
  // Equal-area spiral. Fixed sprite scale, staggered plumes, at most 64 live quads.
  const count=Math.min(64,Math.max(8,Math.ceil(r*r/320)));
  return Array.from({length:count},(_,i)=>{
    const distance=r*Math.sqrt(i/count),angle=i*2.399963;
    const at=Math.round(380*distance/r+80*(i%3));
    return shot('smoke',at,3800-at,{offset:[Math.cos(angle)*distance,Math.sin(angle)*distance*0.70],
      scale:1.38,flip:i%2===0,fade:true,tint:i%3===0?0xbac3d7:0xffffff,
      smokePhase:(i*0.618)%1,opacity:0.9});
  });
}

export function addPixelCombinations(effects,add){
  effects.lash.clickToCast=true;
  delete effects.lash.castRangePx;
  effects.lash.fixedReachPx=LASH.reach;
  effects.drain.clickToCast=true;
  effects.drain.preparation={
    always:true,durationMs:750,create(scene,_anchor,_nearest,player,{captureAim,durationMs}){
      const g=scene.add.graphics();
      return {update(ms){
        const hand=handOf(player),aim=captureAim?.()??_anchor;
        const k=ms/durationMs,target=scene.selectedDummy??scene.target;
        g.clear().setDepth(player.y+5).lineStyle(1,0xc9687c,0.45).lineBetween(hand.x,hand.y,aim.x,aim.y)
          .lineStyle(1,0xffb1ad).strokeCircle(hand.x,hand.y,7-4*k);
        if(target&&!scene.resolveSandboxStrike)g.strokeCircle(target.x,target.y-target.displayHeight*0.42,6);
      },destroy:()=>g.destroy()};
    },
  };

  const smoke=effects['smoke-burst'];
  smoke.variantRadius={'Smoke screen':smokeRadius,Camouflage:{...smokeRadius,defaultPx:96}};
  const camo=(radius=smoke.variantRadius.Camouflage.defaultPx)=>[...smokeScreen(radius),{camouflage:true,at:0,ms:3800,radius}];
  smoke.buildClips={'Smoke screen':smokeScreen,Camouflage:camo};
  add('smoke-burst','Camouflage',camo());
  add('smoke-burst','Smoke screen',smokeScreen());
  const compactSites=Array.from({length:7},(_,i)=>[Math.round(29*Math.cos(i*2*Math.PI/7)),
    Math.round(29*0.55*Math.sin(i*2*Math.PI/7))]);
  add('smoke-burst','Compact waves',[[0,1],...compactSites].flatMap((offset,i)=>[0,1,2].map(wave=>
    shot('smoke',i*64+wave*880,1550,{offset,scale:1.42,flip:i%2===0,fade:true,
      tint:i%3===0?0xbac3d7:0xffffff,opacity:i===0?1:0.83}))));
  add('slash','Hand arc',[shot('sweep',0,410,{contact:23,turnToAim:true,scale:0.80}),
    shot('spark',150,210,{contact:39,scale:0.70})]);

  const electrodes=[[48,-16],[-37,23],[26,37]];
  const coil=[fx('coil',0,3300,{scale:0.73,fade:true})];
  electrodes.forEach(([x,y],i)=>{
    coil.push(field('relay',0,3300,{offset:[x,y]}));
    for(let wave=0;wave<2;wave++){
      const at=430+i*250+wave*1300;
      coil.push({arc:true,at,ms:210,fromOffset:[0,-38],offset:[x,y-11],seed:i+wave},
        shot('spark',at+70,170,{offset:[x,y-11],scale:0.5,tint:0xb4eaff}));
    }
  });
  add('tesla','Relay array',coil);
  effects.snare.preparation={
    always:true,lockAnchor:true,durationMs:600,create(scene,point){
      const g=scene.add.graphics().setPosition(point.x,point.y).setDepth(point.y-64);
      return {update(ms){
        g.clear().lineStyle(2,0xa2c079,0.45*Math.min(1,ms/140)).strokeEllipse(0,0,40,20);
      },destroy:()=>g.destroy()};
    },
  };
  add('tesla','Sentry',[{sheet:'pfx-coil',encounter:'sentry',at:0,ms:6000}]);
  effects.tesla.defaultVariant='Sentry';
  add('sporecap','Proximity mine',[{sheet:'pfx-spores',encounter:'mine',at:0,ms:5900}]);
  effects.sporecap.defaultVariant='Proximity mine';


  add('portal','Combined passage',[
    fx('circle',0,2500,{frames:[0,0.37],scale:0.78,floor:true}),
    fx('spawn',2400,900,{frames:[0,0.25],scale:0.76}),
    fx('doorway',2950,2600,{scale:0.73,cycles:2,fade:true}),
    fx('spawn',5180,1200,{frames:[0.47,0.86],scale:0.76,fade:true}),
  ]);
  for(const [name,asset,scale] of [['Fire','firenado',0.74],['Frost','icenado',0.88],['Wind','wind',0.66]]){
    add('tornado','PixelFX '+name+' pursuit',[field('lure',0,3500),
      fx(asset,0,3500,{chase:true,cycles:2,scale,fade:true})]);
  }
  // One second on the timeline advances exactly one second of each native sheet.
  // Split the spawn clip just before its collapse and bridge both halves with one upright loop.
  const spawnNative=3850,split=1800;
  add('portal','Runic passage',[
    fx('runes',0,3000,{scale:0.83,floor:true,frames:[0,0.75],fade:true}),
    fx('spawn',2350,split,{scale:0.76,frames:[0,split/spawnNative],fade:true}),
    fx('doorway',3450,2400,{scale:0.75,fade:true}),
    fx('spawn',5450,spawnNative-split,{scale:0.76,frames:[split/spawnNative,1],fade:true}),
  ]);
  effects.portal.defaultVariant='Runic passage';
  add('cloud','PixelFX low fog',[fx('gas',0,4200,{scale:0.76,fade:true})]);
  add('cloud','Combined low field',[fx('gas',0,4200,{scale:0.76,fade:true}),
    field('spores',0,4200),...[-35,6,39].map((x,i)=>shot('miasma',420+i*480,1750,
      {offset:[x,5-i*3],scale:0.49,flip:i%2===0,opacity:0.63,fade:true}))]);
}
