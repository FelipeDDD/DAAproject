import { MapScene } from './MapScene.js';
import { drawOffice3PaperHighlight } from '../art/office3PaperHighlight.js';
import Phaser from 'phaser';
import { Office3PuzzleController } from '../office3/Office3PuzzleController.js';

export class Office3Scene extends MapScene {
  constructor(){super('office3','office3.tmj');}

  preload(){
    super.preload();
    if(!this.textures.exists('office3-yellow-paper-small'))this.load.image('office3-yellow-paper-small',
      `${import.meta.env.BASE_URL}assets/maps/office3-yellow-paper-small.png`);
  }

  create(destination={}){
    super.create(destination);
    this.paperHighlight=drawOffice3PaperHighlight(this,this.source);
    this.puzzleTerminal=new Office3PuzzleController(this);
    this.events.on('sleep',()=>{
      this.puzzleTerminal?.close();
      this.puzzleTerminal?.updatePrompt(false);
    });
    this.events.once('shutdown',()=>{
      this.paperHighlight?.destroy();this.paperHighlight=null;
      this.puzzleTerminal?.destroy();this.puzzleTerminal=null;
    });
  }

  update(time,delta){
    const puzzle=this.puzzleTerminal;
    const available=Boolean(puzzle&&!this.terminal?.active&&!this.chat?.isInputActive&&
      !this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&
      !this.characterItems?.transforming);
    puzzle?.updatePrompt(available);
    const nearPaper=available&&puzzle.nearPaper();
    const nearMonitor=available&&puzzle.nearMonitor();
    if((nearPaper||nearMonitor)&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(nearPaper)puzzle.openPaper();
      else puzzle.open();
    }
    super.update(time,delta);
    if(nearPaper||nearMonitor)this.hint.hidden=true;
  }
}
