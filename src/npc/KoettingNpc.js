import { WorldPrompt } from '../ui/WorldPrompt.js';
import { renderQuizMedia } from '../QuizMedia.js';
import { loadOffice3Questions } from '../quiz/quizBank.js';
import { chooseOffice3Question, OFFICE3_FEEDBACK_MS } from '../office3/office3Puzzle.js';
import { CharacterItemClient } from '../inventory/CharacterItemClient.js';
import { CHARACTER_ITEM_IDS, normalizeCharacterItem } from '../inventory/characterItems.js';
import { hasProfileSession } from '../ProfileSessionClient.js';
import { koettingGiftOffsets, koettingMarker, KOETTING_REWARD_AMOUNT, KOETTING_STREAK_TARGET, nextKoettingStreak } from './koettingChallenge.js';
import { devPuzzleOneAnswerEnabled } from '../boss/devPuzzleSettings.js';
import './koettingNpc.css';

const INTERACTION_DISTANCE=58;
const TYPE_INTERVAL_MS=30;
const NPC_SIZE=Object.freeze({width:74,height:100});
const NPC_TILE_OFFSET_Y=.5;
const DIALOGUE=`Hey, Schüler. Warum bist du nicht im Unterricht?

Sag bloß nicht, du brauchst noch ein paar zusätzliche Excel-Aufgaben.

Und bevor du fragst ... ich bin definitiv nicht Herr Kötting.

Aber wenn ich Herr Kötting wäre – was ich natürlich nicht bin – hätte ich vielleicht ein paar Fragen für dich.

Beantworte drei davon richtig, und vielleicht bekommst du etwas Nützliches von mir.`;
const REWARD_LINE='Eine kleine Hilfe für deine ... völlig unerlaubte Suche nach dem Direktor.';

