import Phaser from 'phaser';
import { resolveSpawn } from '../maps/tiledObjects.js';
import { readBossPositions } from '../maps/bossPositions.js';
import { BOSS_FIXED_SPEECH,speechForPhase } from './BossDialogue.js';
import { BossEncounterState,BossTutorialState,isWithinActivationRange } from './BossEncounterState.js';
import {
  aimedVelocity,BossCombatState,BossPhaseState,BOSS_STATES,PlayerCombatState,
  ProjectileHitRegistry,projectileFromCollision,projectileVelocityToward,
} from './BossCombatState.js';
import {
  AreaAttackTarget,BossAttackSequence,BossMovementPlan,BOSS_ATTACK_TYPES,BOSS_PROJECTILE_VISUALS,
  fanProjectileVelocities,homingVelocity,projectileVisualForAttack,
} from './BossAttackPattern.js';
import {
  BOSS_ACTIVATION_RANGE,BOSS_AREA_DAMAGE,BOSS_AREA_IMPACT_MS,BOSS_AREA_RADIUS,BOSS_ATTACK_COOLDOWN_MS,
  BOSS_ATTACK_TUTORIAL_DELAY_MS,BOSS_ATTACK_TUTORIAL_MS,BOSS_DEFEAT_SPRITE_SCALE,
  BOSS_ATTACK_STATE_MS,BOSS_FIGHT_START_DELAY_MS,
  BOSS_FAN_PROJECTILE_BODY_HEIGHT,BOSS_FAN_PROJECTILE_BODY_OFFSET_X,BOSS_FAN_PROJECTILE_BODY_OFFSET_Y,
  BOSS_FAN_PROJECTILE_BODY_WIDTH,BOSS_HURT_STATE_MS,BOSS_INTRO_COMBAT_DELAY_MS,
  BOSS_INTRO_FOLLOWUP_DELAY_MS,BOSS_MAX_HP,
  BOSS_PHASES,BOSS_PHASE_THRESHOLDS,BOSS_PHASE_TRANSITION_MS,BOSS_RANDOM_SPEECH_MAX_MS,
  BOSS_RANDOM_SPEECH_MIN_MS,BOSS_SPEECH_DURATION_MS,BOSS_IMPORTANT_SPEECH_DURATION_MS,
  BOSS_DEATH_COLLAPSE_MS,BOSS_DEATH_FADE_MS,BOSS_LOOT_INTERACTION_RADIUS,
  BOSS_SPRITE_BODY_HEIGHT,BOSS_SPRITE_BODY_OFFSET_X,
  BOSS_SPRITE_BODY_OFFSET_Y,BOSS_SPRITE_BODY_WIDTH,BOSS_SPRITE_SCALE,
  BOSS_HOMING_DAMAGE,BOSS_HOMING_LIFETIME_MS,BOSS_PROJECTILE_LIFETIME_MS,
  PLAYER_ATTACK_COOLDOWN_MS,PLAYER_HIT_DAMAGE,
  BOSS_SINGLE_PROJECTILE_FRAME_RATE,BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
  PLAYER_INVULNERABILITY_MS,PLAYER_MAX_HP,
  PLAYER_ATTACK_DAMAGE,PLAYER_PROJECTILE_LIFETIME_MS,PLAYER_PROJECTILE_SPEED,
} from './config.js';
import {
  BOSS_VISUAL_ANIMATIONS,BOSS_VISUAL_TEXTURES,createBossVisualAnimations,phaseVisual,
} from './BossVisualState.js';
import { BossProgressClient } from './BossProgressClient.js';
import { BossRewardOverlay } from './BossRewardOverlay.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import {
  BOSS_REWARDS,DIRECTOR_BOSS_ID,hasPendingDirectorReward,shouldClearDirectorLoot,
} from './BossRewards.js';
import { ArenaHudOverlay } from './ArenaHudOverlay.js';

const BOSS_PROJECTILE_TEXTURE='arena-boss-projectile';
export const BOSS_SINGLE_PROJECTILE_TEXTURE='director-paper-projectile';
const BOSS_SINGLE_PROJECTILE_ANIMATION='director-paper-projectile-fly';
export const BOSS_HOMING_PROJECTILE_TEXTURE='director-paper-homing';
const BOSS_HOMING_PROJECTILE_ANIMATION='director-paper-homing-fly';
const PLAYER_PROJECTILE_TEXTURE='arena-player-projectile';

function createTextures(scene){
  for(const [key,color,radius] of [[BOSS_PROJECTILE_TEXTURE,0xff5a36,7],[PLAYER_PROJECTILE_TEXTURE,0x55dff7,5]]){
    if(scene.textures.exists(key))continue;
    const graphics=scene.add.graphics();
    graphics.fillStyle(0xffffff,.8).fillCircle(radius,radius,radius);
    graphics.fillStyle(color,1).fillCircle(radius,radius,Math.max(2,radius-2));
    graphics.generateTexture(key,radius*2,radius*2);graphics.destroy();
  }
  if(scene.textures.exists(BOSS_SINGLE_PROJECTILE_TEXTURE)&&!scene.anims.exists(BOSS_SINGLE_PROJECTILE_ANIMATION)){
    scene.anims.create({
      key:BOSS_SINGLE_PROJECTILE_ANIMATION,
      frames:scene.anims.generateFrameNumbers(BOSS_SINGLE_PROJECTILE_TEXTURE,{start:0,end:5}),
      frameRate:BOSS_SINGLE_PROJECTILE_FRAME_RATE,repeat:-1,
    });
  }
  if(scene.textures.exists(BOSS_HOMING_PROJECTILE_TEXTURE)&&!scene.anims.exists(BOSS_HOMING_PROJECTILE_ANIMATION)){
    scene.anims.create({
      key:BOSS_HOMING_PROJECTILE_ANIMATION,
      frames:scene.anims.generateFrameNumbers(BOSS_HOMING_PROJECTILE_TEXTURE,{start:0,end:5}),
      frameRate:BOSS_SINGLE_PROJECTILE_FRAME_RATE,repeat:-1,
    });
  }
  createBossVisualAnimations(scene);
}

