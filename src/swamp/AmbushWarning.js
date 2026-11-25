import { burst, fly } from '../vfx/lab/vendor/pixelfx/core/particles.js';

const colors=[[0x779443,0xaac264],[0x9aa34b,0xc6d075],[0xa68843,0xd0b05e]];
const silhouettes=[
  ['...#...', '..###..', '.##+##.', '.#++##.', '.+###..', '#.##...'],
  ['....##', '..###.', '.#+##.', '#+##..', '#.....'],
  ['...##..', '.####..', '##++###', '.#+###.', '#..##..'],
];
const turns=8;

// Bake the tiny silhouettes to horizontal pixel runs once. Rotation then
// selects a frame without smoothing, allocating textures or adding sprites.
const leaves=silhouettes.map(rows=>Array.from({length:turns},(_,frame)=>{
  const angle=frame*2*Math.PI/turns,cos=Math.cos(angle),sin=Math.sin(angle);
  const cx=Math.floor(rows[0].length/2),cy=Math.floor(rows.length/2);
  const radius=Math.ceil(Math.hypot(cx,cy));
  const runs=[[],[]];
  for(let y=-radius;y<=radius;y++){
    let start=-radius,tone=-1;
    for(let x=-radius;x<=radius+1;x++){
      const pixel=x<=radius?rows[Math.round(-x*sin+y*cos)+cy]?.[Math.round(x*cos+y*sin)+cx]:undefined;
      const next=pixel==='#'?0:pixel==='+'?1:-1;
      if(next===tone)continue;
      if(tone>=0)runs[tone].push([start,y,x-start]);
      start=x;
      tone=next;
    }
  }
  return runs;
}));

function drawLeaf(graphics,shape,palette,x,y,turn,alpha){
  if(alpha<=0)return;
  const frame=((Math.round(turn)%turns)+turns)%turns;
  const left=Math.round(x),top=Math.round(y);
  for(const [tone,runs] of leaves[shape][frame].entries()){
    graphics.fillStyle(colors[palette][tone],alpha);
    for(const [dx,dy,width] of runs)graphics.fillRect(left+dx,top+dy,width,1);
  }
}
const styles={
  soft:{count:12,spread:0.65,foliage:false},
  escalating:{count:25,spread:1,foliage:true},
  foliage:{count:8,spread:0.45,foliage:true},
  water:{count:0,spread:0,foliage:false},
};

export class AmbushWarning {
  constructor(scene,bush,style,duration){
    const {count,spread,foliage}=styles[style];
    this.graphics=scene.add.graphics().setPosition(bush.x,bush.y)
      .setDepth(scene.ambushLeafDepth??scene.physics.world.bounds.height+1);
    this.duration=duration;
    this.water=style==='water';
    this.foliage=foliage;
    this.leaves=[];
    burst(count,137,(random,i)=>{
      const wave=i<Math.ceil(count/3)?0:0.28+0.17*random.next();
      const strength=(wave?1:0.52)*spread;
      this.leaves.push({
        x:(random.next()-0.5)*22,y:(random.next()-0.5)*10,
        vx:(random.next()-0.65)*102*strength,vy:-24-random.next()*68*strength,
        delay:wave+random.next()*0.1,palette:i%colors.length,
        shape:Math.floor(random.next()*leaves.length),turn:i%turns,spin:i%3===0?5:i%3===1?-4:0,
      });
    });
  }

  draw(ms){
    const g=this.graphics.clear();
    const progress=Math.min(1,ms/this.duration);
    if(this.water){
      for(let i=0;i<2;i++){
        const t=Math.max(0,progress-i*0.25);
        g.lineStyle(1,0xa9e7f6,Math.sin(t*Math.PI)*0.8).strokeEllipse(0,0,10+38*t,5+16*t);
      }
      return;
    }
    if(this.foliage){
      // A few leaves twitch at the origin before the wider scatter.
      const alpha=Math.sin(progress*Math.PI)*0.68;
      for(let i=0;i<6;i++){
        const x=(i-2.5)*5+Math.sin(ms/36+i)*4*progress;
        drawLeaf(g,i%leaves.length,i%colors.length,x,-3-i%2*3,i+Math.sin(ms/56+i),alpha);
      }
    }
    for(const leaf of this.leaves){
      const age=ms/1000-leaf.delay;
      if(age<0||age>0.46)continue;
      const [x,y]=fly(leaf.x,leaf.y,leaf.vx,leaf.vy,age,128,2.2);
      const alpha=Math.min(1,(0.46-age)*4,(1-progress)*8);
      drawLeaf(g,leaf.shape,leaf.palette,x,y,leaf.turn+leaf.spin*age,alpha);
    }
  }

  destroy(){this.graphics.destroy();}
}
