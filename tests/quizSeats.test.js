import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readQuizSeats, distanceToSeat } from '../src/maps/quizSeats.js';
import { join } from '../convex/quizLobbies.js';

const map=JSON.parse(readFileSync(new URL('../public/assets/maps/classroom.tmj',import.meta.url)));
const seats=readQuizSeats(map);

test('Tiled quiz chairs are generic stable seat IDs with no class attribution',()=>{
  assert.deepEqual(seats.map(seat=>seat.seatId),['269','270','273','274']);
  assert.equal(new Set(seats.map(seat=>seat.seatId)).size,4);
  assert.ok(seats.every(seat=>!('characterId' in seat)&&!('characterBaseId' in seat)));
});

test('each authored sitting point is inside its chair and is considered nearby',()=>{
  for(const seat of seats){
    assert.ok(seat.seatX>=seat.x&&seat.seatX<=seat.x+seat.width);
    assert.ok(seat.seatY>=seat.y&&seat.seatY<=seat.y+seat.height);
    const body={x:seat.seatX-10,right:seat.seatX+10,y:seat.seatY-12,bottom:seat.seatY};
    assert.equal(distanceToSeat(seat,body),0);
  }
});

test('any class can join through a generic Tiled quiz chair',async()=>{
  const seat=seats[0];
  const player={playerId:'independent-live-id',characterId:'felipe',characterBaseId:'felipe',sessionId:'session-123456789',
    room:'school',x:seat.seatX,y:seat.seatY,lastSeen:Date.now()};
  const inserted=[];
  const ctx={db:{
    query:table=>({first:async()=>inserted.find(row=>row.table===table)?.value??null,withIndex:(_name,build)=>{
      build({eq:()=>({})});
      return {unique:async()=>table==='players'?player:null};
    }}),
    insert:async(table,value)=>{inserted.push({table,value});return 'new-lobby';},patch:async()=>{},
  }};
  ctx.scheduler={runAfter:async()=> 'cleanup-job'};
  const result=await join._handler(ctx,{room:'school',playerId:player.playerId,sessionId:player.sessionId});
  assert.equal(result.seatX,seat.seatX);
  assert.equal(result.seatY,seat.seatY);
  assert.deepEqual(inserted[0].value.participants,[player.playerId]);
  assert.deepEqual(inserted[0].value.seatAssignments,[{playerId:player.playerId,seatId:seat.seatId}]);
});

test('same-base participants get different seats and one chair cannot be double occupied',async()=>{
  const [firstSeat,secondSeat]=seats;
  const players=['live-a','live-b'].map((playerId,index)=>({
    playerId,characterId:'michael',characterBaseId:'michael',sessionId:`session-12345678${index}`,
    room:'school',x:firstSeat.seatX,y:firstSeat.seatY,lastSeen:Date.now(),
  }));
  const lobby={_id:'lobby',room:'school',status:'lobby',participants:['live-a'],hostPlayerId:'live-a',
    seatAssignments:[{playerId:'live-a',seatId:firstSeat.seatId}]};
  const worker={_id:'worker',key:'multiplayer-quiz',generation:0};
  const ctx={db:{query:table=>({first:async()=>table==='quizLobbies'?lobby:null,withIndex:()=>({
    unique:async()=>table==='players'?players[1]:lobby,
    collect:async()=>table==='players'?players:[],
  })}),insert:async(table,value)=>table==='quizCleanupWorker'?Object.assign(worker,value):'unused',patch:async(_id,patch)=>Object.assign(lobby,patch)}};
  ctx.scheduler={runAfter:async()=> 'cleanup-job'};
  const result=await join._handler(ctx,{room:'school',playerId:'live-b',sessionId:players[1].sessionId});
  assert.deepEqual(result,{seatX:secondSeat.seatX,seatY:secondSeat.seatY,direction:secondSeat.direction});
  assert.deepEqual(lobby.participants,['live-a','live-b']);
  assert.deepEqual(lobby.seatAssignments,[{playerId:'live-a',seatId:firstSeat.seatId},{playerId:'live-b',seatId:secondSeat.seatId}]);
  assert.equal(new Set(lobby.seatAssignments.map(item=>item.seatId)).size,2);
  assert.equal(players[0].characterBaseId,players[1].characterBaseId);
});
