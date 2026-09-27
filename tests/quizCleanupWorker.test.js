import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanup,join,leave } from '../convex/quizLobbies.js';
import seatsByRoom from '../convex/quizSeatDefinitions.js';
import { ensureQuizCleanupWorker,stopQuizCleanupWorkerIfEmpty } from '../convex/quizCleanupWorker.js';

function context(){
  const tables={quizCleanupWorker:[],quizLobbies:[],quizAnswers:[],players:[]};
  const jobs=[];let sequence=0;
  const ctx={tables,jobs,db:{
    query(table){let conditions=[];const q={
      withIndex(_name,build){const b={eq(field,value){conditions.push([field,value]);return b;}};build(b);return q;},
      async collect(){return tables[table].filter(r=>conditions.every(([k,v])=>r[k]===v));},
      async first(){return (await q.collect())[0]??null;},
      async unique(){const rows=await q.collect();assert.ok(rows.length<=1);return rows[0]??null;},
    };return q;},
    async insert(table,row){const _id='row-'+(++sequence);tables[table].push({...row,_id});return _id;},
    async patch(id,patch){const row=Object.values(tables).flat().find(r=>r._id===id);assert.ok(row);Object.assign(row,patch);},
    async delete(id){for(const rows of Object.values(tables)){const i=rows.findIndex(r=>r._id===id);if(i>=0)rows.splice(i,1);}},
  },scheduler:{
    async runAfter(delay,fn,args){const id='job-'+(++sequence);jobs.push({id,delay,fn,args,canceled:false});return id;},
    async cancel(id){jobs.find(j=>j.id===id).canceled=true;},
  }};return ctx;
}
async function lobby(ctx,participants=['a','b'],status='lobby',room='test'){
  const id=await ctx.db.insert('quizLobbies',{room,participants,hostCharacterId:participants[0],status,createdAt:Date.now(),
    scores:participants.map(characterId=>({characterId,points:2}))});
  for(const characterId of participants)await ctx.db.insert('players',{playerId:characterId,characterId,room,sessionId:'session',lastSeen:Date.now()});
  return ctx.tables.quizLobbies.find(r=>r._id===id);
}

test('zero lobbies never start a worker; first starts and additional lobbies share it',async()=>{
  const ctx=context();await ensureQuizCleanupWorker(ctx);assert.equal(ctx.jobs.length,0);
  await lobby(ctx);await ensureQuizCleanupWorker(ctx);
  assert.equal(ctx.jobs.length,1);assert.equal(ctx.jobs[0].delay,30_000);
  await lobby(ctx,['c'],'lobby','other');await ensureQuizCleanupWorker(ctx);
  assert.equal(ctx.jobs.length,1);assert.equal(ctx.tables.quizCleanupWorker.length,1);
});

test('actual first lobby creation schedules the shared worker and repeated join reuses it',async()=>{
  const ctx=context(),[room,seats]=Object.entries(seatsByRoom)[0],seat=seats[0];
  await ctx.db.insert('players',{playerId:seat.characterId,characterId:seat.characterId,room,
    sessionId:'session',lastSeen:Date.now(),x:seat.seatX,y:seat.seatY});
  const args={room,characterId:seat.characterId,sessionId:'session'};
  await join._handler(ctx,args);await join._handler(ctx,args);
  assert.equal(ctx.tables.quizLobbies.length,1);assert.equal(ctx.jobs.length,1);
});

test('worker continues once, and duplicate or obsolete callbacks cannot schedule again',async()=>{
  const ctx=context();await lobby(ctx);await ensureQuizCleanupWorker(ctx);
  const args=ctx.jobs[0].args;
  await cleanup._handler(ctx,args);assert.equal(ctx.jobs.length,2);
  await cleanup._handler(ctx,args);assert.equal(ctx.jobs.length,2);
  ctx.tables.quizLobbies=[];await stopQuizCleanupWorkerIfEmpty(ctx);
  assert.equal(ctx.jobs[1].canceled,true);
  await lobby(ctx);await ensureQuizCleanupWorker(ctx);assert.equal(ctx.jobs.length,3);
  await cleanup._handler(ctx,ctx.jobs[1].args);assert.equal(ctx.jobs.length,3);
});

test('normal final leave cancels pending worker; recovery deletes abandoned lobbies and answers',async()=>{
  const ctx=context();await lobby(ctx,['a']);await ensureQuizCleanupWorker(ctx);
  await leave._handler(ctx,{room:'test',characterId:'a',sessionId:'session'});
  assert.equal(ctx.tables.quizLobbies.length,0);assert.equal(ctx.jobs[0].canceled,true);
  const l=await lobby(ctx,['b']);await ctx.db.insert('quizAnswers',{lobbyId:l._id});await ensureQuizCleanupWorker(ctx);
  ctx.tables.players=[];await cleanup._handler(ctx,ctx.jobs[1].args);
  assert.equal(ctx.tables.quizLobbies.length,0);assert.equal(ctx.tables.quizAnswers.length,0);
  assert.equal(ctx.jobs.length,2);assert.equal(ctx.tables.quizCleanupWorker[0].jobId,undefined);
});

test('recovery transfers host and preserves scores for active participants',async()=>{
  const ctx=context();await lobby(ctx,['a','b','c'],'starting');await ensureQuizCleanupWorker(ctx);
  ctx.tables.players[0].lastSeen=0;
  await cleanup._handler(ctx,ctx.jobs[0].args);
  const l=ctx.tables.quizLobbies[0];assert.equal(l.hostCharacterId,'b');
  assert.deepEqual(l.participants,['b','c']);assert.equal(l.status,'starting');
  assert.deepEqual(l.scores,[{characterId:'b',points:2},{characterId:'c',points:2}]);
});

test('recovery finishes active quiz below two participants',async()=>{
  const ctx=context();await lobby(ctx,['a','b'],'starting');await ensureQuizCleanupWorker(ctx);
  ctx.tables.players[0].lastSeen=0;await cleanup._handler(ctx,ctx.jobs[0].args);
  assert.equal(ctx.tables.quizLobbies[0].status,'finished');
  assert.equal(ctx.tables.quizLobbies[0].finishedReason,'insufficient-participants');
});

test('recovery does not finalize an expired question on behalf of players',async()=>{
  const ctx=context();const l=await lobby(ctx,['a','b'],'starting');
  Object.assign(l,{questionDeadline:0,questions:[{id:'q',correctAnswer:0}],scoredQuestionIds:[]});
  await ctx.db.insert('quizAnswers',{lobbyId:l._id,questionId:'q',characterId:'a',answerIndex:0});
  await ensureQuizCleanupWorker(ctx);await cleanup._handler(ctx,ctx.jobs[0].args);
  assert.deepEqual(l.scoredQuestionIds,[]);assert.equal(l.timedOutCharacterIds,undefined);
  assert.equal(l.questionDeadline,0);
});

test('one-shot bootstrap activates recovery for pre-existing lobbies without duplication',async()=>{
  const ctx=context();await lobby(ctx);await cleanup._handler(ctx,{});await cleanup._handler(ctx,{});
  assert.equal(ctx.jobs.length,1);
});
