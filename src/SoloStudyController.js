import { renderQuizMedia } from './QuizMedia.js';
import { renderQuizSettingsControls,readQuizSettingsControls,DEFAULT_QUIZ_OPTIONS } from './quiz/QuizSettingsControls.js';
import { SoloStudySession } from './quiz/SoloStudySession.js';
import { nearbySoloStudySeat } from './maps/soloStudySeats.js';

export const SOLO_STUDY_PROMPT=Object.freeze({text:'[E] Study',offsetX:0,offsetY:-70});

export class SoloStudyController {
  constructor(scene,presence,seats) {
    Object.assign(this,{
      scene,presence,seats,active:false,pending:false,session:null,options:DEFAULT_QUIZ_OPTIONS,
      settings:{category:null,difficulty:null,count:5},
    });
    this.root=document.getElementById('solo-study');
    this.configRoot=document.getElementById('solo-config');
    this.categorySelect=document.getElementById('solo-category');
    this.difficultySelect=document.getElementById('solo-difficulty');
    this.quantitySelect=document.getElementById('solo-quantity');
    this.questionRoot=document.getElementById('solo-question');
    this.progress=document.getElementById('solo-progress');
    this.questionText=document.getElementById('solo-question-text');
    this.media=document.getElementById('solo-media');
    this.alternatives=document.getElementById('solo-alternatives');
    this.feedback=document.getElementById('solo-feedback');
    this.explanation=document.getElementById('solo-explanation');
    this.results=document.getElementById('solo-results');
    this.resultText=document.getElementById('solo-result-text');
    this.status=document.getElementById('solo-status');
    this.startButton=document.getElementById('start-solo-study');
    this.confirmButton=document.getElementById('confirm-solo-answer');
    this.nextButton=document.getElementById('next-solo-question');
    this.againButton=document.getElementById('study-again');
    this.closeButton=document.getElementById('close-solo-study');
    this.seatPrompt=scene.add.text(0,0,SOLO_STUDY_PROMPT.text,{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#315b9c',padding:{x:6,y:3},
    }).setOrigin(0.5,1).setDepth(100000).setVisible(false);
    this.onStart=()=>this.start();this.onConfirm=()=>this.confirm();this.onNext=()=>this.next();
    this.onAgain=()=>this.studyAgain();this.onClose=()=>this.closePanel();
    this.onAlternative=event=>{
      const button=event.target.closest('button[data-answer-index]');
      if(button&&this.alternatives.contains(button)&&this.session?.select(Number(button.dataset.answerIndex)))this.renderQuestion();
    };
    this.startButton.addEventListener('click',this.onStart);
    this.confirmButton.addEventListener('click',this.onConfirm);
    this.nextButton.addEventListener('click',this.onNext);
    this.againButton.addEventListener('click',this.onAgain);
    this.closeButton.addEventListener('click',this.onClose);
    this.alternatives.addEventListener('click',this.onAlternative);
  }

  nearbySeat(){return nearbySoloStudySeat(this.seats,this.scene.player.body);}

  updateSeatPrompt(seat) {
    const visible=Boolean(seat&&!this.active&&!this.pending);
    this.seatPrompt.setVisible(visible);
    if(visible)this.seatPrompt.setPosition(
      Math.round(seat.seatX+SOLO_STUDY_PROMPT.offsetX),Math.round(seat.seatY+SOLO_STUDY_PROMPT.offsetY),
    );
  }

  async open(seat=this.nearbySeat()) {
    if(!seat||this.active||this.pending)return;
    this.active=true;this.seat=seat;this.returnPosition={x:this.scene.player.x,y:this.scene.player.y};
    this.scene.player.body.reset(seat.seatX,seat.seatY);this.scene.player.facing=seat.direction;
    this.scene.player.setFlipX(seat.direction==='left');this.scene.player.setVelocity(0,0);
    this.root.hidden=false;this.session=null;this.status.textContent='Loading study settings…';this.render();
    try{
      this.options=await this.presence.client.query(this.presence.api.soloStudy.options,{});
      this.status.textContent='Choose what you want to study.';
    }catch{this.status.textContent='Could not load study settings.';}
    this.render();
  }

  async start() {
    if(this.pending)return;
    const settings=readQuizSettingsControls(this);this.settings=settings;
    this.pending=true;this.status.textContent='Preparing questions…';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.soloStudy.start,{characterId,sessionId,...settings});
      this.session=new SoloStudySession(result.questions);this.status.textContent='';this.render();
    }catch(error){
      this.status.textContent=String(error).includes('No questions match')?'No questions match these settings.':'Could not start Study Mode.';
    }finally{this.pending=false;this.render();}
  }

  confirm() {
    const result=this.session?.confirm();
    if(!result){this.status.textContent='Select an answer first.';return;}
    this.status.textContent=result.correct?'Correct.':'Incorrect.';this.renderQuestion();
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

  studyAgain(){this.session=null;this.status.textContent='Choose what you want to study.';this.render();}

  closePanel() {
    if(!this.active)return;
    this.active=false;this.session=null;this.root.hidden=true;this.seatPrompt.setVisible(false);
    if(this.returnPosition)this.scene.player.body.reset(this.returnPosition.x,this.returnPosition.y);
    this.scene.input.keyboard.resetKeys();document.getElementById('game').focus({preventScroll:true});
  }

  renderQuestion() {
    const question=this.session?.question;
    this.questionRoot.hidden=!question;this.results.hidden=true;
    if(!question){renderQuizMedia(this.media,null);return;}
    const {current,total}=this.session.progress;this.progress.textContent=`${current} / ${total}`;
    this.questionText.textContent=question.question;renderQuizMedia(this.media,question.media);
    this.alternatives.replaceChildren(...question.answers.map((answer,index)=>{
      const button=document.createElement('button');button.type='button';button.dataset.answerIndex=String(index);
      button.textContent=`${index+1}. ${answer}`;
      const confirmed=this.session.confirmedAnswer!==null;
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
    this.nextButton.hidden=!confirmed;
    this.nextButton.textContent=current===total?'View results':'Next question';
  }

  renderResults() {
    const complete=Boolean(this.session?.complete);this.results.hidden=!complete;
    if(!complete)return;
    const result=this.session.result();this.resultText.textContent=`Correct: ${result.correct} / ${result.total} · Accuracy: ${result.accuracy}%`;
  }

  render() {
    if(!this.active){this.root.hidden=true;return;}
    this.root.hidden=false;
    const configuring=!this.session;this.configRoot.hidden=!configuring;
    if(configuring)renderQuizSettingsControls(this,this.options,this.settings,!this.pending);
    this.startButton.disabled=this.pending;
    if(this.session?.complete){this.questionRoot.hidden=true;renderQuizMedia(this.media,null);this.renderResults();}
    else {this.renderQuestion();}
  }

  close() {
    this.closePanel();
    this.startButton.removeEventListener('click',this.onStart);this.confirmButton.removeEventListener('click',this.onConfirm);
    this.nextButton.removeEventListener('click',this.onNext);this.againButton.removeEventListener('click',this.onAgain);
    this.closeButton.removeEventListener('click',this.onClose);this.alternatives.removeEventListener('click',this.onAlternative);
    this.seatPrompt.destroy();
  }
}
