import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ReturnTrap } from '../src/swamp/ReturnTrap.js';
import { SWAMP_AMBUSH, SWAMP_MOB_TERRAIN, swampEncounterSpawns } from '../src/swamp/mobConfig.js';
import { SwampRun } from '../src/swamp/SwampRun.js';
import { SwampMobs } from '../src/swamp/SwampMobs.js';
import { createMobTerrain, SwampAmbush } from '../src/swamp/mobMovement.js';
import { SpawnEdits, validateSpawnPosition } from '../src/swamp/spawnEdits.js';
import { readFootObstacles } from '../src/maps/footCollision.js';

const config=SWAMP_AMBUSH.returnTrap;
const walk=(sample,steps,x=config.a.x)=>steps.map(y=>sample({x,y}));
const advance=[1190,1160,1120,1080,1040,1000,980];
const retreat=[1000,1040,1080,1120,1160,1180];

test('the return trap requires a complete advance before a reverse crossing',()=>{
  const trap=new ReturnTrap(config);
  assert.ok(walk(p=>trap.sample(p),advance).every(result=>!result));
  assert.equal(trap.phase,'armed');
  assert.deepEqual(walk(p=>trap.sample(p),retreat),[false,false,false,false,false,true]);
  assert.ok(walk(p=>trap.sample(p),[...advance,...retreat]).every(result=>!result));
});

test('partial travel, wrong-way entry, side passages and teleports do not trigger',()=>{
  const trap=new ReturnTrap(config);
  const sample=p=>trap.sample(p);
  for(const steps of [[1130,1160,1180],[1190,1160,1120,1160,1180],[1190,1160,980,1160,1180],
    [1190,1160,1172,1172,1181]]){
    trap.reset();
    assert.ok(walk(sample,steps).every(result=>!result));
  }
  trap.reset();
  assert.ok(walk(sample,[...advance,...retreat],config.a.x+config.halfWidth+1).every(result=>!result));
});

test('combat and visibility conditions are evaluated at the reverse crossing',()=>{
  for(const options of [{inCombat:false},{inCombat:true,canTrigger:()=>false},{inCombat:true}]){
    const trap=new ReturnTrap({...config,requireCombat:true});
    const sample=p=>trap.sample(p,options);
    walk(sample,advance);
    assert.equal(walk(sample,retreat).at(-1),options.inCombat&&!options.canTrigger);
  }
});

test('the Snake gets a warning and reaction delay, and the run keeps the trap spent through death and scene reload',()=>{
  const run=new SwampRun(),actors=[];
  const graphics={setPosition(){return this;},setDepth(){return this;},clear(){return this;},
    fillStyle(){return this;},fillTriangle(){return this;},destroy(){}};
  const scene={add:{graphics:()=>graphics},physics:{world:{bounds:{height:1920}}}};
  function mount(state){
    return Object.assign(Object.create(SwampMobs.prototype),{
      run:state,scene,ambushMode:'return-trap',ambush:new SwampAmbush(SWAMP_AMBUSH),
      returnTrap:new ReturnTrap(config),activeAmbushSpawn:SWAMP_AMBUSH.spawn,bout:{enemies:[]},
      terrain:{snake:{sees:()=>true}},add(spawn){
        const mob={spawn,cooldown:20};
        actors.push(mob);
        return mob;
      },
    });
  }
  const mobs=mount(run);
  walk(point=>mobs.updateAmbush(16,point),[...advance,...retreat]);
  assert.equal(mobs.ambush.phase,'warning');
  assert.equal(actors.length,0);
  mobs.updateAmbush(SWAMP_AMBUSH.warningMs,{x:1665,y:1180});
  assert.equal(actors.length,1);
  assert.equal(actors[0].spawn.kind,'snake');
  assert.equal(actors[0].cooldown,config.reactionMs);
  assert.ok(actors[0].aggro);
  run.respawn();
  const restored=new SwampRun(run.config,run.snapshot());
  const reentered=mount(restored);
  walk(point=>reentered.updateAmbush(16,point),[...advance,...retreat]);
  assert.equal(reentered.ambush.phase,'hidden');
  restored.restart();
  reentered.resetAmbushState();
  walk(point=>reentered.updateAmbush(16,point),[...advance,...retreat]);
  assert.equal(reentered.ambush.phase,'warning');
});

test('both authored markers and the editable Snake spawn fit the real map',()=>{
  const map=JSON.parse(readFileSync(new URL('../public/assets/maps/swamp-v3-large.tmj',import.meta.url)));
  const walls=readFootObstacles(map),bounds={left:0,right:1920,top:0,bottom:1920};
  const terrain={marker:createMobTerrain(walls,bounds,8),snake:createMobTerrain(walls,bounds,15)};
  const points=[...swampEncounterSpawns(),SWAMP_AMBUSH.spawn,config.a,config.b];
  for(const point of [config.a,config.b,SWAMP_AMBUSH.spawn])
    assert.equal(validateSpawnPosition(point,point,points,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH),'');
  assert.equal(terrain.marker.canReach(config.a,config.b),true);
  terrain.frog=createMobTerrain(walls,bounds,12);
  const edits=new SpawnEdits(points,terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  assert.match(edits.move(config.a.id,config.b),/apart/);
  assert.equal(edits.move(config.b.id,{x:1665,y:1000}),'');
  assert.deepEqual(edits.data().positions,{'east-return-b':{x:1665,y:1000}});
});
