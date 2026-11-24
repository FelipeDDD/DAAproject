import { acquireAggro,DEFAULT_AGGRO } from './combatAggro.js';
import { RING,clamp,groundPoint,playerBox,segmentContact,toward } from './combatGeometry.js';
import balance from '../../combat/balance.json' with {type:'json'};

const SCALE=0.94;
const HEAD_X=32*SCALE,HEAD_Y=-9.5*SCALE;
const LOOP_MS=2400;
const SIDE_MARGIN=39;
const ARENA_CRAWL={
  fit:point=>groundPoint(point,SIDE_MARGIN),
  left:RING.left+SIDE_MARGIN,right:RING.right-SIDE_MARGIN,
};

export const SNAKE={
  ...DEFAULT_AGGRO,label:'Snake',size:1,scale:SCALE,maxHp:80,poseMs:0,
  box:snakeBox,update:updateSnake,onDamaged:acquireAggro,biteCenter:head,
  ...structuredClone(balance.snake),
  bite:{name:'Venom Bite',...balance.snake.bite},
};

function head(snake){
  return {x:snake.x+HEAD_X*(snake.facing??1)*(snake.stretchX??1),y:snake.y+HEAD_Y};
}

function snakeBox(snake){
  const stretch=snake.stretchX??1;
  const left=(snake.facing<0?-38:-40)*SCALE*stretch;
  return {x:snake.x+left,y:snake.y-14*SCALE,width:78*SCALE*stretch,height:14*SCALE};
}

function diagonalStep(actor,enemy,dx,dy,speed,dt,space){
  const {aggro,spec}=actor;
  const {angleDeg,minLegMs,maxLegMs,enterRatio,exitRatio}=spec.diagonalChase;
  let leg=aggro.diagonal;
  if(!dy||Math.abs(dx)>Math.abs(dy)*(leg?exitRatio:enterRatio)){
    aggro.diagonal=null;
    return null;
  }
  if(!leg||leg.remaining<=0){
    let side=leg?-leg.side:Math.sign(dx)||((actor.crawlSeed??actor.id)%2?-1:1);
    if((enemy.x<=space.left&&side<0)||(enemy.x>=space.right&&side>0))side=-side;
    leg=aggro.diagonal={side,remaining:minLegMs+actor.aiSample()*(maxLegMs-minLegMs)};
  }
  leg.remaining-=dt;
  const angle=angleDeg*Math.PI/180,step=speed*dt/1000;
  return space.fit({x:enemy.x+leg.side*Math.sin(angle)*step,y:enemy.y+Math.sign(dy)*Math.cos(angle)*step});
}

export function snakeCrawlStep(actor,enemy,player,dt,space=ARENA_CRAWL){
  const {spec}=actor;
  const dx=player.x-enemy.x,dy=player.y-enemy.y,distance=Math.hypot(dx,dy);
  const clock=actor.crawlMs??(actor.crawlSeed??actor.id)*420;
  actor.crawlMs=clock+dt;
  const side=spec.lateralSpeed*Math.sin(clock/350);
  const speed=spec.speed*clamp((distance-30)/42,0,1);
  const approach=speed*(1-0.38*Math.abs(side/spec.lateralSpeed));
  const step=dt/(1000*(distance||1));
  const diagonal=diagonalStep(actor,enemy,dx,dy,speed,dt,space);
  const to=diagonal??space.fit({x:enemy.x+(dx*approach-dy*side)*step,y:enemy.y+(dy*approach+dx*side)*step});
  let facing=enemy.facing;
  if(diagonal&&to.x!==enemy.x)facing=Math.sign(to.x-enemy.x);
  if(!diagonal&&Math.abs(dx)>6)facing=Math.sign(dx);
  return {point:toward(enemy,to,spec.speed*dt/1000),facing,moving:to.x!==enemy.x||to.y!==enemy.y};
}

export function snakeCrawlPose(poseMs,dt){
  return (poseMs+dt)%LOOP_MS;
}

function planManeuver(actor,player,kind){
  const {enemy,spec,navigation}=actor;
  const canReach=(from,to)=>{
    if(navigation)return navigation.terrain.canReach(from,to);
    const inside=groundPoint(to,SIDE_MARGIN);
    return inside.x===to.x&&inside.y===to.y;
  };
  const {retreatDistance,flankDistance,feintDistance}=spec.tactics;
  const dx=player.x-enemy.x,dy=player.y-enemy.y;
  const distance=Math.hypot(dx,dy);
  const ux=distance?dx/distance:enemy.facing??1,uy=distance?dy/distance:0;
  const bias=actor.aiSample()<0.5?-1:1;
  const offset=(from,forward,side)=>({x:from.x+ux*forward-uy*side,y:from.y+uy*forward+ux*side});
  for(const side of kind==='retreat'?[bias,-bias,0]:[bias,-bias]){
    const forward=kind==='retreat'?-retreatDistance:kind==='feint'?Math.min(feintDistance,distance-34):6;
    if(kind==='feint'&&forward<12)continue;
    const lateral=kind==='retreat'?retreatDistance*0.28:kind==='feint'?8:flankDistance;
    const to=offset(enemy,forward,lateral*side);
    if(!canReach(enemy,to))continue;
    // A feint is only worth attempting when the snake can also turn away.
    const exit=kind==='feint'?offset(to,-6,flankDistance*side):null;
    if(exit&&!canReach(to,exit))continue;
    actor.snakeManeuver={kind,to,exit,distance:Math.hypot(to.x-enemy.x,to.y-enemy.y)};
    return true;
  }
  return false;
}

