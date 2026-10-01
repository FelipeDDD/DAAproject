import { characterById } from '../characters.js';
import { ARENA_COOP_CAPACITY } from './arenaRooms.js';

// Presentation only; ownership and transitions stay in ArenaEntryController.
export class ArenaLobbyView {
  constructor(controller,{code}={}){
    this.controller=controller;const c=controller;
    c.header('CO-OP LOBBY','Prepare your encounter. Only the host can start.');
    const codeRow=c.node('div','');codeRow.className='arena-lobby-code-row';
    const label=c.node('label','Lobby Code');label.htmlFor='arena-invitation-code';
    this.code=c.node('input','');this.code.id='arena-invitation-code';this.code.readOnly=true;
    this.code.value=code??'';this.code.placeholder='Unavailable';this.code.setAttribute('aria-label','Lobby code');
    this.code.className='arena-lobby-code';
    this.copyButton=c.button('Copy Code',()=>void c.copyCode(),{parent:codeRow,kind:'compact'});
    codeRow.replaceChildren(label,this.code,this.copyButton);c.panel.append(codeRow);
    const summary=c.node('div','');summary.className='arena-lobby-summary';
    this.host=c.node('span','Host: ...');this.count=c.node('span',`0 / ${ARENA_COOP_CAPACITY}`);
    this.state=c.node('span','WAITING');this.state.className='arena-lobby-state';
    summary.append(this.host,this.count,this.state);c.panel.append(summary);
    c.panel.append(c.node('h3','Players'));
    this.list=c.node('ul','');this.list.className='arena-lobby-players';c.panel.append(this.list);
    this.startButton=c.button('Start Encounter',()=>void c.start(),{kind:'primary'});this.startButton.hidden=true;
    c.createStatus('Loading lobby...');
    c.button('Leave Lobby',()=>c.close(),{kind:'danger',allowBusy:true});
    this.render({code,participants:[],maxParticipants:ARENA_COOP_CAPACITY,status:'waiting'});
  }
  render(state){
    this.state=state;
    const c=this.controller,host=state.participants.find(p=>p.playerId===state.hostPlayerId);
    this.code.value=state.code??'';this.copyButton.disabled=!state.code||!state.lobbyId||c.busy;
    this.host.textContent=`Host: ${host?.displayName??'...'}`;
    this.count.textContent=`${state.participants.length} / ${state.maxParticipants}`;
    this.state.textContent=state.status.toUpperCase();
    const players=state.participants.map((p,index)=>{
      const row=c.node('li','');row.className='arena-lobby-player';
      const number=c.node('span',String(index+1));number.className='arena-player-number';
      const details=c.node('div',''),name=c.node('strong',p.displayName);
      const base=c.node('small',characterById(p.characterBaseId)?.name??'Player');
      details.append(name,base);row.append(number,details);
      if(p.playerId===state.hostPlayerId){const badge=c.node('span','HOST');badge.className='arena-host-badge';row.append(badge);}
      return row;
    });
    for(let index=players.length;index<state.maxParticipants;index++){
      const row=c.node('li','Waiting...');row.className='arena-lobby-player arena-lobby-vacancy';players.push(row);
    }
    this.list.replaceChildren(...players);
    const canStart=state.status==='waiting'&&state.hostPlayerId===c.identity.playerId&&Boolean(host);
    this.startButton.hidden=!canStart;this.startButton.disabled=c.busy||!canStart;
    if(!c.busy)c.status.textContent=Date.now()<c.feedbackUntil?c.feedbackText:
      !state.lobbyId?'Loading lobby...':state.code?'Waiting for the host to start.':
        'This older lobby has no invitation code. Recreate it to invite players.';
  }
}
