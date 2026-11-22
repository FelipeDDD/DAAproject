import { acquireAggro,DEFAULT_AGGRO,trackAggro } from './combatAggro.js';
import { RING,clamp,groundPoint,playerBox,segmentContact,toward } from './combatGeometry.js';

const SCALE=0.94;
const HEAD_X=32*SCALE,HEAD_Y=-9.5*SCALE;
const LOOP_MS=2400;
const SIDE_MARGIN=39;

export const SNAKE={
  ...DEFAULT_AGGRO,label:'Snake',size:1,scale:SCALE,maxHp:80,poseMs:0,
  box:snakeBox,update:updateSnake,onDamaged:acquireAggro,biteCenter:head,
  speed:78,lateralSpeed:28,
  diagonalChase:{angleDeg:32,minLegMs:300,maxLegMs:500,enterRatio:0.62,exitRatio:0.85},
  bite:{name:'Venom Bite',range:86,windupMs:450,lungeMs:185,recoverMs:440,cooldown:1520,damage:15,radius:5},
};

function head(snake){
  return {x:snake.x+HEAD_X*(snake.facing??1)*(snake.stretchX??1),y:snake.y+HEAD_Y};
}

function snakeBox(snake){
  const stretch=snake.stretchX??1;
  const left=(snake.facing<0?-38:-40)*SCALE*stretch;
  return {x:snake.x+left,y:snake.y-14*SCALE,width:78*SCALE*stretch,height:14*SCALE};
}

function diagonalStep(actor,dx,dy,speed,dt){
  const {aggro,enemy,spec}=actor;
  const {angleDeg,minLegMs,maxLegMs,enterRatio,exitRatio}=spec.diagonalChase;
  let leg=aggro.diagonal;
  if(!dy||Math.abs(dx)>Math.abs(dy)*(leg?exitRatio:enterRatio)){
    aggro.diagonal=null;
    return null;
  }
  if(!leg||leg.remaining<=0){
    let side=leg?-leg.side:Math.sign(dx)||(actor.id%2?-1:1);
    if((enemy.x<=RING.left+SIDE_MARGIN&&side<0)||(enemy.x>=RING.right-SIDE_MARGIN&&side>0))side=-side;
    leg=aggro.diagonal={side,remaining:minLegMs+actor.aiSample()*(maxLegMs-minLegMs)};
  }
  leg.remaining-=dt;
  const angle=angleDeg*Math.PI/180,step=speed*dt/1000;
  return groundPoint({x:enemy.x+leg.side*Math.sin(angle)*step,y:enemy.y+Math.sign(dy)*Math.cos(angle)*step},SIDE_MARGIN);
}

function updateSnake(actor,player,movementDt,dt){
  const {enemy,spec,elapsed,attack}=actor;
  const {bite}=spec;
  const dx=player.x-enemy.x,dy=player.y-enemy.y,distance=Math.hypot(dx,dy);
  const aggro=trackAggro(actor,distance,dt);
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
    enemy.x=from.x+(to.x-from.x)*travel;
    enemy.y=from.y+(to.y-from.y)*travel;
    enemy.stretchX=0.69+0.31*Math.min(1,t*4);
    enemy.poseMs=(enemy.poseMs+movementDt*2)%LOOP_MS;
    const point=!attack.hit&&segmentContact(previous,head(enemy),playerBox(player),bite.radius);
    if(point){
      attack.hit=true;
      actor.bout.hurt(bite.damage,point,'Poisoned');
    }
    if(t===1&&!actor.finished)actor.recover();
    return;
  }
  if(actor.phase==='recover'){
    if(elapsed<bite.recoverMs)return;
    actor.phase='idle';
    actor.elapsed=0;
  }
  if(!aggro)return;
  if(!actor.cooldown&&distance<=bite.range){
    if(Math.abs(dx)>6)enemy.facing=Math.sign(dx);
    aggro.diagonal=null;
    const to=groundPoint({x:player.x-HEAD_X*(enemy.facing??1),y:player.y},SIDE_MARGIN);
    actor.windup('bite',to,bite.cooldown);
    return;
  }
  const clock=actor.crawlMs??actor.id*420;
  actor.crawlMs=clock+movementDt;
  const side=spec.lateralSpeed*Math.sin(clock/350);
  const approach=spec.speed*clamp((distance-30)/42,0,1)*(1-0.38*Math.abs(side/spec.lateralSpeed));
  const length=distance||1,step=movementDt/(1000*length);
  const diagonal=diagonalStep(actor,dx,dy,spec.speed*clamp((distance-30)/42,0,1),movementDt);
  const to=diagonal??groundPoint({x:enemy.x+(dx*approach-dy*side)*step,y:enemy.y+(dy*approach+dx*side)*step},SIDE_MARGIN);
  if(diagonal&&to.x!==enemy.x)enemy.facing=Math.sign(to.x-enemy.x);
  if(!diagonal&&Math.abs(dx)>6)enemy.facing=Math.sign(dx);
  if(to.x!==enemy.x||to.y!==enemy.y)enemy.poseMs=(enemy.poseMs+movementDt)%LOOP_MS;
  Object.assign(enemy,toward(enemy,to,spec.speed*movementDt/1000));
}
