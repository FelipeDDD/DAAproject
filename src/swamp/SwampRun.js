import { SKILLS } from '../vfx/lab/combatSkills.js';
import { SWAMP_RUN } from './runConfig.js';

export class SwampRun {
  constructor(config=SWAMP_RUN,saved){
    this.config=config;
    this.restart();
    if(saved?.version!==1)return;
    if(typeof saved.ambushVariant==='string')this.ambushVariant=saved.ambushVariant;
    // Replay only a legal, contiguous sequence when restoring the tab.
    const defeated=Array.isArray(saved.defeated)?saved.defeated:[];
    const collected=Array.isArray(saved.collected)?saved.collected:[];
    if(Array.isArray(saved.firedTraps))this.firedTraps=new Set(saved.firedTraps.filter(id=>typeof id==='string'));
    if(Array.isArray(saved.ambushReadyAt))this.ambushReadyAt=new Map(saved.ambushReadyAt.filter(entry=>
      Array.isArray(entry)&&typeof entry[0]==='string'&&Number.isFinite(entry[1])));
    for(const step of config.checkpoints){
      if(step.elite&&defeated.includes(step.elite))this.defeat(step.elite);
      if(collected.includes(step.id))this.collect(step.id);
      const choice=saved.choices?.[step.slot];
      if(choice)this.choose(choice.category,choice.skill);
    }
    if(Number.isFinite(saved.hp))this.setHealth(saved.hp);
  }

  restart(){
    this.choices=this.config.checkpoints.map(()=>null);
    this.defeated=new Set();
    this.collected=new Set();
    this.firedTraps=new Set();
    this.ambushReadyAt=new Map();
    this.hp=this.config.maxHp;
  }

  get skills(){return this.choices.map(choice=>choice?.skill??null);}
  get next(){return this.config.checkpoints.find(step=>!this.choices[step.slot]);}
  get activeCheckpoint(){
    return this.config.checkpoints.findLast(step=>this.choices[step.slot])??this.config.checkpoints[0];
  }
  get pendingDrop(){
    const step=this.next;
    if(step?.elite&&this.defeated.has(step.elite)&&!this.collected.has(step.id))return step;
  }
  get pendingChoice(){
    const step=this.next;
    if(step&&(!step.elite||this.collected.has(step.id)))return step;
  }

  offers(step=this.pendingChoice){
    if(!step)return [];
    const chosen=new Set(this.skills);
    return step.categories.flatMap(id=>{
      if(this.config.requireUnusedMiddleCategory&&this.choices[step.excludeCategoryFromSlot]?.category===id)return [];
      const {label,skills}=this.config.categories[id];
      const available=skills.filter(skill=>SKILLS[skill]&&!chosen.has(skill));
      return available.length?[{id,label,skills:available}]:[];
    });
  }

  defeat(elite){
    if(this.next?.elite!==elite||!elite||this.defeated.has(elite))return false;
    this.defeated.add(elite);
    return true;
  }

  collect(id){
    if(this.pendingDrop?.id!==id)return false;
    this.collected.add(id);
    return true;
  }

  choose(category,skill){
    const step=this.pendingChoice;
    if(!step||!this.offers(step).some(offer=>offer.id===category&&offer.skills.includes(skill)))return false;
    this.choices[step.slot]={category,skill};
    this.setHealth(this.hp+this.config.checkpointHeal);
    return true;
  }

  setHealth(hp){
    if(Number.isFinite(hp))this.hp=Math.max(0,Math.min(this.config.maxHp,Math.round(hp)));
  }

  respawn(){
    this.hp=this.config.maxHp;
    return this.activeCheckpoint;
  }

  snapshot(){
    return {version:1,choices:[...this.choices],defeated:[...this.defeated],collected:[...this.collected],
      firedTraps:[...this.firedTraps],...(this.ambushReadyAt.size?{ambushReadyAt:[...this.ambushReadyAt]}:{}),
      ...(this.ambushVariant?{ambushVariant:this.ambushVariant}:{}),hp:this.hp};
  }
}

const tabRuns=new WeakMap();
export function localSwampRun(game){
  if(tabRuns.has(game))return tabRuns.get(game);
  let saved;
  try{saved=JSON.parse(globalThis.sessionStorage.getItem(SWAMP_RUN.storageKey));}catch{/* Memory still works. */}
  const run=new SwampRun(SWAMP_RUN,saved);
  tabRuns.set(game,run);
  return run;
}

export function saveSwampRun(run){
  try{globalThis.sessionStorage.setItem(run.config.storageKey,JSON.stringify(run.snapshot()));}catch{/* Memory still works. */}
}

// Dev tools can jump ahead with legal defaults for earlier choices. The
// selected checkpoint still goes through its normal defeat and drop flow.
export function prepareCheckpoint(run,target,{defeat=true}={}){
  if(!run.next||target.slot<run.next.slot)return false;
  while(run.next&&run.next.slot<target.slot){
    const step=run.next;
    if(step.elite){run.defeat(step.elite);run.collect(step.id);}
    const [offer]=run.offers();
    if(!offer||!run.choose(offer.id,offer.skills[0]))return false;
  }
  return run.next===target&&(!defeat||Boolean(run.pendingDrop)||run.defeat(target.elite));
}
