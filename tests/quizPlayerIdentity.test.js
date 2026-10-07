import test from 'node:test';
import assert from 'node:assert/strict';
import { answer, current, nextQuestion, cleanup, finishTimedQuestion, join, leave, start } from '../convex/quizLobbies.js';
import seatsByRoom from '../convex/quizSeatDefinitions.js';
const questionContext={lobbyId:'lobby',questionId:'question',questionIndex:0};

function fixture() {
  const now = Date.now();
  const players = [
    { _id: 'a', playerId: 'live-a', characterId: 'michael', characterBaseId: 'michael',
      sessionId: 'session-a', room: 'school', name: 'Alice', lastSeen: now },
    { _id: 'b', playerId: 'live-b', characterId: 'michael', characterBaseId: 'michael',
      sessionId: 'session-b', room: 'school', name: 'Bob', lastSeen: now },
  ];
  const lobby = { _id: 'lobby', room: 'school', hostPlayerId: 'live-a',
    participants: ['live-a', 'live-b'], status: 'starting', createdAt: now,
    questionDeadline: now + 60_000, questionIndex: 0, scoredQuestionIds: [],
    scores: [{ playerId: 'live-a', points: 0 }, { playerId: 'live-b', points: 0 }],
    questions: [{ id: 'question', category: 'Hardware', difficulty: 'medium',
      question: 'Question?', answers: ['A', 'B'], correctAnswer: 0 }],
  };
  const tables = { players, profiles:[{_id:'profile-a'}],currencyEvents:[],quizLobbies: [lobby], quizAnswers: [], quizCleanupWorker: [],quizAttempts:[],quizPerformance:[],quizQuestionHistory:[] };
  let next = 0;
  const ctx = { db: {
    query(table) {
      const conditions = [];
      const q = {
        withIndex(_index, build) {
          const builder = { eq(field, value) { conditions.push([field, value]); return builder; } };
          build(builder); return q;
        },
        async collect() { return tables[table].filter(row => conditions.every(([field, value]) => row[field] === value)); },
        async unique() { return (await q.collect())[0] ?? null; },
        async first() { return (await q.collect())[0] ?? null; },
      };
      return q;
    },
    async insert(table, value) { const _id = `new-${++next}`; tables[table].push({ _id, ...value }); return _id; },
    async get(id) { return Object.values(tables).flat().find(row => row._id === id) ?? null; },
    async patch(id, patch) { Object.assign(await this.get(id), patch); },
    async delete(id) { for (const rows of Object.values(tables)) {
      const index = rows.findIndex(row => row._id === id);
      if (index !== -1) rows.splice(index, 1);
    } },
  } };
  return { ctx, lobby, players, tables };
}

test('two hypothetical same-base players keep distinct answers, scores and host authority', async () => {
  const { ctx, lobby, tables } = fixture();
  const alice = { ...questionContext,room: 'school', playerId: 'live-a', sessionId: 'session-a' };
  const bob = { ...questionContext,room: 'school', playerId: 'live-b', sessionId: 'session-b' };
  const initial = await current._handler(ctx, { room: 'school', playerId: 'live-b' });
  assert.deepEqual(initial.participants, ['live-a', 'live-b']);
  assert.deepEqual(initial.participantDetails.map(row => row.characterBaseId), ['michael', 'michael']);
  assert.equal(initial.hostPlayerId, 'live-a');
  await assert.rejects(answer._handler(ctx, { ...alice, sessionId: bob.sessionId, answerIndex: 0 }), /Invalid session/);
  await answer._handler(ctx, { ...alice, answerIndex: 0 });
  await answer._handler(ctx, { ...bob, answerIndex: 1 });
  assert.deepEqual(tables.quizAnswers.map(row => row.playerId), ['live-a', 'live-b']);
  assert.deepEqual(lobby.scores, [{ playerId: 'live-a', points: 1 }, { playerId: 'live-b', points: 0 }]);
  assert.equal((await current._handler(ctx, { room: 'school', playerId: 'live-b' })).ownAnswerIndex, 1);
  await assert.rejects(nextQuestion._handler(ctx, bob), /Only the host/);
  await nextQuestion._handler(ctx, alice);
  assert.equal(lobby.status, 'finished');
});

