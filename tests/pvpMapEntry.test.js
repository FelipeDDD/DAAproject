import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { PVP_MAP,PVP_INSPECTION_SCENE,PVP_MAP_FILE,PVP_MAP_DEFINITION } from '../src/pvp/config.js';
import { requirePvpMap,pvpArenaDestination } from '../src/pvp/mapConfig.js';
import { PAYLOAD_MAP_TEST_PORTAL } from '../src/maps/payloadMapTest.js';
import { PvpTeleportController,readPvpTeleportAreas,pvpTeleportArrival } from '../src/pvp/teleports.js';
import { collisionAreas } from '../src/maps/collision.js';
import { objectsIn } from '../src/maps/tiledObjects.js';
import { PLAYER_SCALE } from '../src/game/settings.js';

const read=path=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const source=JSON.parse(read(`public/assets/maps/${PVP_MAP_FILE}`));
const evaluate=(path,context,name)=>runInNewContext(read(path).replace(/^import[\s\S]*?;\r?\n/gm,'')
  .replaceAll('import.meta.env','({DEV:true})').replace(`export class ${name}`,`class ${name}`)+`\n${name}`,context);

function mapSceneFixture(){
  const calls=[];
  class MapScene{
    constructor(key,filename){this.mapKey=key;this.filename=filename;this.source=source;}
    preload(){calls.push(['preload',this.filename]);}
    enter(){calls.push(['enter']);}
    update(){calls.push(['update']);}
  }
  const Shared=evaluate('src/scenes/PvpMapScene.js',{MapScene,PVP_MAP_FILE,PVP_MAP_DEFINITION,
    PvpTeleportController,readPvpTeleportAreas,pvpTeleportArrival,Date},'PvpMapScene');
  return {Shared,calls};
}

test('all entry modes and Retry resolve only the authoritative physical map, never the logical scene name as a filename',()=>{
  for(const mode of ['tdm','payload'])for(const round of [0,1,2]){
    const state={mode,round,arenaMap:PVP_MAP_DEFINITION};
    assert.equal(requirePvpMap(state).file,'payload-map.tmj');
    assert.equal(pvpArenaDestination('match-a',state).targetMap,PVP_MAP);
  }
  for(const arenaMap of [undefined,{id:'pvp-arena-test',file:'pvp-arena-test.tmj',revision:1},
    {...PVP_MAP_DEFINITION,revision:0},{...PVP_MAP_DEFINITION,file:'pvp-arena-test.tmj'}])
    assert.throws(()=>pvpArenaDestination('match-a',{arenaMap}),/map configuration mismatch/);
});

test('DEV shortcut and lobby share the map loader and both register the real authored Teleport rectangles',()=>{
  const {Shared}=mapSceneFixture();
  const Inspect=evaluate('src/scenes/PayloadMapScene.js',{PvpMapScene:Shared,PVP_INSPECTION_SCENE,Date},'PayloadMapScene');
  const Live=evaluate('src/scenes/PvpArenaScene.js',{PvpMapScene:Shared,PVP_MAP},'PvpArenaScene');
  const live=new Live(),inspection=new Inspect();
  assert.equal(PAYLOAD_MAP_TEST_PORTAL.targetMap,inspection.mapKey);
  for(const scene of [live,inspection]){
    assert.equal(scene.filename,PVP_MAP_FILE);assert.equal(scene.reloadMapOnEntry,true);
    assert.match(scene.sourceKey,/payload-map-1-source$/);assert.notEqual(scene.sourceKey,'pvp-arena-test-source');
    scene.initializePvpTeleports();assert.deepEqual(scene.teleports.areas.map(p=>p.name),['top','bottom']);
  }
  inspection.enter();assert.equal(inspection.teleports.areas.length,2);
});

test('new entry evicts only map caches and reloads the same configured asset instead of reusing a slept snapshot',()=>{
  const {Shared,calls}=mapSceneFixture(),scene=new Shared(PVP_MAP),removed=[];
  scene.cache={json:{remove:key=>removed.push(key)},tilemap:{remove:key=>removed.push(key)},
    xml:{getKeys:()=>[`${PVP_MAP}-tileset-0`,'office3-tileset-0'],remove:key=>removed.push(key)}};
  scene.textures={getTextureKeys:()=>[`${PVP_MAP}-tileset-0`,`${PVP_MAP}-image-layer-1`,'student'],remove:key=>removed.push(key)};
  scene.preload();
  assert.deepEqual(calls,[['preload',PVP_MAP_FILE]]);assert.ok(Number.isFinite(scene.mapLoadVersion));
  assert.ok(removed.includes(scene.sourceKey));assert.ok(removed.includes(PVP_MAP));
  assert.ok(!removed.includes('student'));assert.ok(!removed.includes('office3-tileset-0'));
});

