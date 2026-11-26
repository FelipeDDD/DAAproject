import { WorldPrompt } from '../ui/WorldPrompt.js';
import { resolveSpawn } from '../maps/tiledObjects.js';
import { SWAMP_MINI_BOSS, SWAMP_RUN, SLOT_KEYS } from './runConfig.js';
import { SwampMiniBoss } from './SwampMiniBoss.js';
import { localSwampRun, prepareCheckpoint, saveSwampRun } from './SwampRun.js';
import { SwampChoices, SwampSkillHud } from './SwampSkillHud.js';
import { SwampCombatCasts } from './SwampCombatCasts.js';
import { createMobTerrain } from './mobMovement.js';
import { SWAMP_RESPAWN_DELAY_MS } from './mobConfig.js';
import { TargetReactions } from '../vfx/lab/targetReactions.js';
import Phaser from 'phaser';
import './swampRun.css';

export class SwampRunController {
  constructor(scene){
    this.scene=scene;
    this.mobs=scene.swampMobs;
    this.bout=this.mobs.bout;
    this.run=localSwampRun(scene.game);
    this.miniBoss=new SwampMiniBoss(this.mobs,this.run);
    this.terrain=createMobTerrain(scene.collisionLayer,scene.physics.world.bounds,scene.playerFootRadius);
    this.prompt=new WorldPrompt(scene,'[E] Collect checkpoint reward');
    this.choices=new SwampChoices(scene,this.run,(category,skill)=>this.choose(category,skill),()=>this.restart());
    this.reactions=new TargetReactions(scene,Phaser.Textures.FilterMode.NEAREST);
    this.mobs.onHit=(...hit)=>this.onHit(...hit);
    this.casts=new SwampCombatCasts(scene,this.run,this.bout,()=>this.canCast(),
      amount=>this.reactions.drainResult(scene.player,amount));
    this.hud=new SwampSkillHud(slot=>{
      this.casts.use(slot);
      document.getElementById('game')?.focus({preventScroll:true});
    });
    this.enter();
    this.createControls();
  }

  get blocking(){return this.choices.active||!this.bout.playerHp;}
  get movementFactor(){return this.bout.stunMs?0:this.bout.speedFactor*this.casts.runner.castSpeed;}

  enter(){
    if(this.run.hp===0)this.respawn();
    else if(this.run.activeCheckpoint.slot>0)this.placeAt(this.run.activeCheckpoint);
    this.refresh();
    this.openPendingChoice();
  }

  canCast(){
    return this.scene.scene.isActive()&&this.scene.input.enabled&&!this.blocking&&!this.bout.stunMs&&Boolean(this.run.skills[0])&&
      this.run.hp>0&&!this.scene.chat?.isInputActive&&!document.querySelector(
        '[data-block-game-shortcuts]:not([hidden]),.boss-reward-overlay:not([hidden])',
      );
  }

  nearDrop(){
    if(!this.dropStep||this.blocking)return false;
    const center=this.scene.player.body.center,point=this.dropStep.drop;
    return Math.hypot(center.x-point.x,center.y-point.y)<=SWAMP_RUN.pickupRange&&this.terrain.sees(center,point);
  }

  acceptsInteractionKey(event){
    const target=event?.target;
    return !event?.ctrlKey&&!event?.altKey&&!event?.metaKey&&!event?.isComposing&&
      !target?.isContentEditable&&!target?.closest?.('input, select, textarea, button, [role="textbox"]');
  }

  collectNearby(){
    if(!this.nearDrop()||!this.run.collect(this.dropStep.id))return false;
    this.refresh();
    this.openPendingChoice();
    return true;
  }

  defeatElite(id){
    const step=this.run.next;
    if(step?.elite!==id||!step.drop||!this.terrain.clear(step.drop)||!this.run.defeat(id))return false;
    this.refresh();
    return true;
  }

  choose(category,skill){
    if(!this.run.choose(category,skill))return;
    this.choices.close();
    this.refresh();
    this.checkDefeatedCheckpoint();
  }

  openPendingChoice(){
    if(this.bout.playerHp&&this.run.pendingChoice&&!this.choices.active)this.choices.show(this.run.pendingChoice);
  }

