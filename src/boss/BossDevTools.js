import { BossProgressClient } from './BossProgressClient.js';
import { initializeDevPuzzleSettings,setDevPuzzleOneAnswerEnabled } from './devPuzzleSettings.js';
import { coopArenaEnabled,setCoopArenaEnabled } from './devArenaSettings.js';
import { pvpEnabled,setPvpEnabled } from '../pvp/config.js';

export const shouldShowBossDevTools=env=>env?.DEV===true;

const PRESETS=Object.freeze([
  ['fresh','Fresh'],['all_skins','All Skins'],['badge_only','Badge only'],
  ['both_unlocked','Both unlocked'],['one_win','1 win'],['two_wins','2 wins'],
]);
const ACTIONS=Object.freeze([
  ['boss','Teleport to boss'],['classroom','Teleport to classroom'],['potion','Drop health potion'],
  ['clearPotions','Clear my potions'],['office2Key','Get Office2 key'],
  ['resetCollection','Reset cigarette collection'],['grantCollection','Get all cigarette packs'],
]);

export class BossDevTools {
  constructor(scene,presence,{documentRef=globalThis.document}={}){
    const document=documentRef;
    const oneAnswerMode=initializeDevPuzzleSettings();
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
    const actions=document.createElement('div');actions.className='boss-dev-tools-actions';
    for(const [action,label] of ACTIONS){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',()=>this.runAction(action,label));actions.append(button);
    }
    const puzzleOption=document.createElement('label');puzzleOption.className='boss-dev-tools-puzzle-option';
    this.oneAnswerInput=document.createElement('input');this.oneAnswerInput.type='checkbox';
    this.oneAnswerInput.checked=oneAnswerMode;
    this.oneAnswerInput.addEventListener('change',()=>{
      const enabled=setDevPuzzleOneAnswerEnabled(this.oneAnswerInput.checked);
      this.status.textContent=enabled?'DEV: puzzles require 1 correct answer':'DEV: normal puzzle requirements restored';
    });
    const puzzleOptionText=document.createElement('span');puzzleOptionText.textContent='Answer only 1 question in puzzles';
    puzzleOption.append(this.oneAnswerInput,puzzleOptionText);
    const freeCollectOption=document.createElement('label');freeCollectOption.className='boss-dev-tools-puzzle-option';
    this.freeCollectInput=document.createElement('input');this.freeCollectInput.type='checkbox';this.freeCollectInput.checked=false;
    this.freeCollectInput.addEventListener('change',()=>this.setFreeCollect(this.freeCollectInput.checked));
    const freeCollectText=document.createElement('span');freeCollectText.textContent='Collect cigarette packs in any order';
    freeCollectOption.append(this.freeCollectInput,freeCollectText);
    this.coopArenaButton=document.createElement('button');this.coopArenaButton.type='button';
    const updateCoopLabel=()=>{
      const enabled=coopArenaEnabled({DEV:true});
      this.coopArenaButton.textContent=`Co-op Arena: ${enabled?'ON':'OFF'}`;
      this.coopArenaButton.setAttribute('aria-pressed',String(enabled));
    };
    updateCoopLabel();
    this.coopArenaButton.addEventListener('click',()=>{
      setCoopArenaEnabled(!coopArenaEnabled({DEV:true}));updateCoopLabel();
      this.status.textContent='DEV: arena setting applies to the next entrance.';
    });
    this.status=document.createElement('small');this.status.setAttribute('role','status');
    this.arenaDiagnostics=document.createElement('small');this.arenaDiagnostics.className='boss-dev-arena-diagnostics';
    this.content.append(buttons,actions,puzzleOption,freeCollectOption,this.coopArenaButton,this.arenaDiagnostics,this.status);this.root.append(header,this.content);document.body.append(this.root);
    this.setArenaDiagnostics(scene.arenaDiagnostics);
    this.pvpButton=document.createElement('button');this.pvpButton.type='button';
    const pvpLabel=()=>{this.pvpButton.textContent=`PvP Arena: ${pvpEnabled({DEV:true})?'ON':'OFF'}`;};
    pvpLabel();this.pvpButton.addEventListener('click',()=>{setPvpEnabled(!pvpEnabled({DEV:true}));pvpLabel();});
    const openPvp=document.createElement('button');openPvp.type='button';openPvp.textContent='Open PvP Lobby';
    openPvp.addEventListener('click',()=>{if(!scene.openPvpLobby?.())this.status.textContent='Close the current activity before opening PvP.';});
    this.content.append(this.pvpButton,openPvp);
    if(import.meta.env?.DEV){
      const openLab=document.createElement('button');openLab.type='button';openLab.textContent='Open Realtime Lab';
      openLab.addEventListener('click',()=>globalThis.open('/tools/realtime-lab/','_blank','noopener,noreferrer'));
      this.content.append(openLab);
    }
    this.setCollapsed(true);
  }

