// Read-only Convex checks + two ephemeral relay clients. No players/lobbies,
// gameplay mutations, credentials, backend provisioning or tunnel creation.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { ConvexClient,ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { WebSocket } from 'ws';
import { WebSocketTransport } from '../src/realtime/WebSocketTransport.js';
import { pvpRealtimeUrl } from '../src/pvp/movementConfig.js';

const origin=new URL(process.argv[2]||'http://127.0.0.1:4174').origin;
const clients=[],subscriptions=[];
let convex;
const timeout=(promise,label)=>{
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`Timeout: ${label}`)),10_000);})])
    .finally(()=>clearTimeout(timer));
};
function receive(transport,type,send){
  return timeout(new Promise((resolve,reject)=>{
    const off=transport.onMessage(message=>{if(message.type===type){off();resolve(message);}});
    subscriptions.push(off);
    try{send?.();}catch(error){off();reject(error);}
  }),type);
}

try{
  const page=await fetch(origin,{signal:AbortSignal.timeout(10_000)});
  assert.equal(page.status,200,'Frontend must respond');
  const html=await page.text();
  assert.ok(!html.includes('/@vite/client'),'Must serve the built frontend, not Vite dev');
  const entry=html.match(/<script[^>]+src="([^"]+)"/);
  assert.ok(entry,'Built entry is missing');
  assert.equal((await fetch(new URL(entry[1],origin),{signal:AbortSignal.timeout(10_000)})).status,200);
  const info=await fetch(`${origin}/test-environment.json`,{signal:AbortSignal.timeout(10_000)});
  assert.equal(info.status,200,'Run npm run build:test first');
  const network=await info.json();
  assert.equal(network.devTools,false,'Shared test build must disable DEV tools');
  assert.equal(network.pvpTestBuild,true,'Shared test build must retain the playable PvP entrance');
  const convexUrl=network.convexSameOrigin?origin:network.convexUrl;
  const realtimeUrl=pvpRealtimeUrl({VITE_REALTIME_URL:network.realtimeUrl},{origin});
  if(origin.startsWith('https:'))assert.ok(realtimeUrl.startsWith('wss:'),'HTTPS frontend needs WSS');
  console.log(`Frontend: ${origin}\nConvex: ${convexUrl}\nRealtime: ${realtimeUrl}`);
  const http=new ConvexHttpClient(convexUrl,{logger:false,fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10_000)})});
  const availability=await http.query(anyApi.players.availability,{});
  assert.ok(Array.isArray(availability.players),'Convex HTTP query must work');
  convex=new ConvexClient(convexUrl,{webSocketConstructor:WebSocket,logger:false});
  await timeout(new Promise((resolve,reject)=>{
    subscriptions.push(convex.onUpdate(anyApi.players.availability,{},value=>{
      assert.ok(Array.isArray(value.players));resolve();
    },reject));
  }),'Convex WebSocket subscription');
  const roomId=`test-preview-${randomUUID()}`;
  for(let i=0;i<2;i++){
    const client=new WebSocketTransport({url:realtimeUrl,roomId,WebSocketImpl:WebSocket});clients.push(client);
    const welcomed=receive(client,'welcome');
    await timeout(Promise.all([client.connect(),welcomed]),'relay connection');
    await receive(client,'room-state',()=>client.sendReliable('join-room',{}));
  }
  const forwarded=await receive(clients[1],'test-event',()=>clients[0].sendReliable('test-event',{value:42}));
  assert.equal(forwarded.payload.value,42);
  // Network smoke only. Authenticated gameplay/map/settings handshake is kept
  // intact and must be verified by creating a real PvP lobby in the browsers.
  console.log('PASS: built frontend, Convex HTTP + WebSocket, two relay clients through the configured URL.');
  console.log('Next: create/join a PvP lobby with separate browser identities to verify authenticated gameplay.');
}catch(error){console.error(`FAIL: ${error.message}`);process.exitCode=1;}
finally{
  for(const off of subscriptions)off();
  for(const client of clients)client.disconnect();
  await convex?.close();
}
