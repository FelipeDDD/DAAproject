import { PAYLOAD_RULES } from './config.js';
import { routeFromMap,pointAt } from './route.js';
import { PAYLOAD_VIEW_CONFIG,payloadTheme,payloadCartFrame } from './visualConfig.js';
import { PayloadDialogue } from './PayloadDialogue.js';
import { PayloadCollider } from './PayloadCollider.js';

export const PAYLOAD_COLORS=payloadTheme().colors;
let fieldTextureSequence=0;

function cssColor(color){return `#${Number(color).toString(16).padStart(6,'0')}`;}
function drawFieldTexture(context,{side,radius,colors,style,supersample}){
  context.save();context.scale(supersample,supersample);context.translate(side/2,side/2);
  const wash=context.createRadialGradient(0,0,Math.max(0,radius-style.secondaryInset),0,0,radius+style.padding);
  wash.addColorStop(0,`rgba(255,255,255,${style.washAlpha})`);wash.addColorStop(1,'rgba(255,255,255,0)');
  context.fillStyle=wash;context.beginPath();context.arc(0,0,radius+style.padding,0,Math.PI*2);context.fill();
  context.beginPath();context.arc(0,0,radius,0,Math.PI*2);context.strokeStyle=colors.primary;
  context.globalAlpha=style.glowAlpha;context.lineWidth=style.glowThickness;context.stroke();
  context.beginPath();context.arc(0,0,radius,0,Math.PI*2);context.strokeStyle=colors.primary;
  context.globalAlpha=style.ringAlpha;context.lineWidth=style.ringThickness;context.stroke();
  context.beginPath();context.arc(0,0,radius-style.secondaryInset,0,Math.PI*2);context.strokeStyle=colors.primary;
  context.globalAlpha=style.secondaryAlpha;context.lineWidth=style.secondaryThickness;context.stroke();
  const segmentRadius=radius+style.segmentRadiusOffset;
  for(let index=0;index<style.segmentCount;index++){
    const start=index/style.segmentCount*Math.PI*2,end=start+Math.PI*2/style.segmentCount*.42;
    context.beginPath();context.arc(0,0,segmentRadius,start,end);
    context.strokeStyle=colors.segments[index%colors.segments.length];context.globalAlpha=style.segmentAlpha;
    context.lineWidth=style.segmentThickness;context.stroke();
  }
  context.restore();
}
// Presentation consumes snapshots only. No local progress, control or win logic.
export class PayloadView {
  constructor(scene,{now=()=>performance.now(),visibleWhen=()=>true,config={},theme}={}){
    Object.assign(this,{scene,now,visibleWhen});this.config={...PAYLOAD_VIEW_CONFIG,...config,
      field:{...PAYLOAD_VIEW_CONFIG.field,...config.field}};
    this.theme=payloadTheme(theme??this.config.theme);this.route=routeFromMap(scene.source);
    this.path=this.config.showRoute?scene.add.graphics().setDepth(this.config.routeDepth):null;
    if(this.path){
      this.path.lineStyle(this.config.routeWidth,this.config.routeColor,this.config.routeAlpha).beginPath();
      this.route.points.forEach((p,i)=>i?this.path.lineTo(p.x,p.y):this.path.moveTo(p.x,p.y));this.path.strokePath();
      for(const [p,color] of [[this.route.points[0],this.theme.colors.A],[this.route.points.at(-1),this.theme.colors.B]])
        this.path.fillStyle(color,.35).fillCircle(p.x,p.y,this.config.routeEndpointRadius);
    }
    const center=pointAt(this.route,this.route.length*this.route.initialFraction);
    this.fieldTexturePrefix=`payload-control-field-${++fieldTextureSequence}`;
    this.fieldTextures=null;this.fieldTextureRadius=null;this.fieldTextureKeys=[];
    this.field=this.createField(center);this.ring=this.field;
    const useSprite=Boolean(this.theme.sprite&&scene.textures?.exists(this.theme.sprite));
    this.cart=useSprite?scene.add.image(center.x,center.y,this.theme.sprite).setOrigin(.5,this.theme.originY??1).setScale(this.theme.scale)
      :scene.add.graphics();
    this.usesSprite=useSprite;
    if(this.config.collision?.enabled&&scene.physics?.add&&scene.player?.body)
      this.obstacle=new PayloadCollider(scene,this.config.collision);
    this.dialogue=useSprite&&this.theme.speech&&globalThis.document&&scene.game?.canvas?new PayloadDialogue(scene,{now}):null;
    this.reset();
  }
  reset(){
    this.dialogue?.reset();
    this.key=null;this.visualKey=null;const center=pointAt(this.route,this.route.length*this.route.initialFraction);
    this.from={...center};this.target={...center};this.position={...center};this.receivedAt=this.now()-PAYLOAD_RULES.tickMs;
    this.obstacle?.update({x:center.x+this.theme.offsetX,y:center.y+this.theme.offsetY});
  }
  createField(center){
    const manager=this.scene.textures;
    if(manager?.createCanvas&&this.scene.add.image){
      const radius=PAYLOAD_RULES.radius*this.theme.radiusScale;
      this.ensureFieldTextures(radius);
      const image=this.scene.add.image(center.x,center.y,this.fieldTextures.neutral).setOrigin(.5);
      image.setDepth(this.config.field.depth);
      const side=2*(radius+this.config.field.padding);image.setDisplaySize(side,side);
      this.fieldBaseScaleX=image.scaleX;this.fieldBaseScaleY=image.scaleY;
      return image;
    }
    // Compatibility fallback for renderer/test doubles without CanvasTexture.
    return this.scene.add.graphics().setDepth(this.config.field.depth);
  }
  ensureFieldTextures(radius){
    if(this.fieldTextureRadius===radius&&this.fieldTextures)return;
    const manager=this.scene.textures,style=this.config.field;
    for(const key of this.fieldTextureKeys)manager.remove(key);
    this.fieldTextureKeys=[];this.fieldTextureRadius=radius;
    const supersample=Math.max(1,Math.round(style.supersample));
    const side=2*(radius+style.padding),pixels=Math.ceil(side*supersample);
    const palettes={
      neutral:{primary:this.theme.colors.neutral,segments:[this.theme.colors.neutral]},
      A:{primary:this.theme.colors.A,segments:[this.theme.colors.A]},
      B:{primary:this.theme.colors.B,segments:[this.theme.colors.B]},
      contested:{primary:this.theme.colors.contested,segments:[this.theme.colors.A,this.theme.colors.B]},
    };
    this.fieldTextures={};
    for(const [state,palette] of Object.entries(palettes)){
      const key=`${this.fieldTexturePrefix}-${state}`;
      const texture=manager.createCanvas(key,pixels,pixels),context=texture?.getContext?.();
      if(!texture||!context)continue;
      drawFieldTexture(context,{side,radius,colors:{primary:cssColor(palette.primary),segments:palette.segments.map(cssColor)},style,supersample});
      texture.refresh();texture.setSmoothPixelArt?.(true);
      this.fieldTextures[state]=key;this.fieldTextureKeys.push(key);
    }
  }
  updateField(state,radius,time){
    const style=this.config.field;
    if(this.fieldTextures){
      this.ensureFieldTextures(radius);
      const visualState=state.contested?'contested':state.control==='A'?'A':state.control==='B'?'B':'neutral';
      const key=this.fieldTextures[visualState]??this.fieldTextures.neutral;
      if(key&&this.field.texture?.key!==key)this.field.setTexture(key);
      const pulse=Math.sin(time/Math.max(1,style.pulsePeriodMs)*Math.PI*2);
      this.field.setAlpha(1-style.pulseAlpha/2+pulse*style.pulseAlpha/2);
      this.field.setScale(this.fieldBaseScaleX*(1+pulse*style.pulseScale),this.fieldBaseScaleY*(1+pulse*style.pulseScale));
      this.field.setRotation?.(time/1000*style.orbitSpeedRadPerSec);
      return;
    }
    const color=state.contested?this.theme.colors.contested:this.theme.colors[state.control]??this.theme.colors.neutral;
    this.field.clear().fillStyle(color,.08).fillCircle(0,0,radius)
      .lineStyle(style.glowThickness,color,.08).strokeCircle(0,0,radius)
      .lineStyle(style.ringThickness,color,.55).strokeCircle(0,0,radius)
      .lineStyle(style.secondaryThickness,color,.24).strokeCircle(0,0,radius-style.secondaryInset);
  }
  render(match){
    const state=match.payload??{...this.target,radius:PAYLOAD_RULES.radius,control:null,contested:false,moving:false};
    const at=this.now(),key=JSON.stringify(state);
    if(key!==this.key){
      this.from={...this.position};this.target={x:state.x,y:state.y};this.receivedAt=at;this.key=key;
      if(match.state==='countdown'||match.state==='ended'){this.from={...this.target};this.position={...this.target};}
    }
    const fraction=Math.min(1,Math.max(0,(at-this.receivedAt)/PAYLOAD_RULES.tickMs));
    this.position={x:this.from.x+(this.target.x-this.from.x)*fraction,y:this.from.y+(this.target.y-this.from.y)*fraction};
    const color=state.contested?this.theme.colors.contested:this.theme.colors[state.control]??this.theme.colors.neutral;
    const radius=(state.radius??PAYLOAD_RULES.radius)*this.theme.radiusScale;
    const visualKey=`${radius}:${this.theme.cart.base}:${this.theme.cart.outline}:${this.theme.cart.wheel}:${this.theme.cart.detail}`;
    if(visualKey!==this.visualKey){
      this.visualKey=visualKey;
      this.updateField(state,radius,at);
      if(!this.usesSprite)this.cart.clear().fillStyle(this.theme.cart.wheel,1).fillRect(-17,-16,5,13).fillRect(12,-16,5,13)
        .fillStyle(this.theme.cart.base,1).fillRoundedRect(-14,-23,28,23,4).lineStyle(2,this.theme.cart.outline,1).strokeRoundedRect(-14,-23,28,23,4)
        .fillStyle(color,1).fillRect(-8,-17,16,5).fillStyle(this.theme.cart.detail,1).fillRect(-9,-8,18,3);
    }
    const visible=this.visibleWhen(match,this.scene.player);
    this.path?.setVisible(visible);this.field.setVisible(visible).setPosition(this.position.x,this.position.y);
    this.updateField(state,radius,at);
    const visualX=this.position.x+this.theme.offsetX,visualY=this.position.y+this.theme.offsetY;
    const depth=this.theme.depth==='y'?visualY+this.theme.depthOffset:this.theme.depth;
    this.cart.setVisible(visible).setPosition(visualX,visualY).setDepth(depth);
    this.obstacle?.update({x:visualX,y:visualY},visible);
    if(this.usesSprite&&this.theme.animation)this.cart.setFrame(payloadCartFrame(at,state.moving));
    this.dialogue?.update({x:visualX,y:visualY},visible,match.state==='active');
  }
  destroy(){this.obstacle?.destroy();this.dialogue?.destroy();for(const object of [this.path,this.field,this.cart])object?.destroy();
    for(const key of this.fieldTextureKeys)this.scene.textures?.remove?.(key);}
}
