import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readSoloStudySeats,nearbySoloStudySeat } from '../src/maps/soloStudySeats.js';
import { objectsIn,propertiesOf } from '../src/maps/tiledObjects.js';

const source=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url),'utf8'));

test('chairLuxury is the Tiled-authored Solo Study interaction',()=>{
  const seats=readSoloStudySeats(source);
  assert.equal(seats.length,1);assert.match(seats[0].name,/^chairLuxury/);
  const entity=objectsIn(source,'Entities').find(object=>object.id===Number(seats[0].id));
  assert.equal(entity.type,'soloStudySeat');assert.equal(propertiesOf(entity).mode,'study');
  assert.equal(seats[0].interactionDistance,24);
  assert.equal(nearbySoloStudySeat(seats,{x:seats[0].seatX-5,right:seats[0].seatX+5,y:seats[0].seatY-10,bottom:seats[0].seatY}),seats[0]);
  assert.equal(nearbySoloStudySeat(seats,{
    x:seats[0].seatX-5,right:seats[0].seatX+5,
    y:seats[0].y-35,bottom:seats[0].y-25,
  }),null);
});

test('Study Mode direction is authored as a Tiled text object outside the study room',()=>{
  const label=objectsIn(source,'Entities').find(object=>object.name==='studyModeSign');
  assert.equal(label.text.text,'Study Mode ↓');assert.equal(label.type,'mapLabel');
  assert.ok(label.y<752,'the sign should remain outside the room entrance');
});
