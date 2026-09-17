import { renderQuizMedia } from '../src/QuizMedia.js';

export const DATABASE_REQUEST_TYPE='daa-terminal-database-request';
export const DATABASE_STATE_TYPE='daa-terminal-database-state';
const PAGE_SIZE=60;

const byId=id=>document.getElementById(id);

function replaceOptions(select,values,allLabel){
  const previous=select.value;
  const options=[{value:'',label:allLabel},...values.map(value=>({value,label:value}))];
  select.replaceChildren(...options.map(({value,label})=>{
    const option=document.createElement('option');option.value=value;option.textContent=label;return option;
  }));
  select.value=values.includes(previous)?previous:'';
}

function metadataRow(label,value){
  const wrapper=document.createElement('div');
  const term=document.createElement('dt');term.textContent=label;
  const detail=document.createElement('dd');detail.textContent=value||'—';
  wrapper.append(term,detail);return wrapper;
}

export class TerminalQuestionDatabasePage {
  constructor({embedded,onBack=()=>{},onViewChange=()=>{}}){
    this.embedded=embedded;this.onBack=onBack;this.onViewChange=onViewChange;this.view='list';this.options=null;
    this.filters={search:'',category:'',topic:'',difficulty:''};this.items=[];this.total=0;
    this.nextOffset=0;this.hasMore=false;this.requestId=0;this.latestListRequest=0;this.selectedKey=null;
    this.root=byId('question-database-page');this.browser=byId('database-browser');this.detail=byId('database-detail');
    this.search=byId('database-search');this.category=byId('database-category');this.topicField=byId('database-topic-field');
    this.topic=byId('database-topic');this.difficulty=byId('database-difficulty');this.clearButton=byId('database-clear-filters');
    this.listScroll=byId('database-list-scroll');this.list=byId('database-question-list');this.empty=byId('database-empty');
    this.loadMoreButton=byId('database-load-more');this.resultCount=byId('database-result-count');
    this.bankTotal=byId('database-bank-total');this.message=byId('database-page-message');
    this.escapeLabel=byId('database-escape-label');this.backButton=byId('database-back-button');
    this.detailBack=byId('database-detail-back');this.detailTags=byId('database-detail-tags');
    this.detailMetadata=byId('database-detail-metadata');this.detailQuestion=byId('database-detail-question');
    this.detailMedia=byId('database-detail-media');this.detailAnswers=byId('database-detail-answers');
    this.detailExplanation=byId('database-detail-explanation');this.detailWarnings=byId('database-detail-warnings');
    this.warningList=byId('database-warning-list');this.regenerateButton=byId('database-regenerate');

    this.backButton.addEventListener('click',()=>this.onBack?.());
    this.detailBack.addEventListener('click',()=>this.closeDetail());
    this.clearButton.addEventListener('click',()=>this.clearFilters());
    this.loadMoreButton.addEventListener('click',()=>this.requestList(false));
    this.category.addEventListener('change',()=>{
      this.filters.category=this.category.value;this.filters.topic='';this.updateTopicOptions();this.requestList(true);
    });
    this.topic.addEventListener('change',()=>{this.filters.topic=this.topic.value;this.requestList(true);});
    this.difficulty.addEventListener('change',()=>{this.filters.difficulty=this.difficulty.value;this.requestList(true);});
    this.search.addEventListener('input',()=>{
      this.filters.search=this.search.value;clearTimeout(this.searchTimer);
      this.searchTimer=setTimeout(()=>this.requestList(true),160);
    });
    this.regenerateButton.addEventListener('click',()=>this.request('regenerate',{key:this.selectedKey}));
    window.addEventListener('message',event=>this.receive(event));
  }

  request(action,payload={}){
    if(!this.embedded){this.message.textContent='Open this page from the classroom terminal to browse the real question bank.';return 0;}
    const requestId=++this.requestId;
    window.parent.postMessage({type:DATABASE_REQUEST_TYPE,action,payload,requestId},location.origin);
    return requestId;
  }

  open(){
    if(this.view==='detail')this.closeDetail();
    this.root.inert=false;this.root.setAttribute('aria-hidden','false');
    this.message.textContent='Loading real question bank…';this.requestList(true);
  }

  hide(){
    this.root.inert=true;this.root.setAttribute('aria-hidden','true');
  }

  requestList(reset){
    const offset=reset?0:this.nextOffset;
    if(reset)this.message.textContent='Loading questions…';
    this.latestListRequest=this.request('list',{filters:this.filters,offset,limit:PAGE_SIZE});
  }

