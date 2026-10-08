import { MapScene } from './MapScene.js';
import {
  BossController,BOSS_AREA_TEXTURE,BOSS_HOMING_PROJECTILE_TEXTURE,BOSS_SINGLE_PROJECTILE_TEXTURE,
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
import { preloadPlayerAttackVisuals } from '../boss/PlayerAttackVisuals.js';
import { getPresence } from '../multiplayer/client.js';
import { arenaPresenceRoom } from '../boss/arenaRooms.js';
import { ArenaEncounterController } from '../boss/ArenaEncounterController.js';
import { ARENA_MODES } from '../boss/ArenaEncounter.js';

export class ArenaScene extends MapScene {
  constructor(){super('arena','arena.tmj',{hud:{showCurrency:false}});}

  collisionOptions(){return {excludeNames:['gate']};}

  preload(){
    super.preload();
    this.load.image(BOSS_AREA_TEXTURE,`${import.meta.env.BASE_URL}assets/boss/attack-area.png`);
    preloadPlayerAttackVisuals(this,import.meta.env.BASE_URL);
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
    this.encounter=new ArenaEncounterController(this,{
      createBoss:authority=>new BossController(this,authority),createCrosshair:()=>new ArenaCrosshair(this),
    });
    this.encounter.start();
    this.events.on('sleep',this.handleBossSleep,this);
    this.events.once('shutdown',()=>{
      this.events.off('sleep',this.handleBossSleep,this);
      this.encounter?.destroy();this.encounter=null;
      this.arenaEncounter=null;
      this.gate?.destroy();this.gate=null;
      this.retryOverlay?.destroy();this.retryOverlay=null;
      this.crosshair?.destroy();this.crosshair=null;
    });
  }

  enter(destination={}){
    this.encounter?.stop();
    this.arenaMode=destination.arenaMode==='coop'?'coop':'solo';
    this.arenaLobbyId=destination.arenaLobbyId??null;
    this.presenceRoom=arenaPresenceRoom(getPresence()?.identity,destination);
    super.enter(destination);
    this.encounter?.start();
  }

  handleBossSleep(){this.retryOverlay?.close();this.encounter?.stop();}

  unlockBossExit(){this.gate?.open();}
  showBossRetry(){this.retryOverlay?.show();}

  retryBossFight(){
    if(this.arenaEncounter?.mode!==ARENA_MODES.SOLO)return false;
    const spawn=resolveSpawn(this.source,{targetSpawn:'arena-spawn'});
    this.player.clearTint().setVelocity(0,0);this.player.body.reset(spawn.x,spawn.y);
    this.gate?.reset();this.boss?.reset();
    return true;
  }

  returnToSecretPath(){this.travelTo({targetMap:'secret-path',targetSpawn:'arena-return'});}

  returnFromCoopArena(message){
    const destination=this.returnDestination??{targetMap:'secret-path',targetSpawn:'arena-return'};
    this.travelTo({...destination,...(message?{arenaNotice:message}:{})});
  }

  update(time,delta){
    super.update(time,delta);
    if(this.arenaEntry?.active)return;
    this.boss?.update(time,delta);
    this.crosshair?.setBlocked(Boolean(this.boss?.rewardOpened||this.retryOverlay?.state.visible
      ||this.terminal?.active||this.chat?.focused||this.quiz?.seated||this.soloStudy?.active||this.wardrobe?.active));
  }
}
