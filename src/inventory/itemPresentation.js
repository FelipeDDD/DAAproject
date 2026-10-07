import { inventoryPresentationAsset } from './config.js';

// A presentation can use one frame from an asset sheet without changing the
// source artwork or the item's inventory icon. Ordinary cards remain images.
export function createItemPresentationImage(doc,item,baseUrl='/'){
  const src=new URL(`${baseUrl}${inventoryPresentationAsset(item)}`,doc.baseURI).href;
  const frame=item.presentationFrame;
  if(!frame){
    const image=doc.createElement('img');image.className='boss-reward-image';
    if(item.presentationClip)image.style.clipPath=item.presentationClip;
    image.src=src;image.alt=item.name;return image;
  }
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','boss-reward-image boss-reward-image--frame');
  svg.setAttribute('viewBox',`${frame.x} ${frame.y} ${frame.width} ${frame.height}`);
  svg.setAttribute('width',frame.width);svg.setAttribute('height',frame.height);
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('overflow','hidden');
  svg.setAttribute('role','img');svg.setAttribute('aria-label',item.name);
  const image=doc.createElementNS('http://www.w3.org/2000/svg','image');
  image.setAttribute('href',src);image.setAttribute('width',frame.sourceWidth);image.setAttribute('height',frame.sourceHeight);
  svg.append(image);return svg;
}

export function createItemIconImage(doc,item,baseUrl='/'){
  const frame=item.iconFrame;
  if(!frame){
    const image=doc.createElement('img');image.className='inventory-slot-icon';
    image.src=new URL(`${baseUrl}${item.icon}`,doc.baseURI).href;image.alt='';return image;
  }
  const src=new URL(`${baseUrl}${item.icon}`,doc.baseURI).href;
  const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','inventory-slot-icon inventory-slot-icon--frame');
  svg.setAttribute('viewBox',`${frame.x} ${frame.y} ${frame.width} ${frame.height}`);
  svg.setAttribute('width',frame.width);svg.setAttribute('height',frame.height);
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('overflow','hidden');
  svg.setAttribute('role','img');svg.setAttribute('aria-label',item.name);
  const image=doc.createElementNS('http://www.w3.org/2000/svg','image');
  image.setAttribute('href',src);image.setAttribute('width',frame.sourceWidth);image.setAttribute('height',frame.sourceHeight);
  svg.append(image);return svg;
}
