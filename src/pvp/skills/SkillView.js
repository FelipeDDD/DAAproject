import { FireZoneView } from './views/fire-zone/FireZoneView.js';

// Visual factory registry, deliberately separate from the gameplay registry.
export const SKILL_VIEW_FACTORIES={'fire-zone':(scene,instance)=>new FireZoneView(scene,instance)};
export class SkillView {
  constructor(scene,{factories=SKILL_VIEW_FACTORIES}={}){
    this.scene=scene;this.factories=factories;this.items=new Map();this.round=null;this.closed=false;
  }
  render(state,now){
    if(this.closed||(this.round!==null&&state.round<this.round))return;
    if(state.round!==this.round)this.reset(state.round);
    const rows=state.state==='active'?state.skills?.instances??[]:[];
    const live=new Set();
    for(const row of rows){
      if(row.round!==this.round||!this.factories[row.skillId])continue;
      const owner=state.participants.find(p=>p.playerId===row.ownerId);
      if(!owner||owner.life!==row.ownerLife||owner.hp<=0)continue;
      live.add(row.id);
      if(!this.items.has(row.id))this.items.set(row.id,this.factories[row.skillId](this.scene,row));
      this.items.get(row.id).render(row,now);
    }
    for(const [id,item] of this.items)if(!live.has(id)){item.destroy();this.items.delete(id);}
  }
  reset(round=null){for(const item of this.items.values())item.destroy();this.items.clear();this.round=round;}
  destroy(){this.reset();this.closed=true;}
}
