import { renderQuizMedia } from './QuizMedia.js';
import { renderQuizSettingsControls,readQuizSettingsControls,DEFAULT_QUIZ_OPTIONS } from './quiz/QuizSettingsControls.js';
import { createSoloSession,SOLO_MODES } from './quiz/soloModes.js';
import { nearbySoloStudySeat } from './maps/soloStudySeats.js';

export const SOLO_STUDY_PROMPT=Object.freeze({text:'[E] Study',offsetX:0,offsetY:-70});

export class SoloStudyController {
  constructor(scene,presence,seats) {
    Object.assign(this,{
      scene,presence,seats,active:false,pending:false,session:null,options:DEFAULT_QUIZ_OPTIONS,
      settings:{category:null,topic:null,difficulty:null,count:5},mode:'study',completionResult:null,
    });
    this.root=document.getElementById('solo-study');this.title=document.getElementById('solo-study-title');
    this.configRoot=document.getElementById('solo-config');this.configTitle=document.getElementById('solo-config-title');
    this.modeSelect=document.getElementById('solo-mode');this.modeDescription=document.getElementById('solo-mode-description');
    this.categorySelect=document.getElementById('solo-category');
    this.topicField=document.getElementById('solo-topic-field');this.topicSelect=document.getElementById('solo-topic');
    this.difficultySelect=document.getElementById('solo-difficulty');
    this.quantitySelect=document.getElementById('solo-quantity');this.questionRoot=document.getElementById('solo-question');
    this.progress=document.getElementById('solo-progress');this.score=document.getElementById('solo-score');
    this.questionText=document.getElementById('solo-question-text');this.media=document.getElementById('solo-media');
    this.alternatives=document.getElementById('solo-alternatives');this.feedback=document.getElementById('solo-feedback');
    this.explanation=document.getElementById('solo-explanation');this.results=document.getElementById('solo-results');
    this.resultsTitle=document.getElementById('solo-results-title');this.resultScore=document.getElementById('solo-result-score');
    this.resultText=document.getElementById('solo-result-text');this.assessment=document.getElementById('solo-assessment');
    this.status=document.getElementById('solo-status');this.startButton=document.getElementById('start-solo-study');
    this.confirmButton=document.getElementById('confirm-solo-answer');this.nextButton=document.getElementById('next-solo-question');
    this.timerRoot=document.getElementById('solo-challenge-timer');this.timerTrack=document.getElementById('solo-timer-track');
    this.timerBar=document.getElementById('solo-timer-bar');this.timerLabel=document.getElementById('solo-timer-label');
    this.againButton=document.getElementById('study-again');this.closeButton=document.getElementById('close-solo-study');
    this.seatPrompt=scene.add.text(0,0,SOLO_STUDY_PROMPT.text,{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#315b9c',padding:{x:6,y:3},
    }).setOrigin(0.5,1).setDepth(100000).setVisible(false);

    this.onStart=()=>this.start();this.onConfirm=()=>this.confirm();this.onNext=()=>this.next();
    this.onAgain=()=>this.playAgain();this.onClose=()=>this.closePanel();
    this.onSettingsChange=()=>{this.settings=readQuizSettingsControls(this,this.options);this.render();};
    this.onModeChange=()=>{this.mode=this.modeSelect.value;this.completionResult=null;this.renderMode();};
    this.onAlternative=event=>{
      const button=event.target.closest('button[data-answer-index]');
      if(button&&this.alternatives.contains(button)&&this.session?.select(Number(button.dataset.answerIndex)))this.renderQuestion();
    };
    this.startButton.addEventListener('click',this.onStart);this.modeSelect.addEventListener('change',this.onModeChange);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.addEventListener('change',this.onSettingsChange);
    this.confirmButton.addEventListener('click',this.onConfirm);this.nextButton.addEventListener('click',this.onNext);
    this.againButton.addEventListener('click',this.onAgain);this.closeButton.addEventListener('click',this.onClose);
    this.alternatives.addEventListener('click',this.onAlternative);
    this.timerInterval=setInterval(()=>this.updateChallengeTimer(),100);
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
    this.scene.player.body.reset(seat.seatX,seat.seatY);this.scene.player.facing=seat.direction;
    this.scene.player.setFlipX(seat.direction==='left');this.scene.player.setVelocity(0,0);
    this.root.hidden=false;this.session=null;this.completionResult=null;this.status.textContent='Loading solo settings…';this.render();
    try{
      this.options=await this.presence.client.query(this.presence.api.soloStudy.options,{});
      this.status.textContent='Choose a mode and what you want to practice.';
    }catch{this.status.textContent='Could not load solo settings.';}
    this.render();
  }

