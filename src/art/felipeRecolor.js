// Material masks authored for felipe-level3-hd.png, 6x4 frames of 128x144.
// These coordinates are specific to this sheet, not automatic segmentation for new art.
export const FELIPE_TEST_PALETTE=Object.freeze({
  hair:'#604333',shirt:'#276d7a',trousers:'#9a9fa5',shoes:'#693340',
});
export const FELIPE_MATERIALS=Object.freeze(['fixed','hair','shirt','trousers','shoes']);
const W=128,H=144,COLS=6,ROWS=4;

function inside(x,y,polygon){
  let result=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const [xi,yi]=polygon[i],[xj,yj]=polygon[j];
    if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)result=!result;
  }
  return result;
}

const FACE=[
  [[47,38],[77,38],[82,53],[77,65],[68,72],[56,71],[48,64],[43,54]],
  [[35,36],[51,36],[59,45],[58,60],[53,67],[42,66],[34,56]],
  [[71,36],[83,36],[90,52],[86,65],[74,68],[66,58],[66,45]],
  [],
];
const HAIR=[
  [[20,0],[106,0],[106,83],[79,83],[77,72],[75,65],[51,65],[49,73],[48,83],[20,83]],
  [[20,0],[110,0],[110,91],[79,91],[77,80],[68,66],[59,62],[57,69],[51,79],[43,77],[43,65],[20,65]],
  [[20,0],[110,0],[110,64],[82,64],[82,77],[74,77],[69,66],[60,64],[51,78],[49,89],[20,89]],
  [[20,0],[108,0],[108,77],[87,77],[83,80],[79,78],[74,85],[68,84],[64,88],[58,85],[53,85],[48,80],[42,81],[35,77],[20,77]],
];
// Foot boundaries follow lifted feet as well as planted soles; never use a single
// horizontal cutoff for an animated pair of legs.
const SHOE_TOP=[
  [[0,132],[63,132],[64,132],[128,132]],
  [[0,125],[60,125],[64,131],[128,131]],
  [[0,131],[65,131],[67,121],[128,121]],
  [[0,124],[60,124],[64,132],[128,132]],
  [[0,131],[65,131],[67,122],[128,122]],
  [[0,124],[62,124],[65,132],[128,132]],
];
const SIDE_SHOES=[
  [[0,132],[128,132]],
  [[0,131],[59,131],[66,134],[73,132],[88,120],[128,120]],
  [[0,132],[69,132],[72,118],[128,118]],
  [[0,126],[55,129],[61,138],[72,132],[91,121],[128,121]],
  [[0,132],[69,132],[72,119],[128,119]],
  [[0,133],[60,133],[65,127],[128,127]],
];
function belowBoundary(x,y,points){
  for(let i=1;i<points.length;i++){
    const [x1,y1]=points[i-1],[x2,y2]=points[i];
    if(x<=x2)return y>=y1+(y2-y1)*(x-x1)/(x2-x1);
  }
  return false;
}
function materialAt(x,y,row,col){
  if(inside(x,y,FACE[row]))return 0;
  if(inside(x,y,HAIR[row]))return 1;
  if(y<102)return 2;
  const side=row===1||row===2;
  const shoeX=row===2||row===3?128-x:x;
  return belowBoundary(shoeX,y,side?SIDE_SHOES[col]:SHOE_TOP[col])?4:3;
}

export function createFelipeMaterialMask(data,width,height){
  if(width!==W*COLS||height!==H*ROWS||data.length!==width*height*4)
    throw new Error('Felipe material masks require the registered 768x576 RGBA sheet.');
  const mask=new Uint8Array(width*height);
  for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
    // Protect the entire moving drink can, including its neutral cap and outlines.
    let minX=W,maxX=-1,minY=H,maxY=-1;
    for(let y=78;y<120;y++)for(let x=0;x<W;x++){
      const i=((row*H+y)*width+col*W+x)*4;
      const [r,g,b,a]=data.subarray(i,i+4);
      if(a&&g>55&&g>r*1.4&&g>b*1.6){
        minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      }
    }
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const pixel=(row*H+y)*width+col*W+x,i=pixel*4;
      const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
      if(!a)continue;
      if(maxX>=0&&x>=minX-4&&x<=maxX+4&&y>=minY-7&&y<=maxY+6)continue;
      // Preserve skin, white emblem, fixed saturated details and black ink.
      if(r-g>18&&r>b*1.25)continue;
      if(Math.max(r,g,b)>140||Math.max(r,g,b)-Math.min(r,g,b)>30)continue;
      if((r+g+b)/3<=12)continue;
      mask[pixel]=materialAt(x+.5,y+.5,row,col);
    }
  }
  return mask;
}

export function recolorFelipePixels(data,mask,palette=FELIPE_TEST_PALETTE){
  if(data.length!==mask.length*4)throw new Error('Material mask dimensions do not match the sprite.');
  const colors=FELIPE_MATERIALS.map(name=>{
    const hex=palette[name];
    if(hex==null)return null;
    if(!/^#[0-9a-f]{6}$/i.test(hex))throw new Error(`Invalid ${name} color.`);
    return [1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
  });
  const result=new Uint8ClampedArray(data);
  for(let p=0;p<mask.length;p++){
    const color=colors[mask[p]];
    if(!color||!data[p*4+3])continue;
    const i=p*4,light=(data[i]+data[i+1]+data[i+2])/3;
    // Rebase the source's dark shading ramp instead of multiplying black by a tint.
    // This allows light trousers while retaining the source folds and highlights.
    const shade=Math.min(1.35,Math.max(.25,light/48));
    for(let c=0;c<3;c++)result[i+c]=Math.round(Math.min(255,color[c]*shade));
  }
  return result;
}

export function createFelipeRecolorCanvas(image,palette=FELIPE_TEST_PALETTE){
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(image,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height);
  const mask=createFelipeMaterialMask(pixels.data,canvas.width,canvas.height);
  pixels.data.set(recolorFelipePixels(pixels.data,mask,palette));
  context.putImageData(pixels,0,0);
  return canvas;
}

export function prepareFelipeRecolorTexture(textures,visual,createCanvas=createFelipeRecolorCanvas){
  if(!visual.recolorSource||textures.exists(visual.sprite))return;
  const image=textures.get(visual.recolorSource).getSourceImage();
  const canvas=createCanvas(image);
  textures.addSpriteSheet(visual.sprite,canvas,{frameWidth:visual.frameWidth,frameHeight:visual.frameHeight});
}

// Keep the same spritesheet and animation keys while changing its canvas pixels.
// The original, unmodified sheet is always the source, so repeated edits do not accumulate artifacts.
export function updateFelipeRecolorTexture(textures,visual,palette,createCanvas=createFelipeRecolorCanvas){
  if(!visual?.recolorSource||!textures.exists(visual.sprite))return false;
  const source=textures.get(visual.recolorSource).getSourceImage();
  const texture=textures.get(visual.sprite);
  const canvas=texture.getSourceImage();
  const recolored=createCanvas(source,palette);
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  canvas.getContext('2d').drawImage(recolored,0,0);
  texture.source[0].update();
  return true;
}
