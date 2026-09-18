import { renderQuizMedia } from '../src/QuizMedia.js';
import { CalculatorWidget } from '../src/calculator/CalculatorWidget.js';
import '../src/calculator/CalculatorWidget.css';
import { TerminalQuestionDatabasePage } from './TerminalQuestionDatabasePage.js';
import { TerminalLeaderboardPage } from './TerminalLeaderboardPage.js';
import { terminalChallengeShortcut } from '../src/terminal/terminalChallengeShortcuts.js';

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
const challengePage=byId('challenge-page');
const challengeBackButton=byId('challenge-back-button');
const challengeIntro=byId('challenge-intro');
const challengeQuestionView=byId('challenge-question-view');
const challengeResultView=byId('challenge-result-view');
const challengeStartButton=byId('challenge-start-button');
const challengeConfirmToggle=byId('challenge-confirm-toggle');
const challengeDurationCopy=byId('challenge-duration-copy');
const challengeQuestionLimitCopy=byId('challenge-question-limit-copy');
const challengeMediumPoints=byId('challenge-medium-points');
const challengeHardPoints=byId('challenge-hard-points');
const challengeWrongPoints=byId('challenge-wrong-points');
const challengeSkipPoints=byId('challenge-skip-points');
const challengeRulesVersion=byId('challenge-rules-version');
const challengeGlobalTime=byId('challenge-global-time');
const challengeQuestionTime=byId('challenge-question-time');
const challengeGlobalProgress=byId('challenge-global-progress');
const challengeQuestionProgressBar=byId('challenge-question-progress-bar');
const challengeScore=byId('challenge-score');
const challengeScoreDelta=byId('challenge-score-delta');
const challengeQuestionTags=byId('challenge-question-tags');
const challengeQuestionProgress=byId('challenge-question-progress');
const challengeQuestionText=byId('challenge-question-text');
const challengeQuestionMedia=byId('challenge-question-media');
const challengeAnswerOptions=byId('challenge-answer-options');
const challengeAnswerFeedback=byId('challenge-answer-feedback');
const challengeConfirmButton=byId('challenge-confirm-button');
const challengeSkipButton=byId('challenge-skip-button');
const challengeLeaveButton=byId('challenge-leave-button');
const challengeFinalScore=byId('challenge-final-score');
const challengeNewBest=byId('challenge-new-best');
const challengeResultMetrics=byId('challenge-result-metrics');
const challengePersonalBest=byId('challenge-personal-best');
const challengePlayAgain=byId('challenge-play-again');
const challengeViewLeaderboard=byId('challenge-view-leaderboard');
const challengeResultBack=byId('challenge-result-back');
const challengePageStatus=byId('challenge-page-status');
const challengeEscapeLabel=byId('challenge-escape-label');
const challengeLeaveDialog=byId('challenge-leave-dialog');
const challengeConfirmLeave=byId('challenge-confirm-leave');
const THEME_STORAGE_KEY='terminalTheme';
const THEMES=new Set(['futuristic','subtle']);
const STUDY_DIFFICULTIES=Object.freeze([
  {label:'Mixed',value:null},{label:'Medium',value:'medium'},{label:'Hard',value:'hard'},
]);
const STUDY_REQUEST_TYPE='daa-terminal-study-request';
const STUDY_STATE_TYPE='daa-terminal-study-state';
const CHALLENGE_REQUEST_TYPE='daa-terminal-challenge-request';
const CHALLENGE_STATE_TYPE='daa-terminal-challenge-state';
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

