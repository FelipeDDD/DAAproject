// Offline export using a checkout of the version pinned in SOURCES.md.
import { writeFileSync } from 'node:fs';
import { SLIMES } from '../../src/vfx/lab/slimeVariants.js';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if(!process.argv[2])throw Error('Usage: node tools/vfx-lab/generate-pixelfx.mjs <pixelfx checkout> [--combat]');
const source=pathToFileURL(resolve(process.argv[2],'tools/lib/fxlib.mjs'));
const {loadEffect,renderFrames}=await import(source);
const {encodePNG}=await import(new URL('png.mjs',source));
const out=new URL('./sheets/',import.meta.url);
const purple=['#241a40','#493167','#75439b','#a46acc','#db9aec','#ffe2ff'];
const recipes=[
  ['cleave','melee/heavy-cleave'],['daggers','melee/dagger-flurry'],['whip','melee/whip-crack'],
  ['charge','arcane/spell-charge'],['runes','arcane/rune-circle',{palette:purple}],
  ['doorway','arcane/portal',{palette:purple}],['coil','lightning/tesla-coil'],
  ['roots','nature/root-snare'],
  ['prism','ice/ice-crystal'],['spores','nature/spore-burst'],
  ['gas','nature/poison-cloud'],['bloom','nature/healing-bloom'],
  ['altar','shadow/necro-skulls'],['skull','critters/flying-skull',{
    palette:['#040e10','#0a2228','#0f3d44','#16615f','#23907f','#45c4a0','#9af0c8','#e8fff4'],
    bone:['#0c1a1c','#2c4a4a','#5c847c','#a6cdb8','#e4fff0'],hover:8,floor:false,
  }],
  ['ice-daggers','melee/dagger-flurry',{palette:['#15273f','#205378','#4293bb','#82d1df','#c6f7ff','#ffffff'],
    sparks:['#ffffff','#ccffff','#8ee7ff','#469fdb']}],
  ['heal','holy/heal',{palette:['#153433','#326745','#59a85d','#9fde8e','#d6ffbf','#ffffff'],
    actor:{x:0,y:0,w:0,h:0,mask:{w:0,h:0,data:[]}}}],
  ['spawn','spawn/spawn-portal',{palette:purple}],['circle','arcane/magic-circle-cast',{palette:purple}],
  ['firenado','fire/fire-tornado'],['icenado','ice/blizzard-vortex'],['wind','nature/tornado'],
  ['heal-ring','holy/heal-aoe'],
];

const combat=process.argv.includes('--combat');
const manifest={};
const combatRecipes=[
  ...Object.entries(SLIMES).map(([key,{palette}])=>[key,'critters/slime',palette?{palette}:undefined]),
  ['frost-nova','ice/frost-nova'],['ghost','critters/ghost'],['spectral-orb','arcane/arcane-orb'],
  ['combat-meteor','fire/meteor'],
  ['snake','critters/snake'],['frog','critters/frog'],
];
for(const [key,id,options] of combat?combatRecipes:recipes){
  const fx=await loadEffect(id);
  const {w,h,frames}=renderFrames(fx,{actor:false,bg:'none',fps:20,options});
  // Trim once across the animation, retaining the pivot even on sparse frames.
  const [ox,oy]=fx.meta.origin;
  let left=ox,top=oy,right=ox,bottom=oy,peak=0,poster;
  for(const [i,{clear}] of frames.entries()){
    let x0=w,y0=h,x1=-1,y1=-1,ink=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const a=clear[(y*w+x)*4+3];
      if(!a)continue;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
      if(a<40)continue;
      ink+=a;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
    }
    if(ink>peak){peak=ink;poster=[i,x0,y0,x1-x0+1,y1-y0+1];}
  }
  if(!peak)throw Error('Empty export: '+id);
  poster[1]-=left;poster[2]-=top;
  const width=right-left+1,height=bottom-top+1,cols=Math.min(8,frames.length);
  const stride=cols*width,rows=Math.ceil(frames.length/cols);
  const pixels=Buffer.alloc(stride*rows*height*4);
  for(const [i,{clear}] of frames.entries()){
    for(let y=0;y<height;y++){
      const src=((top+y)*w+left)*4;
      const dst=((Math.floor(i/cols)*height+y)*stride+i%cols*width)*4;
      pixels.set(clear.subarray(src,src+width*4),dst);
    }
  }
  const name='pfx-'+key;
  writeFileSync(new URL(name+'.png',out),encodePNG(stride,height*rows,pixels));
  manifest[name]={width,height,anchor:[ox-left,oy-top],poster,frameMs:frames.map(()=>50)};
  console.log(id,frames.length,width,height);
}
const entries=Object.entries(manifest).map(([name,data])=>'  '+JSON.stringify(name)+': '+JSON.stringify(data));
writeFileSync(new URL(combat?'combat-pixelfx.json':'pixelfx.json',out),'{\n'+entries.join(',\n')+'\n}\n');
