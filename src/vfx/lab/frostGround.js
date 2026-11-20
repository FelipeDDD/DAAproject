import { groundSites } from './groundSites.js';
import { band, clamp, crystal, ease, ramp, Rng, sparkle, TAU } from './vendor/pixelfx/core/index.js';

const colors=ramp(['#151a3d','#212f6b','#2c58aa','#3a8bd8','#62c8f4','#a6ecff','#dcfbff','#ffffff']);

export const frostGround={
  spreadMs:700,
  fadeMs:700,
  floorColor:0x69bdeb,
  floorOpacity:0.28,
  create(radius){
    const rng=new Rng(4);
    const crystals=groundSites(radius-8,Math.min(24,Math.ceil(radius/6.6)),rng,i=>({
      height:rng.range(6,13),width:rng.range(4,7),lean:rng.range(-4,4),
      phase:rng.range(0,1),paired:i%3===0,
    })).sort((a,b)=>a.y-b.y);
    const cracks=groundSites(radius-12,Math.min(48,Math.ceil(radius/3)),rng,()=>({
      dx:rng.range(-7,7),dy:rng.range(-5,5),
    })).map((mark,i)=>{
      const {x,y,dx,dy}=mark;
      return {...mark,facet:i%3===0?[
        [x,y],[x+dx,y+dy],[x+dx*0.7-dy,y+dy*0.7+dx],[x-dy,y+dx*0.6],
      ]:null};
    });
    return (p,time,expansion,reach)=>{
      const wave=1-expansion;
      band(p,0,0,reach,1,2+wave*5,0.41+wave*0.54,colors);
      for(const mark of cracks){
        if(mark.distance>reach)continue;
        const alpha=clamp((reach-mark.distance)/8)*0.62;
        const {x,y,dx,dy,facet}=mark;
        if(facet)p.poly(facet,colors[5],alpha*0.42);
        p.line(x,y,x+dx,y+dy,colors[5],alpha);
        p.line(x,y,x-dy*0.6,y+dx*0.65,colors[3],alpha);
        p.dot(x+dx,y+dy,colors[6],alpha);
      }
      for(const site of crystals){
        const growth=ease.outQuad(clamp((reach-site.distance)/8));
        if(!growth)continue;
        const {x,y,height,width,lean,phase}=site;
        const shimmer=(time*0.62+phase)%1;
        const glint=shimmer<0.27?shimmer/0.27:-1;
        if(site.paired)crystal(p,x-3,y-1,height*0.58*growth,width*0.72,lean+3,colors,{glint});
        crystal(p,x,y,height*growth,width,lean,colors,{glint});
        // Light flakes drift up and sideways from fixed world-space sites.
        const age=(time*0.6+phase)%1;
        const flakeX=x+Math.sin(age*TAU+phase*3)*4;
        const flakeY=y-1-age*23;
        const opacity=Math.sin(age*Math.PI)*growth;
        if(opacity>0.8&&site.paired) sparkle(p,flakeX,flakeY,1,colors[5],colors[6],0.16);
        else p.dot(flakeX,flakeY,colors[6],opacity);
      }
    };
  },
};
