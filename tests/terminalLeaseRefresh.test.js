import test from 'node:test';
import assert from 'node:assert/strict';
import * as study from '../convex/soloStudy.js';
import * as challenge from '../convex/itChallenge.js';
import { recordSoloAnswer } from '../convex/quizStatistics.js';
import { summary } from '../convex/quizStatistics.js';
import { SoloStudyController } from '../src/SoloStudyController.js';
import { TERMINAL_LEASE_MS } from '../src/multiplayer/presencePolicy.js';
function fixture(now,mode='terminal'){
 const tables=new Map();let id=0;const rows=t=>{if(!tables.has(t))tables.set(t,[]);return tables.get(t);};
 const player={_id:'player',playerId:'independent-live-id',characterId:'felipe',sessionId:'session',profileId:'profile',lastSeen:now,presenceMode:mode,terminalLeaseExpiresAt:now+5000};rows('players').push(player);
 let playerWrites=0;
 const db={query:t=>({withIndex:(_,filter)=>{const conditions=[];const builder={eq(k,v){conditions.push([k,v]);return builder;}};filter(builder);const matches=()=>rows(t).filter(r=>conditions.every(([k,v])=>r[k]===v));return {unique:async()=>matches()[0]??null,collect:async()=>matches()};}}),
 get:async key=>[...tables.values()].flat().find(r=>r._id===key),
 insert:async(t,value)=>{const key=String(++id);rows(t).push({_id:key,...value});return key;},
 patch:async(key,value)=>{const r=await db.get(key);if(key==='player')playerWrites++;Object.assign(r,value);},
 replace:async(key,value)=>{const r=await db.get(key);Object.assign(r,value);},
 delete:async key=>{for(const list of tables.values()){const i=list.findIndex(r=>r._id===key);if(i>=0)list.splice(i,1);}}};
 return {ctx:{db},rows,player,args:{playerId:'independent-live-id',sessionId:'session'},writes:()=>playerWrites};
}
for(const mode of ['terminal','playing'])test(`${mode}: all five existing activity mutations preserve gameplay and refresh only terminal lease`,async t=>{
 let now=100000;t.mock.method(Date,'now',()=>now);const {ctx,player,args,writes}=fixture(now,mode);
 const check=result=>{assert.equal(result.terminalLease?.terminalLeaseExpiresAt,mode==='terminal'?now+TERMINAL_LEASE_MS:undefined);if(mode==='terminal')assert.equal(player.terminalLeaseExpiresAt,now+TERMINAL_LEASE_MS);};
 const run=await study.start._handler(ctx,{...args,mode:'study',category:'Hardware',topic:null,difficulty:'medium',count:5});check(run);
 now+=1000;check(await recordSoloAnswer._handler(ctx,{...args,runId:run.runId,questionIndex:0,answerIndex:0}));
 now+=1000;check(await study.markViewed._handler(ctx,{...args,questionId:run.questions[1].id}));
 now+=1000;const it=await challenge.start._handler(ctx,args);check(it);
 now+=1000;check(await challenge.finish._handler(ctx,{...args,runId:it.runId,outcomes:[],lastViewedQuestionIndex:0}));
 assert.equal(writes(),mode==='terminal'?5:0);assert.equal(player.lastSeen,100000);
});
test('expired leases and wrong ownership fail every activity before any write',async t=>{
 let now=100000;t.mock.method(Date,'now',()=>now);const {ctx,player,args,writes}=fixture(now);
 const calls=[[study.start,{...args,mode:'study',category:'Hardware',difficulty:'medium',count:5}],[study.markViewed,{...args,questionId:'hardware-001'}],[recordSoloAnswer,{...args,runId:'missing',questionIndex:0}],[challenge.start,args],[challenge.finish,{...args,runId:'missing',outcomes:[],lastViewedQuestionIndex:0}]];
 now=player.terminalLeaseExpiresAt;
 for(const [mutation,values] of calls)await assert.rejects(mutation._handler(ctx,values),/CHARACTER_SESSION_LOST/);
 assert.equal(writes(),0);player.terminalLeaseExpiresAt=now+1000;
 for(const [mutation,values] of calls)await assert.rejects(mutation._handler(ctx,{...values,sessionId:'other'}),/CHARACTER_SESSION_LOST/);
 assert.equal(writes(),0);
});
test('Study history and statistics follow the profile across character bases, but the old live session cannot write',async t=>{
 t.mock.method(Date,'now',()=>100000);
 const {ctx,rows,player,args}=fixture(100000,'playing');
 const run=await study.start._handler(ctx,{...args,mode:'study',category:'Hardware',topic:null,difficulty:'medium',count:5});
 await recordSoloAnswer._handler(ctx,{...args,runId:run.runId,questionIndex:0,answerIndex:run.questions[0].correctAnswer});
 assert.equal(rows('quizQuestionHistory').length,1);
 assert.equal(rows('quizQuestionHistory')[0].profileId,'profile');
 assert.equal(rows('quizAttempts')[0].profileId,'profile');
 Object.assign(player,{playerId:'new-live-id',characterId:'sarina',characterBaseId:'sarina',sessionId:'new-session'});
 const second={playerId:'new-live-id',sessionId:'new-session'};
 assert.equal((await summary._handler(ctx,second)).overall.correct,1);
 await study.markViewed._handler(ctx,{...second,questionId:run.questions[1].id});
 assert.equal(rows('quizQuestionHistory').length,1);
 await assert.rejects(recordSoloAnswer._handler(ctx,{...args,runId:run.runId,questionIndex:1}),/CHARACTER_SESSION_LOST/);
 await assert.rejects(recordSoloAnswer._handler(ctx,{...second,runId:run.runId,questionIndex:1}),/Solo quiz session unavailable/);
 assert.equal(rows('quizAttempts').length,1);
});
test('IT Challenge personal best is profile-owned across base changes',async t=>{
 t.mock.method(Date,'now',()=>100000);
 const {ctx,rows,player,args}=fixture(100000,'playing');
 const first=await challenge.start._handler(ctx,args);
 await challenge.finish._handler(ctx,{...args,runId:first.runId,outcomes:[],lastViewedQuestionIndex:0});
 assert.equal(rows('itChallengeHighScores')[0].profileId,'profile');
 Object.assign(player,{playerId:'new-live-id',characterId:'michael',characterBaseId:'michael',sessionId:'new-session'});
 const second={playerId:'new-live-id',sessionId:'new-session'};
 const next=await challenge.start._handler(ctx,second);
 const result=await challenge.finish._handler(ctx,{...second,runId:next.runId,outcomes:[],lastViewedQuestionIndex:0});
 assert.equal(rows('itChallengeHighScores').length,1);
 assert.equal(result.personalBest.profileId,'profile');
 assert.equal(rows('itChallengeRuns').at(-1).profileId,'profile');
});
test('activity response updates local lease with one request; stale responses cannot shorten it; expiry invokes recovery',async t=>{
 t.mock.method(Date,'now',()=>100000);let calls=0,lost=0;
 const controller=Object.create(SoloStudyController.prototype);
 controller.presence={terminalLease:{terminalLeaseExpiresAt:100001},client:{async mutation(){calls++;return {terminalLease:{serverNow:100000,terminalLeaseExpiresAt:700000}};}},fail(){lost++;}};
 await controller.terminalMutation('study',{});assert.equal(calls,1);assert.equal(controller.presence.terminalLease.terminalLeaseExpiresAt,700000);
 controller.presence.client.mutation=async()=>({terminalLease:{serverNow:99999,terminalLeaseExpiresAt:699999}});
 await controller.terminalMutation('study',{});assert.equal(controller.presence.terminalLease.terminalLeaseExpiresAt,700000);
 controller.presence.client.mutation=async()=>{throw Error('CHARACTER_SESSION_LOST');};
 await assert.rejects(controller.terminalMutation('study',{}));assert.equal(lost,1);
});
