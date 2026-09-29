import { MapScene } from './MapScene.js';
import { drawOffice3PaperHighlight } from '../art/office3PaperHighlight.js';
import Phaser from 'phaser';
import { Office3PuzzleController } from '../office3/Office3PuzzleController.js';
import { Office3Safe } from '../office3/Office3Safe.js';
import '../office3/office3Puzzle.css';

export class Office3Scene extends MapScene {
  constructor(){super('office3','office3.tmj');}

  preload(){
    super.preload();
    if(!this.textures.exists('office3-safe'))this.load.spritesheet('office3-safe',
      `${import.meta.env.BASE_URL}assets/maps/office3-safe.png`,{frameWidth:128,frameHeight:144});
    if(!this.textures.exists('office3-yellow-paper-small'))this.load.image('office3-yellow-paper-small',
      `${import.meta.env.BASE_URL}assets/maps/office3-yellow-paper-small.png`);
  }

  create(destination={}){
    super.create(destination);
    this.paperHighlight=drawOffice3PaperHighlight(this,this.source);
    this.officeSafe=new Office3Safe(this);
    this.puzzleTerminal=new Office3PuzzleController(this);
    this.events.on('sleep',()=>{
      this.puzzleTerminal?.close();
      this.puzzleTerminal?.updatePrompt(false);
    });
    this.events.once('shutdown',()=>{
      this.paperHighlight?.destroy();this.paperHighlight=null;
      this.officeSafe?.destroy();this.officeSafe=null;
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
    const nearSafe=available&&puzzle.nearSafe();
    if((nearPaper||nearMonitor||nearSafe)&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(nearSafe)puzzle.openSafe();
      else if(nearPaper)puzzle.openPaper();
      else puzzle.open();
    }
    super.update(time,delta);
    if(nearPaper||nearMonitor||nearSafe)this.hint.hidden=true;
  }
}
