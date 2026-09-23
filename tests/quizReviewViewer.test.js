import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const path=new URL('../tools/quiz-review-viewer/app.js',import.meta.url);
const fullSource=readFileSync(path,'utf8');
const source=fullSource.split('$("file-input").addEventListener')[0]+
  fullSource.split('function handleReviewShortcut')[1].split('document.addEventListener("keydown",handleReviewShortcut)')[0]
    .replace(/^/,'function handleReviewShortcut');

function viewer(){
  const elements=new Map(),storage=new Map();
  const element=id=>{
    if(!elements.has(id))elements.set(id,{value:'',checked:false,hidden:false,textContent:''});
    return elements.get(id);
  };
  const context={document:{getElementById:element},localStorage:{
    getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),
  },console,structuredClone};
  vm.runInNewContext(source+`
    renderSummary=()=>{};renderIds=()=>{};renderSelected=()=>{};updateProgress=()=>{};
    globalThis.testApi={app,validate,recordsFrom,applyFilters,resetFilters,decide,undoDecision,move,decisionsPayload,personal,handleReviewShortcut,shortcutLabels};
  `,context);
  return {api:context.testApi,element};
}

const question=(id,question)=>({id,category:'Netzwerk',difficulty:'medium',question,answer1:'a',answer2:'b',answer3:'c',answer4:'d',correctAnswer:0});

test('existing changes, addition candidates and questions without originals get separate stable review items',()=>{
  const {api}=viewer();
  const state={source_sha256:'source-hash',dataset_sha256:'dataset-hash',questions:[
    {id:'q1',status:'REWRITE',original:question('q1','Before'),proposed_question:question('q1','After')},
    {candidate_key:'standalone-1',status:'NEW_QUESTION',new_question:question(null,'New')},
  ]};
  const validation={validations:[{id:'q1',verdict:'REVISE_AND_ADD',addition_candidate:{...question(null,'Additional'),candidate_key:'extra-1'}}]};
  api.validate(state,validation);
  const rows=api.recordsFrom(state,validation);
  assert.deepEqual(Array.from(rows,r=>r.key),['existing:q1','new:extra-1','new:standalone-1']);
  assert.equal(rows[1].sourceId,'q1');assert.equal(rows[2].original,null);
});

test('auto advance respects unreviewed filter, previous can revisit a decided item, and undo restores it',()=>{
  const {api,element}=viewer();
  const state={source_sha256:'hash',questions:[1,2,3].map(n=>({id:'q'+n,status:'PASS',original:question('q'+n,'Question '+n)}))};
  api.app.state=state;api.app.records=api.recordsFrom(state,null);api.app.selected='existing:q1';api.app.storageKey='review-test';
  element('filter-personal').value='unchecked';element('auto-advance').checked=true;
  api.applyFilters();api.decide('ACCEPT_RECOMMENDATION');
  assert.equal(api.app.selected,'existing:q2');assert.deepEqual(Array.from(api.app.filtered,r=>r.key),['existing:q2','existing:q3']);
  api.move(-1);assert.equal(api.app.selected,'existing:q1');
  api.decide('KEEP_CURRENT');assert.equal(api.personal('existing:q1').decision,'KEEP_CURRENT');
  api.undoDecision();assert.equal(api.app.selected,'existing:q1');assert.equal(api.personal('existing:q1').decision,'ACCEPT_RECOMMENDATION');
});

test('notes do not decide or advance, and exported decisions contain ownership and SHA metadata',()=>{
  const {api,element}=viewer();
  const state={dataset_sha256:'dataset-hash',source_sha256:'source-hash',questions:[
    {id:'q1',status:'PASS',original:question('q1','Existing')},
    {candidate_key:'candidate-1',source_id:'q1',new_question:question(null,'New')},
  ]};
  api.app.state=state;api.app.records=api.recordsFrom(state,null);api.app.selected='new:candidate-1';api.app.storageKey='review-test';
  element('auto-advance').checked=true;
  api.app.personal['new:candidate-1']={note:'Check terminology'};
  assert.equal(api.app.selected,'new:candidate-1');assert.equal(api.personal('new:candidate-1').decision,null);
  api.applyFilters();api.decide('APPROVE_NEW');
  const payload=api.decisionsPayload();
  assert.equal(payload.schema_version,2);assert.equal(payload.decisions.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(payload.decisions[0])),{
    item_type:'new_question',candidate_key:'candidate-1',source_id:'q1',decision:'APPROVE_NEW',
    addition_decision:'APPROVE_NEW',notes:'Check terminology',reviewed_at:payload.decisions[0].reviewed_at,
    dataset_sha256:'dataset-hash',source_sha256:'source-hash',
  });
  assert.ok(Number.isFinite(Date.parse(payload.decisions[0].reviewed_at)));
});

test('direct new questions and validation-only candidates need no original',()=>{
  const {api}=viewer();
  const state={questions:[{item_type:'new_question',candidate_key:'direct-1',...question(null,'Direct')}]};
  const validation={validations:[{item_type:'new_question',candidate_key:'validation-1',category:'Netzwerk',...question(null,'Validated')}]};
  api.validate(state,validation);
  assert.deepEqual(Array.from(api.recordsFrom(state,validation),r=>r.key),['new:direct-1','new:validation-1']);
});

test('number and arrow shortcuts work outside text fields and ignore typing',()=>{
  const {api,element}=viewer();
  const state={questions:[1,2].map(n=>({id:'q'+n,status:'PASS',original:question('q'+n,'Question '+n)}))};
  api.app.state=state;api.app.records=api.recordsFrom(state,null);api.app.selected='existing:q1';api.app.storageKey='shortcuts';
  element('auto-advance').checked=false;api.applyFilters();
  const event=(key,typing=false)=>({key,repeat:false,target:{closest:()=>typing?{}:null},preventDefault(){this.prevented=true;}});
  api.handleReviewShortcut(event('1',true));assert.equal(api.personal('existing:q1').decision,null);
  const key=event('1');api.handleReviewShortcut(key);assert.equal(key.prevented,true);
  assert.equal(api.personal('existing:q1').decision,'ACCEPT_RECOMMENDATION');
  api.handleReviewShortcut(event('ArrowRight'));assert.equal(api.app.selected,'existing:q2');
  api.handleReviewShortcut(event('ArrowLeft'));assert.equal(api.app.selected,'existing:q1');
});

test('opening a report defaults to pending decisions while clearing filters shows all',()=>{
  const {api,element}=viewer();
  const state={questions:[1,2].map(n=>({id:'q'+n,status:'PASS',original:question('q'+n,'Question '+n)}))};
  api.app.state=state;api.app.records=api.recordsFrom(state,null);api.app.selected='existing:q1';
  api.app.personal['existing:q1']={decision:'KEEP_CURRENT'};
  api.resetFilters({pendingByDefault:true});api.applyFilters();
  assert.equal(element('filter-personal').value,'unchecked');
  assert.deepEqual(Array.from(api.app.filtered,r=>r.key),['existing:q2']);
  assert.equal(api.app.selected,'existing:q2');
  api.resetFilters();api.applyFilters();
  assert.equal(element('filter-personal').value,'');assert.equal(api.app.filtered.length,2);
});

test('shortcut two describes the selected item clearly',()=>{
  const {api}=viewer();
  assert.deepEqual(Array.from(api.shortcutLabels({itemType:'existing_change'})[1]),['2','Manter questão original']);
  assert.deepEqual(Array.from(api.shortcutLabels({itemType:'new_question'})[1]),['2','Rejeitar inclusão da nova questão']);
});