function moveManeuver(actor,player,dt){
  const {enemy,spec,snakeManeuver:move}=actor;
  const before=Math.hypot(move.to.x-enemy.x,move.to.y-enemy.y);
  if(!dt)return;
  const oldX=enemy.x;
  actor.phase='chase';
  actor.moveGround(toward(enemy,move.to,spec.speed*dt/1000));
  const left=Math.hypot(move.to.x-enemy.x,move.to.y-enemy.y);
  if(Math.abs(enemy.x-oldX)>0.05)enemy.facing=Math.sign(enemy.x-oldX);
  if(left<before)enemy.poseMs=snakeCrawlPose(enemy.poseMs,dt);
  if(move.kind==='feint')enemy.stretchX=1-0.2*Math.sin(Math.PI*(1-left/move.distance));
  if(left>0.5&&left<before-1e-6)return;
  enemy.stretchX=1;
  actor.snakeManeuver=null;
  if(left>0.5)return;
  if(move.kind==='retreat')planManeuver(actor,player,'flank');
  else if(move.exit)actor.snakeManeuver={kind:'flank',to:move.exit};
}

function updateSnake(actor,player,movementDt,dt){
  const {enemy,spec,elapsed,attack}=actor;
  const {bite}=spec;
  const dx=player.x-enemy.x,dy=player.y-enemy.y,distance=Math.hypot(dx,dy);
  const aggro=actor.trackTarget(player,distance,dt);
  if(!aggro){
    actor.snakeManeuver=null;
    actor.snakeRetreat=false;
    actor.snakeFeinted=false;
    actor.hasBitten=false;
  }
  if(actor.phase==='windup'){
    enemy.stretchX=1-0.31*clamp(elapsed/bite.windupMs,0,1);
    if(elapsed>=bite.windupMs){
      actor.hop={from:{x:enemy.x,y:enemy.y},to:attack.to};
      actor.phase='bite';
      actor.elapsed=0;
    }
    return;
  }
  if(actor.phase==='bite'){
    const previous=head(enemy);
    const {from,to}=actor.hop;
    const t=clamp(elapsed/bite.lungeMs,0,1);
    const travel=1-(1-t)**2;
    actor.moveGround({x:from.x+(to.x-from.x)*travel,y:from.y+(to.y-from.y)*travel});
    enemy.stretchX=0.69+0.31*Math.min(1,t*4);
    enemy.poseMs=snakeCrawlPose(enemy.poseMs,movementDt*2);
    const point=!attack.hit&&segmentContact(previous,head(enemy),playerBox(player),bite.radius);
    if(point&&actor.canContact(player)&&actor.bout.clearLine(previous,point)){
      attack.hit=true;
      actor.bout.hurt(bite.damage,point,'Poisoned');
    }
    if(t===1&&!actor.finished){
      actor.recover();
      if(aggro)actor.snakeRetreat=true;
    }
    return;
  }
  if(actor.phase==='recover'){
    if(elapsed<bite.recoverMs)return;
    actor.phase='idle';
    actor.elapsed=0;
  }
  if(aggro){
    if(actor.snakeRetreat){
      actor.snakeRetreat=false;
      planManeuver(actor,player,'retreat');
    }
    if(actor.snakeManeuver){moveManeuver(actor,player,movementDt);return;}
  }
  if(aggro&&!actor.cooldown&&distance<=bite.range&&actor.canContact(player)){
    if(actor.hasBitten&&!actor.snakeFeinted&&
      actor.aiSample()<spec.tactics.feintChance&&planManeuver(actor,player,'feint')){
      actor.snakeFeinted=true;
      return;
    }
    if(Math.abs(dx)>6)enemy.facing=Math.sign(dx);
    aggro.diagonal=null;
    const to=actor.planLanding({x:player.x-HEAD_X*(enemy.facing??1),y:player.y},SIDE_MARGIN);
    actor.windup('bite',to,bite.cooldown);
    actor.hasBitten=true;
    actor.snakeFeinted=false;
    return;
  }
  if(actor.navigation){actor.navigation.chase(actor,player,movementDt);return;}
  if(!aggro)return;
  const crawl=snakeCrawlStep(actor,enemy,player,movementDt);
  if(crawl.facing!==undefined)enemy.facing=crawl.facing;
  if(crawl.moving)enemy.poseMs=snakeCrawlPose(enemy.poseMs,movementDt);
  Object.assign(enemy,crawl.point);
}
