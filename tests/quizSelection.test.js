import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RECENT_EXCLUSION_MINIMUM,RECENT_EXCLUSION_PERCENT,buildQuizQuestionSelection,
  questionTemplateId,recentExclusionCount,
} from '../convex/quizSelection.js';

const bank=(count,category='Hardware')=>Array.from({length:count},(_,index)=>({
  id:`${category.toLowerCase()}-${String(index).padStart(3,'0')}`,
  category,difficulty:'medium',question:`Question ${index}`,answers:['A','B','C','D'],correctAnswer:0,
}));
const history=(ids,start=10_000)=>ids.map((questionId,index)=>({questionId,seenAt:start-index}));

test('recent exclusion uses ten percent of the filtered pool with a minimum of five',()=>{
  assert.equal(RECENT_EXCLUSION_PERCENT,0.10);
  assert.equal(RECENT_EXCLUSION_MINIMUM,5);
  assert.equal(recentExclusionCount(30),5);
  assert.equal(recentExclusionCount(100),10);
  assert.equal(recentExclusionCount(250),25);
  const questionBank=[...bank(30,'Hardware'),...bank(100,'WiSo')];
  assert.equal(buildQuizQuestionSelection({questionBank,category:'Hardware'}).exclusionCount,5);
  assert.equal(buildQuizQuestionSelection({questionBank,category:'WiSo'}).exclusionCount,10);
});

test('recent questions are avoided while alternatives are available',()=>{
  const questionBank=bank(12),recent=questionBank.slice(0,5).map(question=>question.id);
  const result=buildQuizQuestionSelection({questionBank,count:5,seed:'avoid',recentHistories:[history(recent)]});
  assert.equal(result.questionIds.length,5);
  assert.ok(result.questionIds.every(id=>!recent.includes(id)));
});

test('old recent questions return first when the filtered pool is too small',()=>{
  const questionBank=bank(6),ids=questionBank.map(question=>question.id);
  const result=buildQuizQuestionSelection({questionBank,count:6,seed:'fallback',recentHistories:[history(ids)]});
  assert.equal(result.questionIds.length,6);
  assert.equal(new Set(result.questionIds).size,6);
  assert.equal(result.questionIds[0],ids[5]);
  assert.equal(result.questionIds[1],ids[4]);
});

test('anti-repetition alone never makes a quiz selection fail',()=>{
  const questionBank=bank(5),ids=questionBank.map(question=>question.id);
  const result=buildQuizQuestionSelection({questionBank,count:5,seed:'all-recent',recentHistories:[history(ids)]});
  assert.deepEqual(new Set(result.questionIds),new Set(ids));
});

test('multiplayer prefers questions that are recent for none of the participants',()=>{
  const questionBank=bank(20),ids=questionBank.map(question=>question.id);
  const result=buildQuizQuestionSelection({
    questionBank,count:5,seed:'multiplayer',
    recentHistories:[history(ids.slice(0,5),20_000),history(ids.slice(5,10),30_000)],
  });
  assert.ok(result.questionIds.every(id=>!ids.slice(0,10).includes(id)));
});

test('generated concrete IDs use their template ID for recent history',()=>{
  const questionBank=[
    ...bank(1),
    {id:'network-generated',category:'Hardware',difficulty:'medium',type:'generated'},
  ];
  assert.equal(questionTemplateId('network-generated#4'),'network-generated');
  const result=buildQuizQuestionSelection({
    questionBank,count:1,seed:'generated-history',
    recentHistories:[history(['network-generated#4'])],
  });
  assert.deepEqual(result.questionIds,['hardware-000']);
});

test('topic All does not filter and a selected topic filters before anti-repetition',()=>{
  const questionBank=[
    ...bank(4,'Hardware').map((question,index)=>({...question,topic:index<2?'CPU':'RAM'})),
    ...bank(2,'WiSo').map(question=>({...question,topic:null})),
  ];
  const all=buildQuizQuestionSelection({questionBank,category:'Hardware',topic:null,count:null,seed:'all-topics'});
  assert.equal(all.questionIds.length,4);
  const recent=[{questionId:'hardware-000',seenAt:100}];
  const cpu=buildQuizQuestionSelection({
    questionBank,category:'Hardware',topic:'CPU',count:1,seed:'cpu',recentHistories:[recent],
  });
  assert.deepEqual(cpu.questionIds,['hardware-001']);
});

test('a category allowlist filters before anti-repetition',()=>{
  const questionBank=[...bank(6,'Hardware'),...bank(6,'Netzwerk'),...bank(6,'WiSo')];
  const result=buildQuizQuestionSelection({
    questionBank,categories:['Hardware','Netzwerk'],count:null,seed:'it-only',
  });
  assert.equal(result.poolSize,12);
  assert.ok(result.questionIds.every(id=>!id.startsWith('wiso-')));
});
