import { AVAILABLE_EMOTES,EMOTE_COOLDOWN_MS } from './config.js';

export function cooldownReady(lastSentAt,now=Date.now(),cooldown=EMOTE_COOLDOWN_MS){return now-lastSentAt>=cooldown;}

export class EmoteSync {
  constructor(presence,room,renderer) {
    Object.assign(this,{presence,room,renderer,lastSentAt:Number.NEGATIVE_INFINITY,pending:false});
    this.unsubscribe=presence.client.onUpdate(presence.api.emotes.inRoom,{room},rows=>{
      if(!this.closed)this.renderer.receive(rows);
    },error=>presence.fail(error));
  }
  async trigger(emote) {
    const now=Date.now();
    if(this.pending||!AVAILABLE_EMOTES.includes(emote)||!cooldownReady(this.lastSentAt,now))return false;
    this.pending=true;this.lastSentAt=now;
    try{
      const {characterId,sessionId}=this.presence.identity;
      const event=await this.presence.client.mutation(this.presence.api.emotes.send,{room:this.room,characterId,sessionId,emote});
      if(!this.closed)this.renderer.show(event);return true;
    }catch(error){
      if(String(error).includes('EMOTE_COOLDOWN'))return false;
      this.presence.fail(error);return false;
    }finally{this.pending=false;}
  }
  close(){this.closed=true;this.unsubscribe?.();this.unsubscribe=null;this.renderer.clear();}
}
