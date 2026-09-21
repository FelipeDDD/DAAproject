import { PLAYER_SCALE } from '../game/settings.js';
import { EMOTE_DURATION_MS } from './config.js';
import { EmoteState } from './EmoteState.js';

export class EmoteRenderer {
  constructor(scene,room,characterId,remotes) {
    Object.assign(this,{scene,characterId,remotes,labels:new Map(),state:new EmoteState()});this.state.enter(room);
  }
  receive(rows){this.state.receive(rows);}
  show(event){this.state.show(event);}
  spriteFor(characterId){return characterId===this.characterId?this.scene.player:this.remotes.players.get(characterId)?.sprite;}
  update(now=Date.now()) {
    const active=this.state.active(now),ids=new Set(active.map(event=>event.characterId));
    for(const [id,label] of this.labels)if(!ids.has(id)){label.destroy();this.labels.delete(id);}
    for(const event of active){
      const sprite=this.spriteFor(event.characterId);if(!sprite)continue;
      let label=this.labels.get(event.characterId);
      if(!label){
        label=this.scene.add.text(0,0,event.emote,{fontFamily:'"Segoe UI Emoji", "Apple Color Emoji", sans-serif',fontSize:'25px',
          padding:{x:5,y:3}}).setOrigin(0.5,1).setDepth(100001);
        this.labels.set(event.characterId,label);
      }
      label.setText(event.emote);
      const progress=Math.min(1,Math.max(0,(now-(event.displayedAt??event.createdAt))/EMOTE_DURATION_MS));
      label.setPosition(sprite.x,sprite.y-64*PLAYER_SCALE-progress*12).setAlpha(progress<0.7?1:(1-progress)/0.3);
    }
  }
  clear(){this.state.clear();for(const label of this.labels.values())label.destroy();this.labels.clear();}
  close(){this.clear();}
}
