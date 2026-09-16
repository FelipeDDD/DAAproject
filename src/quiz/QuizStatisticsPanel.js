import { characterById } from '../characters.js';

function metric(documentRef,label,value){
  const item=documentRef.createElement('div');item.className='quiz-statistic-metric';
  const name=documentRef.createElement('span');name.textContent=label;
  const result=documentRef.createElement('strong');result.textContent=String(value);
  item.append(name,result);return item;
}

function summaryLine(documentRef,item){
  const row=documentRef.createElement('div');row.className='quiz-statistic-row';
  const name=documentRef.createElement('span');name.textContent=item.name;
  const value=documentRef.createElement('span');value.textContent=`${item.accuracy}% (${item.correct}/${item.answered})`;
  row.append(name,value);return row;
}

export class QuizStatisticsPanel{
  constructor({presence,onClose=()=>{},documentRef=document}){
    Object.assign(this,{presence,onClose,documentRef,openState:false,requestToken:0});
    this.root=documentRef.getElementById('quiz-statistics');
    this.title=documentRef.getElementById('quiz-statistics-title');
    this.mode=documentRef.getElementById('quiz-statistics-mode');
    this.content=documentRef.getElementById('quiz-statistics-content');
    this.status=documentRef.getElementById('quiz-statistics-status');
    this.closeButton=documentRef.getElementById('close-quiz-statistics');
    this.onModeChange=()=>void this.load();this.onCloseClick=()=>this.close();
    this.mode.addEventListener('change',this.onModeChange);
    this.closeButton.addEventListener('click',this.onCloseClick);
  }

  async open(){
    this.openState=true;this.root.hidden=false;this.content.replaceChildren();
    const character=characterById(this.presence.identity.characterId);
    this.title.textContent=`${character?.name??this.presence.identity.characterId}'s Statistics`;
    this.onClose();await this.load();
  }

  async load(){
    if(!this.openState)return;
    const token=++this.requestToken;this.status.textContent='Loading statistics…';
    const {characterId,sessionId}=this.presence.identity;
    const mode=this.mode.value||undefined;
    try{
      const summary=await this.presence.client.query(this.presence.api.quizStatistics.summary,{
        characterId,sessionId,...(mode?{mode}:{}),
      });
      if(token!==this.requestToken||!this.openState)return;
      this.render(summary);this.status.textContent='';
    }catch{
      if(token===this.requestToken)this.status.textContent='Could not load statistics.';
    }
  }

  render(summary){
    const documentRef=this.documentRef,fragment=documentRef.createDocumentFragment();
    const overall=documentRef.createElement('section');
    const overallTitle=documentRef.createElement('h4');overallTitle.textContent='Overall';
    const metrics=documentRef.createElement('div');metrics.className='quiz-statistic-metrics';
    metrics.append(
      metric(documentRef,'Answered',summary.overall.answered),
      metric(documentRef,'Correct',summary.overall.correct),
      metric(documentRef,'Wrong',summary.overall.wrong),
      metric(documentRef,'Accuracy',`${summary.overall.accuracy}%`),
    );overall.append(overallTitle,metrics);fragment.append(overall);

    const addGroup=(title,items)=>{
      const section=documentRef.createElement('section'),heading=documentRef.createElement('h4');heading.textContent=title;
      section.append(heading);
      if(!items.length){const empty=documentRef.createElement('p');empty.textContent='No answers recorded yet.';section.append(empty);}
      else for(const item of items)section.append(summaryLine(documentRef,item));
      fragment.append(section);
    };

    const categories=documentRef.createElement('section'),categoryTitle=documentRef.createElement('h4');
    categoryTitle.textContent='By Category';categories.append(categoryTitle);
    if(!summary.byCategory.length){const empty=documentRef.createElement('p');empty.textContent='No answers recorded yet.';categories.append(empty);}
    for(const category of summary.byCategory){
      if(category.topics.length){
        const details=documentRef.createElement('details'),heading=documentRef.createElement('summary');
        heading.className='quiz-statistic-row';
        heading.append(...summaryLine(documentRef,category).childNodes);details.append(heading);
        const topics=documentRef.createElement('div');topics.className='quiz-statistic-topics';
        for(const topic of category.topics)topics.append(summaryLine(documentRef,topic));
        details.append(topics);categories.append(details);
      }else categories.append(summaryLine(documentRef,category));
    }
    fragment.append(categories);
    addGroup('By Difficulty',summary.byDifficulty);
    addGroup('By Mode',summary.byMode.map(item=>({...item,name:item.name[0].toUpperCase()+item.name.slice(1)})));

    const weakest=summary.weakTopics[0]??summary.weakCategories[0];
    if(weakest){
      const note=documentRef.createElement('p');note.className='quiz-statistic-weak';
      note.textContent=`Needs attention: ${weakest.category?`${weakest.category} / `:''}${weakest.name} (${weakest.accuracy}%). Based on at least ${summary.weakMinimum} answers.`;
      fragment.append(note);
    }
    this.content.replaceChildren(fragment);
  }

  close(){
    this.openState=false;this.requestToken+=1;this.root.hidden=true;this.onClose();
  }

  destroy(){this.close();this.mode.removeEventListener('change',this.onModeChange);this.closeButton.removeEventListener('click',this.onCloseClick);}
}
