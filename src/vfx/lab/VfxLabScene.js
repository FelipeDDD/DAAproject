import Phaser from 'phaser';
import { Player } from '../../entities/Player.js';
import { characterById } from '../../characters.js';
import { applyCharacterVisual, createCharacterAnimations, preloadCharacterTextures } from '../../characterVisuals.js';
import { createPlaceholderTextures } from '../../art/placeholders.js';
import { preloadTiledMap, createTiledWorld } from '../../maps/tiledWorld.js';
import { addMapCollision } from '../../maps/collision.js';
import { LAB_EFFECTS, LAB_HOTBAR_SLOTS } from './effects.js';
import { mountEffectHotbar } from './EffectHotbar.js';
import { trackArenaAim } from './ArenaAim.js';
import { CastRangeIndicator } from './CastRangeIndicator.js';
import { mountTimingControls } from './TimingControls.js';
import { VfxPlayback } from './Playback.js';
import { VFX_LAB_MAP, VFX_LAB_PLAYER, VFX_LAB_TARGET } from './layout.js';
import { clampSkillAim } from '../../pvp/skills/config.js';

const playerCharacter=characterById('michael');
const targetCharacter=characterById('sarina');
const characters=[playerCharacter,targetCharacter];
const nearest=Phaser.Textures.FilterMode.NEAREST;

export class VfxLabScene extends Phaser.Scene {
  constructor(controls){
    super('vfx-lab');
    this.controls=controls;
    this.mapKey='vfx-lab';
    this.sourceKey='vfx-lab-source';
    this.filename=VFX_LAB_MAP;
  }

  preload(){
    preloadCharacterTextures(this,characters,import.meta.env.BASE_URL,false);
    preloadTiledMap(this,import.meta.env.BASE_URL);
  }

  create(){
    const map=createTiledWorld(this,()=>{
      createPlaceholderTextures(this);
      createCharacterAnimations(this,characters,false);
    });
    this.player=new Player(this,VFX_LAB_PLAYER.x,VFX_LAB_PLAYER.y);
    this.player.setCharacter(playerCharacter,'new');
    addMapCollision(this,map,this.player);
    const {x,y}=VFX_LAB_TARGET;
    this.target=this.add.sprite(x,y,'student').setOrigin(0.5,1).setDepth(y);
    applyCharacterVisual(this.target,targetCharacter,'new');
    this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels)
      .setZoom(1.25).startFollow(this.player,true);
    this.nextFpsUpdate=0;

    const canvas=this.game.canvas;
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','VFX test arena. Move with WASD or arrow keys.');
    this.input.keyboard.disableGlobalCapture();
    const listeners=new AbortController();
    const {signal}=listeners;
    const aim=trackArenaAim(canvas,this.cameras.main,VFX_LAB_TARGET,{signal});
    const timing=mountTimingControls(this.controls,LAB_EFFECTS,{signal});
    this.playback=new VfxPlayback(
      LAB_EFFECTS,(stage,anchor,context)=>this.createEffectView(stage,anchor,context,timing.get),
      {canPrepare:()=>this.controls.casting.checked,settings:timing.get},
    );
    const {select,play,reset,hotbar}=this.controls;
    const focusArena=()=>{
      if(document.activeElement!==canvas)this.input.keyboard.resetKeys();
      canvas.focus({preventScroll:true});
    };
    const captureAim=id=>{
      const point=aim.capture();
      const range=timing.get(id).castRangePx;
      return range===undefined?point:clampSkillAim(this.player,point,range);
    };
    const activate=id=>{
      const effect=LAB_EFFECTS[id];
      this.playback.play(id,{
        anchor:VFX_LAB_TARGET,captureAim:effect.aim==='pointer'?()=>captureAim(id):undefined,
      });
      focusArena();
    };
    this.hotbar=mountEffectHotbar(hotbar,LAB_HOTBAR_SLOTS,LAB_EFFECTS,activate,{signal});
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();
      focusArena();
    },{signal});
    canvas.addEventListener('keydown',event=>{
      if(event.key.startsWith('Arrow'))event.preventDefault();
      this.hotbar.onKey(event);
    },{signal});
    canvas.addEventListener('blur',()=>this.input.keyboard.resetKeys(),{signal});
    select.addEventListener('change',()=>this.playback.stop(),{signal});
    play.addEventListener('click',()=>activate(select.value),{signal});
    reset.addEventListener('click',()=>{
      this.playback.stop();
      this.player.body.reset(VFX_LAB_PLAYER.x,VFX_LAB_PLAYER.y);
      this.player.setDepth(VFX_LAB_PLAYER.y);
      this.player.setFacing('down');
      this.input.keyboard.resetKeys();
      focusArena();
    },{signal});
    play.disabled=reset.disabled=false;
    focusArena();
    const aimPreview=new CastRangeIndicator(this,this.player,'vfx-lab-aim-preview');
    // Arcade copies the simulated position to the sprite before this callback.
    const updateEffects=(time,delta)=>{
      this.updateEffects(time,delta);
      const id=select.value;
      const preview=LAB_EFFECTS[id].aimPreview&&this.controls.showCastRange.checked
        &&!this.playback.active&&document.activeElement===canvas;
      if(preview)aimPreview.update(captureAim(id),timing.get(id).castRangePx);
      else aimPreview.update(null);
    };
    this.events.on(Phaser.Scenes.Events.POST_UPDATE,updateEffects);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.events.off(Phaser.Scenes.Events.POST_UPDATE,updateEffects);
      listeners.abort();
      this.playback.stop();
      aimPreview.destroy();
      this.hotbar.destroy();
      play.disabled=reset.disabled=true;
    });
  }

  createEffectView(stage,anchor,{id,preparing,effect,captureAim,durationMs,settings}={},getSettings){
    const view=stage.create(this,anchor??VFX_LAB_TARGET,nearest,this.player,{durationMs,settings});
    if(!preparing||effect.castRangePx===undefined)return view;
    const range=new CastRangeIndicator(this,this.player);
    return {
      update:(...args)=>{
        view.update(...args);
        range.update(this.controls.showCastRange.checked?(captureAim?.()??anchor):null,getSettings(id).castRangePx);
      },
      destroy(){
        range.destroy();
        view.destroy();
      },
    };
  }

  update(){
    if(document.activeElement===this.game.canvas)this.player.update();
    else this.player.setVelocity(0,0).setFacing(this.player.facing,false);
  }

  updateEffects(time,delta){
    this.playback.update(delta,this.controls.loop.checked);
    this.hotbar.showActive(this.playback.active?.id);
    if(time>=this.nextFpsUpdate){
      this.nextFpsUpdate=time+350;
      this.controls.fps.textContent=`${Math.round(this.game.loop.actualFps)} FPS`;
    }
  }
}
