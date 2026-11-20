import { groundSites } from './groundSites.js';
import { band, clamp, ease, ramp, Rng, sparkle, TAU } from './vendor/pixelfx/core/index.js';
import { GREEN, plus } from './vendor/pixelfx/fx/holy/plus.js';

const colors=ramp(GREEN);

export const healingGround={
  spreadMs:650,
  fadeMs:600,
  floorColor:0x4aad55,
  floorOpacity:0.19,
  create(radius){
    const rng=new Rng(6);
    const sites=groundSites(radius-7,Math.min(24,Math.ceil(radius/6)),rng,i=>({
      phase:rng.range(0,1),cycle:rng.range(1.35,2.05),rise:rng.range(14,29),
      sway:rng.range(0,TAU),cross:i%3!==2,
    }));
    return (p,time,expansion,reach)=>{
      const wave=1-expansion;
      const pulse=0.07*Math.sin(time*TAU*0.8);
      band(p,0,0,reach,1,2+wave*2,0.54+wave*0.28+pulse,colors);
      for(const site of sites){
        if(site.distance>reach)continue;
        const age=(time/site.cycle+site.phase)%1;
        const rise=ease.outQuad(age);
        const x=site.x+Math.sin(age*4+site.sway)*2;
        const y=site.y-2-site.rise*rise;
        const glow=Math.sin(Math.PI*age)*clamp((reach-site.distance)/7);
        if(site.cross){
          const size=glow>0.65?3:2;
          plus(p,x,y,size,glow>0.77?2:1,colors,glow,age<0.45);
          p.glow(x,y,6,colors[5],glow*0.24);
        }else if(glow>0.8){
          sparkle(p,x,y,1,colors[5],colors[6],glow*0.18);
        }else{
          p.dot(x,y,colors[5],glow);
        }
        p.dot(site.x,site.y-3-rise*7,colors[4],glow*0.65);
      }
    };
  },
};
