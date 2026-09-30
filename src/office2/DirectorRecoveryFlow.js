import { requestDirectorWorkstation } from './directorWorkstationClient.js';
import {
  createExecutiveRunner,drawExecutiveRunner,jumpExecutiveRunner,stepExecutiveRunner,
  RUNNER_WIDTH,RUNNER_HEIGHT,
} from './executiveRunner.js';

function el(tag,className,text){
  const node=document.createElement(tag);node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

export class DirectorRecoveryFlow {
  constructor(host){this.host=host;this.cycle=0;this.active=false;}

  current(cycle){return this.active&&this.host.active&&this.cycle===cycle&&this.generation===this.host.generation;}

  button(label,action){
    const button=el('button','',label);button.type='button';button.addEventListener('click',action);
    this.host.panel.append(button);return button;
  }

  back(){this.close();this.host.showComputer();}

  async open(){
    this.close();this.active=true;this.generation=this.host.generation;
    const cycle=this.cycle;
    this.host.resetPanel('DIRECTOR EMERGENCY REMOTE ACCESS','director-recovery');
    this.host.panel.append(el('p','','Checking emergency recovery status...'));
    try{
      const state=await requestDirectorWorkstation(this.host,'recoveryStatus');
      if(!this.current(cycle))return;
      if(state.recoveryComplete){this.showSuccess();return;}
      if(!state.factor1Verified||!state.compromised){
        this.host.resetPanel('DIRECTOR EMERGENCY REMOTE ACCESS','director-recovery');
        this.host.panel.append(el('p','director-security-denied',
          'Emergency recovery is not available. Complete local security verification at PC-DIRECTOR first.'));
        this.button('Back to command prompt',()=>this.back()).focus();return;
      }
      this.connect(cycle);
    }catch{
      if(this.current(cycle)){
        this.host.panel.append(el('p','director-security-denied','Recovery unavailable. A signed-in profile and active session are required.'));
        this.button('Retry connection',()=>void this.open());
        this.button('Back to command prompt',()=>this.back()).focus();
      }
    }
  }

  connect(cycle){
    this.host.resetPanel('EMERGENCY CONNECTION','director-recovery');
    const cable=el('div','director-recovery-cable');cable.setAttribute('aria-hidden','true');
    cable.append(el('span','','PC-USER'),el('i','director-recovery-packet'),el('span','','PC-DIRECTOR'));
    const status=el('p','');status.setAttribute('role','status');this.host.panel.append(cable,status);
    const messages=['Establishing emergency connection...','Routing packets...',
      'Negotiating questionable security...','Connection established.'];
    let index=0;
    const next=()=>{
      if(!this.current(cycle))return;
      if(index===messages.length){this.showIntro();return;}
      status.textContent=messages[index++];this.delay=setTimeout(next,650);
    };
    next();
  }

  showIntro(){
    this.host.resetPanel('DIRECTOR EMERGENCY REMOTE ACCESS','director-recovery');
    this.host.panel.append(el('p','',
      'To prove that you are really the Director, complete the Legacy Executive Authentication Protocol.'),
    el('h3','','LEGACY EXECUTIVE AUTHENTICATION PROTOCOL'),
    el('p','','Objective: Defeat Gill Bates.'),el('p','','SPACE / ↑ : Jump'),
    el('p','','Only the Director could possibly complete this test.'));
    this.button('Begin authentication',()=>this.start()).focus();
  }

  start(){
    if(!this.active||!this.host.active||this.saving)return;
    cancelAnimationFrame(this.frame);this.runner=createExecutiveRunner();
    this.host.resetPanel('LEGACY EXECUTIVE AUTHENTICATION PROTOCOL','director-recovery');
    const canvas=el('canvas','director-runner');canvas.width=RUNNER_WIDTH;canvas.height=RUNNER_HEIGHT;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Dinosaur runner: jump over office equipment to reach Gill Bates.');
    this.host.panel.append(canvas);
    this.message=el('p','director-runner-status','SPACE / ↑ : Jump — Objective: Defeat Gill Bates.');
    this.message.setAttribute('role','status');this.host.panel.append(this.message);
    this.jumpButton=this.button('Jump',()=>this.jump());
    this.jumpButton.focus();
    const context=canvas.getContext('2d');
    if(!context){
      this.message.textContent='This browser could not start the runner. Please try another browser.';
      this.jumpButton.disabled=true;this.button('Back to command prompt',()=>this.back());return;
    }
    const cycle=this.cycle;let previous=null;
    const tick=now=>{
      if(!this.current(cycle))return;
      const delta=previous===null?0:Math.min(0.05,Math.max(0,(now-previous)/1000));previous=now;
      stepExecutiveRunner(this.runner,delta);drawExecutiveRunner(context,this.runner);
      if(this.runner.phase==='failed'){
        this.jumpButton.disabled=true;this.message.textContent='ACCESS DENIED. Office equipment defeated you.';
        this.button('Restart',()=>this.start()).focus();return;
      }
      if(this.runner.phase==='final'){
        this.jumpButton.disabled=true;this.message.textContent='FINAL AUTHENTICATION TARGET: GILL BATES';
      }
      if(this.runner.phase==='won'){void this.complete();return;}
      this.frame=requestAnimationFrame(tick);
    };
    this.frame=requestAnimationFrame(tick);
  }

  jump(){if(this.runner)jumpExecutiveRunner(this.runner);}

  handleKey(event){
    if(!this.active||!this.runner||![' ','ArrowUp'].includes(event.key))return;
    // Let Space activate a focused Restart/Retry button after the run ends.
    if(!['running','final'].includes(this.runner.phase))return;
    event.preventDefault();
    if(event.type==='keydown'&&!event.repeat)this.jump();
  }

  async complete(){
    if(this.saving||this.runner?.phase!=='won'||!this.active)return;
    this.saving=true;const cycle=this.cycle;
    this.message.textContent='EXECUTIVE DEFEATED — Saving recovery...';
    try{
      const state=await requestDirectorWorkstation(this.host,'completeRecovery');
      if(this.current(cycle)){
        if(!state.recoveryComplete)throw new Error('RECOVERY_NOT_COMPLETE');
        this.showSuccess();
      }
    }catch{
      if(this.current(cycle)){
        this.message.textContent='Executive defeated, but recovery could not be saved. Retry without replaying.';
        this.retryButton??=this.button('Retry saving recovery',()=>void this.complete());
      }
    }finally{if(this.current(cycle))this.saving=false;}
  }

  showSuccess(){
    this.runner=null;this.host.resetPanel('EXECUTIVE DEFEATED','director-recovery');
    this.host.panel.append(el('h3','office3-command-success','IDENTITY VERIFIED'),
      el('p','','Congratulations. You are definitely the Director. No further evidence is required.'),
      el('p','','Emergency Remote Recovery completed. PC-DIRECTOR will recognize your authorization.'));
    this.button('Back to command prompt',()=>this.back()).focus();
  }

  close(){
    this.active=false;this.cycle++;clearTimeout(this.delay);
    globalThis.cancelAnimationFrame?.(this.frame);this.frame=null;this.delay=null;
    this.runner=null;this.saving=false;this.retryButton=null;
  }
}
