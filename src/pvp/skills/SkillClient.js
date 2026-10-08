import { SKILL_INPUTS,SKILL_DEFAULTS,PVP_MODE_SKILLS,clampSkillAim } from './config.js';

// Intents only. Authorization/snapshot ordering belongs to PvpDamageClient;
// cooldowns and skill effects are never decided by this input adapter.
export class SkillClient {
  constructor(damageClient,{keyboard,bindings=SKILL_INPUTS,getAimPoint=()=>null,getOrigin=()=>null,now=Date.now}={}){
    this.damage=damageClient;this.movement=damageClient.movement;this.keyboard=keyboard;
    this.bindings=bindings;this.getAimPoint=getAimPoint;this.keys=new Map();this.pending=new Map();this.serial=0;this.closed=false;
    this.getOrigin=getOrigin;this.now=now;this.targeting=null;
    this.onCancel=()=>this.cancelTargeting();keyboard?.on?.('keydown-ESC',this.onCancel);
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
  canUse(skillId){
    const m=this.movement,state=m.match,snapshot=this.snapshot();
    const player=state?.participants.find(p=>p.playerId===m.playerId);
    if(this.closed||m.closed||!this.damage.authorized||this.round!==m.round||state?.state!=='active'
      ||!player||player.hp<=0||!snapshot?.enabled.includes(skillId)||this.pending.has(skillId))return false;
    const readyAt=snapshot.cooldowns.find(row=>row.playerId===m.playerId&&row.skillId===skillId)?.readyAt??0;
    return readyAt<=this.now();
  }
  activate(skillId){
    if(this.bindings[skillId]?.targeting!=='ground-point')return this.use(skillId);
    if(this.targeting?.skillId===skillId){this.cancelTargeting();return true;}
    if(!this.canUse(skillId))return false;
    const player=this.movement.match.participants.find(p=>p.playerId===this.movement.playerId);
    this.targeting={skillId,life:player.life};return true;
  }
  cancelTargeting(){this.targeting=null;}
  handlePointer(pointer){
    if(!this.targeting)return false;
    if(pointer.button===2){this.cancelTargeting();return true;}
    if(pointer.button!==0)return true;
    const aim=this.getAimPoint(pointer);
    if(aim&&Number.isFinite(aim.x)&&Number.isFinite(aim.y)&&this.use(this.targeting.skillId,aim))this.cancelTargeting();
    return true;
  }
  targetingPreview(){
    const id=this.targeting?.skillId;if(!id||!this.canUse(id))return null;
    const mode=PVP_MODE_SKILLS[this.movement.match.mode];
    const config={...SKILL_DEFAULTS[id],...mode?.skillOverrides?.[id]};
    const target=clampSkillAim(this.getOrigin(),this.getAimPoint(),config.maxRangeTiles*config.tileSize);
    return target?{skillId:id,...target,radius:config.radius}:null;
  }
  use(skillId,point=this.getAimPoint()){
    if(!this.canUse(skillId))return false;
    const m=this.movement,player=m.match.participants.find(p=>p.playerId===m.playerId);
    // Send current facing/pose on the same ordered reliable stream immediately
    // before the intent. Placement still uses only the server-accepted sample.
    if(m.update&&m.update(undefined,{force:true,reliable:true})!==true)return false;
    const seq=++this.serial;
    this.pending.set(skillId,{seq,life:player.life});
    const aim=point&&Number.isFinite(point.x)&&Number.isFinite(point.y)?{x:point.x,y:point.y}:undefined;
    const sent=m.transport.sendReliable('pvp-skill-use',{skillId,playerId:m.playerId,
      sessionId:this.damage.sessionId,round:m.round,life:player.life,castSeq:seq,...(aim?{aim}:{})});
    if(!sent)this.pending.delete(skillId);
    return sent;
  }
  update(){
    if(this.closed)return;
    if(this.round!==this.movement.round)this.reset(this.movement.round);
    const me=this.movement.match?.participants.find(p=>p.playerId===this.movement.playerId);
    if(this.targeting&&(!this.canUse(this.targeting.skillId)||me?.life!==this.targeting.life||this.keyboard?.enabled===false))this.cancelTargeting();
    for(const [id,pending] of this.pending)if(pending.life!==me?.life)this.pending.delete(id);
    for(const [id,input] of this.keys){
      const down=Boolean(input.key.isDown);if(down&&!input.down&&this.keyboard?.enabled!==false)this.activate(id);input.down=down;
    }
  }
  reset(round=this.movement.round){
    this.round=round;this.serial=0;this.pending.clear();this.lastResult=null;this.cancelTargeting();
    for(const input of this.keys.values())input.down=Boolean(input.key.isDown);
  }
  close(){
    if(this.closed)return;this.closed=true;this.pending.clear();this.cancelTargeting();this.off();
    this.keyboard?.off?.('keydown-ESC',this.onCancel);
    for(const input of this.keys.values())this.keyboard?.removeKey(input.key,true,true);
    this.keys.clear();
  }
}
