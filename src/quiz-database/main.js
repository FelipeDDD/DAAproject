import STATIC_QUIZ_QUESTIONS from '../../convex/quizStaticQuestions.generated.js';
import { GENERATED_QUIZ_QUESTIONS } from '../../convex/quizGeneratedQuestions.js';
import { materializeQuizQuestion } from '../../convex/quizQuestions.js';
import { renderQuizMedia } from '../QuizMedia.js';
import {
  createQuizReviewRecords,filterQuizReviewRecords,regenerateQuizRecord,summarizeQuizReviewRecords,
} from './model.js';
import './style.css';

const records=createQuizReviewRecords(
  STATIC_QUIZ_QUESTIONS,GENERATED_QUIZ_QUESTIONS,materializeQuizQuestion,
);
const elements=Object.fromEntries([
  'summary','category-filter','difficulty-filter','search-filter','sort-filter','random-question',
  'question-list','question-list-title','visible-count','question-detail',
].map(id=>[id,document.getElementById(id)]));
let selectedKey=records[0]?.key??null;

function addOption(select,value){
  const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);
}

function initializeFilters(){
  const categories=[...new Set(records.map(record=>record.template.category))].filter(Boolean).sort((a,b)=>a.localeCompare(b,'de'));
  const difficulties=[...new Set(records.map(record=>record.template.difficulty))].filter(Boolean).sort();
  categories.forEach(value=>addOption(elements['category-filter'],value));
  difficulties.forEach(value=>addOption(elements['difficulty-filter'],value));
}

function summaryCard(label,value,tone=''){
  const card=document.createElement('div');card.className=`summary-card ${tone}`.trim();
  const amount=document.createElement('strong');amount.textContent=String(value);
  const name=document.createElement('span');name.textContent=label;card.append(amount,name);return card;
}

function renderSummary(){
  const data=summarizeQuizReviewRecords(records);
  const cards=[summaryCard('Total',data.total),summaryCard('Generated',data.generated),
    summaryCard('With warnings',data.invalid,data.invalid?'warning':'valid')];
  for(const [category,count] of Object.entries(data.categories).sort(([a],[b])=>a.localeCompare(b,'de')))
    cards.push(summaryCard(category,count));
  for(const [difficulty,count] of Object.entries(data.difficulties).sort())
    cards.push(summaryCard(difficulty,count));
  elements.summary.replaceChildren(...cards);
}

function filters(){return {
  category:elements['category-filter'].value,difficulty:elements['difficulty-filter'].value,
  search:elements['search-filter'].value,sort:elements['sort-filter'].value,
};}

function visibleRecords(){return filterQuizReviewRecords(records,filters());}

function badge(text,className=''){
  const span=document.createElement('span');span.className=`badge ${className}`.trim();span.textContent=text;return span;
}

function renderList(){
  const visible=visibleRecords();elements['visible-count'].textContent=`${visible.length} / ${records.length}`;
  if(!visible.some(record=>record.key===selectedKey))selectedKey=visible[0]?.key??null;
  elements['question-list'].replaceChildren(...visible.map(record=>{
    const item=document.createElement('li'),button=document.createElement('button');
    button.type='button';button.className=record.key===selectedKey?'selected':'';
    const top=document.createElement('span');top.className='question-row-meta';
    top.append(document.createTextNode(record.template.id));
    if(record.generated)top.append(badge('Generated','generated'));
    if(record.errors.length)top.append(badge(`${record.errors.length} warning${record.errors.length===1?'':'s'}`,'warning'));
    const text=document.createElement('span');text.className='question-row-text';
    text.textContent=record.preview.question??'Question preview unavailable';
    const meta=document.createElement('small');meta.textContent=`${record.template.category||'No category'} · ${record.template.difficulty||'No difficulty'} · ${record.source}`;
    button.append(top,text,meta);button.addEventListener('click',()=>{selectedKey=record.key;render();});item.append(button);return item;
  }));
}

function field(label,value){
  const row=document.createElement('div');row.className='detail-field';
  const name=document.createElement('dt');name.textContent=label;
  const content=document.createElement('dd');content.textContent=value||'—';row.append(name,content);return row;
}

function renderDetail(){
  const record=records.find(item=>item.key===selectedKey);
  if(!record){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='No matching questions.';elements['question-detail'].replaceChildren(empty);return;}
  const question=record.preview;
  const title=document.createElement('div');title.className='detail-title';
  const heading=document.createElement('h2');heading.textContent=question.question??record.template.id;
  const badges=document.createElement('div');badges.className='detail-badges';
  badges.append(badge(record.template.category||'Missing category'),badge(record.template.difficulty||'Missing difficulty'));
  if(record.generated)badges.append(badge('Dynamic template','generated'));
  title.append(heading,badges);

  const metadata=document.createElement('dl');metadata.className='detail-metadata';
  metadata.append(field('ID',question.id??record.template.id),field('Source',record.source));

  const actions=document.createElement('div');actions.className='detail-actions';
  if(record.generated){
    const regenerate=document.createElement('button');regenerate.type='button';regenerate.textContent='Generate again';
    regenerate.addEventListener('click',()=>{regenerateQuizRecord(record,materializeQuizQuestion);render();});actions.append(regenerate);
  }

  const warnings=document.createElement('section');warnings.className='validation';warnings.hidden=!record.errors.length;
  if(record.errors.length){
    const warningTitle=document.createElement('h3');warningTitle.textContent='Validation warnings';
    const list=document.createElement('ul');list.append(...record.errors.map(message=>{const li=document.createElement('li');li.textContent=message;return li;}));
    warnings.append(warningTitle,list);
  }

  const mediaWrap=document.createElement('section');mediaWrap.className='preview-media-wrap';
  const media=document.createElement('div');media.className='quiz-media';media.hidden=true;mediaWrap.append(media);
  renderQuizMedia(media,question.media);

  const answersTitle=document.createElement('h3');answersTitle.textContent='Answers';
  const answers=document.createElement('ol');answers.className='answer-list';
  for(const [index,answer] of (question.answers??[]).entries()){
    const item=document.createElement('li');item.textContent=answer;
    if(index===question.correctAnswer){item.className='correct';item.append(badge('Correct','correct'));}
    answers.append(item);
  }
  const explanation=document.createElement('section');explanation.className='explanation';
  const explanationTitle=document.createElement('h3');explanationTitle.textContent='Explanation';
  const explanationText=document.createElement('p');explanationText.textContent=question.explanation||'No explanation provided.';
  explanation.append(explanationTitle,explanationText);
  elements['question-detail'].replaceChildren(title,metadata,actions,warnings,mediaWrap,answersTitle,answers,explanation);
}

function render(){renderSummary();renderList();renderDetail();}

for(const id of ['category-filter','difficulty-filter','sort-filter'])elements[id].addEventListener('change',render);
elements['search-filter'].addEventListener('input',render);
elements['random-question'].addEventListener('click',()=>{
  const visible=visibleRecords();if(!visible.length)return;
  selectedKey=visible[Math.floor(Math.random()*visible.length)].key;render();
  elements.summary.scrollIntoView({behavior:'smooth',block:'start'});
});

initializeFilters();render();
