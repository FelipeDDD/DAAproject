import { EMOTE_DURATION_MS } from './config.js';

export class EmoteState {
  constructor(duration=EMOTE_DURATION_MS){this.duration=duration;this.room=null;this.events=new Map();}
  enter(room){this.room=room;this.events.clear();}
  receive(rows,now=Date.now()) {
    this.events.clear();
    for(const row of rows)if(row.room===this.room&&now-row.createdAt<this.duration&&now>=row.createdAt-1000)
      this.events.set(row.characterId,row);
  }
  show(event){if(event.room===this.room)this.events.set(event.characterId,event);}
  active(now=Date.now()) {
    for(const [id,event] of this.events)if(now-event.createdAt>=this.duration)this.events.delete(id);
    return [...this.events.values()];
  }
  clear(){this.events.clear();this.room=null;}
}
