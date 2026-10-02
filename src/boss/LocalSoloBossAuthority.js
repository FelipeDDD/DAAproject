import { BossAttackSequence } from './BossAttackPattern.js';
import { BossCombatState,BossPhaseState,BOSS_STATES } from './BossCombatState.js';
import { ArenaEncounter,ARENA_MODES } from './ArenaEncounter.js';
import { BOSS_ATTACK_COOLDOWN_MS,BOSS_PHASE_THRESHOLDS } from './config.js';

// Gameplay decisions live here; BossController consumes the resulting state
// and events to animate the current local Solo fight.
export class LocalSoloBossAuthority {
  constructor({encounter=new ArenaEncounter(),now=0}={}){
    if(encounter.mode!==ARENA_MODES.SOLO)throw new Error('Local boss authority is Solo only.');
    this.encounter=encounter;
    this.stats=encounter.bossConfig;
    this.model=new BossCombatState({maxHp:this.stats.maxHp,attackCooldownMs:BOSS_ATTACK_COOLDOWN_MS,now});
    this.phaseState=new BossPhaseState({maxHp:this.stats.maxHp,thresholds:BOSS_PHASE_THRESHOLDS});
    this.attackSequence=new BossAttackSequence();
    this.attackEvent=null;this.nextAttackSequence=1;
  }
  start(now=0,attackDelayMs=0){
    if(!this.encounter.start())return false;
    this.model.nextAttackAt=Math.max(this.model.nextAttackAt,now+attackDelayMs);
    return true;
  }
  peekAttackType(){return this.attackSequence.peek();}
  startAttack(now,{type,force=false,advanceSequence=true,cooldownMs,telegraphMs=0,origin,target,parameters={}}){
    if(this.encounter.state!=='active')return null;
    const attackType=type??this.attackSequence.peek();
    if(!this.model.startAttack(now,{type:attackType,force,cooldownMs,telegraphMs}))return null;
    if(advanceSequence)this.attackSequence.advance();
    this.attackEvent=Object.freeze({
      eventId:`${this.encounter.encounterId}:attack:${this.nextAttackSequence++}`,
      type:attackType,startedAt:now,executeAt:now+telegraphMs,phase:this.phaseState.phase,
      origin:Object.freeze({x:origin.x,y:origin.y}),
      target:Object.freeze({x:target.x,y:target.y}),
      parameters:Object.freeze({...parameters}),
    });
    return this.attackEvent;
  }
  executeAttack(now){
    if(!this.model.attackReady(now)||!this.model.markAttackExecuted())return null;
    return this.attackEvent;
  }
  cancelAttack(){this.model.cancelAttack();this.attackEvent=null;}
  finishAction(){this.model.finishAction();this.attackEvent=null;}
  startMoving(){return this.model.startMoving();}
  finishMoving(){return this.model.finishMoving();}
  applyDamage(amount){
    if(this.encounter.state!=='active')return {damage:0,dying:false,phaseChanged:false};
    const damage=this.model.takeDamage(amount);
    if(!damage)return {damage:0,dying:false,phaseChanged:false};
    const dying=this.model.state===BOSS_STATES.DYING;
    const phaseChanged=dying?false:this.phaseState.update(this.model.hp);
    return {damage,dying,phaseChanged};
  }
  beginPhaseTransition(){
    if(!this.phaseState.transitionPending||!this.model.startPhaseTransition())return false;
    this.phaseState.consumeTransition();return true;
  }
  finishPhaseTransition(){return this.model.finishPhaseTransition();}
  beginReward(){return this.model.beginReward();}
  finishReward(){return this.model.finishReward();}
  defeat(){return this.model.state===BOSS_STATES.DYING&&this.encounter.defeat();}
  complete(onComplete){
    if(this.encounter.state!=='defeated'||!this.model.finishDying())return false;
    if(!this.encounter.complete())return false;
    onComplete?.();
    return true;
  }
  reset(now=0){
    this.encounter.reset();this.model.reset(now);this.phaseState.reset();this.attackSequence.reset();
    this.attackEvent=null;this.nextAttackSequence=1;
  }
}

export function createLocalBossAuthority(encounter,now=0){
  return encounter.mode===ARENA_MODES.SOLO?new LocalSoloBossAuthority({encounter,now}):null;
}
