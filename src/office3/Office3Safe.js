import Phaser from 'phaser';
import { objectsIn } from '../maps/tiledObjects.js';

export function safePlacement(source) {
  const note=objectsIn(source,'Notes').find(object=>object.name.toLowerCase()==='cofre');
  return note&&note.width>0&&note.height>0 ? note : null;
}

export class Office3Safe {
  constructor(scene) {
    this.marker=safePlacement(scene.source);
    if(!this.marker)return;
    const m=this.marker;
    this.x=m.x+m.width/2;this.y=m.y+m.height;
    // The authored rectangle is the footprint, not the full vertical silhouette.
    this.width=m.width*1.08;this.height=this.width*144/128;
    scene.textures.get('office3-safe').setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.sprite=scene.add.image(this.x,this.y+this.height*.08,'office3-safe',0)
      .setOrigin(.5,1).setDisplaySize(this.width,this.height).setDepth(this.y);
    this.led=scene.add.graphics().setDepth(this.y+.01);
    this.setOpen(false);
    this.blink=scene.tweens.add({targets:this.led,alpha:{from:.2,to:1},duration:500,yoyo:true,repeat:-1});
    this.blocker=scene.add.rectangle(this.x,m.y+m.height/2,m.width,m.height,0,0);
    scene.physics.add.existing(this.blocker,true);
    this.collider=scene.physics.add.collider(scene.player,this.blocker);
  }
  setOpen(open) {
    if(!this.sprite||this.open===open)return;
    this.open=open;this.sprite.setFrame(open?1:0);
    const x=this.x-this.width/2+this.width*(open?.39:.72);
    const y=this.y+this.height*.08-this.height+this.height*(open?.54:.4);
    this.led.clear().fillStyle(0x8bffac,.18).fillCircle(x,y,2.4)
      .fillStyle(0xb0ffc4,1).fillCircle(x,y,.85);
  }
  destroy(){this.blink?.stop();this.collider?.destroy();this.blocker?.destroy();this.led?.destroy();this.sprite?.destroy();}
}
