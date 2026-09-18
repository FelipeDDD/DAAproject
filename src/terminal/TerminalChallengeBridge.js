const REQUEST_TYPE='daa-terminal-challenge-request';
const STATE_TYPE='daa-terminal-challenge-state';

export class TerminalChallengeBridge {
  constructor({frame,controller,origin=location.origin}={}){
    Object.assign(this,{frame,controller,origin,disposed:false,pendingStart:null,running:false});
    this.unsubscribe=controller.subscribeTerminalChallenge?.(state=>{
      if(!this.disposed&&this.running)this.receiveClockState(state);
    });
  }

  accepts(event){
    return !this.disposed&&event.origin===this.origin&&event.source===this.frame.contentWindow
      &&event.data?.type===REQUEST_TYPE;
  }

  post(state=this.controller.terminalChallengeState()){
    this.frame.contentWindow?.postMessage({type:STATE_TYPE,state},this.origin);
    return state;
  }

  receiveClockState(state){
    this.post(state);
    if(state.phase==='result'&&!state.saving)this.running=false;
  }

  async handle(event){
    if(!this.accepts(event))return false;
    const {action,payload}=event.data;
    try{
      if(action==='state'){
        this.post();return true;
      }
      if(action==='start'){
        if(!this.pendingStart){
          this.pendingStart=this.controller.startChallengeFromTerminal()
            .finally(()=>{this.pendingStart=null;});
        }
        await this.pendingStart;
        if(this.controller.terminalChallengeState().phase==='question')this.running=true;
      }else if(action==='select'){
        this.controller.selectChallengeAnswerFromTerminal(Number(payload?.answerIndex),{
          submitImmediately:Boolean(payload?.submitImmediately),
        });
      }else if(action==='confirm'){
        this.controller.confirmChallengeAnswerFromTerminal();
      }else if(action==='skip'){
        this.controller.skipChallengeFromTerminal();
      }else if(action==='leave'){
        if(this.pendingStart)await this.pendingStart;
        this.running=false;await this.controller.endChallengeFromTerminal();
      }else return false;
      this.post();
    }catch(error){
      const state=this.controller.terminalChallengeState();
      state.status=error instanceof Error?error.message:'IT Challenge is unavailable.';
      this.post(state);
    }
    return true;
  }

  async reset(){
    if(this.disposed)return;
    if(this.pendingStart)await this.pendingStart;
    this.running=false;await this.controller.endChallengeFromTerminal();
  }

  destroy(){this.disposed=true;this.running=false;this.unsubscribe?.();}
}

export const TERMINAL_CHALLENGE_MESSAGES=Object.freeze({request:REQUEST_TYPE,state:STATE_TYPE});
