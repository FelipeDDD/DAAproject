import { labSheets as sheets } from './sheetCatalog.js';
import { drawField, lurePath } from './fieldDetails.js';
import { createEncounter,createSentryVisual } from './proximityDemo.js';
import { handOf as emitterFor, precisionView } from './precisionDemo.js';
import { camouflageView } from './visibilityDemo.js';

const key=name=>'vfx-lab-sheet-'+name;
const frames=new Map();
for(const [name,sheet] of Object.entries(sheets)){
  let total=0;
  const ends=sheet.frameMs.map(ms=>total+=ms);
  frames.set(name,{...sheet,ends,total});
}

export function preloadLabSheets(scene,baseUrl,names=frames.keys()){
  for(const name of names){
    if(scene.textures.exists(key(name)))continue;
    const {width,height,ends}=frames.get(name);
    scene.load.spritesheet(key(name),baseUrl+'tools/vfx-lab/sheets/'+name+'.png',{
      frameWidth:width,frameHeight:height,endFrame:ends.length-1,
    });
  }
}

function location(point,offset=[0,0]){
  return {x:point.x+offset[0],y:point.y+offset[1]};
}

// Both the weapon art and its precision check use the same live hand pivot.

function frameAt(sheet,progress,cycles){
  const t=(progress*cycles%1)*sheet.total;
  return sheet.ends.findIndex(end=>end>t);
}

const missiles={
  cinder:[0x952f38,0xff862b,0xffef9a],
  icicle:[0x28577e,0x48b9cf,0xdfffff],
  acid:[0x4b3b60,0x89bc4e,0xe5fa90],
  heal:[0x276b50,0x82d8ac,0xe2ffd6],
};

// Draw in flight coordinates. The sprite origin and destination are sampled once per cast.
export function drawFlight(g,style,t,distance){
  const [rim,mid,light]=missiles[style];
  const head=distance*t;
  const pulse=Math.sin(t*24);
  if(style==='icicle'){
    g.fillStyle(rim).fillTriangle(head+12,0,head-10,-5,head-15,4);
    g.fillStyle(mid).fillTriangle(head+12,0,head-9,-4,head-10,1);
    g.fillStyle(light).fillTriangle(head+9,0,head-6,-2,head-9,1);
  }else{
    for(let i=4;i>=1;i--){
      const x=head-i*4;
      const y=Math.round(Math.sin(t*22-i)*i*0.7);
      g.fillStyle(i%2?mid:rim,1-i/7).fillCircle(x,y,Math.max(1,6-i));
    }
    g.fillStyle(rim).fillCircle(head,0,7);
    g.fillStyle(mid).fillCircle(head+1,-1,5);
    g.fillStyle(light).fillCircle(head+2,-2,2+pulse*0.6);
  }
}

function drawArc(g,t,distance,seed){
  const points=[];
  const tick=Math.floor(t*7);
  for(let i=0;i<=8;i++){
    const y=i===0||i===8?0:Math.round(Math.sin(i*5.7+tick*2.4+seed)*5);
    points.push({x:Math.round(distance*i/8),y});
  }
  const alpha=1-t*0.85;
  g.lineStyle(4,0x5764c6,alpha).strokePoints(points);
  g.lineStyle(1,0xd2ffff,alpha).strokePoints(points);
  const fork=points[4];
  g.lineStyle(1,0x83c3ff,alpha).lineBetween(fork.x,fork.y,fork.x+9,fork.y-9);
}

export function drawWard(g,t,form=Math.min(1,t*6,(1-t)*5)){
  const pulse=(1+Math.cos(t*14))/2;
  const corners=Array.from({length:6},(_,i)=>{
    const a=i*Math.PI/3;
    return {x:Math.round(Math.sin(a)*20*form),y:Math.round(Math.cos(a)*23*form)};
  });
  g.clear().fillStyle(0x509ccd,0.08*form).fillPoints(corners,true)
    .lineStyle(1,0x99eafa,(0.45+0.4*pulse)*form).strokePoints(corners,true);
}

