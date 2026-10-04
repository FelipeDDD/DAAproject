import { PAYLOAD_RULES } from './config.js';
import { pointAt } from './route.js';
import { endMatch } from '../matchState.js';

// Objective rules only. Position samples, ownership, HP and life come from the
// shared combat authority; no second player-position stream or client decisions.
export class PayloadAuthority {
  constructor(route,{now=Date.now,...rules}={}){
    this.route=route;this.rules={...PAYLOAD_RULES,...rules};this.lastAt=now();
    const box=this.rules.payloadPresenceBox;
    if(['speed','radius','tickMs'].some(k=>!Number.isFinite(this.rules[k])||this.rules[k]<=0)||this.rules.radius>1000
      ||!box||['width','height'].some(k=>!Number.isFinite(box[k])||box[k]<=0)
      ||!Number.isFinite(box.offsetY)||!Number.isFinite(box.hysteresisPx)||box.hysteresisPx<0)
      throw new Error('Invalid payload tuning.');
    this.distance=route.length*route.initialFraction;this.current=this.snapshot(null,false,false);
    this.nextTickAt=this.lastAt+this.rules.tickMs;
    this.presenceByPlayer=new Map();
    this.scoreVictory=false;
  }
  snapshot(control,contested,moving){return {...pointAt(this.route,this.distance),distance:this.distance,
    routeLength:this.route.length,radius:this.rules.radius,control,contested,moving};}
  controlAt(at,match,positions,members,getSpawn){
    const center=pointAt(this.route,this.distance),teams=new Set(),seen=new Set();
    const box=this.rules.payloadPresenceBox;
    for(const p of match.participants){
      if(p.hp<=0||!members.has(p.playerId)||p.presenceRoom!==match.room
        ||(p.presenceExpiresAt!==undefined&&at>=p.presenceExpiresAt))continue;
      seen.add(p.playerId);
      const position=positions.get(p.playerId)??{...getSpawn(p,match),life:p.life};
      if(position.life!==p.life||(position.moving&&at-position.at>this.rules.maxMovingSampleAgeMs)){
        this.presenceByPlayer.delete(p.playerId);continue;
      }
      // Player x/y is the foot anchor. Measure from the closest point of this
      // Payload-only rectangle to the cart circle, with a small exit margin.
      const dx=Math.max(Math.abs(position.x-center.x)-box.width/2,0);
      const footCenterY=position.y+box.offsetY;
      const dy=Math.max(Math.abs(footCenterY-center.y)-box.height/2,0);
      const wasInside=this.presenceByPlayer.get(p.playerId)===true;
      if(Math.hypot(dx,dy)<=this.rules.radius+(wasInside?box.hysteresisPx:0)){
        this.presenceByPlayer.set(p.playerId,true);teams.add(p.team);
      }else this.presenceByPlayer.delete(p.playerId);
    }
    for(const playerId of this.presenceByPlayer.keys())if(!seen.has(playerId))this.presenceByPlayer.delete(playerId);
    return {control:teams.size===1?[...teams][0]:null,contested:teams.size>1};
  }
  advance(at,match,positions,members,getSpawn){
    if(match.state!=='active'){
      this.lastAt=at;this.nextTickAt=at+this.rules.tickMs;this.current={...this.current,moving:false};return {payload:this.current};
    }
    // Substeps also keep a stalled server from pushing beyond a stationary
    // escort's radius. Only the final snapshot is broadcast (no catch-up burst).
    let cursor=Math.max(this.lastAt,match.startedAt??this.lastAt),winner=null,endedAt=null;
    while(cursor<at){
      const end=Math.min(at,cursor+this.rules.tickMs),{control}=this.controlAt(cursor,match,positions,members,getSpawn);
      if(control){
        const sign=control==='A'?1:-1,remaining=sign>0?this.route.length-this.distance:this.distance;
        const travel=this.rules.speed*(end-cursor)/1000;
        this.distance=Math.max(0,Math.min(this.route.length,this.distance+sign*Math.min(remaining,travel)));
        if(travel>=remaining){winner=control;endedAt=cursor+remaining/this.rules.speed*1000;break;}
      }
      cursor=end;
    }
    this.lastAt=at;
    const {control,contested}=this.controlAt(at,match,positions,members,getSpawn);
    this.current=this.snapshot(control,contested,Boolean(control)&&!winner);
    return {payload:this.current,winner,endedAt};
  }
  finishTimeout(match,at){return {...endMatch(match,at,'timer'),winner:'draw'};}
  shouldBroadcast(at,previous){
    if(at>=this.nextTickAt||previous?.control!==this.current.control||previous?.contested!==this.current.contested||previous?.moving!==this.current.moving){
      this.nextTickAt=at+this.rules.tickMs;return true;
    }
    return false;
  }
  nextDeadline(match){return match.state==='active'?this.nextTickAt:null;}
}
