import { BossProgressClient } from './BossProgressClient.js';

export const shouldShowBossDevTools=env=>env?.DEV===true;

const PRESETS=Object.freeze([
  ['fresh','Fresh'],['skin_only','Skin only'],['badge_only','Badge only'],
  ['both_unlocked','Both unlocked'],['one_win','1 win'],['two_wins','2 wins'],
]);

export class BossDevTools {
  constructor(scene,presence,{documentRef=globalThis.document}={}){
    const document=documentRef;
    this.scene=scene;this.client=new BossProgressClient(presence);this.busy=false;
    this.root=document.createElement('aside');this.root.className='boss-dev-tools';
    const title=document.createElement('strong');title.textContent='DEV TOOLS';
    const header=document.createElement('div');header.className='boss-dev-tools-header';
    this.toggleButton=document.createElement('button');this.toggleButton.type='button';
    this.toggleButton.addEventListener('click',()=>this.setCollapsed(!this.collapsed));
    header.append(title,this.toggleButton);
    this.content=document.createElement('div');this.content.id='boss-dev-tools-content';
    this.toggleButton.setAttribute('aria-controls',this.content.id);
    const buttons=document.createElement('div');buttons.className='boss-dev-tools-presets';
    for(const [preset,label] of PRESETS){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',()=>this.apply(preset,label));buttons.append(button);
    }
    this.status=document.createElement('small');this.status.setAttribute('role','status');
    this.content.append(buttons,this.status);this.root.append(header,this.content);document.body.append(this.root);
    this.setCollapsed(true);
  }

  async apply(preset,label){
    if(this.busy)return;this.busy=true;this.setDisabled(true);this.status.textContent='Applying…';
    try{
      const progress=await this.client.devSetPreset(preset);
      this.scene.applyBossProgress(progress);this.status.textContent=`DEV: ${label} state loaded`;
    }catch(error){this.status.textContent=error.message;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  setCollapsed(collapsed){
    this.collapsed=Boolean(collapsed);this.content.hidden=this.collapsed;
    this.toggleButton.textContent=this.collapsed?'Show':'Hide';
    this.toggleButton.setAttribute('aria-expanded',String(!this.collapsed));
    this.toggleButton.setAttribute('aria-label',this.collapsed?'Expand developer tools':'Collapse developer tools');
  }
  setDisabled(disabled){for(const button of this.content.querySelectorAll('button'))button.disabled=disabled;}
  destroy(){this.root.remove();}
}
