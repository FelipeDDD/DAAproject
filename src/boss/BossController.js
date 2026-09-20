import Phaser from 'phaser';
import { resolveSpawn } from '../maps/tiledObjects.js';
import { readBossPositions } from '../maps/bossPositions.js';
import {
  aimedVelocity,BossCombatState,BossPhaseState,BOSS_STATES,PlayerCombatState,
  ProjectileHitRegistry,projectileFromCollision,projectileVelocityToward,
} from './BossCombatState.js';
import {
  AreaAttackTarget,BossAttackSequence,BossMovementPlan,BOSS_ATTACK_TYPES,BOSS_PROJECTILE_VISUALS,
  fanProjectileVelocities,homingVelocity,projectileVisualForAttack,
} from './BossAttackPattern.js';
import {
  BOSS_AREA_DAMAGE,BOSS_AREA_IMPACT_MS,BOSS_AREA_RADIUS,BOSS_ATTACK_COOLDOWN_MS,BOSS_ATTACK_STATE_MS,
  BOSS_FAN_PROJECTILE_BODY_HEIGHT,BOSS_FAN_PROJECTILE_BODY_OFFSET_X,BOSS_FAN_PROJECTILE_BODY_OFFSET_Y,
  BOSS_FAN_PROJECTILE_BODY_WIDTH,BOSS_HURT_STATE_MS,BOSS_MAX_HP,BOSS_PHASES,BOSS_PHASE_THRESHOLDS,
  BOSS_PHASE_TRANSITION_MS,
  BOSS_HOMING_DAMAGE,BOSS_HOMING_LIFETIME_MS,BOSS_PROJECTILE_LIFETIME_MS,
  PLAYER_ATTACK_COOLDOWN_MS,PLAYER_HIT_DAMAGE,
  BOSS_SINGLE_PROJECTILE_FRAME_RATE,BOSS_SINGLE_PROJECTILE_FRAME_SIZE,
  PLAYER_INVULNERABILITY_MS,PLAYER_MAX_HP,
  PLAYER_ATTACK_DAMAGE,PLAYER_PROJECTILE_LIFETIME_MS,PLAYER_PROJECTILE_SPEED,
} from './config.js';

const BOSS_TEXTURE='arena-boss-placeholder';
const BOSS_PROJECTILE_TEXTURE='arena-boss-projectile';
export const BOSS_SINGLE_PROJECTILE_TEXTURE='director-paper-projectile';
const BOSS_SINGLE_PROJECTILE_ANIMATION='director-paper-projectile-fly';
export const BOSS_HOMING_PROJECTILE_TEXTURE='director-paper-homing';
const BOSS_HOMING_PROJECTILE_ANIMATION='director-paper-homing-fly';
const PLAYER_PROJECTILE_TEXTURE='arena-player-projectile';

function createTextures(scene){
  if(!scene.textures.exists(BOSS_TEXTURE)){
    const graphics=scene.add.graphics();
    graphics.fillStyle(0x17191e).fillRect(8,54,32,24);
    graphics.fillStyle(0x7f2635).fillRoundedRect(5,31,38,30,5);
    graphics.fillStyle(0x36506f).fillRect(13,29,22,10);
    graphics.fillStyle(0xf0b08b).fillRoundedRect(11,7,26,26,8);
    graphics.fillStyle(0xb85f35).fillRect(11,5,26,9);
    graphics.fillStyle(0x25252a).fillRect(10,16,13,3).fillRect(25,16,13,3).fillRect(22,17,4,2);
    graphics.fillStyle(0x75402e).fillRect(15,27,18,3);
    graphics.generateTexture(BOSS_TEXTURE,48,80);graphics.destroy();
  }
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
}

function textInputActive(){
  const element=document.activeElement;
  return element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement
    ||element instanceof HTMLSelectElement||element?.isContentEditable;
}

