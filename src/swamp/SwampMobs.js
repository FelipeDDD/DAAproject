import atlas from '../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
import { acquireAggro } from '../vfx/lab/combatAggro.js';
import { snakeCrawlPose } from '../vfx/lab/snakeEnemy.js';
import { CombatBout } from '../vfx/lab/CombatBout.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { CombatArenaEffects, drawGroundArea, drawSlimeDeathSpores } from '../vfx/lab/CombatArenaEffects.js';
import { drawCombatEnemySprite } from '../vfx/lab/combatEnemySprite.js';
import { PlayerHealthBar } from '../ui/PlayerHealthBar.js';
import { AmbushWarning } from './AmbushWarning.js';
import { SpawnEditor } from './SpawnEditor.js';
import { ReturnTrap, returnTrapAxis } from './ReturnTrap.js';
import { saveSwampRun } from './SwampRun.js';
import { SWAMP_AMBUSH, SWAMP_EMERGENCE, SWAMP_MOB_TERRAIN, swampEncounterSpawns } from './mobConfig.js';
import { alertSwampPack, createCombatSpace, createMobTerrain, findNearbyMobSpawn, SwampAmbush, SwampMob } from './mobMovement.js';

const textureKey = kind => 'swamp-mob-'+kind;
const artFor = kind => atlas['pfx-'+kind];
const MAX_TEST_MOBS = 8;
const COLORS = {snake:0xffcf73,frog:0xa3ed91,slime:0xa7caff};

function ambushController(spawn){
  return new SwampAmbush({trigger:spawn.trigger,warningMs:SWAMP_AMBUSH.warningMs,
    emergeMs:spawn.falseAlarm?0:SWAMP_EMERGENCE.durationMs});
}

export function preloadSwampMobs(scene){
  for(const kind of Object.keys(SWAMP_MOB_TERRAIN)){
    const {width,height,frameMs}=artFor(kind);
    const url=import.meta.env.BASE_URL+'tools/vfx-lab/sheets/pfx-'+kind+'.png';
    if(!scene.textures.exists(textureKey(kind)))scene.load.spritesheet(textureKey(kind),url,{
      frameWidth:width,frameHeight:height,endFrame:frameMs.length-1,
    });
  }
}

export class SwampMobs {
  constructor(scene,run){
    this.scene=scene;
    this.run=run;
    this.entries=[];
    this.vanquished=new Set();
    this.deathSpores=new Map();
    this.nextTestId=0;
    this.ambushes=[];
    const variant=Object.hasOwn(SWAMP_AMBUSH.variants,run?.ambushVariant)
      ?run.ambushVariant:SWAMP_AMBUSH.defaultVariant;
    this.terrain=Object.fromEntries(Object.entries(SWAMP_MOB_TERRAIN).map(([kind,{footRadius}])=>
      [kind,createMobTerrain(scene.collisionLayer,scene.physics.world.bounds,footRadius)]));
    this.terrain.marker=createMobTerrain(scene.collisionLayer,scene.physics.world.bounds,scene.playerFootRadius);
    const space=createCombatSpace(scene.collisionLayer,scene.physics.world.bounds);
    this.bout=new CombatBout((...hit)=>this.onHit?.(...hit),Math.random,Math.random,{space,continuous:true});
    this.groundAreas=scene.add.graphics().setDepth(-0.6);
    this.debug=scene.add.graphics().setDepth(scene.physics.world.bounds.height+5).setVisible(false);
    this.editor=new SpawnEditor(this,variant);
    this.createAdvancedControls();
    this.resetEncounter(run?.defeated);
  }

  resetEncounter(defeated=new Set(),{testing=false}={}){
    this.removeWhere(()=>true);
    this.clearDeathSpores();
    this.vanquished.clear();
    this.bout.reset([]);
    this.nextActorId=0;
    this.groundAreas.clear();
    this.resetAmbushState(defeated,testing?this.scene.player.body.center:undefined);
    const spawns=this.editor?.applied.spawns??swampEncounterSpawns();
    for(const spawn of spawns)if(!defeated.has(spawn.encounterId))this.add(spawn);
  }

