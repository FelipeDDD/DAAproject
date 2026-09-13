import { CHARACTERS } from './characters.js';
import { distanceToSeat, QUIZ_SEAT_DISTANCE } from './maps/quizSeats.js';

// World-space tuning for the prompt, anchored to the fixed Tiled seat position.
export const QUIZ_SEAT_PROMPT = Object.freeze({text:'[E] Sentar',offsetX:0,offsetY:-70});

export function shouldShowStartButton(lobby,characterId){
  return lobby?.status==='lobby'&&lobby.hostCharacterId===characterId;
}

export class QuizLobby {
  constructor(scene,presence,seats) {
    Object.assign(this,{
      scene,presence,seats,room:scene.mapKey,lobby:null,pending:false,seated:false,
      selectedAnswer:null,confirmedAnswer:null,pendingAnswer:false,pendingNext:false,answerError:'',
    });
    this.seat=seats.find(seat=>seat.characterId===presence.identity.characterId);
    this.root=document.getElementById('quiz-lobby');
    this.list=document.getElementById('quiz-participants');
    this.status=document.getElementById('quiz-status');
    this.startButton=document.getElementById('start-quiz');
    this.nextButton=document.getElementById('next-question');
    this.leaveButton=document.getElementById('leave-quiz');
    this.questionRoot=document.getElementById('quiz-question');
    this.questionText=document.getElementById('quiz-question-text');
    this.alternatives=document.getElementById('quiz-alternatives');
    this.explanation=document.getElementById('quiz-explanation');
    this.confirmButton=document.getElementById('confirm-answer');
    this.resultsRoot=document.getElementById('quiz-results');
    this.scoresList=document.getElementById('quiz-scores');
    this.seatPrompt=scene.add.text(0,0,QUIZ_SEAT_PROMPT.text,{
      fontFamily:'system-ui, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#334550',padding:{x:6,y:3},
    }).setOrigin(0.5,1).setDepth(100000).setVisible(false);

    this.onStart=()=>this.start();
    this.onNext=()=>this.nextQuestion();
    this.onLeave=()=>this.leave();
    this.onConfirm=()=>this.confirmAnswer();
    this.onAlternative=event=>{
      const button=event.target.closest('button[data-answer-index]');
      if(button&&this.alternatives.contains(button))this.selectAnswer(Number(button.dataset.answerIndex));
    };
    this.startButton.addEventListener('click',this.onStart);
    this.nextButton.addEventListener('click',this.onNext);
    this.leaveButton.addEventListener('click',this.onLeave);
    this.confirmButton.addEventListener('click',this.onConfirm);
    this.alternatives.addEventListener('click',this.onAlternative);

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
    this.pending=true;this.seatPrompt.setVisible(false);this.status.textContent='Entrando no lobby…';
    try{
      const {characterId,sessionId}=this.presence.identity;
      const seat=await this.presence.client.mutation(this.presence.api.quizLobbies.join,{room:this.room,characterId,sessionId});
      this.seated=true;this.scene.player.body.reset(seat.seatX,seat.seatY);
      this.scene.player.facing=seat.direction;this.scene.player.setFlipX(seat.direction==='left');
      this.scene.player.setVelocity(0,0);this.root.hidden=false;this.render();
    }catch(error){
      this.status.textContent=error.message.includes('iniciado')?'O lobby já foi iniciado.':'Não foi possível sentar. Aproxime-se da sua cadeira.';
    }finally{this.pending=false;}
  }

