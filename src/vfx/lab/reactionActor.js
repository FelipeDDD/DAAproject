const frames=new WeakMap();

// PixelFX expects a tightly cropped actor with the pivot between its feet.
// Sample once per sprite frame; rendering a moving target then only updates transforms.
export function cropReactionActor(rgba,width,height){
  let left=width,right=-1,top=height,bottom=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(rgba[(y*width+x)*4+3]<128)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left)return null;
  const w=right-left+1,h=bottom-top+1,data=new Uint8Array(w*h),pixels=new Uint32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=((top+y)*width+left+x)*4;
    if(rgba[i+3]<128)continue;
    data[y*w+x]=1;
    pixels[y*w+x]=(255<<24)|(rgba[i+2]<<16)|(rgba[i+1]<<8)|rgba[i];
  }
  const half=Math.floor(w/2);
  return {actor:{x:-half,y:-h,w,h,mask:{w,h,data},pixels},
    pivotX:(left+half)/width,pivotY:(bottom+1)/height,width,height};
}

export function reactionFrame(frame){
  if(!frames.has(frame)){
    const canvas=document.createElement('canvas');
    canvas.height=36;
    canvas.width=Math.max(1,Math.round(frame.cutWidth*canvas.height/frame.cutHeight));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(frame.source.image,frame.cutX,frame.cutY,frame.cutWidth,frame.cutHeight,0,0,canvas.width,canvas.height);
    frames.set(frame,cropReactionActor(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height));
  }
  return frames.get(frame);
}
