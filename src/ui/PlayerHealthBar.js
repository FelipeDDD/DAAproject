export const PLAYER_HEALTH_BAR_CONFIG=Object.freeze({width:38,height:4,offsetY:7});

export class PlayerHealthBar {
  constructor(player,config=PLAYER_HEALTH_BAR_CONFIG){
    this.player=player;this.scene=player.scene;this.config=config;this.current=1;this.max=1;this.visible=false;
    this.graphics=this.scene.add.graphics().setVisible(false);
  }

  setHealth(current,max){
    this.current=Math.max(0,current);this.max=Math.max(1,max);this.draw();return this;
  }

  setVisible(visible){this.visible=Boolean(visible);this.graphics.setVisible(this.visible);this.updatePosition();return this;}

  draw(){
    const {width,height}=this.config,ratio=Math.max(0,Math.min(1,this.current/this.max));
    this.graphics.clear().fillStyle(0x091018,.9).fillRoundedRect(-width/2-1,-1,width+2,height+2,2)
      .fillStyle(0x57212b,1).fillRect(-width/2,0,width,height)
      .fillStyle(ratio<=.34?0xef5b62:0x63d692,1).fillRect(-width/2,0,width*ratio,height);
    return this;
  }

  updatePosition(){
    if(!this.player||!this.graphics)return;
    this.graphics.setPosition(this.player.x,this.player.y+this.config.offsetY).setDepth(this.player.y+2);
  }

  destroy(){this.graphics?.destroy();this.graphics=null;this.player=null;this.scene=null;}
}
