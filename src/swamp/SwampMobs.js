import atlas from '../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
import { slimeHopPose } from '../vfx/lab/slimeEnemy.js';
import { acquireAggro } from '../vfx/lab/combatAggro.js';
import { snakeCrawlPose } from '../vfx/lab/snakeEnemy.js';
import { CombatBout } from '../vfx/lab/CombatBout.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { CombatArenaEffects, drawGroundArea, drawSlimeDeathSpores } from '../vfx/lab/CombatArenaEffects.js';
import { drawCombatEnemySprite } from '../vfx/lab/combatEnemySprite.js';
import { drawMushroomSprite, MUSHROOM_SHEETS, preloadMushroomSheets } from '../vfx/lab/mushroomArt.js';
import { initMushroomBoss } from '../vfx/lab/mushroomBoss.js';
import { labSheets } from '../vfx/lab/sheetCatalog.js';
import { PlayerHealthBar } from '../ui/PlayerHealthBar.js';
import { resolveSpawn } from '../maps/tiledObjects.js';
import { AmbushWarning } from './AmbushWarning.js';
import { SpawnEditor } from './SpawnEditor.js';
import { WATER_RIPPLES_DECOY } from './spawnEdits.js';
import { ReturnTrap, returnTrapAxis } from './ReturnTrap.js';
import { saveSwampRun } from './SwampRun.js';
import { AMBUSH_DEFAULT_COOLDOWN_SECONDS, SWAMP_AMBUSH, SWAMP_EMERGENCE, SWAMP_ENCOUNTER_TERRAIN, SWAMP_MOB_TERRAIN, swampEncounterSpawns, swampEditorSpawns } from './mobConfig.js';
import { SWAMP_MINI_BOSS } from './runConfig.js';
import { alertSwampPack, createCombatSpace, createSwampSpawnTerrain, findNearbyMobSpawn, SwampAmbush, SwampMob } from './mobMovement.js';

const textureKey = kind => kind==='mushroom'?'mushroom-idle':'swamp-mob-'+kind;
const artFor = kind => kind==='mushroom'?MUSHROOM_SHEETS['mushroom-idle']:atlas['pfx-'+kind];
const effectSheets={...atlas,'pfx-spores':labSheets['pfx-spores']};
const MAX_TEST_MOBS = 8;
const COLORS = {snake:0xffcf73,frog:0xa3ed91,slime:0xa7caff};

function ambushController(spawn){
  const {durationMs,staggerMs}=SWAMP_EMERGENCE;
  return new SwampAmbush({trigger:spawn.trigger,warningMs:SWAMP_AMBUSH.warningMs,
    emergeMs:spawn.falseAlarm?0:durationMs+((spawn.quantity??1)-1)*staggerMs});
}

