import { MapScene } from './MapScene.js';
import { drawOffice3PaperHighlight } from '../art/office3PaperHighlight.js';
import Phaser from 'phaser';
import { Office3PuzzleController } from '../office3/Office3PuzzleController.js';
import { OFFICE3_INVESTIGATION_COMPUTER } from '../office3/investigationComputer.js';
import { Office3Safe } from '../office3/Office3Safe.js';
import { drawComputerStatusLight } from '../art/computerStatusLight.js';
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
    this.networkTerminal=new Office3PuzzleController(this,{
      computerMode:'user',computerConfig:OFFICE3_INVESTIGATION_COMPUTER,
      markerName:'PC-USER',interactionAreaName:'PC-USER-INTERACTION',
    });
    const networkMarker=this.networkTerminal.pcMarker;
    this.networkPcLight=networkMarker?drawComputerStatusLight(this,networkMarker.x,networkMarker.y,
      {depth:networkMarker.y+1}):null;
    this.events.on('sleep',()=>{
      this.puzzleTerminal?.close();
      this.puzzleTerminal?.updatePrompt(false);
      this.networkTerminal?.close();
      this.networkTerminal?.updatePrompt(false);
    });
    this.events.once('shutdown',()=>{
      this.paperHighlight?.destroy();this.paperHighlight=null;
      this.officeSafe?.destroy();this.officeSafe=null;
      this.puzzleTerminal?.destroy();this.puzzleTerminal=null;
      this.networkTerminal?.destroy();this.networkTerminal=null;
      this.networkPcLight?.destroy();this.networkPcLight=null;
    });
  }

  update(time,delta){
    const puzzle=this.puzzleTerminal;
    const network=this.networkTerminal;
    const available=Boolean(puzzle&&network&&this.input.keyboard.enabled&&!puzzle.active&&!network.active&&
      !this.terminal?.active&&!this.chat?.isInputActive&&
      !this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&
      !this.characterItems?.transforming&&this.inventoryHotbar?.overlay?.root?.hidden!==false);
    // The precise painting hitbox takes priority over the safe/PC's wider
    // radius only while this uninspected quest spot is under the player.
    const clue=this.directorInvestigation?.updatePrompt(available);
    puzzle?.updatePrompt(available&&!clue);
    network?.updatePrompt(available&&!clue);
    const nearPaper=available&&puzzle.nearPaper();
    const nearMonitor=available&&puzzle.nearMonitor();
    const nearSafe=available&&puzzle.nearSafe();
    const nearNetwork=available&&network.nearMonitor();
    if(clue&&Phaser.Input.Keyboard.JustDown(this.interactKey))void this.directorInvestigation.investigate(clue);
    else if((nearPaper||nearMonitor||nearSafe||nearNetwork)&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(nearSafe)puzzle.openSafe();
      else if(nearPaper)puzzle.openPaper();
      else if(nearMonitor)puzzle.open();
      else network.open();
    }
    super.update(time,delta);
    if(nearPaper||nearMonitor||nearSafe||nearNetwork)this.hint.hidden=true;
    if(available)this.directorInvestigation?.renderFeedback();
  }
}
