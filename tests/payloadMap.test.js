import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collisionAreas } from '../src/maps/collision.js';
import { objectsIn,resolveSpawn } from '../src/maps/tiledObjects.js';
import { PAYLOAD_MAP_TEST_PORTAL } from '../src/maps/payloadMapTest.js';
import { PLAYER_SCALE } from '../src/game/settings.js';
import { PVP_MAP_FILE,PVP_MAP_LAYOUT } from '../src/pvp/config.js';
import { teamSpawn } from '../src/pvp/spawns.js';
import { routeFromMap,pointAt } from '../src/pvp/payload/route.js';
import { mapLayerDepth } from '../src/maps/layerDepth.js';
import { segmentRect } from '../src/pvp/projectiles.js';

const repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
const map=JSON.parse(readFileSync(resolve(repoRoot,'public/assets/maps',PVP_MAP_FILE),'utf8'));
const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;

test('Payload map loads its image and defines a clear arrival point',()=>{
  assert.equal(PVP_MAP_FILE,'payload-map.tmj');
  for(const imageLayer of map.layers.filter(layer=>layer.type==='imagelayer')){
    assert.ok(imageLayer.image);
    assert.ok(existsSync(resolve(repoRoot,'public/assets/maps',imageLayer.image)));
  }
  assert.deepEqual(resolveSpawn(map,{targetSpawn:PAYLOAD_MAP_TEST_PORTAL.targetSpawn}),{x:736,y:495});
  const feet={x:736-10*PLAYER_SCALE,y:495-12*PLAYER_SCALE,width:20*PLAYER_SCALE,height:12*PLAYER_SCALE};
  assert.ok(!collisionAreas(objectsIn(map,'Collision')).some(area=>overlaps(feet,area)));
});

test('authored Payload collisions load without depending on a fixed count while the map is edited',()=>{
  const source=objectsIn(map,'Collision'),areas=collisionAreas(source);
  assert.ok(source.length>0);assert.ok(areas.length>0);
  assert.ok(areas.every(area=>area.shape==='rectangle'&&area.width>0&&area.height>0));
});

test('both teams use four authored square spawns clear of collisions and inside map bounds',()=>{
  const walls=collisionAreas(objectsIn(map,'Collision'));
  for(const team of ['A','B']){
    const definition=PVP_MAP_LAYOUT.teamMarkers[team];
    const marker=objectsIn(map,definition.layer).find(p=>p.name===definition.name);
    const spawns=Array.from({length:4},(_,index)=>teamSpawn(map,team,index));
    assert.deepEqual(spawns.map(spawn=>spawn.name),Array.from({length:4},(_,index)=>`team${team}_spawn${index+1}`));
    assert.equal(new Set(spawns.map(spawn=>`${spawn.x},${spawn.y}`)).size,4);
    assert.deepEqual([...new Set(spawns.map(spawn=>spawn.x))].sort((a,b)=>a-b).map((x,i,all)=>i?x-all[i-1]:null).filter(Number.isFinite),[32]);
    assert.deepEqual([...new Set(spawns.map(spawn=>spawn.y))].sort((a,b)=>a-b).map((y,i,all)=>i?y-all[i-1]:null).filter(Number.isFinite),[32]);
    assert.ok(spawns.some(spawn=>spawn.x===marker.x&&spawn.y===marker.y),'one corner remains at the authored base marker');
    assert.ok(spawns.some(spawn=>spawn.x===marker.x&&spawn.y===marker.y+32),'the original second teammate point remains one tile below the base');
    for(const [index,spawn] of spawns.entries()){
      assert.equal(spawn.direction,definition.direction);
      assert.ok(spawn.x>0&&spawn.x<map.width*map.tilewidth&&spawn.y>0&&spawn.y<map.height*map.tileheight);
      const feet={x:spawn.x-10*PLAYER_SCALE,y:spawn.y-12*PLAYER_SCALE,width:20*PLAYER_SCALE,height:12*PLAYER_SCALE};
      assert.ok(!walls.some(area=>overlaps(feet,area)),`${team}/${index} feet must not overlap authored collision`);
    }
  }
});

