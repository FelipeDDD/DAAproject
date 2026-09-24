import { MapScene } from './MapScene.js';
import {
  BossController,BOSS_HOMING_PROJECTILE_TEXTURE,BOSS_SINGLE_PROJECTILE_TEXTURE,
} from '../boss/BossController.js';
import {
  BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
} from '../boss/config.js';
import { BOSS_VISUAL_ASSETS } from '../boss/BossVisualState.js';
import { ArenaGateController } from '../boss/ArenaGateController.js';
import { ArenaRetryOverlay } from '../boss/ArenaRetryOverlay.js';
import { BOSS_RETRY_DELAY_MS } from '../boss/config.js';
import { resolveSpawn } from '../maps/tiledObjects.js';
import { ArenaCrosshair } from '../boss/ArenaCrosshair.js';
import { allPlayerAttackVisuals } from '../boss/PlayerAttackVisuals.js';

export class ArenaScene extends MapScene {
  constructor(){super('arena','arena.tmj');}

  collisionOptions(){return {excludeNames:['gate']};}

  preload(){
    super.preload();
    for(const visual of allPlayerAttackVisuals()){
      this.load.image(visual.texture,`${import.meta.env.BASE_URL}${visual.asset}`);
    }
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
    this.load.image('arena-exit-gate',`${import.meta.env.BASE_URL}assets/woodgate.png`);
    this.load.image('arena-school-sign',`${import.meta.env.BASE_URL}assets/schule-sign.png`);
    for(const asset of BOSS_VISUAL_ASSETS){
      this.load.spritesheet(asset.key,`${import.meta.env.BASE_URL}assets/boss/${asset.file}`,{
        frameWidth:asset.frameWidth,frameHeight:asset.frameHeight,
      });
    }
    this.load.image('director-access-badge',`${import.meta.env.BASE_URL}assets/school-key.png`);
  }

  create(destination={}){
    super.create(destination);
    this.gate=new ArenaGateController(this);
    this.retryOverlay=new ArenaRetryOverlay(this,{delayMs:BOSS_RETRY_DELAY_MS,
      onRetry:()=>this.retryBossFight(),onReturn:()=>this.returnToSecretPath()});
    this.boss=new BossController(this);
    this.crosshair=new ArenaCrosshair(this);
    this.events.on('sleep',this.handleBossSleep,this);
    this.events.on('wake',this.handleBossWake,this);
    this.events.once('shutdown',()=>{
      this.events.off('sleep',this.handleBossSleep,this);
      this.events.off('wake',this.handleBossWake,this);
      this.boss?.destroy();this.boss=null;
      this.gate?.destroy();this.gate=null;
      this.retryOverlay?.destroy();this.retryOverlay=null;
      this.crosshair?.destroy();this.crosshair=null;
    });
  }

  handleBossSleep(){this.crosshair?.suspend();this.retryOverlay?.close();this.boss?.suspend();}
  handleBossWake(){this.crosshair?.resume();this.retryOverlay?.close();this.gate?.reset();this.boss?.reset();}

  unlockBossExit(){this.gate?.open();}
  showBossRetry(){this.retryOverlay?.show();}

  retryBossFight(){
    const spawn=resolveSpawn(this.source,{targetSpawn:'arena-spawn'});
    this.player.clearTint().setVelocity(0,0);this.player.body.reset(spawn.x,spawn.y);
    this.gate?.reset();this.boss?.reset();
  }

  returnToSecretPath(){this.travelTo({targetMap:'secret-path',targetSpawn:'arena-return'});}

  update(time,delta){
    super.update(time,delta);
    this.boss?.update(time,delta);
    this.crosshair?.setBlocked(Boolean(this.boss?.rewardOpened||this.retryOverlay?.state.visible
      ||this.terminal?.active||this.chat?.focused||this.quiz?.seated||this.soloStudy?.active||this.wardrobe?.active));
  }
}
