// Segment test avoids tunnelling through small covers on slow frames.
export function segmentRect(from,to,rect){
  let lo=0,hi=1;
  for(const [axis,size] of [['x','width'],['y','height']]){
    const delta=to[axis]-from[axis],min=rect[axis],max=min+rect[size];
    if(Math.abs(delta)<1e-9){if(from[axis]<min||from[axis]>max)return null;continue;}
    const a=(min-from[axis])/delta,b=(max-from[axis])/delta;
    lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return null;
  }
  return lo;
}
