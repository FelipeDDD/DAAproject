import { SKILL_INPUTS } from './config.js';

// DOM presentation only; READY is based on the authoritative cooldown deadline.
export class SkillHud {
  constructor(parent,{documentRef=globalThis.document,bindings=SKILL_INPUTS}={}){
    this.bindings=bindings;this.root=documentRef.createElement('small');this.root.className='pvp-skill-hud';
    this.root.hidden=true;parent.append(this.root);
  }
  render(state,self,now){
    const skills=state.skills;
    this.root.hidden=state.state==='ended'||!skills?.enabled.length;
    if(this.root.hidden)return;
    this.root.textContent=skills.enabled.map(id=>{
      const binding=this.bindings[id],readyAt=skills.cooldowns.find(row=>row.playerId===self.playerId&&row.skillId===id)?.readyAt??0;
      const remaining=Math.max(0,Math.ceil((readyAt-now)/1000));
      const status=state.state!=='active'||self.hp<=0?'—':remaining?`${remaining}s`:'READY';
      return `${binding?.key??''} · ${binding?.label??id}: ${status}`;
    }).join(' / ');
  }
  destroy(){this.root.remove();}
}
