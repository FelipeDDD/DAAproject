import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { CHARACTERS } from '../src/characters.js';

const client=new ConvexClient(process.env.VITE_CONVEX_URL);let identity;
try{
  const token=process.env.QUIZ_TEST_PROFILE_TOKEN;
  if(!token)throw new Error('Set QUIZ_TEST_PROFILE_TOKEN to a local test profile session token.');
  const availability=await client.query(api.players.availability,{});
  if(availability.players.length>=availability.maxPlayers)throw new Error('Player capacity is full for the statistics test.');
  const character=CHARACTERS[0];
  const sessionId=crypto.randomUUID();
  const claimed=await client.action(api.profiles.claimCharacter,{
    token,characterBaseId:character.id,presenceSessionId:sessionId,
  });
  if(!claimed.ok)throw new Error('Character slot became unavailable.');
  identity={playerId:claimed.playerId,characterId:character.id,sessionId};
  const queryArgs={playerId:identity.playerId,sessionId:identity.sessionId,mode:'study'};
  const before=await client.query(api.quizStatistics.summary,queryArgs);
  const run=await client.mutation(api.soloStudy.start,{
    playerId:identity.playerId,sessionId:identity.sessionId,
    mode:'study',category:'Hardware',topic:null,difficulty:'medium',count:5,
  });
  assert.equal(run.questions.length,5);assert.ok(run.runId);
  const answerArgs={
    playerId:identity.playerId,sessionId:identity.sessionId,
    runId:run.runId,questionIndex:0,answerIndex:run.questions[0].correctAnswer,
  };
  const first=await client.mutation(api.quizStatistics.recordSoloAnswer,answerArgs);
  const duplicate=await client.mutation(api.quizStatistics.recordSoloAnswer,answerArgs);
  assert.equal(first.created,true);assert.equal(duplicate.created,false);
  const after=await client.query(api.quizStatistics.summary,queryArgs);
  assert.equal(after.overall.answered-before.overall.answered,1);
  assert.equal(after.overall.correct-before.overall.correct,1);
  assert.ok(after.byCategory.some(item=>item.name==='Hardware'));
  console.log('PASS: solo answer persisted once and updated profile statistics.');
}finally{
  if(identity)await client.mutation(api.players.release,identity);
  await client.close();
}
