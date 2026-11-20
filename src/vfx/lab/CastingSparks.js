function placeAtHand(graphics,player,side){
  const {x,y}=player;
  graphics.setPosition(Math.round(x+side*13),Math.round(y-27)).setDepth(y+1);
}

// A local charge around the caster, separate from the ground effect.
export class CastingSparks {
  constructor(scene,player,target){
    this.player=player;
    this.side=target.x<player.x?-1:1;
    this.graphics=scene.add.graphics();
  }

  update(elapsedMs,_deltaMs,durationMs){
    const progress=elapsedMs/durationMs;
    const pulse=Math.sin(progress*Math.PI/2);
    const graphics=this.graphics;
    placeAtHand(graphics,this.player,this.side);
    graphics.clear()
      .fillStyle(0xf87c2e,0.28*pulse).fillCircle(0,0,10*pulse)
      .fillStyle(0xffb45e,0.46*pulse).fillCircle(0,0,6*pulse);
    for(let i=0;i<12;i++){
      const started=i*.04;
      if(progress<started)continue;
      const age=((progress-started)*(1.4+i%3*.16))%1;
      const angle=i*2.39996+age*.68;
      const radius=5+(14+9*pulse)*(1-age);
      const size=i%3===0&&pulse>.55?3:2;
      graphics.fillStyle(i%3===0?0xffedaf:0xff9b42,Math.sin(age*Math.PI)*(.35+.55*pulse))
        .fillRect(Math.round(Math.cos(angle)*radius),Math.round(Math.sin(angle)*radius*.65),size,size);
    }
    graphics.fillStyle(0xffd48a,.95*pulse).fillRect(-2,-2,4,4);
    graphics.fillStyle(0xfff5d4,pulse).fillRect(-1,-1,2,2);
  }

  destroy(){this.graphics.destroy();}
}

export class CastingFlash {
  constructor(scene,player,target){
    this.player=player;
    this.side=target.x<player.x?-1:1;
    this.graphics=scene.add.graphics();
  }

  update(elapsedMs,_deltaMs,durationMs){
    const progress=elapsedMs/durationMs;
    const fade=(1-progress)**2;
    placeAtHand(this.graphics,this.player,this.side);
    this.graphics.clear()
      .fillStyle(0xff8c36,.48*fade).fillCircle(0,0,8+8*progress)
      .fillStyle(0xffd48a,.88*fade).fillRect(-7,-2,14,4).fillRect(-2,-7,4,14)
      .fillStyle(0xfff9df,fade).fillRect(-3,-3,6,6);
  }

  destroy(){this.graphics.destroy();}
}