  baseSpawns(){
    const {a,b}=SWAMP_AMBUSH.returnTrap;
    return [...swampEncounterSpawns(),...(SWAMP_AMBUSH.enabled?[SWAMP_AMBUSH.spawn,a,b]:[])];
  }

  resetAmbushState(defeated=this.run.defeated,feet){
    this.stopAmbushPreview();
    for(const ambush of this.ambushes)this.clearAmbushArt(ambush);
    const config=SWAMP_AMBUSH.returnTrap;
    this.ambushes=this.editor.applied.ambushes.filter(spawn=>!defeated?.has(spawn.encounterId)).map(spawn=>{
      const controller=ambushController(spawn);
      const trap=spawn.spawnType==='return-trap'?new ReturnTrap({...config,a:spawn.a,b:spawn.b}):null;
      if(feet&&!trap)controller.reset(feet);
      return {spawn,controller,trap,warning:null,sprite:null};
    });
  }

  add(spawn,test=false){
    const terrain=this.terrain[spawn.kind];
    const key=textureKey(spawn.kind);
    if(!terrain.clear(spawn)||!this.scene.textures.exists(key)){
      console.warn('[Swamp V3] Skipped mob spawn:',spawn.id,'– blocked ground or missing texture.');
      return null;
    }
    const mob=new SwampMob(this.bout,spawn,terrain,this.nextActorId++,{
      test,onAggro:(source,player)=>alertSwampPack(source,player,this.bout.enemies),
    });
    const sprite=this.scene.add.sprite(mob.enemy.x,mob.enemy.y,key,0);
    const art=artFor(mob.kind);
    sprite.setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height);
    const bar=new PlayerHealthBar(sprite,{width:35,height:4,offsetY:5});
    const effects=new CombatArenaEffects(this.scene,mob.kind,atlas);
    const entry={mob,sprite,bar,effects,art};
    this.entries.push(entry);
    this.bout.enemies.push(mob);
    this.render(entry);
    return mob;
  }

  render({mob,sprite,bar,effects,art}){
    drawCombatEnemySprite(sprite,art,mob);
    const {enemy,spec}=mob;
    const showHp=Boolean(enemy.hp&&(enemy.hp<spec.maxHp||this.debug.visible));
    if(bar.current!==enemy.hp||bar.max!==spec.maxHp)bar.setHealth(enemy.hp,spec.maxHp);
    if(bar.visible!==showHp)bar.setVisible(showHp);
    if(showHp)bar.updatePosition();
    effects.draw(mob,!enemy.hp&&this.bout.areas.find(area=>area.kind==='poison'&&area.sourceId===mob.id));
  }

  update(delta){
    const player=this.scene.player;
    for(const ambush of this.ambushes){
      if(ambush.controller.phase!=='revealed')this.updateAmbush(ambush,delta,player.body.center);
    }
    this.bout.update(delta,player);
    for(const entry of this.entries)this.render(entry);
    this.groundAreas.clear();
    for(const area of this.bout.areas)drawGroundArea(this.groundAreas,area);
    this.removeWhere(mob=>!mob.enemy.hp&&mob.elapsed>=mob.deathMs,{keepDeathFields:true});
    for(const [area,spores] of this.deathSpores){
      if(this.bout.areas.includes(area))drawSlimeDeathSpores(spores,area);
      else{
        spores.destroy();
        this.deathSpores.delete(area);
      }
    }
    if(this.debug.visible)this.drawDebug();
  }

  updateAmbush(ambush,delta,feet){
    const {spawn,controller,trap}=ambush;
    if(controller.phase==='hidden'&&(trap||spawn.falseAlarm)&&this.run.firedTraps.has(spawn.id))return;
    const canSee=()=>this.terrain[spawn.kind].sees(spawn,feet);
    const canLand=()=>{
      const radius=SWAMP_MOB_TERRAIN[spawn.kind].footRadius;
      return this.terrain[spawn.kind].clear(spawn)&&
        Math.hypot(feet.x-spawn.x,feet.y-spawn.y)>=radius+this.scene.playerFootRadius&&
        !this.entries.some(({mob})=>mob.enemy.hp&&Math.hypot(mob.enemy.x-spawn.x,mob.enemy.y-spawn.y)<radius+mob.footRadius);
    };
    let result;
    if(trap&&controller.phase==='hidden'){
      const inCombat=this.bout.enemies.some(mob=>mob.enemy.hp&&mob.aggro);
      if(!trap.sample(feet,{inCombat,canTrigger:canSee}))return;
      result=controller.beginWarning();
    }else{
      // Legacy circles retain their approach check. Authored zones can be away from the creature.
      const canTrigger=spawn.triggerShape||spawn.falseAlarm?()=>true:canSee;
      result=controller.update(delta,feet,canTrigger,canLand);
    }
    if(result==='warning'&&(trap||spawn.falseAlarm)){
      this.run.firedTraps.add(spawn.id);
      saveSwampRun(this.run);
    }
    this.drawAmbushPhase(ambush,result);
    if(result==='spawn'&&!spawn.falseAlarm){
      const mob=this.add(spawn.spawnType==='ambush'?{...spawn,detectionRange:undefined}:spawn);
      if(mob){
        mob.cooldown=Math.max(mob.cooldown,SWAMP_AMBUSH.returnTrap.reactionMs);
        acquireAggro(mob);
      }
    }
  }

  previewAmbush(spawn){
    this.stopAmbushPreview();
    const controller=ambushController(spawn);
    this.ambushPreview={spawn,controller,warning:null,sprite:null};
    this.drawAmbushPhase(this.ambushPreview,controller.beginWarning());
  }

  updateAmbushPreview(delta){
    const preview=this.ambushPreview;
    if(!preview)return;
    const result=preview.controller.update(delta);
    if(result==='spawn')this.stopAmbushPreview();
    else this.drawAmbushPhase(preview,result);
  }

  stopAmbushPreview(){
    if(this.ambushPreview)this.clearAmbushArt(this.ambushPreview);
    this.ambushPreview=null;
  }

  drawAmbushPhase(ambush,result){
    const {spawn,controller}=ambush;
    if(result==='warning'){
      const effect=spawn.falseAlarm?'foliage':spawn.kind==='frog'?'soft':'escalating';
      ambush.warning=new AmbushWarning(this.scene,spawn.visualOrigin,effect,SWAMP_AMBUSH.warningMs);
    }else if(result==='emerging'){
      this.clearAmbushArt(ambush);
      const art=artFor(spawn.kind);
      ambush.sprite=this.scene.add.sprite(spawn.visualOrigin.x,spawn.visualOrigin.y,textureKey(spawn.kind),0)
        .setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height);
    }else if(result==='spawn'||result==='cancel'){
      this.clearAmbushArt(ambush);
    }
    ambush.warning?.draw(controller.elapsed);
    if(ambush.sprite)this.drawEmerging(ambush);
  }

  drawEmerging({spawn,controller,sprite}){
    const origin=spawn.visualOrigin,elapsed=Math.min(controller.elapsed,SWAMP_EMERGENCE.durationMs);
    const t=elapsed/SWAMP_EMERGENCE.durationMs,spec=ENEMIES[spawn.kind];
    const poseMs=spawn.kind==='snake'?snakeCrawlPose(spec.poseMs,elapsed):900+540*t;
    drawCombatEnemySprite(sprite,artFor(spawn.kind),{spec,phase:'emerging',elapsed,emergeMs:SWAMP_EMERGENCE.durationMs,
      enemy:{x:origin.x+(spawn.x-origin.x)*t,y:origin.y+(spawn.y-origin.y)*t,
        facing:Math.sign(spawn.x-origin.x),hp:spec.maxHp,poseMs}});
  }

  createAdvancedControls(){
    const {editor}=this;
    const debug=editor.checkbox('Show mob HP and attack state',false,()=>this.syncEditorDebug());
    this.debugToggle=debug.input;
    const select=document.createElement('select');
    select.setAttribute('aria-label','Test mob');
    for(const kind of Object.keys(SWAMP_MOB_TERRAIN))select.add(new Option(ENEMIES[kind].label,kind));
    this.state=document.createElement('div');
    this.state.hidden=true;
    const controls=document.createElement('div');
    controls.className='swamp-run-controls';
    controls.append(select,editor.button('Spawn nearby',()=>editor.report(this.spawnTest(select.value))),
    editor.button('Clear test mobs',()=>{
      this.removeWhere(mob=>mob.test);
      this.clearDeathSpores(area=>area.testSource);
      editor.report('Test mobs cleared.');
    }),editor.button('Reset ambushes',()=>{
      const ids=new Set(this.ambushes.map(({spawn})=>spawn.id));
      this.removeWhere(mob=>ids.has(mob.spawnId));
      this.resetAmbushState();
      editor.report('Ambushes reset. Restart run to rearm spent Return Traps and False Alarms.');
    }));

    editor.advanced.append(debug.label,controls,this.state);
  }

  syncEditorDebug(){
    const editor=this.editor;
    if(!editor)return;
    const technical=editor.open&&this.debugToggle.checked;
    this.state.hidden=!technical;
    this.debug.setVisible(editor.open);
    if(this.debug.visible)this.drawDebug();
  }

  spawnTest(kind){
    if(this.entries.filter(({mob})=>mob.test).length>=MAX_TEST_MOBS)return 'Clear test mobs to spawn more.';
    const point=findNearbyMobSpawn(this.scene.player.body.center,this.terrain[kind],
      this.entries.map(({mob})=>mob),SWAMP_MOB_TERRAIN[kind].footRadius);
    if(!point)return 'No clear spot nearby.';
    return this.add({id:'test-'+ ++this.nextTestId,kind,...point},true)
      ? 'Test '+ENEMIES[kind].label+' spawned.' : 'Test mob could not be spawned.';
  }

  drawDebug(){
    const g=this.debug.clear();
    const {editor}=this;
    for(const mark of editor.edits.entries()){
      if(mark.marker||(!editor.showSpawns&&mark.id!==editor.selected))continue;
      const selected=mark.id===editor.selected;
      const size=selected?10:5;
      if(mark.falseAlarm){
        const {x,y}=editor.edits.event(mark).visualOrigin;
        if(!selected)g.lineStyle(1,0xa6ea70,0.8).strokeCircle(x,y,7);
      }else{
        g.lineStyle(selected?2:1,selected?0xffffff:COLORS[mark.kind],mark.disabled?0.35:0.9)
          .lineBetween(mark.x-size,mark.y,mark.x+size,mark.y)
          .lineBetween(mark.x,mark.y-size,mark.x,mark.y+size);
      }
      if(selected){
        if(editor.showRanges&&mark.spawnType==='proximity'){
          const range=mark.detectionRange??ENEMIES[mark.kind].detectionRange;
          g.fillStyle(0x77d7ff,0.12).fillCircle(mark.x,mark.y,range)
            .lineStyle(2,0x77d7ff,0.85).strokeCircle(mark.x,mark.y,range);
        }
        if(mark.spawnType!=='proximity')this.drawAmbushMarkers(editor.edits.event(mark));
      }
    }
    if(!this.debugToggle.checked)return;
    for(const {mob} of this.entries)if(mob.enemy.hp)g.lineStyle(1.5,COLORS[mob.kind],0.85)
      .strokeCircle(mob.enemy.x,mob.enemy.y,mob.footRadius);
    const events=this.ambushes.map(({spawn,controller,trap})=>spawn.id+': '+(controller.phase==='hidden'
      ?(this.run.firedTraps.has(spawn.id)?'used':trap?.phase??controller.phase):controller.phase));
    const status=[...events,...this.entries.map(
      ({mob})=>{
        const shot=mob.lastShot;
        return mob.spawnId+' '+mob.navigation.state+'/'+mob.phase+' '+mob.enemy.hp+'/'+mob.spec.maxHp+
          (shot?` · Last fired: ${shot.kind} (${shot.reason})`:'');
      },
    )].join(' · ');
    if(status!==this.state.textContent)this.state.textContent=status;
  }

  removeWhere(predicate,{keepDeathFields=false}={}){
    const removed=new Set();
    this.entries=this.entries.filter(({mob,sprite,bar,effects})=>{
      if(!predicate(mob))return true;
      removed.add(mob);
      if(keepDeathFields&&effects.spores){
        const patch=this.bout.areas.find(area=>area.kind==='poison'&&area.sourceId===mob.id);
        if(patch){
          patch.testSource=mob.test;
          this.deathSpores.set(patch,effects.spores);
          effects.spores=null;
        }
      }
      bar.destroy();
      effects.destroy();
      sprite.destroy();
      return false;
    });
    if(removed.size){
      this.bout.enemies=this.bout.enemies.filter(mob=>!removed.has(mob));
      const ids=new Set([...removed].map(mob=>mob.id));
      this.bout.areas=this.bout.areas.filter(area=>!ids.has(area.sourceId)||this.deathSpores.has(area));
    }
  }

  clearDeathSpores(predicate=()=>true){
    for(const [area,spores] of this.deathSpores){
      if(!predicate(area))continue;
      spores.destroy();
      this.deathSpores.delete(area);
      this.bout.areas=this.bout.areas.filter(candidate=>candidate!==area);
    }
  }

  drawAmbushMarkers({visualOrigin:origin,x,y,spawnType,falseAlarm,trigger,a,b}){
    const g=this.debug;
    g.lineStyle(2,0xa6ea70,0.9).strokeCircle(origin.x,origin.y,7);
    if(!falseAlarm)g.lineBetween(origin.x,origin.y,x,y);
    if(spawnType==='ambush'){
      if(!this.editor.showRanges)return;
      g.fillStyle(0xffc36c,0.12).lineStyle(2,0xffc36c,0.85);
      if(trigger.shape==='rectangle'){
        const {x,y,width,height}=trigger;
        g.fillRect(x-width/2,y-height/2,width,height).strokeRect(x-width/2,y-height/2,width,height);
      }else g.fillCircle(trigger.x,trigger.y,trigger.radius).strokeCircle(trigger.x,trigger.y,trigger.radius);
    }else if(a&&b){
      const axis=returnTrapAxis(a,b),width=SWAMP_AMBUSH.returnTrap.halfWidth;
      const dx=-axis.y*width,dy=axis.x*width;
      g.lineStyle(1,0xffdb93,0.5).lineBetween(a.x,a.y,b.x,b.y);
      for(const [gate,color] of [[a,0x66ddff],[b,0xfda455]]){
        g.lineStyle(2,color,0.95).lineBetween(gate.x-dx,gate.y-dy,gate.x+dx,gate.y+dy);
      }
    }
  }

  clearAmbushArt(ambush){
    ambush.warning?.destroy();
    ambush.sprite?.destroy();
    ambush.warning=null;
    ambush.sprite=null;
  }

  destroy(){
    this.stopAmbushPreview();
    this.editor.destroy();
    for(const ambush of this.ambushes)this.clearAmbushArt(ambush);
    this.removeWhere(()=>true);
    this.clearDeathSpores();
    this.debug.destroy();
    this.groundAreas.destroy();
  }
}
