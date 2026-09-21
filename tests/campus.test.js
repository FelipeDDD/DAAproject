import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { objectsIn, propertiesOf, resolveSpawn } from '../src/maps/tiledObjects.js';
import { readDoors } from '../src/maps/doors.js';
import { PLAYER_SCALE } from '../src/game/settings.js';
import { collisionAreas } from '../src/maps/collision.js';
import { readMapTransitions } from '../src/maps/transitions.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../public/assets/maps/${name}.tmj`, import.meta.url)));
const maps = { school: load('classroom'), outside: load('outside'), arena: load('arena'), office2: load('office2') };
const overlaps = (a,b) => a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
const feet = (x,y) => ({x:x-10*PLAYER_SCALE,y:y-12*PLAYER_SCALE,width:20*PLAYER_SCALE,height:12*PLAYER_SCALE});

test('interior doors meet solid jambs on both sides and the obsolete corridor door is removed', () => {
  const doors=readDoors(maps.school), walls=objectsIn(maps.school,'Collision');
  assert.ok(!doors.some(d=>d.id==='classroom-exit'));
  const solid=(x,y)=>walls.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);
  for(const d of doors){
    const points=d.height>d.width
      ? [[d.x+d.width/2,d.y-1],[d.x+d.width/2,d.y+d.height]]
      : [[d.x-1,d.y+d.height/2],[d.x+d.width,d.y+d.height/2]];
    assert.ok(points.every(([x,y])=>solid(x,y)),`Missing jamb: ${d.id}`);
  }
  for(let y=544;y<928;y+=8)if(y<688||y>=752)assert.ok(solid(688,y),`West wall gap at ${y}`);
});

test('converted notes retain their visual or door; pending editor notes are allowed', () => {
  const map=maps.school;
  const targets=[...objectsIn(map,'Entities'),...objectsIn(map,'Doors')];
  for(const note of objectsIn(map,'Notes')) {
    const id=propertiesOf(note).resolvedEntity;
    if (!id) continue; // Notes can contain future requests, not only converted objects.
    const visual=targets.find(o=>o.id===id);
    assert.ok(visual, `Missing resolved entity ${id}`);
    assert.equal(propertiesOf(visual).sourceNote,note.id);
    if(note.width>0&&note.height>0) {
      assert.equal(visual.x,note.x);
      assert.ok(Math.abs((visual.y-visual.height)-note.y)<0.000001);
      assert.equal(visual.width,note.width);
      assert.equal(visual.height,note.height);
    }
  }
});

test('no artless keyboards remain in Entities; directional notes were preserved', () => {
  assert.equal(objectsIn(maps.school,'Entities').filter(o=>o.name==='keyboard'&&!o.gid).length,0);
  const keyboards=objectsIn(maps.school,'Notes').filter(o=>o.name==='keyboard');
  assert.equal(keyboards.length,10);
  assert.ok(keyboards.every(o=>['left','right'].includes(propertiesOf(o).direction)));
});

test('all transition targets resolve to free spawns in registered maps', () => {
  for(const [key,map] of Object.entries(maps)) {
    for(const door of readDoors(map).filter(d=>d.transition)) {
      const target=maps[door.targetMap];
      assert.ok(target, `Unknown destination ${door.targetMap}`);
      const spawn=resolveSpawn(target,door), body=feet(spawn.x,spawn.y);
      assert.ok(!objectsIn(target,'Collision').some(r=>overlaps(body,r)),`${key} -> ${door.targetMap}: blocked spawn`);
      assert.ok(!readDoors(target).some(d=>!d.open&&overlaps(body,d)), 'Spawn overlaps a closed door');
    }
  }
  const exit=readDoors(maps.school).find(d=>d.id==='exit_main_door');
  const entry=readDoors(maps.outside).find(d=>d.id==='school-main-entry');
  assert.equal(exit.targetMap,'outside');
  assert.equal(entry.targetMap,'school');
  assert.equal(entry.targetSpawn,'mainEntrance');
});

test('classroom arena marker links to the authored arena spawn',()=>{
  const transition=readMapTransitions(maps.school).find(item=>item.id==='arena');
  assert.ok(transition);
  assert.equal(transition.targetMap,'arena');
  assert.equal(transition.targetSpawn,'arena-spawn');
  const spawn=resolveSpawn(maps.arena,transition);
  assert.deepEqual(spawn,{x:18,y:525});
  assert.ok(!collisionAreas(objectsIn(maps.arena,'Collision')).some(area=>overlaps(feet(spawn.x,spawn.y),area)));
  assert.equal(propertiesOf(maps.arena).escapeReturn,true);
});

