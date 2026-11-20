import { clearFrame, composite, createFrame, createFx } from './vendor/pixelfx/core/index.js';

export class PixelFxView {
  constructor(scene,effect,anchor,nearestFilter,options,{
    texturePrefix='vfx-lab',frontOnly=false,frontDepth=anchor.y+1,
  }={}){
    this.effect=createFx(effect,options);
    const [width,height]=effect.meta.size;
    const [originX,originY]=effect.meta.origin;
    this.frame=createFrame(width,height,-originX,-originY);
    this.fps=effect.meta.fps??30;
    this.drawnFrame=-1;
    this.layers=[];
    this.textures=scene.textures;
    try {
      for(const [name,depth] of [['back',-1.4],['front',frontDepth]]){
        if(frontOnly&&name==='back')continue;
        const key=`${texturePrefix}-${name}`;
        const texture=scene.textures.createCanvas(key,width,height);
        if(!texture)throw new Error(`Could not create PixelFX texture: ${key}`);
        const layer={name,texture,key};
        this.layers.push(layer);
        texture.setFilter(nearestFilter);
        layer.image=scene.add.image(anchor.x,anchor.y,key).setOrigin(originX/width,originY/height).setDepth(depth);
        layer.pixels=texture.getContext().createImageData(width,height);
      }
    } catch(error) {
      this.destroy();
      throw error;
    }
  }

  place(x,y,depth,rotation,scale){
    for(const {image} of this.layers){
      image.setPosition(x,y).setDepth(depth).setRotation(rotation).setScale(scale);
    }
  }

  // The library advances particles at up to 120 Hz. Upload only at the effect's FPS.
  update(elapsedMs,deltaMs){
    this.effect.update(deltaMs/1000);
    const frameIndex=Math.floor(elapsedMs*this.fps/1000);
    if(frameIndex===this.drawnFrame)return;
    this.drawnFrame=frameIndex;
    for(const {name,texture,pixels} of this.layers){
      clearFrame(this.frame);
      this.effect.draw(this.frame,name);
      composite(this.frame,pixels.data);
      texture.getContext().putImageData(pixels,0,0);
      texture.refresh();
    }
  }

  destroy(){
    for(const {image,key} of this.layers){
      image?.destroy();
      this.textures.remove(key);
    }
    this.layers.length=0;
    this.effect=null;
  }
}
