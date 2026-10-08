import { FireZoneView } from './views/fire-zone/FireZoneView.js';
import { FIRE_ZONE_VISUAL } from './views/fire-zone/visualConfig.js';

// Visual factory registry, deliberately separate from the gameplay registry.
export const SKILL_VIEW_FACTORIES={'fire-zone':(scene,instance)=>new FireZoneView(scene,instance)};
const TARGETING_VISUALS={'fire-zone':FIRE_ZONE_VISUAL};
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
  renderTargeting(preview){
    if(this.closed)return;
    const c=TARGETING_VISUALS[preview?.skillId];
    if(!preview||!c){this.preview?.setVisible(false);this.restoreCursor();return;}
    if(!this.preview)this.preview=this.scene.add.graphics().setDepth(c.depth);
    if(!this.aiming){
      this.previousCursor=this.scene.input.manager?.defaultCursor??this.scene.game?.canvas?.style.cursor??'';
      this.scene.input.setDefaultCursor(c.aimCursor);this.aiming=true;
    }
    const color=preview.clamped?c.aimClampedColor:c.aimColor;
    this.preview.setVisible(true).setPosition(preview.x,preview.y).clear()
      .fillStyle(color,c.aimFillAlpha).fillCircle(0,0,preview.radius)
      .lineStyle(c.aimLineWidth,color,c.aimLineAlpha).strokeCircle(0,0,preview.radius)
      .fillStyle(color,c.aimLineAlpha).fillCircle(0,0,c.centerRadius);
  }
  restoreCursor(){if(this.aiming){this.scene.input.setDefaultCursor(this.previousCursor);this.aiming=false;}}
  reset(round=null){
    for(const item of this.items.values())item.destroy();this.items.clear();this.round=round;
    this.preview?.destroy();this.preview=null;this.restoreCursor();
  }
  destroy(){this.reset();this.closed=true;}
}