test('multiplayer answers persist by profile while guest answers stay live-only',async()=>{
  const {ctx,players,tables}=fixture();
  players[0].profileId='profile-a';
  await answer._handler(ctx,{...questionContext,room:'school',playerId:'live-a',sessionId:'session-a',answerIndex:0});
  await answer._handler(ctx,{...questionContext,room:'school',playerId:'live-b',sessionId:'session-b',answerIndex:1});
  assert.deepEqual(tables.quizAttempts.map(row=>row.profileId),['profile-a']);
  assert.deepEqual(tables.quizPerformance.map(row=>row.profileId),['profile-a']);
  assert.equal(tables.quizAnswers.length,2);
  assert.equal(tables.profiles[0].currency.coins,1);
  await answer._handler(ctx,{...questionContext,room:'school',playerId:'live-a',sessionId:'session-a',answerIndex:0});
  assert.equal(tables.profiles[0].currency.coins,1);
  assert.equal(tables.currencyEvents.length,1);
});

test('reclaimed slot and delayed old player ID cannot inherit a quiz seat or submit an answer', async () => {
  const { ctx, lobby, players } = fixture();
  lobby.seatAssignments=[{playerId:'live-a',seatId:seatsByRoom.school[0].seatId},{playerId:'live-b',seatId:seatsByRoom.school[1].seatId}];
  const old = { room: 'school', playerId: 'live-a', sessionId: 'session-a' };
  players[0] = { ...players[0], _id: 'new-a', playerId: 'live-new', sessionId: 'new-session' };
  assert.deepEqual((await current._handler(ctx, { room: 'school', playerId: 'live-new' })).participants, ['live-b']);
  assert.deepEqual((await current._handler(ctx, { room: 'school', playerId: 'live-new' })).seatAssignments,[{playerId:'live-b',seatId:seatsByRoom.school[1].seatId}]);
  await assert.rejects(join._handler(ctx,old),/Invalid session or room/);
  assert.equal((await current._handler(ctx, { room: 'school', playerId: 'live-new' })).ownAnswerIndex, undefined);
  await assert.rejects(answer._handler(ctx, { ...old, answerIndex: 0 }), /Invalid session/);
  await assert.rejects(answer._handler(ctx, { room: 'school', playerId: 'live-new', sessionId: 'new-session', answerIndex: 0 }), /unavailable/);
  // Recovery transfers ownership to the remaining live participant.
  ctx.scheduler = { runAfter: async () => 'job' };
  await ctx.db.insert('quizCleanupWorker', { key: 'multiplayer-quiz', generation: 1, jobId: 'pending' });
  await cleanup._handler(ctx, { generation: 1 });
  assert.equal(lobby.hostPlayerId, 'live-b');
  assert.equal(lobby.finishedReason, 'insufficient-participants');
});

test('leave releases only the seat owned by the matching playerId and sessionId',async()=>{
  const {ctx,lobby,players}=fixture();
  lobby.seatAssignments=[
    {playerId:'live-a',seatId:seatsByRoom.school[0].seatId},
    {playerId:'live-b',seatId:seatsByRoom.school[1].seatId},
  ];
  const stale={room:'school',playerId:'live-a',sessionId:'old-session'};
  await assert.rejects(leave._handler(ctx,stale),/Invalid session or room/);
  assert.deepEqual(lobby.participants,['live-a','live-b']);
  assert.deepEqual(lobby.seatAssignments.map(seat=>seat.playerId),['live-a','live-b']);

  await leave._handler(ctx,{room:'school',playerId:'live-a',sessionId:players[0].sessionId});
  assert.deepEqual(lobby.participants,['live-b']);
  assert.deepEqual(lobby.seatAssignments,[{playerId:'live-b',seatId:seatsByRoom.school[1].seatId}]);
});

