export class CastRangeIndicator {
  constructor(scene,player,name='vfx-lab-cast-range'){
    this.player=player;
    this.graphics=scene.add.graphics().setName(name).setDepth(-.4).setVisible(false);
  }

  update(aim,radius){
    const graphics=this.graphics;
    graphics.setVisible(Boolean(aim));
    if(!aim)return;
    const {x,y}=this.player;
    graphics.setPosition(x,y).clear()
      .lineStyle(1,0xee923c,.48).strokeCircle(0,0,radius);
    if(aim.clamped){
      graphics.lineStyle(1,0xffbd7b,.85).strokeCircle(aim.x-x,aim.y-y,4);
    }
  }

  destroy(){this.graphics.destroy();}
}
