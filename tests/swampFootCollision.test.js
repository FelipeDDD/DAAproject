import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import {addMapCollision} from '../src/maps/collision.js';
import {createFootCollision,readFootObstacles} from '../src/maps/footCollision.js';

const read = path => readFileSync(new URL('../' + path,import.meta.url),'utf8');
const point = (x,y) => ({x,y});
const bounds = {left:0,top:0,right:1920,bottom:1920};
const polyline = (...points) => ({x:0,y:0,polyline:points});
const fixture = (objects,offsetx=0,offsety=0) => ({layers:[{name:'Collision',type:'objectgroup',objects,offsetx,offsety}]});
const resolver = (...objects) => createFootCollision(readFootObstacles(fixture(objects)),bounds,8);
const close = (actual,expected,tolerance=0.005) => assert.ok(Math.abs(actual-expected)<tolerance,actual+' versus '+expected);

test('authored Swamp walls load without losing their polygons or polylines',()=>{
  const source = JSON.parse(read('public/assets/maps/swamp-v3-large.tmj'));
  const authored = source.layers.find(layer=>layer.name==='Collision').objects;
  const objects = readFootObstacles(source);
  for(const kind of ['polygon','polyline']){
    const expected = authored.filter(object=>object[kind]);
    const parsed = objects.filter(object=>object.kind===kind);
    assert.ok(expected.length>0);
    assert.deepEqual(parsed.map(object=>object.points.length),expected.map(object=>object[kind].length));
    assert.ok(parsed.every(object=>object.edges.length>0));
  }
});

test('Tiled local points honor layer offset and rotation',()=>{
  const line = {x:30,y:60,rotation:90,polyline:[point(0,0),point(20,0)]};
  const [parsed] = readFootObstacles(fixture([line],11,-5));
  close(parsed.points[1].x,41);
  close(parsed.points[1].y,75);
});

test('a fast approach from either side hits a diagonal and keeps its tangential movement',()=>{
  const resolve = resolver(polyline(point(100,100),point(500,500)));
  const a = resolve(point(300,220),point(345,420));
  const b = resolve(point(220,300),point(420,345));
  close(a.x-a.y,8*Math.SQRT2);
  close(b.y-b.x,8*Math.SQRT2);
  close(a.x+a.y,765);
  close(b.x+b.y,765);
  const again = resolve(a,point(a.x+2,a.y+8));
  close(again.x-a.x,5);
  close(again.y-a.y,5);
});

test('acute corners stop inward movement and allow retreat, and an open curve leaves its final gap open',()=>{
  const resolve = resolver(polyline(point(140,240),point(240,140),point(340,240)));
  const corner = resolve(point(240,275),point(240,80));
  close(corner.x,240);
  close(corner.y,140+8*Math.SQRT2);
  const retreat = point(240,200);
  assert.deepEqual(resolve(corner,retreat),retreat);
  assert.deepEqual(resolve(point(240,275),point(240,210)),point(240,210));
  const horizontal = resolver(polyline(point(140,140),point(340,140)));
  const cap = horizontal(point(110,140),point(260,140));
  close(cap.x,132);
  close(cap.y,140);
});

test('concave polygons stay solid at high speed and eject an overlapping spawn; world edges slide',()=>{
  const solid = {x:100,y:100,polygon:[point(0,0),point(80,0),point(80,30),point(30,30),point(30,80),point(0,80)]};
  const resolve = resolver(solid);
  close(resolve(point(40,150),point(240,150)).x,92);
  const inNotch = point(156,155);
  assert.deepEqual(resolve(point(210,180),inNotch),inNotch);
  const restored = resolve(point(115,160),point(115,160));
  assert.ok(restored.x<92 || restored.x>138);
  const edge = resolve(point(1900,1900),point(2300,1911));
  close(edge.x,1912);
  close(edge.y,1911);
  assert.deepEqual(resolve(edge,point(2100,2200)),point(1912,1912));
});

test('the default MapScene path still creates legacy Arcade rectangles and applies the arena exclusion',()=>{
  const MapScene = runInNewContext(read('src/scenes/MapScene.js')
    .replace(/^import[\s\S]*?;\r?\n/gm,'').replaceAll('import.meta.env','({})')
    .replace('export class MapScene','class MapScene')+'\nMapScene',
  {Phaser:{Scene:class {}},addMapCollision});
  const rectangle = {name:'wall',x:10,y:20,width:30,height:40,rotation:0};
  const map = {getObjectLayer:name=>name==='Collision'?{objects:[rectangle,{...rectangle,name:'gate',x:80}]}:null};
  const zones=[], pairs=[];
  const group = {add:zone=>zones.push(zone)};
  const scene = Object.assign(Object.create(MapScene.prototype),{
    player:{},
    add:{zone:(...dimensions)=>({setOrigin:origin=>[...dimensions,origin]})},
    physics:{add:{staticGroup:()=>group,collider:(...args)=>pairs.push(args)}},
  });
  assert.equal(scene.createMapCollision(map),group);
  assert.deepEqual(zones,[[10,20,30,40,0],[80,20,30,40,0]]);
  assert.deepEqual(pairs,[[scene.player,group]]);
  zones.length=0;
  scene.collisionOptions=()=>({excludeNames:['gate']});
  scene.createMapCollision(map);
  assert.deepEqual(zones,[[10,20,30,40,0]]);
});

test('Swamp rectangles keep their Tiled bounds and slide against the circular foot',()=>{
  const resolve = resolver({x:100,y:100,width:30,height:100});
  close(resolve(point(70,140),point(125,155)).x,92);
  close(resolve(point(70,140),point(125,155)).y,155);
  close(resolve(point(150,140),point(110,140)).x,138);
});