test('same-base players join, start and answer independently using generic seat IDs',async()=>{
  const {ctx,players,tables}=fixture();
  tables.quizLobbies.length=0;
  const michael=seatsByRoom.school[0];
  const sarina=seatsByRoom.school[1];
  Object.assign(players[0],{x:michael.seatX,y:michael.seatY});
  Object.assign(players[1],{characterId:'michael',characterBaseId:'michael',x:sarina.seatX,y:sarina.seatY});
  ctx.scheduler={runAfter:async()=> 'quiz-job'};
  const first={room:'school',playerId:'live-a',sessionId:'session-a'};
  const second={room:'school',playerId:'live-b',sessionId:'session-b'};
  await join._handler(ctx,first);
  await join._handler(ctx,second);
  assert.deepEqual(tables.quizLobbies[0].participants,['live-a','live-b']);
  await start._handler(ctx,first);
  const live=await current._handler(ctx,{room:'school',playerId:'live-a'});
  assert.equal(live.status,'starting');
  assert.equal(live.participantDetails[0].characterBaseId,'michael');
  assert.equal(live.participantDetails[1].characterBaseId,'michael');
  assert.deepEqual(tables.quizLobbies[0].seatAssignments.map(seat=>seat.playerId),['live-a','live-b']);
  assert.equal(new Set(tables.quizLobbies[0].seatAssignments.map(seat=>seat.seatId)).size,2);
  const context={lobbyId:live.lobbyId,questionId:live.question.id,questionIndex:live.questionIndex};
  await answer._handler(ctx,{...first,...context,answerIndex:0});
  await answer._handler(ctx,{...second,...context,answerIndex:1});
  assert.deepEqual(tables.quizAnswers.map(row=>row.playerId),['live-a','live-b']);
});

test('timeout resolves each live player independently and rejects a stale session',async()=>{
  const {ctx,lobby,tables}=fixture();
  lobby.questionDeadline=Date.now()-1;
  const first={room:'school',playerId:'live-a',sessionId:'session-a'};
  const second={room:'school',playerId:'live-b',sessionId:'session-b'};
  await assert.rejects(finishTimedQuestion._handler(ctx,{...first,sessionId:'old-session'}),/Invalid session/);
  await finishTimedQuestion._handler(ctx,{...questionContext,...first,answerIndex:0});
  assert.deepEqual(lobby.timedOutPlayerIds,['live-a']);
  assert.equal(lobby.scoredQuestionIds.length,0);
  await finishTimedQuestion._handler(ctx,{...questionContext,...second});
  assert.deepEqual(lobby.timedOutPlayerIds,['live-a','live-b']);
  assert.deepEqual(lobby.scores,[{playerId:'live-a',points:1},{playerId:'live-b',points:0}]);
  assert.deepEqual(tables.quizAnswers.map(row=>row.playerId),['live-a']);
  assert.equal((await current._handler(ctx,{room:'school',playerId:'live-b'})).allAnswered,true);
});

test('a delayed multiplayer answer is rejected after advancing the question or recreating the lobby',async()=>{
  const {ctx,lobby,players,tables}=fixture();players[0].profileId='profile-a';
  const args={...questionContext,room:'school',playerId:'live-a',sessionId:'session-a',answerIndex:0};
  await answer._handler(ctx,args);
  lobby.questions.push({...lobby.questions[0],id:'next-question'});lobby.questionIndex=1;
  await assert.rejects(answer._handler(ctx,args),/QUIZ_QUESTION_CHANGED/);
  await assert.rejects(finishTimedQuestion._handler(ctx,args),/QUIZ_QUESTION_CHANGED/);
  lobby._id='replacement-lobby';lobby.questionIndex=0;
  await assert.rejects(answer._handler(ctx,args),/QUIZ_QUESTION_CHANGED/);
  assert.equal(tables.profiles[0].currency.coins,1);assert.equal(tables.currencyEvents.length,1);
});
