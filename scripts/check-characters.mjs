import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { isPresenceActive } from '../src/multiplayer/presencePolicy.js';
const a=new ConvexClient(process.env.VITE_CONVEX_URL),b=new ConvexClient(process.env.VITE_CONVEX_URL);
const sessions=[crypto.randomUUID(),crypto.randomUUID()];let characterId;
try{
  const available=await a.query(api.players.availability,{});
  characterId=available.find(c=>!isPresenceActive(c.lastSeen))?.characterId;
  assert.ok(characterId,'A free character is needed');
  const results=await Promise.all(sessions.map((sessionId,i)=>(i?b:a).mutation(api.players.claim,{characterId,sessionId})));
  assert.equal(results.filter(r=>r.ok).length,1,'Exactly one concurrent claim wins');
  const winner=results[0].ok?0:1,loser=1-winner;
  const state={playerId:characterId,characterId,name:'Ignored name',room:'school',x:800,y:750,direction:'down'};
  await a.mutation(api.players.update,{...state,sessionId:sessions[winner]});
  await a.mutation(api.players.heartbeat,{characterId,sessionId:sessions[winner]});
  await assert.rejects(b.mutation(api.players.update,{...state,sessionId:sessions[loser]}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(b.mutation(api.players.heartbeat,{characterId,sessionId:sessions[loser]}),/CHARACTER_SESSION_LOST/);
  await b.mutation(api.players.release,{characterId,sessionId:sessions[loser]});
  assert.equal((await b.mutation(api.players.claim,{characterId,sessionId:sessions[loser]})).ok,false,'Wrong session cannot release owner');
  await a.mutation(api.players.release,{characterId,sessionId:sessions[winner]});
  assert.equal((await b.mutation(api.players.claim,{characterId,sessionId:sessions[loser]})).ok,true);
  await assert.rejects(a.mutation(api.players.update,{...state,sessionId:sessions[winner]}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(a.mutation(api.players.heartbeat,{characterId,sessionId:sessions[winner]}),/CHARACTER_SESSION_LOST/);
  console.log('PASS: concurrent reservation, owner-only updates/heartbeats/release and reassignment after release.');
}finally{
  if(characterId)for(const sessionId of sessions)await a.mutation(api.players.release,{characterId,sessionId});
  await Promise.all([a.close(),b.close()]);
}
