import { PixelFxView } from './PixelFxView.js';
import { reactionFrame } from './reactionActor.js';
import * as burning from './vendor/pixelfx/fx/status/burning.js';
import * as poisoned from './vendor/pixelfx/fx/status/poisoned.js';
import * as frozen from './vendor/pixelfx/fx/status/frozen.js';
import * as stunned from './vendor/pixelfx/fx/status/stunned.js';
import * as slowed from './vendor/pixelfx/fx/status/slowed.js';
import * as haste from './vendor/pixelfx/fx/status/haste.js';
import * as electrified from './vendor/pixelfx/fx/lightning/electrified.js';
import { hex } from './vendor/pixelfx/core/index.js';

const bone=hex('#e1f4e9'),shade=hex('#222b44');
const shock={...electrified,draw(p,t,options){
  electrified.draw(p,t,options);
  // One short x-ray accent per loop. Clip the schematic bones to the actual silhouette.
  if(t<0.1||t>=0.19)return;
  const {x,y,w,h,mask}=options.actor;
  for(let row=0;row<h;row++)for(let col=0;col<w;col++){
    if(!mask.data[row*w+col])continue;
    const u=(col+0.5)/w-0.5,v=(row+0.5)/h;
    const head=(u/0.22)**2+((v-0.25)/0.14)**2<1&&Math.abs(Math.abs(u)-0.095)+Math.abs(v-0.23)>0.055;
    const spine=Math.abs(u)<0.045&&v>0.32&&v<0.68;
    const ribs=v>0.40&&v<0.58&&Math.abs(u)<0.20&&(row%3===0);
    const legs=v>0.65&&v<0.92&&Math.abs(Math.abs(u)-(v-0.55)*0.43)<0.045;
    p.px(x+col,y+row,head||spine||ribs||legs?bone:shade);
  }
}};

export const REACTIONS={Burning:burning,Poisoned:poisoned,Frozen:frozen,Electrified:shock,Stunned:stunned,Slowed:slowed};
const modules={...REACTIONS,Haste:haste};

export class TargetReactions{
  constructor(scene,nearest){
    this.scene=scene;
    this.nearest=nearest;
    this.active=[];
    this.numbers=[];
    this.serial=0;
  }

  apply(sprite,name,ms,{group=name==='Haste'?'Haste':'status'}={}){
    const frame=reactionFrame(sprite.frame);
    if(!frame||!modules[name]||!(ms>0))return;
    const previous=this.active.findIndex(r=>r.sprite===sprite&&r.group===group);
    if(previous>=0)this.active.splice(previous,1)[0].view.destroy();
    const options={actor:frame.actor};
    if(name==='Slowed')options.showDial=false;
    if(name==='Haste')Object.assign(options,{trailCount:2,trailSpacing:5,
      palette:['#163735','#28544a','#407966','#64aa87','#98dca3','#d3f5bc','#fbffe5']});
    const view=new PixelFxView(this.scene,modules[name],sprite,this.nearest,options,
      {texturePrefix:'lab-reaction-'+(++this.serial)});
    const entry={sprite,name,group,view,elapsed:0,duration:ms};
    this.active.push(entry);
    this.place(entry,0);
  }

  place({view,sprite,elapsed,duration,name,group},dt){
    const f=reactionFrame(sprite.frame);
    const strength=group==='Burning'?0.68:name==='Poisoned'||name==='Haste'?0.74:1;
    const alpha=f&&sprite.visible?sprite.alpha*strength:0;
    if(f){
      view.effect.options.actor=f.actor;
      const sx=sprite.displayWidth/f.width,sy=sprite.displayHeight/f.height;
      const x=sprite.x+((sprite.flipX?1-f.pivotX:f.pivotX)-sprite.originX)*sprite.displayWidth;
      const y=sprite.y+(f.pivotY-sprite.originY)*sprite.displayHeight;
      for(const {image,name} of view.layers){
        image.setPosition(x,y).setDepth(sprite.depth+(name==='front'?0.3:-0.3))
          .setScale(sprite.flipX?-sx:sx,sy);
      }
    }
    for(const {image} of view.layers)image.setAlpha(alpha*Math.min(1,(duration-elapsed)/180));
    if(f)view.update(elapsed,dt);
  }

