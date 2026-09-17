import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TerminalQuestionDatabaseBridge,TERMINAL_DATABASE_MESSAGES,
} from '../src/terminal/TerminalQuestionDatabaseBridge.js';

function record(id,{category='Hardware',topic=null,difficulty='medium',question=id,correctAnswer=0,media=null}={}){
  const preview={id,category,topic,difficulty,question,answers:['A','B','C','D'],correctAnswer,explanation:`Explain ${id}`};
  if(media)preview.media=media;
  return {key:`static:${id}:0`,template:preview,preview,generated:false,source:`${category.toLowerCase()}.csv`,errors:[]};
}

function harness(records){
  const messages=[];const contentWindow={postMessage(message,origin){messages.push({message,origin});}};
  const frame={contentWindow};const bridge=new TerminalQuestionDatabaseBridge({frame,origin:'http://local.test',records});
  const event=(action,payload={},requestId=1)=>({
    origin:'http://local.test',source:contentWindow,
    data:{type:TERMINAL_DATABASE_MESSAGES.request,action,payload,requestId},
  });
  return {bridge,messages,event};
}

test('terminal Question Database bridge filters and paginates real record shapes',()=>{
  const records=[
    record('hardware-001',{topic:'CPU',question:'Welche CPU?'}),
    record('network-001',{category:'Netzwerk',topic:'DNS',difficulty:'hard',question:'Welche Aufgabe hat DNS?'}),
    record('network-002',{category:'Netzwerk',topic:'IPv4',question:'IPv4 Frage'}),
  ];
  const h=harness(records);
  assert.equal(h.bridge.handle(h.event('list',{
    filters:{category:'Netzwerk',topic:'DNS',difficulty:'hard',search:'dns'},offset:0,limit:1,
  },7)),true);
  const response=h.messages[0].message;
  assert.equal(response.requestId,7);assert.equal(response.state.bankTotal,3);assert.equal(response.state.total,1);
  assert.equal(response.state.items[0].id,'network-001');assert.equal(response.state.hasMore,false);
  assert.deepEqual(response.state.options.categories,['Hardware','Netzwerk']);
});

test('terminal Question Database detail preserves correctAnswer, optional topic and media',()=>{
  const media={type:'code',content:'const value = 1;'};
  const h=harness([record('hardware-001',{topic:null,correctAnswer:2,media})]);
  h.bridge.handle(h.event('detail',{key:'static:hardware-001:0'}));
  const detail=h.messages[0].message.state.detail;
  assert.equal(detail.topic,null);assert.equal(detail.correctAnswer,2);assert.deepEqual(detail.media,media);
  assert.equal(detail.answers.length,4);assert.equal(detail.explanation,'Explain hardware-001');
});

test('terminal Question Database bridge exposes the current complete bank without mocks',()=>{
  const h=harness();h.bridge.handle(h.event('list',{filters:{},offset:0,limit:1}));
  const state=h.messages[0].message.state;
  assert.ok(state.bankTotal>=700);assert.equal(state.items.length,1);
  assert.ok(state.options.categories.includes('Hardware'));
  assert.ok(state.options.categories.includes('Netzwerk'));
});
