import { groundFire } from './groundFire.js';
import { PixelFxView } from './PixelFxView.js';
import * as campfire from './vendor/pixelfx/fx/fire/campfire.js';
import * as fireball from './vendor/pixelfx/fx/fire/fireball.js';

const SPREAD_MS=500;
const FADE_MS=400;
const IMPACT_MS=160;
const PROJECTILE_SPEED=620;
const PROJECTILE_SCALE=0.55;
const FLIGHT_LIFT=12;
let nextSequenceId=0;

export class CampfireGround {
  constructor(scene,player,anchor,nearest,{radius,holdMs,projectileEnabled}){
    this.scene=scene;
    this.anchor=anchor;
    this.nearest=nearest;
    this.texturePrefix=`vfx-lab-campfire-${nextSequenceId++}`;
    const dx=anchor.x-player.x;
    const dy=anchor.y-player.y;
    this.travelMs=projectileEnabled?Math.max(110,Math.round(Math.hypot(dx,dy)*1000/PROJECTILE_SPEED)):0;
    this.groundMs=SPREAD_MS+holdMs+FADE_MS;
    this.durationMs=this.travelMs+this.groundMs;
    this.source=groundFire(campfire,{
      spread:radius,
      count:Math.min(16,Math.max(5,Math.round(7*radius/48))),
      expansion:{spreadMs:SPREAD_MS,durationMs:this.groundMs,fadeMs:FADE_MS},
    });
    if(this.travelMs){
      this.launch={x:player.x,y:player.y};
      this.dx=dx;
      this.dy=dy;
      this.projectile=new PixelFxView(scene,fireball,player,nearest,undefined,{
        texturePrefix:`${this.texturePrefix}-projectile`,frontOnly:true,
      });
    }
    this.groundElapsedMs=0;
  }

  update(elapsed,delta){
    if(elapsed<this.travelMs){
      const progress=elapsed/this.travelMs;
      const pitch=Math.PI*progress;
      const y=this.launch.y+this.dy*progress;
      const lift=19*(1-progress)+FLIGHT_LIFT*Math.sin(pitch);
      const rotation=Math.atan2(this.dy+19-Math.PI*FLIGHT_LIFT*Math.cos(pitch),this.dx);
      this.projectile.place(Math.round(this.launch.x+this.dx*progress),Math.round(y-lift),y+1,rotation,PROJECTILE_SCALE);
      this.projectile.update(elapsed,delta);
      return;
    }

    this.projectile?.destroy();
    this.projectile=null;
    const groundElapsed=elapsed-this.travelMs;
    if(!this.ground){
      this.ground=new PixelFxView(this.scene,this.source,this.anchor,this.nearest,undefined,{
        texturePrefix:this.texturePrefix,
      });
    }
    this.ground.update(groundElapsed,groundElapsed-this.groundElapsedMs);
    this.groundElapsedMs=groundElapsed;
    if(this.travelMs&&groundElapsed<IMPACT_MS) this.drawImpact(groundElapsed/IMPACT_MS);
    else{
      this.impact?.destroy();
      this.impact=null;
    }
  }

  drawImpact(progress){
    const {x,y}=this.anchor;
    this.impact??=this.scene.add.graphics().setPosition(x,y).setDepth(y+2);
    const fade=(1-progress)**2;
    this.impact.clear().fillStyle(0xff862d,0.45*fade).fillCircle(0,0,6+12*progress);
    for(let i=0;i<11;i++){
      const angle=i*Math.PI*2/11+(i%3)*0.12;
      const distance=3+(14+i%4*4)*progress;
      this.impact.fillStyle(i%3===0?0xffedab:0xffa033,fade)
        .fillRect(Math.round(Math.cos(angle)*distance),Math.round(Math.sin(angle)*distance-5*progress),2,2);
    }
  }

  destroy(){
    this.projectile?.destroy();
    this.ground?.destroy();
    this.impact?.destroy();
    this.projectile=this.ground=this.impact=null;
  }
}
