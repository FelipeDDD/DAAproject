import { CHARACTERS,baseCharacterId } from './characters.js';
import { distanceToSeat, QUIZ_SEAT_DISTANCE } from './maps/quizSeats.js';
import { renderQuizMedia } from './QuizMedia.js';
import { remainingQuizSeconds } from './quizTimer.js';
import { readQuizSettingsControls,renderQuizSettingsControls } from './quiz/QuizSettingsControls.js';
import { CalculatorWidget } from './calculator/CalculatorWidget.js';
import { WorldPrompt } from './ui/WorldPrompt.js';

// World-space tuning for the prompt, anchored to the fixed Tiled seat position.
export const QUIZ_SEAT_PROMPT = Object.freeze({text:'[E] Sit',offsetX:0,offsetY:-70});

export function shouldShowStartButton(lobby,characterId){
  return lobby?.status==='lobby'&&lobby.hostCharacterId===characterId;
}

export function shouldConfirmQuizLeave(lobby){return lobby?.status==='starting';}

export class QuizLobby {
  constructor(scene,presence,seats) {
    Object.assign(this,{
      scene,presence,seats,room:scene.mapKey,lobby:null,pending:false,seated:false,
      selectedAnswer:null,confirmedAnswer:null,pendingAnswer:false,pendingNext:false,answerError:'',
      pendingSettings:false,settingsError:'',
    });
    this.seat=seats.find(seat=>seat.characterId===baseCharacterId(presence.identity.characterId));
    this.root=document.getElementById('quiz-lobby');
    this.list=document.getElementById('quiz-participants');
    this.status=document.getElementById('quiz-status');
    this.settingsRoot=document.getElementById('quiz-settings');
    this.categorySelect=document.getElementById('quiz-category');
    this.topicField=document.getElementById('quiz-topic-field');this.topicSelect=document.getElementById('quiz-topic');
    this.difficultySelect=document.getElementById('quiz-difficulty');
    this.quantitySelect=document.getElementById('quiz-quantity');
    this.settingsNote=document.getElementById('quiz-settings-note');
    this.startButton=document.getElementById('start-quiz');
    this.nextButton=document.getElementById('next-question');
    this.leaveButton=document.getElementById('leave-quiz');
    this.cancelLeaveButton=document.getElementById('cancel-leave-quiz');
    this.questionRoot=document.getElementById('quiz-question');
    this.questionText=document.getElementById('quiz-question-text');
    this.questionMedia=document.getElementById('quiz-media');
    this.timerElement=document.getElementById('quiz-timer');
    this.alternatives=document.getElementById('quiz-alternatives');
    this.explanation=document.getElementById('quiz-explanation');
    this.confirmButton=document.getElementById('confirm-answer');
    this.resultsRoot=document.getElementById('quiz-results');
    this.scoresList=document.getElementById('quiz-scores');
    this.calculator=new CalculatorWidget({mount:this.questionRoot,scene});
    this.seatPrompt=new WorldPrompt(scene,QUIZ_SEAT_PROMPT.text,{className:'quiz-world-prompt'});

    this.onStart=()=>this.start();
    this.onNext=()=>this.nextQuestion();
    this.onLeave=()=>this.leave();
    this.onCancelLeave=()=>this.cancelLeave();
    this.onConfirm=()=>this.confirmAnswer();
    this.onSettingsChange=()=>this.updateSettings();
    this.onAlternative=event=>{
      const button=event.target.closest('button[data-answer-index]');
      if(button&&this.alternatives.contains(button))this.selectAnswer(Number(button.dataset.answerIndex));
    };
    this.startButton.addEventListener('click',this.onStart);
    this.nextButton.addEventListener('click',this.onNext);
    this.leaveButton.addEventListener('click',this.onLeave);
    this.cancelLeaveButton.addEventListener('click',this.onCancelLeave);
    this.confirmButton.addEventListener('click',this.onConfirm);
    this.alternatives.addEventListener('click',this.onAlternative);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.addEventListener('change',this.onSettingsChange);
    this.timerInterval=setInterval(()=>this.updateTimer(),250);

    const {characterId}=presence.identity;
    this.unsubscribe=presence.client.onUpdate(presence.api.quizLobbies.current,{room:this.room,characterId},lobby=>{
      if(this.closed)return;
      this.lobby=lobby;
      if(this.seated&&!lobby?.participants.includes(characterId))this.standLocally();
      this.render();
    },error=>presence.fail(error));
  }

