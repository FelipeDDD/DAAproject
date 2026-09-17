import { renderQuizMedia } from '../src/QuizMedia.js';
import { CalculatorWidget } from '../src/calculator/CalculatorWidget.js';
import '../src/calculator/CalculatorWidget.css';
import { TerminalQuestionDatabasePage } from './TerminalQuestionDatabasePage.js';
import { TerminalLeaderboardPage } from './TerminalLeaderboardPage.js';

const byId=id=>document.getElementById(id);
const clock=byId('terminal-clock');
const cards=[...document.querySelectorAll('.mode-card')];
const toast=byId('preview-toast');
const returnButton=byId('return-button');
const themeSelect=byId('theme-select');
const terminal=byId('terminal-preview');
const classroomPreview=byId('classroom-preview');
const openTerminalButton=byId('open-terminal-button');
const brandHomeLink=document.querySelector('.brand');
const studyPage=byId('study-page');
const studyBackButton=byId('study-back-button');
const startStudyButton=byId('start-study-button');
const categoryOptions=byId('study-category-options');
const topicOptions=byId('study-topic-options');
const difficultyOptions=byId('study-difficulty-options');
const topicCount=byId('study-topic-count');
const studySummary=byId('study-summary');
const studyConfig=byId('study-config');
const studyFooter=byId('study-footer');
const studyEscapeLabel=byId('study-escape-label');
const studyQuestionView=byId('study-question-view');
const studyResultView=byId('study-result-view');
const studyQuestionTags=byId('study-question-tags');
const studyQuestionProgress=byId('study-question-progress');
const studyQuestionText=byId('study-question-text');
const studyQuestionMedia=byId('study-question-media');
const studyAnswerOptions=byId('study-answer-options');
const studyAnswerFeedback=byId('study-answer-feedback');
const studyQuestionExplanation=byId('study-question-explanation');
const studyConfirmButton=byId('study-confirm-button');
const studyNextButton=byId('study-next-button');
const studyEndButton=byId('study-end-button');
const studyAgainButton=byId('study-again-button');
const studyResultBackButton=byId('study-result-back-button');
const studyResultCorrect=byId('study-result-correct');
const studyResultAccuracy=byId('study-result-accuracy');
const studyPageStatus=byId('study-page-status');
const THEME_STORAGE_KEY='terminalTheme';
const THEMES=new Set(['futuristic','subtle']);
const STUDY_DIFFICULTIES=Object.freeze([
  {label:'Mixed',value:null},{label:'Medium',value:'medium'},{label:'Hard',value:'hard'},
]);
const STUDY_REQUEST_TYPE='daa-terminal-study-request';
const STUDY_STATE_TYPE='daa-terminal-study-state';
const embedded=window.parent!==window&&new URLSearchParams(location.search).has('embedded');
let toastTimer;

function cssTimeToMilliseconds(value){
  const time=Number.parseFloat(value);
  if(!Number.isFinite(time))return 420;
  return value.trim().endsWith('ms')?time:time*1000;
}

function topicsFor(options,category){
  return options?.topicsByCategory?.find(group=>group.category===category)?.topics??[];
}

class TerminalPageController {
  constructor(){
    this.page='home';this.state=null;this.transitionTimer=null;
    this.selection={category:null,topic:null,difficulty:null};
    this.calculator=new CalculatorWidget({
      mount:byId('study-question-tools'),scene:null,documentRef:document,windowRef:window,
    });
    this.database=new TerminalQuestionDatabasePage({
      embedded,onBack:()=>this.showHome(),
      onViewChange:view=>{this.page=view==='detail'?'databaseDetail':'database';},
    });
    this.leaderboard=new TerminalLeaderboardPage({
      embedded,onBack:()=>this.showHome(),
      onViewChange:view=>{this.page=view==='detail'?'leaderboardDetail':view==='list'?'leaderboardList':'leaderboards';},
    });
    studyBackButton.addEventListener('click',()=>this.showHome());
    startStudyButton.addEventListener('click',()=>this.startStudy());
    studyConfirmButton.addEventListener('click',()=>this.request('confirm'));
    studyNextButton.addEventListener('click',()=>this.request('next'));
    studyEndButton.addEventListener('click',()=>this.backToSetup());
    studyResultBackButton.addEventListener('click',()=>this.backToSetup());
    studyAgainButton.addEventListener('click',()=>this.startStudy());
    brandHomeLink.addEventListener('click',event=>{
      event.preventDefault();
      if(this.page==='studyQuestion'||this.page==='studyResult')this.backToSetup();
      else if(this.page!=='home')this.showHome();
    });
    window.addEventListener('message',event=>this.receive(event));
    this.renderSetup();this.renderPage();
  }

