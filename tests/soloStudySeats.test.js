import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSoloStudySeats } from '../src/maps/soloStudySeats.js';
import { objectsIn,propertiesOf } from '../src/maps/tiledObjects.js';

const source=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url),'utf8'));

test('the red chair no longer exposes the old Solo Study interaction',()=>{
  const seats=readSoloStudySeats(source);
  assert.equal(seats.length,0);
  const entity=objectsIn(source,'Entities').find(object=>object.name==='chairLuxury-241');
  assert.equal(entity.type,'terminalComputer');
  assert.equal(propertiesOf(entity).mode,'study','legacy configuration remains available');
});

test('Study Mode direction is authored as a Tiled text object outside the study room',()=>{
  const label=objectsIn(source,'Entities').find(object=>object.name==='studyModeSign');
  assert.equal(label.text.text,'Study Mode ↓');assert.equal(label.type,'mapLabel');
  assert.ok(label.y<752,'the sign should remain outside the room entrance');
});