test('numbered team Spawns override temporary Notes markers and support authored direction/offsets',()=>{
  const source=structuredClone(map),layer=source.layers.find(p=>p.name==='Spawns');
  layer.offsetx=5;layer.offsety=7;
  layer.objects.push({name:'teamA_spawn2',x:200,y:300,properties:[{name:'direction',value:'up'}]},
    {name:'teamA_spawn1',x:150,y:300});
  assert.equal(teamSpawn(source,'A',0).x,155);
  assert.deepEqual({x:teamSpawn(source,'A',1).x,y:teamSpawn(source,'A',1).y,direction:teamSpawn(source,'A',1).direction},
    {x:205,y:307,direction:'up'});
  assert.equal(teamSpawn(source,'A',2).name,'teamA_spawn1');
  assert.throws(()=>teamSpawn(source,'Z'),/marker/);
});

test('temporary Payload route connects Blue to Red; an authored polyline is loaded in the same order at 50%',()=>{
  const route=routeFromMap(map);
  assert.deepEqual(route.points,['A','B'].map(team=>{const {x,y}=teamSpawn(map,team);return {x,y};}));
  assert.equal(route.initialFraction,0.5);
  assert.deepEqual(pointAt(route,route.length/2),{x:(route.points[0].x+route.points[1].x)/2,y:(route.points[0].y+route.points[1].y)/2});
  for(const wall of collisionAreas(objectsIn(map,'Collision')))
    assert.equal(segmentRect(route.points[0],route.points[1],wall),null,'temporary centerline must be clear');
  const source=structuredClone(map);
  const blue=teamSpawn(source,'A'),red=teamSpawn(source,'B');
  source.layers.push({name:'PayloadRoute',type:'objectgroup',offsetx:10,offsety:20,objects:[{name:'payload-route',x:blue.x-20,y:blue.y-40,
    polyline:[{x:10,y:20},{x:-490,y:-60},{x:red.x-blue.x+10,y:red.y-blue.y+20}]}]});
  const authored=routeFromMap(source);
  assert.deepEqual(authored.points,[{x:blue.x,y:blue.y},{x:blue.x-500,y:blue.y-80},{x:red.x,y:red.y}]);
  assert.equal(authored.initialFraction,0.5);
  source.layers.at(-1).objects[0].polyline=[{x:red.x-blue.x+10,y:red.y-blue.y+20},{x:10,y:20}];
  const reversed=routeFromMap(source);
  assert.deepEqual(reversed.points,[{x:blue.x,y:blue.y},{x:red.x,y:red.y}],'reversed authored route is rejected for the temporary safe route');
});

test('image and tile foreground conventions stay above player depths while authored depth wins',()=>{
  assert.equal(mapLayerDepth({name:'background'},map),-3);
  for(const name of ['Overlay','overlay','Foreground','FOREGROUND'])for(const type of ['imagelayer','tilelayer'])
    assert.ok(mapLayerDepth({name,type},map)>map.height*map.tileheight);
  const overlay=map.layers.find(l=>l.name.toLowerCase()==='overlay');
  assert.equal(mapLayerDepth(overlay,map),1200);
  assert.equal(mapLayerDepth({name:'Foreground',properties:[{name:'depth',value:1300}]},map),1300);
  assert.equal(mapLayerDepth({name:'Floor'},map,-2),-2);
});

test('rotated authored rectangles preserve the Tiled origin and angle through shared collision conversion',()=>{
  const areas=collisionAreas([{x:100,y:200,width:20,height:10,rotation:90}]);
  assert.ok(areas.length>0);
  const bounds={x:Math.min(...areas.map(p=>p.x)),y:Math.min(...areas.map(p=>p.y)),
    right:Math.max(...areas.map(p=>p.x+p.width)),bottom:Math.max(...areas.map(p=>p.y+p.height))};
  for(const [key,value] of Object.entries({x:90,y:200,right:100,bottom:220}))
    assert.ok(Math.abs(bounds[key]-value)<1e-8);
  assert.deepEqual(collisionAreas([{x:10,y:20,width:30,height:40,rotation:0}]),
    [{shape:'rectangle',x:10,y:20,width:30,height:40}]);
  const polygon=collisionAreas([{x:100,y:200,width:0,height:0,rotation:90,polygon:[{x:0,y:0},{x:20,y:0},{x:20,y:10},{x:0,y:10}]}]);
  assert.deepEqual(polygon,areas);
});
