// Local player obstacle only. It follows the rendered cart; player movement is
// published through the existing movement channel, never used to drive the cart.
export class PayloadCollider {
  constructor(scene,config){
    this.config=config;
    this.zone=scene.add.zone(0,0,config.width,config.height);
    scene.physics.add.existing(this.zone,true);
    this.collider=scene.physics.add.collider(scene.player,this.zone);
  }
  update(position,enabled=true){
    this.zone.setPosition(position.x+this.config.offsetX,position.y+this.config.offsetY);
    this.zone.body.updateFromGameObject();
    this.zone.body.enable=enabled;
  }
  destroy(){this.collider.destroy();this.zone.destroy();}
}
