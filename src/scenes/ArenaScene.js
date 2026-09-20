import { MapScene } from './MapScene.js';
import {
  BossController,BOSS_HOMING_PROJECTILE_TEXTURE,BOSS_SINGLE_PROJECTILE_TEXTURE,
} from '../boss/BossController.js';
import { BOSS_SINGLE_PROJECTILE_FRAME_SIZE } from '../boss/config.js';

export class ArenaScene extends MapScene {
  constructor(){super('arena','arena.tmj');}

  preload(){
    super.preload();
    this.load.spritesheet(BOSS_SINGLE_PROJECTILE_TEXTURE,
      `${import.meta.env.BASE_URL}assets/boss/director-paper-projectile.png`,{
        frameWidth:BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
        frameHeight:BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
      });
    this.load.spritesheet(BOSS_HOMING_PROJECTILE_TEXTURE,
      `${import.meta.env.BASE_URL}assets/boss/director-paper-homing.png`,{
        frameWidth:BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
        frameHeight:BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
      });
  }

  create(destination={}){
    super.create(destination);
    this.boss=new BossController(this);
    this.events.on('sleep',this.handleBossSleep,this);
    this.events.on('wake',this.handleBossWake,this);
    this.events.once('shutdown',()=>{
      this.events.off('sleep',this.handleBossSleep,this);
      this.events.off('wake',this.handleBossWake,this);
      this.boss?.destroy();this.boss=null;
    });
  }

  handleBossSleep(){this.boss?.suspend();}
  handleBossWake(){this.boss?.reset();}

  update(time,delta){
    super.update(time,delta);
    this.boss?.update(time,delta);
  }
}
