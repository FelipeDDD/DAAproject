import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { claimTestCharacter,releaseTestCharacter } from './claim-test-character.mjs';

const url=process.env.VITE_CONVEX_URL;assert.ok(url,'Configure .env.local first with npm run convex');
const sender=new ConvexClient(url),viewer=new ConvexClient(url);
const wait=async(predicate,label)=>{const until=Date.now()+10_000;while(!predicate()){
  if(Date.now()>until)throw new Error(`Realtime timeout: ${label}`);await new Promise(resolve=>setTimeout(resolve,50));
}};
let identity,events=[],unsubscribe;
try{
  identity=await claimTestCharacter(sender);
  const auth={characterId:identity.characterId,sessionId:identity.sessionId};
  await sender.mutation(api.players.update,{...identity,room:'school',x:800,y:750,direction:'down'});
  unsubscribe=viewer.onUpdate(api.emotes.inRoom,{room:'school'},rows=>events=rows);
  await new Promise(resolve=>setTimeout(resolve,1100));
  const first=await sender.mutation(api.emotes.send,{...auth,room:'school',emote:'😂'});
  await wait(()=>events.some(event=>event.createdAt===first.createdAt),'school emote');
  await assert.rejects(sender.mutation(api.emotes.send,{...auth,room:'school',emote:'👍'}),/EMOTE_COOLDOWN/);
  unsubscribe();events=[];
  await sender.mutation(api.players.update,{...identity,room:'outside',x:480,y:322,direction:'down'});
  unsubscribe=viewer.onUpdate(api.emotes.inRoom,{room:'outside'},rows=>events=rows);
  await wait(()=>Array.isArray(events),'outside subscription');
  assert.ok(!events.some(event=>event.createdAt===first.createdAt),'old-room emote leaked into new room');
  await new Promise(resolve=>setTimeout(resolve,1100));
  const second=await sender.mutation(api.emotes.send,{...auth,room:'outside',emote:'🎉'});
  await wait(()=>events.some(event=>event.createdAt===second.createdAt),'outside emote');
  console.log('PASS: realtime emotes, server cooldown, room isolation and room change.');
}finally{
  unsubscribe?.();await releaseTestCharacter(sender,identity);await Promise.all([sender.close(),viewer.close()]);
}
