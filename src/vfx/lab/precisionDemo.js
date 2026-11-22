export const LASH={reach:(11+76)*0.84,radius:7,crackMs:200};
export const DRAIN_ORBS=4;
export const orbArrivalProgress=index=>0.75+index*0.065;
const clamp=t=>Math.max(0,Math.min(1,t));

export function handOf(player){
  return {x:player.body?.center.x??player.x,y:(player.body?.center.y??player.y)-(player.displayHeight??64)*0.34};
}

export function lashTip(hand,aim){
  // PixelFX whip-crack's native hand-to-tip offset scaled and rotated about the exported pivot.
  const angle=Math.atan2(aim.y-hand.y,aim.x-hand.x);
  const normal=(aim.x<hand.x?-1:1)*2*0.84;
  return {x:hand.x+LASH.reach*Math.cos(angle)-normal*Math.sin(angle),
    y:hand.y+LASH.reach*Math.sin(angle)+normal*Math.cos(angle)};
}

export function drainHit(hand,aim,target){
  const dx=aim.x-hand.x,dy=aim.y-hand.y,length=dx*dx+dy*dy;
  if(!length)return false;
  const u=clamp(((target.x-hand.x)*dx+(target.y-hand.y)*dy)/length);
  return Math.hypot(target.x-hand.x-u*dx,target.y-hand.y-u*dy)<=7;
}

export function orbPosition(i,t,source,hand){
  // Burst out, hover briefly, then accelerate towards the current hand position.
  const a=-2.65+i*0.68;
  const remaining=orbArrivalProgress(i)-t;
  const lift=clamp(t/0.24),u=clamp(1-remaining/0.49)**1.7;
  const x=source.x+Math.cos(a)*12*lift,y=source.y+Math.sin(a)*16*lift;
  return {x:x+(hand.x-x)*u,y:y+(hand.y-y)*u-8*Math.sin(Math.PI*u),done:u===1};
}

export const chestOf=sprite=>({x:sprite.x,y:sprite.y-sprite.displayHeight*0.42});

export function precisionView(scene,clip,anchor,player,captureAim,resolveStrike=scene.resolveSandboxStrike?.bind(scene)){
  const g=scene.add.graphics();
  const victim=scene.selectedDummy??scene.target;

  const isLash=clip.precision==='tip';
  let releasePoint=resolveStrike?anchor:chestOf(victim);
  let drained=false;
  if(!isLash){
    if(resolveStrike){
      const contact=resolveStrike('drain',anchor);
      if(contact){releasePoint=contact;drained=true;}
    }else if(drainHit(handOf(player),anchor,releasePoint)){
      drained=true;
      scene.previewHit?.(victim,releasePoint);
    }
  }
  let impact=null;
  return {draw(t){
    const hand=handOf(player),ms=t*clip.ms;
    const target=isLash&&!resolveStrike?chestOf(victim):releasePoint;
    g.clear().setDepth(Math.max(player.y,resolveStrike?target.y:victim.y)+6);
    if(!resolveStrike)g.lineStyle(1,0xf3dab0,0.55).strokeCircle(target.x,target.y,6);
    if(isLash){
      if(ms>=LASH.crackMs&&!impact){
        const aim=captureAim?.()??anchor;
        const tip=lashTip(hand,aim);
        const contact=resolveStrike?resolveStrike('lash',aim):null;
        const hit=resolveStrike?Boolean(contact):Math.hypot(tip.x-target.x,tip.y-target.y)<=LASH.radius;
        impact={...tip,hit,contact:contact??target};
        if(hit&&!resolveStrike)scene.previewHit?.(victim,target);
      }
      if(impact&&ms<LASH.crackMs+320){
        const fade=1-(ms-LASH.crackMs)/320;
        g.lineStyle(2,impact.hit?0x90ffbf:0xd2b69c,fade).strokeCircle(impact.x,impact.y,LASH.radius);
        if(impact.hit)g.fillStyle(0xfff1b4,fade).fillCircle(impact.contact.x,impact.contact.y,4);
      }
    }else{
      if(ms<160)g.lineStyle(1,drained?0xf68b98:0x957577,1-ms/160)
        .lineBetween(hand.x,hand.y,drained?target.x:anchor.x,drained?target.y:anchor.y);
if(drained)for(let i=0;i<DRAIN_ORBS;i++){
        const p=orbPosition(i,t,target,hand);
        if(p.done)continue;
        const tail=orbPosition(i,Math.max(0,t-0.035),target,hand);
        g.lineStyle(1,0xbf364d,0.85).lineBetween(tail.x,tail.y,p.x,p.y);
        g.fillStyle(0xd73750).fillCircle(p.x,p.y,2).fillStyle(0xffc8bc).fillRect(p.x,p.y-1,1,1);
      }
    }
  },object:g};
}