  request(action,payload={}){
    if(!embedded){
      studyPageStatus.textContent='Open this page from the classroom terminal to use the real Study Mode.';
      return;
    }
    window.parent.postMessage({type:STUDY_REQUEST_TYPE,action,payload},location.origin);
  }

  receive(event){
    if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!==STUDY_STATE_TYPE)return;
    this.state=event.data.state;
    if(this.state.options)this.applyOptions(this.state.options);
    if(this.state.phase==='question')this.page='studyQuestion';
    else if(this.state.phase==='result')this.page='studyResult';
    else if(this.page!=='home')this.page='studySetup';
    this.render();
  }

  applyOptions(options){
    const categories=options.categories??[];
    if(!categories.includes(this.selection.category)){
      this.selection.category=categories.includes('Hardware')?'Hardware':categories[0]??null;
      this.selection.topic=null;
    }
    const topics=topicsFor(options,this.selection.category);
    if(!topics.includes(this.selection.topic))this.selection.topic=null;
    if(!options.difficulties?.includes(this.selection.difficulty))this.selection.difficulty=null;
  }

  createChoice(label,value,selected,onSelect){
    const button=document.createElement('button');button.type='button';button.className='study-choice';
    button.textContent=label;button.dataset.value=value??'';button.classList.toggle('is-selected',selected);
    button.setAttribute('aria-pressed',String(selected));button.disabled=Boolean(this.state?.pending);
    button.addEventListener('click',()=>onSelect(value));return button;
  }

  renderChoices(container,values,selected,onSelect){
    container.replaceChildren(...values.map(({label,value})=>this.createChoice(label,value,value===selected,onSelect)));
  }

  renderSetup(){
    const options=this.state?.options;
    const categories=options?.categories??[];
    const topics=topicsFor(options,this.selection.category);
    this.renderChoices(categoryOptions,categories.map(value=>({label:value,value})),this.selection.category,category=>{
      this.selection.category=category;this.selection.topic=null;this.renderSetup();
    });
    this.renderChoices(topicOptions,[{label:'All Topics',value:null},...topics.map(value=>({label:value,value}))],this.selection.topic,topic=>{
      this.selection.topic=topic;this.renderSetup();
    });
    this.renderChoices(difficultyOptions,STUDY_DIFFICULTIES,this.selection.difficulty,difficulty=>{
      this.selection.difficulty=difficulty;this.renderSetup();
    });
    topicCount.textContent=`${topics.length+1} option${topics.length?'s':''}`;
    const difficulty=STUDY_DIFFICULTIES.find(item=>item.value===this.selection.difficulty)?.label??'Mixed';
    studySummary.textContent=[this.selection.category,this.selection.topic??'All Topics',difficulty].filter(Boolean).join(' · ');
    startStudyButton.disabled=!options||!this.selection.category||Boolean(this.state?.pending);
    startStudyButton.querySelector('span').textContent=this.state?.pending?'PREPARING…':'START STUDY';
    studyPageStatus.textContent=this.state?.status??(options?'':'Loading real quiz settings…');
  }

  renderQuestion(){
    const {question,progress,selectedAnswer,confirmedAnswer}=this.state;
    studyQuestionTags.replaceChildren(...[question.category,question.topic,question.difficulty]
      .filter(Boolean).map(value=>{const tag=document.createElement('span');tag.textContent=value;return tag;}));
    studyQuestionProgress.textContent=`${progress.current} / ${progress.total}`;
    studyQuestionText.textContent=question.question;renderQuizMedia(studyQuestionMedia,question.media);
    const confirmed=confirmedAnswer!==null;
    studyAnswerOptions.replaceChildren(...question.answers.map((answer,index)=>{
      const button=document.createElement('button');button.type='button';button.className='study-answer';
      const marker=document.createElement('span');marker.textContent=String.fromCharCode(65+index);
      const text=document.createElement('strong');text.textContent=answer;button.append(marker,text);button.disabled=confirmed;
      button.classList.toggle('is-selected',!confirmed&&index===selectedAnswer);
      button.classList.toggle('is-correct',confirmed&&index===question.correctAnswer);
      button.classList.toggle('is-incorrect',confirmed&&index===confirmedAnswer&&index!==question.correctAnswer);
      button.setAttribute('aria-pressed',String(index===selectedAnswer));
      button.addEventListener('click',()=>this.request('select',{answerIndex:index}));return button;
    }));
    studyAnswerFeedback.hidden=!confirmed;
    const correct=confirmed&&confirmedAnswer===question.correctAnswer;
    studyAnswerFeedback.textContent=correct?'Correct':'Incorrect';
    studyAnswerFeedback.className=`study-answer-feedback ${correct?'is-correct':'is-incorrect'}`;
    studyQuestionExplanation.hidden=!question.explanation;studyQuestionExplanation.textContent=question.explanation||'';
    studyConfirmButton.hidden=confirmed;studyConfirmButton.disabled=selectedAnswer===null||this.state.pending;
    studyNextButton.hidden=!confirmed;studyNextButton.disabled=Boolean(this.state.pending);
    studyNextButton.firstChild.textContent=progress.current===progress.total?'View Results ':'Next Question ';
    studyPageStatus.textContent=this.state.status??'';
  }

  renderResult(){
    const result=this.state.result;studyResultCorrect.textContent=`${result.correct} / ${result.total}`;
    studyResultAccuracy.textContent=`Accuracy: ${result.accuracy}%`;studyPageStatus.textContent=this.state.status??'';
  }

  renderPage(){
    const setup=this.page==='studySetup',question=this.page==='studyQuestion',result=this.page==='studyResult';
    studyConfig.hidden=!setup;studyFooter.hidden=!setup;studyQuestionView.hidden=!question;studyResultView.hidden=!result;
    studyEscapeLabel.textContent=question||result?'Back to Study Setup':'Back to Terminal';
    if(!question)this.calculator.close();
  }

  render(){
    this.renderPage();
    if(this.page==='studySetup')this.renderSetup();
    else if(this.page==='studyQuestion')this.renderQuestion();
    else if(this.page==='studyResult')this.renderResult();
  }

  showStudy(card){
    if(this.page!=='home')return;
    card?.classList.add('is-launching');clearTimeout(this.transitionTimer);
    this.transitionTimer=setTimeout(()=>{
      card?.classList.remove('is-launching');this.page='studySetup';terminal.dataset.page='study';
      terminal.classList.add('is-showing-study');studyPage.inert=false;studyPage.setAttribute('aria-hidden','false');
      document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=true;element.setAttribute('aria-hidden','true');});
      this.render();this.request('options');studyBackButton.focus({preventScroll:true});
    },110);
  }

  showDatabase(card){
    if(this.page!=='home')return;
    card?.classList.add('is-launching');clearTimeout(this.transitionTimer);
    this.transitionTimer=setTimeout(()=>{
      card?.classList.remove('is-launching');this.page='database';terminal.dataset.page='database';
      terminal.classList.add('is-showing-database');
      document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=true;element.setAttribute('aria-hidden','true');});
      this.database.open();byId('database-search').focus({preventScroll:true});
    },110);
  }

  showLeaderboards(card){
    if(this.page!=='home')return;
    card?.classList.add('is-launching');clearTimeout(this.transitionTimer);
    this.transitionTimer=setTimeout(()=>{
      card?.classList.remove('is-launching');this.page='leaderboards';terminal.dataset.page='leaderboards';
      terminal.classList.add('is-showing-leaderboards');
      document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=true;element.setAttribute('aria-hidden','true');});
      this.leaderboard.open();byId('leaderboard-back-button').focus({preventScroll:true});
    },110);
  }

  showHome({immediate=false}={}){
    if(this.page==='home'&&!terminal.classList.contains('is-showing-study')
      &&!terminal.classList.contains('is-showing-database')
      &&!terminal.classList.contains('is-showing-leaderboards'))return;
    const previousPage=this.page;
    if(this.state?.pending)this.request('end');
    clearTimeout(this.transitionTimer);this.calculator.close({reset:true});this.page='home';terminal.dataset.page='home';
    terminal.classList.remove('is-showing-study','is-showing-database','is-showing-leaderboards');studyPage.inert=true;studyPage.setAttribute('aria-hidden','true');
    this.database.hide();this.leaderboard.hide();
    document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=false;element.setAttribute('aria-hidden','false');});
    if(!immediate)document.querySelector(previousPage.startsWith('database')?'.card-database'
      :previousPage.startsWith('leaderboard')?'.card-leaderboard':'.card-study')
      ?.focus({preventScroll:true});
  }

  startStudy(){
    if(this.state?.pending)return;
    this.state={...(this.state??{}),phase:'setup',pending:true,status:'Preparing questions…'};
    if(this.page!=='studyResult')this.renderSetup();
    this.request('start',{...this.selection});
  }
  backToSetup(){this.calculator.close({reset:true});this.request('end');}
}

