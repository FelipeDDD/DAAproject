import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readFootObstacles } from '../src/maps/footCollision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { SWAMP_AGGRO, SWAMP_AMBUSH, SWAMP_EMERGENCE, SWAMP_ENCOUNTERS, SWAMP_EXPERIMENTAL_GROUPS, SWAMP_MOB_TERRAIN, SWAMP_ROAMING, SWAMP_SPAWNS,
  swampEncounterSpawns } from '../src/swamp/mobConfig.js';
import { alertSwampPack, createCombatSpace, createMobTerrain, createSwampSpawnTerrain, findNearbyMobSpawn, SwampAmbush, SwampMob } from '../src/swamp/mobMovement.js';
import { resolveSpawn } from '../src/maps/tiledObjects.js';
import { SwampMobs } from '../src/swamp/SwampMobs.js';
import { SpawnEdits } from '../src/swamp/spawnEdits.js';
import { SpawnEditor } from '../src/swamp/SpawnEditor.js';
import { createSpawnReachability } from '../src/swamp/mobRoutes.js';
import { validateSwampSource } from '../scripts/swamp-spawns-vite.mjs';
import sourceSpawns from '../src/swamp/spawns.json' with {type:'json'};
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { acquireAggro } from '../src/vfx/lab/combatAggro.js';
import { SwampRun } from '../src/swamp/SwampRun.js';

const bounds={left:0,top:0,right:1920,bottom:1920};
const map=JSON.parse(readFileSync(new URL('../public/assets/maps/swamp-v3-large.tmj',import.meta.url)));
const walls=readFootObstacles(map);
const terrainFor=(kind,obstacles=walls)=>createMobTerrain(obstacles,bounds,SWAMP_MOB_TERRAIN[kind].footRadius);

test('Escape cancels placement and clears selection without changing the draft or closing the panel',()=>{
  const edits=new SpawnEdits([],{snake:terrainFor('snake',[])},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const {id,error}=edits.add('snake','',{x:200,y:200});
  assert.equal(error,'');
  const draft=edits.data();
  let dialogOpen=true,focused=0,stopped=0,prevented=0,previewsStopped=0;
  const canvas={ownerDocument:{querySelector:()=>dialogOpen?{}:null},closest:()=>({focus:()=>focused++})};
  const editor=Object.assign(Object.create(SpawnEditor.prototype),{
    edits,selected:id,mode:'triggerPoint',rejectedPoint:{x:12,y:16},companionGroup:'',
    draft:{spawnType:'ambush'},creatures:[['Snake','snake']],panel:{hidden:false},
    mobs:{scene:{game:{canvas}},stopAmbushPreview:()=>previewsStopped++},
    choices:{childElementCount:1},root:{contains:()=>true},
    render(){this.choices.childElementCount=0;},
  });
  const key={key:'Escape',stopImmediatePropagation:()=>stopped++,preventDefault:()=>prevented++};
  editor.handleEscape(key);
  assert.equal(editor.selected,id);
  assert.equal(editor.mode,'triggerPoint');
  assert.equal(stopped,0);
  assert.equal(prevented,0);

  dialogOpen=false;
  editor.handleEscape({...key,repeat:true});
  assert.equal(editor.selected,id);
  editor.handleEscape(key);
  assert.equal(editor.selected,'');
  assert.equal(editor.mode,'');
  assert.equal(editor.rejectedPoint,null);
  assert.equal(editor.choices.childElementCount,0);
  assert.deepEqual(editor.draft,{kind:'snake',spawnType:'proximity'});
  assert.equal(editor.open,true);
  assert.equal(previewsStopped,1);
  assert.equal(focused,1);
  assert.deepEqual(edits.data(),draft);

  editor.selected=id;
  editor.handleEscape({...key,target:{closest:()=>({})}});
  assert.equal(editor.selected,'');
  assert.equal(stopped,2);
  assert.equal(prevented,1);
  assert.equal(focused,1);
  editor.handleEscape(key);
  assert.equal(stopped,2);
});

test('reloading the editor preserves distinct draft and applied placements',t=>{
  const terrain={snake:terrainFor('snake',[])};
  const model=()=>new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const edits=model();
  const saved=edits.data();
  const {id,error}=edits.add('snake','',{x:200,y:200});
  assert.equal(error,'');
  const applied=edits.data();
  assert.equal(edits.move(id,{x:280,y:200}),'');
  const draft=edits.data();
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify({base:JSON.stringify(saved),applied,draft})}});
  t.after(()=>{
    if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);
    else delete globalThis.localStorage;
  });
  const editor=Object.assign(Object.create(SpawnEditor.prototype),{edits:model(),saved,draftStatus:{},sourceHint:{}});
  editor.load();
  editor.updateDraftStatus();
  assert.equal(editor.applied.spawns[0].x,200);
  assert.equal(editor.edits.get(id).x,280);
  assert.equal(editor.appliedOnlyMarkers[0].x,200);
  assert.match(editor.draftStatus.textContent,/Draft changed/);
  assert.equal(editor.sourceHint.hidden,false);
  assert.equal(editor.edits.remove(id),'');
  editor.updateDraftStatus();
  assert.equal(editor.appliedOnlyMarkers[0].id,id);
});
const createMob=(spawn,terrain,{random=Math.random}={})=>{
  const bout=new CombatBout();
  const mob=new SwampMob(bout,spawn,terrain,0,{roaming:{...SWAMP_ROAMING,enabled:false}});
  mob.cooldown=60000;
  mob.aiSample=random;
  return mob;
};
const ticks=(mob,player,count)=>{
  for(let i=0;i<count;i++){
    mob.update(16,player);
    assert.ok(mob.terrain.clear(mob.enemy),mob.spawnId+' overlapped an obstacle');
  }
};

test('all authored encounters have walkable feet outside the entrance and central arena',()=>{
  const [entrance]=objectsIn(map,'Spawns');
  const spawns=[...SWAMP_SPAWNS,SWAMP_AMBUSH.spawn];
  assert.equal(SWAMP_SPAWNS.length,5);
  assert.equal(new Set(spawns.map(spawn=>spawn.id)).size,spawns.length);
  for(const spawn of spawns){
    assert.ok(terrainFor(spawn.kind).clear(spawn),spawn.id);
    assert.ok(Math.hypot(spawn.x-entrance.x,spawn.y-entrance.y)>200);
    assert.ok(spawn.x<650||spawn.x>1430||spawn.y<500||spawn.y>1260);
  }
  assert.ok(terrainFor('snake').canReach(SWAMP_AMBUSH.spawn,SWAMP_AMBUSH.trigger));
});

