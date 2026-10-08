import { InventoryHotbar } from '../../inventory/InventoryHotbar.js';
import { SKILL_INPUTS } from './config.js';

// DOM presentation only. Cooldown deadlines come from the authority; clicks
// use the same authenticated intent as the keyboard, never inventory items.
export class SkillHud {
  constructor(parent,{documentRef=globalThis.document,windowRef=globalThis.window,
    bindings=SKILL_INPUTS,onUse=()=>{}}={}){
    this.hotbar=new InventoryHotbar(null,{mount:parent,documentRef,windowRef,
      quickSlotActions:Object.entries(bindings).map(([id,binding])=>({id,...binding,onUse:()=>onUse(id)})),
    });
    this.root=this.hotbar.root;this.root.hidden=true;
  }
  render(state,self,now){
    if(this.hotbar.destroyed)return;
    const skills=state.skills;
    this.root.hidden=state.state==='ended'||!skills?.enabled.length;
    if(this.root.hidden)return;
    for(const skillId of this.hotbar.actionViews.keys()){
      const enabled=skills.enabled.includes(skillId);
      const readyAt=skills.cooldowns.find(row=>row.playerId===self.playerId&&row.skillId===skillId)?.readyAt??0;
      const remaining=Math.max(0,Math.ceil((readyAt-now)/1000));
      const playable=state.state==='active'&&self.hp>0;
      const text=playable?(remaining?`${remaining}s`:'READY'):'--';
      this.hotbar.setQuickSlotActionState(skillId,{visible:enabled,enabled:playable&&remaining===0,status:text});
    }
  }
  destroy(){
    this.hotbar.destroy();
  }
}
