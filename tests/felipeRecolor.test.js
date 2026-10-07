import assert from 'node:assert/strict';
import test from 'node:test';
import {readRgbaPng} from './helpers/readRgbaPng.js';
import {createFelipeMaterialMask,decodeFelipeMaterialMask,recolorFelipePixels,prepareFelipeRecolorTexture,updateFelipeRecolorTexture,FELIPE_TEST_PALETTE} from '../src/art/felipeRecolor.js';
import {characterById} from '../src/characters.js';


const source=readRgbaPng(new URL('../public/assets/characters/experimental/felipe-level3-hd.png',import.meta.url));
const mask=createFelipeMaterialMask(source.data,source.width,source.height);
const result=recolorFelipePixels(source.data,mask);

test('runtime recolor preserves every alpha pixel and all unmasked RGB values',()=>{
  const original=new Uint8Array(source.data);
  for(let p=0;p<mask.length;p++){
    assert.equal(result[p*4+3],source.data[p*4+3]);
    if(mask[p]===0)for(let c=0;c<3;c++)assert.equal(result[p*4+c],source.data[p*4+c]);
  }
  assert.notEqual(result,source.data);
  recolorFelipePixels(source.data,mask);
  assert.deepEqual(source.data,original);
});

test('all 24 frames have four recolorable materials and unchanged skin, emblem and green can pixels',()=>{
  for(let frame=0;frame<24;frame++){
    const counts=[0,0,0,0,0];let skin=0,white=0,green=0;
    for(let y=0;y<144;y++)for(let x=0;x<128;x++){
      const p=(Math.floor(frame/6)*144+y)*source.width+(frame%6)*128+x,i=p*4;
      if(!source.data[i+3])continue;
      counts[mask[p]]++;
      const [r,g,b]=source.data.subarray(i,i+3);
      if(r-g>18&&r>b*1.25){skin++;assert.equal(mask[p],0);}
      if(Math.min(r,g,b)>180){white++;assert.equal(mask[p],0);}
      if(g>55&&g>r*1.4&&g>b*1.6){green++;assert.equal(mask[p],0);}
    }
    for(let material=1;material<5;material++)assert.ok(counts[material]>30,`frame ${frame}, material ${material}`);
    assert.ok(skin>0);assert.ok(green>0);
    if(frame<6)assert.ok(white>0);
  }
});

test('changing only hair palette does not change clothes, skin or accessories',()=>{
  const alternative=recolorFelipePixels(source.data,mask,{...FELIPE_TEST_PALETTE,hair:'#8f618e'});
  let changed=0;
  for(let p=0;p<mask.length;p++){
    if(mask[p]===1){if(alternative[p*4]!==result[p*4])changed++;}
    else for(let c=0;c<4;c++)assert.equal(alternative[p*4+c],result[p*4+c]);
  }
  assert.ok(changed>1000);
  assert.deepEqual(recolorFelipePixels(source.data,mask,{}),new Uint8ClampedArray(source.data));
});

test('recolor retains shading variation within each material',()=>{
  for(let material=1;material<5;material++){
    const colors=new Set();
    for(let p=0;p<mask.length;p++)if(mask[p]===material)colors.add(result.subarray(p*4,p*4+3).join(','));
    assert.ok(colors.size>5,`material ${material} must not become a flat fill`);
  }
});