test('idle mobs wander with native poses inside the edited spawn radius and pause again after returning',()=>{
  const fixture={layers:[{type:'objectgroup',name:'Collision',objects:[{x:330,y:0,width:10,height:1920}]}]};
  const obstacles=readFootObstacles(fixture),player={x:1300,y:300};
  for(const kind of ['frog','snake','slime']){
    const spawn={id:kind,kind,x:300,y:300};
    // The first eastward candidate hits a wall. The next goes west.
    const rolls=[0,0,0.5,0.5,0.5];
    const mob=new SwampMob(new CombatBout(),spawn,terrainFor(kind,obstacles),0,{
      random:()=>rolls.shift()??0.5,
      roaming:{...SWAMP_ROAMING,minPauseMs:100,maxPauseMs:100},
    });
    const poses=new Set();
    for(let i=0;i<160;i++){
      ticks(mob,player,1);
      poses.add(mob.enemy.poseMs);
      assert.equal(mob.aggro,null);
      assert.ok(Math.hypot(mob.enemy.x-spawn.x,mob.enemy.y-spawn.y)<=65.01);
    }
    assert.ok(mob.enemy.x<280,kind);
    assert.ok(poses.size>4,kind);
    mob.navigation.engage(mob);
    mob.navigation.disengage(mob,false);
    for(let i=0;mob.navigation.state==='returning'&&i<180;i++)ticks(mob,player,1);
    assert.equal(mob.navigation.state,'idle');
    assert.ok(Math.hypot(mob.enemy.x-spawn.x,mob.enemy.y-spawn.y)<=1.01);
    assert.ok(mob.navigation.roamPauseMs>0);
  }
});

test('detection and damage alert only nearby visible members of the same encounter, without relaying',()=>{
  for(const cause of ['detect','damage']){
    const obstacles=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
      {x:225,y:60,width:10,height:420},
    ]}]});
    const bout=new CombatBout();
    const members=[];
    const add=(id,x,y,encounterId='pack',checkpoint=null)=>{
      const mob=new SwampMob(bout,{id,x,y,kind:'slime',encounterId,checkpoint},terrainFor('slime',obstacles),
        members.length,{onAggro:(source,player)=>alertSwampPack(source,player,members)});
      members.push(mob);
      return mob;
    };
    const source=add('source',190,180),ally=add('ally',190,270),viaAlly=add('second-hop',190,360);
    const behindWall=add('wall',260,180),otherGroup=add('other',170,225,'elsewhere');
    const elite=add('elite',195,240,'pack','north'),ambush=add('ambush',190,220,null);
    const player={x:70,y:180,displayHeight:64};
    if(cause==='detect')source.update(16,player);
    else bout.hitEnemy({damage:10},source,source.enemy,player);
    assert.ok(source.aggro&&ally.aggro,cause);
    ally.update(16,player);
    assert.ok([viaAlly,behindWall,otherGroup,elite,ambush].every(mob=>!mob.aggro),cause);
  }
});

test('each normal encounter has one walkable Poison Slime clear of all initial feet',()=>{
  const spawns=swampEncounterSpawns();
  assert.equal(spawns.length,10);
  assert.deepEqual(swampEncounterSpawns(new Set(),{...SWAMP_EXPERIMENTAL_GROUPS,enabled:false}),SWAMP_SPAWNS);
  assert.ok(!spawns.some(spawn=>spawn.id.startsWith(SWAMP_AMBUSH.spawn.id)));
  const slimeTerrain=terrainFor('slime');
  for(const original of SWAMP_SPAWNS){
    const companion=spawns.find(spawn=>spawn.id===original.id+'-companion');
    assert.equal(companion.kind,'slime');
    assert.ok(slimeTerrain.canReach(original,companion),companion.id);
    for(const other of [...spawns,SWAMP_AMBUSH.spawn]){
      if(other===companion)continue;
      const separation=Math.hypot(companion.x-other.x,companion.y-other.y);
      assert.ok(separation>13+SWAMP_MOB_TERRAIN[other.kind].footRadius,companion.id+' / '+other.id);
    }
  }
});