function textInputActive(){
  const element=document.activeElement;
  return element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement
    ||element instanceof HTMLSelectElement||element?.isContentEditable;
}

const newVictoryId=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}-director`;

export class BossController {
  constructor(scene){
    this.scene=scene;
    this.model=new BossCombatState({maxHp:BOSS_MAX_HP,attackCooldownMs:BOSS_ATTACK_COOLDOWN_MS,now:scene.time.now});
    this.phaseState=new BossPhaseState({maxHp:BOSS_MAX_HP,thresholds:BOSS_PHASE_THRESHOLDS});
    this.encounter=new BossEncounterState({
      followupDelayMs:BOSS_INTRO_FOLLOWUP_DELAY_MS,combatStartDelayMs:BOSS_INTRO_COMBAT_DELAY_MS,
    });
    this.tutorialState=new BossTutorialState();
    this.playerCombat=new PlayerCombatState({maxHp:PLAYER_MAX_HP,invulnerabilityMs:PLAYER_INVULNERABILITY_MS});
    this.attackSequence=new BossAttackSequence();
    this.movementPlan=new BossMovementPlan(readBossPositions(scene.source));
    this.hitRegistry=new ProjectileHitRegistry();
    this.nextPlayerAttackAt=0;this.stateEndsAt=0;this.moveDueAt=0;this.destroyed=false;this.suspended=false;
    this.phaseTransitionEndsAt=0;this.phaseTween=null;
    this.playerTintTimer=null;this.bossTintTimer=null;this.defeatTimer=null;this.speechTimer=null;this.tutorialTimer=null;
    this.scriptedHomingPending=false;this.nextRandomSpeechAt=Infinity;
    this.areaGraphic=null;this.areaTween=null;this.areaTarget=null;
    this.deathTween=null;this.loot=null;this.lootTween=null;this.lootPrompt=null;
    this.victoryId=newVictoryId();this.victoryPromise=null;this.rewardOpened=false;this.pendingRewardResult=null;
    this.progressClient=scene.presence?new BossProgressClient(scene.presence):null;
    this.rewardOverlay=new BossRewardOverlay({getCharacterId:()=>scene.presence?.identity?.characterId,
      onChoose:rewardId=>this.chooseReward(rewardId),onClose:()=>this.finishReward()});
    this.interactRequested=false;
    this.handleInteract=event=>{if(!event.repeat)this.interactRequested=true;};
    scene.input.keyboard.on('keydown-E',this.handleInteract);
    createTextures(scene);
    const spawn=resolveSpawn(scene.source,{targetSpawn:'boss-spawn'});
    this.home={x:spawn.x,y:spawn.y};
    this.positionAnchor={...this.home};
    this.sprite=scene.physics.add.sprite(spawn.x,spawn.y,BOSS_VISUAL_TEXTURES.PHASE1)
      .setOrigin(.5,1).setScale(BOSS_SPRITE_SCALE).setImmovable(true).setDepth(spawn.y);
    this.sprite.body.setSize(BOSS_SPRITE_BODY_WIDTH,BOSS_SPRITE_BODY_HEIGHT)
      .setOffset(BOSS_SPRITE_BODY_OFFSET_X,BOSS_SPRITE_BODY_OFFSET_Y);
    this.bossProjectiles=scene.physics.add.group({allowGravity:false,maxSize:32});
    this.playerProjectiles=scene.physics.add.group({allowGravity:false,maxSize:16});
    this.colliders=[scene.physics.add.collider(scene.player,this.sprite)];
    if(scene.collisionLayer){
      this.colliders.push(scene.physics.add.collider(this.bossProjectiles,scene.collisionLayer,(first,second)=>{
        this.disableProjectile(projectileFromCollision(first,second,'boss'));
      }));
      this.colliders.push(scene.physics.add.collider(this.playerProjectiles,scene.collisionLayer,(first,second)=>{
        this.disableProjectile(projectileFromCollision(first,second,'player'));
      }));
    }
    if(scene.gate?.blocker){
      this.colliders.push(scene.physics.add.collider(this.bossProjectiles,scene.gate.blocker,(first,second)=>{
        this.disableProjectile(projectileFromCollision(first,second,'boss'));
      }));
      this.colliders.push(scene.physics.add.collider(this.playerProjectiles,scene.gate.blocker,(first,second)=>{
        this.disableProjectile(projectileFromCollision(first,second,'player'));
      }));
    }
    this.colliders.push(scene.physics.add.overlap(this.bossProjectiles,scene.player,(first,second)=>{
      this.hitPlayer(projectileFromCollision(first,second,'boss'));
    }));
    this.colliders.push(scene.physics.add.overlap(this.playerProjectiles,this.sprite,(first,second)=>{
      this.hitBoss(projectileFromCollision(first,second,'player'));
    }));
    this.attackKeys=scene.input.keyboard.addKeys({
      space:Phaser.Input.Keyboard.KeyCodes.SPACE,
      numpadZero:Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
    });
    scene.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.SPACE,Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
    ]);
    this.hud=new ArenaHudOverlay(scene);
    this.hud.setBossHealth(this.model.hp,this.model.maxHp);
    this.hud.setPhase(this.phaseState.phase);
    scene.gameHud?.setHealth(this.playerCombat.hp,this.playerCombat.maxHp);
    scene.player.setCombatHealth(this.playerCombat.hp,this.playerCombat.maxHp).setCombatHudVisible(true);
    this.createSpeechBubble();
    this.scheduleAttackTutorial();
    void this.loadPendingReward();
  }

  drawHp(){
    this.hud.setBossHealth(this.model.hp,this.model.maxHp);
  }

  createSpeechBubble(){
    this.speechBubble=new WorldPrompt(this.scene,'',{className:'boss-speech-prompt',clamp:true});
    this.speechImportant=false;
  }

  showBossSpeech(text,{important=false,durationMs}={}){
    if(!text||this.destroyed)return false;
    if(this.speechBubble.visible&&this.speechImportant&&!important)return false;
    this.speechTimer?.remove(false);
    this.speechBubble.setText(text);this.speechImportant=important;this.speechBubble.setVisible(true);
    this.updateSpeechPosition();
    const readingTime=important?BOSS_IMPORTANT_SPEECH_DURATION_MS:
      Math.min(5000,Math.max(3500,BOSS_SPEECH_DURATION_MS+text.length*18));
    this.speechTimer=this.scene.time.delayedCall(durationMs??readingTime,()=>{
      this.speechBubble?.setVisible(false);this.speechTimer=null;this.speechImportant=false;
    });
    return true;
  }

  updateSpeechPosition(){
    if(!this.speechBubble?.visible)return;
    this.speechBubble.setPosition(this.sprite.x,this.sprite.y-this.sprite.displayHeight-10);
  }

  scheduleRandomSpeech(time){
    const span=BOSS_RANDOM_SPEECH_MAX_MS-BOSS_RANDOM_SPEECH_MIN_MS;
    this.nextRandomSpeechAt=time+BOSS_RANDOM_SPEECH_MIN_MS+Math.round(Math.random()*span);
  }

  activateEncounter(time){
    if(this.model.state===BOSS_STATES.DEFEATED||!this.encounter.activate(time))return false;
    this.model.nextAttackAt=Math.max(this.model.nextAttackAt,time+BOSS_FIGHT_START_DELAY_MS);
    this.showBossSpeech(BOSS_FIXED_SPEECH.activation,{important:true});
    this.scheduleRandomSpeech(time);
    return true;
  }

  scheduleAttackTutorial(){
    this.tutorialTimer?.remove(false);
    this.tutorialTimer=this.scene.time.delayedCall(BOSS_ATTACK_TUTORIAL_DELAY_MS,()=>{
      this.tutorialTimer=null;this.showAttackTutorial();
    });
  }

  showAttackTutorial(){
    if(!this.tutorialState.show())return false;
    this.hud.showTutorial();
    this.tutorialTimer?.remove(false);
    this.tutorialTimer=this.scene.time.delayedCall(BOSS_ATTACK_TUTORIAL_MS,()=>this.hideAttackTutorial());
    return true;
  }

  hideAttackTutorial(){
    if(!this.tutorialState.dismiss())return false;
    this.tutorialTimer?.remove(false);this.tutorialTimer=null;this.hud?.hideTutorial();
    return true;
  }

  updateEncounter(time){
    if(this.playerCombat.defeated||this.model.state===BOSS_STATES.DEFEATED)return;
    if(!this.encounter.active){
      const player=this.scene.player.body.center;
      const boss=this.sprite.body.center;
      if(isWithinActivationRange(player,boss,BOSS_ACTIVATION_RANGE))this.activateEncounter(time);
      return;
    }
    if(this.encounter.consumeFollowup(time)){
      this.showBossSpeech(BOSS_FIXED_SPEECH.followup,{important:true});
      this.scriptedHomingPending=true;
    }
    if(time>=this.nextRandomSpeechAt){
      if(!this.speechBubble.visible&&this.model.state===BOSS_STATES.IDLE&&!this.phaseState.transitionPending){
        this.showBossSpeech(speechForPhase(this.phaseState.phase));
        this.scheduleRandomSpeech(time);
      }else this.nextRandomSpeechAt=time+1500;
    }
  }

  gameplayBlocked(){
    return this.scene.chat?.focused||this.scene.terminal?.active||this.scene.quiz?.seated
      ||this.scene.soloStudy?.active||this.rewardOpened||textInputActive();
  }

  get phaseConfig(){return BOSS_PHASES[this.phaseState.phase];}

  startBossAttack(time,{type:forcedType=null,force=false,advanceSequence=true}={}){
    if(this.suspended||!this.encounter.canFight(time)||this.playerCombat.defeated
      ||this.model.state!==BOSS_STATES.IDLE||(!force&&!this.model.canAttack(time)))return false;
    const type=forcedType??this.attackSequence.peek();
    const fan=type===BOSS_ATTACK_TYPES.FAN;
    const area=type===BOSS_ATTACK_TYPES.AREA;
    const homing=type===BOSS_ATTACK_TYPES.HOMING;
    const config=this.phaseConfig;
    if(!this.model.startAttack(time,{
      type,cooldownMs:fan?config.fanCooldownMs:area?config.areaCooldownMs:homing?config.homingCooldownMs:config.singleCooldownMs,
      telegraphMs:fan?config.fanTelegraphMs:area?config.areaTelegraphMs:0,force,
    }))return false;
    if(advanceSequence)this.attackSequence.advance();
    const target=this.scene.player.body.center;
    this.pendingAim={x:target.x,y:target.y};
    if(fan||area)this.beginBossTelegraph();
    if(area)this.beginAreaTelegraph(this.pendingAim);
    return true;
  }

  startScriptedHoming(time){
    if(!this.scriptedHomingPending||this.phaseState.transitionPending
      ||this.model.state!==BOSS_STATES.IDLE)return false;
    this.moveDueAt=0;
    if(!this.startBossAttack(time,{type:BOSS_ATTACK_TYPES.HOMING,force:true,advanceSequence:false}))return false;
    this.scriptedHomingPending=false;
    return true;
  }

  executeBossAttack(time){
    if(!this.model.attackReady(time)||this.suspended||this.playerCombat.defeated)return 0;
    const attack=this.model.activeAttack;
    if(!this.model.markAttackExecuted())return 0;
    const origin={x:this.sprite.body.center.x,y:this.sprite.body.center.y};
    if(attack.type===BOSS_ATTACK_TYPES.AREA){
      const playerCenter=this.scene.player.body.center;
      const hit=this.areaTarget?.resolve(playerCenter,{
        ready:true,bossDefeated:this.model.state===BOSS_STATES.DEFEATED,
        playerDefeated:this.playerCombat.defeated,
      })??false;
      this.endBossTelegraph();
      this.showAreaImpact();
      if(hit)this.applyPlayerDamage(time,BOSS_AREA_DAMAGE);
      this.stateEndsAt=time+BOSS_AREA_IMPACT_MS;
      this.scheduleMovement();
      return 0;
    }
    const homing=attack.type===BOSS_ATTACK_TYPES.HOMING;
    const fan=attack.type===BOSS_ATTACK_TYPES.FAN;
    const visual=projectileVisualForAttack(attack.type);
    const config=this.phaseConfig;
    const velocities=attack.type===BOSS_ATTACK_TYPES.FAN
      ?fanProjectileVelocities(origin,this.pendingAim,config.projectileSpeed,config.fanProjectiles,config.fanSpreadDegrees)
      :[aimedVelocity(origin,this.pendingAim,homing?config.homingSpeed:config.projectileSpeed)];
    let created=0;
    for(const velocity of velocities){
      const texture=visual===BOSS_PROJECTILE_VISUALS.PAPER?BOSS_SINGLE_PROJECTILE_TEXTURE
        :visual===BOSS_PROJECTILE_VISUALS.HOMING_PAPER?BOSS_HOMING_PROJECTILE_TEXTURE:BOSS_PROJECTILE_TEXTURE;
      const projectile=this.acquireProjectile(this.bossProjectiles,origin.x,origin.y,texture,'boss');
      if(!projectile)continue;
      const animatedPaper=visual!==BOSS_PROJECTILE_VISUALS.ORB;
      if(fan){
        projectile.body.setSize(BOSS_FAN_PROJECTILE_BODY_WIDTH,BOSS_FAN_PROJECTILE_BODY_HEIGHT)
          .setOffset(BOSS_FAN_PROJECTILE_BODY_OFFSET_X,BOSS_FAN_PROJECTILE_BODY_OFFSET_Y);
      }else{
        const bodyOffset=animatedPaper?(BOSS_SINGLE_PROJECTILE_FRAME_SIZE-14)/2:0;
        projectile.body.setCircle(7,bodyOffset,bodyOffset);
      }
      projectile.setVelocity(velocity.x,velocity.y)
        .setData('expiresAt',time+(homing?BOSS_HOMING_LIFETIME_MS:BOSS_PROJECTILE_LIFETIME_MS))
        .setData('projectileBehavior',homing?'homing':'straight')
        .setData('homingSpeed',homing?config.homingSpeed:null)
        .setData('homingTurnRate',homing?config.homingTurnRateDegrees*Math.PI/180:null)
        .setData('damage',homing?BOSS_HOMING_DAMAGE:PLAYER_HIT_DAMAGE);
      if(animatedPaper){
        projectile.setRotation(Math.atan2(velocity.y,velocity.x)+Math.PI/2);
        projectile.play(visual===BOSS_PROJECTILE_VISUALS.HOMING_PAPER
          ?BOSS_HOMING_PROJECTILE_ANIMATION:BOSS_SINGLE_PROJECTILE_ANIMATION);
      }
      created++;
    }
    this.endBossTelegraph();
    this.stateEndsAt=time+BOSS_ATTACK_STATE_MS;
    this.scheduleMovement();
    return created;
  }

  scheduleMovement(){
    this.moveDueAt=this.stateEndsAt+this.phaseConfig.movePauseMs;
  }

  startMovement(time){
    if(!this.moveDueAt||time<this.moveDueAt||this.model.state!==BOSS_STATES.IDLE
      ||!this.encounter.canFight(time)||this.playerCombat.defeated||this.model.state===BOSS_STATES.DEFEATED)return false;
    this.moveDueAt=0;
    const destination=this.movementPlan.begin({x:this.sprite.x,y:this.sprite.y});
    if(!destination)return false;
    if(!this.model.startMoving()){this.movementPlan.cancel();return false;}
    this.movementTween=this.scene.tweens.add({
      targets:this.sprite,x:destination.x,y:destination.y,duration:this.phaseConfig.moveDurationMs,
      ease:'Sine.InOut',
      onUpdate:()=>this.sprite.setDepth(this.sprite.y),
      onComplete:()=>this.completeMovement(destination),
    });
    return true;
  }

  completeMovement(destination){
    if(this.destroyed||this.suspended||this.model.state!==BOSS_STATES.MOVING)return false;
    this.sprite.setPosition(destination.x,destination.y).setDepth(destination.y);
    this.positionAnchor={x:destination.x,y:destination.y};
    this.movementPlan.complete();this.movementTween=null;
    return this.model.finishMoving();
  }

  cancelMovement(){
    this.movementTween?.stop();this.movementTween=null;
    this.movementPlan.cancel();this.moveDueAt=0;
  }

  beginBossTelegraph(){
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setTint(0xffb24d);
    this.telegraphTween=this.scene.tweens.add({
      targets:this.sprite,scaleX:BOSS_SPRITE_SCALE*1.08,scaleY:BOSS_SPRITE_SCALE*1.08,
      duration:175,yoyo:true,repeat:1,
    });
  }

  endBossTelegraph(){
    this.telegraphTween?.stop();this.telegraphTween=null;
    this.sprite.setScale(BOSS_SPRITE_SCALE).clearTint();
  }

  beginAreaTelegraph(position){
    this.clearAreaVisual();
    this.areaTarget=new AreaAttackTarget(position,BOSS_AREA_RADIUS);
    this.areaGraphic=this.scene.add.graphics().setPosition(position.x,position.y).setDepth(position.y-1);
    this.areaGraphic.fillStyle(0xff2f45,.22).fillCircle(0,0,BOSS_AREA_RADIUS)
      .lineStyle(4,0xff5368,.95).strokeCircle(0,0,BOSS_AREA_RADIUS)
      .lineStyle(2,0xffd166,.9).strokeCircle(0,0,BOSS_AREA_RADIUS-8);
    this.areaTween=this.scene.tweens.add({
      targets:this.areaGraphic,scaleX:1.07,scaleY:1.07,alpha:.65,
      duration:225,yoyo:true,repeat:-1,
    });
  }

  showAreaImpact(){
    const graphic=this.areaGraphic;
    if(!graphic)return;
    this.areaTween?.stop();
    graphic.setScale(1).setAlpha(1).clear()
      .fillStyle(0xffe0a3,.7).fillCircle(0,0,BOSS_AREA_RADIUS)
      .lineStyle(5,0xffffff,1).strokeCircle(0,0,BOSS_AREA_RADIUS);
    this.areaTween=this.scene.tweens.add({
      targets:graphic,scaleX:1.35,scaleY:1.35,alpha:0,duration:BOSS_AREA_IMPACT_MS,
      onComplete:()=>{
        if(this.areaGraphic===graphic){graphic.destroy();this.areaGraphic=null;this.areaTarget=null;}
        this.areaTween=null;
      },
    });
  }

  clearAreaVisual(){
    this.areaTarget?.cancel();this.areaTarget=null;
    this.areaTween?.stop();this.areaTween=null;
    this.areaGraphic?.destroy();this.areaGraphic=null;
  }

  applyBossVisual(phase,{intro=false}={}){
    const visual=phaseVisual(phase,{intro});
    this.sprite.anims.stop();
    this.sprite.setTexture(visual.texture,visual.frame??0).setScale(BOSS_SPRITE_SCALE);
    this.sprite.body.setSize(BOSS_SPRITE_BODY_WIDTH,BOSS_SPRITE_BODY_HEIGHT)
      .setOffset((visual.frameWidth-BOSS_SPRITE_BODY_WIDTH)/2,
        visual.frameHeight-BOSS_SPRITE_BODY_HEIGHT-5);
    if(visual.animation)this.sprite.play(visual.animation);
  }

  startPhaseTransition(time){
    if(!this.phaseState.transitionPending||!this.model.startPhaseTransition())return false;
    this.phaseState.consumeTransition();
    this.cancelMovement();this.endBossTelegraph();this.clearAreaVisual();
    this.phaseTransitionEndsAt=time+BOSS_PHASE_TRANSITION_MS;
    const phaseThree=this.phaseState.phase===3;
    this.hud.setPhase(this.phaseState.phase);
    this.hud.showNotice(`PHASE ${this.phaseState.phase}`,phaseThree?'danger':'phase');
    this.bossTintTimer?.remove(false);this.bossTintTimer=null;
    this.scene.tweens.killTweensOf(this.sprite);
    this.applyBossVisual(this.phaseState.phase,{intro:true});
    this.showBossSpeech(phaseThree?BOSS_FIXED_SPEECH.phase3:BOSS_FIXED_SPEECH.phase2,
      {important:true,durationMs:BOSS_IMPORTANT_SPEECH_DURATION_MS});
    this.scheduleRandomSpeech(time+BOSS_PHASE_TRANSITION_MS);
    this.sprite.setTint(phaseThree?0xff5555:0xffb347).setScale(BOSS_SPRITE_SCALE);
    this.phaseTween=this.scene.tweens.add({
      targets:this.sprite,scaleX:BOSS_SPRITE_SCALE*1.1,scaleY:BOSS_SPRITE_SCALE*1.1,
      duration:260,yoyo:true,repeat:2,
    });
    this.scene.cameras.main.shake(220,.004);
    return true;
  }

  finishPhaseTransition(){
    if(this.model.state!==BOSS_STATES.PHASE_TRANSITION)return false;
    this.phaseTween?.stop();this.phaseTween=null;
    this.phaseTransitionEndsAt=0;
    this.hud.hideNotice();
    this.applyBossVisual(this.phaseState.phase);
    this.sprite.clearTint();
    return this.model.finishPhaseTransition();
  }

  clearPhaseTransition(){
    this.phaseTween?.stop();this.phaseTween=null;this.phaseTransitionEndsAt=0;
    this.hud?.hideNotice();
    this.sprite?.setScale(BOSS_SPRITE_SCALE).clearTint();
  }

  firePlayerProjectile(time){
    if(this.suspended||this.playerCombat.defeated||time<this.nextPlayerAttackAt
      ||[BOSS_STATES.DYING,BOSS_STATES.DEFEATED,BOSS_STATES.REWARD].includes(this.model.state))return false;
    const origin={x:this.scene.player.body.center.x,y:this.scene.player.body.center.y};
    const pointer=this.scene.input.activePointer;
    const target=this.scene.cameras.main.getWorldPoint(pointer.x,pointer.y);
    const velocity=projectileVelocityToward(origin,target,PLAYER_PROJECTILE_SPEED);
    if(!velocity)return false;
    const direction={x:velocity.x/PLAYER_PROJECTILE_SPEED,y:velocity.y/PLAYER_PROJECTILE_SPEED};
    const projectile=this.acquireProjectile(this.playerProjectiles,origin.x+direction.x*20,origin.y+direction.y*20,PLAYER_PROJECTILE_TEXTURE,'player');
    if(!projectile)return false;
    projectile.body.setCircle(5);projectile.setVelocity(velocity.x,velocity.y).setRotation(Math.atan2(velocity.y,velocity.x))
      .setData('expiresAt',time+PLAYER_PROJECTILE_LIFETIME_MS);
    this.nextPlayerAttackAt=time+PLAYER_ATTACK_COOLDOWN_MS;
    return true;
  }

  hitPlayer(projectile){
    if(!projectile?.active||!this.hitRegistry.claim(projectile))return;
    this.disableProjectile(projectile);
    this.applyPlayerDamage(this.scene.time.now,projectile.getData('damage')??PLAYER_HIT_DAMAGE);
  }

  applyPlayerDamage(time,damage){
    if(!this.playerCombat.takeHit(time,damage))return false;
    this.scene.gameHud?.setHealth(this.playerCombat.hp,this.playerCombat.maxHp);
    this.scene.player.setCombatHealth(this.playerCombat.hp,this.playerCombat.maxHp);
    this.scene.player.setTint(0xff7777);
    this.playerTintTimer?.remove(false);
    this.playerTintTimer=this.scene.time.delayedCall(130,()=>{if(this.scene.player?.active)this.scene.player.clearTint();});
    if(this.playerCombat.defeated)this.playerDefeated();
    return true;
  }

  hitBoss(projectile){
    if(!projectile?.active||[BOSS_STATES.DYING,BOSS_STATES.DEFEATED,BOSS_STATES.REWARD].includes(this.model.state)
      ||!this.hitRegistry.claim(projectile))return;
    if(!this.encounter.canFight(this.scene.time.now)){this.disableProjectile(projectile);return;}
    const push=Math.sign(projectile.body.velocity.x||1)*5;
    const wasMoving=this.model.state===BOSS_STATES.MOVING;
    const wasTransitioning=this.model.state===BOSS_STATES.PHASE_TRANSITION;
    this.disableProjectile(projectile);
    if(!this.model.takeDamage(PLAYER_ATTACK_DAMAGE))return;
    this.drawHp();
    if(this.model.state===BOSS_STATES.DYING){this.beginDeathSequence();return;}
    this.phaseState.update(this.model.hp);
    if(wasTransitioning)return;
    this.endBossTelegraph();this.clearAreaVisual();
    if(wasMoving){
      this.sprite.setTintFill(0xffffff);
      this.bossTintTimer?.remove(false);
      this.bossTintTimer=this.scene.time.delayedCall(BOSS_HURT_STATE_MS,()=>this.sprite?.active&&this.sprite.clearTint());
      return;
    }
    this.stateEndsAt=this.scene.time.now+BOSS_HURT_STATE_MS;
    this.sprite.setTintFill(0xffffff);
    const anchor=this.positionAnchor;
    this.scene.tweens.killTweensOf(this.sprite);this.sprite.setPosition(anchor.x,anchor.y);
    this.scene.tweens.add({targets:this.sprite,x:anchor.x+push,duration:70,yoyo:true,onComplete:()=>this.sprite.setPosition(anchor.x,anchor.y)});
    this.bossTintTimer?.remove(false);
    this.bossTintTimer=this.scene.time.delayedCall(BOSS_HURT_STATE_MS,()=>{if(this.sprite?.active&&this.model.state!==BOSS_STATES.DEFEATED)this.sprite.clearTint();});
  }

  beginDeathSequence(){
    this.encounter.defeat();
    this.cancelPendingAttack();
    this.cancelMovement();
    this.clearPhaseTransition();
    this.clearProjectiles();
    this.hideAttackTutorial();
    this.scene.tweens.killTweensOf(this.sprite);this.sprite.clearTint().setAngle(0).setAlpha(1)
      .setTexture(BOSS_VISUAL_TEXTURES.DEFEAT,0).setScale(BOSS_DEFEAT_SPRITE_SCALE);
    this.sprite.play(BOSS_VISUAL_ANIMATIONS.DEFEAT);
    this.speechTimer?.remove(false);this.speechTimer=null;this.speechBubble.setVisible(false);
    this.showBossSpeech(BOSS_FIXED_SPEECH.death,{important:true,durationMs:6000});
    this.sprite.body.enable=false;
    this.defeatTimer?.remove(false);
    this.defeatTimer=this.scene.time.delayedCall(BOSS_DEATH_COLLAPSE_MS,()=>{
      this.defeatTimer=null;
      this.deathTween=this.scene.tweens.add({targets:this.sprite,alpha:0,duration:BOSS_DEATH_FADE_MS,
        onComplete:()=>this.finishBossDeath()});
    });
  }

  finishBossDeath(){
    if(this.destroyed||this.suspended||!this.model.finishDying())return false;
    const drop={x:this.sprite.x,y:this.sprite.y};
    this.sprite.setVisible(false);this.hud.showNotice('BOSS DEFEATED','victory');
    this.defeatTimer=this.scene.time.delayedCall(2200,()=>this.hud?.hideNotice());
    this.scene.unlockBossExit?.();
    this.spawnLoot(drop);this.recordVictory();
    return true;
  }

  recordVictory(){
    if(this.victoryPromise)return this.victoryPromise;
    this.victoryPromise=this.progressClient?.recordVictory(this.victoryId)
      ??Promise.reject(new Error('Convex progress is unavailable.'));
    this.victoryPromise.then(result=>this.scene.applyBossProgress?.(result.progress))
      .catch(error=>console.warn('Director progress:',error));
    return this.victoryPromise;
  }

  async loadPendingReward(){
    if(!this.progressClient||this.destroyed)return;
    try{
      const progress=await this.progressClient.getProgress();
      if(this.destroyed||this.suspended||!hasPendingDirectorReward(progress))return;
      this.pendingRewardResult={progress,outcome:{type:'choice',options:Object.values(BOSS_REWARDS)},pending:true};
      if(!this.loot)this.spawnLoot({x:this.scene.player.x+54,y:this.scene.player.y});
    }catch(error){console.warn('Pending Director reward:',error);}
  }

  applyProgressSnapshot(progress){
    if(hasPendingDirectorReward(progress)){
      this.pendingRewardResult={progress,outcome:{type:'choice',options:Object.values(BOSS_REWARDS)},pending:true};
      if(!this.loot)this.spawnLoot({x:this.scene.player.x+54,y:this.scene.player.y});
    }else{
      this.pendingRewardResult=null;
      // Choosing a reward updates Convex immediately. Keep its presentation alive
      // until the player explicitly dismisses it; finishReward() owns that cleanup.
      if(shouldClearDirectorLoot(progress,{
        rewardOpened:this.rewardOpened,bossDying:this.model.state===BOSS_STATES.DYING,
      }))this.clearLoot();
    }
  }

  spawnLoot(position){
    this.clearLoot();
    this.loot=this.scene.add.image(position.x,position.y-12,'director-access-badge')
      .setOrigin(.5,.8).setDisplaySize(42,52).setDepth(position.y+2);
    this.lootTween=this.scene.tweens.add({targets:this.loot,y:this.loot.y-7,alpha:.72,
      duration:720,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.lootPrompt=this.scene.add.text(position.x,position.y-72,'[E] Claim reward',{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffe09a',
      backgroundColor:'#17131dcc',padding:{x:6,y:3},
    }).setOrigin(.5,1).setDepth(100000).setVisible(false);
  }

  playerNearLoot(){
    if(!this.loot?.active||!this.scene.player?.body)return false;
    const center=this.scene.player.body.center;
    return Phaser.Math.Distance.Between(center.x,center.y,this.loot.x,this.loot.y)<=BOSS_LOOT_INTERACTION_RADIUS;
  }

  async openReward(){
    if(this.rewardOpened)return;this.rewardOpened=true;this.model.beginReward();
    try{
      const result=this.pendingRewardResult??await this.recordVictory();
      if(this.destroyed||this.suspended)return;
      if(result.outcome.type==='choice')this.rewardOverlay.openChoice(result.outcome.options??Object.values(BOSS_REWARDS));
      else if(result.outcome.type==='automatic')this.rewardOverlay.showReward(result.outcome.rewardId);
      else this.rewardOverlay.showMessage('DIRECTOR DEFEATED','No new unique rewards available.');
    }catch(error){
      if(!this.destroyed)this.rewardOverlay.showMessage('Progress unavailable',error.message);
    }
  }

  async chooseReward(rewardId){
    const result=await this.progressClient.chooseReward(rewardId);
    this.pendingRewardResult=null;
    this.scene.applyBossProgress?.(result.progress);
    if(result.granted||result.progress?.rewards?.includes(rewardId))this.rewardOverlay.showReward(rewardId);
  }

  updateLootInteraction(){
    const near=this.playerNearLoot();
    this.lootPrompt?.setVisible(near&&!this.rewardOpened);
    if(near&&this.interactRequested&&!this.rewardOpened)void this.openReward();
  }

  finishReward(){
    this.rewardOpened=false;this.model.finishReward();
    this.lootTween?.stop();this.lootTween=null;this.loot?.destroy();this.loot=null;
    this.lootPrompt?.destroy();this.lootPrompt=null;
  }

  clearLoot(){
    this.lootTween?.stop();this.lootTween=null;this.loot?.destroy();this.loot=null;
    this.lootPrompt?.destroy();this.lootPrompt=null;this.rewardOverlay?.close({force:true});
  }

  playerDefeated(){
    this.hideAttackTutorial();
    this.cancelPendingAttack();
    this.cancelMovement();
    this.clearPhaseTransition();
    this.clearProjectiles();
    this.speechTimer?.remove(false);this.speechTimer=null;this.speechBubble.setVisible(false);
    this.scene.player.setVelocity(0,0);
    this.hud.showNotice('PLAYER DEFEATED','danger');
    this.scene.showBossRetry?.();
  }

  acquireProjectile(group,x,y,texture,kind){
    const projectile=group.get(x,y,texture);
    if(!projectile)return null;
    projectile.anims?.stop();
    projectile.enableBody(true,x,y,true,true).setTexture(texture).setScale(1).setRotation(0)
      .clearTint().setDepth(kind==='boss'?10000:10001);
    projectile.setData('projectileKind',kind);
    this.hitRegistry.prepare(projectile);
    return projectile;
  }

  disableProjectile(projectile){
    if(projectile?.active){projectile.anims?.stop();projectile.disableBody(true,true);}
  }

  clearProjectiles(){
    for(const group of [this.bossProjectiles,this.playerProjectiles]){
      for(const projectile of group?.getChildren?.()??[])this.disableProjectile(projectile);
    }
  }

  cleanupProjectiles(group,time){
    const bounds=this.scene.physics.world.bounds;
    for(const projectile of group.getChildren()){
      if(!projectile.active)continue;
      if(time>=projectile.getData('expiresAt')||projectile.x<bounds.left-32||projectile.x>bounds.right+32||projectile.y<bounds.top-32||projectile.y>bounds.bottom+32)this.disableProjectile(projectile);
    }
  }

  updateHomingProjectiles(delta){
    if(this.playerCombat.defeated)return;
    const target=this.scene.player.body.center;
    for(const projectile of this.bossProjectiles.getChildren()){
      if(!projectile.active||projectile.getData('projectileBehavior')!=='homing')continue;
      const speed=projectile.getData('homingSpeed')??this.phaseConfig.homingSpeed;
      const turnRate=projectile.getData('homingTurnRate')??this.phaseConfig.homingTurnRateDegrees*Math.PI/180;
      const velocity=homingVelocity(projectile.body.velocity,projectile.body.center,target,
        speed,turnRate,delta);
      projectile.setVelocity(velocity.x,velocity.y).setRotation(velocity.angle+Math.PI/2);
    }
  }

  update(time,delta=0){
    if(this.destroyed||this.suspended)return;
    this.scene.player?.updateCombatHudPosition();
    const requested=this.interactRequested;this.interactRequested=false;
    this.interactRequested=requested;
    this.updateSpeechPosition();
    this.updateLootInteraction();
    this.interactRequested=false;
    if(this.rewardOpened)this.scene.player.setVelocity(0,0);
    if([BOSS_STATES.DYING,BOSS_STATES.DEFEATED,BOSS_STATES.REWARD].includes(this.model.state))return;
    this.updateEncounter(time);
    if(this.playerCombat.defeated)this.scene.player.setVelocity(0,0);
    if(this.model.state===BOSS_STATES.PHASE_TRANSITION&&time>=this.phaseTransitionEndsAt)this.finishPhaseTransition();
    if(time>=this.stateEndsAt&&this.stateEndsAt){this.model.finishAction();this.stateEndsAt=0;this.sprite.clearTint();}
    const phaseTransitionStarted=this.encounter.active&&this.startPhaseTransition(time);
    const scriptedAttackStarted=!phaseTransitionStarted&&this.model.state!==BOSS_STATES.PHASE_TRANSITION
      &&this.startScriptedHoming(time);
    if(!phaseTransitionStarted&&!scriptedAttackStarted&&this.model.state!==BOSS_STATES.PHASE_TRANSITION)this.startMovement(time);
    if(!this.gameplayBlocked()){
      if(Object.values(this.attackKeys).some(key=>Phaser.Input.Keyboard.JustDown(key))){
        this.hideAttackTutorial();this.firePlayerProjectile(time);
      }
      if(!this.moveDueAt&&this.model.state!==BOSS_STATES.MOVING&&this.model.state!==BOSS_STATES.PHASE_TRANSITION){
        this.startBossAttack(time);
        this.executeBossAttack(time);
      }
    }
    this.updateHomingProjectiles(delta);
    this.cleanupProjectiles(this.bossProjectiles,time);this.cleanupProjectiles(this.playerProjectiles,time);
  }

  suspend(){
    if(this.destroyed)return;
    this.suspended=true;this.cancelPendingAttack();this.cancelMovement();this.clearProjectiles();
    this.clearPhaseTransition();
    this.scene.tweens.killTweensOf(this.sprite);this.deathTween?.stop();this.deathTween=null;
    for(const timer of [this.playerTintTimer,this.bossTintTimer,this.defeatTimer,this.speechTimer,this.tutorialTimer])timer?.remove(false);
    this.playerTintTimer=null;this.bossTintTimer=null;this.defeatTimer=null;this.speechTimer=null;this.tutorialTimer=null;
    this.speechBubble?.setVisible(false);
    this.clearLoot();
    this.scene.player?.clearTint();
    this.scene.player?.setCombatHudVisible(false);
    this.hud?.setVisible(false);
    this.scene.gameHud?.resetHealth();
  }

  reset(){
    if(this.destroyed)return;
    this.suspended=false;this.clearProjectiles();
    this.cancelMovement();
    this.model.reset(this.scene.time.now);this.phaseState.reset();this.encounter.reset();this.tutorialState.reset();this.playerCombat.reset();
    this.attackSequence.reset();this.movementPlan.reset();
    this.nextPlayerAttackAt=0;this.stateEndsAt=0;this.victoryId=newVictoryId();this.victoryPromise=null;this.rewardOpened=false;this.pendingRewardResult=null;
    this.scriptedHomingPending=false;this.nextRandomSpeechAt=Infinity;
    this.positionAnchor={...this.home};
    this.clearLoot();this.sprite.setActive(true).setVisible(true).setAlpha(1).setAngle(0)
      .setPosition(this.home.x,this.home.y).setDepth(this.home.y).clearTint();
    this.applyBossVisual(1);
    this.sprite.body.enable=true;this.sprite.body.reset(this.home.x,this.home.y);
    this.hud.setVisible(true);this.scene.gameHud?.setHealth(this.playerCombat.hp,this.playerCombat.maxHp);
    this.hud.setBossHealth(this.model.hp,this.model.maxHp);this.hud.setPhase(1);
    this.scene.player.setCombatHealth(this.playerCombat.hp,this.playerCombat.maxHp).setCombatHudVisible(true);
    this.clearPhaseTransition();
    this.speechTimer?.remove(false);this.speechTimer=null;this.speechBubble.setVisible(false);
    this.hud.hideNotice();this.drawHp();
    this.hud.hideTutorial({immediate:true});this.scheduleAttackTutorial();void this.loadPendingReward();
  }

  cancelPendingAttack(){
    this.model.cancelAttack();this.pendingAim=null;this.stateEndsAt=0;
    this.endBossTelegraph();this.clearAreaVisual();
  }

  destroy(){
    if(this.destroyed)return;
    this.suspend();
    this.destroyed=true;
    this.scene.input.keyboard.off('keydown-E',this.handleInteract);
    for(const collider of this.colliders)collider?.destroy();
    this.bossProjectiles?.clear(true,true);this.playerProjectiles?.clear(true,true);
    this.scene.player?.setCombatHudVisible(false);
    this.scene.gameHud?.resetHealth();
    this.sprite?.destroy();this.hud?.destroy();this.speechBubble?.destroy();this.rewardOverlay?.destroy();
  }
}
