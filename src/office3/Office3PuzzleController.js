import { CHARACTER_ITEM_IDS, characterItemDefinition } from '../inventory/characterItems.js';
import { hasProfileSession, requireProfileSessionToken } from '../ProfileSessionClient.js';
import { createComputerSession, runComputerCommand } from '../terminal/virtualComputer.js';
import { createOffice3ComputerSession, OFFICE3_COMPUTER, runOfficeCommand } from './office3Computer.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import { renderQuizMedia } from '../QuizMedia.js';
import { office3PaperPlacement } from '../art/office3PaperHighlight.js';
import { loadOffice3Questions } from '../quiz/quizBank.js';
import { PuzzleQuizClient } from '../economy/PuzzleQuizClient.js';
import { readNamedMapMarker } from '../maps/namedMapMarkers.js';
import { pointInsideInteractionArea, readNamedInteractionArea } from '../maps/namedInteractionAreas.js';
import { devPuzzleOneAnswerEnabled } from '../boss/devPuzzleSettings.js';
import { DirectorSecurityFlow } from '../office2/DirectorSecurityFlow.js';
import { DirectorRecoveryFlow } from '../office2/DirectorRecoveryFlow.js';
import { PhotoAlbumViewer } from '../ui/PhotoAlbumViewer.js';
import { DIRECTOR_INVESTIGATION_EVENT } from '../office2/directorInvestigation.js';
import {
  OFFICE3_FEEDBACK_MS, OFFICE3_PASSWORD_DENIED_MS, OFFICE3_MONITOR, OFFICE3_STREAK_TARGET,
  chooseOffice3Question, nextStreak, passwordIsCorrect,
} from './office3Puzzle.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export class Office3PuzzleController {
  constructor(scene,{computerMode='office3',computerConfig=OFFICE3_COMPUTER,markerName='PC-User',interactionAreaName=null}={}) {
    this.scene = scene;
    this.computerMode=computerMode;
    this.computerConfig=computerConfig;
    this.directorSecurity=computerMode==='director'?new DirectorSecurityFlow(this):null;
    this.pcMarker=computerMode==='office3'?null:readNamedMapMarker(scene.source,markerName);
    this.pcInteractionRadius=this.pcMarker?.properties.interactionDistance??OFFICE3_MONITOR.radius;
    this.pcInteractionArea=computerMode!=='office3'&&interactionAreaName
      ?readNamedInteractionArea(scene.source,interactionAreaName):null;
    this.active = false;
    this.busy = false;
    this.streak = 0;
    this.quizTarget = OFFICE3_STREAK_TARGET;
    this.usedIds = [];
    this.generation = 0;
    this.correctAnswers = [];
    this.safePrompt = computerMode==='office3'
      ?new WorldPrompt(scene, 'Press E to open safe', {className:'office3-terminal-prompt'}):null;
    if(scene.officeSafe?.marker)this.safePrompt?.setPosition(scene.officeSafe.x,scene.officeSafe.y-40);
    this.paperMarker = computerMode==='office3'?office3PaperPlacement(scene.source):null;
    this.prompt = new WorldPrompt(scene, computerMode==='director'
      ?'Press E to inspect Director computer':'Press E to access terminal', { className: 'office3-terminal-prompt' });
    if(computerMode==='office3')this.prompt.setPosition(OFFICE3_MONITOR.x,OFFICE3_MONITOR.y-20);
    else if(this.pcMarker)this.prompt.setPosition(this.pcMarker.x,this.pcMarker.y-20);
    this.paperPrompt = computerMode==='office3'
      ?new WorldPrompt(scene, 'Press E to inspect paper', { className: 'office3-paper-prompt' }):null;
    if(this.paperMarker)this.paperPrompt?.setPosition(this.paperMarker.x,this.paperMarker.y - 23);

    this.root = element('div', 'office3-puzzle-overlay');
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'Office terminal');
    this.root.dataset.blockGameShortcuts = '';
    this.panel = element('section', 'office3-puzzle-panel');
    this.root.append(this.panel);
    document.body.append(this.root);
    this.onKeyDown = event => this.handleKey(event);
    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyDown, true);
  }

  handleKey(event) {
      if(this.albumViewer?.active){
        if(event.key==='Escape'&&event.type==='keydown')this.releaseAlbumEscape=true;
        this.albumViewer.handleKey(event);
        event.stopImmediatePropagation();
        return;
      }
      if(event.key==='Escape'&&this.releaseAlbumEscape){
        event.preventDefault();event.stopImmediatePropagation();
        if(event.type==='keyup')this.releaseAlbumEscape=false;
        return;
      }
      if(event.type==='keydown')this.releaseAlbumEscape=false;
      // Closing on keydown must also consume its keyup/repeats. Otherwise Esc
      // escapes into browser/game shortcuts after the dialog has disappeared.
      if (event.key === 'Escape' && (this.active || this.releaseEscape)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.type === 'keydown') {
          this.releaseEscape = true;
          this.close();
        } else {
          this.releaseEscape = false;
          this.restoreGameFocus();
        }
        return;
      }
      if (event.type === 'keydown') this.releaseEscape = false;
      if (!this.active) return;
      this.directorRecovery?.handleKey(event);
      // Suppress game/emote/hotbar shortcuts while this dialog has the keyboard.
      if(event.type==='keydown'&&event.key==='Enter'&&this.commandInput===document.activeElement){
        event.preventDefault();void this.executeCommand();
      }
      event.stopImmediatePropagation();
  }

  nearMonitor() {
    const body = this.scene.player?.body;
    if(!body)return false;
    if(this.computerMode==='office3')return Math.hypot(body.center.x-OFFICE3_MONITOR.x,
      body.center.y-OFFICE3_MONITOR.interactionY)<=OFFICE3_MONITOR.radius;
    if(!this.pcMarker)return false;
    if(this.pcInteractionArea)
      return pointInsideInteractionArea(this.pcInteractionArea,body.center.x,body.center.y);
    return Math.hypot(body.center.x - this.pcMarker.x,
      body.center.y - this.pcMarker.y) <= this.pcInteractionRadius;
  }

  nearPaper() {
    const body = this.scene.player?.body;
    if (!body || !this.paperMarker) return false;
    return Math.hypot(body.center.x - this.paperMarker.x,
      body.center.y - this.paperMarker.y) <= 48;
  }

  nearSafe() {
    const body=this.scene.player?.body,safe=this.scene.officeSafe;
    return Boolean(body&&safe?.marker&&Math.hypot(body.center.x-safe.x,body.center.y-safe.y)<55);
  }

  updatePrompt(available) {
    this.prompt.setVisible(Boolean(available) && !this.active && this.nearMonitor());
    this.paperPrompt?.setVisible(Boolean(available) && !this.active && this.nearPaper());
    this.safePrompt?.setVisible(Boolean(available) && !this.active && this.nearSafe());
    if(this.computerMode==='office3')this.scene.officeSafe?.setOpen(Boolean(this.scene.characterItems?.items.some(item=>item.itemId===CHARACTER_ITEM_IDS.OFFICE2_KEY)));
  }

  activate() {
    if (this.active) return false;
    this.active = true;
    this.generation++;
    this.busy = false;
    this.prompt.setVisible(false);
    this.paperPrompt?.setVisible(false);
    this.safePrompt?.setVisible(false);
    this.scene.player.setVelocity(0, 0);
    this.scene.input.keyboard.resetKeys();
    this.keyboardWasEnabled = this.scene.input.keyboard.enabled;
    this.scene.input.keyboard.enabled = false;
    this.root.hidden = false;
    return true;
  }

  open() {
    if (!this.nearMonitor() || !this.scene.presence || !this.activate()) return false;
    if(this.directorSecurity){void this.directorSecurity.open();return true;}
    if(this.computerMode!=='office3'){
      this.safeCode='';this.folder='';this.computerSession=createComputerSession(this.computerConfig);
      this.commandHistory=[];this.showComputer();return true;
    }
    if(this.scene.registry.get('office3-computer-blocked')>Date.now())this.showComputerCooldown();
    else if (hasProfileSession(this.scene.presence)) this.showPassword();
    else this.showProfileRequired();
    return true;
  }

  openPaper() {
    if (!this.nearPaper() || !this.activate()) return false;
    this.panel.replaceChildren();
    this.panel.classList.remove('quiz');
    this.panel.classList.add('paper');
    this.root.setAttribute('aria-label', 'Yellow paper');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close paper');
    close.addEventListener('click', () => this.close());
    const image = element('img', 'office3-paper-image');
    image.src = `${import.meta.env.BASE_URL}assets/items/yellow-paper-item.png`;
    image.alt = 'Handwritten note: /28 + /29 - /23';
    this.panel.append(close, image);
    close.focus();
    return true;
  }

  showProfileRequired() {
    this.panel.classList.remove('quiz', 'paper');
    this.root.setAttribute('aria-label', 'Office terminal');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.replaceChildren(close, element('h2', '', 'OFFICE TERMINAL'),
      element('p', '', 'Sign in with a profile to collect the office key.'));
    close.focus();
  }

  showPassword() {
    this.panel.replaceChildren();
    this.panel.classList.remove('quiz', 'paper');
    this.root.setAttribute('aria-label', 'Office terminal');
    const heading = element('h2', '', 'OFFICE TERMINAL');
    const form = element('form', 'office3-password-form');
    const label = element('label', '', 'Password:');
    const prefix = element('span', 'office3-password-prefix', '-');
    const input = element('input', 'office3-password-input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.maxLength = 3;
    input.placeholder = '***';
    input.setAttribute('aria-label', 'Three password digits; the minus sign is already entered');
    input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 3); });
    label.append(prefix, input);
    const submit = element('button', '', 'Submit');
    submit.type = 'submit';
    const feedback = element('p', 'office3-puzzle-feedback');
    feedback.setAttribute('role', 'status');
    form.append(label, submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (this.busy) return;
      this.busy = true;
      const correct = passwordIsCorrect(input.value);
      input.disabled = true;
      submit.disabled = true;
      feedback.textContent = correct ? 'Access confirmed' : 'Access denied';
      // Restart the CSS animation when another denied attempt uses this same element.
      feedback.removeAttribute('data-result');
      void feedback.offsetWidth;
      feedback.dataset.result = correct ? 'correct' : 'wrong';
      this.delay = setTimeout(() => {
        this.delay = null;
        if (!this.active) return;
        this.busy = false;
        if (correct) this.startQuiz();
        else { input.value = ''; input.disabled = false; submit.disabled = false; input.focus(); }
      }, correct ? OFFICE3_FEEDBACK_MS : OFFICE3_PASSWORD_DENIED_MS);
    });
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.append(close, heading, form, feedback);
    input.focus();
  }

  async startQuiz() {
    if(this.busy)return false;
    const generation=this.generation;
    this.busy=true;
    this.streak = 0;
    this.usedIds = [];
    this.correctAnswers = [];
    this.panel.replaceChildren(element('h2','','OFFICE TERMINAL'),element('p','','Loading questions...'));
    try{
      const [staticQuestions,status,puzzleQuiz]=await Promise.all([
        loadOffice3Questions(),this.safeRequest('challengeStatus',{password:'488'}),
        new PuzzleQuizClient(this.scene.presence,'office3').start(),
      ]);
      if(!this.active||generation!==this.generation)return false;
      if(status.blockedUntil>Date.now()){
        this.scene.registry.set('office3-computer-blocked',status.blockedUntil);
        this.showComputerCooldown();return false;
      }
      this.proofAnswerCount=status.requiredAnswers;
      this.quizTarget=devPuzzleOneAnswerEnabled()?1:status.requiredAnswers;
      this.questionBank=staticQuestions;
      this.puzzleQuiz=puzzleQuiz;
      this.showQuestion();
      return true;
    }catch(error){
      if(!this.active||generation!==this.generation)return false;
      this.panel.replaceChildren(element('h2','','OFFICE TERMINAL'),
        element('p','','Questions could not be loaded. Check your connection and try again.'));
      const retry=element('button','','Retry');retry.type='button';
      retry.addEventListener('click',()=>{retry.disabled=true;void this.startQuiz();});
      const close=element('button','office3-puzzle-close','×');close.type='button';
      close.setAttribute('aria-label','Close terminal');close.addEventListener('click',()=>this.close());
      this.panel.prepend(close,retry);
      return false;
    }finally{if(this.active&&generation===this.generation)this.busy=false;}
  }

  showQuestion() {
    if (!this.active) return;
    this.question = chooseOffice3Question(this.questionBank,this.usedIds);
    this.puzzleQuiz.prepare(this.question);
    this.usedIds.push(this.question.id);
    this.panel.replaceChildren();
    this.panel.classList.add('quiz');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    const title = element('h2', '', 'ACCESS CONFIRMATION');
    const instructions = element('p', 'office3-puzzle-instructions',
      `Beantworte ${this.quizTarget} Fragen richtig in Folge, um den Zugriff zu bestätigen.`);
    const progress = element('p', 'office3-puzzle-progress', this.streak + '/' + this.quizTarget);
    const media = element('div', 'office3-puzzle-media');
    renderQuizMedia(media, this.question.media);
    const question = element('p', 'office3-puzzle-question', this.question.question);
    const choices = element('div', 'office3-puzzle-choices');
    const feedback = element('p', 'office3-puzzle-feedback');
    feedback.setAttribute('role', 'status');
    this.question.answers.forEach((answer, index) => {
      const button = element('button', 'office3-puzzle-choice', answer);
      button.type = 'button';
      button.addEventListener('click', () => this.answer(index, choices, feedback, progress));
      choices.append(button);
    });
    this.panel.append(close, title, instructions, progress, media, question, choices, feedback);
    choices.querySelector('button')?.focus();
  }

  async answer(index, choices, feedback, progress) {
    if (!this.active || this.busy) return;
    this.busy = true;
    const generation=this.generation;
    choices.querySelectorAll('button').forEach(button=>{button.disabled=true;});
    let correct;
    try{({correct}=await this.puzzleQuiz.answer(index));}
    catch{
      if(!this.active||generation!==this.generation)return;
      feedback.textContent='Could not save answer. Please try again.';
      this.busy=false;choices.querySelectorAll('button').forEach(button=>{button.disabled=false;});return;
    }
    if(!this.active||generation!==this.generation)return;
    this.streak = nextStreak(this.streak, correct, this.quizTarget);
    if(correct)this.correctAnswers.push({id:this.question.id,answer:this.question.answers[index]});
    else this.correctAnswers=[];
    progress.textContent = this.streak + '/' + this.quizTarget;
    feedback.textContent = correct ? 'Richtig!' : `Falsch! Die Serie beginnt bei 0/${this.quizTarget}.`;
    feedback.dataset.result = correct ? 'correct' : 'wrong';
    choices.querySelectorAll('button').forEach(button => { button.disabled = true; });
    this.delay = setTimeout(() => {
      this.delay = null;
      if (!this.active) return;
      if (this.streak === this.quizTarget) void this.unlockComputer();
      else { this.busy = false; this.showQuestion(); }
    }, OFFICE3_FEEDBACK_MS);
  }

  async safeRequest(method, extra={}) {
    const presence=this.scene.presence;
    try {
      const call=method==='challengeStatus'?'query':'mutation';
      return await presence.client[call](presence.api.office3Safe[method],{
        token:requireProfileSessionToken(presence),playerId:presence.identity.playerId,
        sessionId:presence.identity.sessionId,...extra,
      });
    } catch(error) {
      if(String(error).includes('CHARACTER_SESSION_LOST')||String(error).includes('SESSION_INVALID')) {
        this.close();presence.fail(new Error('CHARACTER_SESSION_LOST'));
      }
      throw error;
    }
  }

  resetPanel(title, kind='') {
    this.commandInput=null;
    this.panel.classList.remove('quiz','paper','reward','computer','notepad','director-security','director-compromised','director-recovery');
    if(kind)this.panel.classList.add(kind);
    this.root.setAttribute('aria-label',title);
    const close=element('button','office3-puzzle-close','×');close.type='button';
    close.setAttribute('aria-label','Close');close.addEventListener('click',()=>this.close());
    this.panel.replaceChildren(close,element('h2','',title));
    return close;
  }

  showComputerCooldown() {
    const close=this.resetPanel('COMPUTER OFFLINE');
    this.panel.append(element('p','','Restarting. Please try again in a few seconds.'));
    close.focus();
  }

  async unlockComputer() {
    const generation=this.generation;
    this.busy=true;this.resetPanel('ACCESS CONFIRMED');
    this.panel.append(element('p','','Opening command prompt...'));
    try {
      const result=await this.safeRequest('unlockComputer',{password:'488',answers:this.answersForUnlock()});
      if(!this.active||generation!==this.generation)return;
      if(result.blockedUntil){this.scene.registry.set('office3-computer-blocked',result.blockedUntil);this.showComputerCooldown();return;}
      this.safeCode=result.code;this.folder='';this.computerSession=createOffice3ComputerSession();
      this.commandHistory=[];this.showComputer();
    } catch(error) {
      if(!this.active||generation!==this.generation)return;
      this.resetPanel('COMPUTER UNAVAILABLE');
      this.panel.append(element('p','','Could not open the computer. Please try again.'));
      const retry=element('button','','Retry');retry.type='button';
      retry.addEventListener('click',()=>{if(!this.busy)void this.unlockComputer();});this.panel.append(retry);
    } finally {if(generation===this.generation)this.busy=false;}
  }

  answersForUnlock(){
    const answers=[...this.correctAnswers];
    if(!devPuzzleOneAnswerEnabled()||answers.length>=this.proofAnswerCount)return answers;
    const included=new Set(answers.map(answer=>answer.id));
    for(const question of this.questionBank??[]){
      if(included.has(question.id)||!question.answers?.[question.correctAnswer])continue;
      answers.push({id:question.id,answer:question.answers[question.correctAnswer]});
      included.add(question.id);
      if(answers.length>=this.proofAnswerCount)break;
    }
    return answers;
  }

  showComputer() {
    const title=this.computerMode==='office3'?'Command Prompt':`${this.computerConfig.hostname} · Command Prompt`;
    this.resetPanel(title,'computer');
    const banner=this.computerMode!=='office3'
      ?`Office OS [Version 3.0]\nHost: ${this.computerConfig.hostname}`
      :'Office OS [Version 3.0]';
    this.panel.append(element('p','office3-command-banner',banner));
    const output=element('div','office3-command-output');output.setAttribute('role','log');
    for(const line of this.commandHistory??[])output.append(element('pre',
      line.error?'office3-command-error':line.success?'office3-command-success':'',line.text));
    this.commandOutput=output;
    const form=element('form','office3-command-form');
    const label=element('label','',`C:\\${this.folder}>`);
    const input=element('input','office3-command-input');input.type='text';input.autocomplete='off';input.spellcheck=false;
    input.maxLength=160;input.setAttribute('aria-label','Command');
    const run=element('button','','Run');run.type='submit';
    label.append(input);form.append(label,run);
    form.addEventListener('submit',event=>{event.preventDefault();void this.executeCommand();});
    this.panel.append(output,form);this.commandInput=input;input.focus();output.scrollTop=output.scrollHeight;
  }

  openDirectorFiles(){
    if(!this.active||this.computerMode!=='director'||this.directorSecurity?.state?.stage!=='recovered')return false;
    this.folder='';this.computerSession=createComputerSession(this.computerConfig);this.commandHistory=[];
    this.showComputer();return true;
  }

  showAlbum(album,filename){
    this.showComputer();
    this.albumViewer??=new PhotoAlbumViewer({mount:this.root,baseUrl:import.meta.env.BASE_URL});
    this.albumViewer.open(album,{filename,underlay:this.panel});
  }

  async executeCommand() {
    if(this.busy||!this.commandInput||!this.active||this.albumViewer?.active)return;
    const command=this.commandInput.value;if(!command.trim())return;
    this.computerSession ??= this.computerMode!=='office3'
      ?createComputerSession(this.computerConfig):createOffice3ComputerSession();
    const result=this.computerMode!=='office3'
      ?runComputerCommand(this.computerConfig,this.computerSession,command)
      :runOfficeCommand(this.folder,command,this.safeCode,this.computerSession);
    this.commandHistory.push({text:`C:\\${this.folder}> ${command}`});
    if(result.message)this.commandHistory.push({text:result.message,error:result.error,success:result.success});
    this.commandHistory=this.commandHistory.slice(-80);this.folder=result.folder;
    if(result.shutdown){
      const generation=this.generation;this.busy=true;
      try {
        const state=await this.safeRequest('shutdownComputer');
        this.scene.registry.set('office3-computer-blocked',state.blockedUntil);
        if(this.active&&generation===this.generation)this.close();
      }catch(error){
        if(this.active&&generation===this.generation){this.commandHistory.push({text:'Shutdown failed. Try again.',error:true});this.showComputer();}
      }finally{if(generation===this.generation)this.busy=false;}
      return;
    }
    if(result.service?.interaction==='director-recovery'){
      this.directorRecovery??=new DirectorRecoveryFlow(this);
      await this.directorRecovery.open();
    }else if(result.service){
      this.resetPanel(result.service.title,'computer');
      this.panel.append(element('pre','office3-notepad-text',result.service.banner));
      const back=element('button','','Back to command prompt');back.type='button';
      back.addEventListener('click',()=>this.showComputer());this.panel.append(back);back.focus();
    }else if(result.album){
      this.showAlbum(result.album,result.title);
    }else if(result.note!==undefined){
      this.resetPanel(`${result.title} — Notepad`,'notepad');
      this.panel.append(element('pre','office3-notepad-text',result.note));
      const back=element('button','','Back to command prompt');back.type='button';
      back.addEventListener('click',()=>this.showComputer());this.panel.append(back);back.focus();
      if(this.computerMode==='director'&&result.interaction===DIRECTOR_INVESTIGATION_EVENT){
        const generation=this.generation;this.busy=true;
        try{
          const state=await this.scene.directorInvestigation?.activate();
          if(!state)throw new Error('Investigation unavailable');
        }catch{
          if(this.active&&generation===this.generation)this.panel.append(element('p','office3-command-error',
            'Could not save the investigation. Open this note again to retry.'));
        }finally{if(generation===this.generation)this.busy=false;}
      }
    }else this.showComputer();
  }

  openSafe() {
    if(!this.nearSafe()||!this.activate())return false;
    if(!hasProfileSession(this.scene.presence))this.showProfileRequired();
    else this.showSafeForm();
    return true;
  }

  showSafeForm() {
    this.resetPanel('DIGITAL SAFE');
    const form=element('form','office3-password-form');
    const label=element('label','','Safe code:');
    const input=element('input','office3-password-input');input.type='text';input.inputMode='numeric';
    input.autocomplete='off';input.maxLength=4;input.setAttribute('aria-label','Four digit safe code');
    input.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,4);});
    const submit=element('button','','Open safe');submit.type='submit';label.append(input);form.append(label,submit);
    const feedback=element('p','office3-command-error');feedback.setAttribute('role','status');
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(this.busy)return;
      if(input.value.length!==4){feedback.textContent='Enter all four digits.';return;}
      const generation=this.generation;this.busy=true;submit.disabled=true;
      try{
        const result=await this.safeRequest('open',{code:input.value});
        if(!this.active||generation!==this.generation)return;
        if(result.ok)await this.grantKey(result);
        else feedback.textContent=result.blockedUntil>Date.now()?'Too many attempts. Please wait 30 seconds.':'Incorrect code. Check your computer files.';
      }catch(error){if(this.active&&generation===this.generation)feedback.textContent='Could not reach the safe. Please try again.';}
      finally{if(generation===this.generation){this.busy=false;submit.disabled=false;}}
    });
    this.panel.append(form,feedback);input.focus();
  }

  async grantKey(result) {
    this.panel.classList.remove('reward');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.replaceChildren(close, element('h2', '', 'ACCESS CONFIRMED'));
    const message = element('p', 'office3-puzzle-success', 'Saving key...');
    this.panel.append(message);
    try {
      const inventory = this.scene.characterItems;
      if (!inventory) throw new Error('A profile inventory is required.');
      if (inventory.destroyed) return;
      inventory.setItems([...inventory.items.filter(item => item.itemId !== CHARACTER_ITEM_IDS.OFFICE2_KEY),result.item]);
      this.scene.officeSafe?.setOpen(true);
      if (!this.active) return;
      const keyImage = element('img', 'office3-reward-key');
      keyImage.src = `${import.meta.env.BASE_URL}${characterItemDefinition(CHARACTER_ITEM_IDS.OFFICE2_KEY).icon}`;
      keyImage.alt = "Silver key to the Director's office";
      this.panel.insertBefore(keyImage, message);
      this.panel.classList.add('reward');
      message.textContent = 'Du hast den Schlüssel für das Büro des Direktors erhalten.';
      this.panel.append(element('p', 'office3-puzzle-feedback', 'The key is now in your inventory.'));
    } catch (error) {
      if (!this.active) return;
      message.textContent = 'The key could not be saved.';
      this.panel.append(element('p', 'office3-puzzle-feedback', 'Could not save the key. Please try again.'));
      const retry = element('button', '', 'Retry');
      retry.type = 'button';
      retry.addEventListener('click', () => this.showSafeForm());
      this.panel.append(retry);
      console.warn('Office terminal reward:', error);
    } finally {
      this.busy = false;
    }
  }

  restoreGameFocus() {
    const scene=this.scene;
    if(this.destroyed||this.active||
      (scene.scene?.isActive&&!scene.scene.isActive())||scene.chat?.isInputActive||
      scene.terminal?.active||scene.puzzleTerminal?.active||scene.networkTerminal?.active)return;
    // Return focus while the input still exists, before hiding/removing it.
    globalThis.window?.focus?.();
    globalThis.document?.getElementById?.('game')?.focus?.({preventScroll:true});
  }

  close() {
    if (!this.active) return;
    this.albumViewer?.close({restoreFocus:false});
    clearTimeout(this.delay);
    this.delay = null;
    this.active = false;
    this.generation++;
    this.directorSecurity?.close();
    this.directorRecovery?.close();
    this.commandInput=null;
    this.safeCode=null;
    this.computerSession=null;
    this.busy = false;
    this.restoreGameFocus();
    this.root.hidden = true;
    this.panel.replaceChildren();
    this.panel.classList.remove('paper', 'reward', 'computer', 'notepad','director-security','director-compromised','director-recovery');
    this.scene.input.keyboard.resetKeys();
    const restoreKeyboard=this.keyboardWasEnabled!==false;
    this.scene.input.keyboard.enabled=restoreKeyboard;
    // The browser can move focus again after the Esc event removes the focused input.
    const generation=this.generation,scene=this.scene;
    const afterEvent=globalThis.requestAnimationFrame??queueMicrotask;
    afterEvent(()=>{
      if(this.destroyed||this.active||this.generation!==generation||
        (scene.scene?.isActive&&!scene.scene.isActive())||scene.chat?.isInputActive||
        scene.terminal?.active||scene.puzzleTerminal?.active||scene.networkTerminal?.active)return;
      scene.input.keyboard.enabled=restoreKeyboard;
      this.restoreGameFocus();
    });
  }

  destroy() {
    this.destroyed=true;
    this.close();
    this.albumViewer?.destroy();
    this.prompt.destroy();
    this.paperPrompt?.destroy();
    this.safePrompt?.destroy();
    this.root.remove();
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyDown, true);
  }
}