test('editor rejects blocked or occupied positions and exports only accepted offsets',()=>{
  const spawns=[...swampEncounterSpawns(),SWAMP_AMBUSH.spawn];
  const terrain=Object.fromEntries(Object.keys(SWAMP_MOB_TERRAIN).map(kind=>[kind,terrainFor(kind)]));
  const edits=new SpawnEdits(spawns,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  assert.equal(SWAMP_ENCOUNTERS.find(e=>e.id==='southeast-marsh').checkpoint,'southeast');
  assert.match(edits.move('west-curve',{x:4,y:4}),/collision/);
  assert.match(edits.move('west-curve',{x:388,y:1418}),/overlaps/);
  assert.equal(edits.move('east-bush',{x:330,y:390}),'');
  assert.equal(edits.move('west-curve',{x:340,y:1306}),'');
  assert.deepEqual(edits.data().positions,{'west-curve':{x:340,y:1306},'east-bush':{x:330,y:390}});
  edits.restore();
  assert.equal(edits.get('west-curve').y,spawns[0].y);
});

test('spawn drafts round-trip groups, additions, disabled originals and legacy offsets',()=>{
  const spawns=[...swampEncounterSpawns(),SWAMP_AMBUSH.spawn];
  const terrain=Object.fromEntries(Object.keys(SWAMP_MOB_TERRAIN).map(kind=>[kind,terrainFor(kind)]));
  const edits=new SpawnEdits(spawns,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  edits.load({map:'swamp-v3-large',version:1,positions:{'west-curve':{x:340,y:1306}}});
  assert.equal(edits.get('west-curve').y,1306);
  assert.match(edits.remove('southeast-marsh'),/protected/);
  assert.match(edits.move('north-trail-companion',{x:330,y:390}),/editable/);
  assert.match(edits.remove('east-bush'),/protected/);
  assert.match(edits.add('slime','north-trail',{x:330,y:390}).error,/encounter/);
  assert.equal(edits.remove('west-curve'),'');
  const first=edits.add('slime','',{x:330,y:390});
  const second=edits.add('frog',first.id,{x:390,y:390});
  assert.equal(first.error,'');
  assert.equal(second.error,'');
  assert.match(edits.move(second.id,{x:330,y:390}),/overlaps/);
  assert.equal(edits.move(second.id,{x:395,y:390}),'');
  const saved=JSON.parse(JSON.stringify(edits.data()));
  const reloaded=new SpawnEdits(spawns,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  reloaded.load(saved);
  assert.deepEqual(reloaded.data(),saved);
  const snapshot=reloaded.snapshot();
  assert.ok(!snapshot.spawns.some(spawn=>spawn.id==='west-curve'));
  assert.equal(snapshot.spawns.filter(spawn=>spawn.encounterId===first.id).length,2);
  assert.equal(reloaded.remove(first.id),'');
  assert.equal(snapshot.spawns.filter(spawn=>spawn.encounterId===first.id).length,2);
  assert.equal(reloaded.get(second.id).encounterId,first.id);
  reloaded.restore();
  assert.equal(reloaded.snapshot().spawns.length,swampEncounterSpawns().length);
});

test('ambush previews are repeatable and leave the real warning and spawn available',()=>{
  for(const [mode,kind] of [['snake','snake'],['frog','frog'],['alarm',null]]){
    const calls=[];
    const graphics={
      setPosition(){return this;},setDepth(){return this;},clear(){return this;},
      fillStyle(){return this;},fillRect(){return this;},destroy(){calls.push('destroy warning');},
    };
    const terrain={frog:{sees:()=>false,clear:()=>true},snake:{sees:()=>false,clear:()=>true}};
    const edits=new SpawnEdits([SWAMP_AMBUSH.spawn],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,mode);
    const mobs=Object.assign(Object.create(SwampMobs.prototype),{
      ambushes:[],entries:[],run:{defeated:new Set(),firedTraps:new Set()},editor:{applied:edits.snapshot()},
      scene:{add:{graphics:()=>graphics,sprite:()=>({setOrigin(){return this;},destroy(){calls.push('destroy sprite');}})},
        playerFootRadius:8,physics:{world:{bounds}}},
      terrain,drawEmerging(){calls.push('emerge');},
      add(spawn){calls.push(spawn.kind);return {cooldown:0};},
    });
    mobs.resetAmbushState();
    const [event]=mobs.ambushes;
    mobs.previewAmbush(event.spawn);
    const firstPreview=mobs.ambushPreview;
    assert.ok(firstPreview.warning);
    mobs.previewAmbush(event.spawn);
    assert.equal(firstPreview.warning,null);
    assert.ok(mobs.ambushPreview.warning);
    mobs.updateAmbushPreview(SWAMP_AMBUSH.warningMs);
    if(kind){
      assert.ok(mobs.ambushPreview.sprites[0]);
      mobs.updateAmbushPreview(SWAMP_EMERGENCE.durationMs);
    }
    assert.equal(mobs.ambushPreview,null);
    assert.equal(event.controller.phase,'hidden');
    assert.equal(mobs.run.firedTraps.size,0);
    assert.equal(calls.includes(kind),false);
    calls.length=0;
    const update=(ms,feet=SWAMP_AMBUSH.trigger)=>mobs.updateAmbush(event,ms,feet);
    update(1000,{x:20,y:20});
    assert.equal(event.controller.phase,'hidden');
    update(1);
    assert.ok(event.warning);
    update(759);
    assert.deepEqual(calls,[]);
    update(1);
    if(kind){
      assert.deepEqual(calls,['destroy warning','emerge']);
      update(SWAMP_EMERGENCE.durationMs,SWAMP_AMBUSH.spawn);
      assert.equal(event.controller.phase,'emerging','occupied landing stays out of combat');
      assert.equal(calls.includes(kind),false);
      update(1);
      assert.deepEqual(calls.slice(-2),['destroy sprite',kind]);
    }else assert.deepEqual(calls,['destroy warning']);
    assert.equal(event.controller.phase,'revealed');
    assert.equal(event.warning,null);
    assert.equal(event.sprites,null);
    if(!kind){
      assert.ok(mobs.run.firedTraps.has(event.spawn.id));
      mobs.resetAmbushState();
      mobs.updateAmbush(mobs.ambushes[0],16,SWAMP_AMBUSH.trigger);
      assert.equal(mobs.ambushes[0].controller.phase,'hidden');
    }
  }
});

test('editor preserves legacy ranges and round-trips a rectangle positioned away from its landing',()=>{
  const wall={x:200,y:200,width:60,height:80};
  const obstacles=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[wall]}]});
  const terrain=Object.fromEntries(Object.keys(SWAMP_MOB_TERRAIN).map(kind=>[kind,terrainFor(kind,obstacles)]));
  terrain.marker=createMobTerrain(obstacles,bounds,8);
  const edits=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const origin={x:207,y:240};
  assert.equal(terrain.snake.clear(origin),false);
  assert.equal(terrain.snake.canEmerge({x:192,y:240},{x:276,y:240},true),false,'solid wall cannot be traversed');
  assert.equal(terrain.snake.canEmerge({x:249,y:240},{x:183,y:240},true),false,'origin is buried too deep');
  assert.deepEqual(edits.add('snake','',origin,{spawnType:'ambush'}),{needsLanding:true});
  const {id,error}=edits.add('snake','',origin,{spawnType:'ambush',vegetation:true,detectionRange:42,triggerRange:96},
    undefined,{x:183,y:240});
  assert.equal(error,'');
  const snapshot=edits.snapshot();
  assert.equal(snapshot.spawns.length,0);
  const [spawn]=snapshot.ambushes;
  assert.deepEqual(spawn.visualOrigin,origin);
  assert.ok(terrain.snake.clear(spawn));
  assert.equal(spawn.trigger.radius,96);
  assert.equal(spawn.detectionRange,42);
  assert.match(edits.move(id,{x:-1,y:240}),/landing point inside the map/);
  const saved=JSON.parse(JSON.stringify(edits.data()));
  const restored=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  restored.load(saved);
  assert.deepEqual(restored.snapshot(),snapshot);
  assert.equal(restored.configure(id,{detectionRange:undefined}),'');
  assert.equal(restored.get(id).detectionRange,undefined);
  const triggerPoint={x:235,y:245};
  assert.equal(terrain.marker.clear(triggerPoint),false,'the zone center can overlap a solid object');
  assert.equal(restored.configure(id,{triggerPoint,triggerShape:'rectangle',triggerWidth:200,triggerHeight:42}),'');
  const rectangle={...triggerPoint,shape:'rectangle',width:200,height:42};
  assert.deepEqual(restored.snapshot().ambushes[0].trigger,rectangle);
  const imported=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  imported.load(JSON.parse(JSON.stringify(restored.data())));
  assert.deepEqual(imported.snapshot().ambushes[0].trigger,rectangle);
  assert.deepEqual(imported.get(id).visualOrigin,origin);
  assert.equal(imported.configure(id,{triggerShape:'circle'}),'');
  assert.deepEqual(imported.snapshot().ambushes[0].trigger,{...triggerPoint,shape:'circle',radius:96});
});

