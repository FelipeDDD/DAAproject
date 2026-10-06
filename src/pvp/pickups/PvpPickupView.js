import { pickupSpotsFromMap } from './spots.js';
import { PVP_PICKUP_RULES } from './config.js';
import { PVP_PICKUP_VISUAL } from './visualConfig.js';

// Snapshot-only view. The animation clock is cosmetic; a respawnAt deadline
// never makes a pack available locally, even if a state packet is delayed.
export class PvpPickupView {
  constructor(scene,{config={},debug=false,now=()=>performance.now()}={}){
    Object.assign(this,{scene,debug,now});this.items=new Map();
    for(const spot of pickupSpotsFromMap(scene.source)){
      const defaults=PVP_PICKUP_VISUAL[spot.type];if(!defaults)continue;
      const style={...defaults,...config[spot.type]},icon=this.createIcon(style).setVisible(false);
      const glow=this.createGlow(style).setVisible(false).setDepth(style.glowDepth);
      const area=debug?scene.add.graphics().lineStyle(1,style.color,.6)
        .strokeCircle(0,0,PVP_PICKUP_RULES.collectionRadius).setVisible(false).setDepth(20_000):null;
      const label=debug?scene.add.text(spot.x,spot.y,'',{fontSize:'10px',resolution:2,color:'#ffffff',backgroundColor:'#091018cc'})
        .setOrigin(.5,0).setVisible(false).setDepth(20_001):null;
      this.items.set(spot.id,{spot,style,icon,glow,area,label,previousAvailable:null,
        animation:{alpha:1,scale:1,glowBoost:1,glowScale:1},tween:null,transition:null});
    }
  }
  createIcon(style){
    if(style.texture&&this.scene.textures.exists(style.texture))return this.scene.add.image(0,0,style.texture).setOrigin(.5);
    const radius=style.placeholderRadius;
    const left=-radius*1.08,top=-radius*.65,width=radius*2.16,height=radius*1.55;
    // A compact white case with a raised handle, shaded base and green cross.
    // Vector geometry keeps the placeholder crisp without adding an asset.
    return this.scene.add.graphics()
      .lineStyle(2,style.handleColor,1).strokeRoundedRect(-radius*.4,-radius*1.12,radius*.8,radius*.6,2)
      .fillStyle(style.caseShadeColor,1).fillRoundedRect(left,top,width,height,3)
      .fillStyle(style.caseColor,1).fillRoundedRect(left,top,width,height-3,3)
      .lineStyle(1,style.borderColor,1).strokeRoundedRect(left,top,width,height,3)
      .fillStyle(0xffffff,.75).fillRect(left+3,top+2,width-6,1)
      .fillStyle(style.latchColor,1).fillRect(-radius*.75,top,2,3).fillRect(radius*.75-2,top,2,3)
      .fillStyle(style.color,1).fillRect(-radius*.45,1-radius*.14,radius*.9,radius*.28)
      .fillRect(-radius*.14,1-radius*.45,radius*.28,radius*.9);
  }
  createGlow(style){
    // Soft filled ellipses, much smaller than the logical radius. Ground depth
    // stays below characters; neither the glow nor its pulse follows the bob.
    return this.scene.add.graphics()
      .fillStyle(style.glowColor,.2).fillEllipse(0,0,style.glowWidth,style.glowHeight)
      .fillStyle(style.glowColor,.35).fillEllipse(0,0,style.glowWidth*.72,style.glowHeight*.72)
      .fillStyle(style.glowColor,.5).fillEllipse(0,0,style.glowWidth*.4,style.glowHeight*.4);
  }
  render(match,serverNow=Date.now()){
    if(this.round!==(match.round??0)){this.reset();this.round=match.round??0;}
    const rows=new Map((match.pickups??[]).map(pickup=>[pickup.id,pickup])),at=this.now();
    const show=['countdown','active'].includes(match.state);
    for(const [id,item] of this.items){
      const row=rows.get(id),{style,icon,glow,area,label,animation}=item;
      const visible=show&&row?.type==='health';
      area?.setVisible(Boolean(visible));label?.setVisible(Boolean(visible));
      if(!visible){
        this.stopTransition(item);icon.setVisible(false);glow.setVisible(false);item.previousAvailable=null;continue;
      }
      if(item.previousAvailable!==null&&item.previousAvailable!==row.available){
        const effect=row.available?'respawn':'collect';
        this.stopTransition(item);
        if(match.state==='active'&&style[`${effect}Effect`])this.startTransition(item,effect);
      }
      item.previousAvailable=row.available;
      // A consumed pack may leave a 200ms cosmetic afterimage. Availability/HP
      // have already changed on the server; this animation never delays them.
      const displaying=row.available||item.transition==='collect';
      icon.setVisible(displaying);glow.setVisible(displaying&&style.glowEnabled);
      const wave=duration=>Math.sin(at/Math.max(1,duration)*Math.PI);
      const x=row.x+style.offsetX,y=row.y+style.offsetY+wave(style.bobDurationMs)*style.bobDistance;
      const depth=style.depth==='y'?row.y+style.depthOffset:style.depth;
      const rotation=style.rotationMode==='spin'?(at/Math.max(1,style.rotationDurationMs)*Math.PI*2)%(Math.PI*2)
        :style.rotationMode==='sway'?wave(style.rotationDurationMs)*style.rotationAmount:0;
      icon.setPosition(x,y).setDepth(depth).setScale(style.scale*animation.scale)
        .setRotation(rotation).setAlpha(animation.alpha);
      const pulse=style.glowPulse?wave(style.glowPulseDurationMs):0;
      glow.setPosition(x+style.glowOffsetX,row.y+style.offsetY+style.glowOffsetY)
        .setScale(style.glowScale*(1+pulse*style.glowPulseScale)*animation.glowScale)
        .setAlpha(style.glowAlpha*(1+pulse*style.glowPulseAlpha)
          *(item.transition==='respawn'?1:animation.alpha)*animation.glowBoost);
      if(this.debug){
        area.setPosition(row.x,row.y);
        const state=row.available?'available':row.respawnAt===null?'unavailable':`cooldown ${Math.max(0,(row.respawnAt-serverNow)/1000).toFixed(1)}s`;
        label.setPosition(row.x,row.y+PVP_PICKUP_RULES.collectionRadius+2).setText(`${id}\n${state}`);
      }
    }
  }
  startTransition(item,kind){
    const {style,animation}=item,respawn=kind==='respawn';
    item.transition=kind;
    if(respawn)Object.assign(animation,{alpha:0,scale:style.respawnStartScale,glowBoost:style.respawnGlowBoost});
    const tween=this.scene.tweens.add({targets:animation,
      alpha:respawn?1:0,scale:respawn?1:style.collectScale,
      glowBoost:1,glowScale:respawn?1:style.collectGlowScale,
      duration:respawn?style.respawnDurationMs:style.collectDurationMs,
      ease:respawn?style.respawnEase:style.collectEase,
      onComplete:()=>{
        if(item.tween!==tween)return;
        item.tween=null;item.transition=null;
        if(!respawn){item.icon.setVisible(false);item.glow.setVisible(false);}
      }});
    item.tween=tween;
  }
  stopTransition(item){
    if(item.tween)this.scene.tweens.killTweensOf(item.animation);
    item.tween=null;item.transition=null;
    Object.assign(item.animation,{alpha:1,scale:1,glowBoost:1,glowScale:1});
  }
  reset(){
    this.round=null;
    for(const item of this.items.values()){
      this.stopTransition(item);item.previousAvailable=null;
      item.icon.setVisible(false);item.glow.setVisible(false);item.area?.setVisible(false);item.label?.setVisible(false);
    }
  }
  destroy(){
    this.reset();for(const {icon,glow,area,label} of this.items.values()){
      icon.destroy();glow.destroy();area?.destroy();label?.destroy();
    }this.items.clear();
  }
}
