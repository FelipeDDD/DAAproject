import { PvpMapScene } from './PvpMapScene.js';
import { PVP_INSPECTION_SCENE } from '../pvp/config.js';

// Temporary walkable map for inspecting the Payload layout and authored collision.
export class PayloadMapScene extends PvpMapScene {
  constructor(){super(PVP_INSPECTION_SCENE);}
  enter(destination){super.enter(destination);this.initializePvpTeleports();}
  update(time,delta){
    super.update(time,delta);
    if(this.player.body.enable&&this.input.enabled&&this.input.keyboard.enabled&&!this.arenaEntry?.active
      &&!this.terminal?.active&&!this.puzzleTerminal?.active&&!this.networkTerminal?.active
      &&!this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&!this.chat?.isInputActive)
      this.updatePvpTeleports(Date.now());
  }
}