test('ambush markers move independently and preserve blocked landings across walls',()=>{
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',objects:[
    {x:370,y:200,width:60,height:80},
    {x:443,y:220,polyline:[{x:0,y:0},{x:0,y:40}]},
  ]}]});
  const terrain=terrainFor('snake',obstacles);
  const edits=new SpawnEdits([],{snake:terrain},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const initial={x:200,y:240};
  const {id,error}=edits.add('snake','',initial,{spawnType:'ambush',triggerShape:'rectangle'},undefined,initial);
  assert.equal(error,'');
  const landing={x:240,y:240},origin={x:220,y:240},triggerPoint={x:320,y:240};
  assert.equal(edits.move(id,landing),'');
  assert.deepEqual(edits.event(edits.get(id)).visualOrigin,initial);
  assert.equal(edits.event(edits.get(id)).trigger.x,initial.x);
  assert.equal(edits.configure(id,{visualOrigin:origin}),'');
  assert.equal(edits.event(edits.get(id)).trigger.x,initial.x);
  assert.equal(edits.configure(id,{triggerPoint}),'');
  const [event]=edits.snapshot().ambushes;
  assert.deepEqual(event.visualOrigin,origin);
  assert.deepEqual({x:event.x,y:event.y},landing);
  assert.deepEqual({x:event.trigger.x,y:event.trigger.y},triggerPoint);
  assert.equal(edits.configure(id,{visualOrigin:{x:655,y:240}}),'');
  assert.equal(edits.move(id,{x:390,y:240}),'');
  assert.equal(terrain.clear(edits.get(id)),false);
  const restored=new SpawnEdits([],{snake:terrain},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  restored.load(JSON.parse(JSON.stringify(edits.data())));
  assert.deepEqual(restored.event(restored.get(id)),edits.event(edits.get(id)));
  assert.deepEqual(restored.event(restored.get(id)).trigger,event.trigger);
  assert.match(terrain.emergenceError({x:375,y:240},{x:460,y:240},true),/too deep|wall/);
  assert.match(terrain.emergenceError({x:437,y:240},{x:460,y:240},true),/wall/);
  assert.equal(terrain.canReach({x:437,y:240},{x:460,y:240}),false);
});

test('legacy circle triggers and new Return Trap gates stay fixed when the landing moves',()=>{
  const terrain={snake:terrainFor('snake',[])};
  const model=()=>new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const edits=model(),point={x:300,y:300};
  const circle=edits.add('snake','',point,{spawnType:'ambush'},undefined,point).id;
  const trap=edits.add('snake','',{x:600,y:300},{spawnType:'return-trap'}).id;
  const saved=edits.data();
  delete saved.settings[circle].triggerPoint;
  const reloaded=model();
  reloaded.load(saved);
  assert.equal(reloaded.move(circle,{x:335,y:300}),'');
  assert.equal(reloaded.event(reloaded.get(circle)).trigger.x,300);
  const before=reloaded.event(reloaded.get(trap));
  assert.equal(reloaded.move(trap,{x:630,y:300}),'');
  assert.equal(reloaded.configure(trap,{visualOrigin:{x:620,y:300}}),'');
  let after=reloaded.event(reloaded.get(trap));
  assert.deepEqual([after.a,after.b],[before.a,before.b]);
  assert.equal(reloaded.configure(trap,{gateB:{x:750,y:300}}),'');
  after=reloaded.event(reloaded.get(trap));
  assert.deepEqual([after.x,after.visualOrigin,after.a],[630,{x:620,y:300},before.a]);
  const roundTrip=model();
  roundTrip.load(reloaded.data());
  assert.deepEqual(roundTrip.snapshot(),reloaded.snapshot());
});

test('spawn reachability follows player routes without admitting an isolated pocket',()=>{
  const area={left:0,top:0,right:320,bottom:240};
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',objects:[
    {x:100,y:0,width:20,height:170},{x:230,y:0,width:20,height:240},
  ]}]});
  const ground=createMobTerrain(obstacles,area,8);
  ground.reachable=createSpawnReachability(ground,area,{x:32,y:80});
  const terrain={marker:ground,snake:createMobTerrain(obstacles,area,15)};
  const edits=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  assert.equal(edits.add('snake','',{x:180,y:80}).error,'');
  assert.match(edits.add('snake','',{x:285,y:80}).error,/player-accessible/);
  assert.match(edits.add('snake','',{x:110,y:80}).error,/collision/);
  assert.equal(edits.add('snake','',{x:285,y:130},{spawnType:'ambush'},undefined,{x:280,y:130}).error,'');
});

test('Return Trap emergence limits persist without extending the vegetation exception',()=>{
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',objects:[
    {x:200,y:200,width:60,height:80},
    {x:90,y:230,polyline:[{x:0,y:0},{x:0,y:20}]},
  ]}]});
  const snake=terrainFor('snake',obstacles);
  const edits=new SpawnEdits([],{snake},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const origin={x:207,y:240},landing={x:100,y:205};
  const {id,error}=edits.add('snake','',origin,{spawnType:'return-trap',vegetation:true});
  assert.equal(error,'');
  assert.match(edits.move(id,landing),/100 px/);
  assert.equal(edits.configure(id,{emergenceDistance:160}),'');
  assert.equal(edits.move(id,landing),'');
  assert.match(edits.move(id,{x:60,y:240}),/wall/);
  assert.match(edits.move(id,{x:320,y:240}),/too deep/);
  const loaded=new SpawnEdits([],{snake},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  loaded.load(edits.data());
  assert.deepEqual(loaded.snapshot(),edits.snapshot());
  assert.match(loaded.configure(id,{emergenceDistance:181}),/180 px/);
});

