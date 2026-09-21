import { RewardPresentationState,isRewardDismissKey } from '../boss/BossRewardOverlay.js';

const publicAsset=path=>new URL(`${import.meta.env.BASE_URL}${path}`,document.baseURI).href;

// Shared interaction rules with boss rewards: a short lock prevents the pickup
// key from immediately closing an item presentation, then only explicit input closes it.
export class ItemRewardOverlay {
  constructor(){
    this.state=new RewardPresentationState();this.root=document.createElement('section');
    this.root.className='boss-reward-overlay boss-reward-presentation item';this.root.hidden=true;
    this.onKey=event=>{if(isRewardDismissKey(event)&&this.dismiss())event.preventDefault();};
    this.onClick=()=>this.dismiss();document.addEventListener('keydown',this.onKey);this.root.addEventListener('click',this.onClick);document.body.append(this.root);
  }
  show(item){
    this.close(true);this.state.begin();const panel=document.createElement('div');panel.className='boss-reward-panel';
    const eyebrow=document.createElement('small');eyebrow.textContent='NEW ITEM';
    const image=document.createElement('img');image.className='boss-reward-image';image.src=publicAsset(item.presentationImage);image.alt=item.name;
    const title=document.createElement('h2');title.textContent=item.name;const description=document.createElement('p');description.textContent=item.description;
    const button=document.createElement('button');button.type='button';button.textContent='Continue';button.disabled=true;
    button.addEventListener('click',event=>{event.stopPropagation();this.dismiss();});panel.append(eyebrow,image,title,description,button);this.root.replaceChildren(panel);this.root.hidden=false;
    clearTimeout(this.unlockTimer);this.unlockTimer=setTimeout(()=>{this.state.unlock();button.disabled=false;},500);
  }
  dismiss(){if(!this.state.canDismiss(true))return false;return this.close();}
  close(force=false){if(!force&&!this.state.canDismiss(true))return false;clearTimeout(this.unlockTimer);this.state.end();this.root.hidden=true;this.root.replaceChildren();return true;}
  destroy(){clearTimeout(this.unlockTimer);document.removeEventListener('keydown',this.onKey);this.root.removeEventListener('click',this.onClick);this.root.remove();}
}
