import { AVAILABLE_EMOTES,EMOTE_COOLDOWN_MS } from './config.js';

export function cooldownReady(lastSentAt,now=Date.now(),cooldown=EMOTE_COOLDOWN_MS){return now-lastSentAt>=cooldown;}

export class EmoteSync {
  constructor(presence,room,renderer) {
    Object.assign(this,{presence,room,renderer,lastSentAt:Number.NEGATIVE_INFINITY,pending:false});
    this.closed=false;this.suspended=false;this.unsubscribe=null;
    this.subscribe();
  }
  subscribe(){
    if(this.closed||this.suspended||this.unsubscribe)return false;
    this.unsubscribe=this.presence.client.onUpdate(this.presence.api.emotes.inRoom,{room:this.room},rows=>{
      if(!this.closed&&!this.suspended)this.renderer.receive(rows);
    },error=>this.presence.fail(error));
    return true;
  }
  suspend(){
    if(this.closed||this.suspended)return false;
    this.suspended=true;this.unsubscribe?.();this.unsubscribe=null;this.renderer.clear();return true;
  }
  resume(){
    if(this.closed||!this.suspended)return false;
    this.suspended=false;this.subscribe();return true;
  }
  async trigger(emote) {
    const now=Date.now();
    if(this.closed||this.suspended||this.pending||!AVAILABLE_EMOTES.includes(emote)||!cooldownReady(this.lastSentAt,now))return false;
    this.pending=true;this.lastSentAt=now;
    try{
      const {characterId,sessionId}=this.presence.identity;
      const event=await this.presence.client.mutation(this.presence.api.emotes.send,{room:this.room,characterId,sessionId,emote});
      if(!this.closed&&!this.suspended)this.renderer.show(event);return true;
    }catch(error){
      if(String(error).includes('EMOTE_COOLDOWN'))return false;
      this.presence.fail(error);return false;
    }finally{this.pending=false;}
  }
  close(){if(this.closed)return;this.closed=true;this.unsubscribe?.();this.unsubscribe=null;this.renderer.clear();}
}