test('saved Water Leaps remain compatible and accept manually chosen markers',async()=>{
  const terrain=createSwampSpawnTerrain(walls,bounds,12,resolveSpawn(map));
  const edits=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const origin={x:911,y:1625},landing={x:930,y:1500},triggerPoint={x:960,y:1480};
  const options={spawnType:'ambush',waterLeap:true,emergenceDistance:180,triggerPoint};
  assert.equal(terrain.marker.reachable(origin),false);
  assert.equal(terrain.frost.canEmerge(origin,landing,true,180),false);
  assert.deepEqual(edits.add('frost','',origin,options),{needsLanding:true});
  assert.deepEqual(edits.entries(),[]);
  const {id,error}=edits.add('frost','',origin,options,undefined,landing);
  assert.equal(error,'');
  const loaded=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  loaded.load(edits.data());
  const event=loaded.snapshot().ambushes[0];
  assert.equal(event.waterLeap,true);
  assert.deepEqual(event.visualOrigin,origin);
  assert.deepEqual({x:event.trigger.x,y:event.trigger.y},triggerPoint);
  assert.equal(loaded.move(id,{x:952,y:1500}),'');
  assert.deepEqual(loaded.event(loaded.get(id)).trigger,event.trigger);
  assert.equal(loaded.configure(id,{visualOrigin:{x:1030,y:450}}),'');
  assert.deepEqual(loaded.event(loaded.get(id)).trigger,event.trigger);
  const blockedLanding={x:1030,y:450};
  assert.equal(terrain.frost.clear(blockedLanding),false);
  assert.equal(loaded.move(id,blockedLanding),'');
  assert.equal(await validateSwampSource(loaded.data(),process.cwd()),'');
  assert.equal(await validateSwampSource(edits.data(),process.cwd()),'');
});

test('Water Leap keeps blocked and distant markers but rejects out-of-map coordinates',()=>{
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',objects:[
    {x:200,y:200,width:60,height:80},
    {x:275,y:225,polyline:[{x:0,y:0},{x:0,y:45}]},
  ]}]});
  const frost=terrainFor('frost',obstacles);
  const edits=new SpawnEdits([],{frost},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const origin={x:225,y:245},landing={x:625,y:245};
  const options={spawnType:'ambush',waterLeap:true};
  assert.equal(frost.clear(origin),false);
  assert.match(edits.add('frost','',{x:-5,y:245},options,undefined,landing).error,/inside the map/);
  assert.match(edits.add('frost','',origin,options,undefined,{x:-5,y:245}).error,/landing point inside the map/);
  const {id,error}=edits.add('frost','',origin,options,undefined,landing);
  assert.equal(error,'');
  assert.deepEqual({x:edits.get(id).x,y:edits.get(id).y},landing);
  assert.equal(edits.move(id,{x:242,y:245}),'');
  assert.equal(edits.configure(id,{visualOrigin:{x:310,y:265}}),'');
  assert.equal(edits.get(id).waterLeap,true);
});

test('source validator accepts editor data and rejects paths, protected edits and invalid geometry',async()=>{
  assert.equal(await validateSwampSource(sourceSpawns,process.cwd()),'');
  const data=structuredClone(sourceSpawns);
  data.settings['east-bush']={emergenceDistance:160};
  assert.equal(await validateSwampSource(data,process.cwd()),'');
  assert.match(await validateSwampSource({...data,path:'other.json'},process.cwd()),/invalid/);
  data.positions['north-trail']={x:4,y:4};
  assert.match(await validateSwampSource(data,process.cwd()),/protected/);
  delete data.positions['north-trail'];
  data.positions['east-bush']={x:4,y:4};
  assert.equal(await validateSwampSource(data,process.cwd()),'');
  data.positions['east-bush']={x:-4,y:4};
  assert.match(await validateSwampSource(data,process.cwd()),/invalid/);
});

test('a species-free False Alarm accepts a blocked origin, persists, and can be removed',()=>{
  const obstacles=readFootObstacles({layers:[{name:'Collision',type:'objectgroup',objects:[
    {x:280,y:280,width:180,height:180},
  ]}]});
  const terrain={snake:terrainFor('snake',obstacles)};
  const edits=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const point={x:370,y:370},origin={x:380,y:380};
  assert.equal(terrain.snake.clear(point),false);
  const {id,error}=edits.add(null,'',point,{spawnType:'ambush',falseAlarm:true,triggerShape:'rectangle'});
  assert.equal(error,'');
  assert.equal(edits.configure(id,{visualOrigin:origin,triggerPoint:{x:500,y:500}}),'');
  const copy=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  copy.load(JSON.parse(JSON.stringify(edits.data())));
  assert.deepEqual(copy.snapshot(),edits.snapshot());
  assert.equal(copy.get(id).kind,null);
  assert.deepEqual(copy.snapshot().ambushes[0].visualOrigin,origin);
  const decoy=copy.add(null,'',{x:390,y:400},{spawnType:'ambush',falseAlarm:true,decoyType:'water-ripples',
    triggerShape:'rectangle',repeat:true,cooldownSeconds:30});
  assert.equal(decoy.error,'');
  assert.notEqual(decoy.id,id);
  const reloaded=new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  reloaded.load(JSON.parse(JSON.stringify(copy.data())));
  assert.deepEqual(reloaded.snapshot(),copy.snapshot());
  assert.equal(reloaded.get(id).decoyType,undefined);
  assert.equal(reloaded.get(decoy.id).decoyType,'water-ripples');
  assert.equal(copy.remove(id),'');
  assert.deepEqual(copy.snapshot().ambushes.map(event=>event.id),[decoy.id]);
});

