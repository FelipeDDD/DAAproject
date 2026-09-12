// Explicit WebSocket integration check against the configured development backend.
// Run with npm run test:multiplayer while npm run convex is running.
import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { Presence } from '../src/multiplayer/Presence.js';
import { claimTestCharacter, releaseTestCharacter } from './claim-test-character.mjs';

const url = process.env.VITE_CONVEX_URL;
assert.ok(url, 'Configure .env.local first with npm run convex');
const waitFor = async (condition, label) => {
  const deadline = Date.now() + 10_000;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`Timeout: ${label}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};
const a = new Presence(new ConvexClient(url), anyApi, null);
const b = new Presence(new ConvexClient(url), anyApi, null);
let positionA={x:800,y:750,direction:'down'}, positionB={x:840,y:750,direction:'left'};
let seenA=[],seenB=[];
const sees = (rows,who) => rows.find(p=>p.playerId===who.identity.playerId);
try {
  a.identity=await claimTestCharacter(a.client);
  b.identity=await claimTestCharacter(b.client);
  a.enter('school',()=>positionA,rows=>seenA=rows);
  b.enter('school',()=>positionB,rows=>seenB=rows);
  await waitFor(()=>sees(seenA,b)&&sees(seenB,a),'mutual presence');
  assert.ok(!sees(seenA,a)&&!sees(seenB,b),'No local duplicate');
  positionA={x:888,y:720,direction:'right'};
  await waitFor(()=>sees(seenB,a)?.x===888,'movement received');
  assert.equal(sees(seenB,a).direction,'right');
  b.enter('outside',()=>positionB,rows=>seenB=rows);
  await waitFor(()=>!sees(seenA,b)&&!sees(seenB,a),'rooms isolated');
  b.enter('school',()=>positionB,rows=>seenB=rows);
  await waitFor(()=>sees(seenA,b)&&sees(seenB,a),'return to room');
  console.log('PASS: two real Convex clients, movement, direction, self filtering, room isolation and return.');
} finally {
  a.leave();b.leave();
  await Promise.all([releaseTestCharacter(a.client,a.identity),releaseTestCharacter(b.client,b.identity)]);
  await Promise.all([a.close(),b.close()]);
  // Test records expire through the same cleanup as closed browser tabs.
}
