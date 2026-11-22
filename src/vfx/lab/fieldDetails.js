const tau=Math.PI*2;

export function lurePath(t){
  return {x:-37+80*t,y:15*Math.sin(t*tau+0.4)};
}

// These are only drawn markers. They never own a Phaser body or a target entity.
export function drawField(g,kind,t,color=0xa7f0df){
  g.clear();
  const fade=Math.min(1,t*10,(1-t)*9);
  if(kind==='storm'){
    const pulse=(1+Math.cos(t*12*Math.PI*2))/2;
    for(let i=0;i<9;i++){
      const a=i*tau/9;
      const x=Math.cos(a)*69,y=Math.sin(a)*37;
      g.lineStyle(1,0xa4b6f6,fade*(0.28+0.5*pulse));
      g.lineBetween(x-4,y+2,x+2,y-2);
      g.lineBetween(x+2,y-2,x,y+2);
      g.lineBetween(x,y+2,x+5,y-1);
    }
    return;
  }
  if(kind==='lure'||kind==='relay'){
    const p=kind==='lure'?lurePath(t):{x:0,y:0};
    g.lineStyle(2,0xb7dbef,fade).strokeEllipse(p.x,p.y,14,6);
    const y=p.y-11+2*Math.sin(t*tau);
    g.fillStyle(0x20324c,fade).fillCircle(p.x,y,5);
    g.fillStyle(color,fade).fillTriangle(p.x,y-4,p.x+3,y,p.x,y+4);
    return;
  }
  const pull=kind==='pull';
  for(let i=0;i<(pull?23:35);i++){
    const phase=(i*0.381966+t*(pull?2:3))%1;
    const angle=i*2.39996+(pull?phase*2.1:0.2*Math.sin(t*tau+i));
    const radius=pull?66*(1-phase):12+(i*19%57);
    const x=Math.round(Math.cos(angle)*radius);
    const y=Math.round(Math.sin(angle)*radius*0.49-(pull?8:phase*19));
    const alpha=fade*Math.sin(Math.PI*phase);
    if(pull){
      g.lineStyle(i%6===0?3:1,0xc596f5,alpha);
      g.lineBetween(x,y,x+Math.round(Math.cos(angle-0.9)*6),y+Math.round(Math.sin(angle-0.9)*3));
    }else{
      g.fillStyle(i%3===0?0xe2f588:0x8ec253,alpha).fillRect(x,y,2,2);
    }
  }
}
