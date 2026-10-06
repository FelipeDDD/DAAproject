import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'tools/quick-quiz-analysis/index.html'),'utf8');
const data=JSON.parse(html.match(/<script id="analysis-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];

function createViewer(){
  const elements=new Map();
  const element=(id)=>{
    if(!elements.has(id))elements.set(id,{id,value:id==='strategy'?'global':id==='cut'?'20':'shortest',
      children:[],handlers:{},options:[],append(...children){this.children.push(...children);},
      replaceChildren(...children){this.children=children;},addEventListener(type,handler){this.handlers[type]=handler;}});
    return elements.get(id);
  };
  element('analysis-data').textContent=JSON.stringify(data);
  const context=vm.createContext({document:{getElementById:element,createElement:tag=>({tag,children:[],append(...children){this.children.push(...children);}})}});
  vm.runInContext(script,context);
  return {element,context};
}

function shownIds(viewer){
  return viewer.element('examples').children.map(card=>card.children[0].textContent.split(' · ')[1]);
}
const compare=(a,b)=>a.metrics.displayLength-b.metrics.displayLength||a.metrics.questionLength-b.metrics.questionLength||a.id.localeCompare(b.id);

test('Shortest preserves the ranked head and Near cutoff follows the selected cut immediately',()=>{
  const viewer=createViewer();
  assert.deepEqual(shownIds(viewer),data.rankedQuestions.slice(0,12).map(question=>question.id));

  viewer.element('view').value='near-cutoff';viewer.element('view').handlers.change();
  let count=data.percentiles.find(row=>row.percentile===20).targetCount;
  assert.deepEqual(shownIds(viewer),data.rankedQuestions.slice(count-12,count).map(question=>question.id));

  viewer.element('cut').value='40';viewer.element('cut').handlers.change();
  count=data.percentiles.find(row=>row.percentile===40).targetCount;
  assert.deepEqual(shownIds(viewer),data.rankedQuestions.slice(count-12,count).map(question=>question.id));
  viewer.element('view').value='longest';viewer.element('view').handlers.change();
  assert.deepEqual(shownIds(viewer),data.rankedQuestions.slice(count-12,count).reverse().map(question=>question.id));
  assert.match(viewer.element('pool-summary').children[0].textContent,/Eligible: 317 /);
  assert.match(viewer.element('pool-summary').children[1].textContent,/Max question:/);
  assert.match(viewer.element('pool-summary').children[2].textContent,/Max display:/);
  assert.match(viewer.element('pool-summary').children[3].textContent,/Max answer:/);
});

test('Per-category Near cutoff samples each category boundary; Random sample is eligible and Shuffle rerolls it',()=>{
  const viewer=createViewer();
  viewer.element('strategy').value='per-category';viewer.element('strategy').handlers.change();
  viewer.element('view').value='near-cutoff';viewer.element('view').handlers.change();
  const groups=data.categoryNames.map(category=>{
    const questions=data.categoryQuestionSets[category];
    const count=Math.ceil(questions.length*20/100);
    return questions.slice(0,count);
  });
  const expected=[];
  for(let offset=1;expected.length<12;offset++){
    let found=false;
    for(const group of groups){if(offset<=group.length){expected.push(group[group.length-offset]);found=true;}if(expected.length===12)break;}
    if(!found)break;
  }
  expected.sort(compare);
  assert.deepEqual(shownIds(viewer),expected.map(question=>question.id));

  viewer.element('view').value='random-sample';viewer.element('view').handlers.change();
  assert.equal(viewer.element('shuffle').hidden,false);
  const eligible=new Set(data.categoryNames.flatMap(category=>{
    const questions=data.categoryQuestionSets[category];return questions.slice(0,Math.ceil(questions.length*20/100)).map(question=>question.id);
  }));
  const first=shownIds(viewer);
  assert.equal(first.length,20);
  assert.equal(new Set(first).size,20);
  assert.ok(first.every(id=>eligible.has(id)));
  vm.runInContext('Math.random = () => 0',viewer.context);
  viewer.element('shuffle').handlers.click();
  assert.notDeepEqual(shownIds(viewer),first);
  assert.equal(viewer.element('pool-summary').children[0].textContent,'Eligible: 160 / 792');
});
