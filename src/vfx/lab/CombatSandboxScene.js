import Phaser from 'phaser';
import { Player } from '../../entities/Player.js';
import { PlayerHealthBar } from '../../ui/PlayerHealthBar.js';
import { characterById } from '../../characters.js';
import { createCharacterAnimations, preloadCharacterTextures } from '../../characterVisuals.js';
import { createPlaceholderTextures } from '../../art/placeholders.js';
import { preloadTiledMap, createTiledWorld } from '../../maps/tiledWorld.js';
import { addMapCollision } from '../../maps/collision.js';
import { createCombatSpace,readFootObstacles } from '../../maps/footCollision.js';
import { trackArenaAim } from './ArenaAim.js';
import { bindArenaInput } from './arenaInput.js';
import { CombatSkillRunner } from './CombatSkillRunner.js';
import { CombatSkillView,combatSheets } from './CombatSkillView.js';
import { CombatParryView } from './CombatParryView.js';
import { CombatLoadoutPanel } from './CombatLoadoutPanel.js';
import { SkillEditor } from './SkillEditor.js';
import { CombatEditorState } from './CombatEditorState.js';
import { CombatSaveDialog } from './CombatSaveDialog.js';
import { BalanceEditor } from './BalanceEditor.js';
import { slotShortcut } from './combatLoadout.js';
import { preloadLabSheets } from './SheetSequence.js';

import { TargetReactions } from './targetReactions.js';
import { CombatBout,MAX_ENEMIES,MAX_PER_KIND } from './CombatBout.js';
import { ENEMIES } from './combatEnemy.js';
import { drawMushroomSprite, MUSHROOM_SHEETS, preloadMushroomSheets } from './mushroomArt.js';
import { nextMark,MUSHROOM_BOSS,eventNames } from './mushroomBoss.js';
import { labSheets } from './sheetCatalog.js';
import { CombatArenaEffects,drawGroundArea } from './CombatArenaEffects.js';
import { drawCombatEnemySprite } from './combatEnemySprite.js';
import { RING,playerBox,playerFeetBox } from './combatGeometry.js';
import { lashPrecisionBox } from './precisionDemo.js';
import { VFX_LAB_MAP,VFX_LAB_PLAYER,VFX_LAB_TARGET } from './layout.js';
import combatArt from '../../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
const sheets={...combatArt,'pfx-spores':labSheets['pfx-spores']};

const nearest=Phaser.Textures.FilterMode.NEAREST;
const character=characterById('michael');
const attackNames={jump:'Jump Attack',poison:'Poison Shot',frost:'Ice Shard',glob:'Heavy Glob',bolt:'Spectral Bolt',haunt:'Haunt',
  homing:'Homing Shot',spread:'Spread Volley',spore:'Spore Burst',bloom:'Toxic Bloom'};