class TerminalPreviewController {
  constructor({terminalElement,classroomElement,openButton,closeButton,pageController}){
    Object.assign(this,{terminalElement,classroomElement,openButton,closeButton,pageController,isTerminalOpen:false,isTransitioning:false,finishTimer:null});
    this.openButton.addEventListener('click',()=>this.openTerminal());this.closeButton.addEventListener('click',()=>this.closeTerminal());
    document.addEventListener('keydown',event=>this.handleKeydown(event));
  }
  transitionDuration(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return 0;
    return cssTimeToMilliseconds(getComputedStyle(document.documentElement).getPropertyValue('--terminal-transition-duration'));
  }
  openTerminal(){
    if(this.isTerminalOpen||this.isTransitioning)return;
    this.isTerminalOpen=true;this.beginTransition();this.terminalElement.inert=false;
    this.terminalElement.setAttribute('aria-hidden','false');this.classroomElement.setAttribute('aria-hidden','true');
    requestAnimationFrame(()=>{document.body.classList.add('is-terminal-open');this.finishTransition(()=>themeSelect.focus({preventScroll:true}));});
  }
  closeTerminal(){
    if(embedded){window.parent.postMessage({type:'daa-terminal-close'},location.origin);return;}
    if(!this.isTerminalOpen||this.isTransitioning)return;
    this.pageController.showHome({immediate:true});this.isTerminalOpen=false;this.beginTransition();
    document.body.classList.remove('is-terminal-open');this.finishTransition(()=>{
      this.terminalElement.inert=true;this.terminalElement.setAttribute('aria-hidden','true');this.classroomElement.setAttribute('aria-hidden','false');
      cards.forEach(card=>card.classList.remove('is-selected'));this.openButton.focus({preventScroll:true});
    });
  }
  beginTransition(){this.isTransitioning=true;document.body.classList.add('is-transitioning');clearTimeout(this.finishTimer);}
  finishTransition(afterTransition){
    this.finishTimer=setTimeout(()=>{this.isTransitioning=false;document.body.classList.remove('is-transitioning');afterTransition?.();},this.transitionDuration()+30);
  }
  handleKeydown(event){
    if(event.key==='Escape'&&!event.repeat&&this.pageController.page!=='home'){
      event.preventDefault();
      if(this.pageController.page==='databaseDetail')this.pageController.database.escape();
      else if(this.pageController.page.startsWith('leaderboard')){
        if(!this.pageController.leaderboard.escape())this.pageController.showHome();
      }
      else if(['studyQuestion','studyResult'].includes(this.pageController.page))this.pageController.backToSetup();
      else this.pageController.showHome();
      return;
    }
    if(embedded){if(event.key==='Escape'&&!event.repeat){event.preventDefault();this.closeTerminal();}return;}
    if(event.repeat||this.isTransitioning)return;
    if(event.key==='Escape'&&this.isTerminalOpen){event.preventDefault();this.closeTerminal();return;}
    const target=event.target;
    const isTyping=target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||target?.isContentEditable;
    if(!this.isTerminalOpen&&!isTyping&&event.key.toLowerCase()==='e'){event.preventDefault();this.openTerminal();}
  }
}

