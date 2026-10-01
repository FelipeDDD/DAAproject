import { ArenaLobbyClient } from './ArenaLobbyClient.js';
import { arenaClosureMessage,setArenaDiagnostics } from './arenaLobbyUi.js';

// Boss creation is isolated here so no co-op path can instantiate local combat.
export class ArenaEncounterController {
  constructor(scene,{createBoss,createCrosshair,documentRef=globalThis.document}){
    Object.assign(this,{scene,createBoss,createCrosshair,document:documentRef});
  }
  start(){
    this.stop();this.returning=false;const scene=this.scene;
    scene.retryOverlay?.close();scene.gate?.reset();
    if(scene.arenaMode!=='coop'){
      setArenaDiagnostics(scene,{mode:'solo'});
      if(scene.boss){scene.boss.reset();scene.crosshair?.resume();}
      else{scene.boss=this.createBoss();scene.crosshair=this.createCrosshair();}
      return;
    }
    scene.boss?.destroy();scene.boss=null;scene.crosshair?.destroy();scene.crosshair=null;
    // This preparation encounter has no rewards or combat. Keep its exit usable.
    scene.gate?.open();
    this.notice=this.document.createElement('aside');this.notice.className='arena-coop-notice';
    const text=this.document.createElement('p');text.textContent='Co-op encounter ready. Boss synchronization not enabled yet.';
    this.details=this.document.createElement('small');
    const leave=this.document.createElement('button');this.leaveButton=leave;leave.type='button';leave.textContent='Leave co-op arena';
    leave.addEventListener('click',()=>this.returnToEntrance());
    this.notice.append(text,this.details,leave);this.document.body.append(this.notice);
    this.lobby=new ArenaLobbyClient(scene.presence,scene.arenaLobbyId,state=>{
      if(!state||state.status==='closed'){this.returnToEntrance(arenaClosureMessage(state?.closedReason));return;}
      const host=state.participants.find(p=>p.playerId===state.hostPlayerId);
      this.details.textContent=`${state.participants.length}/${state.maxParticipants} players · Host: ${host?.displayName??'Player'}`;
      setArenaDiagnostics(scene,{mode:'coop',lobbyId:state.lobbyId,status:state.status,
        hostPlayerId:state.hostPlayerId,participantCount:state.participants.length});
    },error=>{
      this.details.textContent='Lobby connection unavailable; leave and re-enter to recover.';
      if(String(error).includes('CHARACTER_SESSION_LOST'))scene.presence.fail(error);
    });
  }
  returnToEntrance(message){
    if(this.returning)return;
    this.returning=true;if(this.leaveButton)this.leaveButton.disabled=true;
    this.scene.player.setVelocity(0,0);
    this.lobby?.close();
    this.scene.arenaLobbyId=null;setArenaDiagnostics(this.scene,null);
    if(this.scene.returnFromCoopArena)this.scene.returnFromCoopArena(message);
    else this.scene.returnToSecretPath();
  }
  stop(){
    // Capture old lobby arguments before the next destination changes the scene fields.
    if(this.lobby){const lobby=this.lobby;this.lobby=null;lobby.close();void lobby.request('leave').catch(()=>{});}
    this.notice?.remove();this.notice=null;
    setArenaDiagnostics(this.scene,null);
    this.scene.boss?.suspend();this.scene.crosshair?.suspend();
  }
  destroy(){this.stop();this.scene.boss?.destroy();this.scene.boss=null;this.scene.crosshair?.destroy();this.scene.crosshair=null;}
}
