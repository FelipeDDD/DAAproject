import { CHARACTERS, CHARACTER_STORAGE_KEY } from './characters.js';
import { characterVisual } from './characterVisuals.js';
import { isPresenceActive } from './multiplayer/presencePolicy.js';
import { createSessionId } from './playerIdentity.js';

export const createCharacterSessionId=createSessionId;

export class CharacterMenu {
  constructor(presence,onChoose) {
    Object.assign(this,{presence,onChoose});
    this.sessionId=createCharacterSessionId();
    this.root=document.getElementById('character-menu');
    this.message=document.getElementById('character-message');
    this.styleSelect=document.getElementById('character-style');this.style='old';
    this.styleSelect.value='old';this.styleSelect.closest('.character-style-control').hidden=true;
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
      return {c,button,image,state};
    });
    this.renderPreviews();
    this.message.textContent=presence?'Checking availability…':'Configure Convex to choose a character.';
    if(presence){
      const receiveRows=rows=>{
        if(this.closed)return;
        clearTimeout(this.connectionTimer);
        this.rows=rows;this.ready=true;this.connectionFailed=false;this.render();
        if(!this.pending)this.message.textContent='Choose an available character.';
      };
      const showConnectionError=()=>{
        if(this.closed||this.ready)return;
        this.connectionFailed=true;
        this.message.textContent='Convex is unavailable. Run “npm.cmd run convex” in another terminal; this screen will reconnect automatically.';
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
      const busy=this.rows.some(r=>r.characterId===c.id&&(r.active??isPresenceActive(r.lastSeen)));
      button.disabled=!this.ready||this.pending||busy;
      state.textContent=busy?'In use':this.ready?'Available':this.connectionFailed?'Offline':'Loading…';
    }
  }
  renderPreviews(){
    for(const {c,image}of this.cards){
      const visual=characterVisual(c,this.style);
      image.src=`${import.meta.env.BASE_URL}${visual.previewAsset}`;
      image.dataset.style=visual.style;
    }
  }
  setAuthentication(profile,token){
    this.mode='profile';this.profile=profile;this.authToken=token;this.guest=null;
    this.presence.profileSessionToken=token;
    for(const {c,button}of this.cards)button.classList.toggle('preferred',c.id===profile.selectedCharacterId);
    document.getElementById('logout-profile-menu').textContent='Logout profile';
  }
  setGuestIdentity(guest){
    this.mode='guest';this.profile=null;this.authToken=null;this.guest=guest;
    this.presence.profileSessionToken=null;
    document.getElementById('logout-profile-menu').textContent='Exit guest session';
  }
  async choose(c){
    if(this.pending||(!this.authToken&&!this.guest))return;
    this.pending=true;this.render();this.message.textContent='Claiming character…';
    try{
      const result=this.mode==='guest'
        ?await this.presence.client.mutation(this.presence.api.players.claimGuest,{
          guestId:this.guest.guestId,characterId:c.id,sessionId:this.sessionId,
        })
        :await this.presence.client.action(this.presence.api.profiles.claimCharacter,{
          token:this.authToken,characterId:c.id,presenceSessionId:this.sessionId,
        });
      if(!result.ok){this.message.textContent='Another session just selected this character.';return;}
      if(result.profile)this.profile=result.profile;
      this.presence.identity={
        kind:this.mode,playerId:c.id,characterId:c.id,name:c.name,sessionId:this.sessionId,
        ...(this.mode==='guest'?{guestId:this.guest.guestId}:{profileId:result.profile.profileId}),
      };
      try{localStorage.setItem(CHARACTER_STORAGE_KEY,c.id);}catch{}
      // Keep the claim alive while Phaser loads its maps and sprites.
      this.presence.enter('selection',()=>({x:0,y:0,direction:'down',activeCharacterItem:null}),()=>{});
      this.root.hidden=true;
      this.onChoose(c);
    }catch(error){this.message.textContent='Could not join. Check the connection and try again.';console.warn(error);}
    finally{this.pending=false;this.render();}
  }
  show(){this.root.hidden=false;this.render();}
  hide(){this.root.hidden=true;}
  close(){
    this.closed=true;clearInterval(this.timer);clearTimeout(this.connectionTimer);this.unsubscribe?.();
  }
}
