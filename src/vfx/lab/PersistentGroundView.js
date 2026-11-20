import { PixelFxView } from './PixelFxView.js';
import { clamp, ease } from './vendor/pixelfx/core/index.js';

const GROUND_DEPTH=-1.4;
let nextAreaId=0;

export class PersistentGroundView {
  constructor(scene,anchor,nearest,style,radius,holdMs){
    const {spreadMs,fadeMs}=style;
    this.durationMs=spreadMs+holdMs+fadeMs;
    this.radius=radius;
    this.spreadMs=spreadMs;
    this.fadeMs=fadeMs;
    this.expansion=0;
    const margin=10,above=42;
    const draw=style.create(radius);
    const overlay={
      meta:{
        size:[radius*2+2*margin,radius*2+above+margin],
        origin:[radius+margin,radius+above],
        fps:30,duration:this.durationMs/1000,loop:false,
      },
      draw:(p,t)=>draw(p,t,this.expansion,radius*ease.outQuad(this.expansion)),
    };
    this.detail=new PixelFxView(scene,overlay,anchor,nearest,undefined,{
      texturePrefix:`vfx-lab-area-${nextAreaId++}`,frontOnly:true,frontDepth:GROUND_DEPTH,
    });
    this.floor=scene.add.graphics().setPosition(anchor.x,anchor.y).setDepth(GROUND_DEPTH-0.01)
      .fillStyle(style.floorColor,style.floorOpacity).fillCircle(0,0,radius);
  }

  update(elapsed,delta){
    this.expansion=clamp(elapsed/this.spreadMs);
    const opacity=ease.inOutSine(clamp((this.durationMs-elapsed)/this.fadeMs));
    this.floor.setScale(ease.outQuad(this.expansion)).setAlpha(opacity);
    this.detail.layers[0].image.setAlpha(opacity);
    this.detail.update(elapsed,delta);
  }

  destroy(){
    this.floor.destroy();
    this.detail.destroy();
  }
}
