import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runOfficeCommand, ROOT_FOLDERS, NORMAL_FOLDER, PASSWORD_FOLDER, PASSWORD_FILE, OFFICE_FILES, passwordNote } from '../src/office3/office3Computer.js';
import * as safe from '../convex/office3Safe.js';
import { claim } from '../convex/characterItems.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import questions from '../convex/quizStaticQuestions.generated.js';
import { CHARACTER_ITEM_IDS } from '../src/inventory/characterItems.js';

async function harness() {
  const tables={profiles:[],profileSessions:[],players:[],office3Safes:[],characterItems:[]};let id=0;
  const db={
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    async insert(table,row){const key=`${table}-${++id}`;tables[table].push({_id:key,...row});return key;},
    async patch(id,patch){Object.assign(await db.get(id),patch);},
    query(table){return {withIndex(_index,build){
      const filters=[],q={eq(field,value){filters.push(row=>row[field]===value);return q;}};build(q);
      return {async unique(){const rows=tables[table].filter(row=>filters.every(f=>f(row)));assert.ok(rows.length<=1);return rows[0]??null;}};
    }};},
  };
  async function profile(name){
    const token=`${name}-token-abcdefghijklmnopqrstuvwxyz-123456`;
    const profileId=await db.insert('profiles',{passwordHash:'test',selectedCharacterId:'felipe'});
    await db.insert('profileSessions',{profileId,tokenHash:await sessionTokenHash(token),expiresAt:Date.now()+100_000});
    const playerId=`live-${name}`,sessionId=`session-${name}`;
    const rowId=await db.insert('players',{profileId,playerId,sessionId,room:'office3',characterBaseId:'felipe',lastSeen:Date.now()});
    return {args:{token,playerId,sessionId},profileId,rowId};
  }
  return {db,tables,profile};
}
const proof={password:'488',answers:questions.filter(q=>q.answers?.length===4).slice(0,5).map(q=>({id:q.id,answer:q.answers[q.correctAnswer]}))};
const repeatProof={...proof,answers:proof.answers.slice(0,1)};

