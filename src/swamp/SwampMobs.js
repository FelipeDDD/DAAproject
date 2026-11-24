import atlas from '../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};
import { acquireAggro } from '../vfx/lab/combatAggro.js';
import { CombatBout } from '../vfx/lab/CombatBout.js';
import { ENEMIES } from '../vfx/lab/combatEnemy.js';
import { CombatArenaEffects, drawGroundArea, drawSlimeDeathSpores } from '../vfx/lab/CombatArenaEffects.js';
import { drawCombatEnemySprite } from '../vfx/lab/combatEnemySprite.js';
import { PlayerHealthBar } from '../ui/PlayerHealthBar.js';
import { AmbushWarning } from './AmbushWarning.js';
import { SpawnEditor } from './SpawnEditor.js';
import { ReturnTrap, returnTrapAxis } from './ReturnTrap.js';
import { saveSwampRun } from './SwampRun.js';
import { SWAMP_AMBUSH, SWAMP_MOB_TERRAIN, swampEncounterSpawns } from './mobConfig.js';
import { alertSwampPack, createCombatSpace, createMobTerrain, findNearbyMobSpawn, SwampAmbush, SwampMob } from './mobMovement.js';

const textureKey = kind => 'swamp-mob-'+kind;
const artFor = kind => atlas['pfx-'+kind];
const MAX_TEST_MOBS = 8;
const COLORS = {snake:0xffcf73,frog:0xa3ed91,slime:0xa7caff};

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
    this.ambush=new SwampAmbush(SWAMP_AMBUSH);
    this.ambushMode=Object.hasOwn(SWAMP_AMBUSH.variants,run?.ambushVariant)
      ?run.ambushVariant:SWAMP_AMBUSH.defaultVariant;
    this.terrain=Object.fromEntries(Object.entries(SWAMP_MOB_TERRAIN).map(([kind,{footRadius}])=>
      [kind,createMobTerrain(scene.collisionLayer,scene.physics.world.bounds,footRadius)]));
    this.terrain.marker=createMobTerrain(scene.collisionLayer,scene.physics.world.bounds,scene.playerFootRadius);
    const space=createCombatSpace(scene.collisionLayer,scene.physics.world.bounds);
    this.bout=new CombatBout((...hit)=>this.onHit?.(...hit),Math.random,Math.random,{space,continuous:true});
    this.groundAreas=scene.add.graphics().setDepth(-0.6);
    this.debug=scene.add.graphics().setDepth(scene.physics.world.bounds.height+5).setVisible(false);
    this.editor=new SpawnEditor(this);
    this.createAdvancedControls();
    this.resetEncounter(run?.defeated);
  }

  resetEncounter(defeated=new Set()){
    this.clearWarning();
    this.removeWhere(()=>true);
    this.clearDeathSpores();
    this.vanquished.clear();
    this.bout.reset([]);
    this.nextActorId=0;
    this.groundAreas.clear();
    this.resetAmbushState();
    const spawns=this.editor?.applied.spawns??swampEncounterSpawns();
    for(const spawn of spawns)if(!defeated.has(spawn.encounterId))this.add(spawn);
  }

  baseSpawns(){
    const {a,b}=SWAMP_AMBUSH.returnTrap;
    return [...swampEncounterSpawns(),...(SWAMP_AMBUSH.enabled?[SWAMP_AMBUSH.spawn,a,b]:[])];
  }

  resetAmbushState(){
    this.ambush.reset();
    const config=SWAMP_AMBUSH.returnTrap;
    const applied=this.editor?.applied;
    this.ambushMode=applied?.variant??this.ambushMode;
    this.activeAmbushSpawn=applied?.ambushSpawn??SWAMP_AMBUSH.spawn;
    this.returnTrap=new ReturnTrap({...config,a:applied?.a??config.a,b:applied?.b??config.b});
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
    if(SWAMP_AMBUSH.enabled&&this.ambush.phase!=='revealed')this.updateAmbush(delta,player.body.center);
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

  updateAmbush(delta,feet){
    const variant=SWAMP_AMBUSH.variants[this.ambushMode];
    const spawn=this.activeAmbushSpawn;
    const isTrap=variant.type==='return-trap';
    const canSee=()=>this.terrain[variant.kind??spawn.kind].sees(spawn,feet);
    let result;
    if(isTrap&&this.ambush.phase==='hidden'){
      if(this.run.firedTraps.has(SWAMP_AMBUSH.id))return;
      const inCombat=this.bout.enemies.some(mob=>mob.enemy.hp&&mob.aggro);
      if(!this.returnTrap.sample(feet,{inCombat,canTrigger:canSee}))return;
      this.run.firedTraps.add(SWAMP_AMBUSH.id);
      saveSwampRun(this.run);
      result=this.ambush.beginWarning();
    }else result=this.ambush.update(delta,feet,canSee);
    if(result==='warning'){
      this.warning=new AmbushWarning(this.scene,SWAMP_AMBUSH.bush,variant.effect,SWAMP_AMBUSH.warningMs);
    }else if(result==='spawn'){
      this.clearWarning();
      if(variant.kind){
        const mob=this.add({...spawn,kind:variant.kind});
        if(mob){
          if(isTrap)mob.cooldown=Math.max(mob.cooldown,this.returnTrap.config.reactionMs);
          acquireAggro(mob);
        }
      }
    }
    this.warning?.draw(this.ambush.elapsed);
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
    }),editor.button('Reset ambush',()=>{
      this.clearWarning();
      this.removeWhere(mob=>mob.spawnId===SWAMP_AMBUSH.spawn.id);
      this.resetAmbushState();
      editor.report(this.ambushMode==='return-trap'&&this.run.firedTraps.has(SWAMP_AMBUSH.id)
        ?'Return Trap used. Restart Run to try again.':'Applied ambush reset.');
    }));
    editor.advanced.append(debug.label,controls,this.state);
  }

  syncEditorDebug(){
    const editor=this.editor;
    if(!editor)return;
    const technical=editor.open&&this.debugToggle.checked;
    this.state.hidden=!technical;
    this.debug.setVisible(editor.showSpawns||editor.showAmbush||technical);
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
    const trap=SWAMP_AMBUSH.returnTrap;
    const a=editor.edits.get(trap.a.id),b=editor.edits.get(trap.b.id);
    if(editor.showAmbush&&a&&b){
      const axis=returnTrapAxis(a,b);
      g.lineStyle(1,0xffdb93,0.5).lineBetween(a.x,a.y,b.x,b.y);
      for(const [i,gate] of [a,b].entries()){
        const color=gate.id===editor.selected?0xffffff:i===0?0x66ddff:0xfda455;
        const dx=-axis.y*trap.halfWidth,dy=axis.x*trap.halfWidth;
        g.lineStyle(2,color,0.95).lineBetween(gate.x-dx,gate.y-dy,gate.x+dx,gate.y+dy);
      }
      const {x,y,radius}=SWAMP_AMBUSH.trigger;
      g.lineStyle(1,0xffdb93,0.6).strokeCircle(x,y,radius);
    }
    for(const mark of editor.edits.entries()){
      if(mark.marker||!(editor.edits.isAmbush(mark)?editor.showAmbush:editor.showSpawns))continue;
      const selected=mark.id===editor.selected;
      const size=selected?10:5;
      g.lineStyle(selected?2:1,selected?0xffffff:COLORS[mark.kind],mark.disabled?0.35:0.9)
        .lineBetween(mark.x-size,mark.y,mark.x+size,mark.y)
        .lineBetween(mark.x,mark.y-size,mark.x,mark.y+size);
    }
    if(!this.debugToggle.checked)return;
    for(const {mob} of this.entries)if(mob.enemy.hp)g.lineStyle(1.5,COLORS[mob.kind],0.85)
      .strokeCircle(mob.enemy.x,mob.enemy.y,mob.footRadius);
    const phase=this.ambushMode==='return-trap'&&this.ambush.phase==='hidden'
      ?(this.run.firedTraps.has(SWAMP_AMBUSH.id)?'used':this.returnTrap.phase):this.ambush.phase;
    const status='Ambush '+phase+' · '+this.entries.map(
      ({mob})=>{
        const shot=mob.lastShot;
        return mob.spawnId+' '+mob.navigation.state+'/'+mob.phase+' '+mob.enemy.hp+'/'+mob.spec.maxHp+
          (shot?` · Last fired: ${shot.kind} (${shot.reason})`:'');
      },
    ).join(' · ');
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

  clearWarning(){
    this.warning?.destroy();
    this.warning=null;
  }

  destroy(){
    this.editor.destroy();
    this.clearWarning();
    this.removeWhere(()=>true);
    this.clearDeathSpores();
    this.debug.destroy();
    this.groundAreas.destroy();
  }
}
