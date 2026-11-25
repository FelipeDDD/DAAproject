import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ReturnTrap, returnTrapAxis } from '../src/swamp/ReturnTrap.js';
import { SWAMP_AMBUSH, SWAMP_EMERGENCE, SWAMP_MOB_TERRAIN, swampEncounterSpawns } from '../src/swamp/mobConfig.js';
import { SwampRun } from '../src/swamp/SwampRun.js';
import { SwampMobs } from '../src/swamp/SwampMobs.js';
import { createMobTerrain } from '../src/swamp/mobMovement.js';
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

test('diagonal gates require crossing each finite segment, with independent lengths',()=>{
  const a={x:100,y:100},b={x:200,y:200};
  const trap=new ReturnTrap({...config,a,b,gateALength:120,gateBLength:48});
  const axis=returnTrapAxis(a,b);
  const lines=[];
  const debug={lineStyle(){return this;},strokeCircle(){return this;},lineBetween(...points){lines.push(points);return this;}};
  SwampMobs.prototype.drawAmbushMarkers.call({debug},{
    visualOrigin:a,x:a.x,y:a.y,spawnType:'return-trap',a,b,gateALength:120,gateBLength:48,
  });
  for(const [i,[x1,y1,x2,y2]] of lines.slice(-2).entries()){
    assert.ok(Math.abs(Math.hypot(x2-x1,y2-y1)-[120,48][i])<1e-8);
    assert.ok(Math.abs((x2-x1)*axis.x+(y2-y1)*axis.y)<1e-8);
  }
  const walk=(steps,lane)=>steps.map(offset=>trap.sample({
    x:a.x+axis.x*offset-axis.y*lane,y:a.y+axis.y*offset+axis.x*lane,
  }));
  const advance=[-10,12,40,68,96,124,152,174],retreat=[148,120,92,64,36,8,-12];
  walk(advance,30);
  assert.equal(trap.phase,'awaiting-b');
  assert.equal(walk(retreat,30).at(-1),false);
  trap.reset();
  walk(advance,20);
  assert.equal(trap.phase,'armed');
  assert.equal(walk(retreat,20).at(-1),true);
  trap.reset();
  walk(advance,20);
  walk([174],50);
  walk([174],70);
  assert.equal(walk(retreat,70).at(-1),false);
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
    fillStyle(){return this;},fillRect(){return this;},destroy(){}};
  const scene={add:{graphics:()=>graphics,sprite:()=>({setOrigin(){return this;},destroy(){}})},
    playerFootRadius:8,physics:{world:{bounds:{height:1920}}}};
  function mount(state){
    const terrain={snake:{sees:()=>true,clear:()=>true}};
    const edits=new SpawnEdits([SWAMP_AMBUSH.spawn,config.a,config.b],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH,'return-trap');
    const mobs=Object.assign(Object.create(SwampMobs.prototype),{
      run:state,scene,ambushes:[],entries:[],editor:{applied:edits.snapshot()},bout:{enemies:[]},
      terrain,drawEmerging(){},add(spawn){
        const mob={spawn,cooldown:20};
        actors.push(mob);
        return mob;
      },
    });
    mobs.resetAmbushState();
    return mobs;
  }
  const mobs=mount(run),[event]=mobs.ambushes;
  walk(point=>mobs.updateAmbush(event,16,point),[...advance,...retreat]);
  assert.equal(event.controller.phase,'warning');
  assert.equal(actors.length,0);
  const feet={x:1665,y:1180};
  mobs.updateAmbush(event,SWAMP_AMBUSH.warningMs,feet);
  assert.equal(event.controller.phase,'emerging');
  assert.equal(actors.length,0);
  mobs.updateAmbush(event,SWAMP_EMERGENCE.durationMs,feet);
  assert.equal(actors.length,1);
  assert.equal(actors[0].spawn.kind,'snake');
  assert.equal(actors[0].cooldown,config.reactionMs);
  assert.ok(actors[0].aggro);
  run.respawn();
  const restored=new SwampRun(run.config,run.snapshot());
  const reentered=mount(restored);
  const walkAgain=()=>walk(point=>reentered.updateAmbush(reentered.ambushes[0],16,point),[...advance,...retreat]);
  walkAgain();
  assert.equal(reentered.ambushes[0].controller.phase,'hidden');
  restored.restart();
  reentered.resetAmbushState();
  walkAgain();
  assert.equal(reentered.ambushes[0].controller.phase,'warning');

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

test('Return Trap lengths and in-place emergence round-trip without shifting the gates or stored hiding spot',()=>{
  const bounds={left:0,right:1920,top:0,bottom:1920};
  const terrain={snake:createMobTerrain([],bounds,15),marker:createMobTerrain([],bounds,8)};
  const model=()=>new SpawnEdits([],terrain,SWAMP_MOB_TERRAIN,SWAMP_AMBUSH);
  const edits=model(),point={x:330,y:430};
  const {id,error}=edits.add('snake','',point,{spawnType:'return-trap',spawnInPlace:true,gateALength:840,gateBLength:105,quantity:2});
  assert.equal(error,'');
  const before=edits.event(edits.get(id));
  assert.deepEqual(before.visualOrigin,point);
  assert.equal(edits.configure(id,{gateALength:0}),'Enter a positive gate length in pixels.');
  assert.equal(edits.move(id,{x:350,y:440}),'');
  const loaded=model();
  loaded.load(JSON.parse(JSON.stringify(edits.data())));
  const event=loaded.event(loaded.get(id));
  assert.equal(event.quantity,2);
  assert.match(loaded.configure(id,{quantity:4}),/1 to 3/);
  assert.deepEqual(event.visualOrigin,{x:350,y:440});
  assert.deepEqual([event.a,event.b,event.gateALength,event.gateBLength],[before.a,before.b,840,105]);
  assert.equal(loaded.configure(id,{spawnInPlace:false}),'');
  assert.deepEqual(loaded.event(loaded.get(id)).visualOrigin,point);
});

test('one Return Trap releases a separated group and Repeat waits for the last Snake',()=>{
  const run=new SwampRun(),bounds={left:0,right:1920,top:0,bottom:1920};
  const ground=createMobTerrain([],bounds,15);
  const spawn={...SWAMP_AMBUSH.spawn,spawnType:'return-trap',visualOrigin:SWAMP_AMBUSH.bush,
    trigger:SWAMP_AMBUSH.trigger,a:config.a,b:config.b,quantity:2,repeat:true,cooldownSeconds:1};
  const mobs=Object.assign(Object.create(SwampMobs.prototype),{
    run,terrain:{snake:ground},scene:{playerFootRadius:8},ambushes:[],entries:[],
    editor:{applied:{ambushes:[spawn]}},bout:{enemies:[]},drawAmbushPhase(){},
    add(point){
      const mob={spawnId:point.id,enemy:{x:point.x,y:point.y,hp:100},footRadius:15,cooldown:0};
      this.entries.push({mob});
      return mob;
    },
  });
  mobs.resetAmbushState();
  const [event]=mobs.ambushes;
  const tick=(now,ms,feet)=>mobs.updateAmbush(event,ms,feet,now);
  const cross=now=>walk(point=>tick(now,16,point),[...advance,...retreat]);
  const feet={x:1665,y:1180};
  const land=now=>{
    tick(now,SWAMP_AMBUSH.warningMs,feet);
    tick(now,SWAMP_EMERGENCE.durationMs,feet);
    assert.equal(mobs.entries.length,0);
    tick(now,SWAMP_EMERGENCE.staggerMs,feet);
    assert.equal(mobs.entries.length,2);
  };
  cross(10);land(10);
  const [first,second]=mobs.entries.map(entry=>entry.mob.enemy);
  assert.deepEqual([first.x,first.y],[spawn.x,spawn.y]);
  assert.ok(Math.hypot(first.x-second.x,first.y-second.y)>=30);
  mobs.entries.shift();
  cross(2000);
  assert.equal(event.controller.phase,'revealed');
  assert.equal(mobs.entries.length,1);
  mobs.entries.pop();
  cross(3000);land(3000);
});