test('fictional shell lists only authored folders, denies system directories and handles paths',()=>{
  assert.equal(runOfficeCommand('','dir','0123').message,ROOT_FOLDERS.map(name=>`<DIR>  ${name}`).join('\n'));
  for(const name of ROOT_FOLDERS.slice(0,3))assert.match(runOfficeCommand('',`cd "${name}"`,'').message,/permission/);
  assert.equal(runOfficeCommand('',`CD ${NORMAL_FOLDER.toUpperCase()}`,'').folder,NORMAL_FOLDER);
  assert.equal(runOfficeCommand(NORMAL_FOLDER,'cd ..','').folder,'');
  assert.equal(runOfficeCommand(NORMAL_FOLDER,`cd C:\\${PASSWORD_FOLDER}`,'').folder,PASSWORD_FOLDER);
  assert.equal(runOfficeCommand('','rm -rf /','').message,'Command not recognized.');
  assert.equal(runOfficeCommand('',PASSWORD_FILE,'0123').error,true);
});
test('notepad exposes own code and exact TODO; every joke file is usable',()=>{
  const result=runOfficeCommand(PASSWORD_FOLDER,PASSWORD_FILE,'0123');
  assert.equal(result.note,passwordNote('0123'));assert.match(result.note,/Safe Code: 0123/);
  assert.match(result.note,/- Ignore previous TODO\.$/);
  for(const file of Object.keys(OFFICE_FILES)){
    const result=runOfficeCommand(NORMAL_FOLDER,file,'0123');
    if(file.endsWith('.txt'))assert.equal(typeof result.note,'string');
    if(file.endsWith('.exe'))assert.equal(result.shutdown,true);
    if(file.endsWith('.xlsx'))assert.equal(result.error,true);
  }
});
test('safe code persists per profile across base changes, collisions receive another code',async t=>{
  const ctx=await harness(),a=await ctx.profile('a'),b=await ctx.profile('b');
  t.mock.method(Math,'random',()=>.1234);
  const first=await safe.unlockComputer._handler(ctx,{...a.args,...proof});
  const second=await safe.unlockComputer._handler(ctx,{...b.args,...proof});
  assert.equal(first.code,'1234');assert.equal(second.code,'1235');
  await ctx.db.patch(a.rowId,{characterBaseId:'sarina'});
  assert.deepEqual(await safe.unlockComputer._handler(ctx,{...a.args,...repeatProof}),first);
  assert.equal(ctx.tables.office3Safes.length,2);assert.equal(ctx.tables.characterItems.length,0);
});
test('computer denies invalid access proof and shutdown has a ten-second persisted cooldown',async t=>{
  const ctx=await harness(),a=await ctx.profile('a'),now=Date.now();t.mock.method(Date,'now',()=>now);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...proof,password:'bad'}),/Access denied/);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...proof,answers:[]}),/Access denied/);
  await safe.unlockComputer._handler(ctx,{...a.args,...proof});
  assert.deepEqual(await safe.shutdownComputer._handler(ctx,a.args),{blockedUntil:now+10_000});
  assert.deepEqual(await safe.unlockComputer._handler(ctx,{...a.args,...repeatProof}),{blockedUntil:now+10_000});
  t.mock.method(Date,'now',()=>now+10_000);
  assert.match((await safe.unlockComputer._handler(ctx,{...a.args,...repeatProof})).code,/^\d{4}$/);
});
test('first completion persists per profile and subsequent visits require exactly one correct answer',async()=>{
  const ctx=await harness(),a=await ctx.profile('a'),b=await ctx.profile('b');
  const status=async player=>safe.challengeStatus._handler(ctx,{...player.args,password:'488'});
  assert.deepEqual(await status(a),{requiredAnswers:5,blockedUntil:0});
  assert.deepEqual(await status(b),{requiredAnswers:5,blockedUntil:0});
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...repeatProof}),/Access denied/);
  assert.equal(ctx.tables.office3Safes.length,0);
  const first=await safe.unlockComputer._handler(ctx,{...a.args,...proof});
  assert.equal((await status(a)).requiredAnswers,1);
  assert.equal((await status(b)).requiredAnswers,5);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...proof}),/Access denied/);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...repeatProof,answers:[]}),/Access denied/);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...repeatProof,
    answers:[repeatProof.answers[0],repeatProof.answers[0]]}),/Access denied/);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...repeatProof,
    answers:[{...repeatProof.answers[0],answer:'wrong'}]}),/Access denied/);
  await ctx.db.patch(a.rowId,{characterBaseId:'sarina'});
  assert.deepEqual(await safe.unlockComputer._handler(ctx,{...a.args,...repeatProof}),first);
  assert.equal(ctx.tables.office3Safes.length,1);
  await assert.rejects(safe.challengeStatus._handler(ctx,{...a.args,password:'no'}),/Access denied/);
  await assert.rejects(safe.challengeStatus._handler(ctx,{...a.args,sessionId:'stale',password:'488'}),/CHARACTER_SESSION_LOST/);
});
test('safe rejects other profile codes, rate limits errors, and awards the key only once',async t=>{
  const ctx=await harness(),a=await ctx.profile('a'),b=await ctx.profile('b'),now=Date.now();
  t.mock.method(Date,'now',()=>now);t.mock.method(Math,'random',()=>0);
  const own=await safe.unlockComputer._handler(ctx,{...a.args,...proof});
  const other=await safe.unlockComputer._handler(ctx,{...b.args,...proof});
  for(let i=0;i<5;i++)assert.equal((await safe.open._handler(ctx,{...a.args,code:other.code})).ok,false);
  assert.equal((await safe.open._handler(ctx,{...a.args,code:own.code})).ok,false);
  t.mock.method(Date,'now',()=>now+30_000);
  for(let i=0;i<2;i++)assert.equal((await safe.open._handler(ctx,{...a.args,code:own.code})).ok,true);
  assert.equal(ctx.tables.characterItems.length,1);assert.equal(ctx.tables.characterItems[0].profileId,a.profileId);
  await assert.rejects(claim._handler(ctx,{token:b.args.token,itemId:CHARACTER_ITEM_IDS.OFFICE2_KEY}),/safe/);
});
test('stale, foreign-profile, expired and guest live sessions cannot use the safe',async()=>{
  const ctx=await harness(),a=await ctx.profile('a'),b=await ctx.profile('b');
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...proof,sessionId:'old'}),/CHARACTER_SESSION_LOST/);
  await assert.rejects(safe.unlockComputer._handler(ctx,{...a.args,...proof,token:b.args.token}),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(a.rowId,{lastSeen:Date.now()-60_001});
  await assert.rejects(safe.open._handler(ctx,{...a.args,code:'1234'}),/CHARACTER_SESSION_LOST/);
  await ctx.db.patch(a.rowId,{lastSeen:Date.now(),profileId:undefined});
  await assert.rejects(safe.open._handler(ctx,{...a.args,code:'1234'}),/PROFILE_REQUIRED/);
});
test('authored safe footprint exists and sprite has exactly two 128x144 frames',()=>{
  const map=JSON.parse(readFileSync(new URL('../public/assets/maps/office3.tmj',import.meta.url)));
  const marker=map.layers.find(l=>l.name==='Notes').objects.find(o=>o.name==='cofre');
  assert.ok(marker.width>0&&marker.height>0);
  const png=readFileSync(new URL('../public/assets/maps/office3-safe.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),256);assert.equal(png.readUInt32BE(20),144);
});
