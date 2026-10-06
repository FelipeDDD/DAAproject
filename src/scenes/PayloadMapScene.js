import { PvpMapScene } from './PvpMapScene.js';
import { PVP_INSPECTION_SCENE } from '../pvp/config.js';

// Temporary walkable map for inspecting the Payload layout and authored collision.
export class PayloadMapScene extends PvpMapScene {
  constructor(){super(PVP_INSPECTION_SCENE);}
  create(destination={}){
    super.create(destination);
    this.events.on('sleep',this.removeExitButton,this);
    this.events.once('shutdown',()=>{
      this.events.off('sleep',this.removeExitButton,this);this.removeExitButton();
    });
  }
  enter(destination){
    super.enter(destination);this.initializePvpTeleports();this.removeExitButton();
    const toolbar=document.getElementById('play-toolbar');if(!toolbar)return;
    this.exitButton=document.createElement('button');
    this.exitButton.id='leave-payload-inspection';this.exitButton.type='button';
    this.exitButton.textContent='Return to classroom';
    this.exitButton.onclick=()=>this.travelTo({targetMap:'school'});
    toolbar.prepend(this.exitButton);
  }
  removeExitButton(){
    if(this.exitButton){this.exitButton.onclick=null;this.exitButton.remove();this.exitButton=null;}
  }
  update(time,delta){
    super.update(time,delta);
    if(this.player.body.enable&&this.input.enabled&&this.input.keyboard.enabled&&!this.arenaEntry?.active
      &&!this.terminal?.active&&!this.puzzleTerminal?.active&&!this.networkTerminal?.active
      &&!this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&!this.chat?.isInputActive)
      this.updatePvpTeleports(Date.now());
  }
}