// The finishing pulse samples allies once. Haste follows its recipient after the grove closes.
export function drawHealingPulse(g,t,radius=44,squash=0.7){
  const w=2*radius*(1-(1-t)**2);
  g.clear().lineStyle(2,0xc6ffc5,0.85*(1-t)).strokeEllipse(0,0,w,w*squash)
    .lineStyle(1,0x82d8ac,0.6*(1-t)).strokeEllipse(0,0,w*0.89,w*0.89*squash);
}

export function grovePulse(scene,center){
  const radius=44,squash=0.7;
  const g=scene.add.graphics().setPosition(center.x,center.y).setDepth(center.y-64);
  for(const ally of [scene.player,scene.allyDummy]){
    if(Math.hypot(ally.x-center.x,(ally.y-center.y)/squash)<=radius){
      scene.reactions.apply(ally,'Haste',1700);
    }
  }
  return {object:g,draw:t=>drawHealingPulse(g,t,radius,squash)};
}

function createLayer(scene,clip,anchor,player,nearest,livePlayer,captureAim,settings,resolveStrike){
  if(clip.grovePulse)return grovePulse(scene,anchor);
  if(clip.camouflage)return camouflageView(scene,anchor,clip.radius,settings);
  if(clip.precision)return precisionView(scene,clip,anchor,livePlayer,captureAim,resolveStrike);
  const target=location(anchor,clip.offset);
  const source=clip.fromOffset?location(anchor,clip.fromOffset):clip.beam?player.emitter:location(player,[0,-16]);
  const dx=target.x-source.x,dy=target.y-source.y;
  const distance=Math.hypot(dx,dy);
  const angle=Math.atan2(dy,dx);
  const depth=clip.floor?Math.min(anchor.y,player.y)-64:Math.max(anchor.y,player.y,target.y)+4;
  if(clip.encounter){
    return createEncounter(scene,clip,anchor,(child,point)=>createLayer(scene,child,point,player,nearest,livePlayer));
  }
  if(clip.sheet){
    const sheet=frames.get(clip.sheet);
    const image=scene.add.image(target.x,target.y,key(clip.sheet),0)
      .setOrigin(sheet.anchor[0]/sheet.width,sheet.anchor[1]/sheet.height)
      .setDepth(depth).setScale(clip.scale??1);
    image.texture.setFilter(nearest);
    if(clip.flip)image.setFlipX(true);
    if(clip.tint)image.setTint(clip.tint);
    if(clip.melee){
      // Rotate around the hand, not the feet. Mirror across the swing plane for left-facing cuts.
      image.setOrigin(sheet.anchor[0]/sheet.width,(sheet.anchor[1]-(clip.handHeight??24))/sheet.height);
    }

    return {object:image,draw(t){
      if(clip.caster||clip.melee||clip.contact){
        const hand=emitterFor(livePlayer);
        const aim=captureAim?.()??anchor;
        const direction=Math.atan2(aim.y-hand.y,aim.x-hand.x);
        const sign=aim.x<hand.x?-1:1,scale=clip.scale??1;
        image.setDepth(livePlayer.y+4);
        if(clip.caster)image.setPosition(hand.x,hand.y+14).setScale(scale*sign,scale);
        if(clip.melee)image.setPosition(hand.x,hand.y).setRotation(direction).setScale(scale,scale*sign);
        if(clip.contact){
          image.setPosition(hand.x+Math.cos(direction)*clip.contact,hand.y+Math.sin(direction)*clip.contact);
          if(clip.turnToAim)image.setRotation(direction).setScale(scale,scale*sign);
        }
      }
      if(clip.beam){
        const hand=emitterFor(livePlayer),x=target.x-hand.x,y=target.y-hand.y;
        // The source spec measures 99 pixels from its emitter to the impact.
        image.setPosition(hand.x,hand.y).setRotation(Math.atan2(y,x)).setScale(Math.hypot(x,y)/99,clip.scale??1);
      }
      let progress=t;
      if(clip.smokePhase!==undefined){
        // Oscillate through the dense center frames without re-igniting or popping.
        progress=0.38+0.18*Math.sin((t*2+clip.smokePhase)*Math.PI*2);
      }
      if(clip.holdBeam){
        // Stretch only the luminous middle frames. Keep the charge and collapse separate.
        progress=t<0.15?t*2:t<0.86?0.40+0.07*Math.sin(t*40):0.47+0.53*(t-0.86)/0.14;
      }
      if(clip.frames){
        // Select just the opening, idle or release portion of a baked clip.
        progress=clip.frames[0]+(clip.frames[1]-clip.frames[0])*((t*(clip.cycles??1))%1);
      }
      image.setFrame(frameAt(sheet,Math.min(progress,0.999999),clip.frames?1:clip.cycles??1));
      if(clip.drift)image.setPosition(target.x+t*clip.drift[0],target.y+t*clip.drift[1]);
      if(clip.fade||clip.opacity!==undefined)image.setAlpha((clip.opacity??1)*(clip.fade?Math.min(1,t*12,(1-t)*8):1));
      if(clip.chase){
        const offset=lurePath(Math.max(0,t-0.09));
        image.setPosition(target.x+offset.x-24*Math.max(0,1-t*6),target.y+offset.y);
      }
    }};
  }

  const g=scene.add.graphics().setDepth(depth);
  if(clip.field){
    g.setPosition(target.x,target.y);
    return {object:g,draw:t=>drawField(g,clip.field,t)};
  }
  if(clip.ward){
    g.setPosition(target.x,target.y);
    return {object:g,draw:t=>drawWard(g,t)};
  }
  if(clip.mark){
    g.setPosition(target.x,target.y);
    return {object:g,draw(t){
      const r=clip.mark*(1-0.24*t);
      g.clear().lineStyle(2,clip.color,0.45+t*0.4).strokeEllipse(0,0,r*2,r);
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2+t*0.75;
        g.lineBetween(Math.cos(a)*r,Math.sin(a)*r/2,Math.cos(a)*(r+4),Math.sin(a)*(r+4)/2);
      }
    }};
  }
  g.setPosition(source.x,source.y).setRotation(angle);
  return {object:g,draw(t){
    g.clear();
    if(clip.flight)drawFlight(g,clip.flight,t,distance);
    else drawArc(g,t,distance,clip.seed??0);
  }};
}