function loadTheme(){
  try{const savedTheme=localStorage.getItem(THEME_STORAGE_KEY);return THEMES.has(savedTheme)?savedTheme:'futuristic';}
  catch{return 'futuristic';}
}
function applyTheme(theme,persist=true){
  const nextTheme=THEMES.has(theme)?theme:'futuristic';document.documentElement.dataset.theme=nextTheme;themeSelect.value=nextTheme;
  if(persist)try{localStorage.setItem(THEME_STORAGE_KEY,nextTheme);}catch{}
}
function updateClock(){
  const value=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  clock.textContent=value;clock.dateTime=value;
}
function showPreviewMessage(message){
  clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('is-visible');
  toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),2200);
}
function selectCard(card){
  cards.forEach(item=>item.classList.toggle('is-selected',item===card));
  if(card.dataset.mode==='Study Mode'){terminalPageController.showStudy(card);return;}
  if(card.dataset.mode==='Question Database'){terminalPageController.showDatabase(card);return;}
  if(card.dataset.mode==='Leaderboards'){terminalPageController.showLeaderboards(card);return;}
  showPreviewMessage(`${card.dataset.mode} selected · visual preview only`);
}
cards.forEach(card=>{
  card.addEventListener('click',()=>selectCard(card));
  card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCard(card);}});
});
themeSelect.addEventListener('change',()=>{
  applyTheme(themeSelect.value);terminalPageController.leaderboard.handleThemeChange();
  showPreviewMessage(`${themeSelect.selectedOptions[0].textContent} interface enabled`);
});
applyTheme(loadTheme(),false);
const terminalPageController=new TerminalPageController();
const terminalPreviewController=new TerminalPreviewController({
  terminalElement:terminal,classroomElement:classroomPreview,openButton:openTerminalButton,closeButton:returnButton,pageController:terminalPageController,
});
window.terminalPreviewController=terminalPreviewController;
if(embedded){
  document.documentElement.classList.add('terminal-embedded');document.body.classList.add('is-terminal-open');
  terminalPreviewController.isTerminalOpen=true;terminal.inert=false;terminal.setAttribute('aria-hidden','false');classroomPreview.hidden=true;
}
updateClock();setInterval(updateClock,30_000);