test('registered texture is created once, is cached across scenes and uses the HD frame grid',()=>{
  const visual=characterById('felipe').experimentalVisual;
  const image={},maskImage={},canvas={},cache=new Set(),calls=[];
  const textures={exists:key=>cache.has(key),get:key=>{
    assert.ok([visual.recolorSource,visual.recolorMaskSource].includes(key));
    return {getSourceImage:()=>key===visual.recolorSource?image:maskImage};
  },addSpriteSheet:(key,source,grid)=>{cache.add(key);calls.push({key,source,grid});}};
  let generated=0;
  const createCanvas=(source,palette,labels)=>{assert.equal(source,image);assert.equal(labels,maskImage);
    assert.equal(palette,FELIPE_TEST_PALETTE);generated++;return canvas;};
  for(let scene=0;scene<5;scene++)prepareFelipeRecolorTexture(textures,visual,createCanvas);
  assert.equal(generated,1);assert.equal(calls.length,1);
  assert.deepEqual(calls[0],{key:visual.sprite,source:canvas,grid:{frameWidth:128,frameHeight:144}});
  prepareFelipeRecolorTexture(textures,{sprite:'classic'},()=>assert.fail('classic art must not recolor'));
});

test('palette changes redraw the existing animated spritesheet from the original image',()=>{
  const visual=characterById('felipe').experimentalVisual;
  const sourceImage={},maskImage={};const draws=[];let uploads=0;
  const canvas={width:768,height:576,getContext:()=>({clearRect(){},drawImage:image=>draws.push(image)})};
  const texture={getSourceImage:()=>canvas,source:[{update:()=>uploads++}]};
  const textures={exists:key=>key===visual.sprite,get:key=>key===visual.sprite?texture:{getSourceImage:()=>key===visual.recolorMaskSource?maskImage:sourceImage}};
  const palette={...FELIPE_TEST_PALETTE,shirt:'#be5b54'};
  assert.equal(updateFelipeRecolorTexture(textures,visual,palette,(source,colors,labels)=>{
    assert.equal(source,sourceImage);assert.equal(labels,maskImage);assert.deepEqual(colors,palette);return {changed:true};
  }),true);
  assert.deepEqual(draws,[{changed:true}]);assert.equal(uploads,1);
  assert.equal(updateFelipeRecolorTexture(textures,{sprite:'classic'},palette),false);
});

test('incompatible masks, sheets and invalid colors fail explicitly',()=>{
  assert.throws(()=>createFelipeMaterialMask(source.data,384,288),/768x576/);
  assert.throws(()=>recolorFelipePixels(source.data,new Uint8Array(1)),/dimensions/);
  assert.throws(()=>recolorFelipePixels(source.data,mask,{hair:'not-a-color'}),/Invalid hair/);
});


test('editable PNG labels replace the generated mask and preserve fixed/transparent pixels',()=>{
  const labels=readRgbaPng(new URL('../public/assets/characters/experimental/felipe-level3-hd-material-mask.png',import.meta.url));
  const edited=decodeFelipeMaterialMask(labels.data,labels.width,labels.height);
  const tinted=recolorFelipePixels(source.data,edited);
  assert.ok(edited.some((material,p)=>material!==mask[p]),'the edited mask must differ from the generated boundaries');
  for(let frame=0;frame<24;frame++){
    const counts=[0,0,0,0,0];
    for(let y=0;y<144;y++)for(let x=0;x<128;x++){
      const p=(Math.floor(frame/6)*144+y)*768+(frame%6)*128+x;
      counts[edited[p]]++;
      assert.equal(tinted[p*4+3],source.data[p*4+3]);
      if(!edited[p])assert.deepEqual(tinted.subarray(p*4,p*4+4),new Uint8ClampedArray(source.data.subarray(p*4,p*4+4)));
    }
    for(let material=1;material<5;material++)assert.ok(counts[material]>30);
  }
});

test('mask decoding uses only explicit material colors, never pasted skin or ink',()=>{
  const labels=new Uint8Array(768*576*4);
  labels.set([255,0,0,255,0,255,0,128,0,0,255,255,255,255,0,255,
    245,183,136,255,255,0,0,0,0,0,0,255]);
  assert.deepEqual([...decodeFelipeMaterialMask(labels,768,576).slice(0,7)],[1,2,3,4,0,0,0]);
  assert.throws(()=>decodeFelipeMaterialMask(labels,128,144),/768x576/);
});
