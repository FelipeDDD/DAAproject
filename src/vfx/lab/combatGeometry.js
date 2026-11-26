export const RING={left:272,right:560,top:144,bottom:432};
export const SLIME_SCALE=1.15;
export const JUMP_RADIUS=28;

export const POISON_RADIUS=5;

export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export const toward=(from,to,reach)=>{
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  const ratio=length?Math.min(length,reach)/length:0;
  return {x:from.x+dx*ratio,y:from.y+dy*ratio};
};

export function groundPoint(point,sideMargin=20,bounds=RING){
  return {x:clamp(point.x,bounds.left+sideMargin,bounds.right-sideMargin),y:clamp(point.y,bounds.top+6,bounds.bottom-6)};
}

export function playerBox(player){
  if(player.combatGeometry?.hurtbox){
    const {width,height,offsetY}=player.combatGeometry.hurtbox;
    return {x:player.x-width/2,y:player.y+offsetY,width,height};
  }
  return {x:player.x-12,y:player.y-player.displayHeight*0.77,width:24,height:player.displayHeight*0.69};
}

export const boxCenter=box=>({x:box.x+box.width/2,y:box.y+box.height/2});

export function playerFeetBox(player){
  return {x:player.x-8,y:player.y-8,width:16,height:10};
}

export function slimeBox(slime){
  const size=slime.size??1;
  return {x:slime.x-16*size,y:slime.y-slime.lift-24*size,width:32*size,height:24*size};
}

export function circleTouchesBox(point,radius,box){
  return Math.hypot(point.x-clamp(point.x,box.x,box.x+box.width),point.y-clamp(point.y,box.y,box.y+box.height))<=radius;
}

export function boxesOverlap(a,b){
  return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
}

// Slab intersection over one finite segment. Return contact, including on the edge.
export function segmentContact(start,end,box,padding=0){
  let enter=0,exit=1;
  for(const [axis,size] of [['x','width'],['y','height']]){
    const d=end[axis]-start[axis],low=box[axis]-padding,high=box[axis]+box[size]+padding;
    if(!d){
      if(start[axis]<low||start[axis]>high)return null;
      continue;
    }
    const a=(low-start[axis])/d,b=(high-start[axis])/d;
    enter=Math.max(enter,Math.min(a,b));
    exit=Math.min(exit,Math.max(a,b));
    if(enter>exit)return null;
  }
  return {x:start.x+(end.x-start.x)*enter,y:start.y+(end.y-start.y)*enter};
}

export function cleaveContact(hand,aim,box,reach){
  const angle=Math.atan2(aim.y-hand.y,aim.x-hand.x);
  for(const offset of [0,-0.27,0.27,-0.53,0.53]){
    const end={x:hand.x+reach*Math.cos(angle+offset),y:hand.y+reach*Math.sin(angle+offset)};
    const hit=segmentContact(hand,end,box,2);
    if(hit)return hit;
  }
  return null;
}