  receive(event){
    if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!==DATABASE_STATE_TYPE)return;
    const {action,state,requestId}=event.data;
    if(action==='list'){
      if(requestId!==this.latestListRequest)return;
      this.options=state.options;this.filters={...this.filters,...state.filters};
      this.bankTotalValue=state.bankTotal;
      this.items=state.offset===0?state.items:[...this.items,...state.items];
      this.total=state.total;this.nextOffset=state.nextOffset;this.hasMore=state.hasMore;
      this.renderFilters();this.renderList();this.message.textContent='';return;
    }
    if((action==='detail'||action==='regenerate')&&state.detail){
      this.selectedKey=state.detail.key;this.renderDetail(state.detail);this.showDetail();
    }else if(state.error)this.message.textContent=state.error;
  }

  renderFilters(){
    replaceOptions(this.category,this.options?.categories??[],'All Categories');
    this.category.value=this.filters.category;
    replaceOptions(this.difficulty,this.options?.difficulties??[],'All');
    this.difficulty.value=this.filters.difficulty;
    this.updateTopicOptions();this.search.value=this.filters.search;
  }

  updateTopicOptions(){
    const topics=this.filters.category
      ?this.options?.topicsByCategory?.find(group=>group.category===this.filters.category)?.topics??[]:[];
    replaceOptions(this.topic,topics,'All Topics');
    this.topic.value=topics.includes(this.filters.topic)?this.filters.topic:'';
    this.filters.topic=this.topic.value;this.topic.disabled=!this.filters.category||topics.length===0;
    this.topicField.classList.toggle('is-disabled',this.topic.disabled);
  }

  renderList(){
    this.resultCount.textContent=`${this.total} question${this.total===1?'':'s'}`;
    this.bankTotal.textContent=this.options?`${this.bankTotalValue} TOTAL · REAL QUESTION BANK`:'';
    this.list.replaceChildren(...this.items.map(item=>{
      const row=document.createElement('li'),button=document.createElement('button');button.type='button';
      button.dataset.questionKey=item.key;
      const id=document.createElement('strong');id.textContent=item.id;
      const meta=document.createElement('small');meta.textContent=[item.category,item.topic,item.difficulty]
        .filter(Boolean).join(' · ').toLocaleUpperCase('de');
      const question=document.createElement('span');question.textContent=item.question;
      const arrow=document.createElement('i');arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
      if(item.generated){const generated=document.createElement('em');generated.textContent='Generated';id.append(' ',generated);}
      button.append(id,meta,question,arrow);button.addEventListener('click',()=>this.openDetail(item.key));row.append(button);return row;
    }));
    this.empty.hidden=this.total!==0;this.loadMoreButton.hidden=!this.hasMore;
  }

  openDetail(key){
    this.savedScroll=this.listScroll.scrollTop;this.selectedKey=key;this.message.textContent='Loading question…';
    this.request('detail',{key});
  }

  renderDetail(detail){
    this.detailTags.replaceChildren(...[detail.category,detail.topic,detail.difficulty,detail.generated?'Generated':null]
      .filter(Boolean).map(value=>{const tag=document.createElement('span');tag.textContent=value;return tag;}));
    this.detailMetadata.replaceChildren(
      metadataRow('ID',detail.id),metadataRow('Category',detail.category),metadataRow('Topic',detail.topic),
      metadataRow('Difficulty',detail.difficulty),metadataRow('Source',detail.source),
    );
    this.detailQuestion.textContent=detail.question;renderQuizMedia(this.detailMedia,detail.media);
    this.detailAnswers.replaceChildren(...detail.answers.map((answer,index)=>{
      const item=document.createElement('li');const marker=document.createElement('span');marker.textContent=String.fromCharCode(65+index);
      const text=document.createElement('strong');text.textContent=answer;item.append(marker,text);
      if(index===detail.correctAnswer){item.classList.add('is-correct');const badge=document.createElement('em');badge.textContent='Correct';item.append(badge);}
      return item;
    }));
    this.detailExplanation.textContent=detail.explanation||'No explanation provided.';
    this.detailWarnings.hidden=!detail.errors.length;
    this.warningList.replaceChildren(...detail.errors.map(error=>{const item=document.createElement('li');item.textContent=error;return item;}));
    this.regenerateButton.hidden=!detail.generated;this.message.textContent='';
  }

  showDetail(){
    this.view='detail';this.browser.hidden=true;this.detail.hidden=false;this.escapeLabel.textContent='Back to results';
    this.onViewChange(this.view);this.detailBack.focus({preventScroll:true});
  }

  closeDetail(){
    if(this.view!=='detail')return false;
    this.view='list';this.detail.hidden=true;this.browser.hidden=false;this.escapeLabel.textContent='Back to Terminal';
    this.onViewChange(this.view);requestAnimationFrame(()=>{this.listScroll.scrollTop=this.savedScroll??0;});return true;
  }

  clearFilters(){
    clearTimeout(this.searchTimer);this.filters={search:'',category:'',topic:'',difficulty:''};
    this.search.value='';this.renderFilters();this.requestList(true);
  }

  escape(){return this.closeDetail();}
}
