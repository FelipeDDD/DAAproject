export const BOSS_STATES=Object.freeze({
  IDLE:'idle',ATTACKING:'attacking',HURT:'hurt',MOVING:'moving',
  PHASE_TRANSITION:'phaseTransition',DEFEATED:'defeated',
});

export class BossCombatState {
  constructor({maxHp=100,attackCooldownMs=2000,now=0}={}){
    this.maxHp=maxHp;
    this.hp=maxHp;
    this.attackCooldownMs=attackCooldownMs;
    this.nextAttackAt=now+attackCooldownMs;
    this.state=BOSS_STATES.IDLE;
    this.activeAttack=null;
  }

  canAttack(now){
    return this.state===BOSS_STATES.IDLE&&now>=this.nextAttackAt;
  }

  startAttack(now,{type='single',cooldownMs=this.attackCooldownMs,telegraphMs=0}={}){
    if(!this.canAttack(now))return false;
    this.state=BOSS_STATES.ATTACKING;
    this.nextAttackAt=now+cooldownMs;
    this.activeAttack={type,executeAt:now+telegraphMs,executed:false};
    return true;
  }

  attackReady(now){
    return this.state===BOSS_STATES.ATTACKING&&this.activeAttack&&!this.activeAttack.executed
      &&now>=this.activeAttack.executeAt;
  }

  markAttackExecuted(){
    if(!this.activeAttack||this.activeAttack.executed)return false;
    this.activeAttack.executed=true;
    return true;
  }

  cancelAttack(){
    this.activeAttack=null;
    if(this.state===BOSS_STATES.ATTACKING)this.state=BOSS_STATES.IDLE;
  }

  startMoving(){
    if(this.state!==BOSS_STATES.IDLE)return false;
    this.state=BOSS_STATES.MOVING;
    return true;
  }

  finishMoving(){
    if(this.state!==BOSS_STATES.MOVING)return false;
    this.state=BOSS_STATES.IDLE;
    return true;
  }

  startPhaseTransition(){
    if(this.state!==BOSS_STATES.IDLE)return false;
    this.state=BOSS_STATES.PHASE_TRANSITION;
    return true;
  }

  finishPhaseTransition(){
    if(this.state!==BOSS_STATES.PHASE_TRANSITION)return false;
    this.state=BOSS_STATES.IDLE;
    return true;
  }

  finishAction(){
    if(this.state===BOSS_STATES.ATTACKING||this.state===BOSS_STATES.HURT)this.state=BOSS_STATES.IDLE;
    this.activeAttack=null;
  }

  takeDamage(amount){
    if(this.state===BOSS_STATES.DEFEATED||!Number.isFinite(amount)||amount<=0)return 0;
    const previous=this.hp;
    this.hp=Math.max(0,this.hp-amount);
    const uninterrupted=this.state===BOSS_STATES.MOVING||this.state===BOSS_STATES.PHASE_TRANSITION;
    const currentState=this.state;
    this.state=this.hp===0?BOSS_STATES.DEFEATED:uninterrupted?currentState:BOSS_STATES.HURT;
    this.activeAttack=null;
    return previous-this.hp;
  }

  reset(now=0){
    this.hp=this.maxHp;
    this.nextAttackAt=now+this.attackCooldownMs;
    this.state=BOSS_STATES.IDLE;
    this.activeAttack=null;
  }
}

export class BossPhaseState {
  constructor({maxHp=100,thresholds={2:0.65,3:0.30}}={}){
    this.maxHp=maxHp;
    this.thresholds={...thresholds};
    this.reset();
  }

  update(hp){
    if(!Number.isFinite(hp))return false;
    const ratio=hp/this.maxHp;
    const nextPhase=ratio<=this.thresholds[3]?3:ratio<=this.thresholds[2]?2:1;
    if(nextPhase<=this.phase)return false;
    this.phase=nextPhase;
    this.transitionPending=true;
    return true;
  }

  consumeTransition(){
    if(!this.transitionPending)return false;
    this.transitionPending=false;
    return true;
  }

  reset(){this.phase=1;this.transitionPending=false;}
}

export class PlayerCombatState {
  constructor({maxHp=3,invulnerabilityMs=650}={}){
    this.maxHp=maxHp;
    this.invulnerabilityMs=invulnerabilityMs;
    this.reset();
  }

  takeHit(now,damage=1){
    if(this.defeated||now<this.invulnerableUntil||!Number.isFinite(damage)||damage<=0)return 0;
    const previous=this.hp;
    this.hp=Math.max(0,this.hp-damage);
    this.invulnerableUntil=now+this.invulnerabilityMs;
    this.defeated=this.hp===0;
    return previous-this.hp;
  }

  reset(){
    this.hp=this.maxHp;
    this.invulnerableUntil=0;
    this.defeated=false;
  }
}

// Physics callbacks may provide colliding objects in either order. Projectiles
// carry an explicit kind so callers never accidentally destroy the target.
export function projectileFromCollision(first,second,kind){
  return [first,second].find(object=>object?.getData?.('projectileKind')===kind)??null;
}

export class ProjectileHitRegistry {
  constructor(){this.resolved=new WeakSet();}
  prepare(projectile){this.resolved.delete(projectile);}
  claim(projectile){
    if(!projectile||this.resolved.has(projectile))return false;
    this.resolved.add(projectile);
    return true;
  }
}

export function aimedVelocity(from,to,speed){
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  if(!length)return {x:0,y:0};
  return {x:dx/length*speed,y:dy/length*speed};
}

export function projectileVelocityToward(from,to,speed,epsilon=0.001){
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  if(!Number.isFinite(length)||length<=epsilon||!Number.isFinite(speed)||speed<=0)return null;
  return {x:dx/length*speed,y:dy/length*speed};
}