  runAction(action,label){
    if(action==='clearPotions')return this.clearPotions();
    if(action==='office2Key')return this.grantOffice2Key(label);
    if(action==='resetCollection'||action==='grantCollection')return this.collectionAction(action);
    let result=false;
    if(action==='boss')result=this.scene.devTeleport?.('arena','boss-spawn',{offsetX:-260});
    if(action==='classroom')result=this.scene.devTeleport?.('school','default');
    if(action==='potion')result=Boolean(this.scene.devDropHealthPotion?.());
    this.status.textContent=result?`DEV: ${label}`:`DEV: ${label} unavailable`;
    return result;
  }

  setArenaDiagnostics(state){
    this.arenaDiagnostics.textContent=state
      ?`Arena: ${state.mode} · State: ${state.status??'solo'} · Lobby: ${state.lobbyId??'—'} · Host: ${state.hostPlayerId??'—'} · Players: ${state.participantCount??1}`
      :'Arena: none';
  }

  setFreeCollectEnabled(enabled){
    if(this.freeCollectInput)this.freeCollectInput.checked=Boolean(enabled);
  }

  async setFreeCollect(enabled){
    if(this.busy)return false;
    this.busy=true;this.setDisabled(true);this.status.textContent=enabled?'Enabling free cigarette pickups...':'Restoring normal cigarette order...';
    try{
      const result=await this.scene.devSetFreeCollect?.(enabled);
      if(!result)throw new Error('DEV: collection unavailable');
      this.setFreeCollectEnabled(result.devFreeCollect);
      this.status.textContent=result.devFreeCollect?'DEV: cigarette packs can be collected in any order':'DEV: cigarette pickup order restored';
      return true;
    }catch(error){this.setFreeCollectEnabled(!enabled);this.status.textContent=error.message;return false;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  async clearPotions(){
    if(this.busy)return false;
    this.busy=true;this.setDisabled(true);this.status.textContent='Clearing potions...';
    try{
      const removed=await this.scene.devClearHealthPotions?.();
      this.status.textContent=removed===null||removed===undefined?'DEV: potion inventory unavailable'
        :removed?`DEV: removed ${removed} potion${removed===1?'':'s'}`:'DEV: no potions to clear';
      return removed!==null&&removed!==undefined;
    }catch(error){this.status.textContent=error.message;return false;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  async grantOffice2Key(label){
    if(this.busy)return false;
    this.busy=true;this.setDisabled(true);this.status.textContent='Adding Office2 key...';
    try{
      const result=await this.scene.devGrantOffice2Key?.();
      this.status.textContent=result===null||result===undefined?'DEV: Office2 key unavailable'
        :result.duplicate?'DEV: Office2 key is already in your inventory':`DEV: ${label}`;
      return result!==null&&result!==undefined;
    }catch(error){this.status.textContent=error.message;return false;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  async collectionAction(action){
    if(this.busy)return false;
    const reset=action==='resetCollection';
    this.busy=true;this.setDisabled(true);this.status.textContent=reset?'Resetting collection...':'Adding cigarette packs...';
    try{
      const result=await this.scene.devCollection?.(reset?'reset':'grant');
      this.status.textContent=result===null||result===undefined?'DEV: collection unavailable'
        :reset?'DEV: collection reset; all packs removed':'DEV: all 4 packs available in your inventory';
      return result!==null&&result!==undefined;
    }catch(error){this.status.textContent=error.message;return false;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  async apply(preset,label){
    if(this.busy)return;this.busy=true;this.setDisabled(true);this.status.textContent='Applying…';
    try{
      const progress=await this.client.devSetPreset(preset);
      this.scene.applyBossProgress(progress);
      if(preset==='all_skins')this.scene.enableAllDevSkins?.();
      else this.scene.disableAllDevSkins?.();
      this.status.textContent=`DEV: ${label} state loaded`;
    }catch(error){this.status.textContent=error.message;}
    finally{this.busy=false;this.setDisabled(false);}
  }

  setCollapsed(collapsed){
    this.collapsed=Boolean(collapsed);this.content.hidden=this.collapsed;
    this.toggleButton.textContent=this.collapsed?'Show':'Hide';
    this.toggleButton.setAttribute('aria-expanded',String(!this.collapsed));
    this.toggleButton.setAttribute('aria-label',this.collapsed?'Expand developer tools':'Collapse developer tools');
  }
  setDisabled(disabled){for(const control of this.content.querySelectorAll('button,input'))control.disabled=disabled;}
  destroy(){this.root.remove();}
}
