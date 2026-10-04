import test from 'node:test';
import assert from 'node:assert/strict';
import { readPvpTeleportAreas,PvpTeleportController } from '../src/pvp/teleports.js';

const map=layers=>({layers});
const areas=[{name:'top',x:100,y:40,width:36,height:20},{name:'bottom',x:500,y:760,width:36,height:20}];
const body=(x,y)=>({x,y,width:20,height:12});

test('Tiled Teleport/top and Teleport/bottom rectangles are read with layer offsets; missing layer stays inactive',()=>{
  assert.deepEqual(readPvpTeleportAreas(map([])),[]);
  const source=map([{name:'Teleport',type:'objectgroup',offsetx:10,offsety:5,objects:areas}]);
  assert.deepEqual(readPvpTeleportAreas(source),[
    {name:'top',x:110,y:45,width:36,height:20},{name:'bottom',x:510,y:765,width:36,height:20},
  ]);
  assert.throws(()=>readPvpTeleportAreas(map([{name:'Teleport',type:'objectgroup',objects:[areas[0]]}])),/both rectangle objects/);
  assert.throws(()=>readPvpTeleportAreas(map([{name:'Teleport',type:'objectgroup',objects:[{...areas[0],rotation:5},areas[1]]}])),/unrotated rectangle/);
});

test('entering top moves to bottom center and entering bottom moves to top center',()=>{
  const forward=new PvpTeleportController(areas),backward=new PvpTeleportController(areas);
  assert.deepEqual(forward.update(body(105,45),100),{from:'top',to:'bottom',x:518,y:770});
  assert.deepEqual(backward.update(body(515,765),100),{from:'bottom',to:'top',x:118,y:50});
});

test('destination lock prevents ping-pong even when arrival is inside the opposite trigger',()=>{
  const controller=new PvpTeleportController(areas,{cooldownMs:650});
  const arrival=controller.update(body(105,45),100);
  assert.ok(arrival);
  assert.equal(controller.update(body(arrival.x-10,arrival.y-6),101),null);
  assert.equal(controller.update(body(arrival.x-10,arrival.y-6),2000),null,
    'remaining inside destination does not bounce after cooldown');
});

test('cooldown blocks reentry after leaving destination, then the other entrance works',()=>{
  const controller=new PvpTeleportController(areas,{cooldownMs:650});
  controller.update(body(105,45),100);
  assert.equal(controller.update(body(0,0),200),null);
  assert.equal(controller.update(body(105,45),700),null,'cooldown remains until 750ms');
  assert.deepEqual(controller.update(body(105,45),751),{from:'top',to:'bottom',x:518,y:770});
});

test('teleport controller changes only position and retains its lock until the destination is exited',()=>{
  const fighter={playerId:'alice',team:'A',hp:75,life:2,kills:3,deaths:1};
  const before=structuredClone(fighter),controller=new PvpTeleportController(areas);
  const destination=controller.update(body(105,45),100);
  const position={x:destination.x,y:destination.y};
  assert.deepEqual(fighter,before);
  assert.deepEqual(position,{x:518,y:770});
  assert.equal(controller.update(body(508,764),900),null);
  controller.update(body(0,0),901);
  assert.deepEqual(controller.update(body(515,765),902),{from:'bottom',to:'top',x:118,y:50});
});
