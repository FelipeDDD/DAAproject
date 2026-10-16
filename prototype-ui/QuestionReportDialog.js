import { QUESTION_REPORT_REASONS,QUESTION_REPORT_COMMENT_LIMIT,QUESTION_REPORT_MESSAGES } from '../src/quiz/questionReportConfig.js';

export class QuestionReportDialog {
  constructor({embedded}){
    this.embedded=embedded;this.questions={};this.reported=new Set();this.pending=null;
    this.buttons=Object.fromEntries(['study','challenge'].map(mode=>[mode,document.getElementById(`${mode}-report-question`)]));
    this.dialog=document.createElement('dialog');this.dialog.className='question-report-dialog';
    this.dialog.setAttribute('aria-labelledby','question-report-title');
    this.dialog.innerHTML=`<form>
      <header><h2 id="question-report-title">Report question</h2><button type="button" class="question-report-close" aria-label="Close report">×</button></header>
      <p class="question-report-preview"></p>
      <label>What needs reviewing?<select name="reason"></select></label>
      <label>Comment <span>(optional)</span><textarea name="comment" rows="4" placeholder="What seems incorrect or unclear?"></textarea></label>
      <p class="question-report-note">This sends feedback for review. The current quiz continues normally, including Challenge timers.</p>
      <p class="question-report-status" role="status" aria-live="polite"></p>
      <footer><button type="button" class="question-report-cancel">Cancel</button><button type="submit" class="question-report-submit">Send feedback</button></footer>
    </form>`;
    document.body.append(this.dialog);
    this.form=this.dialog.querySelector('form');this.reason=this.form.elements.reason;this.comment=this.form.elements.comment;
    this.status=this.dialog.querySelector('.question-report-status');this.submit=this.dialog.querySelector('[type="submit"]');
    this.comment.maxLength=QUESTION_REPORT_COMMENT_LIMIT;
    this.reason.replaceChildren(...QUESTION_REPORT_REASONS.map(reason=>{const option=document.createElement('option');option.value=reason.id;option.textContent=reason.label;return option;}));
    for(const mode of ['study','challenge'])this.buttons[mode].addEventListener('click',()=>this.open(mode));
    for(const selector of ['.question-report-close','.question-report-cancel'])this.dialog.querySelector(selector).addEventListener('click',()=>this.dialog.close());
    this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.dialog.close();});
    this.dialog.addEventListener('close',()=>{this.status.textContent='';});
    this.form.addEventListener('submit',event=>{event.preventDefault();this.send();});
    window.addEventListener('message',event=>this.receive(event));
    // Isolate typing, Space, S and Escape from quiz/game shortcuts. Keep native
    // form behavior and let only this dialog consume Escape through its keyup.
    window.addEventListener('keydown',event=>{
      if(!this.dialog.open)return;
      event.stopImmediatePropagation();
      if(event.key==='Escape'){event.preventDefault();this.escapeHeld=true;this.dialog.close();}
    },true);
    window.addEventListener('keyup',event=>{
      if(this.dialog.open||this.escapeHeld)event.stopImmediatePropagation();
      if(event.key==='Escape')this.escapeHeld=false;
    },true);
  }

  key(question){return JSON.stringify([question.id,question.question]);}
  update(mode,question){
    this.questions[mode]=question;
    const reported=question&&this.reported.has(this.key(question));
    this.buttons[mode].textContent=reported?'Reported ✓':'Report question';
    this.buttons[mode].disabled=!question||reported||Boolean(this.pending);
  }
  open(mode){
    const question=this.questions[mode];if(!question||this.pending)return;
    this.target={mode,questionId:question.id,key:this.key(question)};
    this.form.reset();this.status.textContent='';
    this.submit.disabled=false;this.reason.disabled=false;this.comment.disabled=false;
    this.dialog.querySelector('.question-report-cancel').textContent='Cancel';
    this.dialog.querySelector('.question-report-preview').textContent=question.question;
    this.dialog.showModal();this.reason.focus();
  }
  send(){
    if(this.pending||!this.target)return;
    if(!this.embedded){this.status.textContent='Open Study Mode or IT Challenge from the game to send feedback.';return;}
    const requestId=crypto.randomUUID();this.pending={...this.target,requestId};
    this.submit.disabled=true;this.reason.disabled=true;this.comment.disabled=true;
    this.status.textContent='Sending feedback…';
    window.parent.postMessage({type:QUESTION_REPORT_MESSAGES.request,payload:{
      requestId,mode:this.target.mode,questionId:this.target.questionId,reason:this.reason.value,comment:this.comment.value.trim(),
    }},location.origin);
    this.timeout=setTimeout(()=>this.finish({ok:false,error:'No response from the game. Please try again.'}),15000);
  }
  receive(event){
    if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!==QUESTION_REPORT_MESSAGES.result
      ||event.data.requestId!==this.pending?.requestId)return;
    this.finish(event.data);
  }
  finish(result){
    if(!this.pending)return;
    clearTimeout(this.timeout);
    if(result.ok)this.reported.add(this.pending.key);
    this.pending=null;this.submit.disabled=false;this.reason.disabled=false;this.comment.disabled=false;
    this.status.textContent=result.ok?'Thank you. This question is marked for review.':result.error;
    if(result.ok){this.submit.disabled=true;this.dialog.querySelector('.question-report-cancel').textContent='Close';}
    for(const mode of ['study','challenge'])this.update(mode,this.questions[mode]);
  }
}
