import test from 'node:test';
import assert from 'node:assert/strict';
import {send} from '../convex/messages.js';

const args={room:'school',characterId:'michael',sessionId:'session',text:'  Olá  '};
function context(overrides={}){
  const inserted=[];
  const player={room:'school',characterId:'michael',name:'Michael',sessionId:'session',lastSeen:Date.now(),...overrides};
  return {inserted,db:{query:()=>({withIndex:()=>({unique:async()=>player})}),insert:async(table,row)=>inserted.push(row)}};
}
test('chat trims text and derives the author from the selected character',async()=>{
  const ctx=context();await send._handler(ctx,args);
  assert.equal(ctx.inserted[0].text,'Olá');assert.equal(ctx.inserted[0].characterName,'Michael');
  assert.equal(ctx.inserted[0].room,'school');assert.ok(Number.isFinite(ctx.inserted[0].createdAt));
});
test('chat rejects empty and overlong text; accepts exactly 200 characters',async()=>{
  for(const text of ['',' \n\t ', 'x'.repeat(201)])await assert.rejects(send._handler(context(),{...args,text}),/200/);
  const ctx=context();await send._handler(ctx,{...args,text:'x'.repeat(200)});assert.equal(ctx.inserted.length,1);
});
test('chat rejects another room, another session and expired presence',async()=>{
  for(const override of [{room:'outside'},{sessionId:'other'},{lastSeen:Date.now()-16_000}]){
    const ctx=context(override);await assert.rejects(send._handler(ctx,args),/inválida/);assert.equal(ctx.inserted.length,0);
  }
});
