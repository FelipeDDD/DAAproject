import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
import {createFelipeMaterialMask,recolorFelipePixels,prepareFelipeRecolorTexture,updateFelipeRecolorTexture,FELIPE_TEST_PALETTE} from '../src/art/felipeRecolor.js';
import {characterById} from '../src/characters.js';

// Read the actual RGBA PNG so protection tests cover the shipped 24-frame asset.
function readRgbaPng(path){
  const png=readFileSync(path),width=png.readUInt32BE(16),height=png.readUInt32BE(20),chunks=[];
  assert.equal(png[24],8);assert.equal(png[25],6);assert.equal(png[28],0);
  for(let p=8;p<png.length;){
    const length=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);
    if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+length));
    p+=length+12;
  }
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,data=new Uint8Array(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){
    const filter=raw[y*(stride+1)];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){
      const i=y*stride+x,left=x>=4?data[i-4]:0,up=y?data[i-stride]:0,corner=x>=4&&y?data[i-stride-4]:0;
      const prediction=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];
      data[i]=(raw[y*(stride+1)+1+x]+prediction)&255;
    }
  }
  return {width,height,data};
}
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
  const image={},canvas={},cache=new Set(),calls=[];
  const textures={exists:key=>cache.has(key),get:key=>{
    assert.equal(key,visual.recolorSource);return {getSourceImage:()=>image};
  },addSpriteSheet:(key,source,grid)=>{cache.add(key);calls.push({key,source,grid});}};
  let generated=0;
  const createCanvas=source=>{assert.equal(source,image);generated++;return canvas;};
  for(let scene=0;scene<5;scene++)prepareFelipeRecolorTexture(textures,visual,createCanvas);
  assert.equal(generated,1);assert.equal(calls.length,1);
  assert.deepEqual(calls[0],{key:visual.sprite,source:canvas,grid:{frameWidth:128,frameHeight:144}});
  prepareFelipeRecolorTexture(textures,{sprite:'classic'},()=>assert.fail('classic art must not recolor'));
});

test('palette changes redraw the existing animated spritesheet from the original image',()=>{
  const visual=characterById('felipe').experimentalVisual;
  const sourceImage={};const draws=[];let uploads=0;
  const canvas={width:768,height:576,getContext:()=>({clearRect(){},drawImage:image=>draws.push(image)})};
  const texture={getSourceImage:()=>canvas,source:[{update:()=>uploads++}]};
  const textures={exists:key=>key===visual.sprite,get:key=>key===visual.sprite?texture:{getSourceImage:()=>sourceImage}};
  const palette={...FELIPE_TEST_PALETTE,shirt:'#be5b54'};
  assert.equal(updateFelipeRecolorTexture(textures,visual,palette,(source,colors)=>{
    assert.equal(source,sourceImage);assert.deepEqual(colors,palette);return {changed:true};
  }),true);
  assert.deepEqual(draws,[{changed:true}]);assert.equal(uploads,1);
  assert.equal(updateFelipeRecolorTexture(textures,{sprite:'classic'},palette),false);
});

test('incompatible masks, sheets and invalid colors fail explicitly',()=>{
  assert.throws(()=>createFelipeMaterialMask(source.data,384,288),/768x576/);
  assert.throws(()=>recolorFelipePixels(source.data,new Uint8Array(1)),/dimensions/);
  assert.throws(()=>recolorFelipePixels(source.data,mask,{hair:'not-a-color'}),/Invalid hair/);
});
