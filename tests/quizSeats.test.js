import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readQuizSeats, distanceToSeat } from '../src/maps/quizSeats.js';
import { join } from '../convex/quizLobbies.js';

const map=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url)));
const seats=readQuizSeats(map);

test('quiz seats come from Tiled and match the requested table arrangement',()=>{
  assert.deepEqual(seats.map(s=>s.characterId),['sarina','felipe','michael','jassine']);
  const byId=Object.fromEntries(seats.map(s=>[s.characterId,s]));
  assert.ok(byId.sarina.y<byId.felipe.y);
  assert.ok(byId.michael.y<byId.jassine.y);
  assert.ok(byId.sarina.x<byId.michael.x);
  assert.equal(new Set(seats.map(s=>s.characterId)).size,4);
});

test('each authored sitting point is inside its chair and is considered nearby',()=>{
  for(const seat of seats){
    assert.ok(seat.seatX>=seat.x&&seat.seatX<=seat.x+seat.width);
    assert.ok(seat.seatY>=seat.y&&seat.seatY<=seat.y+seat.height);
    const body={x:seat.seatX-10,right:seat.seatX+10,y:seat.seatY-12,bottom:seat.seatY};
    assert.equal(distanceToSeat(seat,body),0);
  }
});

test('a duplicate character slot can use its original Tiled quiz chair',async()=>{
  const seat=seats.find(item=>item.characterId==='michael');
  const player={playerId:'michael-2',characterId:'michael-2',sessionId:'session-123456789',
    room:'school',x:seat.seatX,y:seat.seatY,lastSeen:Date.now()};
  const inserted=[];
  const ctx={db:{
    query:table=>({withIndex:(_name,build)=>{
      build({eq:()=>({})});
      return {unique:async()=>table==='players'?player:null};
    }}),
    insert:async(table,value)=>{inserted.push({table,value});return 'new-lobby';},
  }};
  const result=await join._handler(ctx,{room:'school',characterId:'michael-2',sessionId:player.sessionId});
  assert.equal(result.seatX,seat.seatX);
  assert.equal(result.seatY,seat.seatY);
  assert.deepEqual(inserted[0].value.participants,['michael-2']);
});

test('duplicate slots cannot occupy the same quiz chair at once',async()=>{
  const seat=seats.find(item=>item.characterId==='michael');
  const players=['michael','michael-2'].map(characterId=>({
    playerId:characterId,characterId,sessionId:'session-123456789',room:'school',
    x:seat.seatX,y:seat.seatY,lastSeen:Date.now(),
  }));
  const lobby={room:'school',status:'lobby',participants:['michael'],hostCharacterId:'michael'};
  const ctx={db:{query:table=>({withIndex:()=>({
    unique:async()=>table==='players'?players[1]:lobby,
    collect:async()=>table==='players'?players:[],
  })})}};
  await assert.rejects(join._handler(ctx,{
    room:'school',characterId:'michael-2',sessionId:'session-123456789',
  }),/chair is already occupied/);
});
