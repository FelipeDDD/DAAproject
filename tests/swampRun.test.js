import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CAMERA_ZOOM, cameraZoomForMap } from '../src/game/settings.js';
import { readFootObstacles, isFootPositionClear } from '../src/maps/footCollision.js';
import { SWAMP_RUN } from '../src/swamp/runConfig.js';
import { SwampRun, prepareCheckpoint } from '../src/swamp/SwampRun.js';

const [entrance,southeast,north,ultimate]=SWAMP_RUN.checkpoints;
function collect(run,step){
  assert.equal(run.defeat(step.elite),true);
  assert.equal(run.defeat(step.elite),false);
  assert.equal(run.pendingDrop,step);
  assert.equal(run.collect(step.id),true);
  assert.equal(run.collect(step.id),false);
}

test('Swamp V3 is the only map with the experimental zoom factor',()=>{
  assert.equal(CAMERA_ZOOM.swampV3Factor,0.85);
  assert.equal(cameraZoomForMap('swamp-v3-large'),1.36);
  assert.equal(cameraZoomForMap('swamp'),1.6);
  assert.equal(cameraZoomForMap('arena'),1.3);
});

test('every reward location has room for player feet in the real map',()=>{
  const url=new URL('../public/assets/maps/swamp-v3-large.tmj',import.meta.url);
  const obstacles=readFootObstacles(JSON.parse(readFileSync(url)));
  for(const {drop} of SWAMP_RUN.checkpoints.filter(step=>step.drop)){
    assert.ok(isFootPositionClear(obstacles,{left:0,top:0,right:1920,bottom:1920},8,drop));
  }
});

for(const first of ['offense','survival'])test('ordered unlocks with '+first+' first',()=>{
  const run=new SwampRun();
  assert.equal(run.pendingChoice,entrance);
  assert.deepEqual(run.skills,[null,null,null,null]);
  assert.equal(run.defeat(southeast.elite),false);
  assert.equal(run.choose('ultimate','meteor'),false);
  assert.ok(run.choose('starter','fireball'));
  assert.equal(run.collect(southeast.id),false);
  assert.equal(run.defeat(ultimate.elite),false);
  collect(run,southeast);
  assert.deepEqual(run.offers().map(offer=>offer.id),['offense','survival']);
  assert.equal(run.choose('offense','fireball'),false);
  assert.equal(run.choose('ultimate','meteor'),false);
  run.setHealth(22);
  assert.ok(run.choose(first,first==='offense'?'lash':'drain'));
  assert.equal(run.hp,100);
  collect(run,north);
  const second=first==='offense'?'survival':'offense';
  assert.deepEqual(run.offers().map(offer=>offer.id),[second]);
  assert.ok(run.choose(second,second==='offense'?'lash':'drain'));
  collect(run,ultimate);
  assert.deepEqual(run.offers().map(offer=>offer.id),['ultimate']);
  assert.ok(run.choose('ultimate','meteor'));
  assert.equal(run.activeCheckpoint,ultimate);
  assert.equal(run.next,undefined);
});

test('pending drops and choices survive a reload, with respawn and restart restoring consistent state',()=>{
  const run=new SwampRun();
  assert.ok(run.choose('starter','lash'));
  assert.ok(run.defeat(southeast.elite));
  const afterDrop=new SwampRun(SWAMP_RUN,run.snapshot());
  assert.equal(afterDrop.pendingDrop,southeast);
  assert.ok(afterDrop.collect(southeast.id));
  const afterPickup=new SwampRun(SWAMP_RUN,afterDrop.snapshot());
  assert.equal(afterPickup.pendingDrop,undefined);
  assert.equal(afterPickup.pendingChoice,southeast);
  assert.ok(afterPickup.choose('survival','drain'));
  afterPickup.setHealth(0);
  assert.equal(afterPickup.respawn(),southeast);
  assert.equal(afterPickup.hp,100);
  assert.deepEqual(afterPickup.skills,['lash','drain',null,null]);
  assert.equal(afterPickup.defeat(southeast.elite),false);
  afterPickup.restart();
  assert.equal(afterPickup.pendingChoice,entrance);
  assert.deepEqual(afterPickup.skills,[null,null,null,null]);
  assert.equal(afterPickup.defeated.size+afterPickup.collected.size,0);
});

test('dev checkpoint jump sets legal prerequisites and creates only one pending reward',()=>{
  const run=new SwampRun();
  assert.ok(prepareCheckpoint(run,ultimate));
  assert.equal(run.pendingDrop,ultimate);
  assert.equal(run.skills[3],null);
  assert.equal(run.collected.size,2);
  assert.equal(run.activeCheckpoint,north);
  assert.ok(run.collect(ultimate.id));
  assert.equal(run.pendingChoice,ultimate);
  assert.equal(prepareCheckpoint(run,southeast),false);
  assert.equal(prepareCheckpoint(run,ultimate),false);
});