function challengeClock(milliseconds,{secondsOnly=false}={}){
  const seconds=Math.ceil(Math.max(0,Number(milliseconds)||0)/1000);
  return secondsOnly?`${seconds}s`:`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}

class TerminalPageController {
  constructor(){
    this.page='home';this.state=null;this.challengeState=null;this.transitionTimer=null;this.challengeQuestionRenderKey='';
    this.selection={category:null,topic:null,difficulty:null};
    this.calculator=new CalculatorWidget({
      mount:byId('study-question-tools'),scene:null,documentRef:document,windowRef:window,
    });
    this.challengeCalculator=new CalculatorWidget({
      mount:byId('challenge-question-tools'),scene:null,documentRef:document,windowRef:window,
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
    challengeBackButton.addEventListener('click',()=>this.requestChallengeExit());
    challengeStartButton.addEventListener('click',()=>this.startChallenge());
    challengeConfirmButton.addEventListener('click',()=>this.requestChallenge('confirm'));
    challengeSkipButton.addEventListener('click',()=>this.requestChallenge('skip'));
    challengeLeaveButton.addEventListener('click',()=>this.openChallengeLeaveDialog());
    challengeConfirmLeave.addEventListener('click',()=>this.leaveChallenge());
    challengePlayAgain.addEventListener('click',()=>this.startChallenge());
    challengeViewLeaderboard.addEventListener('click',()=>this.showChallengeLeaderboard());
    challengeResultBack.addEventListener('click',()=>this.leaveChallenge());
    brandHomeLink.addEventListener('click',event=>{
      event.preventDefault();
      if(this.page==='challengeQuestion')this.openChallengeLeaveDialog();
      else if(this.page.startsWith('challenge'))this.leaveChallenge();
      else if(this.page==='studyQuestion'||this.page==='studyResult')this.backToSetup();
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

  requestChallenge(action,payload={}){
    if(!embedded){
      challengePageStatus.textContent='Open this page from the classroom terminal to use the real IT Challenge.';
      return;
    }
    window.parent.postMessage({type:CHALLENGE_REQUEST_TYPE,action,payload},location.origin);
  }

  handleChallengeShortcut(event){
    if(this.page!=='challengeQuestion')return false;
    const target=event.target;
    const typing=target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement
      ||target instanceof HTMLSelectElement||target?.isContentEditable;
    const focusedAction=Boolean(target?.closest?.('button:not(.challenge-answer)'));
    const action=terminalChallengeShortcut({
      key:event.key,code:event.code,repeat:event.repeat,
      modified:event.altKey||event.ctrlKey||event.metaKey,
      blocked:typing||focusedAction||challengeLeaveDialog.open||this.challengeCalculator.isOpen,
      selectedAnswer:this.challengeState?.selectedAnswer,
      confirmBeforeSubmit:challengeConfirmToggle.checked,
      resolving:this.challengeState?.resolving,saving:this.challengeState?.saving,
    });
    if(!action)return false;
    event.preventDefault();event.stopPropagation();this.requestChallenge(action);return true;
  }

  receive(event){
    if(event.origin!==location.origin||event.source!==window.parent)return;
    if(event.data?.type===CHALLENGE_STATE_TYPE){
      const previous=this.challengeState;this.challengeState=event.data.state;
      if(this.challengeState.phase==='question')this.page='challengeQuestion';
      else if(this.challengeState.phase==='result')this.page='challengeResult';
      else if(this.page.startsWith('challenge'))this.page='challengeIntro';
      this.renderChallenge(previous);return;
    }
    if(event.data?.type!==STUDY_STATE_TYPE)return;
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

  renderChallengeIntro(){
    const rules=this.challengeState?.rules;if(!rules)return;
    challengeDurationCopy.textContent=`${Math.round(rules.durationMs/60_000)} minutes`;
    challengeQuestionLimitCopy.textContent=`${Math.round(rules.questionTimeoutMs/1000)}-second`;
    challengeMediumPoints.textContent=`+${rules.points.mediumCorrect}`;
    challengeHardPoints.textContent=`+${rules.points.hardCorrect}`;
    challengeWrongPoints.textContent=String(rules.points.wrong).replace('-','−');
    challengeSkipPoints.textContent=String(rules.points.skip).replace('-','−');
    challengeRulesVersion.textContent=`CURRENT RULESET · V${rules.rulesVersion}`;
    challengeStartButton.disabled=Boolean(this.challengeState.pending);
    challengeStartButton.querySelector('span').textContent=this.challengeState.pending?'PREPARING…':'START CHALLENGE';
    challengePageStatus.textContent=this.challengeState.status??'';
  }

  renderChallengeQuestion(){
    const state=this.challengeState;if(!state?.question)return;
    const {question,timers,selectedAnswer,confirmedAnswer,resolving}=state;
    this.renderChallengeDashboard();
    challengeQuestionTags.replaceChildren(...[question.category,question.topic,question.difficulty]
      .filter(Boolean).map(value=>{const tag=document.createElement('span');tag.textContent=value;
        if(value===question.difficulty)tag.classList.add(`difficulty-${value}`);return tag;}));
    challengeQuestionProgress.textContent=`QUESTION ${state.progress.current}`;
    challengeQuestionText.textContent=question.question;renderQuizMedia(challengeQuestionMedia,question.media);
    const submitted=confirmedAnswer!==null;
    challengeAnswerOptions.replaceChildren(...question.answers.map((answer,index)=>{
      const button=document.createElement('button');button.type='button';button.className='challenge-answer';
      const marker=document.createElement('span');marker.textContent=String.fromCharCode(65+index);
      const text=document.createElement('strong');text.textContent=answer;button.append(marker,text);
      button.disabled=Boolean(resolving||state.saving);button.classList.toggle('is-selected',!submitted&&index===selectedAnswer);
      button.classList.toggle('is-correct',submitted&&index===question.correctAnswer);
      button.classList.toggle('is-incorrect',submitted&&index===confirmedAnswer&&index!==question.correctAnswer);
      button.setAttribute('aria-pressed',String(index===selectedAnswer));
      button.addEventListener('click',()=>this.requestChallenge('select',{
        answerIndex:index,submitImmediately:!challengeConfirmToggle.checked,
      }));return button;
    }));
    challengeAnswerFeedback.hidden=!state.feedback;
    if(state.feedback){
      const label=state.feedback.correct?(question.difficulty==='hard'?'HARD CORRECT':'CORRECT'):'WRONG';
      challengeAnswerFeedback.textContent=`${label} · ${state.feedback.points>0?'+':''}${state.feedback.points}`;
      challengeAnswerFeedback.className=`challenge-answer-feedback ${state.feedback.correct?'is-correct':'is-incorrect'}`;
    }
    challengeConfirmButton.hidden=!challengeConfirmToggle.checked||submitted;
    challengeConfirmButton.disabled=selectedAnswer===null||Boolean(resolving||state.saving);
    challengeSkipButton.disabled=Boolean(resolving||state.saving);
    challengeLeaveButton.disabled=Boolean(state.saving);
    challengePageStatus.textContent=state.status??'';
  }

  renderChallengeDashboard(){
    const state=this.challengeState,{timers}=state;
    challengeGlobalTime.textContent=challengeClock(timers.remainingMs);
    challengeQuestionTime.textContent=challengeClock(timers.questionRemainingMs,{secondsOnly:true});
    challengeGlobalProgress.style.transform=`scaleX(${timers.totalRatio})`;
    challengeQuestionProgressBar.style.transform=`scaleX(${timers.questionRatio})`;
    challengeGlobalTime.closest('.challenge-clock').classList.toggle('is-urgent',timers.remainingMs<=30_000);
    challengeQuestionTime.closest('.challenge-clock').classList.toggle('is-urgent',timers.questionRemainingMs<=10_000);
    challengeScore.textContent=state.score;
    const feedback=state.feedback;
    challengeScoreDelta.hidden=!feedback;challengeScoreDelta.textContent=feedback?(feedback.points>0?`+${feedback.points}`:feedback.points):'';
  }

  renderChallengeResult(){
    const state=this.challengeState,result=state?.result;if(!result)return;
    challengeFinalScore.textContent=result.score;challengeNewBest.hidden=!state.newPersonalBest;
    const metrics=[['Correct',result.correct],['Wrong',result.wrong],['Skipped',result.skipped],
      ['Medium Correct',result.mediumCorrect],['Hard Correct',result.hardCorrect],
      ['Total Answered',result.totalAnswered],['Accuracy',`${result.accuracy}%`]];
    challengeResultMetrics.replaceChildren(...metrics.map(([label,value])=>{
      const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');
      term.textContent=label;description.textContent=value;row.append(term,description);return row;
    }));
    challengePersonalBest.textContent=state.personalBest===null||state.personalBest===undefined
      ?(state.saving?'Saving result…':''):`Personal best: ${state.personalBest} points`;
    for(const button of [challengePlayAgain,challengeViewLeaderboard,challengeResultBack])button.disabled=Boolean(state.saving);
    challengePageStatus.textContent=state.status??'';
  }

  renderChallenge(){
    const intro=this.page==='challengeIntro',question=this.page==='challengeQuestion',result=this.page==='challengeResult';
    challengeIntro.hidden=!intro;challengeQuestionView.hidden=!question;challengeResultView.hidden=!result;
    challengeEscapeLabel.textContent=question?'Leave Challenge':result?'Back to Terminal':'Back to Terminal';
    if(!question){this.challengeQuestionRenderKey='';this.challengeCalculator.close({reset:result||intro});}
    if(intro)this.renderChallengeIntro();
    else if(question){
      const state=this.challengeState,key=JSON.stringify([
        state.question?.id,state.progress?.current,state.selectedAnswer,state.confirmedAnswer,
        state.resolving,state.score,state.status,state.saving,
      ]);
      if(key===this.challengeQuestionRenderKey){this.renderChallengeDashboard();challengePageStatus.textContent=state.status??'';}
      else{this.challengeQuestionRenderKey=key;this.renderChallengeQuestion();}
    }else if(result)this.renderChallengeResult();
  }

  showChallenge(card){
    if(this.page!=='home')return;
    card?.classList.add('is-launching');clearTimeout(this.transitionTimer);
    this.transitionTimer=setTimeout(()=>{
      card?.classList.remove('is-launching');this.page='challengeIntro';terminal.dataset.page='challenge';
      terminal.classList.add('is-showing-challenge');challengePage.inert=false;challengePage.setAttribute('aria-hidden','false');
      document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=true;element.setAttribute('aria-hidden','true');});
      this.renderChallenge();this.requestChallenge('state');challengeBackButton.focus({preventScroll:true});
    },110);
  }

  startChallenge(){
    if(this.challengeState?.pending||this.challengeState?.saving)return;
    this.challengeState={...(this.challengeState??{}),pending:true,status:'Preparing challenge…'};
    this.renderChallenge();this.requestChallenge('start');
  }

  openChallengeLeaveDialog(){
    if(this.page!=='challengeQuestion')return;
    if(!challengeLeaveDialog.open&&typeof challengeLeaveDialog.showModal==='function')challengeLeaveDialog.showModal();
  }

  requestChallengeExit(){
    if(this.page==='challengeQuestion')this.openChallengeLeaveDialog();else this.leaveChallenge();
  }

  leaveChallenge(){
    if(challengeLeaveDialog.open)challengeLeaveDialog.close();
    this.challengeCalculator.close({reset:true});this.requestChallenge('leave');this.showHome();
  }

  showChallengeLeaderboard(){
    if(this.challengeState?.saving)return;
    this.challengeCalculator.close({reset:true});this.requestChallenge('leave');
    challengePage.inert=true;challengePage.setAttribute('aria-hidden','true');terminal.classList.remove('is-showing-challenge');
    this.page='leaderboards';terminal.dataset.page='leaderboards';terminal.classList.add('is-showing-leaderboards');
    this.leaderboard.open();byId('leaderboard-back-button').focus({preventScroll:true});
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
      &&!terminal.classList.contains('is-showing-leaderboards')
      &&!terminal.classList.contains('is-showing-challenge'))return;
    const previousPage=this.page;
    if(this.state?.pending)this.request('end');
    clearTimeout(this.transitionTimer);this.calculator.close({reset:true});this.page='home';terminal.dataset.page='home';
    terminal.classList.remove('is-showing-study','is-showing-database','is-showing-leaderboards','is-showing-challenge');studyPage.inert=true;studyPage.setAttribute('aria-hidden','true');
    challengePage.inert=true;challengePage.setAttribute('aria-hidden','true');
    this.database.hide();this.leaderboard.hide();
    document.querySelectorAll('.terminal-home-page').forEach(element=>{element.inert=false;element.setAttribute('aria-hidden','false');});
    if(!immediate)document.querySelector(previousPage.startsWith('database')?'.card-database'
      :previousPage.startsWith('leaderboard')?'.card-leaderboard'
      :previousPage.startsWith('challenge')?'.card-challenge':'.card-study')
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
    if(this.pageController.handleChallengeShortcut(event))return;
    if(event.key==='Escape'&&!event.repeat&&this.pageController.page!=='home'){
      event.preventDefault();
      if(this.pageController.page==='databaseDetail')this.pageController.database.escape();
      else if(this.pageController.page.startsWith('leaderboard')){
        if(!this.pageController.leaderboard.escape())this.pageController.showHome();
      }
      else if(this.pageController.page==='challengeQuestion')this.pageController.openChallengeLeaveDialog();
      else if(this.pageController.page.startsWith('challenge'))this.pageController.leaveChallenge();
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
  if(card.dataset.mode==='5 Min IT Challenge'){terminalPageController.showChallenge(card);return;}
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