export class BossController {
  constructor(scene){
    this.scene=scene;
    this.model=new BossCombatState({maxHp:BOSS_MAX_HP,attackCooldownMs:BOSS_ATTACK_COOLDOWN_MS,now:scene.time.now});
    this.phaseState=new BossPhaseState({maxHp:BOSS_MAX_HP,thresholds:BOSS_PHASE_THRESHOLDS});
    this.playerCombat=new PlayerCombatState({maxHp:PLAYER_MAX_HP,invulnerabilityMs:PLAYER_INVULNERABILITY_MS});
    this.attackSequence=new BossAttackSequence();
    this.movementPlan=new BossMovementPlan(readBossPositions(scene.source));
    this.hitRegistry=new ProjectileHitRegistry();
    this.nextPlayerAttackAt=0;this.stateEndsAt=0;this.moveDueAt=0;this.destroyed=false;this.suspended=false;
    this.phaseTransitionEndsAt=0;this.phaseTween=null;
    this.playerTintTimer=null;this.bossTintTimer=null;this.defeatTimer=null;
    this.areaGraphic=null;this.areaTween=null;this.areaTarget=null;
    createTextures(scene);
    const spawn=resolveSpawn(scene.source,{targetSpawn:'boss-spawn'});
    this.home={x:spawn.x,y:spawn.y};
    this.positionAnchor={...this.home};
    this.sprite=scene.physics.add.sprite(spawn.x,spawn.y,BOSS_TEXTURE).setOrigin(.5,1).setImmovable(true).setDepth(spawn.y);
    this.sprite.body.setSize(36,56).setOffset(6,22);
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
    this.colliders.push(scene.physics.add.overlap(this.bossProjectiles,scene.player,(first,second)=>{
      this.hitPlayer(projectileFromCollision(first,second,'boss'));
    }));
    this.colliders.push(scene.physics.add.overlap(this.playerProjectiles,this.sprite,(first,second)=>{
      this.hitBoss(projectileFromCollision(first,second,'player'));
    }));
    this.attackKey=scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    scene.input.keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.createHud();
  }

  createHud(){
    const camera=this.scene.cameras.main;
    // A fixed container at camera center plus inverse zoom keeps HUD coordinates
    // in screen pixels. Plain setScrollFactor(0) still inherits camera zoom.
    this.hud=this.scene.add.container(camera.width/2,camera.height/2)
      .setScrollFactor(0).setScale(1/camera.zoom).setDepth(200000);
    this.hpGraphics=this.scene.add.graphics();
    this.titleLabel=this.scene.add.text(0,-camera.height/2+14,'DIRECTOR · PHASE 1',{fontFamily:'system-ui, sans-serif',fontSize:'14px',fontStyle:'bold',color:'#ffffff',stroke:'#000000',strokeThickness:3}).setOrigin(.5,0);
    this.hpLabel=this.scene.add.text(0,-camera.height/2+49,'100 / 100',{fontFamily:'system-ui, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#ffffff',stroke:'#000000',strokeThickness:3}).setOrigin(.5,0);
    this.playerHpLabel=this.scene.add.text(-camera.width/2+14,-camera.height/2+14,'Player HP: 3',{fontFamily:'system-ui, sans-serif',fontSize:'13px',color:'#ffffff',stroke:'#000000',strokeThickness:3});
    this.controlLabel=this.scene.add.text(camera.width/2-14,-camera.height/2+14,'SPACE: Attack',{fontFamily:'system-ui, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#8cecff',stroke:'#000000',strokeThickness:3}).setOrigin(1,0);
    this.defeatLabel=this.scene.add.text(0,0,'BOSS DEFEATED',{fontFamily:'system-ui, sans-serif',fontSize:'32px',fontStyle:'bold',color:'#ffe38b',stroke:'#4a160e',strokeThickness:6}).setOrigin(.5).setVisible(false);
    this.playerDefeatLabel=this.scene.add.text(0,0,'PLAYER DEFEATED',{fontFamily:'system-ui, sans-serif',fontSize:'32px',fontStyle:'bold',color:'#ff8585',stroke:'#4a0e0e',strokeThickness:6}).setOrigin(.5).setVisible(false);
    this.phaseLabel=this.scene.add.text(0,-30,'PHASE 2',{fontFamily:'system-ui, sans-serif',fontSize:'34px',fontStyle:'bold',color:'#ffd36b',stroke:'#641c28',strokeThickness:7}).setOrigin(.5).setVisible(false);
    this.hud.add([this.hpGraphics,this.titleLabel,this.hpLabel,this.playerHpLabel,this.controlLabel,this.defeatLabel,this.playerDefeatLabel,this.phaseLabel]);
    this.drawHp();
  }

