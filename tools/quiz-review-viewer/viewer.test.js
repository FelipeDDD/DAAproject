import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('./app.js',import.meta.url),'utf8').split('$("file-input").addEventListener')[0];
const question=(id,text)=>({id,category:'Netzwerk',difficulty:'medium',question:text,
  answer1:'A',answer2:'B',answer3:'C',answer4:'D',correctAnswer:0});
const state={source_sha256:'source-netzwerk',dataset_sha256:'dataset-netzwerk',questions:[
  {id:'036',status:'REWRITE',original:question('036','Current 036'),proposed_question:question('036','Proposal 036')},
  {id:'176',status:'REWRITE',original:question('176','Current 176'),proposed_question:question('176','Proposal 176')},
  {id:'196',status:'REWRITE',original:question('196','Current 196'),proposed_question:question('196','Proposal 196')},
]};
const validation={source_sha256:'validation-netzwerk',validations:[
  {id:'036',verdict:'KEEP_AND_ADD',addition_candidate:{...question('new-036','Additional 036'),candidate_key:'036-extra'}},
  {id:'176',verdict:'REVISE_AND_ADD',original_revision:question('176','Revised 176'),
    addition_candidate:{...question('new-176','Additional 176'),candidate_key:'176-extra'}},
  {id:'196',verdict:'REVISE_ORIGINAL',original_revision:question('196','Revised 196')},
]};

function viewer(storage=new Map()){
  const elements=new Map();
  const domNode=tag=>({tag,children:[],className:'',textContent:'',append(...nodes){this.children.push(...nodes);},
    prepend(...nodes){this.children.unshift(...nodes);},setAttribute(){},addEventListener(type,handler){this[type]=handler;},
    querySelector(selector){return this.children.find(child=>child.className?.split(' ').includes(selector.slice(1)))||null;}});
  const element=id=>{
    if(!elements.has(id))elements.set(id,{value:'',checked:false,hidden:false,textContent:'',options:[],
      focus(){this.focused=true;},replaceChildren(){},classList:{toggle(){}},addEventListener(){}});
    return elements.get(id);
  };
  const context={document:{getElementById:element,createElement:domNode},localStorage:{
    getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),
  },console,structuredClone,Date};
  vm.runInNewContext(source+`
    renderSummary=()=>{};renderIds=()=>{};renderSelected=()=>{};updateProgress=()=>{};
    globalThis.api={app,recordsFrom,versions,cardActions,personal,loadPersonal,resetFilters,applyFilters,decide,
      decisionsPayload,importDecisions,saveView,restoreView,viewStorageKey,completed};
  `,context);
  const api=context.api;
  api.app.state=state;api.app.validation=validation;api.app.records=api.recordsFrom(state,validation);
  api.loadPersonal();api.app.viewKey=api.viewStorageKey();
  return {api,element,storage};
}

test('clicking a version card action saves immediately and marks only that version',()=>{
  const {api,element,storage}=viewer();api.app.selected='existing:176';
  element('auto-advance').checked=false;api.applyFilters();
  const record=api.app.records.find(r=>r.key==='existing:176');
  const action=api.cardActions(record,api.versions(record)[1]);
  assert.equal(action.children[0].textContent,'Usar esta versão');
  action.children[0].click();
  assert.equal(api.personal(record.key).decision,'ACCEPT_RECOMMENDATION');
  assert.ok(storage.has(api.app.storageKey));
  assert.equal(api.cardActions(record,api.versions(record)[1]).querySelector('.selected-seal').textContent,'Selecionada');
  assert.equal(api.cardActions(record,api.versions(record)[0]).querySelector('.selected-seal'),null);
});

test('036 and 176 retain independent existing/addition decisions; 196 has no addition',()=>{
  const {api,element}=viewer();
  assert.deepEqual(Array.from(api.app.records,r=>r.key),[
    'existing:036','new:036-extra','existing:176','new:176-extra','existing:196']);
  assert.deepEqual(Array.from(api.versions(api.app.records[0]),v=>v.key),['original','proposal']);
  assert.deepEqual(Array.from(api.versions(api.app.records[2]),v=>v.key),['original','revised']);
  assert.deepEqual(Array.from(api.versions(api.app.records[4]),v=>v.key),['original','revised']);
  element('auto-advance').checked=false;api.applyFilters();
  api.app.selected='existing:036';api.decide('KEEP_CURRENT');
  assert.equal(api.personal('new:036-extra').decision,null);
  api.app.selected='new:036-extra';api.decide('APPROVE_NEW');
  api.app.selected='existing:176';api.decide('ACCEPT_RECOMMENDATION');
  api.app.selected='new:176-extra';api.decide('REJECT_NEW');
  api.app.selected='existing:196';api.decide('ACCEPT_RECOMMENDATION');
  const rows=api.decisionsPayload().decisions;
  assert.deepEqual(Array.from(rows,r=>r.decision),[
    'KEEP_CURRENT','APPROVE_NEW','ACCEPT_RECOMMENDATION','REJECT_NEW','ACCEPT_RECOMMENDATION']);
  assert.equal(rows[1].addition_decision,'APPROVE_NEW');
  assert.equal(rows[3].addition_decision,'REJECT_NEW');
});

