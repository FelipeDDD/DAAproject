import { pvpTestBuild } from './config.js';

// The shared test build needs a playable entrance independent of DEV TOOLS.
// Scene ownership keeps the button out of character selection and arena play.
export class PvpLobbyButton {
  constructor(scene,{env,documentRef=globalThis.document}={}){
    if(!pvpTestBuild(env)||!scene.presence?.identity||['arena','pvp-arena-test'].includes(scene.mapKey))return;
    const toolbar=documentRef?.getElementById?.('play-toolbar');if(!toolbar)return;
    this.button=documentRef.createElement('button');
    this.button.id='open-pvp-lobby';this.button.type='button';this.button.textContent='PvP Lobby';
    this.open=()=>scene.openPvpLobby();
    this.button.addEventListener('click',this.open);toolbar.prepend(this.button);
  }
  destroy(){this.button?.removeEventListener('click',this.open);this.button?.remove();this.button=null;}
}
