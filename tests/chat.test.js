import test from 'node:test';
import assert from 'node:assert/strict';
import {send} from '../convex/messages.js';
import { PRESENCE_TIMEOUT_MS } from '../src/multiplayer/presencePolicy.js';
import { appendChatMessageText } from '../src/chat/renderMessageText.js';

const args={room:'school',characterId:'michael',sessionId:'session',text:'  Olá  '};
function context(overrides={}){
  const inserted=[];
  const player={playerId:'michael',room:'school',characterId:'michael',name:'Michael',sessionId:'session',lastSeen:Date.now(),...overrides};
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
  for(const override of [{room:'outside'},{sessionId:'other'},{lastSeen:Date.now()-PRESENCE_TIMEOUT_MS-1}]){
    const ctx=context(override);await assert.rejects(send._handler(ctx,args),/Invalid session/);assert.equal(ctx.inserted.length,0);
  }
});
test('chat accepts messages in every playable room for an active character',async()=>{
  for(const room of ['school','outside','arena','office2','office3','secret-path']){
    const ctx=context({room});
    await send._handler(ctx,{...args,room,text:'Room message'});
    assert.equal(ctx.inserted[0].room,room);
    assert.equal(ctx.inserted[0].text,'Room message');
  }
  await assert.rejects(send._handler(context({room:'selection'}),{
    ...args,room:'selection',text:'Not in the game yet',
  }),/Invalid session or room/);
});

function renderMessage(text){
  const children=[];
  const documentRef={
    createTextNode:value=>({type:'text',textContent:value}),
    createElement:tagName=>({type:tagName,textContent:'',href:'',target:'',rel:''}),
  };
  appendChatMessageText({append:node=>children.push(node)},text,documentRef);return children;
}

test('chat message without a URL remains plain text',()=>{
  assert.deepEqual(renderMessage('See you in class.'),[{type:'text',textContent:'See you in class.'}]);
});

test('chat message renders one HTTP URL as a safe new-tab link',()=>{
  assert.deepEqual(renderMessage('https://example.com'),[{
    type:'a',textContent:'https://example.com',href:'https://example.com',
    target:'_blank',rel:'noopener noreferrer',
  }]);
});

test('chat message preserves text before and after a link',()=>{
  assert.deepEqual(renderMessage('Open http://example.com now'),[
    {type:'text',textContent:'Open '},
    {type:'a',textContent:'http://example.com',href:'http://example.com',target:'_blank',rel:'noopener noreferrer'},
    {type:'text',textContent:' now'},
  ]);
});

test('chat message renders two links independently',()=>{
  const children=renderMessage('https://one.example and https://two.example/path');
  assert.deepEqual(children.filter(node=>node.type==='a').map(node=>node.href),[
    'https://one.example','https://two.example/path',
  ]);
});

test('chat message displays a www URL unchanged and adds HTTPS to its href',()=>{
  assert.deepEqual(renderMessage('Visit www.google.com today'),[
    {type:'text',textContent:'Visit '},
    {type:'a',textContent:'www.google.com',href:'https://www.google.com',target:'_blank',rel:'noopener noreferrer'},
    {type:'text',textContent:' today'},
  ]);
});
