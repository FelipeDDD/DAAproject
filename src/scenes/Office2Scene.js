import { MapScene } from './MapScene.js';
import Phaser from 'phaser';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import {
  OFFICE2_LOCKED_DOOR, canUnlockOffice2Door, drawOffice2LockedDoor,
  office2LockedDoorPlacement,
} from '../art/office2LockedDoor.js';
import { OFFICE2_TRAPDOOR_RADIUS, drawOffice2Trapdoor, office2TrapdoorPlacement } from '../art/office2Trapdoor.js';
import { Office3PuzzleController } from '../office3/Office3PuzzleController.js';
import { DIRECTOR_COMPUTER,DIRECTOR_PC_STATUS_LIGHT } from '../office2/directorComputer.js';
import { drawComputerStatusLight } from '../art/computerStatusLight.js';
import '../office3/office3Puzzle.css';

export class Office2Scene extends MapScene {
  constructor(){super('office2','office2.tmj');}

  preload(){
    super.preload();
    this.load.image('office2-trapdoor',`${import.meta.env.BASE_URL}assets/doors/office2-trapdoor.png`);
  }

  create(destination={}){
    super.create(destination);
    this.puzzleTerminal=new Office3PuzzleController(this,{
      computerMode:'director',computerConfig:DIRECTOR_COMPUTER,markerName:'PC-DIRECTOR',
      interactionAreaName:'PC-DIRECTOR-INTERACTION',
    });
    const monitor=this.puzzleTerminal.pcMarker;
    this.directorPcLight=monitor?drawComputerStatusLight(this,
      monitor.x+DIRECTOR_PC_STATUS_LIGHT.offsetX,monitor.y+DIRECTOR_PC_STATUS_LIGHT.offsetY,
      {radius:DIRECTOR_PC_STATUS_LIGHT.radius,depth:monitor.y+1}):null;
    this.trapdoorPlacement=office2TrapdoorPlacement(this.source);
    this.trapdoor=drawOffice2Trapdoor(this,this.source);
    if(this.trapdoorPlacement){
      this.trapdoorPrompt=new WorldPrompt(this,'E to open',{clamp:true});
      this.trapdoorPrompt.setPosition(this.trapdoorPlacement.x,this.trapdoorPlacement.y-36);
    }
    this.lockedDoorPlacement=office2LockedDoorPlacement(this.source);
    this.lockedDoor=drawOffice2LockedDoor(this,this.source);
    this.lockedDoorOpen=false;
    if(this.lockedDoorPlacement){
      this.lockedDoorPrompt=new WorldPrompt(this,'[E] Examine wall',{clamp:true});
      this.lockedDoorPrompt.setPosition(this.lockedDoorPlacement.x,this.lockedDoorPlacement.bottom-80);
    }
    this.events.on('sleep',()=>{
      this.puzzleTerminal?.close();
      this.puzzleTerminal?.updatePrompt(false);
      this.lockedDoorPrompt?.setVisible(false);
      this.trapdoorPrompt?.setVisible(false);
    });
    this.events.once('shutdown',()=>{
      this.puzzleTerminal?.destroy();this.puzzleTerminal=null;
      this.directorPcLight?.destroy();this.directorPcLight=null;
      this.lockedDoorPrompt?.destroy();this.lockedDoorPrompt=null;
      this.lockedDoor?.destroy();this.lockedDoor=null;
      this.trapdoorPrompt?.destroy();this.trapdoorPrompt=null;
      this.trapdoor?.destroy();this.trapdoor=null;
    });
  }

  update(time,delta){
    const body=this.player?.body;
    const door=this.lockedDoorPlacement;
    const available=Boolean(body&&this.input.keyboard.enabled&&!this.terminal?.active&&!this.puzzleTerminal?.active&&!this.chat?.isInputActive&&
      !this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&
      !this.characterItems?.transforming&&this.inventoryHotbar?.overlay?.root?.hidden!==false);
    this.puzzleTerminal?.updatePrompt(available);
    const nearComputer=available&&this.puzzleTerminal?.nearMonitor();
    if(nearComputer&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      this.puzzleTerminal.open();
      return;
    }
    const trapdoor=this.trapdoorPlacement;
    const nearTrapdoor=available&&trapdoor&&Math.hypot(body.center.x-trapdoor.x,body.center.y-trapdoor.y)
      <=OFFICE2_TRAPDOOR_RADIUS;
    this.trapdoorPrompt?.setVisible(Boolean(nearTrapdoor));
    if(nearTrapdoor&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      this.travelTo({targetMap:'secret-path',targetSpawn:'secret-path-spawn'});
      return;
    }
    const clue=this.directorInvestigation?.updatePrompt(available&&!nearComputer&&!nearTrapdoor);
    if(clue&&Phaser.Input.Keyboard.JustDown(this.interactKey))void this.directorInvestigation.investigate(clue);
    const near=available&&door&&Math.hypot(this.player.x-door.x,this.player.y-door.bottom)
      <=OFFICE2_LOCKED_DOOR.interactionRadius;
    const hasKey=canUnlockOffice2Door(this.inventoryHotbar?.items);
    if(near&&!this.lockedDoorOpen){
      const label=hasKey?'[E] Unlock':'[E] Examine wall';
      if(this.lockedDoorPrompt.root.textContent!==label)this.lockedDoorPrompt.setText(label);
    }
    this.lockedDoorPrompt?.setVisible(near&&!this.lockedDoorOpen);
    if(near&&!this.lockedDoorOpen&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(hasKey)void this.directorInvestigation?.unlock();
      else this.directorInvestigation?.feedback('This wall appears to have a suspiciously lock-shaped problem.');
    }
    super.update(time,delta);
    if(available)this.directorInvestigation?.renderFeedback();
  }
}
