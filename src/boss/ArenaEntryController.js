import { coopArenaEnabled,arenaEntryChoices } from './devArenaSettings.js';
import { ArenaLobbyClient } from './ArenaLobbyClient.js';
import { ArenaLobbyView } from './ArenaLobbyView.js';
import { normalizeArenaCode,validArenaCode,arenaClosureMessage,arenaLobbyErrorMessage,setArenaDiagnostics } from './arenaLobbyUi.js';
import { pvpLobbyAvailable } from '../pvp/config.js';

const LABELS={solo:'Enter Solo',create:'Create Co-op Lobby',join:'Join Co-op Lobby'};
export class ArenaEntryController {
  constructor(scene,destination,{env,documentRef=globalThis.document,storage=globalThis.localStorage,
    invitationCode=null,notice=null,clipboard=globalThis.navigator?.clipboard}={}){
    Object.assign(this,{scene,destination,env,document:documentRef,storage,clipboard});
    this.identity={playerId:scene.presence.identity.playerId,sessionId:scene.presence.identity.sessionId};
    this.active=true;this.generation=1;this.busy=false;this.transferred=false;
    this.previousFocus=documentRef.activeElement;this.previousKeyboardEnabled=scene.input.keyboard.enabled;
    this.previousInputEnabled=scene.input.enabled;
    scene.player.setVelocity(0,0);scene.input.keyboard.resetKeys();scene.input.keyboard.enabled=false;scene.input.enabled=false;
    this.root=this.node('section','');this.root.className='arena-entry-overlay';
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-label','Director arena');this.root.setAttribute('data-block-game-shortcuts','');
    this.panel=this.node('div','');this.panel.className='arena-entry-panel';this.root.append(this.panel);documentRef.body.append(this.root);
    this.key=event=>{
      if(!this.active)return;
      event.stopImmediatePropagation();
      if(event.type==='keydown'&&event.key==='Escape'){event.preventDefault();this.close();}
      if(event.type==='keydown'&&event.key==='Enter'&&event.target===this.code){
        event.preventDefault();if(!event.repeat)void this.acquire('join',this.code.value);
      }
      if(event.type==='keydown'&&event.key==='Tab'){
        const controls=[...this.panel.querySelectorAll('button,input')].filter(node=>!node.disabled&&!node.hidden);
        if(controls.length){event.preventDefault();const current=controls.indexOf(documentRef.activeElement);
          controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length].focus();}
      }
    };
    documentRef.addEventListener('keydown',this.key,true);documentRef.addEventListener('keyup',this.key,true);
    if(notice)this.renderNotice(notice);
    else if(invitationCode!==null)this.renderJoin(invitationCode);
    else this.renderChoices();
  }
  node(tag,text){const node=this.document.createElement(tag);node.textContent=text;return node;}
  button(label,action,{kind='secondary',parent=this.panel,allowBusy=false}={}){
    const node=this.node('button',label);node.type='button';node.className=`arena-action arena-action-${kind}`;
    node.arenaAllowBusy=allowBusy;node.addEventListener('click',action);parent.append(node);this.buttons.push(node);return node;
  }
  header(title,subtitle){
    this.buttons=[];this.code=null;this.panel.replaceChildren(this.node('h2',title));
    if(subtitle){const text=this.node('p',subtitle);text.className='arena-entry-subtitle';this.panel.append(text);}
  }
  createStatus(text=''){
    this.feedbackUntil=0;
    this.status=this.node('p',text);this.status.className='arena-entry-status';
    this.status.setAttribute('role','status');this.status.setAttribute('aria-live','polite');this.panel.append(this.status);
  }
  showStatus(text,duration=Infinity){
    this.feedbackUntil=Date.now()+duration;this.feedbackText=text;this.status.textContent=text;
  }
  setBusy(busy){
    this.busy=busy;this.root.setAttribute('aria-busy',String(busy));
    for(const button of this.buttons)button.disabled=busy&&!button.arenaAllowBusy;
    if(this.code)this.code.disabled=busy;
    if(this.lobbyView)this.lobbyView.render(this.lobbyState??this.lobbyView.state);
  }
  renderChoices(){
    this.header('DIRECTOR ARENA','Enter alone or prepare a co-op encounter.');let first;
    for(const choice of arenaEntryChoices(coopArenaEnabled(this.env,this.storage))){
      const button=this.button(LABELS[choice],()=>{
        if(choice==='solo')this.enterSolo();else if(choice==='create')void this.acquire('create');else this.renderJoin();
      },{kind:choice==='solo'?'primary':'secondary'});first??=button;
    }
    // An explicit invitation is distinct from experimental discovery/creation.
    if(!coopArenaEnabled(this.env,this.storage))this.button('Have an invitation code?',()=>this.renderJoin(),{kind:'link'});
    if(pvpLobbyAvailable(this.env)&&this.scene.openPvpLobby)this.button('PvP Arena (test)',()=>{this.close();this.scene.openPvpLobby();},{kind:'link'});
    this.createStatus();this.button('Cancel',()=>this.close(),{kind:'quiet',allowBusy:true});first?.focus();
  }
  renderJoin(prefill=''){
    if(this.busy)return;
    this.header('ENTER LOBBY CODE','An invitation lets you join without enabling co-op in DevTools.');
    const label=this.node('label','Lobby Code');label.htmlFor='arena-join-code';this.panel.append(label);
    this.code=this.node('input','');this.code.id='arena-join-code';this.code.className='arena-join-code';
    this.code.placeholder='A7K4Q2';this.code.maxLength=24;this.code.value=normalizeArenaCode(prefill);
    this.code.autocomplete='off';this.code.spellcheck=false;this.code.setAttribute('aria-label','Lobby code');
    this.code.addEventListener('input',()=>{this.code.value=normalizeArenaCode(this.code.value);});
    this.panel.append(this.code);this.button('Join Lobby',()=>void this.acquire('join',this.code.value),{kind:'primary'});
    this.createStatus();this.button('Back',()=>this.renderChoices(),{kind:'quiet'});this.code.focus();
  }
  enterSolo(){if(this.busy||!this.active)return;this.close();this.scene.travelTo({...this.destination,arenaMode:'solo'});}
  async acquire(action,rawCode){
    if(this.busy||!this.active)return;
    if(action==='create'&&!coopArenaEnabled(this.env,this.storage))return;
    const code=normalizeArenaCode(rawCode);
    if(action==='join'&&!validArenaCode(code)){this.status.textContent='Enter a valid six-character lobby code.';return;}
    this.feedbackUntil=0;this.setBusy(true);this.status.textContent=action==='join'?'Joining lobby...':'Creating lobby...';
    const generation=this.generation,presence=this.scene.presence,args={...this.identity,...(action==='join'?{code}:{})};
    try{
      const result=await presence.client.mutation(presence.api.arenaLobbies[action],args);
      if(!this.active||generation!==this.generation){
        void presence.client.mutation(presence.api.arenaLobbies.leave,{...this.identity,lobbyId:result.lobbyId}).catch(()=>{});return;
      }
      this.lobbyId=result.lobbyId;
      this.lobbyView=new ArenaLobbyView(this,result);this.list=this.lobbyView.list;this.startButton=this.lobbyView.startButton;
      this.lobby=new ArenaLobbyClient(presence,this.lobbyId,state=>this.receive(state),error=>{if(this.active)this.reportError(error);});
    }catch(error){if(this.active&&generation===this.generation)this.reportError(error);}
    finally{if(this.active&&generation===this.generation)this.setBusy(false);}
  }
  receive(state){
    if(!this.active)return;
    if(!state||state.status==='closed'){this.endLobby(arenaClosureMessage(state?.closedReason));return;}
    const firstSnapshot=!this.lobbyState;this.lobbyState=state;
    setArenaDiagnostics(this.scene,{mode:'lobby',lobbyId:state.lobbyId,status:state.status,
      hostPlayerId:state.hostPlayerId,participantCount:state.participants.length});
    if(state.status==='started'){
      this.transferred=true;const lobbyId=this.lobbyId;this.close();
      this.scene.travelTo({...this.destination,arenaMode:'coop',arenaLobbyId:lobbyId});return;
    }
    this.lobbyView.render(state);
    if(firstSnapshot)this.lobbyView.code.focus();
  }
  async start(){
    if(this.busy||!this.active||!this.lobby||this.lobbyState?.status!=='waiting'
      ||this.lobbyState.hostPlayerId!==this.identity.playerId)return;
    const generation=this.generation;this.feedbackUntil=0;this.setBusy(true);this.status.textContent='Starting encounter...';
    try{await this.lobby.request('start');}catch(error){if(this.active&&generation===this.generation)this.reportError(error);}
    finally{if(this.active&&generation===this.generation)this.setBusy(false);}
  }
  async copyCode(){
    const code=this.lobbyState?.code;if(!code||!this.active)return;
    const generation=this.generation;
    try{
      if(!this.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await this.clipboard.writeText(code);
      if(this.active&&generation===this.generation)this.showStatus('Lobby code copied.',3000);
    }catch{
      if(this.active&&generation===this.generation){this.lobbyView.code.focus();this.lobbyView.code.select();
        this.showStatus('Copy the selected code with Ctrl+C.');}
    }
  }
  releaseLobby(){
    const lobbyId=this.lobbyId;this.lobby?.close();this.lobby=null;this.lobbyId=null;this.lobbyState=null;this.lobbyView=null;
    if(lobbyId&&!this.transferred)void this.scene.presence.client.mutation(this.scene.presence.api.arenaLobbies.leave,
      {...this.identity,lobbyId}).catch(()=>{
        if(this.scene.arenaEntry===this&&this.scene.presence.identity?.playerId===this.identity.playerId
          &&this.scene.presence.identity?.sessionId===this.identity.sessionId)
          this.scene.showArenaNotice?.('Could not confirm leaving the lobby. Check your connection before rejoining.');
      });
  }
  endLobby(message){this.generation++;this.busy=false;this.releaseLobby();setArenaDiagnostics(this.scene,null);this.renderNotice(message);}
  renderNotice(message){
    this.header('CO-OP LOBBY CLOSED',message);this.createStatus();
    this.button('Return to game',()=>this.close(),{kind:'primary',allowBusy:true}).focus();
  }
  reportError(error){
    this.showStatus(arenaLobbyErrorMessage(error));
    if(String(error).includes('CHARACTER_SESSION_LOST'))this.scene.presence.fail(error);
  }
  close({restoreControls=true}={}){
    if(!this.active)return;
    this.active=false;this.generation++;this.releaseLobby();if(!this.transferred)setArenaDiagnostics(this.scene,null);
    this.root.remove();this.document.removeEventListener('keydown',this.key,true);this.document.removeEventListener('keyup',this.key,true);
    if(restoreControls){
      this.scene.input.keyboard.resetKeys();this.scene.input.keyboard.enabled=this.previousKeyboardEnabled;this.scene.input.enabled=this.previousInputEnabled;
      if(this.previousFocus?.isConnected)this.previousFocus.focus({preventScroll:true});
    }
  }
  destroy(){this.close();}
}
