import { FIRE_ZONE_VISUAL,FIRE_ZONE_FLAME_FRAMES } from './visualConfig.js';

// Ground-only presentation. The snapshot still owns radius, phase and lifetime.
export class FireZoneView {
  constructor(scene,instance,{config=FIRE_ZONE_VISUAL}={}){
    this.config={...FIRE_ZONE_VISUAL,...config};this.closed=false;
    this.object=scene.add.graphics().setDepth(this.config.depth);
    this.render(instance);
  }
  render(instance,now=0){
    if(this.closed)return;
    this.object.setPosition(instance.x,instance.y);
    const c=this.config,active=instance.phase==='active';
    const elapsed=Math.max(0,now-(instance.activeAt??0));
    const frame=active?Math.floor(elapsed/c.flameFrameMs):0;
    if(this.phase===instance.phase&&this.radius===instance.radius&&this.frame===frame)return;
    if(this.radius!==instance.radius)this.layoutFlames(instance.radius);
    this.phase=instance.phase;this.radius=instance.radius;
    this.frame=frame;const g=this.object;
    g.clear().fillStyle(c.color,active?c.activeFillAlpha:c.telegraphFillAlpha).fillCircle(0,0,instance.radius);
    g.lineStyle(c.lineWidth,c.color,active?c.activeAlpha:c.telegraphAlpha).strokeCircle(0,0,instance.radius);
    if(!active)g.fillStyle(c.color,c.telegraphAlpha).fillCircle(0,0,c.centerRadius);
    else for(const flame of this.flames)this.drawFlame(flame,frame,instance.radius);
  }
  layoutFlames(radius){
    const c=this.config,pixel=c.pixelSize;
    const edgeCount=Math.min(c.edgeFlameCount,c.flameCount),innerCount=c.flameCount-edgeCount;
    const extent=Math.max(0,radius-c.edgeInset)*c.flameSpread;
    // Deterministic positions avoid a different pattern on each snapshot/browser.
    this.flames=Array.from({length:c.flameCount},(_,index)=>{
      const edge=index>=innerCount;
      const angle=edge?(index-innerCount)*Math.PI*2/edgeCount:index*2.399963229728653;
      const distance=edge?extent:Math.sqrt(index/Math.max(1,innerCount))*extent;
      return {x:Math.round(Math.cos(angle)*distance/pixel)*pixel,
        y:Math.round(Math.sin(angle)*distance/pixel)*pixel,offset:index%FIRE_ZONE_FLAME_FRAMES.length};
    }).sort((a,b)=>a.y-b.y);
  }
  drawFlame(flame,frame,radius){
    const c=this.config,g=this.object,pixel=c.pixelSize;
    const pose=FIRE_ZONE_FLAME_FRAMES[(frame+flame.offset)%FIRE_ZONE_FLAME_FRAMES.length];
    const x=flame.x-Math.floor(pose[0].length/2)*pixel,y=flame.y-6*pixel;
    const glowRadius=Math.max(0,Math.min(c.glowRadius,radius*.12,radius-Math.hypot(flame.x,flame.y)));
    if(glowRadius>0)g.fillStyle(c.color,c.glowAlpha).fillCircle(flame.x,flame.y,glowRadius);
    for(let row=0;row<pose.length;row++)for(let column=0;column<pose[row].length;column++){
      const color=Number(pose[row][column]);if(!color)continue;
      this.drawPixel(x+column*pixel,y+row*pixel,c.flameColors[color-1],c.flameAlpha,radius);
    }
    const emberStep=(frame+flame.offset*3)%12;
    const emberSteps=c.emberRisePixels+1;
    if(emberStep<emberSteps)this.drawPixel(flame.x+(flame.offset%2?pixel:-pixel),
      y-(emberStep+1)*pixel,c.emberColor,c.emberAlpha*(1-emberStep/emberSteps),radius);
  }
  drawPixel(x,y,color,alpha,radius){
    const pixel=this.config.pixelSize;
    // Clip decorative tips/embers too, keeping the visible effect inside the area.
    if(Math.hypot(Math.max(Math.abs(x),Math.abs(x+pixel)),Math.max(Math.abs(y),Math.abs(y+pixel)))>radius)return;
    this.object.fillStyle(color,alpha).fillRect(x,y,pixel,pixel);
  }
  destroy(){
    if(this.closed)return;this.closed=true;this.object.destroy();this.flames=[];
  }
}
