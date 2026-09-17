import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TerminalLeaderboardBridge,TERMINAL_LEADERBOARD_MESSAGES,normalizeLeaderboardRows,
} from '../src/terminal/TerminalLeaderboardBridge.js';
import {
  IT_CHALLENGE_DURATION_MS,IT_CHALLENGE_RULES_VERSION,itChallengeRulesKey,
} from '../src/quiz/itChallengeRules.js';

function row(characterId,score,overrides={}){
  return {
    characterId,score,rulesKey:itChallengeRulesKey(),rulesVersion:IT_CHALLENGE_RULES_VERSION,
    durationMs:IT_CHALLENGE_DURATION_MS,variant:'5m',correct:10,wrong:2,skipped:1,
    manualSkip:1,timeoutSkip:0,mediumCorrect:7,hardCorrect:3,totalAnswered:12,
    accuracy:83.3,achievedAt:1000,...overrides,
  };
}

test('terminal leaderboard keeps only current challenge records and ranks a dynamic list',()=>{
  const records=normalizeLeaderboardRows([
    row('michael',80),row('future-player',120),row('felipe',99),
    row('old',999,{rulesVersion:0,rulesKey:'5m:v0'}),
  ],{currentCharacterId:'felipe'});
  assert.deepEqual(records.map(item=>[item.rank,item.name,item.score]),[
    [1,'Future Player',120],[2,'Felipe',99],[3,'Michael',80],
  ]);
  assert.equal(records[1].isCurrentPlayer,true);
  assert.equal(records[0].accuracy,83.3);
});

test('terminal leaderboard bridge uses the existing Convex query and preserves record details',async()=>{
  const messages=[];const queryReference={};
  const contentWindow={postMessage(message,origin){messages.push({message,origin});}};
  const presence={
    identity:{characterId:'sarina'},api:{itChallenge:{leaderboard:queryReference}},
    client:{async query(reference,args){assert.equal(reference,queryReference);assert.deepEqual(args,{});return [row('sarina',147)];}},
  };
  const frame={contentWindow};const bridge=new TerminalLeaderboardBridge({frame,presence,origin:'http://local.test'});
  const event={origin:'http://local.test',source:contentWindow,data:{type:TERMINAL_LEADERBOARD_MESSAGES.request,requestId:4}};
  assert.equal(await bridge.handle(event),true);
  const response=messages[0].message;
  assert.equal(response.requestId,4);assert.equal(response.state.records[0].name,'Sarina');
  assert.equal(response.state.records[0].manualSkip,1);assert.equal(response.state.records[0].isCurrentPlayer,true);
  assert.equal(response.state.rulesKey,itChallengeRulesKey());
});
