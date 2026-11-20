const GOLDEN_ANGLE=Math.PI*(3-Math.sqrt(5));

// Fixed sites in world pixels. Each radius gets a fresh layout.
export function groundSites(radius,count,rng,makeSite){
  const offset=rng.range(0,Math.PI*2);
  return Array.from({length:count},(_,i)=>{
    const arc=offset+i*GOLDEN_ANGLE+rng.range(-0.18,0.18);
    const distance=radius*Math.sqrt((i+rng.range(0.15,0.85))/count);
    return {
      x:Math.round(Math.cos(arc)*distance),
      y:Math.round(Math.sin(arc)*distance),
      distance,
      ...makeSite(i),
    };
  });
}