  nearbySeat(){return this.seat&&distanceToSeat(this.seat,this.scene.player.body)<=QUIZ_SEAT_DISTANCE?this.seat:null;}

  // Visibility uses only local Phaser state. Convex is never consulted from this path.
  updateSeatPrompt(localSeat){
    const visible=Boolean(localSeat&&!this.seated&&!this.pending);
    this.seatPrompt.setVisible(visible);
    if(visible)this.seatPrompt.setPosition(
      Math.round(localSeat.seatX+QUIZ_SEAT_PROMPT.offsetX),
      Math.round(localSeat.seatY+QUIZ_SEAT_PROMPT.offsetY),
    );
  }

  async interact(){
    if(this.pending)return;
    if(this.seated)return this.leave();
    if(!this.nearbySeat())return;
    this.pending=true;this.seatPrompt.setVisible(false);this.status.textContent='Joining lobby…';
    try{
      const {characterId,sessionId}=this.presence.identity;
      const seat=await this.presence.client.mutation(this.presence.api.quizLobbies.join,{room:this.room,characterId,sessionId});
      this.seated=true;this.scene.player.body.reset(seat.seatX,seat.seatY);
      if(this.scene.player.setFacing)this.scene.player.setFacing(seat.direction,false);
      else{this.scene.player.facing=seat.direction;this.scene.player.setFlipX(seat.direction==='left');}
      this.scene.player.setVelocity(0,0);this.root.hidden=false;this.render();
    }catch(error){
      this.status.textContent=error.message.includes('already started')?'The lobby has already started.'
        :error.message.includes('already occupied')?'This quiz chair is already occupied.'
          :'Could not sit down. Move closer to your chair.';
    }finally{this.pending=false;this.render();}
  }

