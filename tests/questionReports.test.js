import test from 'node:test';
import assert from 'node:assert/strict';
import { submitQuestionReport } from '../convex/questionReports.js';
import { handleTerminalQuestionReport } from '../src/terminal/TerminalQuestionReportBridge.js';
import { QUESTION_REPORT_MESSAGES } from '../src/quiz/questionReportConfig.js';

function fixture(mode='study'){
  const player={_id:'players:1',playerId:'live-1',profileId:'profiles:1',sessionId:'session-1',lastSeen:Date.now()};
  const runId=`${mode==='study'?'soloQuizRuns':'itChallengeRuns'}:1`;
  const run={...player,_id:runId,mode,
    questions:[{id:'hardware-001#2',category:'Hardware',topic:null,difficulty:'medium',correctAnswer:2,answerCount:4}]};
  const tables={players:[player],soloQuizRuns:mode==='study'?[run]:[],itChallengeRuns:mode==='challenge'?[run]:[],questionReports:[]};
  const db={
    normalizeId:(table,id)=>id.startsWith(`${table}:`)?id:null,
    async get(id){return Object.values(tables).flat().find(row=>row._id===id)??null;},
    query(table){return {withIndex(_index,filter){const conditions=[];const q={eq(key,value){conditions.push([key,value]);return q;}};filter(q);
      const found=()=>tables[table].filter(row=>conditions.every(([key,value])=>row[key]===value));
      const cursor={async unique(){return found()[0]??null;},async collect(){return found();},order(){return {async first(){return found().at(-1)??null;}};}};return cursor;}};},
    async insert(table,value){const id=`${table}:${tables[table].length+1}`;tables[table].push({_id:id,...structuredClone(value)});return id;},
    async patch(id,patch){Object.assign(await this.get(id),patch);},
  };
  const args={playerId:player.playerId,sessionId:player.sessionId,runId,mode,questionId:'hardware-001#2',questionIndex:0,
    reason:'unclear',comment:'  Needs context  ',snapshot:{question:'Concrete generated question?',answers:['A','B','C','D'],explanation:'Explanation',media:{type:'text',content:'Extra context'}}};
  return {ctx:{db},args,player,run,tables};
}

test('Study and Challenge reports save displayed snapshots with session-owned answer/metadata, independently of progression',async()=>{
  for(const mode of ['study','challenge']){
    const h=fixture(mode),before=structuredClone(h.run);
    const result=await submitQuestionReport(h.ctx,h.args);
    assert.equal(result.alreadyReported,false);
    const [report]=h.tables.questionReports;
    assert.equal(report.profileId,h.player.profileId);assert.equal(report.questionId,'hardware-001');
    assert.equal(report.occurrenceId,'hardware-001#2');assert.equal(report.mode,mode);
    assert.equal(report.status,'pending');assert.equal(report.comment,'Needs context');
    assert.deepEqual(report.snapshot,{...h.args.snapshot,correctAnswer:2});
    assert.deepEqual(h.run,before);
  }
});

test('repeated pending reports deduplicate even if alternatives have been shuffled again',async()=>{
  const h=fixture();await submitQuestionReport(h.ctx,h.args);
  const result=await submitQuestionReport(h.ctx,{...h.args,snapshot:{...h.args.snapshot,answers:['C','D','A','B']}});
  assert.equal(result.alreadyReported,true);assert.equal(h.tables.questionReports.length,1);
});

test('stale sessions, guests and another profile/run cannot send reports',async()=>{
  const stale=fixture();await assert.rejects(submitQuestionReport(stale.ctx,{...stale.args,sessionId:'stale'}),/CHARACTER_SESSION_LOST/);
  const guest=fixture();delete guest.player.profileId;await assert.rejects(submitQuestionReport(guest.ctx,guest.args),/PROFILE_REQUIRED/);
  const foreign=fixture();foreign.run.profileId='profiles:another';await assert.rejects(submitQuestionReport(foreign.ctx,foreign.args),/session/);
  const wrongMode=fixture('challenge');await assert.rejects(submitQuestionReport(wrongMode.ctx,{...wrongMode.args,mode:'study'}),/session/);
});

test('invalid question IDs, reasons, oversized comments and malformed snapshots are rejected without writing',async()=>{
  const h=fixture();
  for(const patch of [{questionId:'not-in-run'},{questionIndex:9},{reason:'unknown'},{comment:'x'.repeat(1001)},
    {snapshot:{...h.args.snapshot,answers:['one']}},{snapshot:{...h.args.snapshot,question:''}}])
    await assert.rejects(submitQuestionReport(h.ctx,{...h.args,...patch}));
  assert.equal(h.tables.questionReports.length,0);
});

test('report bridge rejects foreign sources and returns only a correlated acknowledgment, including failures',async()=>{
  const messages=[],calls=[];const contentWindow={postMessage(message){messages.push(message);}};
  const frame={contentWindow},origin='https://game.test';
  const controller={async reportTerminalQuestion(payload){calls.push(payload);return {reportId:'private-id',alreadyReported:false};}};
  const event={origin,source:contentWindow,data:{type:QUESTION_REPORT_MESSAGES.request,payload:{requestId:'req-1',mode:'study',questionId:'q1',reason:'unclear',comment:''}}};
  assert.equal(await handleTerminalQuestionReport({event:{...event,origin:'https://other.test'},frame,controller,origin}),false);
  assert.equal(await handleTerminalQuestionReport({event:{...event,source:{}},frame,controller,origin}),false);
  assert.equal(calls.length,0);
  assert.equal(await handleTerminalQuestionReport({event,frame,controller,origin}),true);
  assert.deepEqual(messages[0],{type:QUESTION_REPORT_MESSAGES.result,requestId:'req-1',ok:true,alreadyReported:false});
  controller.reportTerminalQuestion=async()=>{throw new Error('Connection unavailable');};
  await handleTerminalQuestionReport({event,frame,controller,origin});
  assert.equal(messages[1].ok,false);assert.equal(messages[1].error,'Connection unavailable');
});