  drawHp(){
    const camera=this.scene.cameras.main,width=360,height=14,x=-width/2,y=-camera.height/2+34;
    this.hpGraphics.clear().fillStyle(0x160d12,.88).fillRoundedRect(x-3,y-3,width+6,height+6,5)
      .fillStyle(0x4a1720,1).fillRect(x,y,width,height)
      .fillStyle(0xd94152,1).fillRect(x,y,width*this.model.hp/this.model.maxHp,height);
    this.hpLabel.setText(`${this.model.hp} / ${this.model.maxHp}`);
  }

  gameplayBlocked(){
    return this.scene.chat?.focused||this.scene.terminal?.active||this.scene.quiz?.seated
      ||this.scene.soloStudy?.active||textInputActive();
  }

  get phaseConfig(){return BOSS_PHASES[this.phaseState.phase];}

  startBossAttack(time){
    if(this.suspended||this.playerCombat.defeated||!this.model.canAttack(time))return false;
    const type=this.attackSequence.peek();
    const fan=type===BOSS_ATTACK_TYPES.FAN;
    const area=type===BOSS_ATTACK_TYPES.AREA;
    const homing=type===BOSS_ATTACK_TYPES.HOMING;
    const config=this.phaseConfig;
    if(!this.model.startAttack(time,{
      type,cooldownMs:fan?config.fanCooldownMs:area?config.areaCooldownMs:homing?config.homingCooldownMs:config.singleCooldownMs,
      telegraphMs:fan?config.fanTelegraphMs:area?config.areaTelegraphMs:0,
    }))return false;
    this.attackSequence.advance();
    const target=this.scene.player.body.center;
    this.pendingAim={x:target.x,y:target.y};
    if(fan||area)this.beginBossTelegraph();
    if(area)this.beginAreaTelegraph(this.pendingAim);
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
      ||this.playerCombat.defeated||this.model.state===BOSS_STATES.DEFEATED)return false;
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
      targets:this.sprite,scaleX:1.08,scaleY:1.08,duration:175,yoyo:true,repeat:1,
    });
  }

  endBossTelegraph(){
    this.telegraphTween?.stop();this.telegraphTween=null;
    this.sprite.setScale(1).clearTint();
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

  startPhaseTransition(time){
    if(!this.phaseState.transitionPending||!this.model.startPhaseTransition())return false;
    this.phaseState.consumeTransition();
    this.phaseTransitionEndsAt=time+BOSS_PHASE_TRANSITION_MS;
    this.titleLabel.setText(`DIRECTOR · PHASE ${this.phaseState.phase}`);
    const phaseThree=this.phaseState.phase===3;
    this.phaseLabel.setText(`PHASE ${this.phaseState.phase}`).setColor(phaseThree?'#ff7777':'#ffd36b')
      .setVisible(true).setAlpha(1).setScale(1);
    this.bossTintTimer?.remove(false);this.bossTintTimer=null;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setTint(phaseThree?0xff5555:0xffb347).setScale(1);
    this.phaseTween=this.scene.tweens.add({
      targets:this.sprite,scaleX:1.13,scaleY:1.13,duration:180,yoyo:true,repeat:1,
    });
    this.scene.cameras.main.shake(220,.004);
    return true;
  }

  finishPhaseTransition(){
    if(this.model.state!==BOSS_STATES.PHASE_TRANSITION)return false;
    this.phaseTween?.stop();this.phaseTween=null;
    this.phaseTransitionEndsAt=0;
    this.phaseLabel.setVisible(false);
    this.sprite.setScale(1).clearTint();
    return this.model.finishPhaseTransition();
  }

  clearPhaseTransition(){
    this.phaseTween?.stop();this.phaseTween=null;this.phaseTransitionEndsAt=0;
    this.phaseLabel?.setVisible(false);
    this.sprite?.setScale(1).clearTint();
  }

  firePlayerProjectile(time){
    if(this.suspended||this.playerCombat.defeated||time<this.nextPlayerAttackAt||this.model.state===BOSS_STATES.DEFEATED)return false;
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
    this.playerHpLabel.setText(`Player HP: ${this.playerCombat.hp}`);
    this.scene.player.setTint(0xff7777);
    this.playerTintTimer?.remove(false);
    this.playerTintTimer=this.scene.time.delayedCall(130,()=>{if(this.scene.player?.active)this.scene.player.clearTint();});
    if(this.playerCombat.defeated)this.playerDefeated();
    return true;
  }

  hitBoss(projectile){
    if(!projectile?.active||this.model.state===BOSS_STATES.DEFEATED||!this.hitRegistry.claim(projectile))return;
    const push=Math.sign(projectile.body.velocity.x||1)*5;
    const wasMoving=this.model.state===BOSS_STATES.MOVING;
    const wasTransitioning=this.model.state===BOSS_STATES.PHASE_TRANSITION;
    this.disableProjectile(projectile);
    if(!this.model.takeDamage(PLAYER_ATTACK_DAMAGE))return;
    this.drawHp();
    if(this.model.state===BOSS_STATES.DEFEATED){this.defeat();return;}
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

  defeat(){
    this.cancelPendingAttack();
    this.cancelMovement();
    this.clearPhaseTransition();
    this.clearProjectiles();
    this.scene.tweens.killTweensOf(this.sprite);this.sprite.setTint(0x777777);
    this.sprite.body.enable=false;this.defeatLabel.setVisible(true);
    this.defeatTimer?.remove(false);
    this.defeatTimer=this.scene.time.delayedCall(3000,()=>this.defeatLabel?.setVisible(false));
  }

  playerDefeated(){
    this.cancelPendingAttack();
    this.cancelMovement();
    this.clearPhaseTransition();
    this.clearProjectiles();
    this.scene.player.setVelocity(0,0);
    this.playerDefeatLabel.setVisible(true);
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
    if(this.playerCombat.defeated)this.scene.player.setVelocity(0,0);
    if(this.model.state===BOSS_STATES.PHASE_TRANSITION&&time>=this.phaseTransitionEndsAt)this.finishPhaseTransition();
    if(this.model.state!==BOSS_STATES.DEFEATED&&time>=this.stateEndsAt&&this.stateEndsAt){this.model.finishAction();this.stateEndsAt=0;this.sprite.clearTint();}
    const phaseTransitionStarted=this.startPhaseTransition(time);
    if(!phaseTransitionStarted&&this.model.state!==BOSS_STATES.PHASE_TRANSITION)this.startMovement(time);
    if(!this.gameplayBlocked()){
      if(Phaser.Input.Keyboard.JustDown(this.attackKey))this.firePlayerProjectile(time);
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
    this.scene.tweens.killTweensOf(this.sprite);
    for(const timer of [this.playerTintTimer,this.bossTintTimer,this.defeatTimer])timer?.remove(false);
    this.playerTintTimer=null;this.bossTintTimer=null;this.defeatTimer=null;
    this.scene.player?.clearTint();
  }

  reset(){
    if(this.destroyed)return;
    this.suspended=false;this.clearProjectiles();
    this.cancelMovement();
    this.model.reset(this.scene.time.now);this.phaseState.reset();this.playerCombat.reset();this.attackSequence.reset();this.movementPlan.reset();
    this.nextPlayerAttackAt=0;this.stateEndsAt=0;
    this.positionAnchor={...this.home};
    this.sprite.setActive(true).setVisible(true).setPosition(this.home.x,this.home.y).setDepth(this.home.y).clearTint();
    this.sprite.body.enable=true;this.sprite.body.reset(this.home.x,this.home.y);
    this.playerHpLabel.setText(`Player HP: ${this.playerCombat.hp}`);
    this.titleLabel.setText('DIRECTOR · PHASE 1');this.clearPhaseTransition();
    this.defeatLabel.setVisible(false);this.playerDefeatLabel.setVisible(false);this.drawHp();
  }

  cancelPendingAttack(){
    this.model.cancelAttack();this.pendingAim=null;this.stateEndsAt=0;
    this.endBossTelegraph();this.clearAreaVisual();
  }

  destroy(){
    if(this.destroyed)return;
    this.suspend();
    this.destroyed=true;
    for(const collider of this.colliders)collider?.destroy();
    this.bossProjectiles?.clear(true,true);this.playerProjectiles?.clear(true,true);
    this.sprite?.destroy();this.hud?.destroy(true);
  }
}
