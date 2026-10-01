import { hasProfileSession } from '../ProfileSessionClient.js';
import { requestDirectorWorkstation } from './directorWorkstationClient.js';
import { directorSecurityState } from './directorSecurity.js';

function element(tag,className,text){
  const node=document.createElement(tag);
  node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

export class DirectorSecurityFlow {
  constructor(host){this.host=host;this.busy=false;this.state=null;}

  current(generation){return this.host.active&&this.host.generation===generation;}

  async request(method,extra={}){
    return requestDirectorWorkstation(this.host,method,extra);
  }

  async open(){
    const generation=this.host.generation;
    if(!hasProfileSession(this.host.scene.presence)){
      this.render(directorSecurityState(false));
      return;
    }
    this.host.resetPanel('DIRECTOR SECURITY','director-security');
    this.host.panel.append(element('p','','Loading security status...'));
    try{
      const state=await this.request('status');
      if(this.current(generation)){this.state=state;this.render(state);}
    }catch{
      if(this.current(generation))this.showUnavailable();
    }
  }

  async choose(choice){
    if(this.busy||!this.host.active||this.state?.stage!=='question'
      ||this.state.attemptedChoices?.includes(choice))return;
    this.busy=true;
    const generation=this.host.generation;
    this.host.resetPanel('SECURITY VERIFICATION','director-security');
    this.host.panel.append(element('p','','Checking Prostate Examination Confirmation...'));
    try{
      const state=await this.request('submitChoice',{choice});
      if(this.current(generation)){this.state=state;this.render(state,{rejected:true});}
    }catch{
      if(this.current(generation))this.showUnavailable();
    }finally{if(this.current(generation))this.busy=false;}
  }

  async verifyKey(){
    if(this.busy||!this.host.active)return;
    if(!hasProfileSession(this.host.scene.presence)){
      this.render(directorSecurityState(false),{missingKey:true});return;
    }
    this.busy=true;
    const generation=this.host.generation;
    try{
      const state=await this.request('verifyPhysicalKey');
      if(this.current(generation)){this.state=state;this.render(state,{missingKey:!state.factor1Verified});}
    }catch{
      if(this.current(generation))this.showUnavailable();
    }finally{if(this.current(generation))this.busy=false;}
  }

  factors(state){
    const factor1=element('p','director-security-factor',
      `Factor 1: Physical Director Key ........ ${state.factor1Verified?'VERIFIED':'MISSING'}`);
    const factor2=element('p','director-security-factor',
      `Factor 2: Prostate Examination Confirmation ........ ${!state.factor1Verified?'LOCKED':state.compromised?'FAILED':'PENDING'}`);
    this.host.panel.append(factor1,factor2);
  }

  render(state,{rejected=false,missingKey=false}={}){
    if(state.stage==='locked'){
      this.host.resetPanel('DIRECTOR SECURITY','director-security');
      this.factors(state);
      const verify=element('button','','VERIFY PHYSICAL KEY');verify.type='button';
      verify.addEventListener('click',()=>void this.verifyKey());this.host.panel.append(verify);
      if(missingKey)this.host.panel.append(element('p','director-security-denied',
        'No compatible security key detected.\nPlease insert the Golden Director Key.\nA normal key was apparently not dramatic enough.'));
      verify.focus();
      return;
    }
    if(state.stage==='recovered'){
      this.host.resetPanel('DIRECTOR SECURITY','director-security');this.factors(state);
      this.host.panel.append(element('p','office3-command-success','Emergency Remote Recovery: COMPLETED'),
        element('p','','Local authentication: COMPROMISED (remote recovery authorized).'),
        element('p','','IDENTITY VERIFIED'),
        element('p','','Director archive unlocked. Use dir, cd Private and open Endlich_Ferien.album.'));
      const files=element('button','','Open Director files');files.type='button';
      files.addEventListener('click',()=>this.host.openDirectorFiles());this.host.panel.append(files);files.focus();
      return;
    }
    if(state.stage==='compromised'){
      this.host.resetPanel('SECURITY ALERT','director-compromised');
      if(rejected)this.host.panel.append(element('p','director-security-denied',
        'ACCESS DENIED — Also incorrect. Please stop trying to understand the security system.'));
      this.host.panel.append(element('strong','director-security-alert','LOCAL ACCESS COMPROMISED'),
        element('p','','This workstation can no longer be accessed locally.'),
        element('p','','Emergency Remote Recovery is required.'),
        element('p','','Yes, this makes perfect sense.'),
        element('p','','Please stop asking questions and do not call IT Support.'));
      this.factors(state);
      return;
    }
    this.host.resetPanel('SECURITY VERIFICATION','director-security');
    this.factors(state);
    this.host.panel.append(element('p','director-security-instruction',
      'Select the correct answer to complete the examination.'));
    this.host.panel.append(element('p','director-security-intro','Both passwords are telling the truth.'));
    if(state.failedAttempts>0){
      this.host.panel.append(element('p','director-security-denied',
        'ACCESS DENIED\nIncorrect password.\nProstate verification confidence: 100%\nMedical justification: 0%'));
      this.host.panel.append(element('p','director-security-next-choice','One statement examined. Select the other statement.'));
    }
    const choices=element('div','director-security-choices');
    for(const [choice,label] of [
      ['left','The password on the right is wrong.'],
      ['right','The password on the left is lying.'],
    ]){
      const answered=state.attemptedChoices?.includes(choice);
      const button=element('button',`director-security-choice${answered?' is-answered':''}`,
        answered?`${label} — ANSWERED`:label);
      button.type='button';button.disabled=Boolean(answered);
      if(answered)button.setAttribute('aria-label',`${label} (already answered)`);
      button.addEventListener('click',()=>void this.choose(choice));choices.append(button);
    }
    this.host.panel.append(choices);
  }

  showUnavailable(){
    this.host.resetPanel('DIRECTOR SECURITY','director-security');
    this.host.panel.append(element('p','director-security-denied','Security status unavailable.'));
    const retry=element('button','','Retry');retry.type='button';
    retry.addEventListener('click',()=>void this.open());this.host.panel.append(retry);
  }

  close(){this.busy=false;this.state=null;}
}