function element(tag,className,text){
  const node=document.createElement(tag);node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

export class KoettingNpc {
  constructor(scene){
    this.scene=scene;
    const marker=koettingMarker(scene.source);
    this.position={x:marker.x,y:marker.y+(scene.source.tileheight??32)*NPC_TILE_OFFSET_Y};
    this.figure=scene.add.image(this.position.x,this.position.y,'secret-path-koetting')
      .setOrigin(.5,1).setDisplaySize(NPC_SIZE.width,NPC_SIZE.height).setTint(0x8e9baa).setDepth(this.position.y);
    this.prompt=new WorldPrompt(scene,'[E] to speak to the mysterious man',{className:'koetting-world-prompt'});
    this.prompt.setPosition(this.position.x,this.position.y-88);
    this.giftPrompt=new WorldPrompt(scene,'[E] Tränke aufheben',{className:'koetting-gift-prompt'});
    this.giftPrompt.setPosition(this.position.x,this.position.y+6);

    this.root=element('div','koetting-overlay');this.root.hidden=true;
    this.root.dataset.blockGameShortcuts='';
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-label','Mysterious Man');
    this.panel=element('section','koetting-panel');
    const close=element('button','koetting-close','×');close.type='button';
    close.setAttribute('aria-label','Schließen');close.addEventListener('click',()=>this.close());
    this.portraitFrame=element('div','koetting-portrait-frame');
    this.portrait=element('img','koetting-portrait');
    this.portrait.alt='Ein geheimnisvoller Mann mit Sonnenbrille';
    this.portraitFrame.append(this.portrait);
    this.content=element('div','koetting-content');
    this.panel.append(close,this.portraitFrame,this.content);this.root.append(this.panel);document.body.append(this.root);
    this.onKeyDown=event=>{
      if(!this.active)return;
      if(event.key==='Escape'){
        event.preventDefault();event.stopImmediatePropagation();this.close();return;
      }
      event.stopImmediatePropagation();
    };
    window.addEventListener('keydown',this.onKeyDown,true);
    window.addEventListener('keyup',this.onKeyDown,true);
  }

  nearNpc(){
    const center=this.scene.player?.body?.center;
    return Boolean(center)&&Math.hypot(center.x-this.position.x,center.y-this.position.y)<=INTERACTION_DISTANCE;
  }
  nearGift(){
    const center=this.scene.player?.body?.center;
    return Boolean(this.gift&&center)&&Math.hypot(center.x-this.gift.x,center.y-this.gift.y)<=INTERACTION_DISTANCE;
  }
  updatePrompt(available){
    if(this.gift&&this.gift.owner!==this.scene.presence?.identity?.playerId)this.clearGift();
    const giftNear=Boolean(available&&!this.active&&this.nearGift());
    if(this.gift&&Date.now()>=(this.noticeUntil??0))
      this.giftPrompt.setText(`[E] ${this.gift.amount} ${this.gift.amount===1?'Trank':'Tränke'} aufheben`);
    this.giftPrompt.setVisible(giftNear);
    this.prompt.setVisible(Boolean(available&&!this.active&&!giftNear&&this.nearNpc()));
  }

  open(){
    if(this.active||!this.nearNpc())return false;
    this.openGeneration=(this.openGeneration??0)+1;
    this.active=true;this.busy=false;this.streak=0;this.usedIds=[];
    this.prompt.setVisible(false);this.giftPrompt.setVisible(false);
    this.scene.player.setVelocity(0,0);this.scene.input.keyboard.resetKeys();
    this.keyboardWasEnabled=this.scene.input.keyboard.enabled;
    this.scene.input.keyboard.enabled=false;
    this.root.hidden=false;this.showDialogue();return true;
  }

  setPortrait(path){this.portrait.src=`${import.meta.env.BASE_URL}${path}`;}
  showDialogue(){
    this.panel.dataset.stage='dialogue';this.setPortrait('assets/npc/koetting-brille.png');
    const name=element('h2','koetting-name','Mysterious Man');
    const bubble=element('div','koetting-speech');
    bubble.tabIndex=0;bubble.setAttribute('role','button');
    bubble.setAttribute('aria-label','Dialog vollständig anzeigen oder fortfahren');
    const text=element('p','koetting-speech-text','');
    bubble.append(text);
    const next=element('button','koetting-next','Weiter');next.type='button';
    const advance=()=>this.advanceDialogue();
    bubble.addEventListener('click',advance);
    bubble.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();advance();}
    });
    next.addEventListener('click',advance);
    this.content.replaceChildren(name,bubble,next);
    this.dialogueText=text;this.dialogueNext=next;this.typed=0;
    this.typeTimer=setInterval(()=>{
      this.typed=Math.min(DIALOGUE.length,this.typed+1);
      text.textContent=DIALOGUE.slice(0,this.typed);
      if(this.typed===DIALOGUE.length)this.finishTyping();
    },TYPE_INTERVAL_MS);
    next.focus();
  }
  finishTyping(){
    clearInterval(this.typeTimer);this.typeTimer=null;this.typed=DIALOGUE.length;
    this.dialogueText.textContent=DIALOGUE;
    this.dialogueNext.textContent='Zu den Fragen';
  }
  advanceDialogue(){
    if(this.typed<DIALOGUE.length){this.finishTyping();return;}
    if(!hasProfileSession(this.scene.presence)){this.showProfileRequired();return;}
    if(this.gift){this.showReward(false);return;}
    void this.startQuiz();
  }
  showProfileRequired(){
    this.content.replaceChildren(element('h2','koetting-name','Mysterious Man'),
      element('p','koetting-status','Melde dich mit einem Profil an, um die Fragen zu beantworten und das Geschenk zu erhalten.'));
  }

  async startQuiz(){
    if(this.busy)return;
    const generation=this.openGeneration;
    this.busy=true;this.streak=0;this.usedIds=[];
    this.quizTarget=devPuzzleOneAnswerEnabled()?1:KOETTING_STREAK_TARGET;
    this.panel.dataset.stage='quiz';
    this.content.replaceChildren(element('h2','koetting-name','Mysterious Man'),
      element('p','koetting-status','Fragen werden geladen…'));
    try{
      const questions=await loadOffice3Questions();
      if(!this.active||generation!==this.openGeneration)return;
      this.questions=questions;this.busy=false;this.showQuestion();
    }catch(error){
      if(!this.active||generation!==this.openGeneration)return;
      this.busy=false;
      const retry=element('button','koetting-next','Erneut versuchen');retry.type='button';
      retry.addEventListener('click',()=>void this.startQuiz());
      this.content.replaceChildren(element('h2','koetting-name','Mysterious Man'),
        element('p','koetting-status','Die Fragen konnten nicht geladen werden.'),retry);
      console.warn('Mysterious Man questions:',error);
    }
  }
  showQuestion(){
    if(!this.active)return;
    try{this.question=chooseOffice3Question(this.questions,this.usedIds);}
    catch(error){this.content.replaceChildren(element('p','koetting-status','Keine Fragen verfügbar.'));return;}
    this.usedIds.push(this.question.id);
    const heading=element('h2','koetting-name','Mysterious Man');
    const progress=element('p','koetting-progress',`${this.streak}/${this.quizTarget} richtig in Folge`);
    const media=element('div','koetting-media');renderQuizMedia(media,this.question.media);
    const prompt=element('p','koetting-question',this.question.question);
    const choices=element('div','koetting-choices');
    const feedback=element('p','koetting-feedback','');feedback.setAttribute('role','status');
    this.question.answers.forEach((answer,index)=>{
      const button=element('button','koetting-choice',answer);button.type='button';
      button.addEventListener('click',()=>this.answer(index,choices,feedback,progress));choices.append(button);
    });
    this.content.replaceChildren(heading,progress,media,prompt,choices,feedback);
    choices.querySelector('button')?.focus();
  }
  answer(index,choices,feedback,progress){
    if(!this.active||this.busy)return;
    this.busy=true;
    const correct=index===this.question.correctAnswer;
    this.streak=nextKoettingStreak(this.streak,correct,this.quizTarget);
    progress.textContent=`${this.streak}/${this.quizTarget} richtig in Folge`;
    feedback.textContent=correct?'Richtig!':`Falsch! Zurück auf 0/${this.quizTarget}.`;
    feedback.dataset.result=correct?'correct':'wrong';
    choices.querySelectorAll('button').forEach(button=>{button.disabled=true;});
    this.feedbackTimer=setTimeout(()=>{
      this.feedbackTimer=null;
      if(!this.active)return;
      this.busy=false;
      if(this.streak===this.quizTarget)this.showReward(true);
      else this.showQuestion();
    },OFFICE3_FEEDBACK_MS);
  }

  showReward(spawn){
    if(spawn&&!this.gift)this.spawnGift(KOETTING_REWARD_AMOUNT);
    this.panel.dataset.stage='reward';this.setPortrait('assets/npc/koetting-reward.png');
    const name=element('h2','koetting-name','Mysterious Man');
    const bubble=element('p','koetting-speech koetting-reward-line',REWARD_LINE);
    const instruction=element('p','koetting-status',`${KOETTING_REWARD_AMOUNT} Tränke liegen vor dir. Hebe den Stapel auf.`);
    const close=element('button','koetting-next','Zurück zum Gang');close.type='button';
    close.addEventListener('click',()=>this.close());
    this.content.replaceChildren(name,bubble,instruction,close);close.focus();
  }

  spawnGift(amount){
    const x=this.position.x,y=this.position.y+34;
    const sprites=koettingGiftOffsets(amount).map(([offsetX,offsetY])=>{
      const sprite=this.scene.add.image(x+offsetX,y+offsetY,'health-potion-pickup').setOrigin(.5,1)
        .setDisplaySize(48,48).setDepth(y+1).setInteractive({useHandCursor:true});
      sprite.on('pointerdown',()=>void this.collectGift());return sprite;
    });
    this.gift={x,y,amount,owner:this.scene.presence.identity.playerId,sprites};
  }
  clearGift(){
    for(const sprite of this.gift?.sprites??[])sprite.destroy();
    this.gift=null;this.giftPrompt.setVisible(false);
  }
  async collectGift(){
    const gift=this.gift,inventory=this.scene.characterItems;
    if(!gift||this.active||this.collecting||!inventory||inventory.destroyed||
      gift.owner!==this.scene.presence?.identity?.playerId)return false;
    this.collecting=true;
    try{
      const client=new CharacterItemClient(this.scene.presence);
      const {item,added}=await client.claimKoettingPotions(gift.amount);
      if(!this.gift||this.gift!==gift)return false;
      if(!added){
        if(inventory.destroyed)return false;
        this.giftPrompt.setText('Inventory full (10/10)').setVisible(true);
        this.noticeUntil=Date.now()+2500;return false;
      }
      gift.amount-=added;
      if(gift.amount<=0)this.clearGift();
      else gift.sprites.forEach((sprite,index)=>sprite.setVisible(index<gift.amount));
      if(inventory.destroyed)return true;
      inventory.setItems([...inventory.items.filter(row=>row.itemId!==CHARACTER_ITEM_IDS.HEALTH_POTION),item]);
      const card=normalizeCharacterItem(item,inventory.characterBaseId);
      this.scene.inventoryHotbar?.showItem(card,{eyebrow:'GESCHENK ERHALTEN'});
      return true;
    }catch(error){
      console.warn('Mysterious Man reward:',error);
      this.giftPrompt.setText('Could not collect the potions. Try again.').setVisible(true);
      this.noticeUntil=Date.now()+2500;return false;
    }finally{this.collecting=false;}
  }

  close(){
    if(!this.active)return;
    this.openGeneration++;
    clearInterval(this.typeTimer);clearTimeout(this.feedbackTimer);
    this.typeTimer=null;this.feedbackTimer=null;this.active=false;this.busy=false;
    this.root.hidden=true;this.content.replaceChildren();
    this.scene.input.keyboard.resetKeys();
    this.scene.input.keyboard.enabled=this.keyboardWasEnabled!==false;
    this.scene.game.canvas?.focus?.();
  }
  destroy(){
    this.close();this.clearGift();this.prompt.destroy();this.giftPrompt.destroy();
    this.figure.destroy();this.root.remove();
    window.removeEventListener('keydown',this.onKeyDown,true);
    window.removeEventListener('keyup',this.onKeyDown,true);
  }
}
