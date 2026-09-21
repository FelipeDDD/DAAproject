export const ARENA_HUD_CONFIG=Object.freeze({
  boss:Object.freeze({top:-145,width:760,maxWidthPercent:80}),
});

export function healthPercent(current,max){
  if(!Number.isFinite(current)||!Number.isFinite(max)||max<=0)return 0;
  return Math.max(0,Math.min(100,current/max*100));
}

function element(documentRef,tag,className,text){
  const node=documentRef.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
}

export class ArenaHudOverlay {
  constructor(scene,{documentRef=document,config=ARENA_HUD_CONFIG}={}){
    this.scene=scene;this.document=documentRef;this.config=config;this.destroyed=false;this.tutorialHideTimer=null;
    this.bossHideTimer=null;this.bossTransitionToken=0;
    this.currentBossHp=100;this.maxBossHp=100;
    this.root=element(documentRef,'section','arena-hud-overlay');
    this.root.setAttribute('aria-label','Arena combat status');
    this.root.style.setProperty('--boss-hud-top',`${config.boss.top}px`);
    this.root.style.setProperty('--boss-hud-width',`${config.boss.width}px`);
    this.root.style.setProperty('--boss-hud-max-width',`${config.boss.maxWidthPercent}%`);

    this.bossHud=element(documentRef,'section','arena-boss-hud');
    this.bossHud.setAttribute('aria-label','DER DIREKTOR, Phase 1, 100 of 100 HP');
    this.bossHud.hidden=true;
    const track=element(documentRef,'div','arena-boss-health-track');
    this.bossFill=element(documentRef,'span','arena-boss-health-fill');track.append(this.bossFill);
    this.portraitFrame=element(documentRef,'div','arena-boss-portrait-frame');
    this.frame=element(documentRef,'img','arena-boss-frame');
    const base=import.meta.env?.BASE_URL??'/';
    this.frame.src=`${base}assets/boss/boss-bar-frame.png`;
    this.frame.alt='';this.frame.draggable=false;this.portraitFrame.append(this.frame);
    this.phase=element(documentRef,'span','arena-boss-phase','PHASE 1');
    this.bossHp=element(documentRef,'span','arena-boss-hp','100 / 100 HP');
    this.bossName=element(documentRef,'span','arena-boss-name','DER DIREKTOR');
    this.bossHud.append(track,this.portraitFrame,this.phase,this.bossHp,this.bossName);

    this.notice=element(documentRef,'div','arena-combat-notice');this.notice.hidden=true;
    this.tutorial=element(documentRef,'div','arena-attack-tutorial');this.tutorial.hidden=true;
    this.tutorial.textContent='Aim with your mouse and press SPACE or 0 to attack';
    this.tutorial.setAttribute('role','status');
    this.root.append(this.bossHud,this.notice,this.tutorial);
    this.host=scene.game.canvas.parentElement?.closest?.('#game-shell')
      ??scene.game.canvas.parentElement??documentRef.body;
    this.host.classList?.add('arena-hud-space');
    this.host.append(this.root);
  }

  setBossHealth(current,max){
    const percent=healthPercent(current,max);
    this.currentBossHp=current;this.maxBossHp=max;
    this.bossFill.style.setProperty('--boss-health-percent',`${percent}%`);
    this.bossHp.textContent=`${current} / ${max} HP`;
    this.renderBossLabel(current,max);
  }

  setPhase(phase){this.phase.textContent=`PHASE ${phase}`;this.renderBossLabel();}

  setBossName(name){this.bossName.textContent=String(name);this.renderBossLabel();}

  renderBossLabel(current,max){
    const hp=current??this.currentBossHp,maximum=max??this.maxBossHp;
    this.bossHud.setAttribute('aria-label',`${this.bossName.textContent}, ${this.phase.textContent}, ${hp} of ${maximum} HP`);
  }

  showBoss(){
    if(this.destroyed)return;
    clearTimeout(this.bossHideTimer);this.bossHideTimer=null;
    const token=++this.bossTransitionToken;
    this.bossHud.hidden=false;
    const enter=()=>{if(!this.destroyed&&token===this.bossTransitionToken)this.bossHud.classList.add('visible');};
    if(this.document.defaultView?.requestAnimationFrame)this.document.defaultView.requestAnimationFrame(enter);
    else if(globalThis.requestAnimationFrame)globalThis.requestAnimationFrame(enter);
    else enter();
  }

  hideBoss({immediate=false}={}){
    clearTimeout(this.bossHideTimer);this.bossHideTimer=null;
    const token=++this.bossTransitionToken;
    this.bossHud.classList.remove('visible');
    if(immediate){this.bossHud.hidden=true;return;}
    this.bossHideTimer=setTimeout(()=>{
      if(!this.destroyed&&token===this.bossTransitionToken)this.bossHud.hidden=true;
      this.bossHideTimer=null;
    },420);
  }

  showTutorial(){
    if(this.destroyed)return;
    clearTimeout(this.tutorialHideTimer);this.tutorialHideTimer=null;
    this.tutorial.hidden=false;
    const enter=()=>{if(!this.destroyed)this.tutorial.classList.add('visible');};
    if(this.document.defaultView?.requestAnimationFrame)this.document.defaultView.requestAnimationFrame(enter);
    else if(globalThis.requestAnimationFrame)globalThis.requestAnimationFrame(enter);
    else enter();
  }

  hideTutorial({immediate=false}={}){
    this.tutorial.classList.remove('visible');clearTimeout(this.tutorialHideTimer);
    if(immediate)this.tutorial.hidden=true;
    else this.tutorialHideTimer=setTimeout(()=>{this.tutorial.hidden=true;this.tutorialHideTimer=null;},220);
  }

  showNotice(text,tone='phase'){
    this.notice.textContent=text;this.notice.dataset.tone=tone;this.notice.hidden=false;
  }

  hideNotice(){this.notice.hidden=true;this.notice.textContent='';delete this.notice.dataset.tone;}

  setVisible(visible){
    this.root.hidden=!visible;
    if(visible)this.host.classList?.add('arena-hud-space');
    else this.host.classList?.remove('arena-hud-space');
    if(!visible){this.hideBoss({immediate:true});this.hideTutorial({immediate:true});}
  }

  destroy(){
    if(this.destroyed)return;this.destroyed=true;clearTimeout(this.tutorialHideTimer);clearTimeout(this.bossHideTimer);
    this.tutorialHideTimer=null;this.bossHideTimer=null;this.host.classList?.remove('arena-hud-space');
    this.root.remove();this.scene=null;
  }
}