  async leave(){
    if(!this.seated)return true;
    if(this.pending)return false;
    this.pending=true;
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.leave,{room:this.room,characterId,sessionId});
      this.standLocally();return true;
    }catch{this.status.textContent='Não foi possível sair do lobby.';return false;}
    finally{this.pending=false;}
  }

  async start(){
    if(this.pending||!this.isHost()||this.lobby?.status!=='lobby')return;
    this.pending=true;
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.start,{room:this.room,characterId,sessionId});
    }catch(error){
      this.status.textContent=error.message.includes('2 jogadores')?'Aguarde pelo menos mais um jogador.':'Não foi possível iniciar.';
    }finally{this.pending=false;this.render();}
  }

  selectAnswer(answerIndex){
    if(this.confirmedAnswer!==null||this.pendingAnswer||this.lobby?.status!=='starting'||this.lobby?.allAnswered)return;
    this.selectedAnswer=answerIndex;this.answerError='';this.render();
  }

  async confirmAnswer(){
    if(this.selectedAnswer===null||this.confirmedAnswer!==null||this.pendingAnswer||this.lobby?.status!=='starting')return;
    const answerIndex=this.selectedAnswer;
    this.pendingAnswer=true;this.answerError='';this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      const result=await this.presence.client.mutation(this.presence.api.quizLobbies.answer,{room:this.room,characterId,sessionId,answerIndex});
      this.confirmedAnswer=result.answerIndex;
    }catch{
      this.answerError='Não foi possível registrar a resposta.';
    }finally{this.pendingAnswer=false;this.render();}
  }

  async nextQuestion(){
    if(this.pendingNext||!this.isHost()||!this.lobby?.allAnswered)return;
    this.pendingNext=true;this.render();
    try{
      const {characterId,sessionId}=this.presence.identity;
      await this.presence.client.mutation(this.presence.api.quizLobbies.nextQuestion,{room:this.room,characterId,sessionId});
    }catch{this.status.textContent='Não foi possível avançar a pergunta.';}
    finally{this.pendingNext=false;this.render();}
  }

  isHost(){return this.lobby?.hostCharacterId===this.presence.identity.characterId;}

  standLocally(){
    this.seated=false;this.resetQuestionState();
    this.seatPrompt.setVisible(false);this.questionRoot.hidden=true;this.resultsRoot.hidden=true;this.root.hidden=true;
    this.scene.input.keyboard.resetKeys();
  }

  resetQuestionState(){
    this.renderedQuestionId=null;this.selectedAnswer=null;this.confirmedAnswer=null;
    this.pendingAnswer=false;this.pendingNext=false;this.answerError='';
  }

  renderQuestion(question){
    this.questionRoot.hidden=!question;
    if(!question)return;
    if(this.renderedQuestionId!==question.id){
      this.resetQuestionState();this.renderedQuestionId=question.id;this.questionText.textContent=question.question;
      this.alternatives.replaceChildren(...question.answers.map((text,index)=>{
        const button=document.createElement('button');button.type='button';
        button.dataset.answerIndex=String(index);button.textContent=`${index+1}. ${text}`;
        return button;
      }));
    }
    if(Number.isInteger(this.lobby?.ownAnswerIndex)){
      this.confirmedAnswer=this.lobby.ownAnswerIndex;this.selectedAnswer=this.confirmedAnswer;
    }
    const revealed=this.lobby?.allAnswered&&Number.isInteger(this.lobby.correctAnswerIndex);
    this.explanation.hidden=!revealed||!question.explanation;
    this.explanation.textContent=revealed?(question.explanation??''):'';
    for(const button of this.alternatives.querySelectorAll('button')){
      const index=Number(button.dataset.answerIndex),selected=index===this.selectedAnswer;
      button.classList.toggle('selected',selected&&!revealed);
      button.classList.toggle('correct',revealed&&index===this.lobby.correctAnswerIndex);
      button.classList.toggle('incorrect',revealed&&index===this.confirmedAnswer&&index!==this.lobby.correctAnswerIndex);
      button.setAttribute('aria-pressed',String(selected));
      button.disabled=this.confirmedAnswer!==null||this.pendingAnswer||revealed;
    }
    this.confirmButton.hidden=revealed;
    this.confirmButton.disabled=this.selectedAnswer===null||this.confirmedAnswer!==null||this.pendingAnswer;
    this.confirmButton.textContent=this.pendingAnswer?'Enviando…':this.confirmedAnswer!==null?'Resposta confirmada':'Confirmar resposta';
  }

  renderResults(){
    const finished=this.lobby?.status==='finished';
    this.resultsRoot.hidden=!finished;
    if(!finished)return;
    const scores=new Map(this.lobby.scores.map(score=>[score.characterId,score.points]));
    this.scoresList.replaceChildren(...this.lobby.participants.map(characterId=>{
      const character=CHARACTERS.find(item=>item.id===characterId);
      const li=document.createElement('li');li.textContent=`${character?.name??characterId}: ${scores.get(characterId)??0} ponto(s)`;return li;
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
    this.renderQuestion(playing?this.lobby?.question:null);this.renderResults();
    if(finished)this.status.textContent='Quiz concluído · Esc para sair';
    else if(playing&&this.lobby.allAnswered){
      this.status.textContent=this.confirmedAnswer===this.lobby.correctAnswerIndex?'Correto':'Incorreto';
    }else if(playing){
      this.status.textContent=this.answerError||(
        this.pendingAnswer?'Enviando resposta…':this.confirmedAnswer!==null?'Resposta registrada. Aguardando os outros jogadores.':'Selecione uma alternativa e confirme.'
      );
    }else this.status.textContent='E, Esc ou botão para sair do lobby';
    this.startButton.hidden=!shouldShowStartButton(this.lobby,this.presence.identity.characterId);this.startButton.disabled=this.pending;
    this.nextButton.hidden=!playing||!this.lobby.allAnswered||!this.isHost();this.nextButton.disabled=this.pendingNext;
    this.leaveButton.disabled=this.pending||this.pendingAnswer||this.pendingNext;
  }

  close(){
    this.closed=true;this.unsubscribe?.();
    this.startButton.removeEventListener('click',this.onStart);
    this.nextButton.removeEventListener('click',this.onNext);
    this.leaveButton.removeEventListener('click',this.onLeave);
    this.confirmButton.removeEventListener('click',this.onConfirm);
    this.alternatives.removeEventListener('click',this.onAlternative);
    this.seatPrompt.destroy();this.root.hidden=true;
  }
}