test('corridor and office2 transitions point to each other through registered scene keys',()=>{
  const enter=readMapTransitions(maps.school).find(item=>item.id==='school-corridor-spawn');
  assert.ok(enter);assert.equal(enter.targetMap,'office2');assert.equal(enter.targetSpawn,'office2-spawn');
  const officeSpawn=resolveSpawn(maps.office2,enter);
  assert.deepEqual(officeSpawn,{x:492.333333333333,y:158});
  assert.ok(!collisionAreas(objectsIn(maps.office2,'Collision')).some(area=>overlaps(feet(officeSpawn.x,officeSpawn.y),area)));
  const leave=readMapTransitions(maps.office2).find(item=>item.id==='office2-spawn');
  assert.ok(leave);assert.equal(leave.targetMap,'school');assert.equal(leave.targetSpawn,'school-corridor-spawn');
  const corridorSpawn=resolveSpawn(maps.school,leave);
  assert.deepEqual(corridorSpawn,{x:142.363636363636,y:370});
  assert.ok(!collisionAreas(objectsIn(maps.school,'Collision')).some(area=>overlaps(feet(corridorSpawn.x,corridorSpawn.y),area)));
  assert.equal(propertiesOf(maps.office2).defaultSpawn,'office2-spawn');
});

test('arena exit returns automatically to the authored classroom spawn behind the gate',()=>{
  const exit=readMapTransitions(maps.arena).find(item=>item.id==='school-exit');
  assert.ok(exit);assert.equal(exit.auto,true);assert.equal(exit.targetMap,'school');
  assert.equal(exit.targetSpawn,'arena-return');
  assert.deepEqual(resolveSpawn(maps.school,exit),{x:880,y:725.333333333333});
  const gate=objectsIn(maps.arena,'Collision').find(item=>item.name==='gate');
  assert.ok(gate);assert.ok(gate.x<exit.x);assert.ok(gate.x+gate.width<exit.x);
});

test('arena image and authored collision are usable by the shared map scene',()=>{
  const image=maps.arena.layers.find(layer=>layer.type==='imagelayer');
  assert.equal(image.image,'arena-background.webp');
  const authored=objectsIn(maps.arena,'Collision');
  const areas=collisionAreas(authored);
  assert.ok(areas.length>0);
  assert.ok(areas.every(area=>area.width>0&&area.height>0));
  assert.ok(authored.some(area=>area.width>0&&area.height>0&&!area.ellipse));
  assert.ok(authored.some(area=>area.ellipse));
  assert.equal(areas.filter(area=>area.shape==='circle').length,authored.filter(area=>area.ellipse).length);
  assert.ok(authored.every(area=>area.point||area.width>0&&area.height>0),'Arena collision contains a zero-area object');
});

test('arena authors a configurable boss spawn outside its cover collision',()=>{
  const spawn=resolveSpawn(maps.arena,{targetSpawn:'boss-spawn'});
  assert.deepEqual(spawn,{x:1300,y:525});
  const bossBody={x:spawn.x-18,y:spawn.y-56,width:36,height:56};
  assert.ok(!collisionAreas(objectsIn(maps.arena,'Collision')).some(area=>overlaps(bossBody,area)));
});

test('door footprints never overlap permanent collision, including fractional positions', () => {
  for(const map of Object.values(maps))for(const door of readDoors(map)) {
    assert.ok(!objectsIn(map,'Collision').some(r=>overlaps(door,r)),door.id);
  }
});

test('outside remains compact and main walk reaches stairs and pavement around planters', () => {
  const map=maps.outside;
  assert.equal(map.width,30);assert.equal(map.height,24);
  const obstacles=objectsIn(map,'Collision');
  const start=resolveSpawn(map);
  const visited=new Set(), pending=[[start.x,start.y]];
  // Sample real scaled foot rectangles at an 8px interval, not just tile centers.
  while(pending.length) {
    const [x,y]=pending.pop(), key=`${x},${y}`;
    if(visited.has(key)||x<16||y<16||x>944||y>736)continue;
    if(obstacles.some(r=>overlaps(feet(x,y),r)))continue;
    visited.add(key);
    pending.push([x-8,y],[x+8,y],[x,y-8],[x,y+8]);
  }
  assert.ok(visited.has('480,258'),'Stairs must be reachable');
  assert.ok(visited.has('480,626'),'Central path must reach sidewalk');
  assert.ok(visited.has('176,442'),'Gazebo approach must be reachable');
  assert.ok(visited.has('840,602'),'Right seating approach must be reachable');
});
