import assert from 'node:assert/strict';
import test from 'node:test';
import {characterById} from '../src/characters.js';
import {decodeFelipeMaterialMask} from '../src/art/felipeRecolor.js';
import {characterColorParts,defaultCharacterPalette,recolorCharacterPixels,prepareCharacterRecolorTexture,updateCharacterRecolorTexture} from '../src/art/characterRecolor.js';
import {WardrobeController} from '../src/WardrobeController.js';
import {walkFrames} from '../src/characterVisuals.js';
import {readRgbaPng} from './helpers/readRgbaPng.js';

for(const id of ['michael','sarina','jassine'])test(id+' third skin recolors all 24 frames, preserves fixed pixels and resets exactly',()=>{
  const visual=characterById(id).experimentalVisual;
  const source=readRgbaPng(new URL('../public/'+visual.asset,import.meta.url));
  const labels=readRgbaPng(new URL('../public/'+visual.recolorMaskAsset,import.meta.url));
  assert.equal(labels.width,source.width);assert.equal(labels.height,source.height);
  const mask=decodeFelipeMaterialMask(labels.data,labels.width,labels.height);
  assert.deepEqual(recolorCharacterPixels(source.data,mask,defaultCharacterPalette(visual),visual),new Uint8ClampedArray(source.data));
  const result=recolorCharacterPixels(source.data,mask,{shirt:'#44aa66',trousers:'#cc44aa',shoes:'#dd9933',hair:'#6688cc'},visual);
  for(let frame=0;frame<24;frame++){
    const counts=[0,0,0,0,0];
    for(let y=0;y<144;y++)for(let x=0;x<128;x++){
      const p=(Math.floor(frame/6)*144+y)*source.width+(frame%6)*128+x,i=p*4;
      counts[mask[p]]++;
      assert.equal(result[i+3],source.data[i+3]);
      if(!mask[p])for(let c=0;c<4;c++)assert.equal(result[i+c],source.data[i+c]);
      if(!source.data[i+3])assert.equal(mask[p],0);
      if(id!=='sarina'&&y<65)assert.equal(mask[p],0,'bald head, eyes and glasses stay fixed');
    }
    for(const material of id==='sarina'?[1,2,3,4]:[2,3,4])assert.ok(counts[material]>30);
  }
  const shirtOnly=recolorCharacterPixels(source.data,mask,{shirt:'#ff0000'},visual);
  for(let p=0;p<mask.length;p++)if(mask[p]!==2)for(let c=0;c<4;c++)assert.equal(shirtOnly[p*4+c],source.data[p*4+c]);
  assert.notDeepEqual(result,source.data);
});

test('wardrobe controls match each character and reset to their own defaults',()=>{
  for(const id of ['felipe','sarina','michael','jassine']){
    const visual=characterById(id).experimentalVisual;
    assert.deepEqual(characterColorParts(visual),id==='felipe'||id==='sarina'?['hair','shirt','trousers','shoes']:['shirt','trousers','shoes']);
    const identity={characterBaseId:id,characterId:id,visualPreview:'level3Preview'};
    const palettes=[];
    const wardrobe=Object.assign(Object.create(WardrobeController.prototype),{presence:{identity},render(){},
      scene:{applyPreviewPalette(palette){identity.previewPalette=palette;palettes.push(palette);return true;}}});
    wardrobe.changePreviewColor('shirt','#12ab34');
    assert.equal(palettes.at(-1).shirt,'#12ab34');
    wardrobe.changePreviewColor('shoes','#567890');
    assert.equal(palettes.at(-1).shirt,'#12ab34');
    wardrobe.changePreviewColor(null,null);
    assert.deepEqual(palettes.at(-1),defaultCharacterPalette(visual));
  }
});

test('all characters reuse source and mask for repeated palette changes without baking previous edits',()=>{
  for(const id of ['felipe','sarina','michael','jassine']){
    const visual=characterById(id).experimentalVisual,source={},mask={},cache=new Set(),calls=[];
    const canvas={getContext:()=>({clearRect(){},drawImage(){}})};let uploads=0;
    const texture={getSourceImage:()=>canvas,source:[{update(){uploads++;}}]};
    const textures={exists:key=>cache.has(key),get:key=>key===visual.sprite?texture:{getSourceImage:()=>key===visual.recolorSource?source:mask},
      addSpriteSheet(key){cache.add(key);}};
    const create=(image,palette,labels,config)=>{assert.equal(image,source);assert.equal(labels,mask);assert.equal(config,visual);calls.push(palette);return canvas;};
    prepareCharacterRecolorTexture(textures,visual,create);prepareCharacterRecolorTexture(textures,visual,create);
    assert.equal(calls.length,1);assert.deepEqual(calls[0],defaultCharacterPalette(visual));
    updateCharacterRecolorTexture(textures,visual,{shirt:'#ff0000'},create);
    updateCharacterRecolorTexture(textures,visual,defaultCharacterPalette(visual),create);
    assert.equal(uploads,2);assert.deepEqual(calls.at(-1),defaultCharacterPalette(visual));
  }
});

test('Yassin uses Felipe walking cadence with registered feet in all 24 frames',()=>{
  const visual=characterById('jassine').experimentalVisual;
  const reference=characterById('felipe').experimentalVisual;
  assert.equal(visual.frameWidth,128);assert.equal(visual.frameHeight,144);
  assert.equal(visual.frameRate,reference.frameRate);
  for(const direction of ['down','left','right','up']){
    assert.deepEqual(walkFrames(direction,visual),walkFrames(direction,reference));
    assert.equal(walkFrames(direction,visual).length/visual.frameRate,.5);
  }
  const source=readRgbaPng(new URL('../public/'+visual.asset,import.meta.url));
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
    let bottom=-1;
    for(let y=0;y<144;y++)for(let x=0;x<128;x++)if(source.data[((row*144+y)*768+col*128+x)*4+3]){
      assert.ok(x>0&&x<127,'no neighboring cell bleed'); bottom=y;
    }
    assert.equal(bottom,143,'same floor baseline');
  }
});
