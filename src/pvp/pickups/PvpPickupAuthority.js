import { PVP_PICKUP_RULES } from './config.js';
import { pickupEnabled,pickupEffect,withinPickupArea } from './gameplay.js';

// Round-scoped state only. The combat authority owns scheduling, player HP,
// authenticated membership and broadcasting; browsers never advance this state.
export class PvpPickupAuthority {
  constructor(spots,round,{rules=PVP_PICKUP_RULES}={}){
    this.spots=spots;this.rules=rules;this.reset(round);
  }
  reset(round){
    this.round=round;this.stopped=false;
    this.pickups=new Map(this.spots.map(({id,type,x,y})=>[id,{id,type,x,y,available:pickupEnabled(type),respawnAt:null}]));
  }
  snapshot(){return [...this.pickups.values()].map(pickup=>({...pickup}));}
  nextDeadline(match){
    if(this.stopped||match.state!=='active')return null;
    const deadlines=[...this.pickups.values()].map(pickup=>pickup.respawnAt).filter(Number.isFinite);
    return deadlines.length?Math.min(...deadlines):null;
  }
  advance(now,match){
    if(this.stopped||match.state!=='active'||(match.round??0)!==this.round)return false;
    let changed=false;
    for(const pickup of this.pickups.values())if(pickup.respawnAt!==null&&now>=pickup.respawnAt){
      pickup.available=true;pickup.respawnAt=null;changed=true;
    }
    return changed;
  }
  collect(id,player,position,match,now){
    const pickup=this.pickups.get(id);
    if(this.stopped||match.state!=='active'||(match.round??0)!==this.round||!pickup?.available
      ||!player||player.hp<=0||player.presenceRoom!==match.room||position?.life!==player.life
      ||!withinPickupArea(pickup,position,this.rules.collectionRadius))return null;
    const effect=pickupEffect(pickup.type,player,match,this.rules);if(!effect)return null;
    // Consume synchronously, before any persistence awaits: the first valid
    // movement sample wins even when several peers arrive in the same tick.
    pickup.available=false;pickup.respawnAt=now+effect.respawnMs;
    return {pickupId:id,playerId:player.playerId,changes:effect.changes};
  }
  collectAt(player,position,match,now){
    for(const pickup of this.pickups.values()){
      const result=this.collect(pickup.id,player,position,match,now);if(result)return result;
    }
    return null;
  }
  stop(){this.stopped=true;for(const pickup of this.pickups.values())pickup.respawnAt=null;}
  close(){this.stop();this.pickups.clear();}
}
