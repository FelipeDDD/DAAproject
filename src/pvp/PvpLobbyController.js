import { ArenaEntryController } from '../boss/ArenaEntryController.js';
import { normalizeArenaCode,validArenaCode } from '../boss/arenaLobbyUi.js';
import { PvpMatchClient } from './PvpMatchClient.js';
import { pvpEnabled,PVP_TEAMS,PVP_RULES,PVP_LOBBY_DISPLAY_SLOTS } from './config.js';
import { pvpArenaDestination } from './mapConfig.js';
import { canStartMatch } from './matchState.js';
import { gameMode } from './gameModes.js';
import { hasCustomMatchSettings } from './matchSettings.js';
import { PvpMatchSettingsPanel } from './PvpMatchSettingsPanel.js';

// Reuse the entrance modal's input/focus locking, buttons, busy and generation guards.
export class PvpLobbyController extends ArenaEntryController {
  constructor(scene,options={}){
    super(scene,{},options);this.root.setAttribute('aria-label','PvP Arena');
    if(options.resumeMatchId){
      this.matchId=options.resumeMatchId;this.buildLobby('');
      this.matchClient=new PvpMatchClient(scene.presence,this.matchId,state=>this.receive(state),error=>this.reportError(error));
    }
  }
  header(title,subtitle){
    super.header(title,subtitle);
    this.panel.className='arena-entry-panel';
    this.teamButtons=[];this.teamSections=[];this.teamSlots=[];this.rosterSignature=null;
  }
  renderChoices(){
    this.stopBrowsing();
    this.header('PVP ARENA',`Choose a mode · max ${PVP_RULES.teamSize} per team (${PVP_LOBBY_DISPLAY_SLOTS} slots shown).`);
    if(pvpEnabled(this.env,this.storage)){
      this.button('Create TDM Lobby',()=>void this.acquire('create',undefined,'tdm'),{kind:'primary'});
      this.button('Create Payload Lobby',()=>void this.acquire('create',undefined,'payload'),{kind:'primary'});
    }
    this.button('Enter Existing Lobby',()=>this.browseExisting(),{kind:'secondary'});
    this.button('Join PvP by Code',()=>this.renderJoin());
    this.createStatus();this.button('Cancel',()=>this.close(),{kind:'quiet',allowBusy:true});
  }
  browseExisting(){
    this.stopBrowsing();
    const browseGeneration=this.browseGeneration;
    this.header('ENTER EXISTING LOBBY','Choose an open lobby to join automatically.');
    this.createStatus('Looking for open lobbies...');
    this.button('Back',()=>this.renderChoices(),{kind:'quiet'});
    this.availableSignature=null;
    this.availableUnsubscribe=this.scene.presence.client.onUpdate(this.scene.presence.api.pvpMatches.available,
      this.identity,lobbies=>{
        if(!this.active||browseGeneration!==this.browseGeneration)return;
        this.renderAvailableLobbies(lobbies??[]);
      },error=>{
        if(this.active&&browseGeneration===this.browseGeneration)this.reportError(error);
      });
  }
  renderAvailableLobbies(lobbies){
    const signature=JSON.stringify(lobbies.map(({matchId,mode,hostName,participantCount,maxParticipants})=>
      [matchId,mode,hostName,participantCount,maxParticipants]));
    if(signature===this.availableSignature)return;
    this.availableSignature=signature;
    this.header('ENTER EXISTING LOBBY','Choose an open lobby to join automatically.');
    for(const lobby of lobbies){
      const label=`Join · ${gameMode(lobby.mode).label} · ${lobby.hostName} · ${lobby.participantCount}/${lobby.maxParticipants}`;
      this.button(label,()=>void this.acquire('joinById',undefined,'tdm',lobby.matchId),{kind:'primary'});
    }
    this.createStatus(lobbies.length?'Select a lobby to join.':'No open lobbies are available right now.');
    this.button('Back',()=>this.renderChoices(),{kind:'quiet'});
  }
  stopBrowsing(){
    this.browseGeneration=(this.browseGeneration??0)+1;
    this.availableUnsubscribe?.();this.availableUnsubscribe=null;this.availableSignature=null;
  }
  renderNotice(message){
    this.header('PVP LOBBY CLOSED',message);this.createStatus();
    this.button('Return to game',()=>this.close(),{kind:'primary',allowBusy:true}).focus();
  }
  renderJoin(prefill=''){
    super.renderJoin(prefill);
    this.panel.children[0].textContent='JOIN PVP LOBBY';
    this.panel.children[1].textContent='Enter the code shared by the host.';
  }
  async acquire(action,rawCode,mode='tdm',matchId=null){
    if(!this.active||this.busy||(action==='create'&&!pvpEnabled(this.env,this.storage)))return;
    const code=normalizeArenaCode(rawCode);
    if(action==='join'&&!validArenaCode(code)){this.showStatus('Enter a valid six-character PvP code.');return;}
    this.stopBrowsing();
    const generation=this.generation,p=this.scene.presence;this.setBusy(true);this.showStatus('Connecting...');
    try{
      const args={...this.identity,...(action==='join'?{code}:action==='joinById'?{matchId}:mode==='tdm'?{}:{mode})};
      const result=await p.client.mutation(p.api.pvpMatches[action],args);
      if(!this.active||generation!==this.generation){
        void p.client.mutation(p.api.pvpMatches.leave,{...this.identity,matchId:result.matchId,round:result.round??0}).catch(()=>{});return;
      }
      this.matchId=result.matchId;this.membershipRound=result.round??0;
      this.buildLobby(result.code);
      this.matchClient=new PvpMatchClient(p,this.matchId,state=>this.receive(state),error=>this.reportError(error));
    }catch(error){if(this.active&&generation===this.generation)this.reportError(error);}
    finally{if(this.active&&generation===this.generation)this.setBusy(false);}
  }
  buildLobby(code){
    this.header('PVP LOBBY',`Team Deathmatch · max ${PVP_RULES.teamSize} per team (${PVP_LOBBY_DISPLAY_SLOTS} slots shown).`);
    this.copyInput=this.node('input','');this.copyInput.readOnly=true;this.copyInput.value=code;
    this.copyInput.className='arena-lobby-code';this.copyInput.setAttribute('aria-label','PvP lobby code');this.panel.append(this.copyInput);
    this.button('Copy Code',()=>void this.copyCode());
    this.panel.className='arena-entry-panel pvp-lobby-panel';
    const settingsActions=this.node('div','');settingsActions.className='pvp-lobby-settings';this.panel.append(settingsActions);
    this.settingsButton=this.button('Settings',()=>{
      if(this.settingsPanel.root.hidden)this.settingsPanel.open();else this.settingsPanel.close();
    },{parent:settingsActions});
    this.customSettingsLabel=this.node('small','');settingsActions.append(this.customSettingsLabel);
    this.settingsPanel=new PvpMatchSettingsPanel({parent:this.panel,documentRef:this.document,playerId:this.identity.playerId,
      onSave:async (matchSettings,timeLimitMs)=>{
        if(this.matchState?.hostPlayerId!==this.identity.playerId)return false;
        const saved=await this.command('updateSettings',{matchSettings,timeLimitMs});
        if(saved&&this.active)this.showStatus('Match settings saved.',3000);
        return saved;
      }});
    this.teams=this.node('div','');this.teams.className='pvp-teams';this.panel.append(this.teams);
    this.teamButtons=PVP_TEAMS.map((team,index)=>{
      const section=this.node('section','');section.className=`pvp-team-${team}`;
      section.setAttribute('aria-label',`Team ${team}`);section.append(this.node('h3',`TEAM ${team}`));
      this.teamSlots[index]=Array.from({length:PVP_LOBBY_DISPLAY_SLOTS},()=>{
        const slot=this.node('div','Empty');slot.className='pvp-player-slot is-empty';section.append(slot);return slot;
      });
      this.teams.append(section);this.teamSections[index]=section;
      const button=this.button(`Choose Team ${team}`,()=>void this.chooseTeam(team),{parent:section});
      button.className+=' pvp-team-choice';button.setAttribute('aria-pressed','false');return button;
    });
    this.startButton=this.button('Start Match',()=>void this.start(),{kind:'primary'});this.startButton.hidden=true;
    this.startButton.className+=' pvp-lobby-start';
    this.createStatus('Waiting for players...');this.button('Leave Lobby',()=>this.close(),{kind:'danger',allowBusy:true});
  }
  receive(state){
    if(!this.active)return;this.matchState=state;
    if(state)this.panel.children[1].textContent=`${gameMode(state.mode).label} · max ${PVP_RULES.teamSize} per team (${PVP_LOBBY_DISPLAY_SLOTS} slots shown).`;
    if(!state){this.endLobby('This PvP lobby is no longer available.');return;}
    if(this.copyInput)this.copyInput.value=state.code;
    if(state.state==='ended'){
      this.endLobby(['host_left','host-left'].includes(state.reason)?'The host closed the PvP lobby.':'This PvP lobby is no longer available.');return;
    }
    if(state.state!=='waiting'){
      let destination;
      try{destination=pvpArenaDestination(this.matchId,state);}
      catch(error){this.showStatus(error.message);return;}
      this.transferred=true;this.close();
      this.scene.travelTo(destination);return;
    }
    // Do not rebuild DOM every local timer tick or steal keyboard focus.
    const signature=JSON.stringify([state.hostPlayerId,state.participants.map(({presenceExpiresAt,...p})=>p)]);
    if(signature!==this.rosterSignature){
      this.rosterSignature=signature;
      PVP_TEAMS.forEach((team,index)=>{
        const members=state.participants.filter(p=>p.team===team);
        this.teamSlots[index].forEach((slot,n)=>{
          const player=members[n];
          slot.className='pvp-player-slot'+(player?'':' is-empty');
          if(!player){slot.replaceChildren(this.node('span','Empty'));return;}
          const name=this.node('span',player.displayName);name.className='pvp-player-name';name.title=player.displayName;
          slot.replaceChildren(name);
          if(player.playerId===state.hostPlayerId){
            const badge=this.node('span','HOST');badge.className='pvp-host-badge';slot.append(badge);
          }
        });
      });
    }
    this.refreshButtons();
    this.refreshLobbyStatus();
  }
  refreshLobbyStatus(){
    const state=this.matchState;
    if(!state||state.state!=='waiting'||this.busy||Date.now()<this.feedbackUntil)return;
    const ready=canStartMatch(state),host=state.hostPlayerId===this.identity.playerId;
    this.status.textContent=ready?(host?'Ready to start.':'Waiting for host.'):'Each team needs at least one player.';
    this.status.setAttribute('data-tone',ready&&host?'ready':ready?'info':'blocked');
  }
  showStatus(text,duration=Infinity){
    super.showStatus(text,duration);this.status.setAttribute('data-tone','info');
  }

