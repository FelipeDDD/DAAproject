import { BossProgressClient } from './BossProgressClient.js';

export const shouldShowBossDevTools=env=>env?.DEV===true;

const PRESETS=Object.freeze([
  ['fresh','Fresh'],['skin_only','Skin only'],['badge_only','Badge only'],
  ['both_unlocked','Both unlocked'],['one_win','1 win'],['two_wins','2 wins'],
]);

export class BossDevTools {
  constructor(scene,presence){
    this.scene=scene;this.client=new BossProgressClient(presence);this.busy=false;
    this.root=document.createElement('aside');this.root.className='boss-dev-tools';
    const title=document.createElement('strong');title.textContent='DEV TOOLS';
    const buttons=document.createElement('div');buttons.className='boss-dev-tools-presets';
    for(const [preset,label] of PRESETS){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',()=>this.apply(preset,label));buttons.append(button);
    }
    this.status=document.createElement('small');this.status.setAttribute('role','status');
    this.root.append(title,buttons,this.status);document.body.append(this.root);
  }

  async apply(preset,label){
    if(this.busy)return;this.busy=true;this.setDisabled(true);this.status.textContent='Applying…';
    try{
      const progress=await this.client.devSetPreset(preset);
      this.scene.applyBossProgress(progress);this.status.textContent=`DEV: ${label} state loaded`;
    }catch(error){this.status.textContent=error.message;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  setDisabled(disabled){for(const button of this.root.querySelectorAll('button'))button.disabled=disabled;}
  destroy(){this.root.remove();}
}
