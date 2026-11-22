import Phaser from 'phaser';
import { Player } from '../../entities/Player.js';
import { PlayerHealthBar } from '../../ui/PlayerHealthBar.js';
import { characterById } from '../../characters.js';
import { createCharacterAnimations, preloadCharacterTextures } from '../../characterVisuals.js';
import { createPlaceholderTextures } from '../../art/placeholders.js';
import { preloadTiledMap, createTiledWorld } from '../../maps/tiledWorld.js';
import { addMapCollision } from '../../maps/collision.js';
import { trackArenaAim } from './ArenaAim.js';
import { CombatSkillRunner } from './CombatSkillRunner.js';
import { CombatSkillView,combatSheets } from './CombatSkillView.js';
import { CombatLoadoutPanel } from './CombatLoadoutPanel.js';
import { slotShortcut } from './combatLoadout.js';
import { preloadLabSheets } from './SheetSequence.js';

import { TargetReactions } from './targetReactions.js';
import { CombatBout,MAX_ENEMIES,MAX_PER_KIND } from './CombatBout.js';
import { ENEMIES } from './combatEnemy.js';
import { MUSHROOM_SHEETS,mushroomPose } from './mushroomArt.js';
import { nextMark,MUSHROOM_BOSS,eventNames } from './mushroomBoss.js';
import { labSheets } from './sheetCatalog.js';
import { CombatArenaEffects,drawGroundArea } from './CombatArenaEffects.js';
import { RING,playerBox,playerFeetBox } from './combatGeometry.js';
import { VFX_LAB_MAP,VFX_LAB_PLAYER,VFX_LAB_TARGET } from './layout.js';
import combatArt from '../../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
const sheets={...combatArt,'pfx-spores':labSheets['pfx-spores']};

const nearest=Phaser.Textures.FilterMode.NEAREST;
const character=characterById('michael');
const attackNames={jump:'Jump Attack',poison:'Poison Shot',frost:'Ice Shard',glob:'Heavy Glob',bolt:'Spectral Bolt',haunt:'Haunt',
  homing:'Homing Shot',spread:'Spread Volley',spore:'Spore Burst',bloom:'Toxic Bloom'};


export class CombatSandboxScene extends Phaser.Scene{
  constructor(controls){
    super('combat-sandbox');
    this.controls=controls;
    this.mapKey='combat-sandbox';
    this.sourceKey='combat-sandbox-source';
    this.filename=VFX_LAB_MAP;
  }

  preload(){
    const base=import.meta.env.BASE_URL;
    preloadLabSheets(this,base,combatSheets);
    for(const [name,atlas] of Object.entries(sheets)){
      this.load.spritesheet(name,base+'tools/vfx-lab/sheets/'+name+'.png',{
        frameWidth:atlas.width,frameHeight:atlas.height,endFrame:atlas.frameMs.length-1,
      });
    }
    for(const [name,atlas] of Object.entries(MUSHROOM_SHEETS)){
      this.load.spritesheet(name,atlas.url,{frameWidth:atlas.width,frameHeight:atlas.height,endFrame:atlas.frames-1});
    }
    preloadCharacterTextures(this,[character],base,false);
    preloadTiledMap(this,base);
  }

