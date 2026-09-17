const REQUEST_TYPE='daa-terminal-study-request';
const STATE_TYPE='daa-terminal-study-state';

function studySettings(value={}) {
  return {
    category:typeof value.category==='string'&&value.category?value.category:null,
    topic:typeof value.topic==='string'&&value.topic?value.topic:null,
    difficulty:['medium','hard'].includes(value.difficulty)?value.difficulty:null,
    count:5,
  };
}

export class TerminalStudyBridge {
  constructor({frame,controller,origin=location.origin}) {
    Object.assign(this,{frame,controller,origin,disposed:false,pendingStart:null});
  }

  accepts(event) {
    return !this.disposed&&event.origin===this.origin&&event.source===this.frame.contentWindow
      &&event.data?.type===REQUEST_TYPE;
  }

  post(state=this.controller.terminalStudyState()) {
    this.frame.contentWindow?.postMessage({type:STATE_TYPE,state},this.origin);
    return state;
  }

  async handle(event) {
    if(!this.accepts(event))return false;
    const {action,payload}=event.data;
    try{
      if(action==='options'){
        await this.controller.loadStudyOptions();
      }else if(action==='start'){
        if(!this.pendingStart){
          this.pendingStart=this.controller.startStudyFromTerminal(studySettings(payload))
            .finally(()=>{this.pendingStart=null;});
        }
        await this.pendingStart;
      }else if(action==='select'){
        this.controller.selectStudyAnswerFromTerminal(Number(payload?.answerIndex));
      }else if(action==='confirm'){
        this.controller.confirmStudyAnswerFromTerminal();
      }else if(action==='next'){
        await this.controller.nextStudyQuestionFromTerminal();
      }else if(action==='end'){
        if(this.pendingStart)await this.pendingStart;
        await this.controller.endStudyFromTerminal();
      }else return false;
      this.post();
    }catch(error){
      const state=this.controller.terminalStudyState();
      state.status=error instanceof Error?error.message:'Study Mode is unavailable.';
      this.post(state);
    }
    return true;
  }

  async reset() {
    if(this.disposed)return;
    if(this.pendingStart)await this.pendingStart;
    await this.controller.endStudyFromTerminal();
  }

  destroy() { this.disposed=true; }
}

export const TERMINAL_STUDY_MESSAGES=Object.freeze({request:REQUEST_TYPE,state:STATE_TYPE});
