import Phaser from 'phaser';
import { Player } from '../../entities/Player.js';
import { characterById } from '../../characters.js';
import { applyCharacterVisual, createCharacterAnimations, preloadCharacterTextures } from '../../characterVisuals.js';
import { createPlaceholderTextures } from '../../art/placeholders.js';
import { preloadTiledMap, createTiledWorld } from '../../maps/tiledWorld.js';
import { addMapCollision } from '../../maps/collision.js';
import { LAB_EFFECTS, LAB_BANKS } from './effects.js';
import { preloadLabSheets } from './SheetSequence.js';
import { mountEffectHotbar } from './EffectHotbar.js';
import { trackArenaAim } from './ArenaAim.js';
import { bindArenaInput } from './arenaInput.js';
import { CastRangeIndicator } from './CastRangeIndicator.js';
import { mountTimingControls } from './TimingControls.js';
import { mountReactionControls } from './ReactionControls.js';
import { TargetReactions } from './targetReactions.js';
import { VfxPlayback } from './Playback.js';
import { VFX_LAB_MAP, VFX_LAB_PLAYER, VFX_LAB_TARGET } from './layout.js';
import { clampSkillAim } from '../../pvp/skills/config.js';

const playerCharacter=characterById('michael');
const targetCharacter=characterById('sarina');
const allyCharacter=characterById('felipe');
const characters=[playerCharacter,targetCharacter,allyCharacter];
const nearest=Phaser.Textures.FilterMode.NEAREST;

export class VfxLabScene extends Phaser.Scene {
  constructor(controls){
    super('vfx-lab');
    this.controls=controls;
    this.silhouetteTintMode=Phaser.TintModes.FILL;
    this.mapKey='vfx-lab';
    this.sourceKey='vfx-lab-source';
    this.filename=VFX_LAB_MAP;
  }

  preload(){
    preloadLabSheets(this,import.meta.env.BASE_URL);
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
    const targetVisual=applyCharacterVisual(this.target,targetCharacter,'new');
    this.allyDummy=this.add.sprite(x+32,y+13,'student').setOrigin(0.5,1).setDepth(y+13);
    const allyVisual=applyCharacterVisual(this.allyDummy,allyCharacter,'new');
    this.reactions=new TargetReactions(this,nearest);
    this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels)
      .setZoom(1.25).startFollow(this.player,true);
    this.nextFpsUpdate=0;

    const canvas=this.game.canvas;
    const listeners=new AbortController();
    const {signal}=listeners;
    this.practice=mountReactionControls(this,[
      {sprite:this.target,visual:targetVisual,label:'Sarina · B'},
      {sprite:this.allyDummy,visual:allyVisual,label:'Felipe · A'},
    ],this.controls.reactions,signal);
    const aim=trackArenaAim(canvas,this.cameras.main,VFX_LAB_TARGET,{signal});
    const {select,play,reset}=this.controls;
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
      this.focusArena();
    };
    this.hotbar=mountEffectHotbar(this.controls,LAB_BANKS,LAB_EFFECTS,{
      signal,activate,selectEffect:()=>{this.playback.stop();timing.render();},
    });
    const timing=mountTimingControls(this.controls,LAB_EFFECTS,{signal});
    this.playback=new VfxPlayback(
      LAB_EFFECTS,(stage,anchor,context)=>this.createEffectView(stage,anchor,context,timing.get),
      {canPrepare:()=>this.controls.casting.checked,settings:timing.get},
    );
    this.focusArena=bindArenaInput(this,{
      label:'VFX test arena',onPointer:()=>{
        if(LAB_EFFECTS[select.value].clickToCast)activate(select.value);
      },
      onKey:event=>this.hotbar.onKey(event),
    },signal);
    play.addEventListener('click',()=>activate(select.value),{signal});
    reset.addEventListener('click',()=>{
      this.playback.stop();
      this.reactions.clear();
      this.practice.reset();
      this.player.body.reset(VFX_LAB_PLAYER.x,VFX_LAB_PLAYER.y);
      this.player.setDepth(VFX_LAB_PLAYER.y);
      this.player.setFacing('down');
      this.input.keyboard.resetKeys();
      this.focusArena();
    },{signal});
    play.disabled=reset.disabled=false;
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
      this.reactions.clear();
      aimPreview.destroy();
      this.hotbar.destroy();
      play.disabled=reset.disabled=true;
    });
    this.events.once(Phaser.Scenes.Events.CREATE,this.controls.ready);
  }

  createEffectView(stage,anchor,{id,preparing,effect,captureAim,durationMs,settings}={},getSettings){
    const view=stage.create(this,anchor??VFX_LAB_TARGET,nearest,this.player,{
      durationMs,settings,captureAim,liveSettings:()=>getSettings(id),
    });
    if(!preparing||effect.castRangePx===undefined)return view;
    const range=new CastRangeIndicator(this,this.player);
    return {
      update:(...args)=>{
        view.update(...args);
        const point=stage.lockAnchor?anchor:(captureAim?.()??anchor);
        range.update(this.controls.showCastRange.checked?point:null,getSettings(id).castRangePx);
      },
      destroy(){
        range.destroy();
        view.destroy();
      },
    };
  }

  update(){
    if(document.activeElement===this.game.canvas&&!this.playback.active?.view.channeling)this.player.update();
    else this.player.setVelocity(0,0).setFacing(this.player.facing,false);
  }

  previewHit(sprite,point){
    this.reactions.hit(sprite,this.controls.reactions.critical.checked,point);
  }

  updateEffects(time,delta){
    const dt=Math.min(100,Math.max(0,delta));
    this.practice.update(dt);
    this.playback.update(delta,this.controls.loop.checked);
    this.reactions.update(dt);
    this.hotbar.showActive(this.playback.active?.id);
    if(time>=this.nextFpsUpdate){
      this.nextFpsUpdate=time+350;
      this.controls.fps.textContent=`${Math.round(this.game.loop.actualFps)} FPS`;
    }
  }
}
