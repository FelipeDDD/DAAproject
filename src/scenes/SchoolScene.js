import Phaser from 'phaser';
import { MapScene } from './MapScene.js';
import { drawClassroomDesks } from '../art/classroomDesks.js';
import { drawOfficeDoor,drawOffice3Door } from '../art/officeDoor.js';
import { registerSecretaryFrames,SecretaryNpc } from '../npc/SecretaryNpc.js';
import { drawSchoolBackdrop } from '../art/schoolBackdrop.js';
import { preloadSchoolCorridorDecor,drawSchoolCorridorDecor } from '../art/schoolCorridorDecor.js';
import { readPvpLobbyEntrance,PVP_LOBBY_SIGN } from '../maps/pvpLobbyPortal.js';
import { pvpLobbyAvailable } from '../pvp/config.js';
import { GAMBLE_MACHINE } from '../gamble/config.js';
import { gambleMachinePlacement } from '../gamble/placement.js';
import { GambleMachineController } from '../gamble/GambleMachineController.js';
import '../gamble/gambleMachine.css';

export class SchoolScene extends MapScene {
  constructor() { super('school', 'classroom.tmj'); }

  preload() {
    super.preload();
    if(!this.textures.exists(GAMBLE_MACHINE.textureKey))
      this.load.image(GAMBLE_MACHINE.textureKey,`${import.meta.env.BASE_URL}${GAMBLE_MACHINE.assetPath}`);
    preloadSchoolCorridorDecor(this);
    this.load.image('classroom-desks',
      `${import.meta.env.BASE_URL}assets/furniture/mesas-transparent.png`);
    this.load.image('office-door',
      `${import.meta.env.BASE_URL}assets/doors/door-office2.png`);
    this.load.image('office3-door',
      `${import.meta.env.BASE_URL}assets/doors/door1.png`);
    this.load.image('school-secretary',
      `${import.meta.env.BASE_URL}assets/npc/secretary.png`);
    this.load.image('study-mode-sign',
      `${import.meta.env.BASE_URL}assets/hud/study-mode-sign2.png`);
    this.load.svg('pvp-lobby-sign',`${import.meta.env.BASE_URL}assets/hud/pvp-sign.svg`);
  }

  create(destination = {}) {
    super.create(destination);
    const machinePlacement=gambleMachinePlacement(this.source,{dev:import.meta.env.DEV});
    if(machinePlacement){
      this.textures.get(GAMBLE_MACHINE.textureKey).setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.gambleMachine=new GambleMachineController(this,machinePlacement);
      const suspend=()=>this.gambleMachine?.suspend();
      this.events.on('sleep',suspend);
      this.events.once('shutdown',()=>{
        this.events.off('sleep',suspend);this.gambleMachine?.destroy();this.gambleMachine=null;
      });
    }
    if(pvpLobbyAvailable(import.meta.env)){
      const entrance=readPvpLobbyEntrance(this.source);
      if(entrance){
        this.mapTransitions.push(entrance);
        const sign=PVP_LOBBY_SIGN;
        this.textures.get('pvp-lobby-sign').setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.pvpLobbySign=this.add.image(entrance.x+sign.offsetX,entrance.interactionArea.y+sign.offsetY,'pvp-lobby-sign')
          .setDisplaySize(sign.width,sign.height).setDepth(sign.depth);
      }
    }
    const studyLabel=this.tiledTextObjects?.find(text=>text.getData('tiledObjectName')==='studyModeSign');
    if(studyLabel){
      const bounds=studyLabel.getData('tiledObjectBounds');
      studyLabel.destroy();
      this.textures.get('study-mode-sign').setFilter(Phaser.Textures.FilterMode.LINEAR);
      this.studyModeSign=this.add.image(bounds.x+bounds.width/-70-20,bounds.y+bounds.height/30+40,'study-mode-sign')
        .setDisplaySize(190,64).setDepth(studyLabel.depth).setAlpha(studyLabel.alpha);
    }
    drawSchoolBackdrop(this,this.source);
    drawSchoolCorridorDecor(this);
    // Keep the existing E travel trigger, but leave the south exit visually open.
    this.doors.find(door=>door.id==='exit_main_door')?.visual.setVisible(false);
    drawClassroomDesks(this, this.source);
    drawOfficeDoor(this, this.source);
    drawOffice3Door(this, this.source);
    const office=this.mapTransitions.find(item=>item.targetMap==='office2');
    if(office){
      registerSecretaryFrames(this);
      this.secretary=new SecretaryNpc(this,office);
      this.events.on('sleep',()=>this.secretary?.hide());
      this.events.once('shutdown',()=>{this.secretary?.destroy();this.secretary=null;});
    }
  }

  enter(destination={}){super.enter(destination);this.secretary?.resetVisit();this.gambleMachine?.resume();}
  onLockedMapTransition(transition,time){
    if(transition.targetMap!=='office2')return;
    const started=this.secretary?.onDoorAttempt(time);
    if(!started&&this.secretary?.state.active)this.doorMessage='';
  }
  update(time,delta){
    // Consume E only when this interactable is available, before MapScene's
    // existing E router. The shared modal handles input isolation and Escape.
    if(this.gambleMachine?.canInteract()&&Phaser.Input.Keyboard.JustDown(this.interactKey)){
      this.gambleMachine.open();this.hint.hidden=true;
    }
    super.update(time,delta);
    this.gambleMachine?.update();
    this.secretary?.update(time,delta);
  }
}
