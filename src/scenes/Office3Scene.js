import { MapScene } from './MapScene.js';
import { drawOffice3PaperHighlight } from '../art/office3PaperHighlight.js';

export class Office3Scene extends MapScene {
  constructor(){super('office3','office3.tmj');}

  preload(){
    super.preload();
    if(!this.textures.exists('office3-yellow-paper'))this.load.image('office3-yellow-paper',
      `${import.meta.env.BASE_URL}assets/maps/office3-yellow-paper.png`);
  }

  create(destination={}){
    super.create(destination);
    this.paperHighlight=drawOffice3PaperHighlight(this,this.source);
    this.events.once('shutdown',()=>{this.paperHighlight?.destroy();this.paperHighlight=null;});
  }
}
