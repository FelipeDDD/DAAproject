import { drawField } from './fieldDetails.js';
import original from '../../combat/balance.original.json' with {type:'json'};

export const SENTRY_SHEET='pfx-coil';
export const SENTRY_DEFAULTS=original.michael.tesla;
export const SENTRY_FLASH_MS=210;

// Per cast, each dummy can enter once. A mine spends its only charge on the first entry.
export function proximityTrigger(radius,charges=Infinity,cooldownMs=Infinity,centerY=0,eligible=()=>true){
  const lastShot=new Map();
  let remaining=charges;
  return (targets,ms=0)=>targets.filter(target=>{
    const {id,x,y,team}=target;
    if(team!=='red'||!remaining||x*x+(y-centerY)**2>radius*radius)return false;
    if(lastShot.has(id)&&ms-lastShot.get(id)<cooldownMs)return false;
    if(!eligible(target))return false;
    remaining--;
    lastShot.set(id,ms);
    return true;
  });
}

const clamp=t=>Math.max(0,Math.min(1,t));
function visitor(i,ms){
  const progress=clamp((ms-700-i*1600)/2300);
  return {id:i,team:'red',x:(i?-1:1)*(92-74*progress),y:(i?18:-10)+6*Math.sin(progress*Math.PI)};
}

export function createSentryVisual(scene,anchor,radius,layer){
  const stand=layer({sheet:SENTRY_SHEET,scale:0.73},anchor);
  const circle=scene.add.graphics().setPosition(anchor.x,anchor.y).setDepth(anchor.y-2);
  circle.lineStyle(1,0x59bda6,0.48).strokeCircle(0,0,radius);
  const arcs=scene.add.graphics().setDepth(anchor.y+7);
  return {
    draw(ms,flashes){
      stand.draw((ms%2400)/2400);
      arcs.clear();
      for(const {x,y,age} of flashes){
        if(!(age>=0&&age<SENTRY_FLASH_MS))continue;
        const alpha=1-age/SENTRY_FLASH_MS;
        const points=Array.from({length:7},(_,i)=>{
          const u=i/6,j=i===0||i===6?0:3*Math.sin(i*6.9+Math.floor(age/45));
          return {x:anchor.x+u*(x-anchor.x)+j,y:anchor.y-39+u*(y-anchor.y+39)};
        });
        arcs.lineStyle(3,0x737be8,alpha).strokePoints(points)
          .lineStyle(1,0xe1ffff,alpha).strokePoints(points)
          .fillStyle(0xa0efff,alpha).fillCircle(x,y,4);
      }
    },
    destroy(){arcs.destroy();stand.object.destroy();circle.destroy();},
  };
}

export function createEncounter(scene,clip,anchor,layer){
  const mine=clip.encounter==='mine',sentry=clip.encounter==='sentry';
  const radius=mine?32:sentry?SENTRY_DEFAULTS.radius:62;
  // The flame base in shadow/necro-skulls is 32 source pixels above the export pivot.
  const centerY=clip.encounter==='altar'?-32*1.05:0;
  const enter=proximityTrigger(radius,mine?1:Infinity,sentry?SENTRY_DEFAULTS.targetCooldownMs:Infinity,centerY);
  const coil=sentry?createSentryVisual(scene,anchor,radius,layer):null;
  const stand=sentry?null:layer({sheet:clip.sheet,scale:mine?0.85:1.05,tint:mine?0xcafa91:undefined},anchor);
  const circle=sentry?null:scene.add.graphics().setPosition(anchor.x,anchor.y+centerY).setDepth(anchor.y-2);
  circle?.lineStyle(1,mine?0xa4b969:0x59bda6,0.48).strokeCircle(0,0,radius);
  const markers=Array.from({length:mine?2:3},()=>scene.add.graphics());
  const discharge=new Map();

  const launches=[];
  let triggered=null;
  function draw(t){
    const ms=t*clip.ms;
    const targets=markers.map((g,i)=>{
      const p=i===markers.length-1?{id:i,team:'blue',x:16,y:14}:visitor(i,ms);
      g.setPosition(anchor.x+p.x,anchor.y+p.y).setDepth(anchor.y+p.y+2);
      drawField(g,'relay',0.25+t*0.5,p.team==='blue'?0x69cdee:0xff968e);
      return p;
    });
    for(const p of enter(targets,ms)){
      if(mine||sentry)scene.previewHit?.(markers[p.id],{x:anchor.x+p.x,y:anchor.y+p.y-11});
      if(mine){triggered=ms;circle.setVisible(false);}
      else if(sentry)discharge.set(p.id,ms);
      else{
        const skull=layer({sheet:clip.missileSheet,scale:0.46},anchor);
        // Same tilted ellipse, phase and bob as shadow/necro-skulls in the pinned catalog.
        const t=ms/3000*2*Math.PI,angle=t+p.id*2*Math.PI/5;
        const ex=42*Math.cos(angle),ey=11*Math.sin(angle);
        const x=(ex*Math.cos(-0.12)-ey*Math.sin(-0.12))*1.05;
        const y=(-52+ex*Math.sin(-0.12)+ey*Math.cos(-0.12)+2*Math.sin(2*t+p.id*1.7))*1.05;
        launches.push({id:p.id,start:ms,origin:{x,y},skull});
      }
    }
    if(mine){
      // spore-burst grows until 0.32 s and releases spores at 0.8 s in the original.
      const progress=triggered===null?0.12:0.12+(ms-triggered)/3200;
      stand.object.setVisible(progress<1);
      if(progress<1)stand.draw(progress);

    }else if(sentry){
      coil.draw(ms,targets.map(p=>({x:anchor.x+p.x,y:anchor.y+p.y-11,age:ms-discharge.get(p.id)})));
    }else{
      stand.draw(ms%3000/3000);
      for(const shot of launches){
        const elapsed=ms-shot.start,p=targets[shot.id];
        if(elapsed<650){
          const u=clamp(elapsed/650);
          shot.skull.draw(u*0.9);
          shot.skull.object.setPosition(anchor.x+shot.origin.x*(1-u)+p.x*u,
            anchor.y+shot.origin.y*(1-u)+(p.y-11)*u+3-10*Math.sin(Math.PI*u));
        }else{
          if(shot.skull){
            scene.previewHit?.(markers[p.id],{x:anchor.x+p.x,y:anchor.y+p.y-11});
            shot.skull.object.destroy();shot.skull=null;
          }
          if(elapsed<1010){
            shot.impact??=layer({sheet:'spark',scale:0.85,tint:0x99ffce},{x:anchor.x+p.x,y:anchor.y+p.y-11});
            shot.impact.draw((elapsed-650)/360);
          }else{shot.impact?.object.destroy();shot.impact=null;}
        }
      }
    }
  }
  function destroy(){

    coil?.destroy();
    stand?.object.destroy();
    circle?.destroy();
    markers.forEach(g=>g.destroy());
    for(const shot of launches){shot.skull?.object.destroy();shot.impact?.object.destroy();}
  }
  return {draw,object:{destroy}};
}
