import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { CHARACTERS } from '../src/characters.js';

const clients=[new ConvexClient(process.env.VITE_CONVEX_URL),new ConvexClient(process.env.VITE_CONVEX_URL)];
const base=CHARACTERS[0].id,sessions=[crypto.randomUUID(),crypto.randomUUID()],guests=[crypto.randomUUID(),crypto.randomUUID()];
const identities=[];
try{
  const results=await Promise.all(sessions.map((sessionId,index)=>clients[index].mutation(api.players.claimGuest,{
    guestId:`guest-character-test-${guests[index]}`,characterBaseId:base,sessionId,
  })));
  assert.ok(results.every(result=>result.ok),`Could not claim same base; capacity may be full: ${JSON.stringify(results)}`);
  assert.notEqual(results[0].playerId,results[1].playerId);
  identities.push(...results.map((result,index)=>({playerId:result.playerId,characterId:base,sessionId:sessions[index]})));
  const states=identities.map((identity,index)=>({
    ...identity,name:`Test ${index}`,room:'school',x:800+index*32,y:750,direction:'down',
  }));
  await Promise.all(states.map((state,index)=>clients[index].mutation(api.players.update,state)));
  const room=await clients[0].query(api.players.inRoom,{room:'school'});
  assert.ok(identities.every(identity=>room.some(row=>row.playerId===identity.playerId&&row.characterBaseId===base)));
  await clients[0].mutation(api.players.release,identities[0]);
  const stale=await clients[0].mutation(api.players.claimGuest,{
    guestId:`guest-character-test-${guests[0]}`,characterBaseId:base,sessionId:sessions[0],
  });
  assert.notEqual(stale.playerId,identities[0].playerId);
  identities[0]=null;
  identities.push({playerId:stale.playerId,characterId:base,sessionId:sessions[0]});
  await assert.rejects(clients[0].mutation(api.players.update,{...states[0],name:'Stale'}),/CHARACTER_SESSION_LOST/);
  console.log('PASS: simultaneous same-base claims receive distinct player IDs; stale sessions cannot update a newer claim.');
}finally{
  await Promise.all(identities.filter(Boolean).map((identity,index)=>clients[index%2].mutation(api.players.release,identity).catch(()=>{})));
  await Promise.all(clients.map(client=>client.close()));
}