  async leave(){
    if(!this.seated)return true;
    if(this.pending)return false;
    if(shouldConfirmQuizLeave(this.lobby)&&!this.confirmingLeave){
      this.confirmingLeave=true;this.render();return false;
    }
    this.pending=true;
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.leave,{room:this.room,characterId,sessionId});
      this.standLocally();return true;
    }catch{this.status.textContent='Could not leave the lobby.';return false;}
    finally{this.pending=false;}
  }

  cancelLeave(){
    this.confirmingLeave=false;this.render();
    document.getElementById('game').focus({preventScroll:true});
  }

  renderSettings(){
    const visible=this.lobby?.status==='lobby';this.settingsRoot.hidden=!visible;
    if(!visible)return;
    const options=this.lobby.configurationOptions??{categories:[],topicsByCategory:[],difficulties:['medium','hard'],quantities:[5,10,15]};
    const settings=this.lobby.settings??{category:null,topic:null,difficulty:null,count:5};
    this.options=options;
    const editable=this.isHost()&&!this.pendingSettings;
    renderQuizSettingsControls(this,options,settings,editable);
    this.settingsNote.textContent=this.settingsError||(this.isHost()?'Your settings are shared with everyone.':'Only the host can change these settings.');
  }

  async updateSettings(){
    if(this.pendingSettings||!this.isHost()||this.lobby?.status!=='lobby')return;
    const settings=readQuizSettingsControls(this,this.options);
    this.pendingSettings=true;this.settingsError='';this.renderSettings();
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.configure,{
        room:this.room,characterId,sessionId,...settings,
      });
    }catch{this.settingsError='Could not update quiz settings.';}
    finally{this.pendingSettings=false;this.render();}
  }

  async start(){
    if(this.pending||this.pendingSettings||!this.isHost()||this.lobby?.status!=='lobby')return;
    this.pending=true;
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.start,{room:this.room,characterId,sessionId});
    }catch(error){
      this.status.textContent=error.message.includes('At least 2')
        ?'Wait for at least one more player.'
        :error.message.includes('No questions match')
          ?'No questions match these settings.'
          :'Could not start the quiz.';
    }finally{this.pending=false;this.render();}
  }

  selectAnswer(answerIndex){
    if(this.confirmedAnswer!==null||this.pendingAnswer||this.questionHasExpired()||this.lobby?.status!=='starting'||this.lobby?.allAnswered)return;
    this.selectedAnswer=answerIndex;this.answerError='';this.render();
  }

  async confirmAnswer(){
    if(this.selectedAnswer===null||this.confirmedAnswer!==null||this.pendingAnswer||this.questionHasExpired()||this.lobby?.status!=='starting')return;
    const answerIndex=this.selectedAnswer;
    this.pendingAnswer=true;this.answerError='';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.quizLobbies.answer,{room:this.room,characterId,sessionId,answerIndex});
      this.confirmedAnswer=result.answerIndex;
    }catch{
      this.answerError='Could not save your answer.';
    }finally{this.pendingAnswer=false;this.render();}
  }

  questionHasExpired(){return remainingQuizSeconds(this.lobby?.questionDeadline)===0;}

  updateTimer(){
    const playing=this.lobby?.status==='starting'&&this.lobby?.question;
    const seconds=playing?remainingQuizSeconds(this.lobby.questionDeadline):null;
    this.timerElement.hidden=seconds===null;
    if(seconds===null)return;
    const expired=seconds===0;
    this.timerElement.textContent=this.lobby.allAnswered&&!expired?'Completed':`${seconds}s`;
    this.timerElement.dateTime=`PT${seconds}S`;
    this.timerElement.classList.toggle('urgent',!this.lobby.allAnswered&&seconds<=5);
    if(expired&&!this.lobby.allAnswered&&!this.finishingTimedQuestion&&
      Date.now()>=(this.timerRetryAt??0))this.finishTimedQuestion();
  }

  async finishTimedQuestion(){
    const questionId=this.lobby?.question?.id;
    if(!questionId||this.finishingTimedQuestion)return;
    this.finishingTimedQuestion=true;this.answerError='';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const args={room:this.room,characterId,sessionId};
      if(Number.isInteger(this.selectedAnswer))args.answerIndex=this.selectedAnswer;
      const result=await this.presence.client.mutation(this.presence.api.quizLobbies.finishTimedQuestion,args);
      if(Number.isInteger(result.answerIndex)){
        this.confirmedAnswer=result.answerIndex;this.selectedAnswer=result.answerIndex;
      }
      this.timerRetryAt=Infinity;
    }catch{
      this.answerError='Could not finish the question. Retrying…';
      this.timerRetryAt=Date.now()+1000;
    }finally{this.finishingTimedQuestion=false;this.render();}
  }

  async nextQuestion(){
    if(this.pendingNext||!this.isHost()||!this.lobby?.allAnswered)return;
    this.pendingNext=true;this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.nextQuestion,{room:this.room,characterId,sessionId});
    }catch{this.status.textContent='Could not advance to the next question.';}
    finally{this.pendingNext=false;this.render();}
  }

  isHost(){return this.lobby?.hostCharacterId===this.presence.identity.characterId;}

  standLocally(){
    this.calculator.close({reset:true});
    this.seated=false;this.confirmingLeave=false;this.resetQuestionState();
    this.seatPrompt.setVisible(false);this.questionRoot.hidden=true;this.resultsRoot.hidden=true;this.root.hidden=true;
    this.scene.input.keyboard.resetKeys();
  }

  resetQuestionState(){
    this.renderedQuestionId=null;this.selectedAnswer=null;this.confirmedAnswer=null;
    this.pendingAnswer=false;this.pendingNext=false;this.finishingTimedQuestion=false;
    this.timerRetryAt=0;this.answerError='';
  }

  renderQuestion(question){
    this.questionRoot.hidden=!question;
    if(!question){renderQuizMedia(this.questionMedia,null);return;}
    if(this.renderedQuestionId!==question.id){
      this.resetQuestionState();this.renderedQuestionId=question.id;this.questionText.textContent=question.question;
      renderQuizMedia(this.questionMedia,question.media);
      this.alternatives.replaceChildren(...question.answers.map((text,index)=>{
        const button=document.createElement('button');button.type='button';
        button.dataset.answerIndex=String(index);button.textContent=`${index+1}. ${text}`;
        return button;
      }));
    }
    if(Number.isInteger(this.lobby?.ownAnswerIndex)){
      this.confirmedAnswer=this.lobby.ownAnswerIndex;this.selectedAnswer=this.confirmedAnswer;
    }
    const expired=this.questionHasExpired();
    const revealed=this.lobby?.allAnswered&&Number.isInteger(this.lobby.correctAnswerIndex);
    this.explanation.hidden=!revealed||!question.explanation;
    this.explanation.textContent=revealed?(question.explanation??''):'';
    for(const button of this.alternatives.querySelectorAll('button')){
      const index=Number(button.dataset.answerIndex),selected=index===this.selectedAnswer;
      button.classList.toggle('selected',selected&&!revealed);
      button.classList.toggle('correct',revealed&&index===this.lobby.correctAnswerIndex);
      button.classList.toggle('incorrect',revealed&&index===this.confirmedAnswer&&index!==this.lobby.correctAnswerIndex);
      button.setAttribute('aria-pressed',String(selected));
      button.disabled=this.confirmedAnswer!==null||this.pendingAnswer||expired||revealed;
    }
    this.confirmButton.hidden=revealed||expired;
    this.confirmButton.disabled=this.selectedAnswer===null||this.confirmedAnswer!==null||this.pendingAnswer||expired;
    this.confirmButton.textContent=this.pendingAnswer?'Sending…':this.confirmedAnswer!==null?'Answer confirmed':'Confirm answer';
  }

  renderResults(){
    const finished=this.lobby?.status==='finished';
    this.resultsRoot.hidden=!finished;
    if(!finished)return;
    const scores=new Map(this.lobby.scores.map(score=>[score.characterId,score.points]));
    this.scoresList.replaceChildren(...this.lobby.participants.map(characterId=>{
      const character=CHARACTERS.find(item=>item.id===characterId);
      const points=scores.get(characterId)??0;
      const li=document.createElement('li');li.textContent=`${character?.name??characterId}: ${points} ${points===1?'point':'points'}`;return li;
    }));
  }

  render(){
    if(!this.seated){this.root.hidden=true;return;}
    const participants=new Set(this.lobby?.participants??[]);
    this.list.replaceChildren(...CHARACTERS.map(character=>{
      const li=document.createElement('li');
      li.textContent=`${participants.has(character.id)?'✓':'○'} ${character.name}${this.lobby?.hostCharacterId===character.id?' (host)':''}`;
      return li;
    }));
    const playing=this.lobby?.status==='starting',finished=this.lobby?.status==='finished';
    if(!playing)this.confirmingLeave=false;
    this.renderSettings();this.renderQuestion(playing?this.lobby?.question:null);this.updateTimer();this.renderResults();
    if(this.confirmingLeave)this.status.textContent='Leave this quiz? It will continue without you.';
    else if(finished&&this.lobby.finishedReason==='insufficient-participants')
      this.status.textContent='Quiz ended because too few players remain · Esc to leave';
    else if(finished)this.status.textContent='Quiz completed · Esc to leave';
    else if(playing&&this.lobby.allAnswered){
      this.status.textContent=this.confirmedAnswer===this.lobby.correctAnswerIndex?'Correct':'Incorrect';
    }else if(playing){
      this.status.textContent=this.answerError||(
        this.finishingTimedQuestion?'Time is up. Saving your last selection…':
        this.pendingAnswer?'Sending answer…':this.confirmedAnswer!==null?'Answer recorded. Waiting for the other players.':'Select an answer and confirm it.'
      );
    }else this.status.textContent='Press E, Esc, or the button to leave the lobby';
    this.startButton.hidden=!shouldShowStartButton(this.lobby,this.presence.identity.characterId);this.startButton.disabled=this.pending||this.pendingSettings;
    this.nextButton.hidden=!playing||!this.lobby.allAnswered||!this.isHost();this.nextButton.disabled=this.pendingNext;
    this.leaveButton.textContent=this.confirmingLeave?'Confirm leave':'Leave lobby';
    this.leaveButton.disabled=this.pending||this.pendingAnswer||this.pendingNext;
    this.cancelLeaveButton.hidden=!this.confirmingLeave;this.cancelLeaveButton.disabled=this.pending;
  }

  close(){
    this.calculator.destroy();
    this.closed=true;this.unsubscribe?.();clearInterval(this.timerInterval);
    this.startButton.removeEventListener('click',this.onStart);
    this.nextButton.removeEventListener('click',this.onNext);
    this.leaveButton.removeEventListener('click',this.onLeave);
    this.cancelLeaveButton.removeEventListener('click',this.onCancelLeave);
    this.confirmButton.removeEventListener('click',this.onConfirm);
    this.alternatives.removeEventListener('click',this.onAlternative);
    for(const select of [this.categorySelect,this.topicSelect,this.difficultySelect,this.quantitySelect])
      select.removeEventListener('change',this.onSettingsChange);
    this.seatPrompt.destroy();this.root.hidden=true;
  }
}
