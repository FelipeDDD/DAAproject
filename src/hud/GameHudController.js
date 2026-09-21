import { HUD_LAYOUT,HUD_THEME,fixedHudEnabled,hudHealthPercent,hudThemeDefinition,normalizeHudTheme } from './config.js';

let currentHud=null;
const assetUrl=(path,documentRef)=>new URL(`${import.meta.env?.BASE_URL??'/'}${path}`,documentRef.baseURI).href;

export class GameHudController {
  constructor({root=document.getElementById('game-shell'),documentRef=document,theme=HUD_THEME,layout=HUD_LAYOUT}={}){
    this.root=root;this.document=documentRef;this.layout=layout;this.destroyed=false;
    this.hpOrb=root?.querySelector('#hud-hp-orb');this.hpText=root?.querySelector('#hud-hp-text');
    this.infoText=root?.querySelector('#hud-info-text');this.statusText=root?.querySelector('#hud-status-text');
    const emoteMount=root?.querySelector('#hud-emote-mount'),emoteBar=documentRef.getElementById('emote-bar');
    if(emoteMount&&emoteBar)emoteMount.append(emoteBar);
    this.applyTheme(theme);this.applyLayout();this.setHealth(3,3);
    this.setInfoText('Good Code\nBetter Tomorrow');this.setStatusLines(['LEARN','BUILD','PLAY','REPEAT']);
  }

  applyTheme(theme){
    const definition=hudThemeDefinition(theme);this.theme=normalizeHudTheme(theme);
    this.root.dataset.hudTheme=this.theme;this.root.classList.add(definition.className);
    this.root.style.setProperty('--hud-bar-asset',`url("${assetUrl(definition.barAsset,this.document)}")`);
    const orbFrame=this.root.querySelector('.hp-orb__frame');
    if(orbFrame)orbFrame.src=assetUrl(definition.orbAsset,this.document);
    for(const piece of ['edge-horizontal','edge-vertical','top-left','top-right','bottom-left','bottom-right']){
      this.root.style.setProperty(`--frame-${piece}`,`url("${assetUrl(`${definition.framePieces}frame-${piece}.png`,this.document)}")`);
    }
    this.root.style.setProperty('--hud-right-panel-asset',`url("${assetUrl(definition.rightPanelAsset,this.document)}")`);
  }

  applyLayout(){
    this.root.style.setProperty('--hud-bottom-height',`${this.layout.bottomHeight}px`);
    this.root.style.setProperty('--hud-right-panel-width',`${this.layout.rightPanelWidth}px`);
    this.root.style.setProperty('--hud-frame-overflow',`${this.layout.frameOverflow}px`);
    this.root.classList.toggle('hud-fixed-hotbars',fixedHudEnabled(this.layout));
  }

  setHealth(current,max){
    const safeCurrent=Math.max(0,Number(current)||0),safeMax=Math.max(1,Number(max)||1);
    const percent=hudHealthPercent(safeCurrent,safeMax);
    this.hpOrb?.style.setProperty('--hud-hp-percent',`${percent}%`);
    if(this.hpText)this.hpText.textContent=`${safeCurrent} / ${safeMax}`;
    this.hpOrb?.setAttribute('aria-valuemin','0');
    this.hpOrb?.setAttribute('aria-valuemax',String(safeMax));
    this.hpOrb?.setAttribute('aria-valuenow',String(safeCurrent));
    this.hpOrb?.setAttribute('aria-label',`Player health: ${safeCurrent} of ${safeMax}`);
    return percent;
  }

  setInfoText(text){if(this.infoText)this.infoText.textContent=String(text??'');}
  setStatusLines(lines){if(this.statusText)this.statusText.textContent=(Array.isArray(lines)?lines:[lines]).filter(Boolean).join('\n');}
  setVisible(visible){if(this.root)this.root.dataset.hudVisible=visible?'true':'false';}
  resetHealth(){this.setHealth(3,3);}
  destroy(){if(this.destroyed)return;this.destroyed=true;if(currentHud===this)currentHud=null;}
}

export function setGameHud(controller){currentHud=controller;return controller;}
export function getGameHud(){return currentHud;}
