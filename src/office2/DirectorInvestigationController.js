import { hasProfileSession,requireProfileSessionToken } from '../ProfileSessionClient.js';
import { normalizeCharacterItem } from '../inventory/characterItems.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import { availableDirectorClue,readDirectorClues } from './directorInvestigation.js';

// One state read on room entry; subsequent meaningful actions return new state.
// No subscription, proximity polling or periodic backend writes.
export class DirectorInvestigationController {
  constructor(scene,{promptFactory=(...args)=>new WorldPrompt(...args)}={}){
    this.scene=scene;this.presence=scene.presence;this.revision=0;this.busy=false;
    this.clues=readDirectorClues(scene.source,scene.mapKey);
    this.prompt=promptFactory(scene,'[E] Investigate',{clamp:true});
    this.ready=this.restore();
  }
  args(){
    const {playerId,sessionId}=this.presence.identity;
    return {token:requireProfileSessionToken(this.presence),playerId,sessionId};
  }
  accept(state){
    if(this.destroyed)return;
    this.revision++;this.state=state;
    if(this.scene.mapKey==='office2'){
      this.scene.lockedDoorOpen=Boolean(state.doorUnlocked);
      this.scene.lockedDoor?.setOpen(this.scene.lockedDoorOpen);
    }
  }
  async restore(){
    const revision=this.revision;
    try{
      await this.presence.pendingSend;
      if(this.destroyed)return;
      const state=await this.presence.client.query(this.presence.api.directorInvestigation.status,this.args());
      if(!this.destroyed&&revision===this.revision)this.accept(state);
    }catch(error){if(!this.destroyed)console.warn('Director investigation state:',error);}
  }
  nearby(){
    return availableDirectorClue(this.clues,this.state,this.scene.player.x,this.scene.player.y);
  }
  updatePrompt(available){
    const clue=available&&!this.busy?this.nearby():null;
    if(clue)this.prompt.setPosition(clue.markerX,clue.markerY-12);
    this.prompt.setVisible(Boolean(clue));return clue;
  }
  feedback(message){this.message=message;this.messageUntil=Date.now()+3500;}
  renderFeedback(){
    if(!this.message||Date.now()>=this.messageUntil)return;
    this.scene.hint.hidden=false;this.scene.hint.textContent=this.message;
    this.scene.positionInteractionHint();
  }
  async request(method,extra={},flushPosition=false){
    if(this.destroyed||this.busy||!hasProfileSession(this.presence))return null;
    this.busy=true;
    try{
      if(flushPosition){
        await this.presence.pendingSend;
        await this.presence.send(Date.now(),{forcePosition:true});
      }
      if(this.destroyed)return null;
      const result=await this.presence.client.mutation(this.presence.api.directorInvestigation[method],{...this.args(),...extra});
      if(this.destroyed)return null;
      this.accept(result.state??result);
      return result;
    }catch(error){
      if(!this.destroyed&&String(error).includes('CHARACTER_SESSION_LOST'))this.presence.fail(error);
      throw error;
    }finally{this.busy=false;}
  }
  async activate(){
    if(this.state?.active)return this.state;
    return this.request('activate');
  }
  async investigate(clue=this.nearby()){
    if(!clue)return false;
    try{
      const result=await this.request('investigate',{clueId:clue.id},true);
      if(!result)return false;
      if(result.message)this.feedback(result.message);
      if(result.item){
        const controller=this.scene.characterItems;
        const item=normalizeCharacterItem(result.item,this.presence.identity.characterBaseId??this.presence.identity.characterId);
        controller?.setItems([...controller.items.filter(row=>row.itemId!==item.itemId),item]);
        controller?.onItemCollected(item);
        // Refresh the full profile inventory in case an earlier room-entry read
        // was superseded by this award. No other owned item is lost locally.
        void controller?.restore?.();
      }
      return true;
    }catch{if(!this.destroyed)this.feedback('Could not investigate. Please try again.');return false;}
  }
  async unlock(){
    try{
      const result=await this.request('unlock',{},true);
      if(!result)return false;
      this.feedback('The wall opens. That seems perfectly normal.');return true;
    }catch(error){
      if(!this.destroyed)this.feedback(String(error).includes('HIDDEN_KEY_REQUIRED')
        ?'This wall appears to have a suspiciously lock-shaped problem.'
        :'Could not unlock the wall. Please try again.');
      return false;
    }
  }
  destroy(){this.destroyed=true;this.prompt.destroy();}
}
