export class ArenaRetryState {
  constructor(delayMs=5000){this.delayMs=delayMs;this.reset();}
  show(now){this.visible=true;this.availableAt=now+this.delayMs;}
  canChoose(now){return this.visible&&now>=this.availableAt;}
  reset(){this.visible=false;this.availableAt=Infinity;}
}

export class ArenaRetryOverlay {
  constructor(scene,{delayMs=5000,onRetry,onReturn}){
    this.scene=scene;this.state=new ArenaRetryState(delayMs);this.onRetry=onRetry;this.onReturn=onReturn;
    this.root=document.createElement('section');this.root.className='arena-retry-overlay';this.root.hidden=true;
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');document.body.append(this.root);
    this.timer=null;
  }

  show(){
    if(this.state.visible)return false;
    this.state.show(this.scene.time.now);this.root.replaceChildren();
    const panel=document.createElement('div');panel.className='arena-retry-panel';
    const title=document.createElement('h2');title.textContent='TRY AGAIN?';
    this.status=document.createElement('p');
    const actions=document.createElement('div');actions.className='arena-retry-actions';
    this.retry=document.createElement('button');this.retry.type='button';this.retry.textContent='Retry';this.retry.disabled=true;
    this.returnButton=document.createElement('button');this.returnButton.type='button';this.returnButton.textContent='Return to classroom';this.returnButton.disabled=true;
    this.retry.addEventListener('click',()=>this.choose(this.onRetry));
    this.returnButton.addEventListener('click',()=>this.choose(this.onReturn));
    actions.append(this.retry,this.returnButton);panel.append(title,this.status,actions);this.root.append(panel);this.root.hidden=false;
    this.updateCountdown();this.timer=this.scene.time.addEvent({delay:250,loop:true,callback:()=>this.updateCountdown()});
    return true;
  }

  updateCountdown(){
    const remaining=Math.max(0,this.state.availableAt-this.scene.time.now);
    if(remaining>0){this.status.textContent=`Available in ${Math.ceil(remaining/1000)}…`;return;}
    this.status.textContent='Retry the fight or return safely to the classroom.';
    this.retry.disabled=false;this.returnButton.disabled=false;this.timer?.remove(false);this.timer=null;
  }

  choose(action){if(!this.state.canChoose(this.scene.time.now))return false;this.close();action?.();return true;}
  close(){this.timer?.remove(false);this.timer=null;this.state.reset();this.root.hidden=true;this.root.replaceChildren();}
  destroy(){this.close();this.root.remove();}
}