  async start() {
    if(this.pending)return;
    const settings=readQuizSettingsControls(this,this.options);this.settings=settings;this.mode=this.modeSelect.value;
    this.pending=true;this.status.textContent='Preparing questions…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.soloStudy.start,{characterId,sessionId,...settings});
      this.session=createSoloSession(this.mode,result.questions);this.completionResult=null;this.status.textContent='';this.render();
    }catch(error){
      this.status.textContent=String(error).includes('No questions match')?'No questions match these settings.':'Could not start Solo Mode.';
    }finally{this.pending=false;this.render();}
  }

  confirm() {
    const result=this.session?.confirm();
    if(!result){this.status.textContent='Select an answer first.';return;}
    this.status.textContent=result.timedOut?'Time is up.':result.correct?'Correct.':'Incorrect.';this.renderQuestion();
  }

  async next() {
    if(!this.session?.next())return;
    if(!this.session.complete){
      const {characterId,sessionId}=this.presence.identity;
      this.presence.client.mutation(this.presence.api.soloStudy.markViewed,{
        characterId,sessionId,questionId:this.session.question.id,
      }).catch(()=>{this.status.textContent='Progress continues, but recent-question history could not be updated.';this.render();});
    }
    this.status.textContent='';this.render();
  }

  playAgain(){this.session=null;this.completionResult=null;this.status.textContent='Choose a mode and what you want to practice.';this.render();}

  closePanel() {
    if(!this.active)return;
    this.active=false;this.session=null;this.completionResult=null;this.root.hidden=true;this.seatPrompt.setVisible(false);
    if(this.returnPosition)this.scene.player.body.reset(this.returnPosition.x,this.returnPosition.y);
    this.scene.input.keyboard.resetKeys();document.getElementById('game').focus({preventScroll:true});
  }

  renderQuestion() {
    const question=this.session?.question;this.questionRoot.hidden=!question;this.results.hidden=true;
    if(!question){renderQuizMedia(this.media,null);return;}
    const {current,total}=this.session.progress;this.progress.textContent=`Question: ${current} / ${total}`;
    this.score.hidden=this.session.mode!=='challenge';this.score.textContent=`Score: ${this.session.score??0}`;
    this.questionText.textContent=question.question;renderQuizMedia(this.media,question.media);
    this.alternatives.replaceChildren(...question.answers.map((answer,index)=>{
      const button=document.createElement('button');button.type='button';button.dataset.answerIndex=String(index);
      button.textContent=`${index+1}. ${answer}`;const confirmed=this.session.confirmedAnswer!==null;
      button.classList.toggle('selected',!confirmed&&index===this.session.selectedAnswer);
      button.classList.toggle('correct',confirmed&&index===question.correctAnswer);
      button.classList.toggle('incorrect',confirmed&&index===this.session.confirmedAnswer&&index!==question.correctAnswer);
      button.disabled=confirmed;button.setAttribute('aria-pressed',String(index===this.session.selectedAnswer));return button;
    }));
    const confirmed=this.session.confirmedAnswer!==null;
    this.feedback.hidden=!confirmed;this.feedback.textContent=confirmed
      ?(this.session.confirmedAnswer===question.correctAnswer?'Correct':'Incorrect'):'';
    this.explanation.hidden=!this.session.explanationVisible;
    this.explanation.textContent=this.session.explanationVisible?question.explanation:'';
    this.confirmButton.hidden=confirmed;this.confirmButton.disabled=this.session.selectedAnswer===null;
    this.nextButton.hidden=!confirmed;this.nextButton.textContent=current===total?'View results':'Next question';
    this.updateChallengeTimer();
  }

  updateChallengeTimer(now=Date.now()) {
    const running=this.session?.mode==='challenge'&&this.session.question&&this.session.confirmedAnswer===null;
    this.timerRoot.hidden=!running;if(!running)return;
    const remaining=this.session.remainingMs(now),seconds=Math.ceil(remaining/1000),ratio=this.session.timeRatio(now);
    this.timerBar.style.transform=`scaleX(${ratio})`;this.timerLabel.textContent=`${seconds}s`;
    this.timerRoot.classList.toggle('urgent',seconds<=10);
    this.timerTrack.setAttribute('aria-valuemax',String(this.session.questionDurationMs/1000));
    this.timerTrack.setAttribute('aria-valuenow',String(seconds));
    if(remaining===0&&this.session.expire(now)){
      this.status.textContent='Time is up.';this.renderQuestion();
    }
  }

  renderResults() {
    const complete=Boolean(this.session?.complete);this.results.hidden=!complete;if(!complete)return;
    const result=this.session.result(),challenge=this.session.mode==='challenge';
    this.resultsTitle.textContent=challenge?'Challenge complete':'Study complete';
    this.resultScore.hidden=!challenge;this.resultScore.textContent=challenge?`Score: ${result.score}`:'';
    this.resultText.textContent=`Correct: ${result.correct} / ${result.total} · Accuracy: ${result.accuracy}%`;
    this.assessment.hidden=!challenge;this.assessment.textContent=challenge?result.assessment:'';
    this.againButton.textContent=challenge?'Challenge again':'Study again';
    if(challenge&&!this.completionResult)this.completionResult=this.session.completionRecord({
      characterId:this.presence.identity.characterId,category:this.settings.category,
      topic:this.settings.topic,difficulty:this.settings.difficulty,completedAt:Date.now(),
    });
  }

  renderMode() {
    const mode=SOLO_MODES.find(item=>item.id===this.mode)??SOLO_MODES[0];
    this.modeSelect.value=mode.id;this.modeDescription.textContent=mode.description;
    this.title.textContent=this.session?.mode==='challenge'?'SOLO CHALLENGE':this.session?.mode==='study'?'SOLO STUDY':'SOLO MODE';
    this.configTitle.textContent=mode.id==='challenge'?'Challenge settings':'Study settings';
    this.startButton.textContent=mode.id==='challenge'?'Start challenge':'Start studying';this.modeSelect.disabled=this.pending;
  }

  render() {
    if(!this.active){this.root.hidden=true;return;}
    this.root.hidden=false;const configuring=!this.session;this.configRoot.hidden=!configuring;this.renderMode();
    if(configuring)renderQuizSettingsControls(this,this.options,this.settings,!this.pending);
    this.startButton.disabled=this.pending;
    if(this.session?.complete){this.questionRoot.hidden=true;renderQuizMedia(this.media,null);this.renderResults();}
    else this.renderQuestion();
  }

  close() {
    this.closePanel();clearInterval(this.timerInterval);this.startButton.removeEventListener('click',this.onStart);
    this.modeSelect.removeEventListener('change',this.onModeChange);this.confirmButton.removeEventListener('click',this.onConfirm);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.removeEventListener('change',this.onSettingsChange);
    this.nextButton.removeEventListener('click',this.onNext);this.againButton.removeEventListener('click',this.onAgain);
    this.closeButton.removeEventListener('click',this.onClose);this.alternatives.removeEventListener('click',this.onAlternative);
    this.seatPrompt.destroy();
  }
}
