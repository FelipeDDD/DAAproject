import { EMOTE_DURATION_MS } from './config.js';

export class EmoteState {
  constructor(duration=EMOTE_DURATION_MS){this.duration=duration;this.room=null;this.events=new Map();}
  enter(room){this.room=room;this.events.clear();}
  receive(rows,now=Date.now()) {
    const previous=this.events;
    this.events.clear();
    for(const row of rows)if(row.room===this.room){
      const existing=previous.get(row.characterId);
      const displayedAt=existing?.createdAt===row.createdAt?existing.displayedAt:now;
      this.events.set(row.characterId,{...row,displayedAt});
    }
  }
  show(event,now=Date.now()){if(event.room===this.room)this.events.set(event.characterId,{...event,displayedAt:now});}
  active(now=Date.now()) {
    for(const [id,event] of this.events)if(now-(event.displayedAt??event.createdAt)>=this.duration)this.events.delete(id);
    return [...this.events.values()];
  }
  clear(){this.events.clear();this.room=null;}
}