  update(dt){
    const elapsed=Math.min(dt,50);
    this.mobs.updateAmbushPreview(elapsed);
    if(!this.bout.playerHp)this.syncCombatHealth();
    this.openPendingChoice();
    if(!this.choices.active){
      if(this.bout.playerHp){
        this.miniBoss.start();
        this.mobs.update(elapsed);
        this.casts.update(elapsed);
        this.syncCombatHealth();
        this.checkDefeatedCheckpoint();
      }else{
        this.deathMs-=elapsed;
        if(this.deathMs<=0)this.respawn();
      }
      this.updateReactions(elapsed);
    }
    this.prompt.setVisible(this.nearDrop());
    this.miniBoss.updateHud();
    this.hud.update(this.run,this.casts.runner,this.canCast()&&!this.casts.runner.casting);
  }

  refresh(){
    this.bout.playerHp=this.run.hp;
    this.bout.started=Boolean(this.run.skills[0]);
    saveSwampRun(this.run);
    this.scene.gameHud?.setHealth(this.run.hp,SWAMP_RUN.maxHp);
    this.mobs.removeWhere(mob=>mob.enemy.hp&&mob!==this.miniBoss.practiceMob&&this.run.defeated.has(mob.spawnId));
    this.syncDrop();
    this.hud.update(this.run,this.casts.runner,this.canCast()&&!this.casts.runner.casting);
    if(this.devState)this.devState.textContent=SLOT_KEYS.map(
      (key,i)=>key+' '+(this.run.skills[i]??'locked'),
    ).join(' · ');
  }

  syncDrop(){
    const next=this.run.pendingDrop;
    if(this.dropStep===next)return;
    this.drop?.destroy();
    this.drop=null;
    this.dropStep=null;
    this.prompt.setVisible(false);
    if(!next||!this.terrain.clear(next.drop))return;
    const {x,y}=next.drop;
    this.dropStep=next;
    this.drop=this.scene.add.graphics().setPosition(x,y).setDepth(y+1)
      .fillStyle(0xf3ba58,0.25).fillEllipse(0,1,27,11)
      .fillStyle(0x2d2020).fillRoundedRect(-8,-15,16,15,3)
      .lineStyle(1,0xffcd79).strokeRoundedRect(-8,-15,16,15,3)
      .lineBetween(0,-12,0,-3).lineBetween(-3,-8,3,-8);
    this.prompt.setPosition(x,y-21);
  }

  placeAt(step){
    const {scene}=this;
    const entrance=this.run.config.checkpoints[0].spawn;
    const point=step.drop&&this.terrain.clear(step.drop)?step.drop:resolveSpawn(scene.source,{targetSpawn:step.spawn??entrance});
    scene.player.setVelocity(0,0);
    scene.player.body.reset(point.x,point.y);
    scene.player.body.updateFromGameObject();
    scene.input.keyboard.resetKeys();
  }

  setHealth(hp){
    if(hp<=0)this.bout.hurt(this.bout.playerHp,this.scene.player.body.center);
    else this.bout.playerHp=Math.min(this.run.config.maxHp,hp);
    this.syncCombatHealth();
  }

  syncCombatHealth(){
    if(this.run.hp===this.bout.playerHp)return;
    this.run.setHealth(this.bout.playerHp);
    this.scene.gameHud?.setHealth(this.run.hp,SWAMP_RUN.maxHp);
    saveSwampRun(this.run);
    if(this.run.hp)return;
    this.deathMs=SWAMP_RESPAWN_DELAY_MS;
    this.scene.player.setVelocity(0,0).setAlpha(0.35);
    this.scene.input.keyboard.resetKeys();
    this.miniBoss.clearSummons(this.reactions);
    this.reactions.clearStatuses();
    this.casts.reset();
  }

  onHit(victim,amount,point,{actor,critical,status}){
    const sprite=actor?this.mobs.entries.find(entry=>entry.mob===actor)?.sprite:this.scene.player;
    if(sprite)this.reactions.hit(sprite,critical,point,amount);
    if(actor&&!actor.enemy.hp){
      this.mobs.vanquished.add(actor.spawnId);
      this.reactions.clearStatuses(sprite);
      if(actor.miniBoss)this.miniBoss.clearSummons(this.reactions);
    }else if(actor&&status==='Slowed'&&sprite)this.reactions.apply(sprite,status,actor.slow.ms);
    else if(victim==='player'&&status==='Cloud'&&!this.statusName)
      this.reactions.apply(sprite,'Poisoned',760);
  }

  updateReactions(dt){
    const {bout}=this;
    const status=bout.stunMs?'Stunned':bout.speedFactor<1?'Slowed':bout.poison?'Poisoned':null;
    if(status!==this.statusName){
      this.reactions.clearStatuses(this.scene.player);
      if(status)this.reactions.apply(this.scene.player,status,Infinity);
      this.statusName=status;
    }
    this.reactions.update(dt);
  }