  hit(sprite,critical=false,point={x:sprite.x,y:sprite.y-sprite.displayHeight*0.46},damage){
    if(!sprite.visible||sprite.alpha===0)return;
    if(this.numbers.length>=8)this.removeNumber(0);
    const value=damage??((critical?32:12)+Math.floor(Math.random()*7));
    const text=this.scene.add.text(0,0,critical?value+'!':String(value),{
      fontFamily:'sans-serif',fontStyle:'bold',fontSize:critical?'19px':'14px',
      color:critical?'#ffce68':'#fff5df',stroke:'#332638',strokeThickness:3,
    }).setOrigin(0.5,1);
    const flash=this.scene.add.graphics();
    this.numbers.push({text,flash,sprite,elapsed:0,keepAfterHide:damage!==undefined,
      x:point.x+(Math.random()-0.5)*10,y:point.y,
      offsetX:point.x-sprite.x,offsetY:point.y-sprite.y});
    this.drawNumber(this.numbers.at(-1));
  }

  drainResult(sprite,healed){
    this.resultNumber(sprite,String(healed),'#63d692','#20322e');
  }

  parryResult(sprite,blocked){
    this.resultNumber(sprite,'BLOCK '+blocked,'#c4c9ce','#272a30',-19);
  }

  resultNumber(sprite,label,color,stroke,offsetY=0){
    if(this.numbers.length>=8)this.removeNumber(0);
    const text=this.scene.add.text(0,0,label,{
      fontFamily:'sans-serif',fontStyle:'bold',fontSize:'14px',color,stroke,strokeThickness:3,
    }).setOrigin(0.5,1);
    const popup={sprite,text,x:sprite.x,y:sprite.y-sprite.displayHeight*0.85+offsetY,elapsed:0};
    this.numbers.push(popup);
    this.drawNumber(popup);
  }

  drawNumber(n){
    const t=n.elapsed/820,alpha=n.sprite.visible?n.sprite.alpha:Number(n.keepAfterHide);
    n.text.setPosition(n.x,n.y-5-21*t).setAlpha(alpha*Math.min(1,(1-t)*2.5)).setDepth(n.sprite.depth+12);
    if(!n.flash)return;
    n.flash.clear().setPosition(n.sprite.x+n.offsetX,n.sprite.y+n.offsetY).setDepth(n.sprite.depth+2);
    if(n.elapsed<150)n.flash.lineStyle(1,0xfff2ca,alpha*(1-n.elapsed/150)).strokeCircle(0,0,3+n.elapsed/22);
  }

  removeNumber(i){
    const n=this.numbers.splice(i,1)[0];n.text.destroy();n.flash?.destroy();
  }

  update(dt,{pauseStatuses=false}={}){
    const statusDt=pauseStatuses?0:dt;
    for(let i=this.active.length-1;i>=0;i--){
      const r=this.active[i];r.elapsed+=statusDt;
      if(r.elapsed>=r.duration)this.active.splice(i,1)[0].view.destroy();
      else this.place(r,statusDt);
    }
    for(let i=this.numbers.length-1;i>=0;i--){
      const n=this.numbers[i];n.elapsed+=dt;
      if(n.elapsed>=820||!n.sprite.scene)this.removeNumber(i);
      else this.drawNumber(n);
    }
  }

  clearStatuses(sprite,group){
    this.active=this.active.filter(r=>{
      if((sprite&&r.sprite!==sprite)||(group&&r.group!==group))return true;
      r.view.destroy();
      return false;
    });
  }

  clear(sprite){
    this.clearStatuses(sprite);
    for(let i=this.numbers.length-1;i>=0;i--){
      if(!sprite||this.numbers[i].sprite===sprite)this.removeNumber(i);
    }
  }
}