test('travelling from either browser restarts a slept PvP scene without validating or waking the obsolete source',()=>{
  const Map=evaluate('src/scenes/MapScene.js',{Phaser:{Scene:class{}},PVP_MAP},'MapScene');
  const calls=[],scene=Object.create(Map.prototype),arrival=pvpArenaDestination('match-a',{arenaMap:PVP_MAP_DEFINITION});
  Object.assign(scene,{mapKey:'school',player:{x:50,y:60,setVelocity(){}},input:{keyboard:{resetKeys(){}}},
    scene:{manager:{keys:{[PVP_MAP]:{source:{layers:[]},reloadMapOnEntry:true}}},sleep:()=>calls.push('sleep'),
      isSleeping:()=>!calls.includes('stop'),stop:()=>calls.push('stop'),launch:(key,args)=>calls.push([key,args]),wake:()=>calls.push('wake')}});
  scene.travelTo(arrival);
  assert.equal(scene.doorMessage,undefined);assert.deepEqual(calls.slice(0,2),['sleep','stop']);
  assert.equal(calls[2][0],PVP_MAP);assert.equal(calls.includes('wake'),false);
});

test('both authored narrow edge triggers teleport in walking inspection; feet land clear of existing walls and remote sync is signalled',()=>{
  const {Shared}=mapSceneFixture(),walls=collisionAreas(objectsIn(source,'Collision'));
  for(const [from,to] of [['top','bottom'],['bottom','top']]){
    const scene=new Shared(PVP_INSPECTION_SCENE);scene.initializePvpTeleports();
    const origin=scene.teleports.areas.find(p=>p.name===from),destination=scene.teleports.areas.find(p=>p.name===to);
    const width=20*PLAYER_SCALE,height=12*PLAYER_SCALE,x=origin.x+origin.width/2,y=origin.y+origin.height/2+height/2;
    const body={x:x-width/2,y:y-height,width,height,
      transform:{scaleX:PLAYER_SCALE,scaleY:PLAYER_SCALE,displayOriginX:16,displayOriginY:56},offset:{x:6,y:44}};let flags=0;
    scene.player={x,y,body,setVelocity(){return this;},setDepth(){return this;}};
    body.position={x:body.x,y:body.y};
    body.reset=(nextX,nextY)=>{scene.player.x=nextX;scene.player.y=nextY;body.x=nextX-16*PLAYER_SCALE;body.y=nextY-56*PLAYER_SCALE;};
    body.updateFromGameObject=()=>{body.x=scene.player.x-width/2;body.y=scene.player.y-height;body.position={x:body.x,y:body.y};};
    for(const name of ['prev','prevFrame','autoFrame'])body[name]={copy(pos){Object.assign(this,pos);}};
    scene.movementClient={markTeleport:()=>flags++};
    assert.ok(scene.updatePvpTeleports(1000));assert.equal(flags,1);
    assert.equal(body.prevFrame.x,body.x);assert.equal(body.prevFrame.y,body.y,'postUpdate must not apply the old foot offset as movement');
    assert.ok(body.x<destination.x+destination.width&&body.x+body.width>destination.x);
    assert.ok(!walls.some(w=>body.x<w.x+w.width&&body.x+body.width>w.x&&body.y<w.y+w.height&&body.y+body.height>w.y),to);
    assert.equal(scene.updatePvpTeleports(2000),null,'arrival remains locked until player exits');
  }
});

test('landing uses the intrinsic feet offset even before physics movement has been copied back to the sprite',()=>{
  const areas=readPvpTeleportAreas(source),target=areas[0],teleport={to:'top',x:target.x+target.width/2,y:target.y+target.height/2};
  const body={width:23,height:13.8,x:300,y:800,offset:{x:6,y:44},
    transform:{scaleX:1.15,scaleY:1.15,displayOriginX:16,displayOriginY:56}};
  const arrival=pvpTeleportArrival(teleport,areas,body,{x:400,y:900});
  assert.ok(Math.abs(arrival.y-(target.y+13.8))<1e-8);
  assert.ok(Math.abs(arrival.x-teleport.x)<1e-8);
});
