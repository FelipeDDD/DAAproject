import { addPixelCombinations } from './pixelCombinations.js';

const sheet=(name,at,ms,extra={})=>({sheet:name,at,ms,...extra});
const pixel=(name,at,ms,extra)=>sheet('pfx-'+name,at,ms,extra);
const mark=(at,ms,radius,color,extra)=>({mark:radius,color,at,ms,floor:true,...extra});
const field=(kind,at,ms,extra)=>({field:kind,at,ms,...extra});

function ring(count,radius){
  return Array.from({length:count},(_,i)=>{
    const angle=i*Math.PI*2/count;
    return [Math.round(Math.cos(angle)*radius),Math.round(Math.sin(angle)*radius*0.55)];
  });
}

export function tuneEffects(effects){
  // Existing comparisons retain their original playback speeds. Longer experiments
  // open at their authored duration, so the portal warning and storm cadence read in real time.
  function add(id,name,clips){
    const effect=effects[id];
    effect.variants[name]=clips;
    effect.variantDurations??={};
    effect.variantDurations[name]=Math.max(...clips.map(c=>c.at+c.ms));
  }
  for(const id of ['fire-impact','ice-shards','hit-spark']){
    effects[id].clickToCast=true;
    effects[id].aimPreview=true;
  }
  for(const [id,name,scale] of [['ice-shards','shards',1.55],['hit-spark','spark',1.8]]){
    const variants=effects[id].variants;
    variants.Subtle=variants.Original;
    variants.Original=[sheet(name,0,effects[id].durationMs,{scale,offset:[0,-10]}),
      sheet(name,105,190,{scale:0.65,flip:true,offset:id==='hit-spark'?[9,-16]:[-10,-5]})];
  }

  add('fireball','Echo blast',[...effects.fireball.variants.Original,
    mark(600,440,17,0xffbb70,{scatter:true}),sheet('blast',1040,830,{scatter:true,scale:1.08})]);
  add('meteor','Long warning',[mark(0,1690,35,0xffaa68),
    sheet('meteor',1410,1850,{scale:1.22}),sheet('smoke',2020,1150,{scale:1.05})]);
  add('chain','Relay target',[
    field('relay',0,980,{offset:[46,-22]}),{arc:true,at:0,ms:210,offset:[0,-13]},
    sheet('spark',120,250,{offset:[0,-13]}),
    {arc:true,at:295,ms:240,fromOffset:[0,-13],offset:[46,-33],seed:5},
    sheet('shards',430,350,{offset:[46,-33],scale:0.8}),
  ]);
  add('beam','Channel',[sheet('ray',0,2500,{beam:true,holdBeam:true,offset:[0,-17]})]);

  add('portal','Ritual threshold',[
    pixel('runes',0,2770,{floor:true,scale:0.83,fade:true}),
    pixel('doorway',2450,2800,{scale:0.80,cycles:2,fade:true}),
  ]);
  add('cloud','Spore field',[pixel('gas',0,4100,{scale:0.73,fade:true}),
    field('spores',90,3860),sheet('miasma',900,1800,{offset:[-38,4],scale:0.54,fade:true})]);
  add('tornado','Pursuit',[field('lure',0,3150),
    sheet('cyclone',0,3150,{chase:true,cycles:3,fade:true,scale:0.82})]);
  const sites=ring(9,70);
  add('tempest','Storm field',[mark(0,430,75,0x9cadef),field('storm',180,3720,{floor:true}),
    ...Array.from({length:12},(_,i)=>sheet('bolt',340+i*300,670,
      {offset:sites[i*4%sites.length],scale:i%3===0?0.96:0.73,flip:i%2===0}))]);
  add('vortex','Gravity well',[field('pull',0,3300),sheet('rift',160,2980,{offset:[0,-8]}),
    sheet('spirit',2850,730,{scale:0.68,offset:[0,-8]})]);
  addPixelCombinations(effects,add);
}

export function pixelExperiments(sequence){
  const melee=(name,at,ms,scale)=>pixel(name,at,ms,{melee:true,scale,offset:[0,-26]});
  const contact=(at,dist)=>sheet('spark',at,230,{contact:dist,scale:0.67});
  const windup=(at,ms)=>pixel('charge',at,ms,{caster:true,scale:0.49,fade:true});
  const cleave=[windup(0,260),melee('cleave',220,1230,0.75),contact(450,43)];
  const knives=[melee('ice-daggers',0,680,0.65),pixel('prism',390,410,{contact:27,scale:0.21,fade:true}),
    sheet('frost',415,290,{contact:26,scale:0.23,fade:true})];
  const drain=[{precision:'drain',at:0,ms:1350}];
  return {
    cleaver:sequence('Ember Cleave','#ffaf62',cleave,{
      Riposte:[...cleave,melee('daggers',780,620,0.75),contact(1170,38)]}),
    flurry:sequence('Frost Knives','#90d9ee',knives),
    lash:sequence('Copper Lash','#efc694',[melee('whip',0,810,0.84),{precision:'tip',at:0,ms:810}]),
    drain:sequence('Life Steal','#ea888d',drain),
    tesla:sequence('Tesla Coil','#81c9ff',[pixel('coil',0,2450,{scale:0.75,fade:true})]),
    snare:sequence('Root Snare','#b3cb73',[mark(0,300,20,0xa2c079),pixel('roots',270,2700,{scale:0.91})]),
    skulls:sequence('Necro Skulls','#8adbb7',[{sheet:'pfx-altar',missileSheet:'pfx-skull',encounter:'altar',at:0,ms:5700}]),
    beacon:sequence('Glacier Beacon','#92deef',[pixel('prism',0,2200,{fade:true}),
      sheet('shards',1750,470,{offset:[0,-25]})]),
    sporecap:sequence('Sporecap','#aec66b',[pixel('spores',0,2750,{scale:0.83})],{
      'Lingering spores':[pixel('spores',0,2200,{scale:0.83}),field('spores',1250,3300)]}),
  };
}
