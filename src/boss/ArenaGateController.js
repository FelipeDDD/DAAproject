import { objectsIn,propertiesOf,resolveSpawn } from '../maps/tiledObjects.js';

export class ArenaGateState {
  constructor(){this.reset();}
  open(){if(this.opened)return false;this.opened=true;return true;}
  reset(){this.opened=false;}
  get collisionActive(){return !this.opened;}
  get exitAvailable(){return this.opened;}
}

export function readArenaGate(source){
  const gate=objectsIn(source,'Collision').find(object=>object.name==='gate');
  if(!gate)throw new Error('Arena: add an object named gate to the Collision layer.');
  if(!(gate.width>0&&gate.height>0))throw new Error('Arena gate needs a rectangular size.');
  return {...gate,asset:propertiesOf(gate).replaceWith??'assets/woodgate'};
}

export class ArenaGateController {
  constructor(scene){
    this.scene=scene;this.definition=readArenaGate(scene.source);this.state=new ArenaGateState();
    const gate=this.definition;
    this.sprite=scene.add.image(gate.x+gate.width/2,gate.y+gate.height/2,'arena-exit-gate')
      .setOrigin(.5).setDisplaySize(gate.height*.75,gate.height).setDepth(gate.y+gate.height);
    this.blocker=scene.add.zone(gate.x,gate.y,gate.width,gate.height).setOrigin(0);
    scene.physics.add.existing(this.blocker,true);
    this.collider=scene.physics.add.collider(scene.player,this.blocker);
    const bossSpawn=resolveSpawn(scene.source,{targetSpawn:'boss-spawn'});
    this.sign=scene.add.image(bossSpawn.x-160,bossSpawn.y-82,'arena-school-sign')
      .setOrigin(.5).setDisplaySize(150,150).setDepth(bossSpawn.y).setVisible(false);
  }

  open(){
    if(!this.state.open())return false;
    this.blocker.body.enable=false;this.sign.setVisible(true);
    this.scene.tweens.add({targets:this.sprite,alpha:0,scaleX:this.sprite.scaleX*.55,
      angle:3,duration:520,ease:'Cubic.In',onComplete:()=>this.sprite.setVisible(false)});
    return true;
  }

  reset(){
    this.scene.tweens.killTweensOf(this.sprite);this.state.reset();
    this.sprite.setVisible(true).setAlpha(1).setAngle(0).setScale(1)
      .setDisplaySize(this.definition.height*.75,this.definition.height);
    this.blocker.body.enable=true;this.blocker.body.updateFromGameObject();this.sign.setVisible(false);
  }

  destroy(){
    this.scene.tweens.killTweensOf(this.sprite);this.collider?.destroy();this.blocker?.destroy();
    this.sprite?.destroy();this.sign?.destroy();
  }
}