  create(){
    for(const key of Object.keys(MUSHROOM_SHEETS))this.textures.get(key).setFilter(nearest);
    const map=createTiledWorld(this,()=>{
      createPlaceholderTextures(this);
      createCharacterAnimations(this,[character],false);
    });
    this.player=new Player(this,VFX_LAB_PLAYER.x,VFX_LAB_PLAYER.y);
    this.player.setCharacter(character,'new');
    addMapCollision(this,map,this.player);
    const {left,top,right,bottom}=RING;
    this.player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(left,top,right-left,bottom-top));
    this.add.graphics().setDepth(-1).lineStyle(1,0xc9ceb0,0.45)
      .strokeRect(left,top,right-left,bottom-top);
    this.baseSpeed=this.player.speed;
    this.views=[];
    this.playerHp=new PlayerHealthBar(this.player);
    this.reactions=new TargetReactions(this,nearest);
    this.groundAreas=this.add.graphics().setDepth(-0.6);
    this.debug=this.add.graphics().setDepth(1000);
    this.bout=new CombatBout((victim,damage,point,{critical,status,actor,immune})=>{
      const sprite=victim==='enemy'?this.enemyView(actor).sprite:this.player;
      this.reactions.hit(sprite,critical,point,immune?'Immune':damage);
      if(!this.bout.playerHp)this.reactions.clearStatuses();
      else if(actor&&!actor.enemy.hp)this.reactions.clearStatuses(sprite);
      else if(actor&&status==='Slowed')this.reactions.apply(sprite,status,actor.slow.ms);
      if(status==='Cloud'&&!this.statusName)this.reactions.apply(sprite,'Poisoned',760);
    });
    this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels).setZoom(1.25).startFollow(this.player,true);
    const canvas=this.game.canvas;
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','Combat Sandbox arena');
    this.input.keyboard.disableGlobalCapture();
    const listeners=new AbortController(),{signal}=listeners;
    const aim=trackArenaAim(canvas,this.cameras.main,VFX_LAB_TARGET,{signal});
    this.loadout=new CombatLoadoutPanel(signal);
    this.skills=new CombatSkillRunner(this.bout,healed=>this.reactions.drainResult(this.player,healed));
    this.skillViews=new Map();
    const cast=slot=>this.skills.use(slot,this.loadout.state.slots,this.player,aim.capture);
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();
      canvas.focus({preventScroll:true});
      cast(0);
    },{signal});
    canvas.addEventListener('keydown',event=>{
      if(event.key.startsWith('Arrow'))event.preventDefault();
      const slot=slotShortcut(event);
      if(slot>0){event.preventDefault();cast(slot);}
    },{signal});
    canvas.addEventListener('blur',()=>this.input.keyboard.resetKeys(),{signal});
    const {start,pause,boxes,monster,composition,cloud,randomized,retreat,special}=this.controls;
    const syncAi=()=>{
      this.bout.ai={randomized:randomized.checked,antiKiting:retreat.checked,specialMode:special.value};
      special.disabled=!retreat.checked;
    };
    for(const control of [randomized,retreat,special])control.addEventListener('change',syncAi,{signal});
    syncAi();
    for(const [i,p] of MUSHROOM_BOSS.phases.entries())this.controls.bossPhase.add(new Option(p.name,String(i+1)));
    this.controls.bossPhase.addEventListener('change',()=>this.resetBout(),{signal});
    this.counts=new Map();
    monster.replaceChildren();
    for(const [kind,spec] of Object.entries(ENEMIES)){
      monster.add(new Option(spec.label,kind));
      const label=document.createElement('label'),select=document.createElement('select');
      label.append(spec.label+' ',select);
      composition.append(label);
      for(let i=0;i<=(spec.maxPerEncounter??MAX_PER_KIND);i++)select.add(new Option(String(i),String(i)));
      select.value=['slime','frost','big'].includes(kind)?'1':'0';
      this.counts.set(kind,select);
      select.addEventListener('change',()=>this.resetBout(),{signal});
    }
    monster.add(new Option('Mixed encounter','mixed'));
    start.addEventListener('click',()=>{
      this.resetBout();
      this.bout.started=true;
      canvas.focus({preventScroll:true});
    },{signal});
    monster.addEventListener('change',()=>this.resetBout(),{signal});
    cloud.addEventListener('change',()=>{
      this.bout.cloudEnabled=cloud.checked;
      if(!cloud.checked)this.bout.areas=this.bout.areas.filter(area=>area.kind!=='haze');
    },{signal});
    for(const toggle of [pause,boxes,cloud,randomized,retreat,special]){
      toggle.addEventListener('change',()=>canvas.focus({preventScroll:true}),{signal});
    }
    start.disabled=false;
    this.events.on(Phaser.Scenes.Events.POST_UPDATE,this.afterPhysics,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.events.off(Phaser.Scenes.Events.POST_UPDATE,this.afterPhysics,this);
      listeners.abort();
      this.clearSkills();
      this.reactions.clear();
      this.playerHp.destroy();
      this.clearViews();
      this.controls.bossPhase.replaceChildren();
      composition.querySelectorAll('label').forEach(label=>label.remove());
      start.disabled=true;
    });
    this.resetBout();
  }

  clearViews(){
    for(const {sprite,bar,effects} of this.views){
      bar.destroy();
      effects.destroy();
      sprite.destroy();
    }
    this.views=[];
  }

  resetBout(){
    this.clearSkills();
    this.reactions.clear();
    this.clearViews();
    this.statusName=null;
    const {monster,composition,cloud,cloudOption,start}=this.controls;
    const mixed=monster.value==='mixed';
    composition.hidden=!mixed;
    const kinds=mixed?Array.from(this.counts,([kind,select])=>Array(Number(select.value)).fill(kind)).flat():[monster.value];
    for(const select of this.counts.values()){
      for(const option of select.options){
        option.disabled=kinds.length-Number(select.value)+Number(option.value)>MAX_ENEMIES;
      }
    }
    start.disabled=kinds.length===0;
    this.controls.bossDebug.hidden=!kinds.includes('mushroom');
    this.bout.reset(kinds,Number(this.controls.bossPhase.value));
    this.bout.cloudEnabled=cloud.checked;
    cloudOption.hidden=!kinds.includes('slime');
    this.player.speed=this.baseSpeed;
    this.player.body.reset(VFX_LAB_PLAYER.x,VFX_LAB_PLAYER.y);
    this.player.body.updateFromGameObject();
    this.player.setAlpha(1).setDepth(this.player.y).setFacing('down');
    this.input.keyboard.resetKeys();
    this.drawBout();
  }

  enemyView(actor){
    if(this.views[actor.id])return this.views[actor.id];
    const key=actor.kind==='mushroom'?'mushroom-idle':'pfx-'+actor.kind;
    const atlas=MUSHROOM_SHEETS[key]??sheets[key];
    const sprite=this.add.sprite(actor.enemy.x,actor.enemy.y,key)
      .setOrigin(atlas.anchor[0]/atlas.width,atlas.anchor[1]/atlas.height);
    const bar=new PlayerHealthBar(sprite,{width:Math.round(35*actor.spec.size),height:4,offsetY:5});
    return this.views[actor.id]={sprite,atlas,bar,effects:new CombatArenaEffects(this,actor.kind,sheets)};
  }

  clearSkills(){
    this.skills.reset();
    for(const view of this.skillViews.values())view.destroy();
    this.skillViews.clear();
  }

  drawSkills(){
    for(const [action,view] of this.skillViews){
      if(!this.skills.actions.includes(action)){view.destroy();this.skillViews.delete(action);}
    }
    for(const action of this.skills.actions){
      if(!this.skillViews.has(action))this.skillViews.set(action,new CombatSkillView(this,action,nearest));
      this.skillViews.get(action).draw();
    }
    this.loadout.update(this.skills);
  }

  update(){
    this.player.speed=this.baseSpeed*this.bout.speedFactor*this.skills.castSpeed;
    if(this.bout.started&&!this.bout.finished&&!this.bout.stunMs&&document.activeElement===this.game.canvas){
      this.player.update();
    }else this.player.setVelocity(0,0).setFacing(this.player.facing,false);
  }

  afterPhysics(_time,delta){
    const dt=Math.min(delta,50);
    this.bout.update(dt,this.player,this.controls.pause.checked);
    this.skills.update(dt,this.player);
    this.drawSkills();
    const status=this.bout.finished?null:this.bout.stunMs?'Stunned':this.bout.speedFactor<1?'Slowed':this.bout.poison?'Poisoned':null;
    if(status!==this.statusName){
      this.reactions.clearStatuses(this.player);
      if(status)this.reactions.apply(this.player,status,Infinity);
      this.statusName=status;
    }
    this.reactions.update(dt,{pauseStatuses:this.controls.pause.checked});
    this.drawBout();
  }

  drawBout(){
    const {enemies,alive,playerHp,started,finished}=this.bout;
    const boxes=this.controls.boxes.checked;
    this.debug.clear();
    this.groundAreas.clear();
    for(const area of this.bout.areas)drawGroundArea(this.groundAreas,area);
    for(const actor of enemies){
      const {enemy,spec,shots}=actor;
      const {sprite,atlas,bar,effects}=this.enemyView(actor);
      const mushroom=actor.kind==='mushroom';
      const dying=!enemy.hp,fade=dying?Math.min(1,actor.elapsed/actor.deathMs):0;
      const pose=dying&&spec.deathPose!==undefined?spec.deathPose+fade*340:enemy.poseMs;
      sprite.setPosition(enemy.x,enemy.y).setDepth(enemy.y).setVisible(fade<1);
      const flip=enemy.facing<0;
      if(mushroom){
        const [key,frame]=mushroomPose(actor);
        const art=MUSHROOM_SHEETS[key];
        sprite.setTexture(key,frame).setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height)
          .setScale(spec.scale).setFlipX(flip).setAlpha(Math.min(1,(1-fade)*6));
        if(actor.boss.phase===MUSHROOM_BOSS.phases[2])sprite.setTint(0xffad9e);
        const mark=nextMark(actor),boss=actor.boss;
        const current=boss.event?.id?eventNames[boss.event.id]:null;
        const info=[boss.phase.name,mark?'Next '+mark+'%':'Final phase','Last: '+(boss.last??'—'),
          current?'Casting: '+current:null,boss.finalPending?'Enraged Big Slime awaiting space':null].filter(Boolean).join(' · ');
        if(this.controls.bossInfo.textContent!==info)this.controls.bossInfo.textContent=info;
      }else{
        const widthFactor=(enemy.stretchX??1)*(1+0.24*fade);
        sprite.setScale(spec.scale*widthFactor,spec.scale*(1-0.8*fade)).setAlpha(1-fade)
          .setFrame(Math.min(atlas.frameMs.length-1,Math.floor(pose/50)));
        if(actor.phase==='emerging')sprite.setAlpha(0.25+0.75*actor.elapsed/actor.emergeMs);
      }
      if(!mushroom&&flip!==sprite.flipX){
        const originX=atlas.anchor[0]/atlas.width;
        sprite.setFlipX(flip).setOrigin(flip?1-originX:originX,atlas.anchor[1]/atlas.height);
      }
      if(bar.current!==enemy.hp||bar.max!==spec.maxHp)bar.setHealth(enemy.hp,spec.maxHp).setVisible(!dying);
      bar.updatePosition();
      effects.draw(actor,dying&&this.bout.areas.find(area=>area.kind==='poison'&&area.sourceId===actor.id));
      if(boxes){
        const b=spec.box(enemy);
        if(enemy.hp)this.debug.lineStyle(1,0xffe38e,0.9).strokeRect(b.x,b.y,b.width,b.height);
        if(actor.phase==='bite'){
          const head=spec.biteCenter(enemy);
          this.debug.lineStyle(1,0xe7ff9a,0.9).strokeCircle(head.x,head.y,spec.bite.radius);
        }
        for(const shot of shots)this.debug.lineStyle(1,0xe7ff9a,0.9).strokeCircle(shot.x,shot.y,shot.radius);
      }
    }
    this.player.setAlpha(playerHp>0?1:0.35);
    if(this.playerHp.current!==playerHp||this.playerHp.max!==100)this.playerHp.setHealth(playerHp,100).setVisible(true);
    this.playerHp.updatePosition();
    const single=enemies.length===1?enemies[0]:null;
    const label=!enemies.length?'Choose an enemy':!started?'Ready':!playerHp?'Defeated':
      finished?'Victory':this.controls.pause.checked?'Enemy AI paused':!alive?'Survive the aftermath':
      single?.phase==='windup'?(single.spec.bite?.name??single.attack.leap?.name??
        (single.attack.kind==='jump'?single.spec.jumpName:attackNames[single.attack.kind])):'Fighting';
    const count=single?single.spec.label+' '+single.enemy.hp+'/'+single.spec.maxHp:
      alive+' alive · '+(enemies.length-alive)+' defeated';
    const text=label+' · Michael '+playerHp+'/100 · '+count;
    if(this.controls.status.textContent!==text)this.controls.status.textContent=text;
    const button=started?'Reset fight':'Start fight';
    if(this.controls.start.textContent!==button)this.controls.start.textContent=button;

    if(boxes){
      const a=playerBox(this.player),feet=playerFeetBox(this.player);
      this.debug.lineStyle(1,0x93d4ff,0.9).strokeRect(a.x,a.y,a.width,a.height)
        .strokeRect(feet.x,feet.y,feet.width,feet.height);
    }
  }
}
