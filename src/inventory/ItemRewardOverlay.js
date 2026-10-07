import { RewardPresentationState,isRewardDismissKey } from '../boss/BossRewardOverlay.js';
import { createItemPresentationImage } from './itemPresentation.js';

// Shared interaction rules with boss rewards: a short lock prevents the pickup
// key from immediately closing an item presentation, then only explicit input closes it.
export class ItemRewardOverlay {
  constructor({documentRef=globalThis.document,baseUrl=import.meta.env?.BASE_URL??'/'}={}){
    this.doc=documentRef;this.baseUrl=baseUrl;
    this.state=new RewardPresentationState();this.root=this.doc.createElement('section');
    this.root.className='boss-reward-overlay boss-reward-presentation item';this.root.hidden=true;
    this.onKey=event=>{if(this.source!=='inventory'&&isRewardDismissKey(event)&&this.dismiss())event.preventDefault();};
    this.onClick=()=>{if(this.source!=='inventory')this.dismiss();};this.doc.addEventListener('keydown',this.onKey);this.root.addEventListener('click',this.onClick);this.doc.body.append(this.root);
  }
  show(item,{eyebrow='NEW ITEM',source='pickup',onReturn=null,mount=null}={}){
    this.close(true);this.source=source;this.onReturn=onReturn;this.state.begin();this.root.dataset.itemId=item.itemId;
    this.root.dataset.source=source;
    this.root.dataset.presentationStyle=item.presentationStyle??'';
    if(mount)mount.append(this.root);
    const panel=this.doc.createElement('div');panel.className='boss-reward-panel';
    const eyebrowLabel=this.doc.createElement('small');eyebrowLabel.textContent=eyebrow;
    const image=createItemPresentationImage(this.doc,item,this.baseUrl);
    const title=this.doc.createElement('h2');title.textContent=item.name;const description=this.doc.createElement('p');description.textContent=item.description;
    const button=this.doc.createElement('button');button.type='button';button.textContent=source==='inventory'?'Back':'Continue';button.disabled=source!=='inventory';this.backButton=button;
    button.addEventListener('click',event=>{event.stopPropagation();this.dismiss();});panel.append(eyebrowLabel,image,title,description,button);this.root.replaceChildren(panel);this.root.hidden=false;
    clearTimeout(this.unlockTimer);
    if(source==='inventory'){this.state.unlock();button.focus({preventScroll:true});}
    else this.unlockTimer=setTimeout(()=>{this.state.unlock();button.disabled=false;},500);
  }
  get active(){return !this.root.hidden;}
  dismiss(){if(!this.state.canDismiss(true))return false;return this.close();}
  close(force=false){if(!force&&!this.state.canDismiss(true))return false;clearTimeout(this.unlockTimer);this.state.end();this.root.hidden=true;this.root.replaceChildren();const onReturn=this.onReturn;this.onReturn=null;if(!force)onReturn?.();return true;}
  destroy(){this.close(true);this.doc.removeEventListener('keydown',this.onKey);this.root.removeEventListener('click',this.onClick);this.root.remove();}
}
