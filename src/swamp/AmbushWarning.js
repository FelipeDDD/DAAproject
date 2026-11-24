import { burst, fly } from '../vfx/lab/vendor/pixelfx/core/particles.js';

const colors=[0xd3df6b,0x9dc751,0xc0a346];
const styles={
  soft:{count:12,spread:0.65,foliage:false},
  escalating:{count:25,spread:1,foliage:true},
  foliage:{count:8,spread:0.45,foliage:true},
};

export class AmbushWarning {
  constructor(scene,bush,style,duration){
    const {count,spread,foliage}=styles[style];
    this.graphics=scene.add.graphics().setPosition(bush.x,bush.y)
      .setDepth(scene.physics.world.bounds.height+1);
    this.duration=duration;
    this.foliage=foliage;
    this.leaves=[];
    burst(count,137,(random,i)=>{
      const wave=i<Math.ceil(count/3)?0:0.28+0.17*random.next();
      const strength=(wave?1:0.52)*spread;
      this.leaves.push({
        x:(random.next()-0.5)*22,y:(random.next()-0.5)*10,
        vx:(random.next()-0.65)*102*strength,vy:-24-random.next()*68*strength,
        delay:wave+random.next()*0.1,color:colors[i%colors.length],size:2+random.next()*2,
      });
    });
  }

  draw(ms){
    const g=this.graphics.clear();
    const progress=Math.min(1,ms/this.duration);
    if(this.foliage){
      // Small animated silhouettes over the static bush, with a quick sway
      // and stronger movement before the last burst of leaves.
      const alpha=Math.sin(progress*Math.PI)*0.68;
      for(let i=0;i<6;i++){
        const x=(i-2.5)*5+Math.sin(ms/36+i)*4*progress;
        g.fillStyle(colors[i%colors.length],alpha)
          .fillTriangle(x-3,2,x+1,-8-i%2*4,x+4,0);
      }
    }
    for(const leaf of this.leaves){
      const age=ms/1000-leaf.delay;
      if(age<0||age>0.46)continue;
      const [x,y]=fly(leaf.x,leaf.y,leaf.vx,leaf.vy,age,128,2.2);
      const alpha=Math.min(1,(0.46-age)*4,(1-progress)*8);
      g.fillStyle(leaf.color,alpha).fillTriangle(x-leaf.size,y+1,x+leaf.size,y-2,x+1,y+3);
    }
  }

  destroy(){this.graphics.destroy();}
}
