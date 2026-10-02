import { ArenaEntryController } from '../boss/ArenaEntryController.js';
import { normalizeArenaCode,validArenaCode } from '../boss/arenaLobbyUi.js';
import { characterById } from '../characters.js';
import { PvpMatchClient } from './PvpMatchClient.js';
import { pvpEnabled,PVP_MAP,PVP_TEAMS } from './config.js';
import { canStartMatch } from './matchState.js';

// Reuse the entrance modal's input/focus locking, buttons, busy and generation guards.
export class PvpLobbyController extends ArenaEntryController {
  constructor(scene,options={}){
    super(scene,{},options);this.root.setAttribute('aria-label','PvP Team Deathmatch');
    if(options.resumeMatchId){
      this.matchId=options.resumeMatchId;this.buildLobby('');
      this.matchClient=new PvpMatchClient(scene.presence,this.matchId,state=>this.receive(state),error=>this.reportError(error));
    }
  }
  renderChoices(){
    this.header('PVP ARENA','Team Deathmatch · up to 2 players per team.');
    if(pvpEnabled(this.env,this.storage))this.button('Create PvP Lobby',()=>void this.acquire('create'),{kind:'primary'});
    this.button('Join PvP by Code',()=>this.renderJoin());
    this.createStatus();this.button('Cancel',()=>this.close(),{kind:'quiet',allowBusy:true});
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
  async acquire(action,rawCode){
    if(!this.active||this.busy||(action==='create'&&!pvpEnabled(this.env,this.storage)))return;
    const code=normalizeArenaCode(rawCode);
    if(action==='join'&&!validArenaCode(code)){this.showStatus('Enter a valid six-character PvP code.');return;}
    const generation=this.generation,p=this.scene.presence;this.setBusy(true);this.showStatus('Connecting...');
    try{
      const result=await p.client.mutation(p.api.pvpMatches[action],{...this.identity,...(action==='join'?{code}:{})});
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
    this.header('PVP LOBBY','Team Deathmatch · uneven teams allowed.');
    this.copyInput=this.node('input','');this.copyInput.readOnly=true;this.copyInput.value=code;
    this.copyInput.className='arena-lobby-code';this.copyInput.setAttribute('aria-label','PvP lobby code');this.panel.append(this.copyInput);
    this.button('Copy Code',()=>void this.copyCode());
    this.teams=this.node('div','');this.teams.className='pvp-teams';this.panel.append(this.teams);
    this.teamButtons=PVP_TEAMS.map(team=>this.button(`Choose Team ${team}`,()=>void this.chooseTeam(team)));
    this.startButton=this.button('Start Match',()=>void this.start(),{kind:'primary'});this.startButton.hidden=true;
    this.createStatus('Waiting for players...');this.button('Leave Lobby',()=>this.close(),{kind:'danger',allowBusy:true});
  }
  receive(state){
    if(!this.active)return;this.matchState=state;
    if(!state){this.endLobby('This PvP lobby is no longer available.');return;}
    if(this.copyInput)this.copyInput.value=state.code;
    if(state.state==='ended'){
      this.endLobby(['host_left','host-left'].includes(state.reason)?'The host closed the PvP lobby.':'This PvP lobby is no longer available.');return;
    }
    if(state.state!=='waiting'){
      this.transferred=true;const matchId=this.matchId;this.close();
      this.scene.travelTo({targetMap:PVP_MAP,pvpMatchId:matchId,pvpSnapshot:state});return;
    }
    // Do not rebuild DOM every local timer tick or steal keyboard focus.
    const signature=JSON.stringify([state.hostPlayerId,state.participants.map(({presenceExpiresAt,...p})=>p)]);
    if(signature!==this.rosterSignature){
      this.rosterSignature=signature;
      this.teams.replaceChildren(...PVP_TEAMS.map(team=>{
        const members=state.participants.filter(p=>p.team===team),section=this.node('section','');
        const ownTeam=members.some(p=>p.playerId===this.identity.playerId);
        section.className=`pvp-team-${team}${ownTeam?' pvp-team-selected':''}`;
        section.append(this.node('h3',`Team ${team} · ${members.length} / 2${ownTeam?' · YOUR TEAM':''}`));
        for(const p of members){
          const own=p.playerId===this.identity.playerId;
          const row=this.node('p',`${p.displayName}${p.playerId===state.hostPlayerId?' · HOST':''}${own?' · YOU':''} (${characterById(p.characterBaseId)?.name??'Player'})`);
          row.className=own?'pvp-member-self':'';section.append(row);
        }
        for(let n=members.length;n<2;n++)section.append(this.node('p','Empty'));
        return section;
      }));
    }
    this.refreshButtons();
    if(!this.busy&&Date.now()>=this.feedbackUntil)this.status.textContent=canStartMatch(state)
      ?`${state.participants.length} / 4 players · Waiting for the host to start.`:'Each team needs at least one player.';
  }
  refreshButtons(){
    const s=this.matchState;if(!s||s.state!=='waiting')return;
    this.startButton.hidden=s.hostPlayerId!==this.identity.playerId;
    this.startButton.disabled=this.busy||!canStartMatch(s);
    this.teamButtons.forEach((button,index)=>{
      const team=PVP_TEAMS[index],own=s.participants.find(p=>p.playerId===this.identity.playerId);
      button.disabled=this.busy||own?.team===team||s.participants.filter(p=>p.team===team).length>=2;
    });
  }
  setBusy(busy){super.setBusy(busy);this.refreshButtons();}
  async command(action,args){
    if(!this.active||this.busy||!this.matchClient)return;
    const generation=this.generation;this.setBusy(true);
    try{await this.matchClient.request(action,args);if(this.active)this.showStatus('Waiting for the host to start.');}
    catch(error){if(this.active&&generation===this.generation)this.reportError(error);}
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
    const round=this.matchState?.round??this.membershipRound;
    const matchId=this.matchId;this.matchClient?.close();this.matchClient=null;this.matchId=null;this.matchState=null;
    if(matchId&&!this.transferred)void this.scene.presence.client.mutation(this.scene.presence.api.pvpMatches.leave,
      {...this.identity,matchId,round}).catch(()=>{
        if(this.scene.arenaEntry===this&&this.scene.presence.identity?.sessionId===this.identity.sessionId)
          this.scene.showArenaNotice?.('Could not confirm leaving PvP. Check your connection.');
      });
  }
}
