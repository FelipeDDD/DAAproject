// Sends two labelled test messages to the development backend.
import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import {claimTestCharacter,releaseTestCharacter} from './claim-test-character.mjs';
const a=new ConvexClient(process.env.VITE_CONVEX_URL),b=new ConvexClient(process.env.VITE_CONVEX_URL);
let identity,school=[],outside=[],arena=[];
const unsub=[b.onUpdate(api.messages.inRoom,{room:'school'},rows=>school=rows),b.onUpdate(api.messages.inRoom,{room:'outside'},rows=>outside=rows),b.onUpdate(api.messages.inRoom,{room:'arena'},rows=>arena=rows)];
const wait=async(predicate)=>{const until=Date.now()+10_000;while(!predicate()){if(Date.now()>until)throw new Error('Realtime timeout');await new Promise(r=>setTimeout(r,50));}};
const marker=`Teste de chat ${Date.now()}`;
try{
  identity=await claimTestCharacter(a);
  const author={characterId:identity.characterId,sessionId:identity.sessionId};
  await a.mutation(api.players.update,{...identity,room:'school',x:800,y:750,direction:'down',activeCharacterItem:null});
  await a.mutation(api.messages.send,{...author,room:'school',text:marker});
  await wait(()=>school.some(m=>m.text===marker));
  assert.ok(!outside.some(m=>m.text===marker));assert.ok(school.length<=50);
  assert.equal(school.find(m=>m.text===marker).characterName,identity.name);
  await a.mutation(api.players.update,{...identity,room:'outside',x:480,y:322,direction:'down',activeCharacterItem:null});
  await a.mutation(api.messages.send,{...author,room:'outside',text:marker+' exterior'});
  await wait(()=>outside.some(m=>m.text===marker+' exterior'));
  assert.ok(!school.some(m=>m.text===marker+' exterior'));
  await a.mutation(api.players.update,{...identity,room:'arena',x:480,y:322,direction:'down',activeCharacterItem:null});
  await a.mutation(api.messages.send,{...author,room:'arena',text:marker+' arena'});
  await wait(()=>arena.some(m=>m.text===marker+' arena'));
  assert.ok(!school.some(m=>m.text===marker+' arena'));
  assert.ok(!outside.some(m=>m.text===marker+' arena'));
  console.log('PASS: realtime chat, selected author, room isolation and change of room including arena.');
}finally{for(const stop of unsub)stop();await releaseTestCharacter(a,identity);await Promise.all([a.close(),b.close()]);}
