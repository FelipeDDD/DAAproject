import { SWAMP_MINI_BOSS } from './runConfig.js';

export class SwampMiniBoss {
  constructor(mobs,run){
    Object.assign(this,{mobs,run});
    this.hud=document.createElement('div');
    this.hud.className='swamp-mini-boss-hud';
    this.hud.hidden=true;
    this.label=document.createElement('strong');
    this.label.textContent=SWAMP_MINI_BOSS.name;
    this.health=document.createElement('progress');
    this.health.setAttribute('aria-label',SWAMP_MINI_BOSS.name+' health');
    this.hud.append(this.label,this.health);
    document.getElementById('game-shell')?.append(this.hud);
  }

  get entry(){return this.mobs.entries.find(({mob})=>mob.spawnId===SWAMP_MINI_BOSS.id);}

  start({force=false,practice=false}={}){
    const {id,kind,spawn,activationRadius}=SWAMP_MINI_BOSS;
    const {scene,terrain,bout}=this.mobs;
    if(this.entry||!bout.playerHp||!terrain[kind].clear(spawn))return false;
    const defeated=this.run.defeated.has(id);
    if(practice?!defeated:defeated||this.run.next?.elite!==id)return false;
    const feet=scene.player.body.center;
    if(!force&&(Math.hypot(feet.x-spawn.x,feet.y-spawn.y)>activationRadius||
      !terrain[kind].sees(spawn,feet)))return false;
    const mob=this.mobs.add({id,kind,...spawn,miniBoss:true});
    this.practiceMob=practice?mob:null;
    return Boolean(mob);
  }

  reset(reactions){
    this.clearSummons(reactions);
    const entry=this.entry;
    if(entry){
      reactions.clear(entry.sprite);
      this.mobs.removeWhere(mob=>mob===entry.mob);
    }
    return this.start({force:true,practice:this.run.defeated.has(SWAMP_MINI_BOSS.id)});
  }

  clearSummons(reactions){
    const spawnId=SWAMP_MINI_BOSS.id+':summon';
    for(const {mob,sprite} of this.mobs.entries)if(mob.spawnId===spawnId)reactions.clear(sprite);
    this.mobs.removeWhere(mob=>mob.spawnId===spawnId);
    this.mobs.clearDeathFields(area=>area.spawnId===spawnId);
  }

  updateHud(){
    const mob=this.entry?.mob;
    this.hud.hidden=!(mob?.enemy.hp&&this.mobs.bout.playerHp);
    if(this.hud.hidden)return;
    const title=SWAMP_MINI_BOSS.name+' · '+mob.boss.phase.name;
    if(this.label.textContent!==title)this.label.textContent=title;
    if(this.health.max!==mob.spec.maxHp)this.health.max=mob.spec.maxHp;
    if(this.health.value!==mob.enemy.hp)this.health.value=mob.enemy.hp;
  }

  destroy(){this.hud.remove();}
}