export function preloadSwampMobs(scene){
  const sheets=Object.keys(SWAMP_MOB_TERRAIN).map(kind=>['pfx-'+kind,textureKey(kind)]);
  sheets.push(['pfx-frost-nova','pfx-frost-nova'],['pfx-big',textureKey('big')],['pfx-swift',textureKey('swift')],['pfx-spores','pfx-spores']);
  for(const [asset,key] of sheets){
    const {width,height,frameMs}=effectSheets[asset];
    const url=import.meta.env.BASE_URL+'tools/vfx-lab/sheets/'+asset+'.png';
    if(!scene.textures.exists(key))scene.load.spritesheet(key,url,{
      frameWidth:width,frameHeight:height,endFrame:frameMs.length-1,
    });
  }
  preloadMushroomSheets(scene);
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
    this.terrain=createSwampSpawnTerrain(scene.collisionLayer,scene.physics.world.bounds,scene.playerFootRadius,resolveSpawn(scene.source));
    const space=createCombatSpace(scene.collisionLayer,scene.physics.world.bounds);
    const mushroomArena={
      bounds:SWAMP_MINI_BOSS.arena,
      clear:point=>this.terrain.marker.clear(point),
      canProject:(from,to)=>this.terrain.marker.canReach(from,to),
      canSummon:(owner,kind,point,others)=>{
        const radius=(SWAMP_MOB_TERRAIN[kind]??SWAMP_ENCOUNTER_TERRAIN[kind]).footRadius;
        return others.every(other=>Math.hypot(other.enemy.x-point.x,other.enemy.y-point.y)>=radius+other.footRadius)&&
          this.terrain[kind].canReach(owner.enemy,point);
      },
      createSummon:(owner,kind,point,combat)=>this.add({
        id:owner.spawnId+':summon',encounterId:owner.encounterId,kind,...point,combat,
      }),
    };
    this.bout=new CombatBout((...hit)=>this.onHit?.(...hit),Math.random,Math.random,{space,continuous:true,mushroomArena});
    this.groundAreas=scene.add.graphics().setDepth(-0.6);
    this.debug=scene.add.graphics().setDepth((scene.ambushLeafDepth??scene.physics.world.bounds.height+1)+4).setVisible(false);
    this.editor=new SpawnEditor(this,variant);
    this.createAdvancedControls();
    this.resetEncounter(run?.defeated);
  }

  resetEncounter(defeated=new Set(),{testing=false}={}){
    this.removeWhere(()=>true);
    this.clearDeathFields();
    this.vanquished.clear();
    this.bout.reset([]);
    this.nextActorId=0;
    this.groundAreas.clear();
    this.resetAmbushState(defeated,testing?this.scene.player.body.center:undefined);
    const spawns=this.editor?.applied.spawns??swampEncounterSpawns();
    for(const spawn of spawns)if(!defeated.has(spawn.encounterId))this.add(spawn);
  }

  baseSpawns(){
    return swampEditorSpawns();
  }

  resetAmbushState(defeated=this.run.defeated,feet){
    this.stopAmbushPreview();
    for(const ambush of this.ambushes)this.clearAmbushArt(ambush);
    const config=SWAMP_AMBUSH.returnTrap;
    this.ambushes=this.editor.applied.ambushes.filter(spawn=>!defeated?.has(spawn.encounterId)).map(spawn=>{
      const controller=ambushController(spawn);
      const {a,b,gateALength,gateBLength}=spawn;
      const trap=spawn.spawnType==='return-trap'?new ReturnTrap({...config,a,b,gateALength,gateBLength}):null;
      if(feet&&!trap)controller.reset(feet);
      return {spawn,controller,trap,
        waitingRepeat:spawn.repeat&&this.run.ambushReadyAt.has(spawn.id)};
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
    if(spawn.kind==='mushroom')initMushroomBoss(mob,1);
    const sprite=this.scene.add.sprite(mob.enemy.x,mob.enemy.y,key,0);
    const art=artFor(mob.kind);
    sprite.setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height);
    const bar=new PlayerHealthBar(sprite,{width:spawn.combat?Math.round(35*mob.spec.size):35,height:4,offsetY:5});
    const effects=new CombatArenaEffects(this.scene,mob.kind,effectSheets);
    const entry={mob,sprite,bar,effects,art};
    this.entries.push(entry);
    this.bout.enemies.push(mob);
    this.render(entry);
    return mob;
  }

  render({mob,sprite,bar,effects,art}){
    if(mob.boss)drawMushroomSprite(sprite,mob);
    else drawCombatEnemySprite(sprite,art,mob);
    const {enemy,spec}=mob;
    const showHp=Boolean(!mob.miniBoss&&enemy.hp&&(enemy.hp<spec.maxHp||this.debug.visible));
    if(bar.current!==enemy.hp||bar.max!==spec.maxHp)bar.setHealth(enemy.hp,spec.maxHp);
    if(bar.visible!==showHp)bar.setVisible(showHp);
    if(showHp)bar.updatePosition();
    effects.draw(mob,!enemy.hp&&this.bout.areas.find(area=>area.kind==='poison'&&area.sourceId===mob.id),this.scene.player);
  }

  update(delta){
    const player=this.scene.player;
    const now=Date.now();
    for(const ambush of this.ambushes){
      this.updateAmbush(ambush,delta,player.body.center,now);
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

  updateAmbush(ambush,delta,feet,now=Date.now()){
    const {spawn,controller,trap}=ambush;
    const wasInside=ambush.inside;
    if(spawn.repeat&&!trap)ambush.inside=controller.contains(feet);
    if(controller.phase==='hidden'||controller.phase==='revealed'){
      if(spawn.repeat&&ambush.waitingRepeat){
        if(now<this.run.ambushReadyAt.get(spawn.id)||this.entries.some(({mob})=>mob.spawnId===spawn.id))return;
        ambush.waitingRepeat=false;
        controller.reset(spawn.falseAlarm||wasInside===false?undefined:feet);
        trap?.reset();
      }else if(controller.phase==='revealed'||(!spawn.repeat&&this.run.firedTraps.has(spawn.id)))return;
    }
    const canSee=()=>this.terrain[spawn.kind].sees(spawn,feet);
    const canLand=()=>{
      const radius=SWAMP_MOB_TERRAIN[spawn.kind].footRadius;
      return ambush.landings.length===(spawn.quantity??1)&&ambush.landings.every(point=>
        this.terrain[spawn.kind].clear(point)&&
        Math.hypot(feet.x-point.x,feet.y-point.y)>=radius+this.scene.playerFootRadius&&
        !this.entries.some(({mob})=>mob.enemy.hp&&Math.hypot(mob.enemy.x-point.x,mob.enemy.y-point.y)<radius+mob.footRadius));
    };
    let result;
    if(trap&&controller.phase==='hidden'){
      const inCombat=this.bout.enemies.some(mob=>mob.enemy.hp&&mob.aggro);
      if(!trap.sample(feet,{inCombat,canTrigger:canSee}))return;
      result=controller.beginWarning();
    }else{
      result=controller.update(delta,feet,()=>true,canLand);
    }
    if(result==='warning'){
      if(spawn.repeat){
        this.run.ambushReadyAt.set(spawn.id,now+(spawn.cooldownSeconds??AMBUSH_DEFAULT_COOLDOWN_SECONDS)*1000);
        ambush.waitingRepeat=true;
      }else this.run.firedTraps.add(spawn.id);
      saveSwampRun(this.run);
    }
    if(result==='emerging')ambush.landings=this.ambushLandings(spawn);
    this.drawAmbushPhase(ambush,result);
    if(result==='spawn'&&!spawn.falseAlarm){
      for(const point of ambush.landings){
        const mob=this.add({...spawn,...point,detectionRange:trap?spawn.detectionRange:undefined});
        if(mob){
          mob.cooldown=Math.max(mob.cooldown,SWAMP_AMBUSH.returnTrap.reactionMs);
          acquireAggro(mob);
        }
      }
    }
  }

  ambushLandings(spawn){
    // Keep the authored landing. Companions look for a nearby spot reachable
    // by the same footprint, without crossing another wall or stacking feet.
    const {x,y,kind,quantity=1,visualOrigin}=spawn;
    const points=[{x,y}];
    if(quantity===1)return points;
    const radius=SWAMP_MOB_TERRAIN[kind].footRadius;
    const gap=2*radius+4,terrain=this.terrain[kind];
    const side=Math.atan2(y-visualOrigin.y,x-visualOrigin.x)+Math.PI/2;
    for(const offset of [gap,gap+radius]){
      for(let i=0;i<12;i++){
        const angle=side+Math.floor(i/2)*Math.PI/6+(i%2)*Math.PI;
        const target={x:x+Math.cos(angle)*offset,y:y+Math.sin(angle)*offset};
        if(points.some(point=>Math.hypot(point.x-target.x,point.y-target.y)<gap-0.01)||
          !terrain.canReach(spawn,target))continue;
        points.push(target);
        if(points.length===quantity)return points;
      }
    }
    return points;
  }

  previewAmbush(spawn){
    this.stopAmbushPreview();
    const controller=ambushController(spawn);
    this.ambushPreview={spawn,controller};
    this.drawAmbushPhase(this.ambushPreview,controller.beginWarning());
  }

  updateAmbushPreview(delta){
    const preview=this.ambushPreview;
    if(!preview)return;
    const result=preview.controller.update(delta);
    if(result==='emerging')preview.landings=this.ambushLandings(preview.spawn);
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
      const water=spawn.waterLeap||spawn.falseAlarm&&spawn.decoyType===WATER_RIPPLES_DECOY;
      const effect=water?'water':spawn.falseAlarm?'foliage':spawn.kind==='frog'?'soft':'escalating';
      ambush.warning=new AmbushWarning(this.scene,spawn.visualOrigin,effect,SWAMP_AMBUSH.warningMs);
    }else if(result==='emerging'){
      this.clearAmbushArt(ambush);
      const art=artFor(spawn.kind);
      ambush.sprites=ambush.landings.map(()=>this.scene.add.sprite(spawn.visualOrigin.x,spawn.visualOrigin.y,textureKey(spawn.kind),0)
        .setOrigin(art.anchor[0]/art.width,art.anchor[1]/art.height));
    }else if(result==='spawn'||result==='cancel'){
      this.clearAmbushArt(ambush);
    }
    ambush.warning?.draw(controller.elapsed);
    ambush.sprites?.forEach((sprite,i)=>{
      const elapsed=controller.elapsed-i*SWAMP_EMERGENCE.staggerMs;
      if(elapsed<0)sprite.setVisible(false);
      else this.drawEmerging(spawn,ambush.landings[i],sprite,elapsed);
    });
  }

  drawEmerging(spawn,point,sprite,time){
    const origin=spawn.visualOrigin,elapsed=Math.min(time,SWAMP_EMERGENCE.durationMs);
    const t=elapsed/SWAMP_EMERGENCE.durationMs,spec=ENEMIES[spawn.kind];
    const poseMs=spawn.kind==='snake'?snakeCrawlPose(spec.poseMs,elapsed):slimeHopPose(t);
    drawCombatEnemySprite(sprite,artFor(spawn.kind),{spec,phase:'emerging',elapsed,emergeMs:SWAMP_EMERGENCE.durationMs,
      enemy:{x:origin.x+(point.x-origin.x)*t,y:origin.y+(point.y-origin.y)*t,
        facing:Math.sign(point.x-origin.x),hp:spec.maxHp,poseMs}});
    if(spawn.waterLeap){
      const lift=24*spec.scale*4*t*(1-t);
      sprite.setY(sprite.y-lift);
    }
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
      this.clearDeathFields(area=>area.testSource);
      editor.report('Test mobs cleared.');
    }));
    const tools=document.createElement('fieldset'), legend=document.createElement('legend');
    legend.textContent='Respawn Tools';
    const radius=document.createElement('input');
    Object.assign(radius,{type:'number',min:'100',max:'600',step:'1',value:'250'});
    this.respawnRadius=250;
    radius.addEventListener('input',()=>{
      if(radius.value&&radius.checkValidity())this.respawnRadius=radius.valueAsNumber;
    });
    radius.addEventListener('change',()=>{radius.value=String(this.respawnRadius);});
    const actions=document.createElement('div');
    actions.className='swamp-run-controls';
    actions.append(editor.button('Reset selected',()=>{
      if(!editor.selected){editor.report('Select a spawn to reset.');return;}
      editor.report(this.respawnApplied({id:editor.selected}));
    }),editor.button('Respawn nearby',()=>editor.report(this.respawnApplied({radius:this.respawnRadius}))),
    editor.button('Respawn all',()=>editor.report(this.respawnApplied())));
    this.ambushDiagnostic=document.createElement('small');
    tools.append(legend,editor.field('Nearby radius (px)',radius),actions,this.ambushDiagnostic);
    editor.advanced.append(debug.label,controls,this.state,tools);
  }

  respawnApplied({id,radius=Infinity}={}){
    const feet=this.scene.player.body.center;
    const eligible=spawn=>(!id||spawn.id===id)&&!this.editor.edits.isProtected(spawn)&&
      !this.run.defeated.has(spawn.encounterId);
    const near=point=>Math.hypot(feet.x-point.x,feet.y-point.y)<=radius;
    const clearSpawn=spawnId=>{
      for(const {mob,sprite} of this.entries){
        if(mob.spawnId===spawnId)this.scene.swampRun?.reactions.clear(sprite);
      }
      this.removeWhere(mob=>mob.spawnId===spawnId);
      this.clearDeathFields(area=>area.spawnId===spawnId);
      this.vanquished.delete(spawnId);
    };
    const live=spawnId=>this.entries.some(({mob})=>mob.spawnId===spawnId&&mob.enemy.hp);
    let restored=0,rearmed=0;
    for(const spawn of this.editor.applied.spawns){
      if(!eligible(spawn)||!near(spawn)||(!id&&live(spawn.id)))continue;
      clearSpawn(spawn.id);
      if(this.add(spawn))restored++;
    }
    for(const ambush of this.ambushes){
      const {spawn,controller,trap}=ambush;
      if(!eligible(spawn)||!(near(spawn.visualOrigin)||!spawn.falseAlarm&&near(spawn))||(!id&&(live(spawn.id)||
        (controller.phase==='hidden'&&!ambush.waitingRepeat&&!this.run.firedTraps.has(spawn.id)))))continue;
      clearSpawn(spawn.id);
      this.clearAmbushArt(ambush);
      if(this.ambushPreview?.spawn.id===spawn.id)this.stopAmbushPreview();
      this.run.firedTraps.delete(spawn.id);
      this.run.ambushReadyAt.delete(spawn.id);
      ambush.waitingRepeat=false;
      controller.reset(feet);
      trap?.reset();
      rearmed++;
    }
    if(rearmed)saveSwampRun(this.run);
    if(id&&!restored&&!rearmed)return 'Selected spawn is protected or not applied. Use Test changes if it is still a draft.';
    return `Mobs restored: ${restored} · Events rearmed: ${rearmed}.`;
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
    if(editor.pendingAmbushOrigin){
      const {x,y}=editor.pendingAmbushOrigin;
      g.lineStyle(2,0xa9e7f6,0.9).strokeCircle(x,y,7);
    }
    if(editor.advanced.open){
      const {x,y}=this.scene.player.body.center;
      g.lineStyle(1,0xb7a1ed,0.55).strokeCircle(x,y,this.respawnRadius);
      this.drawAmbushDiagnostic();
    }
    if(editor.showSpawns)for(const {x,y} of editor.appliedOnlyMarkers??[])
      g.lineStyle(1.5,0xffbd65,0.75).strokeCircle(x,y,9);
    if(editor.finishMarker){
      const {x,y}=editor.finishMarker;
      g.lineStyle(1,0xc7f2a6,0.8).strokeCircle(x,y,12)
        .lineBetween(x-4,y,x-1,y+3).lineBetween(x-1,y+3,x+5,y-4);
    }
    if(editor.rejectedPoint){
      const {x,y,origin}=editor.rejectedPoint;
      g.lineStyle(2,0xff625c,1).lineBetween(x-7,y-7,x+7,y+7).lineBetween(x+7,y-7,x-7,y+7);
      if(origin)g.lineBetween(origin.x,origin.y,x,y);
    }
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
    const events=this.ambushes.map(ambush=>ambush.spawn.id+': '+this.ambushStatus(ambush));
    const status=[...events,...this.entries.map(
      ({mob})=>{
        const shot=mob.lastShot;
        return mob.spawnId+' '+mob.navigation.state+'/'+mob.phase+' '+mob.enemy.hp+'/'+mob.spec.maxHp+
          (shot?` · Last fired: ${shot.kind} (${shot.reason})`:'');
      },
    )].join(' · ');
    if(status!==this.state.textContent)this.state.textContent=status;
  }

  ambushStatus({spawn,controller,trap,waitingRepeat,warning}){
    if(warning){
      const {x,y}=spawn.visualOrigin;
      const inView=this.scene.cameras.main.worldView.contains(x,y);
      return `Warning active at ${x}, ${y}${inView?'':' (outside camera)'}`;
    }
    if(controller.phase==='emerging')return 'Creatures emerging';
    if(!spawn.repeat&&this.run.firedTraps.has(spawn.id))return 'Consumed this run';
    if(waitingRepeat){
      if(this.entries.some(({mob})=>mob.spawnId===spawn.id))return 'Waiting for previous spawn';
      const seconds=Math.max(0,Math.ceil((this.run.ambushReadyAt.get(spawn.id)-Date.now())/1000));
      return seconds?`Cooldown: ${seconds} s`:'Ready to rearm';
    }
    if(trap)return trap.phase;
    return controller.waitForExit?'Waiting for Michael to leave the trigger zone':'Awaiting trigger entry';
  }

  drawAmbushDiagnostic(){
    const draft=this.editor.edits.get(this.editor.selected);
    const event=this.ambushes.find(({spawn})=>spawn.id===draft?.id);
    const text=draft&&draft.spawnType!=='proximity'?(event?
      (JSON.stringify(this.editor.edits.event(draft))===JSON.stringify(event.spawn)?'':'Draft changed · Applied event: ')+this.ambushStatus(event):
      'Event not applied. Use Test changes.'):'';
    if(this.ambushDiagnostic.textContent!==text)this.ambushDiagnostic.textContent=text;
  }

  removeWhere(predicate,{keepDeathFields=false}={}){
    const removed=new Set();
    this.entries=this.entries.filter(({mob,sprite,bar,effects})=>{
      if(!predicate(mob))return true;
      removed.add(mob);
      if(keepDeathFields&&mob.spec.hazard){
        const patch=this.bout.areas.find(area=>area.kind===mob.spec.hazard&&area.sourceId===mob.id);
        if(patch){
          patch.testSource=mob.test;
          patch.spawnId=mob.spawnId;
          if(effects.spores){
            this.deathSpores.set(patch,effects.spores);
            effects.spores=null;
          }
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
      this.bout.areas=this.bout.areas.filter(area=>!ids.has(area.sourceId)||keepDeathFields&&area.spawnId!==undefined);
    }
  }

  clearDeathFields(predicate=()=>true){
    this.bout.areas=this.bout.areas.filter(area=>{
      if(area.spawnId===undefined||!predicate(area))return true;
      this.deathSpores.get(area)?.destroy();
      this.deathSpores.delete(area);
      return false;
    });
  }

  drawAmbushMarkers({visualOrigin:origin,x,y,spawnType,falseAlarm,trigger,a,b,emergenceDistance,gateALength,gateBLength}){
    const g=this.debug;
    g.lineStyle(2,0xa6ea70,0.9).strokeCircle(origin.x,origin.y,7);
    if(!falseAlarm){
      g.lineBetween(origin.x,origin.y,x,y);
      const length=Math.hypot(x-origin.x,y-origin.y);
      if(spawnType==='return-trap'&&length>0&&length<emergenceDistance){
        const scale=emergenceDistance/length;
        g.lineStyle(1,0xa6ea70,0.3).lineBetween(x,y,origin.x+(x-origin.x)*scale,origin.y+(y-origin.y)*scale);
      }
    }
    if(spawnType==='ambush'){
      if(!this.editor.showRanges)return;
      g.fillStyle(0xffc36c,0.12).lineStyle(2,0xffc36c,0.85);
      if(trigger.shape==='rectangle'){
        const {x,y,width,height}=trigger;
        g.fillRect(x-width/2,y-height/2,width,height).strokeRect(x-width/2,y-height/2,width,height);
      }else g.fillCircle(trigger.x,trigger.y,trigger.radius).strokeCircle(trigger.x,trigger.y,trigger.radius);
    }else if(a&&b){
      const axis=returnTrapAxis(a,b);
      g.lineStyle(1,0xffdb93,0.5).lineBetween(a.x,a.y,b.x,b.y);
      for(const [gate,color,length] of [[a,0x66ddff,gateALength],[b,0xfda455,gateBLength]]){
        const dx=-axis.y*length/2,dy=axis.x*length/2;
        g.lineStyle(2,color,0.95).lineBetween(gate.x-dx,gate.y-dy,gate.x+dx,gate.y+dy);
      }
    }
  }

  clearAmbushArt(ambush){
    ambush.warning?.destroy();
    for(const sprite of ambush.sprites??[])sprite.destroy();
    ambush.warning=null;
    ambush.sprites=null;
  }

  destroy(){
    this.stopAmbushPreview();
    this.editor.destroy();
    for(const ambush of this.ambushes)this.clearAmbushArt(ambush);
    this.removeWhere(()=>true);
    this.clearDeathFields();
    this.debug.destroy();
    this.groundAreas.destroy();
  }
}