test('repeat cooldown, no live duplicates and targeted respawn use runtime state only',()=>{
  const terrain={snake:terrainFor('snake',[])};
  const originals=[{id:'protected',kind:'snake',x:300,y:110,checkpoint:'north',encounterId:'north-trail'}];
  const edits=new SpawnEdits(originals,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const alarm=edits.add(null,'',{x:100,y:100},{spawnType:'ambush',falseAlarm:true,repeat:true,cooldownSeconds:30}).id;
  const snake=edits.add('snake','',{x:320,y:300},{spawnType:'ambush',repeat:true,triggerPoint:{x:380,y:300}},
    undefined,{x:320,y:300}).id;
  const nearby=edits.add('snake','',{x:135,y:220}).id;
  const far=edits.add('snake','',{x:500,y:220}).id;
  const run=new SwampRun(),feet={x:100,y:100};
  run.choose('starter','fireball');run.setHealth(37);
  const playerBefore=run.snapshot();
  const document=JSON.stringify(edits.data());
  const mobs=Object.assign(Object.create(SwampMobs.prototype),{
    terrain,run,editor:{edits,applied:edits.snapshot()},entries:[],ambushes:[],vanquished:new Set(),
    scene:{playerFootRadius:8,player:{body:{center:feet}}},
    drawAmbushPhase(){},clearDeathFields(){},
    removeWhere(predicate){this.entries=this.entries.filter(({mob})=>!predicate(mob));},
    add(spawn){const mob={spawnId:spawn.id,enemy:{x:spawn.x,y:spawn.y,hp:100},footRadius:15};this.entries.push({mob});return mob;},
  });
  mobs.resetAmbushState();
  const [alarmEvent,snakeEvent]=mobs.ambushes;
  mobs.updateAmbush(alarmEvent,0,feet,1000);
  assert.equal(run.ambushReadyAt.get(alarm),31000);
  mobs.updateAmbush(alarmEvent,760,feet,1760);
  mobs.updateAmbush(alarmEvent,1,feet,31000);
  assert.equal(alarmEvent.controller.phase,'warning');
  assert.equal(run.ambushReadyAt.get(alarm),61000);
  mobs.updateAmbush(alarmEvent,760,feet,31760);
  mobs.updateAmbush(alarmEvent,1,{x:220,y:100},45000);
  mobs.updateAmbush(alarmEvent,1,feet,60000);
  assert.equal(alarmEvent.controller.phase,'revealed');
  mobs.updateAmbush(alarmEvent,1,feet,61000);
  assert.equal(alarmEvent.controller.phase,'warning');
  assert.equal(mobs.entries.length,0);
  assert.match(mobs.respawnApplied({id:alarm}),/Events rearmed: 1/);
  assert.equal(run.ambushReadyAt.has(alarm),false);
  assert.equal(alarmEvent.controller.waitForExit,true);
  const trigger=snakeEvent.spawn.trigger;
  mobs.updateAmbush(snakeEvent,0,trigger,1000);
  mobs.updateAmbush(snakeEvent,760,trigger,1760);
  mobs.updateAmbush(snakeEvent,380,trigger,2140);
  mobs.updateAmbush(snakeEvent,1,{x:500,y:300},32000);
  mobs.updateAmbush(snakeEvent,1,trigger,32001);
  assert.equal(snakeEvent.controller.phase,'revealed');
  assert.equal(mobs.entries.filter(({mob})=>mob.spawnId===snake).length,1);
  assert.equal(new SwampRun(run.config,run.snapshot()).ambushReadyAt.get(snake),31000);
  assert.match(mobs.respawnApplied({radius:250}),/Mobs restored: 1/);
  assert.ok(mobs.entries.some(({mob})=>mob.spawnId===nearby));
  assert.ok(!mobs.entries.some(({mob})=>mob.spawnId===far));
  assert.match(mobs.respawnApplied(),/Mobs restored: 1/);
  assert.ok(mobs.entries.some(({mob})=>mob.spawnId===far));
  assert.ok(!mobs.entries.some(({mob})=>mob.spawnId==='protected'));
  assert.equal(run.hp,playerBefore.hp);
  assert.deepEqual(run.choices,playerBefore.choices);
  assert.equal(JSON.stringify(edits.data()),document);
});

test('a detection override affects only that Swamp mob; restoring it keeps the species default',()=>{
  const terrain=terrainFor('snake',[]);
  const spawn={id:'snake',kind:'snake',x:330,y:340,detectionRange:45};
  const mob=createMob(spawn,terrain);
  const ordinary=createMob({...spawn,detectionRange:undefined},terrain);
  ticks(mob,{x:378,y:340},1);
  ticks(ordinary,{x:378,y:340},1);
  assert.equal(mob.aggro,null);
  assert.ok(ordinary.aggro);
  ticks(mob,{x:374,y:340},1);
  assert.ok(mob.aggro);
  assert.ok(ordinary.spec.detectionRange>mob.spec.detectionRange);
});

test('two mobs fight in the authored encounter and reset clears test actors without reviving a completed pair',()=>{
  const bout=new CombatBout(undefined,()=>0.5,()=>0.5,{continuous:true,space:createCombatSpace(walls,bounds)});
  const mobScene={
    bout,entries:[],vanquished:new Set(),groundAreas:{clear(){}},
    ambush:new SwampAmbush(SWAMP_AMBUSH),resetAmbushState(){this.ambush.reset();},
    clearWarning(){},clearDeathFields(){},
    removeWhere(){this.entries=[];},
    add(spawn){
      const actor=new SwampMob(bout,spawn,terrainFor(spawn.kind),this.nextActorId++);
      this.entries.push(actor);
      bout.enemies.push(actor);
    },
  };
  const reset=defeated=>SwampMobs.prototype.resetEncounter.call(mobScene,defeated);
  reset();
  const pair=mobScene.entries.filter(mob=>mob.spawnId.startsWith('west-marsh'));
  assert.deepEqual(pair.map(mob=>mob.kind),['frog','slime']);
  const player={x:350,y:835,displayHeight:64};
  bout.started=true;
  const attacks=new Set();
  for(let tick=0;tick<150;tick++){
    bout.update(16,player);
    for(const actor of pair){
      assert.ok(actor.terrain.clear(actor.enemy));
      if(actor.aggro&&actor.attack)attacks.add(actor.kind);
    }
  }
  assert.deepEqual(attacks,new Set(['frog','slime']));
  assert.ok(bout.playerHp<100);
  mobScene.add({id:'dev-probe',kind:'slime',x:347,y:873});
  reset(new Set(['southeast-marsh']));
  assert.equal(mobScene.entries.length,8);
  assert.equal(bout.enemies.length,8);
  assert.ok(!mobScene.entries.some(mob=>mob.spawnId.startsWith('southeast-marsh')||mob.spawnId==='dev-probe'));
  assert.equal(mobScene.ambush.phase,'hidden');
  reset();
  assert.equal(new Set(bout.enemies.map(mob=>mob.spawnId)).size,10);
  const terrain=Object.fromEntries(Object.keys(SWAMP_MOB_TERRAIN).map(kind=>[kind,terrainFor(kind)]));
  const edits=new SpawnEdits(swampEncounterSpawns(),terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const {id,error}=edits.add('slime','west-marsh',{x:330,y:390});
  assert.equal(error,'');
  mobScene.editor={applied:edits.snapshot()};
  for(let i=0;i<2;i++){
    reset(new Set(['southeast-marsh']));
    const edited=bout.enemies.filter(mob=>mob.spawnId===id);
    assert.equal(edited.length,1);
    assert.equal(edited[0].encounterId,'west-marsh');
    assert.ok(!bout.enemies.some(mob=>mob.spawnId.startsWith('southeast-marsh')));
  }
});

test('all three mobs animate in pursuit and respect a polygon behind their target',()=>{
  const obstacles=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
    {x:160,y:0,polygon:[{x:0,y:0},{x:24,y:0},{x:24,y:1920},{x:0,y:1920}]},
  ]}]});
  for(const kind of Object.keys(SWAMP_MOB_TERRAIN)){
    const mob=createMob({id:kind,kind,x:70,y:110},terrainFor(kind,obstacles),{random:()=>0.5});
    ticks(mob,{x:242,y:110},50);
    assert.equal(mob.enemy.x,70,'no initial aggro through the wall');
    ticks(mob,{x:155,y:110},55);
    assert.ok(mob.enemy.x>70,kind);
    assert.notEqual(mob.enemy.poseMs,mob.spec.poseMs,kind);
    ticks(mob,{x:242,y:110},150);
    assert.ok(mob.enemy.x<=160-mob.footRadius+1e-6,kind);
    // The snake can keep sliding along its side of the wall on a diagonal.
    if(kind!=='snake')assert.equal(mob.phase,'blocked');
  }
});

