import { renderQuizMedia } from './QuizMedia.js';
import { renderQuizSettingsControls,readQuizSettingsControls,DEFAULT_QUIZ_OPTIONS } from './quiz/QuizSettingsControls.js';
import { createSoloSession,SOLO_MODES } from './quiz/soloModes.js';
import { nearbySoloStudySeat } from './maps/soloStudySeats.js';
import { CalculatorWidget } from './calculator/CalculatorWidget.js';
import { QuizStatisticsPanel } from './quiz/QuizStatisticsPanel.js';
import { CHARACTERS } from './characters.js';
import {
  IT_CHALLENGE_DURATION_MS,IT_CHALLENGE_FEEDBACK_DELAY_MS,IT_CHALLENGE_POINTS,
  IT_CHALLENGE_QUESTION_TIMEOUT_MS,IT_CHALLENGE_RULES_VERSION,IT_CHALLENGE_VARIANT,
} from './quiz/itChallengeRules.js';

export const SOLO_STUDY_PROMPT=Object.freeze({text:'[E] Study',offsetX:0,offsetY:-70});

function clockText(milliseconds){
  const seconds=Math.ceil(Math.max(0,milliseconds)/1000);
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}

export class SoloStudyController {
  constructor(scene,presence,seats) {
    Object.assign(this,{
      scene,presence,seats,active:false,pending:false,session:null,options:DEFAULT_QUIZ_OPTIONS,
      settings:{category:null,topic:null,difficulty:null,count:5},mode:'study',completionResult:null,
      runId:null,statisticsPending:Promise.resolve(),finishingChallenge:false,newPersonalBest:false,
      personalBestScore:null,leaderboardOpen:false,leaderboardFromMap:false,terminalChallengeListeners:new Set(),
    });
    this.root=document.getElementById('solo-study');this.title=document.getElementById('solo-study-title');
    this.configRoot=document.getElementById('solo-config');this.configTitle=document.getElementById('solo-config-title');
    this.modeSelect=document.getElementById('solo-mode');this.modeDescription=document.getElementById('solo-mode-description');
    this.settingFields=document.getElementById('solo-setting-fields');this.challengeIntro=document.getElementById('it-challenge-intro');
    this.confirmToggle=document.getElementById('it-challenge-confirm-toggle');
    this.challengeIntro.querySelector('h3').textContent=`${IT_CHALLENGE_VARIANT} IT Challenge`;
    this.challengeIntro.querySelector('ul').replaceChildren(...[
      `Medium correct: +${IT_CHALLENGE_POINTS.mediumCorrect}`,
      `Hard correct: +${IT_CHALLENGE_POINTS.hardCorrect}`,
      `Wrong answer: ${IT_CHALLENGE_POINTS.wrong}`,
      `Skip: ${IT_CHALLENGE_POINTS.skip}`,
    ].map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));
    this.challengeIntro.querySelector('p').textContent=`You have ${IT_CHALLENGE_DURATION_MS/60_000} minutes. Each question has a ${IT_CHALLENGE_QUESTION_TIMEOUT_MS/1000}-second limit. Get the highest score possible.`;
    this.categorySelect=document.getElementById('solo-category');
    this.topicField=document.getElementById('solo-topic-field');this.topicSelect=document.getElementById('solo-topic');
    this.difficultySelect=document.getElementById('solo-difficulty');this.quantitySelect=document.getElementById('solo-quantity');
    this.questionRoot=document.getElementById('solo-question');this.progress=document.getElementById('solo-progress');
    this.score=document.getElementById('solo-score');this.questionText=document.getElementById('solo-question-text');
    this.media=document.getElementById('solo-media');this.alternatives=document.getElementById('solo-alternatives');
    this.feedback=document.getElementById('solo-feedback');this.explanation=document.getElementById('solo-explanation');
    this.results=document.getElementById('solo-results');this.resultsTitle=document.getElementById('solo-results-title');
    this.resultScore=document.getElementById('solo-result-score');this.resultText=document.getElementById('solo-result-text');
    this.assessment=document.getElementById('solo-assessment');this.personalBest=document.getElementById('it-challenge-personal-best');
    this.status=document.getElementById('solo-status');this.startButton=document.getElementById('start-solo-study');
    this.statisticsButton=document.getElementById('open-quiz-statistics');this.confirmButton=document.getElementById('confirm-solo-answer');
    this.skipButton=document.getElementById('skip-it-challenge');this.nextButton=document.getElementById('next-solo-question');
    this.timerRoot=document.getElementById('solo-challenge-timer');this.timerTrack=document.getElementById('solo-timer-track');
    this.timerBar=document.getElementById('solo-timer-bar');this.timerLabel=document.getElementById('solo-timer-label');
    this.globalTimerRoot=document.getElementById('it-challenge-global-timer');
    this.globalTimerTrack=document.getElementById('it-challenge-global-track');
    this.globalTimerBar=document.getElementById('it-challenge-global-bar');
    this.globalTimerLabel=document.getElementById('it-challenge-global-label');
    this.againButton=document.getElementById('study-again');this.closeButton=document.getElementById('close-solo-study');
    this.openLeaderboardButton=document.getElementById('open-it-challenge-leaderboard');
    this.resultsLeaderboardButton=document.getElementById('results-it-challenge-leaderboard');
    this.leaderboardRoot=document.getElementById('it-challenge-leaderboard');
    this.leaderboardList=document.getElementById('it-challenge-leaderboard-list');
    this.leaderboardStatus=document.getElementById('it-challenge-leaderboard-status');
    this.closeLeaderboardButton=document.getElementById('close-it-challenge-leaderboard');
    this.calculator=new CalculatorWidget({mount:this.questionRoot,scene});
    this.statistics=new QuizStatisticsPanel({presence,onClose:()=>this.render()});
    this.seatPrompt=scene.add.text(0,0,SOLO_STUDY_PROMPT.text,{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#315b9c',padding:{x:6,y:3},
    }).setOrigin(0.5,1).setDepth(100000).setVisible(false);

