// Segment test avoids tunnelling through small covers on slow frames.
// Sprite feet are the anchor in both Phaser and the relay movement samples.
// Keep the local collision probe and authoritative hit test on one body box.
export const PVP_PLAYER_HITBOX=Object.freeze({offsetX:-25,offsetY:-58,width:50,height:68});
export const pvpPlayerHitboxAt=(x,y)=>({...PVP_PLAYER_HITBOX,x:x+PVP_PLAYER_HITBOX.offsetX,y:y+PVP_PLAYER_HITBOX.offsetY});

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