test('open ground matches Sandbox travel, facing and frames through chase and recovery',()=>{
  for(const kind of Object.keys(SWAMP_MOB_TERRAIN)){
    for(const y of kind==='snake'?[150,405]:[405]){
      const target={x:420,y,displayHeight:64};
      const spawn={id:kind,kind,x:420,y:266};
      const lab=new CombatBout();
      lab.reset([kind]);
      lab.started=true;
      const [actor]=lab.enemies;
      Object.assign(actor.enemy,{x:spawn.x,y:spawn.y});
      actor.cooldown=60000;
      actor.aiSample=()=>0.5;
      const mob=createMob(spawn,terrainFor(kind,[]),{random:()=>0.5});
      const sides=new Set();
      for(let ms=10;ms<=1200;ms+=10){
        lab.update(10,target);
        mob.update(10,target);
        const enemy=actor.enemy;
        assert.ok(Math.hypot(enemy.x-mob.enemy.x,enemy.y-mob.enemy.y)<1e-6,kind+' position at '+ms);
        assert.equal(mob.enemy.poseMs,enemy.poseMs,kind+' pose at '+ms);
        assert.equal(mob.enemy.facing??1,enemy.facing??1,kind+' facing at '+ms);
        sides.add(mob.enemy.facing??1);
      }
      if(kind==='snake')assert.deepEqual(sides,new Set([1,-1]));
    }
  }
});

test('frog uses the Sandbox retreat hop and the green slime keeps the atlas orientation',()=>{
  const frog=createMob({id:'frog',kind:'frog',x:200,y:300},terrainFor('frog',[]));
  ticks(frog,{x:240,y:300},25);
  assert.equal(frog.enemy.x,167);
  assert.equal(frog.enemy.facing,-1);
  const slime=createMob({id:'slime',kind:'slime',x:250,y:300},terrainFor('slime',[]));
  ticks(slime,{x:110,y:300},45);
  assert.equal(slime.enemy.x,210);
  assert.equal(slime.enemy.facing??1,1);
});

test('tiny wall-clipped hops stay grounded, then resume when the path is clear',()=>{
  const objects=[{x:100,y:0,polyline:[{x:0,y:0},{x:0,y:1920}]}];
  const obstacles=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects}]});
  for(const kind of ['frog','slime']){
    const spawn={id:kind,kind,x:85,y:160};
    const mob=createMob(spawn,terrainFor(kind,obstacles));
    acquireAggro(mob);
    ticks(mob,{x:230,y:160},60);
    assert.equal(mob.phase,'blocked');
    assert.equal(mob.enemy.x,spawn.x);
    assert.equal(mob.hop,null);
    ticks(mob,{x:85,y:290},55);
    assert.ok(mob.enemy.y>spawn.y);
  }
});

test('pursuit sweeps against a diagonal polyline and settles without crossing',()=>{
  const obstacles=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
    {x:0,y:0,polyline:[{x:0,y:0},{x:1920,y:1920}]},
  ]}]});
  const kind='snake';
  const terrain=terrainFor(kind,obstacles);
  const mob=createMob({id:'diagonal',kind,x:180,y:120},terrain,{random:()=>0.5});
  ticks(mob,{x:225,y:170},20);
  assert.ok(mob.aggro);
  const target={x:160,y:230};
  ticks(mob,target,240);
  assert.ok(mob.enemy.x-mob.enemy.y>=mob.footRadius*Math.SQRT2-0.01);
  const settled={x:mob.enemy.x,y:mob.enemy.y};
  ticks(mob,target,30);
  assert.deepEqual({x:mob.enemy.x,y:mob.enemy.y},settled);
});

test('pursuit uses mob-to-player distance, a continuous two-second window and local reacquisition',()=>{
  const mob=createMob({id:'slime',kind:'slime',x:200,y:300},terrainFor('slime',[]));
  const nav=mob.navigation;
  const player=(range)=>({x:mob.enemy.x+range,y:mob.enemy.y,displayHeight:64});
  nav.track(mob,player(220),220,16);
  assert.equal(nav.state,'combat');
  mob.enemy.x=900;
  mob.enemy.hp=50;
  nav.track(mob,player(350),350,3000);
  assert.equal(nav.state,'combat','there is no limit around home');
  assert.equal(mob.enemy.hp,50);
  nav.track(mob,player(501),501,1900);
  nav.track(mob,player(500),500,100);
  nav.track(mob,player(501),501,1900);
  assert.equal(nav.state,'combat');
  nav.track(mob,player(501),501,100);
  assert.equal(nav.state,'returning');
  assert.equal(mob.aggro,null);
  nav.track(mob,player(350),350,1000);
  assert.equal(mob.enemy.hp,53);
  assert.equal(nav.state,'returning');
  nav.track(mob,player(219),219,1000);
  assert.equal(nav.state,'combat');
  assert.equal(mob.enemy.hp,53,'regen stops as soon as detection reacquires');
  assert.equal(mob.aggro.reengaged,true);
  nav.disengage(mob,false);
  mob.bout.hitEnemy({damage:100},mob,mob.enemy,player(350));
  mob.update(1000,player(500));
  assert.equal(mob.enemy.hp,0,'a dead mob cannot regenerate');
});

