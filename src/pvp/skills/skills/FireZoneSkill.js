import { clampSkillAim } from '../config.js';

const DIRECTIONS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const bounded=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;

// Gameplay only: no Phaser, input, Payload objective or HUD dependencies.
export const FireZoneSkill={
  id:'fire-zone',
  validConfig:c=>bounded(c.cooldownMs,1000,300000)&&bounded(c.telegraphMs,0,10000)
    &&bounded(c.durationMs,250,30000)&&bounded(c.radius,2,500)
    &&bounded(c.damagePerSecond,0.3,100)&&bounded(c.tickMs,50,1000)
    &&c.tickMs<=c.durationMs&&bounded(c.placementDistance,0,300)
    &&Number.isInteger(c.maxRangeTiles)&&c.maxRangeTiles>=1&&c.maxRangeTiles<=32
    &&Number.isInteger(c.tileSize)&&c.tileSize>=1&&c.tileSize<=256,
  create({position,aim,config,now}){
    let x,y;
    if(aim){
      const target=clampSkillAim(position,aim,config.maxRangeTiles*config.tileSize);
      if(!target)return null;
      ({x,y}=target);
    }else{
      const direction=DIRECTIONS[position.direction];if(!direction)return null;
      const distance=Math.min(config.placementDistance,config.maxRangeTiles*config.tileSize);
      x=position.x+direction.x*distance;y=position.y+direction.y*distance;
    }
    return {x,y,
      radius:config.radius,activeAt:now+config.telegraphMs,endsAt:now+config.telegraphMs+config.durationMs,
      phase:'telegraph',lastTickAt:now+config.telegraphMs,nextAt:now+config.telegraphMs};
  },
  advance(instance,world,now){
    const d=instance.data,c=instance.config;
    if(now<d.nextAt)return false;
    if(d.phase==='telegraph'){
      d.phase='active';d.nextAt=Math.min(d.activeAt+c.tickMs,d.endsAt);return true;
    }
    // A delayed timer applies only one bounded interval, never catch-up damage
    // based on a target's current position for time spent elsewhere.
    const at=Math.min(now,d.endsAt),elapsed=Math.min(at-d.lastTickAt,c.tickMs);
    d.lastTickAt=at;d.nextAt=Math.min(at+c.tickMs,d.endsAt);
    for(const player of world.state().participants){
      if(player.playerId===instance.ownerId||player.team===instance.team||player.hp<=0
        ||player.presenceRoom!==world.state().room||!world.connected(player.playerId))continue;
      const position=world.position(player);
      if(position.life!==player.life||(position.moving&&now-position.at>1000))continue;
      if(Math.hypot(position.x-d.x,position.y-d.y)<=d.radius)
        world.damage(instance,player,c.damagePerSecond*elapsed/1000,now);
    }
    return true;
  },
  nextDeadline:instance=>instance.data.nextAt,
  expired:(instance,now)=>now>=instance.data.endsAt,
  snapshot:instance=>({x:instance.data.x,y:instance.data.y,radius:instance.data.radius,
    phase:instance.data.phase,activeAt:instance.data.activeAt,endsAt:instance.data.endsAt}),
};