const lashResults={
  miss:{label:'Miss',color:0xfd7f83},
  normal:{label:'Normal Hit',color:0xffe38e},
  precision:{label:'Precision Hit',color:0x81edca},
  critical:{label:'Critical Hit',color:0xea91ff},
};
const precisionBoxColor=0x73c9f5;
const LASH_DEBUG_MS=750;


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
    preloadMushroomSheets(this);
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
    this.lashDebugLabel=this.add.text(0,0,'',{
      fontSize:'12px',fontStyle:'bold',stroke:'#201a24',strokeThickness:3,resolution:2,
    }).setOrigin(0.5,1).setDepth(1001).setVisible(false);
    this.bout=new CombatBout((victim,damage,point,{critical,status,actor,immune,reaction})=>{
      const sprite=victim==='enemy'?this.enemyView(actor).sprite:this.player;
      this.reactions.hit(sprite,critical,point,immune?'Immune':Number(damage.toFixed(2)));
      if(!this.bout.playerHp)this.reactions.clearStatuses();
      else if(actor&&!actor.enemy.hp)this.reactions.clearStatuses(sprite);
      else if(actor&&status==='Slowed')this.reactions.apply(sprite,status,actor.slow.ms);
      else if(actor&&reaction)this.reactions.apply(sprite,reaction,420,{group:reaction});
      if(status==='Cloud'&&!this.statusName)this.reactions.apply(sprite,'Poisoned',760);
    },undefined,undefined,{allowParry:true,onLashImpact:impact=>{
      if(this.controls.boxes.checked)this.lashImpact={...impact,expiresAt:this.time.now+LASH_DEBUG_MS};
    }});
    this.cameras.main.setBounds(0,0,map.widthInPixels,map.heightInPixels).setZoom(1.25).startFollow(this.player,true);
    const canvas=this.game.canvas;
    const listeners=new AbortController(),{signal}=listeners;
    const aim=trackArenaAim(canvas,this.cameras.main,VFX_LAB_TARGET,{signal});
    this.loadout=new CombatLoadoutPanel(signal,id=>this.skillEditor.open(id));
    this.editorState=new CombatEditorState(this.loadout,signal);
    const saveDialog=new CombatSaveDialog(this.editorState,signal);
    this.skillEditor=new SkillEditor(this,document.getElementById('combat-skill-editor'),
      document.getElementById('combat-library-view'),this.editorState,saveDialog,signal);
    this.balanceEditor=new BalanceEditor(this,document.getElementById('combat-balance'),this.editorState,saveDialog,signal);
    void this.editorState.restore(null,{initial:true}).then(message=>{
      if(message&&!signal.aborted)this.balanceEditor.report(message);
    });
    const showHeal=healed=>this.reactions.drainResult(this.player,Number(healed.toFixed(2)));
    this.skills=new CombatSkillRunner(this.bout,showHeal,{
      sentrySpace:createCombatSpace(readFootObstacles(this.source),RING),
      onParryComplete:({blocked,healed})=>{
        this.reactions.parryResult(this.player,Number(blocked.toFixed(2)));
        if(healed>0)showHeal(healed);
      },
    });
    this.skillViews=new Map();
    this.parryView=new CombatParryView(this);
    const cast=slot=>{
      if(this.skills.use(slot,this.loadout.equipped,this.player,aim.capture)&&this.bout.defending)this.drawSkills();
    };
    this.focusArena=bindArenaInput(this,{
      label:'Combat Sandbox arena',onPointer:()=>cast(0),
      onKey:event=>{
        const slot=slotShortcut(event);
        if(slot>0){event.preventDefault();cast(slot);}
      },
    },signal);
    const {start,reset,monster,composition,cloud,randomized,retreat,special}=this.controls;
    cloud.checked=this.bout.cloudEnabled;
    randomized.checked=this.bout.ai.randomized;
    retreat.checked=this.bout.ai.antiKiting;
    special.value=this.bout.ai.specialMode;
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
    for(const button of [start,reset])button.addEventListener('click',()=>this.startBout(),{signal});
    monster.addEventListener('change',()=>this.resetBout(),{signal});
    cloud.addEventListener('change',()=>{
      this.bout.cloudEnabled=cloud.checked;
      if(!cloud.checked)this.bout.areas=this.bout.areas.filter(area=>area.kind!=='haze');
    },{signal});
    this.events.on(Phaser.Scenes.Events.POST_UPDATE,this.afterPhysics,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.events.off(Phaser.Scenes.Events.POST_UPDATE,this.afterPhysics,this);
      listeners.abort();
      this.clearSkills();
      this.parryView.destroy();
      this.reactions.clear();
      this.playerHp.destroy();
      this.clearViews();
      this.controls.bossPhase.replaceChildren();
      composition.querySelectorAll('label').forEach(label=>label.remove());
      start.disabled=reset.disabled=true;
    });
    this.resetBout();
    this.events.once(Phaser.Scenes.Events.CREATE,this.controls.ready);
  }

  startBout(){
    if(!this.sys.isActive()||!this.bout.enemies.length)return false;
    this.resetBout();
    this.bout.started=true;
    this.drawBout();
    this.focusArena();
    return true;
  }

  clearViews(){
    this.views.forEach(view=>this.destroyEnemyView(view));
    this.views=[];
  }

  destroyEnemyView({sprite,bar,effects}){
    this.reactions.clear(sprite);
    bar.destroy();
    effects.destroy();
    sprite.destroy();
  }

  resetBout(){
    this.clearSkills();
    this.reactions.clear();
    this.clearViews();
    this.statusName=null;
    this.lashImpact=null;
    const {monster,composition,cloud,cloudOption}=this.controls;
    const mixed=monster.value==='mixed';
    composition.hidden=!mixed;
    const kinds=mixed?Array.from(this.counts,([kind,select])=>Array(Number(select.value)).fill(kind)).flat():[monster.value];
    for(const select of this.counts.values()){
      for(const option of select.options){
        option.disabled=kinds.length-Number(select.value)+Number(option.value)>MAX_ENEMIES;
      }
    }
    this.controls.bossDebug.hidden=!kinds.includes('mushroom');
    this.bout.reset(kinds,Number(this.controls.bossPhase.value));
    this.drawSkills();
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
    this.bout.parry=null;
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
    this.parryView.draw(this.player,this.bout.parry,this.controls.parryVisual.value);
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
    this.drawBout();
    this.reactions.update(dt,{pauseStatuses:this.controls.pause.checked});
  }

  drawBout(){
    const {enemies,alive,playerHp,started,finished}=this.bout;
    this.views.forEach((view,id)=>{
      if(enemies.some(actor=>actor.id===id))return;
      this.destroyEnemyView(view);
      delete this.views[id];
    });
    const boxes=this.controls.boxes.checked;
    this.debug.clear();
    this.groundAreas.clear();
    for(const area of this.bout.areas)drawGroundArea(this.groundAreas,area);
    for(const actor of enemies){
      const {enemy,spec,shots}=actor;
      const view=this.enemyView(actor);
      const {sprite,atlas,bar,effects}=view;
      const mushroom=actor.kind==='mushroom';
      const dying=!enemy.hp;
      if(mushroom){
        drawMushroomSprite(sprite,actor);
        const mark=nextMark(actor),boss=actor.boss;
        const current=boss.event?.id?eventNames[boss.event.id]:null;
        const info=[boss.phase.name,mark?'Next '+mark+'%':'Final phase','Last: '+(boss.last??'—'),
          current?'Casting: '+current:null,boss.pendingSummons.length?boss.pendingSummons.length+' summons pending':null].filter(Boolean).join(' · ');
        if(this.controls.bossInfo.textContent!==info)this.controls.bossInfo.textContent=info;
      }else drawCombatEnemySprite(sprite,atlas,actor);
      if(view.burning!==actor.burning){
        if(actor.burning)this.reactions.apply(sprite,'Burning',Infinity,{group:'Burning'});
        else this.reactions.clearStatuses(sprite,'Burning');
        view.burning=actor.burning;
      }
      if(bar.current!==enemy.hp||bar.max!==spec.maxHp)bar.setHealth(enemy.hp,spec.maxHp).setVisible(!dying);
      bar.updatePosition();
      effects.draw(actor,dying&&this.bout.areas.find(area=>area.kind==='poison'&&area.sourceId===actor.id),this.player);
      if(boxes){
        if(enemy.hp){
          const b=spec.box(enemy),inner=lashPrecisionBox(b);
          this.debug.lineStyle(1,0xffe38e,0.9).strokeRect(b.x,b.y,b.width,b.height)
            .lineStyle(1,precisionBoxColor,0.8).strokeRect(inner.x,inner.y,inner.width,inner.height);
        }
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
    const text=label+' · Michael '+Number(playerHp.toFixed(2))+'/100 · '+count;
    if(this.controls.status.textContent!==text)this.controls.status.textContent=text;
    this.controls.start.disabled=started||!enemies.length;
    this.controls.reset.disabled=!started||!enemies.length;

    if(boxes){
      const a=playerBox(this.player),feet=playerFeetBox(this.player);
      this.debug.lineStyle(1,0x93d4ff,0.9).strokeRect(a.x,a.y,a.width,a.height)
        .strokeRect(feet.x,feet.y,feet.width,feet.height);
    }
    this.drawLashDebug(boxes);
  }

  drawLashDebug(boxes){
    const impact=this.lashImpact;
    const visible=Boolean(boxes&&impact&&this.time.now<impact.expiresAt);
    this.lashDebugLabel.setVisible(visible);
    if(!visible)return;
    const {tip:{x,y},radius,targets}=impact;
    for(const {box,precisionBox,result} of targets){
      if(result==='miss')continue;
      this.debug.lineStyle(2,lashResults[result].color,0.65).strokeRect(box.x,box.y,box.width,box.height)
        .lineStyle(1,precisionBoxColor,0.95).strokeRect(precisionBox.x,precisionBox.y,precisionBox.width,precisionBox.height);
    }
    const result=['critical','precision','normal'].find(value=>targets.some(target=>target.result===value))??'miss';
    const {color,label}=lashResults[result];
    this.debug.lineStyle(1,color).strokeCircle(x,y,radius).lineBetween(x-6,y,x+6,y).lineBetween(x,y-6,x,y+6);
    const left=x>this.cameras.main.worldView.centerX;
    this.lashDebugLabel.setText(label).setColor('#'+color.toString(16))
      .setOrigin(left?1:0,0.5).setPosition(x+(left?-18:18),y+4);
  }
}
