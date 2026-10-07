import { normalizeYassinUpStride } from './yassinUpStride.js';
import { decodeFelipeMaterialMask,recolorFelipePixels } from './felipeRecolor.js';

// Third skins share the registered 768x576 grid and editable material labels.
export const RECOLOR_PARTS=Object.freeze(['hair','shirt','trousers','shoes']);
export function defaultCharacterPalette(visual){return {...visual?.recolorPalette};}
export function characterColorParts(visual){return visual?.recolorSource?(visual.recolorParts??RECOLOR_PARTS):[];}

export function recolorCharacterPixels(data,mask,palette={},visual={}){
  // Felipe keeps its accepted dark-source shading. Other art can be colored
  // already: normalize each material's luminance instead of clipping highlights.
  if(visual.recolorShadeBase!=null)return recolorFelipePixels(data,mask,palette,visual.recolorShadeBase);
  const sums=[0,0,0,0,0],counts=[0,0,0,0,0];
  for(let p=0;p<mask.length;p++)if(mask[p]&&data[p*4+3]){
    sums[mask[p]]+=(data[p*4]+data[p*4+1]+data[p*4+2])/3;counts[mask[p]]++;
  }
  const bases=sums.map((sum,i)=>counts[i]?Math.max(1,sum/counts[i]):48);
  return recolorFelipePixels(data,mask,palette,bases);
}

export function createCharacterRecolorCanvas(image,palette={},maskImage,visual={}){
  if(!maskImage||image.width!==maskImage.width||image.height!==maskImage.height)
    throw new Error('A matching material mask is required for this skin.');
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(maskImage,0,0);
  const mask=decodeFelipeMaterialMask(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  const recolored=recolorCharacterPixels(pixels.data,mask,palette,visual);
  pixels.data.set(visual.normalizeUpStride?normalizeYassinUpStride(recolored,canvas.width,canvas.height):recolored);
  context.putImageData(pixels,0,0);return canvas;
}

export function prepareCharacterRecolorTexture(textures,visual,createCanvas=createCharacterRecolorCanvas){
  if(!visual?.recolorSource||textures.exists(visual.sprite))return;
  const image=textures.get(visual.recolorSource).getSourceImage();
  const maskImage=textures.get(visual.recolorMaskSource).getSourceImage();
  const canvas=createCanvas(image,defaultCharacterPalette(visual),maskImage,visual);
  textures.addSpriteSheet(visual.sprite,canvas,{frameWidth:visual.frameWidth,frameHeight:visual.frameHeight});
}

export function updateCharacterRecolorTexture(textures,visual,palette,createCanvas=createCharacterRecolorCanvas){
  if(!visual?.recolorSource||!textures.exists(visual.sprite))return false;
  const source=textures.get(visual.recolorSource).getSourceImage();
  const mask=textures.get(visual.recolorMaskSource).getSourceImage();
  const texture=textures.get(visual.sprite),canvas=texture.getSourceImage();
  const recolored=createCanvas(source,palette,mask,visual);
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  canvas.getContext('2d').drawImage(recolored,0,0);texture.source[0].update();return true;
}
