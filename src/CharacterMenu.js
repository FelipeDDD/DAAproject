import { CHARACTERS, CHARACTER_STORAGE_KEY, baseCharacterId } from './characters.js';
import { characterVisual } from './characterVisuals.js';
import { isPlayerActive } from './multiplayer/presencePolicy.js';
import { createSessionId } from './playerIdentity.js';
import { MAX_PLAYER_CAPACITY } from './multiplayer/playerCapacity.js';

export const createCharacterSessionId=createSessionId;

export class CharacterMenu {
  constructor(presence,onChoose) {
    Object.assign(this,{presence,onChoose});
    this.sessionId=createCharacterSessionId();
    this.root=document.getElementById('character-menu');
    this.message=document.getElementById('character-message');
    this.styleSelect=document.getElementById('character-style');this.style='old';
    this.styleSelect.value='old';this.styleSelect.closest('.character-style-control').hidden=true;
    this.rows=[];this.maxPlayers=MAX_PLAYER_CAPACITY;this.ready=false;this.connectionFailed=false;this.closed=false;
    let saved;try{saved=localStorage.getItem(CHARACTER_STORAGE_KEY);}catch{}
    this.cards=CHARACTERS.map(c=>{
      const button=document.createElement('button');button.className='character-card';
      const image=document.createElement('img');image.src=`${import.meta.env.BASE_URL}${c.asset}`;image.alt='';
      const name=document.createElement('strong');name.textContent=c.name;
      const state=document.createElement('span');
      button.append(image,name,state);button.addEventListener('click',()=>this.choose(c));
      if(baseCharacterId(saved)===c.id)button.classList.add('preferred');
      document.getElementById('character-list').append(button);
      return {c,button,image,state};
    });
    this.renderPreviews();
    this.message.textContent=presence?'Checking availability…':'Configure Convex to choose a character.';
    this.render();
  }
  subscribeAvailability(){
    if(!this.presence||this.unsubscribe||this.closed)return;
    const presence=this.presence;
    const subscription=Symbol('availability');this.availabilitySubscription=subscription;
    this.ready=false;this.connectionFailed=false;this.rows=[];
    this.message.textContent='Checking availability…';
    const receiveRows=rows=>{
      if(this.closed||this.root.hidden||this.availabilitySubscription!==subscription)return;
      clearTimeout(this.connectionTimer);
      this.rows=Array.isArray(rows)?rows:(rows?.players??[]);
      this.maxPlayers=Number.isFinite(rows?.maxPlayers)?rows.maxPlayers:MAX_PLAYER_CAPACITY;
      this.ready=true;this.connectionFailed=false;this.render();
      if(!this.pending)this.message.textContent='Choose a character base.';
    };
    const showConnectionError=()=>{
      if(this.closed||this.root.hidden||this.availabilitySubscription!==subscription||this.ready)return;
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
    this.timer=setInterval(()=>this.render(),500);
    this.render();
  }
  render(){
    const full=this.rows.filter(row=>isPlayerActive(row)).length>=this.maxPlayers;
    for(const {button,state}of this.cards){
      button.disabled=!this.ready||this.pending||full;
      state.textContent=full?'Server full':this.ready?'Available':this.connectionFailed?'Offline':'Loading…';
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
    for(const {c,button}of this.cards)button.classList.toggle('preferred',c.id===baseCharacterId(profile.selectedCharacterId));
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
          guestId:this.guest.guestId,characterBaseId:c.id,sessionId:this.sessionId,
        })
        :await this.presence.client.action(this.presence.api.profiles.claimCharacter,{
          token:this.authToken,characterBaseId:c.id,presenceSessionId:this.sessionId,
        });
      if(!result.ok){this.message.textContent=result.reason==='full'?'The player limit has been reached.':'Could not claim this character.';return;}
      if(!result.playerId)throw new Error('Claim did not return a live player ID.');
      if(result.profile)this.profile=result.profile;
      const displayName=this.mode==='guest'?c.name:result.profile.displayName;
      this.presence.identity={
        kind:this.mode,playerId:result.playerId,characterId:c.id,characterBaseId:baseCharacterId(c.id),
        name:displayName,displayName,characterName:c.name,sessionId:this.sessionId,
        ...(this.mode==='guest'?{guestId:this.guest.guestId}:{profileId:result.profile.profileId}),
      };
      try{localStorage.setItem(CHARACTER_STORAGE_KEY,c.id);}catch{}
      // Keep the claim alive while Phaser loads its maps and sprites.
      this.presence.enter('selection',()=>({x:0,y:0,direction:'down',activeCharacterItem:null}),()=>{});
      this.hide();
      this.onChoose(c);
    }catch(error){this.message.textContent='Could not join. Check the connection and try again.';console.warn(error);}
    finally{this.pending=false;this.render();}
  }
  show(){if(this.closed)return;this.root.hidden=false;this.subscribeAvailability();this.render();}
  hide(){
    this.root.hidden=true;clearInterval(this.timer);this.timer=null;
    clearTimeout(this.connectionTimer);this.connectionTimer=null;
    this.availabilitySubscription=null;
    this.unsubscribe?.();this.unsubscribe=null;
  }
  close(){
    this.closed=true;this.hide();
  }
}