    this.onStart=()=>void this.start();this.onConfirm=()=>this.confirm();this.onSkip=()=>this.skipChallenge();
    this.onNext=()=>void this.next();this.onAgain=()=>this.playAgain();this.onClose=()=>this.closePanel();
    this.onStatistics=()=>void this.statistics.open();this.onLeaderboard=()=>void this.openLeaderboard();
    this.onCloseLeaderboard=()=>this.closeLeaderboard();
    this.onSettingsChange=()=>{this.settings=readQuizSettingsControls(this,this.options);this.render();};
    this.onModeChange=()=>{this.mode=this.modeSelect.value;this.completionResult=null;this.render();};
    this.onAlternative=event=>{
      const button=event.target.closest('button[data-answer-index]');
      if(!button||!this.alternatives.contains(button)||!this.session?.select(Number(button.dataset.answerIndex)))return;
      this.renderQuestion();
      if(this.session.mode==='challenge'&&!this.confirmToggle.checked)this.confirm();
    };
    this.startButton.addEventListener('click',this.onStart);this.modeSelect.addEventListener('change',this.onModeChange);
    this.statisticsButton.addEventListener('click',this.onStatistics);this.skipButton.addEventListener('click',this.onSkip);
    this.openLeaderboardButton.addEventListener('click',this.onLeaderboard);
    this.resultsLeaderboardButton.addEventListener('click',this.onLeaderboard);
    this.closeLeaderboardButton.addEventListener('click',this.onCloseLeaderboard);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.addEventListener('change',this.onSettingsChange);
    this.confirmButton.addEventListener('click',this.onConfirm);this.nextButton.addEventListener('click',this.onNext);
    this.againButton.addEventListener('click',this.onAgain);this.closeButton.addEventListener('click',this.onClose);
    this.alternatives.addEventListener('click',this.onAlternative);
    this.timerInterval=setInterval(()=>this.updateChallengeClock(),100);
  }

  nearbySeat(){return nearbySoloStudySeat(this.seats,this.scene.player.body);}

  updateSeatPrompt(seat) {
    const visible=Boolean(seat&&!this.active&&!this.pending);this.seatPrompt.setVisible(visible);
    if(visible)this.seatPrompt.setPosition(
      Math.round(seat.seatX+SOLO_STUDY_PROMPT.offsetX),Math.round(seat.seatY+SOLO_STUDY_PROMPT.offsetY),
    );
  }

  async open(seat=this.nearbySeat()) {
    if(!seat||this.active||this.pending)return;
    this.active=true;this.seat=seat;this.returnPosition={x:this.scene.player.x,y:this.scene.player.y};
    this.scene.player.body.reset(seat.seatX,seat.seatY);
    if(this.scene.player.setFacing)this.scene.player.setFacing(seat.direction,false);
    else{this.scene.player.facing=seat.direction;this.scene.player.setFlipX(seat.direction==='left');}
    this.scene.player.setVelocity(0,0);
    this.statistics.close();this.resetRun();this.root.hidden=false;
    this.status.textContent='Loading solo settings…';this.render();
    try{
      await this.loadStudyOptions();
      this.status.textContent='Choose a solo mode.';
    }catch{this.status.textContent='Could not load solo settings.';}
    this.render();
  }

  resetRun(){
    this.session=null;this.runId=null;this.completionResult=null;this.newPersonalBest=false;
    this.personalBestScore=null;this.finishingChallenge=false;this.statisticsPending=Promise.resolve();this.leaderboardOpen=false;
    this.leaderboardFromMap=false;
  }

  async loadStudyOptions() {
    this.options=await this.presence.client.query(this.presence.api.soloStudy.options,{});
    return this.options;
  }

  async startStudyFromTerminal(settings) {
    if(this.pending)return this.terminalStudyState();
    await this.statisticsPending;
    this.resetRun();this.mode='study';this.pending=true;
    this.status.textContent='Preparing questions…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.soloStudy.start,{
        characterId,sessionId,mode:'study',...settings,
      });
      this.settings=result.settings;this.session=createSoloSession('study',result.questions);this.runId=result.runId;
      this.status.textContent='';
    }catch(error){
      this.status.textContent=String(error).includes('No questions')
        ?'No questions are available for these settings.'
        :'Could not start Study Mode.';
    }finally{this.pending=false;this.render();}
    return this.terminalStudyState();
  }

  selectStudyAnswerFromTerminal(answerIndex) {
    if(this.session?.mode==='study'&&this.session.select(answerIndex))this.renderQuestion();
    return this.terminalStudyState();
  }

  confirmStudyAnswerFromTerminal() {
    if(this.session?.mode==='study')this.confirm();
    return this.terminalStudyState();
  }

  async nextStudyQuestionFromTerminal() {
    if(this.session?.mode==='study')await this.next();
    return this.terminalStudyState();
  }

  async endStudyFromTerminal() {
    await this.statisticsPending;
    this.resetRun();this.mode='study';this.status.textContent='';this.render();
    return this.terminalStudyState();
  }

  terminalStudyState() {
    const question=this.session?.mode==='study'?this.session.question:null;
    const confirmed=this.session?.confirmedAnswer!==null&&this.session?.confirmedAnswer!==undefined;
    return {
      phase:this.session?.complete?'result':question?'question':'setup',
      pending:this.pending,
      status:this.status?.textContent??'',
      options:this.options,
      settings:this.settings,
      ...(question?{
        progress:this.session.progress,
        question:{
          id:question.id,category:question.category,topic:question.topic??null,
          difficulty:question.difficulty,question:question.question,answers:question.answers,
          media:question.media??null,correctAnswer:confirmed?question.correctAnswer:null,
          explanation:confirmed&&this.session.explanationVisible?question.explanation??'':'',
        },
        selectedAnswer:this.session.selectedAnswer,
        confirmedAnswer:confirmed?this.session.confirmedAnswer:null,
      }:{}),
      ...(this.session?.complete?{result:this.session.result()}:{}),
    };
  }

  async startChallengeFromTerminal() {
    if(this.pending)return this.terminalChallengeState();
    await this.statisticsPending;
    this.resetRun();this.mode='challenge';this.pending=true;
    this.status.textContent='Preparing challenge…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.itChallenge.start,{characterId,sessionId});
      this.session=createSoloSession('challenge',result.questions);this.runId=result.runId;
      this.status.textContent='';
    }catch(error){
      this.status.textContent=String(error).includes('No IT Challenge questions')
        ?'No IT Challenge questions are available.'
        :'Could not start IT Challenge.';
    }finally{this.pending=false;this.render();}
    return this.terminalChallengeState();
  }

  selectChallengeAnswerFromTerminal(answerIndex,{submitImmediately=false}={}) {
    if(this.session?.mode!=='challenge'||!this.session.select(answerIndex))return this.terminalChallengeState();
    if(submitImmediately)this.confirm();
    else this.renderQuestion();
    return this.terminalChallengeState();
  }

  confirmChallengeAnswerFromTerminal() {
    if(this.session?.mode==='challenge')this.confirm();
    return this.terminalChallengeState();
  }

  skipChallengeFromTerminal() {
    if(this.session?.mode==='challenge')this.skipChallenge();
    return this.terminalChallengeState();
  }

  async endChallengeFromTerminal() {
    this.resetRun();this.mode='study';this.status.textContent='';this.render();
    return this.terminalChallengeState();
  }

  terminalChallengeState(now=Date.now()) {
    const challenge=this.session?.mode==='challenge'?this.session:null;
    const question=challenge&&!challenge.complete?challenge.question:null;
    const confirmed=challenge?.confirmedAnswer!==null&&challenge?.confirmedAnswer!==undefined;
    const lastOutcome=challenge?.outcomes.at(-1);
    const feedback=challenge?.resolving&&lastOutcome?.type==='answer'?{
      type:'answer',correct:lastOutcome.correct,points:lastOutcome.points,
    }:null;
    return {
      phase:challenge?.complete?'result':question?'question':'intro',
      pending:this.pending,saving:this.finishingChallenge,status:this.status?.textContent??'',
      rules:{
        durationMs:IT_CHALLENGE_DURATION_MS,questionTimeoutMs:IT_CHALLENGE_QUESTION_TIMEOUT_MS,
        feedbackDelayMs:IT_CHALLENGE_FEEDBACK_DELAY_MS,points:IT_CHALLENGE_POINTS,
        rulesVersion:IT_CHALLENGE_RULES_VERSION,variant:IT_CHALLENGE_VARIANT,
      },
      ...(question?{
        progress:challenge.progress,score:challenge.score,
        timers:{
          remainingMs:challenge.remainingMs(now),questionRemainingMs:challenge.questionRemainingMs(now),
          totalRatio:challenge.totalTimeRatio(now),questionRatio:challenge.questionTimeRatio(now),
        },
        resolving:challenge.resolving,feedback,
        question:{
          id:question.id,category:question.category,topic:question.topic??null,
          difficulty:question.difficulty,question:question.question,answers:question.answers,
          media:question.media??null,correctAnswer:confirmed?question.correctAnswer:null,
        },
        selectedAnswer:challenge.selectedAnswer,
        confirmedAnswer:confirmed?challenge.confirmedAnswer:null,
      }:{}),
      ...(challenge?.complete?{
        result:this.completionResult??challenge.result(),newPersonalBest:this.newPersonalBest,
        personalBest:this.personalBestScore,
      }:{}),
    };
  }

  subscribeTerminalChallenge(listener){
    this.terminalChallengeListeners.add(listener);
    return ()=>this.terminalChallengeListeners.delete(listener);
  }

  notifyTerminalChallenge(now=Date.now()){
    if(!this.terminalChallengeListeners.size)return;
    const state=this.terminalChallengeState(now);
    for(const listener of this.terminalChallengeListeners){try{listener(state);}catch{}}
  }

  async start() {
    if(this.pending)return;
    this.mode=this.modeSelect.value;this.pending=true;this.status.textContent='Preparing questions…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      if(this.mode==='challenge'){
        const result=await this.presence.client.mutation(this.presence.api.itChallenge.start,{characterId,sessionId});
        this.session=createSoloSession('challenge',result.questions);this.runId=result.runId;
      }else{
        const settings=readQuizSettingsControls(this,this.options);this.settings=settings;
        const result=await this.presence.client.mutation(this.presence.api.soloStudy.start,{
          characterId,sessionId,mode:'study',...settings,
        });
        this.session=createSoloSession('study',result.questions);this.runId=result.runId;
      }
      this.completionResult=null;this.newPersonalBest=false;this.status.textContent='';this.render();
    }catch(error){
      this.status.textContent=String(error).includes('No questions')?'No questions are available for this mode.':'Could not start Solo Mode.';
    }finally{this.pending=false;this.render();}
  }

  confirm() {
    const result=this.session?.confirm();
    if(!result){this.status.textContent='Select an answer first.';return null;}
    if(result.type==='complete'){this.finishChallenge();return result;}
    if(result.type==='timeoutSkip'){
      this.status.textContent='Question timed out. Skipped (-3).';this.markChallengeQuestionViewed();
      if(this.session.complete)this.finishChallenge();this.render();return result;
    }
    this.status.textContent=result.correct?'Correct.':'Incorrect.';this.renderQuestion();
    if(this.session.mode==='study')this.recordCurrentAnswer(result);
    return result;
  }

  skipChallenge(){
    if(this.session?.mode!=='challenge')return;
    const previous=this.session.index,result=this.session.skip('manualSkip');
    if(!result)return;
    if(result.type==='complete'){this.finishChallenge();this.render();return;}
    this.status.textContent='Skipped (-3).';
    if(this.session.index!==previous)this.markChallengeQuestionViewed();
    if(this.session.complete)this.finishChallenge();
    this.render();
  }

  async next() {
    if(this.session?.mode!=='study')return;
    await this.statisticsPending;
    if(!this.session?.next())return;
    if(!this.session.complete){
      const {characterId,sessionId}=this.presence.identity;
      this.presence.client.mutation(this.presence.api.soloStudy.markViewed,{
        characterId,sessionId,questionId:this.session.question.id,
      }).catch(()=>{this.status.textContent='Progress continues, but recent-question history could not be updated.';this.render();});
    }
    this.status.textContent='';this.render();
  }

  markChallengeQuestionViewed(){
    if(!this.session?.question)return;
    const {characterId,sessionId}=this.presence.identity;
    this.presence.client.mutation(this.presence.api.soloStudy.markViewed,{
      characterId,sessionId,questionId:this.session.question.id,
    }).catch(()=>{});
  }

  recordCurrentAnswer(result){
    if(!this.runId||this.session?.mode!=='study')return;
    const {characterId,sessionId}=this.presence.identity;
    this.statisticsPending=this.presence.client.mutation(this.presence.api.quizStatistics.recordSoloAnswer,{
      characterId,sessionId,runId:this.runId,questionIndex:this.session.index,
      ...(result.answerIndex===null?{}:{answerIndex:result.answerIndex}),
    }).catch(()=>{this.status.textContent='Answer saved locally, but statistics could not be updated.';this.render();});
  }

  updateChallengeClock(now=Date.now()){
    if(this.session?.mode!=='challenge')return;
    if(this.session.complete){this.notifyTerminalChallenge(now);return;}
    const previous=this.session.index,event=this.session.tick(now);
    this.paintChallengeTimers(now);
    if(!event){this.notifyTerminalChallenge(now);return;}
    if(this.session.index!==previous)this.markChallengeQuestionViewed();
    if(event.type==='timeoutSkip')this.status.textContent='Question timed out. Skipped (-3).';
    else if(event.type==='advanced')this.status.textContent='';
    if(this.session.complete)this.finishChallenge();
    this.render();
    this.notifyTerminalChallenge(now);
  }

  paintChallengeTimers(now=Date.now()){
    const running=this.session?.mode==='challenge'&&!this.session.complete;
    this.globalTimerRoot.hidden=!running;this.timerRoot.hidden=!running||this.session.resolving;if(!running)return;
    const total=this.session.remainingMs(now),question=this.session.questionRemainingMs(now);
    this.globalTimerBar.style.transform=`scaleX(${this.session.totalTimeRatio(now)})`;
    this.globalTimerLabel.textContent=clockText(total);
    this.globalTimerRoot.classList.toggle('urgent',total<=30_000);
    this.globalTimerTrack.setAttribute('aria-valuenow',String(Math.ceil(total/1000)));
    this.globalTimerTrack.setAttribute('aria-valuemax',String(this.session.durationMs/1000));
    this.timerBar.style.transform=`scaleX(${this.session.questionTimeRatio(now)})`;
    this.timerLabel.textContent=`${Math.ceil(question/1000)}s`;
    this.timerRoot.classList.toggle('urgent',question<=10_000);
    this.timerTrack.setAttribute('aria-valuemax',String(this.session.questionTimeoutMs/1000));
    this.timerTrack.setAttribute('aria-valuenow',String(Math.ceil(question/1000)));
  }

  async finishChallenge(){
    if(this.finishingChallenge||!this.runId||this.session?.mode!=='challenge')return;
    this.finishingChallenge=true;this.status.textContent='Saving result…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const response=await this.presence.client.mutation(this.presence.api.itChallenge.finish,{
        characterId,sessionId,runId:this.runId,outcomes:this.session.submission(),
        lastViewedQuestionIndex:this.session.index,
      });
      this.completionResult=response.result;this.newPersonalBest=response.newPersonalBest;
      this.personalBestScore=response.personalBest?.score??null;
      this.status.textContent='Result saved.';
    }catch{
      this.status.textContent='Challenge finished, but the result could not be saved.';
    }finally{this.finishingChallenge=false;this.render();this.notifyTerminalChallenge();}
  }

  playAgain(){this.resetRun();this.status.textContent='Choose a solo mode.';this.render();}

  async openLeaderboard(fromMap=false){
    this.leaderboardFromMap=fromMap;this.leaderboardOpen=true;
    this.leaderboardStatus.textContent='Loading leaderboard…';this.render();
    try{
      const rows=await this.presence.client.query(this.presence.api.itChallenge.leaderboard,{});
      const byId=new Map(CHARACTERS.map(character=>[character.id,character.name]));
      this.leaderboardList.replaceChildren(...rows.map(row=>{
        const item=document.createElement('li');
        item.textContent=`${byId.get(row.characterId)??row.characterId} — ${row.score}`;
        item.title=`Correct ${row.correct}, wrong ${row.wrong}, skipped ${row.skipped}, accuracy ${row.accuracy}%`;
        return item;
      }));
      this.leaderboardStatus.textContent=rows.length?'Best score for each character under the current 5-minute rules.':'No completed challenges yet.';
    }catch{this.leaderboardStatus.textContent='Could not load the leaderboard.';}
  }

  openLeaderboardFromMap(){
    if(this.active||this.pending)return;
    this.active=true;this.seat=null;this.returnPosition={x:this.scene.player.x,y:this.scene.player.y};
    this.scene.player.setVelocity(0,0);this.statistics.close();this.resetRun();this.root.hidden=false;
    void this.openLeaderboard(true);
  }

  closeLeaderboard(){
    if(this.leaderboardFromMap){this.closePanel();return;}
    this.leaderboardOpen=false;this.render();
  }

  closePanel() {
    if(!this.active)return;
    this.calculator.close({reset:true});this.statistics.close();this.active=false;this.resetRun();
    this.root.hidden=true;this.seatPrompt.setVisible(false);
    if(this.returnPosition)this.scene.player.body.reset(this.returnPosition.x,this.returnPosition.y);
    this.scene.input.keyboard.resetKeys();document.getElementById('game').focus({preventScroll:true});
  }

  renderQuestion() {
    const question=this.session?.question;this.questionRoot.hidden=!question||this.session.complete;this.results.hidden=true;
    if(!question||this.session.complete){renderQuizMedia(this.media,null);return;}
    const challenge=this.session.mode==='challenge';const {current,total}=this.session.progress;
    this.progress.textContent=challenge?`Question ${current}`:`Question: ${current} / ${total}`;
    this.score.hidden=!challenge;this.score.textContent=`Score: ${this.session.score??0}`;
    this.questionText.textContent=question.question;renderQuizMedia(this.media,question.media);
    this.alternatives.replaceChildren(...question.answers.map((answer,index)=>{
      const button=document.createElement('button');button.type='button';button.dataset.answerIndex=String(index);
      button.textContent=`${index+1}. ${answer}`;const confirmed=this.session.confirmedAnswer!==null;
      button.classList.toggle('selected',!confirmed&&index===this.session.selectedAnswer);
      button.classList.toggle('correct',confirmed&&index===question.correctAnswer);
      button.classList.toggle('incorrect',confirmed&&index===this.session.confirmedAnswer&&index!==question.correctAnswer);
      button.disabled=confirmed||this.session.resolving;button.setAttribute('aria-pressed',String(index===this.session.selectedAnswer));return button;
    }));
    const confirmed=this.session.confirmedAnswer!==null;
    this.feedback.hidden=!confirmed;this.feedback.textContent=confirmed
      ?(this.session.confirmedAnswer===question.correctAnswer?'Correct':'Incorrect'):'';
    this.explanation.hidden=challenge||!this.session.explanationVisible;
    this.explanation.textContent=!challenge&&this.session.explanationVisible?question.explanation:'';
    this.confirmButton.hidden=confirmed||(challenge&&!this.confirmToggle.checked);
    this.confirmButton.disabled=this.session.selectedAnswer===null||this.session.resolving;
    this.skipButton.hidden=!challenge;this.skipButton.disabled=this.session.resolving;
    this.nextButton.hidden=challenge||!confirmed;this.nextButton.textContent=current===total?'View results':'Next question';
    this.paintChallengeTimers();
  }

  renderResults() {
    const complete=Boolean(this.session?.complete);this.results.hidden=!complete;if(!complete)return;
    const local=this.session.result(),challenge=this.session.mode==='challenge';
    const result=challenge?(this.completionResult??local):local;
    this.resultsTitle.textContent=challenge?'IT Challenge complete':'Study complete';
    this.resultScore.hidden=!challenge;this.resultScore.textContent=challenge?`Score: ${result.score}`:'';
    this.resultText.textContent=challenge
      ?`Correct: ${result.correct}\nWrong: ${result.wrong}\nSkipped: ${result.skipped}\nMedium correct: ${result.mediumCorrect}\nHard correct: ${result.hardCorrect}\nTotal answered: ${result.totalAnswered}\nAccuracy: ${result.accuracy}%`
      :`Correct: ${result.correct} / ${result.total} · Accuracy: ${result.accuracy}%`;
    this.assessment.hidden=!challenge;this.assessment.textContent=challenge?result.assessment??local.assessment:'';
    this.personalBest.hidden=!challenge||!this.newPersonalBest;
    this.againButton.textContent=challenge?'Challenge again':'Study again';
    this.resultsLeaderboardButton.hidden=!challenge;
  }

  renderMode() {
    const mode=SOLO_MODES.find(item=>item.id===this.mode)??SOLO_MODES[0];const challenge=mode.id==='challenge';
    this.modeSelect.value=mode.id;this.modeDescription.textContent=mode.description;
    this.title.textContent=this.session?.mode==='challenge'?'IT CHALLENGE':this.session?.mode==='study'?'SOLO STUDY':'SOLO MODE';
    this.configTitle.textContent=challenge?`${IT_CHALLENGE_VARIANT} IT Challenge`:'Study settings';
    this.settingFields.hidden=challenge;this.challengeIntro.hidden=!challenge;
    this.startButton.textContent=challenge?'START':'Start studying';this.modeSelect.disabled=this.pending;
  }

  render() {
    if(!this.active){this.root.hidden=true;return;}
    this.root.hidden=false;
    this.leaderboardRoot.hidden=!this.leaderboardOpen;
    this.configRoot.hidden=Boolean(this.session)||this.statistics.openState||this.leaderboardOpen;
    this.questionRoot.hidden=true;this.results.hidden=true;
    if(this.leaderboardOpen)return;
    this.renderMode();
    if(!this.session){renderQuizSettingsControls(this,this.options,this.settings,!this.pending);this.settingFields.hidden=this.mode==='challenge';}
    this.startButton.disabled=this.pending;
    if(this.session?.complete){renderQuizMedia(this.media,null);this.renderResults();}
    else this.renderQuestion();
  }

  close() {
    this.closePanel();this.calculator.destroy();this.statistics.destroy();clearInterval(this.timerInterval);
    this.startButton.removeEventListener('click',this.onStart);this.statisticsButton.removeEventListener('click',this.onStatistics);
    this.modeSelect.removeEventListener('change',this.onModeChange);this.confirmButton.removeEventListener('click',this.onConfirm);
    this.skipButton.removeEventListener('click',this.onSkip);this.openLeaderboardButton.removeEventListener('click',this.onLeaderboard);
    this.resultsLeaderboardButton.removeEventListener('click',this.onLeaderboard);
    this.closeLeaderboardButton.removeEventListener('click',this.onCloseLeaderboard);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.removeEventListener('change',this.onSettingsChange);
    this.nextButton.removeEventListener('click',this.onNext);this.againButton.removeEventListener('click',this.onAgain);
    this.closeButton.removeEventListener('click',this.onClose);this.alternatives.removeEventListener('click',this.onAlternative);
    this.seatPrompt.destroy();
  }
}
