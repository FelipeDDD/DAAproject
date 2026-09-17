import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuizReviewRecords,filterQuizReviewRecords,regenerateQuizRecord,summarizeQuizReviewRecords,
} from '../src/quiz-database/model.js';
import { validateQuizQuestion } from '../src/quizValidation.js';

const staticQuestions=[{
  id:'hardware-001',category:'Hardware',difficulty:'medium',question:'Hardware Frage',
  topic:'CPU',answers:['A','B','C','D'],correctAnswer:1,explanation:'Hardware Erklärung',source:'hardware.csv',
},{
  id:'wiso-001',category:'WiSo',difficulty:'hard',question:'WiSo Frage',
  answers:['A','B','C','D'],correctAnswer:0,source:'wiso.csv',
}];
const generated=[{
  id:'network-generated',category:'Netzwerk',difficulty:'medium',type:'generated',
  generate(random){const value=Math.floor(random()*100);return {question:`Netz ${value}`,answers:['A','B','C','D'],correctAnswer:2};},
}];
const materialize=(template,random)=>({
  id:template.id,category:template.category,difficulty:template.difficulty,...template.generate(random),
});

test('quiz database model includes static origins, generated templates and automatic summaries',()=>{
  const records=createQuizReviewRecords(staticQuestions,generated,materialize,()=>0.42);
  assert.equal(records.length,3);
  assert.equal(records[0].source,'hardware.csv');
  assert.equal(records[2].generated,true);
  assert.equal(records[2].preview.question,'Netz 42');
  assert.deepEqual(summarizeQuizReviewRecords(records),{
    total:3,generated:1,invalid:0,
    categories:{Hardware:1,WiSo:1,Netzwerk:1},difficulties:{medium:2,hard:1},
  });
});

test('quiz database filters ID, question and explanation and sorts by category',()=>{
  const records=createQuizReviewRecords(staticQuestions,generated,materialize,()=>0.42);
  assert.deepEqual(filterQuizReviewRecords(records,{search:'hardware erklärung'}).map(item=>item.template.id),['hardware-001']);
  assert.deepEqual(filterQuizReviewRecords(records,{category:'Netzwerk',difficulty:'medium'}).map(item=>item.template.id),['network-generated']);
  assert.deepEqual(filterQuizReviewRecords(records,{category:'Hardware',topic:'CPU'}).map(item=>item.template.id),['hardware-001']);
  assert.deepEqual(filterQuizReviewRecords(records,{sort:'category'}).map(item=>item.template.category),['Hardware','Netzwerk','WiSo']);
});

test('quiz database search also matches category and topic metadata',()=>{
  const records=createQuizReviewRecords(staticQuestions,generated,materialize,()=>0.42);
  assert.deepEqual(filterQuizReviewRecords(records,{search:'hardware'}).map(item=>item.template.id),['hardware-001']);
  assert.deepEqual(filterQuizReviewRecords(records,{search:'cpu'}).map(item=>item.template.id),['hardware-001']);
});

test('generated preview can be regenerated without Convex and visual validation reports problems',()=>{
  const [record]=createQuizReviewRecords([],generated,materialize,()=>0.1);
  regenerateQuizRecord(record,materialize,()=>0.9);
  assert.equal(record.preview.question,'Netz 90');
  assert.deepEqual(validateQuizQuestion({
    id:'bad',category:'',topic:42,difficulty:'easy',question:'',answers:['A','B','C'],correctAnswer:8,
    media:{type:'image',src:''},
  }),[
    'category is required','topic must be text or null','difficulty must be medium or hard','question is required',
    'question must have exactly 4 answers','correctAnswer must be an integer from 0 to 3','image.src is required',
  ]);
});

test('quiz database marks every occurrence of a duplicate id',()=>{
  const duplicate={...staticQuestions[0]};
  const records=createQuizReviewRecords([staticQuestions[0],duplicate],[],materialize);
  assert.equal(records.length,2);
  assert.ok(records.every(record=>record.errors.includes('duplicate id: hardware-001')));
});
