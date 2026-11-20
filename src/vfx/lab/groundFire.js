const GOLDEN_ANGLE=Math.PI*(3-Math.sqrt(5));
const IGNITION_MS=80;

// Compose several short flames into the same two PixelFX layers. The placement
// happens in world pixels on the ground plane; the flame art is never scaled.
export function groundFire(source,{count,spread,expansion}){
  const cycle=source.meta.duration;
  const [width,height]=expansion?[spread*2+88,spread*2+104]:[192,192];
  const origin=expansion?[spread+44,spread+76]:[96,120];
  const sites=Array.from({length:count},(_,index)=>{
    const radius=spread*Math.sqrt(index/(count-1));
    const angle=index*GOLDEN_ANGLE;
    return {
      x:Math.round(Math.cos(angle)*radius),
      y:Math.round(Math.sin(angle)*radius),
      ignitionMs:expansion?Math.max(0,(expansion.spreadMs-IGNITION_MS)*radius/spread):0,
      phase:index*cycle/count,
      options:{...source.meta.options,seed:source.meta.options.seed+index*17},
    };
  }).sort((a,b)=>a.y-b.y);

  const drawHalf=(p,t,back)=>{
    const timeMs=t*1000;
    const fade=expansion?Math.min(1,(expansion.durationMs-timeMs)/expansion.fadeMs):1;
    for(const site of sites){
      if((site.y<0)!==back)continue;
      if(site.ignitionMs>0&&timeMs<=site.ignitionMs)continue;
      p.place(site.x,site.y);
      const ignition=site.ignitionMs>0?Math.min(1,(timeMs-site.ignitionMs)/IGNITION_MS):1;
      p.fade=fade*ignition;
      source.draw(p,(t+site.phase)%cycle,site.options);
    }
    p.place(0,0);
  };
  return {
    meta:{size:[width,height],origin,duration:expansion?expansion.durationMs/1000:cycle,loop:!expansion,fps:30},
    drawBack:(p,t)=>drawHalf(p,t,true),
    draw:(p,t)=>drawHalf(p,t,false),
  };
}
