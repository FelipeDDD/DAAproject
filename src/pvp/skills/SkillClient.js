import { SKILL_INPUTS,PVP_MODE_SKILLS } from './config.js';

// Intents only. Authorization/snapshot ordering belongs to PvpDamageClient;
// cooldowns and skill effects are never decided by this input adapter.
export class SkillClient {
  constructor(damageClient,{keyboard,bindings=SKILL_INPUTS}={}){
    this.damage=damageClient;this.movement=damageClient.movement;this.keyboard=keyboard;
    this.bindings=bindings;this.keys=new Map();this.pending=new Map();this.serial=0;this.closed=false;
    this.round=this.movement.round;
    for(const skillId of PVP_MODE_SKILLS[this.movement.match.mode]?.skills??[]){
      const binding=bindings[skillId];if(!binding||!keyboard)continue;
      this.keys.set(skillId,{key:keyboard.addKey(binding.key),down:false});
    }
    this.off=this.movement.transport.onMessage(message=>{
      if(this.closed||message.roomId!==this.movement.roomId||message.type!=='pvp-skill-result'
        ||message.payload.round!==this.round)return;
      const result=message.payload;
      if(this.pending.get(result.skillId)?.seq===result.castSeq){this.pending.delete(result.skillId);this.lastResult=result;}
    });
  }
  snapshot(){
    const hp=this.damage.hp;
    return !this.closed&&this.damage.authorized&&hp?.round===this.movement.round?hp.skills:null;
  }
  use(skillId){
    const m=this.movement,state=m.match,snapshot=this.snapshot();
    const player=state?.participants.find(p=>p.playerId===m.playerId);
    if(this.closed||m.closed||!this.damage.authorized||this.round!==m.round||state?.state!=='active'
      ||!player||player.hp<=0||!snapshot?.enabled.includes(skillId)||this.pending.has(skillId))return false;
    // Send current facing/pose on the same ordered reliable stream immediately
    // before the intent. Placement still uses only the server-accepted sample.
    if(m.update&&m.update(undefined,{force:true,reliable:true})!==true)return false;
    const seq=++this.serial;
    this.pending.set(skillId,{seq,life:player.life});
    const sent=m.transport.sendReliable('pvp-skill-use',{skillId,playerId:m.playerId,
      sessionId:this.damage.sessionId,round:m.round,life:player.life,castSeq:seq});
    if(!sent)this.pending.delete(skillId);
    return sent;
  }
  update(){
    if(this.closed)return;
    if(this.round!==this.movement.round)this.reset(this.movement.round);
    const me=this.movement.match?.participants.find(p=>p.playerId===this.movement.playerId);
    for(const [id,pending] of this.pending)if(pending.life!==me?.life)this.pending.delete(id);
    for(const [id,input] of this.keys){
      const down=Boolean(input.key.isDown);if(down&&!input.down)this.use(id);input.down=down;
    }
  }
  reset(round=this.movement.round){
    this.round=round;this.serial=0;this.pending.clear();this.lastResult=null;
    for(const input of this.keys.values())input.down=Boolean(input.key.isDown);
  }
  close(){
    if(this.closed)return;this.closed=true;this.pending.clear();this.off();
    for(const input of this.keys.values())this.keyboard?.removeKey(input.key,true,true);
    this.keys.clear();
  }
}
