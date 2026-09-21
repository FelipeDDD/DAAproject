export const BOSS_ENCOUNTER_STATES=Object.freeze({DORMANT:'dormant',ACTIVE:'active',DEFEATED:'defeated'});

export function isWithinActivationRange(playerPosition,bossPosition,range){
  if(!playerPosition||!bossPosition||!Number.isFinite(range)||range<0)return false;
  return Math.hypot(playerPosition.x-bossPosition.x,playerPosition.y-bossPosition.y)<=range;
}

export class BossTutorialState {
  constructor(){this.reset();}
  show(){if(this.shown)return false;this.shown=true;this.visible=true;return true;}
  dismiss(){if(!this.visible)return false;this.visible=false;return true;}
  reset(){this.shown=false;this.visible=false;}
}

export class BossEncounterState {
  constructor({followupDelayMs=5000,combatStartDelayMs=1000}={}){
    this.followupDelayMs=followupDelayMs;
    this.combatStartDelayMs=combatStartDelayMs;
    this.reset();
  }

  activate(now){
    if(this.state!==BOSS_ENCOUNTER_STATES.DORMANT)return false;
    this.state=BOSS_ENCOUNTER_STATES.ACTIVE;
    this.activatedAt=now;
    this.followupAt=now+this.followupDelayMs;
    this.combatReadyAt=Infinity;
    this.followupPending=true;
    return true;
  }

  consumeFollowup(now){
    if(this.state!==BOSS_ENCOUNTER_STATES.ACTIVE||!this.followupPending||now<this.followupAt)return false;
    this.followupPending=false;
    this.combatReadyAt=now+this.combatStartDelayMs;
    return true;
  }

  defeat(){this.state=BOSS_ENCOUNTER_STATES.DEFEATED;this.followupPending=false;}
  reset(){this.state=BOSS_ENCOUNTER_STATES.DORMANT;this.activatedAt=null;this.followupAt=Infinity;this.combatReadyAt=Infinity;this.followupPending=false;}
  get active(){return this.state===BOSS_ENCOUNTER_STATES.ACTIVE;}
  canFight(now){return this.active&&!this.followupPending&&now>=this.combatReadyAt;}
}
