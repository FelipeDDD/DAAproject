import { MapScene } from './MapScene.js';
import Phaser from 'phaser';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import {
  OFFICE2_LOCKED_DOOR, canUnlockOffice2Door, drawOffice2LockedDoor,
  office2LockedDoorPlacement,
} from '../art/office2LockedDoor.js';
import { OFFICE2_TRAPDOOR_RADIUS, drawOffice2Trapdoor, office2TrapdoorPlacement } from '../art/office2Trapdoor.js';

export class Office2Scene extends MapScene {
  constructor(){super('office2','office2.tmj');}

  preload(){
    super.preload();
    this.load.image('office2-trapdoor',`${import.meta.env.BASE_URL}assets/doors/office2-trapdoor.png`);
  }

  create(destination={}){
    super.create(destination);
    this.trapdoorPlacement=office2TrapdoorPlacement(this.source);
    this.trapdoor=drawOffice2Trapdoor(this,this.source);
    if(this.trapdoorPlacement){
      this.trapdoorPrompt=new WorldPrompt(this,'E to open',{clamp:true});
      this.trapdoorPrompt.setPosition(this.trapdoorPlacement.x,this.trapdoorPlacement.y-36);
    }
    this.lockedDoorPlacement=office2LockedDoorPlacement(this.source);
    this.lockedDoor=drawOffice2LockedDoor(this,this.source);
    this.lockedDoorOpen=false;
    this.lockedDoorFeedback='';
    this.lockedDoorFeedbackUntil=0;
    if(this.lockedDoorPlacement){
      this.lockedDoorPrompt=new WorldPrompt(this,"Door locked·",{clamp:true});
      this.lockedDoorPrompt.setPosition(this.lockedDoorPlacement.x,this.lockedDoorPlacement.bottom-80);
    }
    this.events.on('sleep',()=>{
      this.lockedDoorPrompt?.setVisible(false);
      this.trapdoorPrompt?.setVisible(false);
    });
    this.events.once('shutdown',()=>{
      this.lockedDoorPrompt?.destroy();this.lockedDoorPrompt=null;
      this.lockedDoor?.destroy();this.lockedDoor=null;
      this.trapdoorPrompt?.destroy();this.trapdoorPrompt=null;
      this.trapdoor?.destroy();this.trapdoor=null;
    });
  }

  update(time,delta){
    const body=this.player?.body;
    const door=this.lockedDoorPlacement;
    const available=Boolean(body&&!this.terminal?.active&&!this.chat?.isInputActive&&
      !this.quiz?.seated&&!this.soloStudy?.active&&!this.wardrobe?.active&&
      !this.characterItems?.transforming&&this.inventoryHotbar?.overlay?.root?.hidden!==false);
    const trapdoor=this.trapdoorPlacement;
    const nearTrapdoor=available&&trapdoor&&Math.hypot(body.center.x-trapdoor.x,body.center.y-trapdoor.y)
      <=OFFICE2_TRAPDOOR_RADIUS;
    this.trapdoorPrompt?.setVisible(Boolean(nearTrapdoor));
    if(nearTrapdoor&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      this.travelTo({targetMap:'secret-path',targetSpawn:'secret-path-spawn'});
      return;
    }
    const near=available&&door&&Math.hypot(body.center.x-door.x,body.center.y-door.bottom)
      <=OFFICE2_LOCKED_DOOR.interactionRadius;
    const hasKey=canUnlockOffice2Door(this.inventoryHotbar?.items);
    if(near&&!this.lockedDoorOpen){
      const label=hasKey?'E to open door':"Door locked·";
      if(this.lockedDoorPrompt.root.textContent!==label)this.lockedDoorPrompt.setText(label);
    }
    this.lockedDoorPrompt?.setVisible(near&&!this.lockedDoorOpen);
    if(near&&!this.lockedDoorOpen&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      if(hasKey){
        this.lockedDoorOpen=true;
        this.lockedDoor.setOpen(true);
        this.lockedDoorFeedback='The door is open.';
        this.lockedDoorPrompt.setVisible(false);
      }else this.lockedDoorFeedback="Door locked";
      this.lockedDoorFeedbackUntil=time+3000;
    }
    super.update(time,delta);
    if(time<this.lockedDoorFeedbackUntil){
      this.hint.hidden=false;
      this.hint.textContent=this.lockedDoorFeedback;
      this.positionInteractionHint();
    }
  }
}