test('a returning Slime hit can reaggro into its existing Homing Shot only when cooldown and line of sight allow',()=>{
  const terrain=terrainFor('slime',[]);
  const mob=createMob({id:'slime',kind:'slime',x:300,y:300},terrain);
  const nav=mob.navigation,bout=mob.bout,player={x:410,y:300,displayHeight:64};
  bout.ai.antiKiting=true;
  mob.update(10,player);
  assert.equal(mob.aggro.reengaged,undefined);
  nav.disengage(mob,false);
  const beyond={...player,x:900};
  bout.hitEnemy({damage:1},mob,mob.enemy,beyond);
  assert.equal(mob.aggro,null);
  bout.hitEnemy({damage:1},mob,mob.enemy,player);
  assert.equal(mob.aggro.reengaged,true);
  const hasLine=bout.clearLine.bind(bout);
  bout.clearLine=()=>false;
  mob.update(16,player);
  assert.notEqual(mob.attack?.kind,'homing');
  bout.clearLine=hasLine;
  mob.hop=null;mob.phase='idle';
  mob.update(16,player);
  assert.equal(mob.attack.kind,'homing');
  assert.equal(nav.counterMs,SWAMP_AGGRO.counterCooldownMs);
  nav.disengage(mob,false);
  bout.hitEnemy({damage:1},mob,mob.enemy,player);
  assert.equal(mob.aggro.reengaged,undefined);
  assert.equal(mob.phase,'idle');
});

test('Frog can use the existing Long Leap on reengagement without changing the first aggro',()=>{
  const frog=createMob({id:'frog',kind:'frog',x:300,y:300},terrainFor('frog',[]),{random:()=>0.99});
  const target={x:486,y:300,displayHeight:64};
  frog.cooldown=0;
  frog.update(16,target);
  assert.notEqual(frog.attack?.kind,'frog-long-leap');
  frog.navigation.disengage(frog,false);
  frog.longLeapMs=0;
  frog.update(16,target);
  assert.equal(frog.attack.kind,'frog-long-leap');
  assert.equal(frog.attack.leap.windupMs,frog.spec.longLeap.windupMs);
  assert.equal(frog.navigation.counterMs,SWAMP_AGGRO.counterCooldownMs);
});

test('Frog and Slime detour around a solid block, then route the same way home',()=>{
  const obstacle={x:285,y:250,width:38,height:106};
  const walls=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[obstacle]}]});
  for(const kind of ['frog','slime']){
    const home={x:238,y:300},target={x:445,y:300,displayHeight:64};
    const mob=createMob({id:kind,kind,...home},terrainFor(kind,walls));
    acquireAggro(mob);
    let usedRoute=false;
    for(let i=0;i<700;i++){
      ticks(mob,target,1);
      usedRoute||=Boolean(mob.navigation.waypoints?.length);
      if(mob.enemy.x>345)break;
    }
    assert.ok(usedRoute&&mob.enemy.x>345,kind+' reaches the open side');
    const far={x:1500,y:300,displayHeight:64};
    ticks(mob,far,900);
    assert.ok(Math.hypot(mob.enemy.x-home.x,mob.enemy.y-home.y)<=1,kind+' returns to spawn');
  }
});

test('an unreachable target causes controlled disengagement within the route timeout',()=>{
  const walls=readFootObstacles({layers:[{type:'objectgroup',name:'Collision',objects:[
    {x:320,y:0,polyline:[{x:0,y:0},{x:0,y:1920}]},
  ]}]});
  const mob=createMob({id:'snake',kind:'snake',x:200,y:300},terrainFor('snake',walls));
  acquireAggro(mob);
  ticks(mob,{x:400,y:300},1+Math.ceil(SWAMP_AGGRO.noRouteAfterMs/16));
  assert.equal(mob.aggro,null);
  assert.notEqual(mob.navigation.state,'combat');
});

test('dev spawns are free of obstacles, occupied feet and walls separating them from the player',()=>{
  const kind='frog';
  const terrain=terrainFor(kind);
  const player={x:340,y:1370};
  const occupied=[createMob({...player,x:388,id:'existing',kind},terrain)];
  const spawn=findNearbyMobSpawn(player,terrain,occupied,SWAMP_MOB_TERRAIN[kind].footRadius);
  assert.ok(spawn&&terrain.clear(spawn)&&terrain.sees(spawn,player));
  assert.ok(Math.hypot(spawn.x-occupied[0].enemy.x,spawn.y-occupied[0].enemy.y)>=28);
  assert.equal(findNearbyMobSpawn(player,{clear:()=>true,sees:()=>false},[],12),null);
});

test('ambush warns once, reveals after 760 ms, and resets without an outstanding callback',()=>{
  const ambush=new SwampAmbush(SWAMP_AMBUSH);
  const player=SWAMP_AMBUSH.trigger;
  assert.equal(ambush.update(1000,{x:20,y:20},()=>true),undefined);
  assert.equal(ambush.update(20,player,()=>false),undefined);
  assert.equal(ambush.update(16,player,()=>true),'warning');
  assert.equal(ambush.update(759,player,()=>true),undefined);
  assert.equal(ambush.update(1,player,()=>true),'spawn');
  assert.equal(ambush.update(1000,player,()=>true),undefined);
  ambush.reset();
  assert.equal(ambush.update(16,player,()=>true),'warning');
  ambush.reset();
  assert.equal(ambush.update(1000,{x:20,y:20},()=>true),undefined);
});

test('applying a trigger zone around the player waits for their feet to exit and re-enter',()=>{
  for(const trigger of [
    {shape:'rectangle',x:200,y:300,width:100,height:20},
    {shape:'circle',x:200,y:300,radius:50},
  ]){
    const edits=new SpawnEdits([SWAMP_AMBUSH.spawn],{},SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,'snake');
    const [spawn]=edits.snapshot().ambushes;
    spawn.trigger=trigger;
    const mobs=Object.assign(Object.create(SwampMobs.prototype),{
      ambushes:[],run:{defeated:new Set()},editor:{applied:{ambushes:[spawn]}},
    });
    mobs.resetAmbushState(undefined,{x:200,y:300});
    const [{controller}]=mobs.ambushes;
    const enter={x:250,y:300};
    const outside={x:200,y:trigger.shape==='rectangle'?311:351};
    assert.equal(controller.update(16,enter,()=>true),undefined);
    assert.equal(controller.update(16,outside,()=>true),undefined);
    assert.equal(controller.update(16,enter,()=>false),undefined);
    assert.equal(controller.update(16,enter,()=>true),'warning');
  }
});
