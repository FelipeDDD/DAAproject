import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { claimTestCharacter, releaseTestCharacter } from './claim-test-character.mjs';
const a=new ConvexClient(process.env.VITE_CONVEX_URL),b=new ConvexClient(process.env.VITE_CONVEX_URL);
let identity,playerId;
const args={room:'school',doorId:'bathroom-entry'};
let states=[],original;
const unsub=b.onUpdate(api.doors.inRoom,{room:'school'},s=>states=s);
const wait=async(fn,timeout=10_000)=>{const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw new Error('Timed out');await new Promise(r=>setTimeout(r,100));}};
const send=(x,y)=>a.mutation(api.players.update,{...identity,room:'school',x,y,direction:'up'});
try {
  identity=await claimTestCharacter(a);playerId=identity.playerId;args.playerId=playerId;
  await wait(()=>states.length);
  original=states.find(d=>d.doorId===args.doorId).open;
  await send(400,280);
  await a.mutation(api.doors.setOpen,{...args,open:true});
  await wait(()=>states.find(d=>d.doorId===args.doorId).open);
  await send(400,245);
  await assert.rejects(a.mutation(api.doors.setOpen,{...args,open:false}),/Passagem ocupada/);
  await send(400,280);
  await a.mutation(api.doors.setOpen,{...args,open:false});
  await wait(()=>!states.find(d=>d.doorId===args.doorId).open);
  await a.mutation(api.doors.setOpen,{...args,open:original});
  console.log('PASS: shared door open/close, occupied doorway rejected, original state restored.');
  let players=[];
  const stop=b.onUpdate(api.players.inRoom,{room:'school'},p=>players=p);
  try {
    await wait(()=>players.some(p=>p.playerId===playerId));
    await wait(()=>!players.some(p=>p.playerId===playerId),25_000);
    console.log('PASS: inactive player removed by backend cleanup.');
  }finally{stop();}
} finally {unsub();await releaseTestCharacter(a,identity);await Promise.all([a.close(),b.close()]);}
