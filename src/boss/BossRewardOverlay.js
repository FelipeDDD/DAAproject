import { characterById } from '../characters.js';
import { BOSS_REWARDS } from './BossRewards.js';

const REWARD_COPY=Object.freeze({
  [BOSS_REWARDS.REMASTERED_SKIN]:{title:'Remastered character skin',description:'Equip it later at the classroom wardrobe.'},
  [BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]:{title:'Der Direktor – Sonderzugang',description:'Access to restricted school areas.'},
});

const publicAsset=path=>new URL(`${import.meta.env.BASE_URL}${path}`,document.baseURI).href;
export const remasteredPreviewAsset=characterId=>characterById(characterId)?.newVisual?.previewAsset;
export const isRewardDismissKey=event=>!event.repeat&&['e',' ','enter'].includes(String(event.key).toLowerCase());

export class RewardPresentationState {
  begin(){this.active=true;this.ready=false;}
  unlock(){if(this.active)this.ready=true;}
  canDismiss(explicit){return Boolean(this.active&&this.ready&&explicit);}
  end(){this.active=false;this.ready=false;}
}

export class BossRewardOverlay {
  constructor({characterId,getCharacterId,onChoose,onClose}){
    this.characterId=characterId;this.getCharacterId=getCharacterId;this.onChoose=onChoose;this.onClose=onClose;this.busy=false;
    this.presentationState=new RewardPresentationState();
    this.root=document.createElement('section');
    this.root.className='boss-reward-overlay';this.root.setAttribute('role','dialog');
    this.root.setAttribute('aria-modal','true');this.root.hidden=true;
    document.body.append(this.root);
    this.handleKey=event=>{
      if(!this.presentation||!isRewardDismissKey(event))return;
      if(this.requestDismiss())event.preventDefault();
    };
    this.handleClick=()=>this.requestDismiss();
    document.addEventListener('keydown',this.handleKey);
    this.root.addEventListener('click',this.handleClick);
  }

  rewardImage(rewardId){
    const image=document.createElement('img');
    image.className='boss-reward-image';image.decoding='async';
    if(rewardId===BOSS_REWARDS.DIRECTOR_ACCESS_BADGE){image.src=publicAsset('assets/school-key.png');image.alt='Golden Director badge and key';}
    else{
      const characterId=this.getCharacterId?.()??this.characterId;
      const character=characterById(characterId);
      image.src=publicAsset(remasteredPreviewAsset(characterId)??character?.asset??'');
      image.alt='Remastered character skin preview';
    }
    return image;
  }

  openChoice(rewardIds){
    this.clearPresentationTimers();this.presentationState.end();this.presentation=false;this.busy=false;this.root.className='boss-reward-overlay';this.root.replaceChildren();
    const panel=document.createElement('div');panel.className='boss-reward-panel';
    const title=document.createElement('h2');title.textContent='CHOOSE YOUR REWARD';panel.append(title);
    const cards=document.createElement('div');cards.className='boss-reward-cards';
    for(const rewardId of rewardIds){
      const copy=REWARD_COPY[rewardId];const button=document.createElement('button');
      button.type='button';button.className='boss-reward-card';button.dataset.rewardId=rewardId;
      const image=this.rewardImage(rewardId);const heading=document.createElement('strong');heading.textContent=copy.title;
      const description=document.createElement('span');description.textContent=copy.description;
      button.append(image,heading,description);button.addEventListener('click',()=>this.select(rewardId));cards.append(button);
    }
    panel.append(cards);this.root.append(panel);this.root.hidden=false;
  }

  async select(rewardId){
    if(this.busy)return;this.busy=true;
    for(const button of this.root.querySelectorAll('button'))button.disabled=true;
    try{await this.onChoose(rewardId);}catch(error){
      this.busy=false;for(const button of this.root.querySelectorAll('button'))button.disabled=false;
      this.showError(error.message);
    }
  }

  showReward(rewardId){
    this.clearPresentationTimers();this.presentation=true;this.dismissReady=false;this.presentationState.begin();
    const badge=rewardId===BOSS_REWARDS.DIRECTOR_ACCESS_BADGE;
    const copy=REWARD_COPY[rewardId];this.root.className=`boss-reward-overlay boss-reward-presentation ${badge?'badge':'skin'}`;
    this.root.replaceChildren();const panel=document.createElement('div');panel.className='boss-reward-panel';
    const eyebrow=document.createElement('small');eyebrow.textContent=badge?'NEW ITEM':'NEW SKIN';
    const image=this.rewardImage(rewardId);const title=document.createElement('h2');title.textContent=copy.title;
    const description=document.createElement('p');description.textContent=copy.description;
    const close=document.createElement('button');close.type='button';close.textContent='Continue';close.disabled=true;
    close.addEventListener('click',event=>{event.stopPropagation();this.requestDismiss();});
    panel.append(eyebrow,image,title,description,close);this.root.append(panel);this.root.hidden=false;
    this.dismissTimer=setTimeout(()=>{this.dismissReady=true;this.presentationState.unlock();close.disabled=false;},500);
  }

  showMessage(title,message){
    this.clearPresentationTimers();this.presentationState.end();this.presentation=false;
    this.root.className='boss-reward-overlay';this.root.replaceChildren();
    const panel=document.createElement('div');panel.className='boss-reward-panel';
    const heading=document.createElement('h2');heading.textContent=title;const text=document.createElement('p');text.textContent=message;
    const close=document.createElement('button');close.type='button';close.textContent='Continue';close.addEventListener('click',()=>this.close({explicit:true}));
    panel.append(heading,text,close);this.root.append(panel);this.root.hidden=false;
  }

  showError(message){
    let status=this.root.querySelector('[role=status]');
    if(!status){status=document.createElement('p');status.setAttribute('role','status');this.root.querySelector('.boss-reward-panel')?.append(status);}
    status.textContent=message;
  }

  clearPresentationTimers(){clearTimeout(this.dismissTimer);this.dismissTimer=null;}
  requestDismiss(){
    if(!this.presentationState.canDismiss(true))return false;
    return this.close({explicit:true});
  }
  close({explicit=false,force=false}={}){
    if(this.presentation&&!force&&!this.presentationState.canDismiss(explicit))return false;
    this.clearPresentationTimers();this.presentationState.end();this.presentation=false;this.dismissReady=false;
    const wasOpen=!this.root.hidden;this.root.hidden=true;this.root.replaceChildren();this.busy=false;
    if(wasOpen)this.onClose?.();
    return wasOpen;
  }
  destroy(){
    this.clearPresentationTimers();this.presentationState.end();document.removeEventListener('keydown',this.handleKey);
    this.root.removeEventListener('click',this.handleClick);this.root.remove();
  }
}