  checkDefeatedCheckpoint(){
    const id=this.run.next?.elite;
    if(id&&!this.run.defeated.has(id)&&this.mobs.vanquished.has(id))this.defeatElite(id);
  }

  respawn({testing=false}={}){
    this.placeAt(this.run.respawn());
    this.scene.player.setAlpha(1);
    this.casts.reset();
    this.reactions.clear();
    this.mobs.resetEncounter(this.run.defeated,{testing});
    this.refresh();
  }

  restart(){
    this.run.restart();
    this.respawn();
    this.openPendingChoice();
  }

  createControls(){
    const root=document.createElement('div');
    root.className='swamp-run-controls';
    const button=(label,action)=>{
      const control=document.createElement('button');
      control.type='button';control.textContent=label;
      control.onclick=()=>{control.blur();action();};
      return control;
    };
    root.append(button('Restart run',()=>this.choices.confirmRestart()));
    document.getElementById('play-toolbar')?.append(root);
    this.controls=root;
    if(!import.meta.env.DEV)return;
    const details=this.scene.swampMobs?.editor.advanced;
    if(!details)return;
    this.dev=document.createElement('div');
    this.dev.className='swamp-run-controls';
    const select=document.createElement('select');
    select.setAttribute('aria-label','Checkpoint to test');
    const checkpoints=SWAMP_RUN.checkpoints.filter(step=>step.elite);
    for(const step of checkpoints)select.add(new Option(step.label,step.id));
    const selected=()=>checkpoints.find(step=>step.id===select.value);
    const status=document.createElement('small');
    status.setAttribute('role','status');
    this.devState=document.createElement('small');
    this.dev.append(select,button('Simulate defeat & drop',()=>{
      status.textContent=this.defeatElite(selected().elite)?'Reward spawned.':'Choose the previous checkpoint first, or the reward already exists.';
    }),button('Test checkpoint here',()=>{
      const step=selected();
      if(!this.terrain.clear(step.drop)||!prepareCheckpoint(this.run,step)){
        status.textContent='Checkpoint unavailable. Restart to test an earlier step.';
        return;
      }
      this.placeAt(step);
      this.refresh();
      status.textContent='Reward ready. Press E to collect.';
    }),button('Simulate death',()=>this.setHealth(0)),button('Restore HP',()=>{
      if(this.bout.playerHp)this.setHealth(SWAMP_RUN.maxHp);
    }),status,this.devState);
    const miniBossStep=checkpoints.find(step=>step.elite===SWAMP_MINI_BOSS.id);
    this.dev.append(button('Start mini-boss here',()=>{
      if(this.blocking||(!this.run.defeated.has(SWAMP_MINI_BOSS.id)&&!prepareCheckpoint(this.run,miniBossStep,{defeat:false}))){
        status.textContent='Finish the current activity before testing the mini-boss.';
        return;
      }
      this.placeAt(miniBossStep);
      this.refresh();
      this.miniBoss.start({force:true,practice:this.run.defeated.has(SWAMP_MINI_BOSS.id)});
      status.textContent=this.miniBoss.entry?'Mini-boss ready.':'Mini-boss unavailable.';
    }),button('Reset mini-boss',()=>{
      status.textContent=!this.blocking&&this.miniBoss.reset(this.reactions)
        ?'Mini-boss reset.':'Start the mini-boss encounter first.';
    }),button('Damage mini-boss for test',()=>{
      const mob=this.miniBoss.entry?.mob;
      if(!mob?.enemy.hp||this.blocking){status.textContent='Start the mini-boss encounter first.';return;}
      this.bout.hitEnemy({damage:mob.enemy.hp},mob,mob.enemy,this.scene.player);
      this.checkDefeatedCheckpoint();
      status.textContent=this.run.pendingDrop===miniBossStep?'Ultimate reward ready.':
        mob.enemy.hp?'Mini-boss at '+mob.enemy.hp+' HP. Let the current milestone finish before hitting again.':'Mini-boss defeated.';
    }));
    details.append(this.dev);
    this.refresh();
  }

  destroy(){
    this.choices.destroy();
    this.casts.destroy();
    this.mobs.onHit=null;
    this.reactions.clear();
    this.miniBoss.destroy();
    this.hud.destroy();
    this.prompt.destroy();
    this.drop?.destroy();
    this.controls.remove();
    this.dev?.remove();
    this.scene.gameHud?.resetHealth();
  }
}
