import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readDoors } from '../src/maps/doors.js';
import { objectsIn, resolveSpawn } from '../src/maps/tiledObjects.js';

const source = JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));
const destination = JSON.parse(readFileSync(new URL('../public/assets/maps/outside.tmj', import.meta.url)));

test('moving/resizing a Tiled door changes the runtime geometry without code coordinates', () => {
  const edited = structuredClone(source);
  const layer = edited.layers.find((l) => l.name === 'Doors');
  const door = layer.objects[0];
  door.x += 160;
  door.y += 64;
  door.width = 48;
  door.height = 24;
  layer.offsetx = 7;
  layer.offsety = 9;
  const result = readDoors(edited)[0];
  assert.equal(result.x, door.x + 7);
  assert.equal(result.y, door.y + 9);
  assert.equal(result.width, 48);
  assert.equal(result.height, 24);
});

test('door states and frame custom properties are read from Tiled', () => {
  const edited = structuredClone(source);
  const door = edited.layers.find((l) => l.name === 'Doors').objects[0];
  door.properties = [
    {name:'id',value:'edited-door'}, {name:'locked',value:true}, {name:'open',value:false},
    {name:'transition',value:false}, {name:'closedTexture',value:'sheet'}, {name:'closedFrame',value:3},
  ];
  const result = readDoors(edited)[0];
  assert.equal(result.id, 'edited-door');
  assert.equal(result.locked, true);
  assert.equal(result.open, false);
  assert.equal(result.transition, false);
  assert.deepEqual(result.closedVisual, {texture:'sheet',frame:3});
});

test('door orientation, hinge and independent half-open visual come from Tiled',()=>{
  const doors=readDoors(source),side=doors.find(door=>door.id==='note-door-190');
  const transition=doors.find(door=>door.id==='exit_main_door');
  assert.equal(side.orientation,'vertical');assert.equal(side.hinge,'top');
  assert.equal(side.closedVisual.texture,'door-closed-side');assert.equal(side.openVisual.angle,-90);
  assert.equal(transition.orientation,'horizontal');assert.equal(transition.hinge,'left');
  assert.equal(transition.visualState,'halfOpen');assert.equal(transition.halfOpenVisual.texture,'door-half-open');
  assert.equal(transition.openVisual.texture,'door-open-south');
});

test('vertical defaults render sideways when closed and perpendicular when open',()=>{
  const edited=structuredClone(source);
  const door=edited.layers.find(layer=>layer.name==='Doors').objects.find(object=>object.name==='note-door-190');
  door.properties=door.properties.filter(property=>!property.name.startsWith('closed')&&!property.name.startsWith('open'));
  const result=readDoors(edited).find(item=>item.id==='note-door-190');
  assert.equal(result.closedVisual.texture,'door-closed-side');
  assert.equal(result.openVisual.texture,'door-closed-side');assert.equal(result.openVisual.angle,-90);
  assert.equal(result.openVisual.originX,0.5);assert.equal(result.openVisual.originY,0);
});

test('invalid orientation, hinge, visual state and visual geometry fail clearly',()=>{
  const mutate=(name,value,type='string')=>{
    const edited=structuredClone(source),door=edited.layers.find(layer=>layer.name==='Doors').objects[0];
    door.properties.push({name,type,value});return edited;
  };
  assert.throws(()=>readDoors(mutate('orientation','diagonal')),/orientation/);
  assert.throws(()=>readDoors(mutate('hinge','top')),/horizontal door hinge/);
  assert.throws(()=>readDoors(mutate('visualState','halfOpen')),/interactive: false/);
  assert.throws(()=>readDoors(mutate('openWidth','wide')),/numeric/);
  assert.throws(()=>readDoors(mutate('openFlipX','true')),/bool/);
});

test('invalid boolean types and duplicate ids fail clearly', () => {
  const edited = structuredClone(source);
  const layer = edited.layers.find((l) => l.name === 'Doors');
  layer.objects[0].properties.find((p) => p.name === 'locked').value = 'false';
  assert.throws(() => readDoors(edited), /bool/);
  layer.objects[0].properties.find((p) => p.name === 'locked').value = false;
  layer.objects.push(structuredClone(layer.objects[0]));
  assert.throws(() => readDoors(edited), /Duplicate/);
});

test('moving a named destination spawn changes the arrival point', () => {
  const edited = structuredClone(destination);
  const spawn = edited.layers.find((l) => l.name === 'Spawns').objects[0];
  spawn.x = 100;
  spawn.y = 200;
  const door = readDoors(source).find(d => d.id === 'exit_main_door');
  assert.deepEqual(resolveSpawn(edited, door), {x:100,y:200});
});

test('spawn supports default entry, named points and explicit coordinates including zero', () => {
  const entry = objectsIn(source, 'Spawns')[0];
  assert.deepEqual(resolveSpawn(source), {x:entry.x,y:entry.y});
  assert.deepEqual(resolveSpawn(source, {targetSpawn:entry.name}), {x:entry.x,y:entry.y});
  assert.deepEqual(resolveSpawn(source, {targetX:0,targetY:0}), {x:0,y:0});
  assert.throws(() => resolveSpawn(source, {targetSpawn:'missing'}), /not found/);
  assert.throws(() => resolveSpawn(source, {targetX:1}), /targetX and targetY/);
});

test('temporary artwork positions follow the object layer, independent of Collision', () => {
  const edited = structuredClone(source);
  const layer = edited.layers.find((l) => l.name === 'Entities');
  const object = layer.objects.find((o) => o.type === 'monitor');
  object.x += 45;
  object.y -= 20;
  assert.equal(objectsIn(edited, 'Entities').find((o) => o.id === object.id).x, object.x);
  assert.deepEqual(edited.layers.find((l) => l.name === 'Collision'), source.layers.find((l) => l.name === 'Collision'));
});
