import test from 'node:test';
import assert from 'node:assert/strict';
import { recordQuizAttempt } from '../convex/quizStatisticsStore.js';
import {
  applyAttemptToBucket,buildQuizStatisticsSummary,normalizeStatisticsQuestionId,statisticAccuracy,
  WEAK_STATISTICS_MINIMUM_ANSWERS,
} from '../convex/quizStatisticsModel.js';

class MemoryDatabase{
  constructor(){this.tables=new Map();this.nextId=1;}
  rows(table){if(!this.tables.has(table))this.tables.set(table,[]);return this.tables.get(table);}
  query(table){
    return {withIndex:(_name,filter)=>{
      const conditions=[],builder={eq:(field,value)=>{conditions.push([field,value]);return builder;}};filter(builder);
      const matches=()=>this.rows(table).filter(row=>conditions.every(([field,value])=>row[field]===value));
      return {unique:async()=>{const rows=matches();if(rows.length>1)throw new Error('Not unique');return rows[0]??null;},collect:async()=>matches()};
    }};
  }
  async insert(table,value){const id=`${table}:${this.nextId++}`;this.rows(table).push({_id:id,...value});return id;}
  async patch(id,value){for(const rows of this.tables.values()){const row=rows.find(item=>item._id===id);if(row){Object.assign(row,value);return;}}}
}

const attempt=(overrides={})=>({
  attemptKey:'study:run:0:michael',characterId:'michael',questionId:'hardware-001',
  category:'Hardware',topic:null,difficulty:'medium',mode:'study',correct:true,answeredAt:100,
  ...overrides,
});

test('correct and wrong attempts increment one aggregate bucket',async()=>{
  const db=new MemoryDatabase(),ctx={db};
  await recordQuizAttempt(ctx,attempt());
  await recordQuizAttempt(ctx,attempt({attemptKey:'study:run:1:michael',correct:false,answeredAt:200}));
  assert.deepEqual(db.rows('quizPerformance').map(({correct,wrong,answered})=>({correct,wrong,answered})),[
    {correct:1,wrong:1,answered:2},
  ]);
  assert.equal(statisticAccuracy(1,2),50);
});

test('the same attempt key is idempotent',async()=>{
  const db=new MemoryDatabase(),ctx={db};
  assert.equal((await recordQuizAttempt(ctx,attempt())).created,true);
  assert.equal((await recordQuizAttempt(ctx,attempt())).created,false);
  assert.equal(db.rows('quizAttempts').length,1);assert.equal(db.rows('quizPerformance')[0].answered,1);
});

test('statistics aggregate category, topic, difficulty and mode with accurate percentages',()=>{
  const rows=[
    {category:'Rechnungen',topic:'ROI',difficulty:'medium',mode:'study',correct:3,wrong:1,answered:4},
    {category:'Rechnungen',topic:'Break-Even',difficulty:'hard',mode:'challenge',correct:1,wrong:1,answered:2},
    {category:'Hardware',topic:null,difficulty:'medium',mode:'multiplayer',correct:1,wrong:3,answered:4},
  ];
  const summary=buildQuizStatisticsSummary(rows);
  assert.deepEqual(summary.overall,{correct:5,wrong:5,answered:10,accuracy:50});
  const rechnungen=summary.byCategory.find(item=>item.name==='Rechnungen');
  assert.equal(rechnungen.answered,6);assert.equal(rechnungen.topics.length,2);
  assert.deepEqual(summary.byCategory.find(item=>item.name==='Hardware').topics,[]);
  assert.equal(summary.byDifficulty.find(item=>item.name==='medium').accuracy,50);
  assert.equal(summary.byMode.find(item=>item.name==='challenge').accuracy,50);
  const studyOnly=buildQuizStatisticsSummary(rows,{mode:'study'});
  assert.deepEqual(studyOnly.overall,{correct:3,wrong:1,answered:4,accuracy:75});
});

test('weak groups require enough answers before classification',()=>{
  const summary=buildQuizStatisticsSummary([
    {category:'Hardware',topic:null,difficulty:'medium',mode:'study',correct:0,wrong:1,answered:1},
    {category:'Netzwerk',topic:'Subnetting',difficulty:'hard',mode:'study',correct:1,wrong:4,answered:5},
  ]);
  assert.equal(WEAK_STATISTICS_MINIMUM_ANSWERS,5);
  assert.deepEqual(summary.weakCategories.map(item=>item.name),['Netzwerk']);
  assert.deepEqual(summary.weakTopics.map(item=>item.name),['Subnetting']);
});

test('generated question instances use their normalized template ID',async()=>{
  assert.equal(normalizeStatisticsQuestionId('network-subnet-hosts-generated#3'),'network-subnet-hosts-generated');
  const db=new MemoryDatabase();
  await recordQuizAttempt({db},attempt({questionId:'network-subnet-hosts-generated#3'}));
  assert.equal(db.rows('quizAttempts')[0].questionId,'network-subnet-hosts-generated');
});

test('characters and individual multiplayer attempts remain separated',async()=>{
  const db=new MemoryDatabase(),ctx={db};
  await recordQuizAttempt(ctx,attempt({attemptKey:'multiplayer:lobby:q:michael',mode:'multiplayer'}));
  await recordQuizAttempt(ctx,attempt({attemptKey:'multiplayer:lobby:q:sarina',characterId:'sarina',mode:'multiplayer',correct:false}));
  const michael=buildQuizStatisticsSummary(db.rows('quizPerformance').filter(row=>row.characterId==='michael'));
  const sarina=buildQuizStatisticsSummary(db.rows('quizPerformance').filter(row=>row.characterId==='sarina'));
  assert.deepEqual([michael.overall.correct,michael.overall.wrong],[1,0]);
  assert.deepEqual([sarina.overall.correct,sarina.overall.wrong],[0,1]);
});

test('bucket updates keep answered equal to correct plus wrong',()=>{
  const updated=applyAttemptToBucket({correct:4,wrong:2,answered:6},{correct:false});
  assert.deepEqual(updated,{correct:4,wrong:3,answered:7});
});