export function createSentryView(scene,anchor,radius,nearest){
  return createSentryVisual(scene,anchor,radius,(clip,point)=>createLayer(scene,clip,point,anchor,nearest));
}

// All layers sample the playback clock. No Phaser timers, tweens or global animations.
export class SheetSequence {
  constructor(scene,clips,anchor,player,nearest,random=Math.random,captureAim,settings,resolveStrike){
    const emitter=emitterFor(player);
    const caster={x:player.x,y:player.y,emitter};
    // One draw per cast; the warning and its delayed blast share this exact point.
    let scatter;
    this.layers=clips.map(clip=>{
      if(clip.scatter&&!scatter){
        const angle=random()*Math.PI*2,radius=22+random()*22;
        scatter=location(anchor,[Math.cos(angle)*radius,Math.sin(angle)*radius]);
      }
      const point=clip.scatter?scatter:anchor;
      return {clip,create:()=>createLayer(scene,clip,point,caster,nearest,player,captureAim,settings,resolveStrike),view:null};
    });
  }
  update(ms){
    for(const layer of this.layers){
      const {clip}=layer;
      if(ms<clip.at||ms>=clip.at+clip.ms){
        layer.view?.object.destroy();
        layer.view=null;
        continue;
      }
      layer.view??=layer.create();
      layer.view.draw((ms-clip.at)/clip.ms);
    }
  }
  destroy(){
    for(const layer of this.layers){
      layer.view?.object.destroy();
      layer.view=null;
    }
  }
}