  refreshButtons(){
    const s=this.matchState;if(!s||s.state!=='waiting')return;
    this.settingsPanel?.update(s,this.busy);
    if(this.customSettingsLabel)this.customSettingsLabel.textContent=hasCustomMatchSettings(s)?'Custom rules':'';
    this.startButton.hidden=s.hostPlayerId!==this.identity.playerId;
    this.startButton.disabled=this.busy||!canStartMatch(s);
    this.teamButtons.forEach((button,index)=>{
      const team=PVP_TEAMS[index],own=s.participants.find(p=>p.playerId===this.identity.playerId);
      const selected=own?.team===team;
      button.setAttribute('aria-pressed',String(selected));
      this.teamSections[index].className='pvp-team-'+team+(selected?' pvp-team-selected':'');
      button.disabled=this.busy||selected||s.participants.filter(p=>p.team===team).length>=PVP_RULES.teamSize;
    });
  }
  setBusy(busy){super.setBusy(busy);this.refreshButtons();this.refreshLobbyStatus();}
  async command(action,args){
    if(!this.active||this.busy||!this.matchClient)return false;
    const generation=this.generation;this.setBusy(true);
    try{await this.matchClient.request(action,args);if(this.active)this.feedbackUntil=0;return this.active&&generation===this.generation;}
    catch(error){if(this.active&&generation===this.generation)this.reportError(error);return false;}
    finally{if(this.active&&generation===this.generation)this.setBusy(false);}
  }
  chooseTeam(team){return this.command('chooseTeam',{team});}
  start(){if(this.matchState?.hostPlayerId!==this.identity.playerId||!canStartMatch(this.matchState))return;return this.command('start');}
  async copyCode(){
    try{if(!this.clipboard?.writeText)throw new Error();await this.clipboard.writeText(this.copyInput.value);if(this.active)this.showStatus('Lobby code copied.',3000);}
    catch{if(this.active){this.copyInput.focus();this.copyInput.select();this.showStatus('Copy the selected code with Ctrl+C.');}}
  }
  reportError(error){
    if(!this.active)return;
    this.showStatus(typeof error?.data==='string'?error.data:'Could not reach the PvP lobby. Leave and try again.');
    if(String(error).includes('CHARACTER_SESSION_LOST'))this.scene.presence.fail(error);
  }
  releaseLobby(){
    this.stopBrowsing();
    this.settingsPanel?.destroy();this.settingsPanel=null;
    const round=this.matchState?.round??this.membershipRound;
    const matchId=this.matchId;this.matchClient?.close();this.matchClient=null;this.matchId=null;this.matchState=null;
    if(matchId&&!this.transferred)void this.scene.presence.client.mutation(this.scene.presence.api.pvpMatches.leave,
      {...this.identity,matchId,round}).catch(()=>{
        if(this.scene.arenaEntry===this&&this.scene.presence.identity?.sessionId===this.identity.sessionId)
          this.scene.showArenaNotice?.('Could not confirm leaving PvP. Check your connection.');
      });
  }
}
