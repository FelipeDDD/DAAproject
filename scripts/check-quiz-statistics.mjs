import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import { claimTestCharacter,releaseTestCharacter } from './claim-test-character.mjs';

const client=new ConvexClient(process.env.VITE_CONVEX_URL);let identity;
try{
  identity=await claimTestCharacter(client);
  const queryArgs={characterId:identity.characterId,sessionId:identity.sessionId,mode:'study'};
  const before=await client.query(api.quizStatistics.summary,queryArgs);
  const run=await client.mutation(api.soloStudy.start,{
    characterId:identity.characterId,sessionId:identity.sessionId,
    mode:'study',category:'Hardware',topic:null,difficulty:'medium',count:5,
  });
  assert.equal(run.questions.length,5);assert.ok(run.runId);
  const answerArgs={
    characterId:identity.characterId,sessionId:identity.sessionId,
    runId:run.runId,questionIndex:0,answerIndex:run.questions[0].correctAnswer,
  };
  const first=await client.mutation(api.quizStatistics.recordSoloAnswer,answerArgs);
  const duplicate=await client.mutation(api.quizStatistics.recordSoloAnswer,answerArgs);
  assert.equal(first.created,true);assert.equal(duplicate.created,false);
  const after=await client.query(api.quizStatistics.summary,queryArgs);
  assert.equal(after.overall.answered-before.overall.answered,1);
  assert.equal(after.overall.correct-before.overall.correct,1);
  assert.ok(after.byCategory.some(item=>item.name==='Hardware'));
  console.log('PASS: solo answer persisted once and updated the character statistics.');
}finally{
  if(identity)await releaseTestCharacter(client,identity);
  await client.close();
}
