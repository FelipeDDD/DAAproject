import { CHARACTERS, CHARACTER_STORAGE_KEY } from './characters.js';
import { STALE_MS } from './multiplayer/Presence.js';

export class CharacterMenu {
  constructor(presence,onChoose) {
    Object.assign(this,{presence,onChoose});
    this.sessionId=crypto.randomUUID();
    this.root=document.getElementById('character-menu');
    this.message=document.getElementById('character-message');
    this.rows=[];this.ready=false;this.connectionFailed=false;this.closed=false;
    let saved;try{saved=localStorage.getItem(CHARACTER_STORAGE_KEY);}catch{}
    this.cards=CHARACTERS.map(c=>{
      const button=document.createElement('button');button.className='character-card';
      const image=document.createElement('img');image.src=`${import.meta.env.BASE_URL}${c.asset}`;image.alt='';
      const name=document.createElement('strong');name.textContent=c.name;
      const state=document.createElement('span');
      button.append(image,name,state);button.addEventListener('click',()=>this.choose(c));
      if(saved===c.id)button.classList.add('preferred');
      document.getElementById('character-list').append(button);
      return {c,button,state};
    });
    this.message.textContent=presence?'Consultando disponibilidade…':'Configure o Convex para escolher um personagem.';
    if(presence){
      const receiveRows=rows=>{
        if(this.closed)return;
        clearTimeout(this.connectionTimer);
        this.rows=rows;this.ready=true;this.connectionFailed=false;this.render();
        if(!this.pending)this.message.textContent='Escolha um personagem disponível.';
      };
      const showConnectionError=()=>{
        if(this.closed||this.ready)return;
        this.connectionFailed=true;
        this.message.textContent='Convex indisponível. Execute “npm.cmd run convex” em outro terminal; a tela reconectará automaticamente.';
        this.render();
      };
      this.unsubscribe=presence.client.onUpdate(
        presence.api.players.availability,
        {},
        receiveRows,
        showConnectionError,
      );
      this.connectionTimer=setTimeout(showConnectionError,5000);
    }
    this.timer=setInterval(()=>this.render(),500);this.render();
  }
  render(){
    for(const {c,button,state}of this.cards){
      const busy=this.rows.some(r=>r.characterId===c.id&&Date.now()-r.lastSeen<STALE_MS);
      button.disabled=!this.ready||this.pending||busy;
      state.textContent=busy?'Ocupado':this.ready?'Disponível':this.connectionFailed?'Offline':'Carregando…';
    }
  }
  async choose(c){
    if(this.pending)return;
    this.pending=true;this.render();this.message.textContent='Reservando personagem…';
    try{
      const result=await this.presence.client.mutation(this.presence.api.players.claim,{characterId:c.id,sessionId:this.sessionId});
      if(!result.ok){this.message.textContent='Este personagem acabou de ser escolhido por outra sessão.';return;}
      this.presence.identity={playerId:c.id,characterId:c.id,name:c.name,sessionId:this.sessionId};
      try{localStorage.setItem(CHARACTER_STORAGE_KEY,c.id);}catch{}
      // Keep the claim alive while Phaser loads its maps and sprites.
      this.presence.enter('selection',()=>({x:0,y:0,direction:'down'}),()=>{});
      this.root.hidden=true;
      this.onChoose(c);
    }catch(error){this.message.textContent='Não foi possível entrar. Confira a conexão e tente novamente.';console.warn(error);}
    finally{this.pending=false;this.render();}
  }
  show(){this.root.hidden=false;this.render();}
  close(){this.closed=true;clearInterval(this.timer);clearTimeout(this.connectionTimer);this.unsubscribe?.();}
}
