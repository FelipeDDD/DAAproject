import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readFootObstacles } from '../src/maps/footCollision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { SWAMP_AGGRO, SWAMP_AMBUSH, SWAMP_ENCOUNTERS, SWAMP_EXPERIMENTAL_GROUPS, SWAMP_MOB_TERRAIN, SWAMP_ROAMING, SWAMP_SPAWNS,
  swampEncounterSpawns } from '../src/swamp/mobConfig.js';
import { alertSwampPack, createCombatSpace, createMobTerrain, findNearbyMobSpawn, SwampAmbush, SwampMob } from '../src/swamp/mobMovement.js';
import { SwampMobs } from '../src/swamp/SwampMobs.js';
import { SpawnEdits } from '../src/swamp/spawnEdits.js';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { acquireAggro } from '../src/vfx/lab/combatAggro.js';

const bounds={left:0,top:0,right:1920,bottom:1920};
const map=JSON.parse(readFileSync(new URL('../public/assets/maps/swamp-v3-large.tmj',import.meta.url)));
const walls=readFootObstacles(map);
const terrainFor=(kind,obstacles=walls)=>createMobTerrain(obstacles,bounds,SWAMP_MOB_TERRAIN[kind].footRadius);
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
  assert.match(edits.move('east-bush',{x:330,y:390}),/ambush spawn/);
  assert.equal(edits.move('west-curve',{x:340,y:1306}),'');
  assert.deepEqual(edits.data().positions,{'west-curve':{x:340,y:1306}});
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

test('ambush variants wait for proximity, reveal only their selected payload and release the effect',()=>{
  for(const [mode,kind] of [['snake','snake'],['frog','frog'],['alarm',null]]){
    const calls=[];
    const graphics={
      setPosition(){return this;},setDepth(){return this;},clear(){return this;},
      fillStyle(){return this;},fillTriangle(){return this;},destroy(){calls.push('destroy');},
    };
    const mobs=Object.assign(Object.create(SwampMobs.prototype),{
      ambushMode:mode,ambush:new SwampAmbush(SWAMP_AMBUSH),activeAmbushSpawn:SWAMP_AMBUSH.spawn,
      scene:{add:{graphics:()=>graphics},physics:{world:{bounds}}},
      terrain:{frog:{sees:()=>true},snake:{sees:()=>true}},
      add(spawn){calls.push(spawn.kind);return {};},
    });
    mobs.updateAmbush(1000,{x:20,y:20});
    assert.equal(mobs.ambush.phase,'hidden');
    mobs.updateAmbush(1,SWAMP_AMBUSH.trigger);
    assert.ok(mobs.warning);
    mobs.updateAmbush(759,SWAMP_AMBUSH.trigger);
    assert.deepEqual(calls,[]);
    mobs.updateAmbush(1,SWAMP_AMBUSH.trigger);
    assert.deepEqual(calls,kind?['destroy',kind]:['destroy']);
    assert.equal(mobs.warning,null);
    mobs.ambush.reset();
    assert.equal(mobs.ambush.phase,'hidden');
  }
});

test('two mobs fight in the authored encounter and reset clears test actors without reviving a completed pair',()=>{
  const bout=new CombatBout(undefined,()=>0.5,()=>0.5,{continuous:true,space:createCombatSpace(walls,bounds)});
  const mobScene={
    bout,entries:[],vanquished:new Set(),groundAreas:{clear(){}},
    ambush:new SwampAmbush(SWAMP_AMBUSH),resetAmbushState(){this.ambush.reset();},
    clearWarning(){},clearDeathSpores(){},
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
