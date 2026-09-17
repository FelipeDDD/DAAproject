import { characterById } from '../src/characters.js';
const REQUEST_TYPE='daa-terminal-leaderboard-request';
const STATE_TYPE='daa-terminal-leaderboard-state';
const byId=id=>document.getElementById(id);

function metric(label,value,suffix=''){
  const item=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');
  item.dataset.metric=label.toLowerCase().replaceAll(' ','-');
  term.textContent=label;detail.textContent=value===null||value===undefined?'—':`${value}${suffix}`;
  item.append(term,detail);return item;
}
function formatDate(timestamp){return Number.isFinite(timestamp)
  ?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(timestamp)):'—';}
function formatDuration(durationMs){
  if(!Number.isFinite(durationMs))return '—';const minutes=durationMs/60_000;
  return Number.isInteger(minutes)?`${minutes} min`:`${Math.round(durationMs/1000)} sec`;
}

export class TerminalLeaderboardPage {
  constructor({embedded,onBack=()=>{},onViewChange=()=>{}}){
    this.embedded=embedded;this.onBack=onBack;this.onViewChange=onViewChange;this.view='list';this.requestId=0;
    this.root=byId('leaderboards-page');this.topView=byId('leaderboard-top-view');this.listView=byId('leaderboard-list-view');
    this.detail=byId('leaderboard-detail');this.topCards=byId('leaderboard-top-cards');this.topEmpty=byId('leaderboard-top-empty');
    this.list=byId('leaderboard-list');this.empty=byId('leaderboard-empty');this.message=byId('leaderboard-message');
    this.mode=byId('leaderboard-mode');this.variant=byId('leaderboard-variant');this.rules=byId('leaderboard-rules');
    this.escapeLabel=byId('leaderboard-escape-label');this.backButton=byId('leaderboard-back-button');
    this.detailBack=byId('leaderboard-detail-back');this.detailName=byId('leaderboard-detail-name');
    this.detailRank=byId('leaderboard-detail-rank');this.detailScore=byId('leaderboard-detail-score');
    this.detailMetrics=byId('leaderboard-detail-metrics');this.detailMeta=byId('leaderboard-detail-meta');
    this.viewListButton=byId('leaderboard-view-list');this.viewTopButton=byId('leaderboard-view-top');
    this.backButton.addEventListener('click',()=>this.onBack());this.detailBack.addEventListener('click',()=>this.closeDetail());
    this.detailClose=byId('leaderboard-detail-close');
    this.detailClose.addEventListener('click',()=>this.closeDetail());
    this.viewListButton.addEventListener('click',()=>this.showList());this.viewTopButton.addEventListener('click',()=>this.showTop());
    window.addEventListener('message',event=>this.receive(event));
    this.detail.addEventListener('keydown',event=>{
      if(this.isFuturistic()&&event.key==='Tab'){
        event.preventDefault();
        (document.activeElement===this.detailBack?this.detailClose:this.detailBack).focus({preventScroll:true});
      }
    });
  }
  request(){
    if(!this.embedded){this.message.textContent='Open this page from the classroom terminal to view real records.';return;}
    const requestId=++this.requestId;window.parent.postMessage({type:REQUEST_TYPE,requestId},location.origin);
  }
  open(){
    this.root.inert=false;this.root.setAttribute('aria-hidden','false');
    this.setView(this.isFuturistic()?'top':'list',{focus:false});
    this.message.textContent='Loading current records…';this.request();
  }
  hide(){this.root.inert=true;this.root.setAttribute('aria-hidden','true');}
  receive(event){
    if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!==STATE_TYPE)return;
    if(event.data.requestId!==this.requestId)return;const state=event.data.state;
    if(state.error){
      this.message.textContent=state.error;this.list.replaceChildren();this.topCards.replaceChildren();
      this.empty.hidden=false;this.topEmpty.hidden=false;return;
    }
    this.state=state;this.renderList();this.renderTopCards();this.message.textContent='';
  }
  isFuturistic(){return document.documentElement.dataset.theme==='futuristic';}
  portrait(record){
    const portrait=document.createElement('span');portrait.className='leaderboard-portrait';portrait.setAttribute('aria-hidden','true');
    const rank=Number(record.rank);portrait.classList.add(rank===1?'portrait-rank-1':rank===2?'portrait-rank-2':rank===3?'portrait-rank-3':'portrait-rank-other');
    const character=characterById(record.characterId);
    if(character){
      const image=document.createElement('img');image.alt='';image.src=new URL('../'+character.asset,document.baseURI).href;
      portrait.append(image);
    }else portrait.textContent=record.name.slice(0,2).toUpperCase();
    return portrait;
  }
  compactStats(record){
    const stats=document.createElement('div');stats.className='leaderboard-compact-stats';
    for(const [label,value] of [['Correct',record.correct],['Accuracy',`${record.accuracy}%`],['Skipped',record.skipped]]){
      const item=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
      strong.textContent=value;small.textContent=label;item.append(strong,small);stats.append(item);
    }
    return stats;
  }
  detailsButton(record,className='leaderboard-details-button'){
    const button=document.createElement('button');button.type='button';button.className=className;button.textContent='DETAILS';
    button.addEventListener('click',()=>this.openDetail(record));return button;
  }
  renderList(){
    const {records=[],mode,variant,durationMs,rulesVersion}=this.state;
    this.mode.textContent=mode.toLocaleUpperCase('en');this.variant.textContent=variant==='5m'?'5 MIN':variant.toLocaleUpperCase('en');
    this.rules.textContent=`CURRENT RULESET · V${rulesVersion} · ${formatDuration(durationMs).toLocaleUpperCase('en')}`;
    this.list.replaceChildren(...records.map(record=>{
      const item=document.createElement('li');item.className=`leaderboard-row rank-${record.rank}`;
      item.dataset.characterId=record.characterId;if(record.isCurrentPlayer)item.classList.add('is-current-player');
      const rank=document.createElement('strong');rank.className='leaderboard-rank';rank.textContent=`#${record.rank}`;
      const identity=document.createElement('div');identity.className='leaderboard-identity';
      const name=document.createElement('h3'),badge=document.createElement('span');name.textContent=record.name;
      badge.textContent=record.isCurrentPlayer?'YOUR PERSONAL BEST':'PERSONAL BEST';identity.append(name,badge);
      const score=document.createElement('div'),value=document.createElement('strong'),label=document.createElement('span');
      score.className='leaderboard-score';value.textContent=record.score;label.textContent='PTS';score.append(value,label);
      const date=document.createElement('time');date.className='leaderboard-record-date';date.textContent=formatDate(record.achievedAt);
      item.append(rank,this.portrait(record),identity,this.compactStats(record),score,date,this.detailsButton(record));return item;
    }));
    this.empty.hidden=records.length!==0;
  }
  renderTopCards(){
    const records=this.state?.records?.slice(0,4)??[];
    this.topCards.replaceChildren(...records.map(record=>{
      const item=document.createElement('li');item.className=`leaderboard-player-card place-${record.rank}`;item.dataset.characterId=record.characterId;
      const rank=document.createElement('span');rank.className='leaderboard-card-rank';rank.textContent=`#${record.rank}`;
      const identity=document.createElement('div');identity.className='leaderboard-card-identity';
      const name=document.createElement('h3');name.textContent=record.name;identity.append(name);
      const score=document.createElement('div'),value=document.createElement('strong'),unit=document.createElement('span');
      score.className='leaderboard-card-score';value.textContent=record.score;unit.textContent='POINTS';score.append(value,unit);
      const recordLabel=document.createElement('span');recordLabel.className='leaderboard-card-record';
      recordLabel.textContent=record.isCurrentPlayer?'YOUR RECORD':'PERSONAL BEST';
      item.append(rank,this.portrait(record),identity,score,recordLabel,this.compactStats(record),this.detailsButton(record,'leaderboard-card-details'));return item;
    }));
    this.topEmpty.hidden=records.length!==0;
  }
  setView(view,{focus=true}={}){
    const modal=view==='detail'&&this.isFuturistic();
    const backgroundView=modal?this.returnView:view;
    this.view=view;this.topView.hidden=backgroundView!=='top';this.listView.hidden=backgroundView!=='list';this.detail.hidden=view!=='detail';
    this.root.classList.toggle('has-record-modal',modal);
    this.topView.inert=modal;this.listView.inert=modal;
    for(const element of this.root.querySelectorAll('.leaderboards-header,.leaderboard-footer'))element.inert=modal;
    this.detail.setAttribute('role',modal?'dialog':'article');
    if(modal)this.detail.setAttribute('aria-modal','true');else this.detail.removeAttribute('aria-modal');
    this.viewTopButton.hidden=!this.isFuturistic();
    this.escapeLabel.textContent=view==='detail'?'Close details':view==='list'&&this.isFuturistic()?'Back to top players':'Back to Terminal';
    this.onViewChange(view);if(!focus)return;
    const target=view==='top'?this.viewListButton:view==='list'?this.viewTopButton:this.detailBack;target?.focus({preventScroll:true});
  }
  showTop(){if(!this.isFuturistic())return false;this.setView('top');return true;}
  showList(){this.setView('list');return true;}
  handleThemeChange(){if(!this.root.inert)this.setView(this.isFuturistic()?'top':'list',{focus:false});}
  openDetail(record){
    this.detail.querySelector('.leaderboard-portrait')?.remove();
    this.detail.querySelector('.leaderboard-detail-hero').prepend(this.portrait(record));
    this.selectedRecord=record;this.detailName.textContent=record.name.toLocaleUpperCase('en');
    this.detailRank.textContent=`RANK #${record.rank} · PERSONAL BEST`;this.detailScore.textContent=record.score;
    this.detailMetrics.replaceChildren(
      metric('Correct',record.correct),metric('Wrong',record.wrong),metric('Skipped',record.skipped),
      metric('Medium correct',record.mediumCorrect),metric('Hard correct',record.hardCorrect),
      metric('Total answered',record.totalAnswered),metric('Accuracy',record.accuracy,'%'),
    );
    this.detailMeta.replaceChildren(
      metric('Achieved at',formatDate(record.achievedAt)),metric('Rules version',record.rulesVersion),metric('Duration',formatDuration(record.durationMs)),
    );
    const rankLabel=document.createElement('span'),bestLabel=document.createElement('span');
    rankLabel.className='record-rank-label';rankLabel.textContent=`RANK #${record.rank}`;
    bestLabel.className='record-best-label';bestLabel.textContent='PERSONAL BEST';
    this.detailRank.replaceChildren(rankLabel,' · ',bestLabel);
    const accuracy=this.detailMetrics.querySelector('[data-metric="accuracy"]');
    const percent=Number.isFinite(record.accuracy)?Math.max(0,Math.min(100,record.accuracy)):0;
    const gold=Math.max(0,Math.min(1,(percent-60)/20));
    accuracy.style.setProperty('--accuracy-color',percent<60?'#afd5ff':`hsl(43 ${40+60*gold}% ${76-16*gold}%)`);
    accuracy.classList.toggle('is-high',percent>=80);
    accuracy.classList.toggle('is-excellent',percent>=90);
    this.returnView=this.view;this.setView('detail');
  }
  closeDetail(){
    if(this.view!=='detail')return false;const returnView=this.returnView??(this.isFuturistic()?'top':'list');
    this.setView(returnView,{focus:false});requestAnimationFrame(()=>{
      const container=returnView==='top'?this.topCards:this.list;
      container.querySelector(`[data-character-id="${CSS.escape(this.selectedRecord?.characterId??'')}"] button`)?.focus({preventScroll:true});
    });return true;
  }
  escape(){if(this.closeDetail())return true;if(this.view==='list'&&this.isFuturistic())return this.showTop();return false;}
}
