export class CurrencyHud {
  constructor({mount=document.getElementById('bottom-hud'),documentRef=document}={}){
    this.document=documentRef;this.coins=null;
    this.root=documentRef.createElement('div');this.root.className='hud-currency';this.root.hidden=true;
    this.root.setAttribute('role','status');this.root.setAttribute('aria-live','polite');
    const icon=documentRef.createElement('span');icon.className='hud-currency__coin';icon.setAttribute('aria-hidden','true');
    icon.textContent='C';
    this.value=documentRef.createElement('span');this.value.className='hud-currency__value';
    this.gain=documentRef.createElement('span');this.gain.className='hud-currency__gain';this.gain.setAttribute('aria-hidden','true');
    this.root.append(icon,this.value,this.gain);mount?.append(this.root);
  }
  setBalance(coins){
    if(!Number.isSafeInteger(coins)||coins<0){this.setUnavailable();return;}
    const previous=this.coins;this.coins=coins;
    this.root.hidden=false;this.value.textContent=String(coins);this.root.setAttribute('aria-label',`${coins} coins`);
    if(previous!==null&&coins>previous){
      this.gain.textContent=`+${coins-previous}`;
      this.gain.getAnimations?.().forEach(animation=>animation.cancel());
      this.gain.animate?.([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-10px)'}],
        {duration:850,fill:'forwards'});
    }
  }
  setUnavailable(){
    this.coins=null;this.root.hidden=false;this.value.textContent='—';
    this.root.setAttribute('aria-label','Coin balance unavailable');this.resetGain();
  }
  resetGain(){this.gain.getAnimations?.().forEach(animation=>animation.cancel());this.gain.textContent='';}
  clear(){this.coins=null;this.root.hidden=true;this.value.textContent='';this.resetGain();}
  destroy(){this.clear();this.root.remove();}
}