test('original, proposal and addition can all be selected without changing the export shape',async()=>{
  const first=viewer();first.element('auto-advance').checked=true;
  first.element('filter-personal').value='unchecked';first.api.app.selected='existing:036';first.api.applyFilters();
  const original=first.api.app.records[0],proposal=first.api.versions(original)[1];
  const action=first.api.cardActions(original,proposal);
  const addButton=action.children.find(button=>button.textContent==='Manter a original e adicionar esta');
  assert.ok(addButton);addButton.click();
  assert.equal(first.api.app.selected,'new:036-extra');
  assert.equal(first.api.personal('existing:036').decision,'KEEP_CURRENT');
  assert.equal(first.api.personal('existing:036').alsoAddVersion,'proposal');
  assert.ok(first.api.cardActions(original,first.api.versions(original)[0]).querySelector('.selected-seal'));
  assert.ok(first.api.cardActions(original,proposal).querySelector('.selected-seal'));
  first.api.decide('APPROVE_NEW');
  const payload=JSON.parse(JSON.stringify(first.api.decisionsPayload()));
  assert.equal(payload.schema_version,2);
  assert.equal(payload.decisions[0].also_add_version,'proposal');
  assert.equal(payload.decisions[1].addition_decision,'APPROVE_NEW');
  const second=viewer();await second.api.importDecisions({text:async()=>JSON.stringify(payload)});
  assert.equal(second.api.personal('existing:036').alsoAddVersion,'proposal');
  assert.equal(second.api.personal('new:036-extra').decision,'APPROVE_NEW');
});

test('176 can keep original, add revision and add candidate, then change back to original only',()=>{
  const {api,element}=viewer();element('auto-advance').checked=false;api.applyFilters();
  api.app.selected='existing:176';api.decide('KEEP_CURRENT',{addVersion:'revised'});
  api.app.selected='new:176-extra';api.decide('APPROVE_NEW');
  assert.equal(api.personal('existing:176').alsoAddVersion,'revised');
  assert.equal(api.personal('new:176-extra').decision,'APPROVE_NEW');
  api.app.selected='existing:176';api.decide('KEEP_CURRENT');
  assert.equal(api.personal('existing:176').alsoAddVersion,null);
  assert.equal(api.personal('new:176-extra').decision,'APPROVE_NEW');
  assert.equal(api.decisionsPayload().decisions.find(row=>row.id==='176').also_add_version,undefined);
});

test('pending queue advances from existing question to addition and never past an undecided addition',()=>{
  const {api,element}=viewer();api.app.selected='existing:036';
  element('filter-personal').value='unchecked';element('auto-advance').checked=true;api.applyFilters();
  api.decide('KEEP_CURRENT');
  assert.equal(api.app.selected,'new:036-extra');
  api.decide('UNSURE');
  assert.equal(api.app.selected,'new:036-extra');
  assert.equal(api.completed('new:036-extra'),false);
  api.decide('APPROVE_NEW');
  assert.equal(api.app.selected,'existing:176');
  assert.equal(api.app.filtered.some(r=>r.key==='new:036-extra'),false);
});

test('requesting an adjustment waits for a note and typing alone never advances',()=>{
  const {api,element}=viewer();api.app.selected='existing:196';
  element('auto-advance').checked=true;api.applyFilters();
  api.decide('NEEDS_ADJUSTMENT');
  assert.equal(api.personal('existing:196').decision,null);
  assert.equal(element('personal-note').focused,true);
  api.app.personal['existing:196']={note:'Correct the explanation'};
  assert.equal(api.app.selected,'existing:196');
  api.decide('NEEDS_ADJUSTMENT');
  assert.equal(api.personal('existing:196').decision,'NEEDS_ADJUSTMENT');
});

test('legacy decisions remain, view position and filters survive reload with same reports',()=>{
  const storage=new Map(),first=viewer(storage);
  storage.set(first.api.app.storageKey,JSON.stringify({'036':{state:'agree',note:'old note'}}));
  first.api.loadPersonal();
  assert.equal(first.api.personal('existing:036').decision,'ACCEPT_RECOMMENDATION');
  assert.equal(first.api.personal('existing:036').note,'old note');
  first.element('filter-personal').value='reviewed';first.element('filter-search').value='176';
  first.element('filter-addition').checked=true;first.api.app.selected='new:176-extra';
  first.api.saveView();
  const second=viewer(storage);
  second.element('filter-personal').options=[{value:''},{value:'unchecked'},{value:'reviewed'}];
  second.api.restoreView();
  assert.equal(second.api.app.selected,'new:176-extra');
  assert.equal(second.element('filter-personal').value,'reviewed');
  assert.equal(second.element('filter-search').value,'176');
  assert.equal(second.element('filter-addition').checked,true);
  assert.equal(second.api.personal('existing:036').decision,'ACCEPT_RECOMMENDATION');
});

test('exported decisions import without overwriting locally saved choices',async()=>{
  const first=viewer();first.api.app.selected='existing:036';first.element('auto-advance').checked=false;
  first.api.applyFilters();first.api.decide('KEEP_CURRENT');
  first.api.app.selected='new:036-extra';first.api.decide('APPROVE_NEW');
  const payload=JSON.parse(JSON.stringify(first.api.decisionsPayload()));
  assert.equal(payload.schema_version,2);
  const second=viewer();second.api.app.personal['existing:036']={decision:'ACCEPT_RECOMMENDATION',note:'keep local'};
  await second.api.importDecisions({text:async()=>JSON.stringify(payload)});
  assert.equal(second.api.personal('existing:036').decision,'ACCEPT_RECOMMENDATION');
  assert.equal(second.api.personal('new:036-extra').decision,'APPROVE_NEW');
  assert.equal(second.api.decisionsPayload().decisions.length,2);
});
