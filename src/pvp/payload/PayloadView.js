import { PAYLOAD_RULES } from './config.js';
import { routeFromMap,pointAt } from './route.js';
import { PAYLOAD_VIEW_CONFIG,payloadTheme } from './visualConfig.js';

export const PAYLOAD_COLORS=payloadTheme().colors;
// Presentation consumes snapshots only. No local progress, control or win logic.
export class PayloadView {
  constructor(scene,{now=()=>performance.now(),visibleWhen=()=>true,config={},theme}={}){
    Object.assign(this,{scene,now,visibleWhen});this.config={...PAYLOAD_VIEW_CONFIG,...config};
    this.theme=payloadTheme(theme??this.config.theme);this.route=routeFromMap(scene.source);
    this.path=this.config.showRoute?scene.add.graphics().setDepth(this.config.routeDepth):null;
    if(this.path){
      this.path.lineStyle(this.config.routeWidth,this.config.routeColor,this.config.routeAlpha).beginPath();
      this.route.points.forEach((p,i)=>i?this.path.lineTo(p.x,p.y):this.path.moveTo(p.x,p.y));this.path.strokePath();
      for(const [p,color] of [[this.route.points[0],this.theme.colors.A],[this.route.points.at(-1),this.theme.colors.B]])
        this.path.fillStyle(color,.35).fillCircle(p.x,p.y,this.config.routeEndpointRadius);
    }
    this.ring=scene.add.graphics().setDepth(-.7);
    const center=pointAt(this.route,this.route.length*this.route.initialFraction);
    const useSprite=Boolean(this.theme.sprite&&scene.textures?.exists(this.theme.sprite));
    this.cart=useSprite?scene.add.image(center.x,center.y,this.theme.sprite).setOrigin(.5,1).setScale(this.theme.scale)
      :scene.add.graphics();
    this.usesSprite=useSprite;
    this.label=scene.add.text(0,0,'PAYLOAD',{fontSize:'10px',color:'#f0e7cb',backgroundColor:'#17202bcc'}).setOrigin(.5,1);
    this.reset();
  }
  reset(){
    this.key=null;this.visualKey=null;const center=pointAt(this.route,this.route.length*this.route.initialFraction);
    this.from={...center};this.target={...center};this.position={...center};this.receivedAt=this.now()-PAYLOAD_RULES.tickMs;
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
    const visualKey=`${color}:${radius}:${this.theme.cart.base}:${this.theme.cart.outline}:${this.theme.cart.wheel}:${this.theme.cart.detail}`;
    if(visualKey!==this.visualKey){
      this.visualKey=visualKey;
      this.ring.clear().fillStyle(color,.10).fillCircle(0,0,radius).lineStyle(2,color,.6).strokeCircle(0,0,radius);
      if(!this.usesSprite)this.cart.clear().fillStyle(this.theme.cart.wheel,1).fillRect(-17,-16,5,13).fillRect(12,-16,5,13)
        .fillStyle(this.theme.cart.base,1).fillRoundedRect(-14,-23,28,23,4).lineStyle(2,this.theme.cart.outline,1).strokeRoundedRect(-14,-23,28,23,4)
        .fillStyle(color,1).fillRect(-8,-17,16,5).fillStyle(this.theme.cart.detail,1).fillRect(-9,-8,18,3);
    }
    const visible=this.visibleWhen(match,this.scene.player);
    this.path?.setVisible(visible);this.ring.setVisible(visible).setPosition(this.position.x,this.position.y)
      .setAlpha(state.contested?0.75+0.2*Math.sin(at/180):1);
    const visualX=this.position.x+this.theme.offsetX,visualY=this.position.y+this.theme.offsetY;
    const depth=this.theme.depth==='y'?visualY+this.theme.depthOffset:this.theme.depth;
    this.cart.setVisible(visible).setPosition(visualX,visualY).setDepth(depth);
    this.label.setVisible(visible).setPosition(visualX,visualY+this.theme.labelOffsetY).setDepth(depth+1)
      .setText(state.contested?'CONTESTED':state.control==='A'?'BLUE → RED':state.control==='B'?'RED → BLUE':'PAYLOAD');
  }
  destroy(){for(const object of [this.path,this.ring,this.cart,this.label])object?.destroy();}
}
