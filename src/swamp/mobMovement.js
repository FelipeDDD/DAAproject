import { createFootCollision, isFootPositionClear } from '../maps/footCollision.js';
export { createCombatSpace } from '../maps/footCollision.js';
import { acquireAggro } from '../vfx/lab/combatAggro.js';
import { CombatEnemy, ENEMIES } from '../vfx/lab/combatEnemy.js';
import { frogChaseTarget } from '../vfx/lab/frogEnemy.js';
import { slimeChaseStep } from '../vfx/lab/slimeEnemy.js';
import { snakeCrawlPose, snakeCrawlStep } from '../vfx/lab/snakeEnemy.js';
import { SWAMP_AGGRO, SWAMP_EMERGENCE, SWAMP_ENCOUNTER_TERRAIN, SWAMP_MOB_TERRAIN, SWAMP_PACK_AGGRO, SWAMP_ROAMING, SWAMP_ROUTING } from './mobConfig.js';
import { createMobRoutes, createSpawnReachability } from './mobRoutes.js';

const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const onSegment = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const toward = (a,b,step) => onSegment(a,b,Math.min(1,step/(dist(a,b)||1)));
const MIN_HOP_FRACTION = 0.25;

export function createSwampSpawnTerrain(obstacles,bounds,playerRadius,entrance){
  const terrain=Object.fromEntries(Object.entries({...SWAMP_MOB_TERRAIN,...SWAMP_ENCOUNTER_TERRAIN}).map(([kind,{footRadius}])=>
    [kind,createMobTerrain(obstacles,bounds,footRadius)]));
  terrain.marker=createMobTerrain(obstacles,bounds,playerRadius);
  terrain.marker.reachable=createSpawnReachability(terrain.marker,bounds,entrance);
  return terrain;
}

export function createMobTerrain(obstacles,bounds,radius) {
  const move = createFootCollision(obstacles,bounds,radius);
  const trace = createFootCollision(obstacles,bounds,1);
  const exitTraces=new Map();
  const clear = point => isFootPositionClear(obstacles,bounds,radius,point);
  const terrain={
    move,clear,
    inBounds:({x,y})=>x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom,
    canReach:(from,to)=>clear(from)&&clear(to)&&dist(move(from,to,false),to)<0.01,
    sees:(from,to)=>dist(trace(from,to,false),to)<0.01,
    canEmerge(origin,landing,vegetation,limit){
      return !terrain.emergenceError(origin,landing,vegetation,limit);
    },
    emergenceError(origin,landing,vegetation,limit=SWAMP_EMERGENCE.maxDistance){
      const distance=dist(origin,landing);
      if(!terrain.inBounds(origin))return 'Place the visual origin inside the map.';
      if(!clear(landing))return 'The landing point is blocked by collision.';
      if(distance>limit)return 'The landing is more than '+limit+' px from the visual origin.';
      if(dist(trace(landing,origin,false),origin)<0.01)return '';
      if(!vegetation)return 'The emergence path is blocked. For a bush, enable Emerge from vegetation in Advanced.';
      // Only the solid containing the origin may be crossed, and only once.
      const dx=landing.x-origin.x,dy=landing.y-origin.y;
      let exitObstacle;
      const crossings=new Set();
      for(const obstacle of obstacles)for(const {a,b} of obstacle.edges){
        const ex=b.x-a.x,ey=b.y-a.y,det=dx*ey-dy*ex;
        if(Math.abs(det)<1e-8)continue;
        const ax=a.x-origin.x,ay=a.y-origin.y;
        const t=(ax*ey-ay*ex)/det,u=(ax*dy-ay*dx)/det;
        if(t<0||t>1||u<0||u>1)continue;
        if(!obstacle.solid||(exitObstacle&&exitObstacle!==obstacle)||isFootPositionClear([obstacle],bounds,0.001,origin))
          return 'The emergence path crosses a wall or a separate obstacle.';
        exitObstacle=obstacle;
        if(t*distance>SWAMP_EMERGENCE.vegetationDepth)
          return 'The visual origin is too deep inside the vegetation. Choose a spot closer to its edge.';
        crossings.add(Math.round(t*1e6));
      }
      if(crossings.size!==1)return 'The emergence needs one clear exit from the vegetation.';
      if(!exitTraces.has(exitObstacle))exitTraces.set(exitObstacle,
        createFootCollision(obstacles.filter(obstacle=>obstacle!==exitObstacle),bounds,1));
      return dist(exitTraces.get(exitObstacle)(landing,origin,false),origin)<0.01?'':
        'The emergence path crosses a wall or a separate obstacle.';
    },
    crawlSpace:{left:bounds.left+radius,right:bounds.right-radius,fit:point=>point},
  };
  terrain.findRoute=createMobRoutes(terrain,bounds,SWAMP_ROUTING);
  return terrain;
}

export function findNearbyMobSpawn(origin,terrain,mobs,radius) {
  for(const distance of [48,64,84]) for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const point={x:origin.x+Math.cos(angle)*distance,y:origin.y+Math.sin(angle)*distance};
    if(mobs.some(mob=>dist(mob.enemy,point)<mob.footRadius+radius+4))continue;
    if(terrain.clear(point)&&terrain.sees(point,origin))return point;
  }
  return null;
}

function hopDestination(terrain,from,desired,target){
  const requested=dist(from,desired);
  if(!requested)return null;
  let landing=terrain.move(from,desired);
  if(!terrain.canReach(from,landing)){
    // A sweep can slide around a corner; the direct line to its result can
    // still cross that corner. Keep the clear prefix of the original hop.
    let lo=0, hi=1;
    for(let i=0;i<8;i++){
      const mid=(lo+hi)/2;
      if(terrain.canReach(from,onSegment(from,desired,mid)))lo=mid;
      else hi=mid;
    }
    landing=onSegment(from,desired,lo);
  }
  if(dist(from,landing)<requested*MIN_HOP_FRACTION||dist(landing,target)>=dist(from,target))return null;
  return landing;
}

export function alertSwampPack(source,player,allies,config=SWAMP_PACK_AGGRO){
  if(!config.enabled||!source.encounterId)return;
  for(const ally of allies){
    if(ally===source||ally.encounterId!==source.encounterId||ally.checkpoint||
      ally.finished||ally.aggro||dist(source.enemy,ally.enemy)>config.radius||
      !source.terrain.sees(source.enemy,ally.enemy)||
      dist(ally.enemy,player)>SWAMP_AGGRO.releaseDistance)continue;
    ally.navigation.engage(ally);
  }
}

class SwampNavigation {
  constructor(spawn,terrain,{roaming,random,onAggro}){
    this.terrain=terrain;
    this.home={x:spawn.x,y:spawn.y};
    this.state='idle';
    this.wasDisengaged=false;
    this.counterMs=0;
    this.redetectMs=0;
    this.regenCarry=0;
    this.roaming=roaming;
    this.random=random;
    this.onAggro=onAggro;
    this.pauseRoaming();
    this.clearRoute();
  }

  clearRoute(){
    this.waypoints=null;
    this.routeGoal=null;
    this.routeRetryMs=0;
    this.noRouteMs=0;
    this.routeFailed=false;
  }

  engage(actor,player){
    const target=acquireAggro(actor);
    if(this.state!=='combat'){
      this.state='combat';
      this.clearRoute();
      this.regenCarry=0;
      this.roamGoal=null;
      if(this.wasDisengaged&&(actor.spec.special||actor.spec.longLeap)&&!this.counterMs)target.reengaged=true;
      this.wasDisengaged=false;
      if(player)this.onAggro?.(actor,player);
    }
    return target;
  }

  onDamaged(actor,player){
    if(this.state==='combat')return true;
    if(dist(actor.enemy,player)>SWAMP_AGGRO.releaseDistance)return false;
    this.engage(actor,player);
    return true;
  }

  onCounter(actor){
    actor.aggro.reengaged=false;
    this.counterMs=SWAMP_AGGRO.counterCooldownMs;
  }

  disengage(actor,unreachable){
    actor.stop();
    actor.phase='idle';
    actor.enemy.lift=0;
    actor.enemy.stretchX=1;
    actor.enemy.poseMs=actor.spec.poseMs;
    this.state='returning';
    this.wasDisengaged=true;
    this.redetectMs=unreachable?SWAMP_AGGRO.noRouteRedetectMs:0;
    this.clearRoute();
  }

  track(actor,player,distance,delta){
    this.counterMs=Math.max(0,this.counterMs-delta);
    this.redetectMs=Math.max(0,this.redetectMs-delta);
    this.routeRetryMs=Math.max(0,this.routeRetryMs-delta);
    if(actor.aggro)this.engage(actor);
    else if(!this.redetectMs&&distance<=actor.spec.detectionRange&&this.terrain.sees(actor.enemy,player))
      this.engage(actor,player);
    if(actor.aggro){
      actor.aggro.outsideMs=distance>SWAMP_AGGRO.releaseDistance?actor.aggro.outsideMs+delta:0;
      if(this.routeFailed)this.noRouteMs+=delta;
      const unreachable=this.noRouteMs>=SWAMP_AGGRO.noRouteAfterMs;
      if(unreachable||actor.aggro.outsideMs>=SWAMP_AGGRO.releaseAfterMs){
        this.disengage(actor,unreachable);
        return null;
      }
    }
    if(this.wasDisengaged){
      if(actor.enemy.hp<actor.spec.maxHp){
        this.regenCarry+=actor.spec.maxHp*SWAMP_AGGRO.regenPerSecond*delta/1000;
        const healed=Math.floor(this.regenCarry+1e-9);
        this.regenCarry-=healed;
        actor.enemy.hp=Math.min(actor.spec.maxHp,actor.enemy.hp+healed);
      }
      if(this.state==='returning'&&dist(actor.enemy,this.home)<=1){
        this.state='idle';
        this.pauseRoaming();
      }
    }
    if(this.state==='idle')this.roamPauseMs=Math.max(0,this.roamPauseMs-delta);
    return actor.aggro;
  }

  landing({enemy},point){
    return this.terrain.move(enemy,point,false);
  }

  steer(enemy,target,delta=0){
    if(delta)this.routeRetryMs=Math.max(0,this.routeRetryMs-delta);
    const terrain=this.terrain;
    const direct=terrain.clear(target)?terrain.canReach(enemy,target):terrain.sees(enemy,target);
    if(direct){
      this.clearRoute();
      return null;
    }
    const moved=(!this.routeGoal||dist(target,this.routeGoal)>=SWAMP_ROUTING.cellSize);
    if(!this.routeRetryMs&&(moved||!this.waypoints?.length||!terrain.canReach(enemy,this.waypoints[0]))){
      this.waypoints=terrain.findRoute(enemy,target);
      this.routeGoal={x:target.x,y:target.y};
      this.routeRetryMs=SWAMP_ROUTING.retryMs;
    }
    while(this.waypoints?.length&&dist(enemy,this.waypoints[0])<=2)this.waypoints.shift();
    const waypoint=this.waypoints?.[0];
    this.routeFailed=!waypoint||!terrain.canReach(enemy,waypoint);
    if(!this.routeFailed)this.noRouteMs=0;
    return this.routeFailed?null:waypoint;
  }

  pauseRoaming(){
    const {minPauseMs,maxPauseMs}=this.roaming;
    this.roamPauseMs=minPauseMs+this.random()*(maxPauseMs-minPauseMs);
    this.roamGoal=null;
    this.roamCrawl=null;
  }

  roamTarget(enemy){
    const {enabled,minRadius,maxRadius,attempts}=this.roaming;
    if(!enabled||this.roamPauseMs>0)return null;
    if(this.roamGoal){
      if(dist(enemy,this.roamGoal)>3)return this.roamGoal;
      this.pauseRoaming();
      return null;
    }
    // Bounded samples only at the end of a pause. A swept straight segment
    // keeps the full walk inside the home radius and doesn't require A*.
    for(let i=0;i<attempts;i++){
      const angle=this.random()*Math.PI*2;
      const radius=minRadius+this.random()*(maxRadius-minRadius);
      const point={x:this.home.x+Math.cos(angle)*radius,y:this.home.y+Math.sin(angle)*radius};
      if(dist(enemy,point)<24||!this.terrain.canReach(enemy,point))continue;
      this.roamGoal=point;
      return point;
    }
    this.pauseRoaming();
    return null;
  }

  chase(actor,player,delta){
    const {enemy,spec,aggro,kind}=actor;
    const visible=aggro&&this.terrain.sees(enemy,player);
    const frog=kind==='frog';
    const roaming=this.state==='idle';
    const target=aggro?(frog&&visible?frogChaseTarget(enemy,player,spec.preferredRange):player)
      :roaming?this.roamTarget(enemy):this.home;
    if(!target){
      this.clearRoute();
      actor.phase='idle';
      return;
    }
    const waypoint=roaming?null:this.steer(enemy,target);
    if(kind==='snake'){
      this.crawl(actor,delta,waypoint??target,Boolean(waypoint));
      return;
    }
    const step=aggro
      ?(frog?spec.hopDistance:waypoint?spec.step:slimeChaseStep(spec,dist(enemy,player)))
      :Math.min(spec.hopDistance??spec.step,dist(enemy,waypoint??target));
    if(step<=0){
      actor.phase='idle';
      return;
    }
    const destination=waypoint??target;
    const next=hopDestination(this.terrain,enemy,toward(enemy,destination,step),destination);
    if(!next){
      if(roaming)this.pauseRoaming();
      actor.phase='blocked';
      return;
    }
    actor.phase='chase';
    // The Slime's atlas uses its original orientation in the Sandbox.
    if(frog&&Math.abs(next.x-enemy.x)>3)enemy.facing=Math.sign(next.x-enemy.x);
    actor.hop={from:{x:enemy.x,y:enemy.y},to:next};
    actor.elapsed=0;
  }

  crawl(actor,delta,target,detour){
    const {enemy,spec,aggro}=actor;
    const remaining=dist(enemy,target)-(aggro&&!detour?SWAMP_MOB_TERRAIN.snake.stopDistance:0);
    if(remaining<=0){actor.phase='idle';return;}
    const straight=toward(enemy,target,Math.min(remaining,spec.speed*delta/1000));
    // Give a roaming snake the same crawl near its target, then finish the
    // final few pixels directly where the combat crawl intentionally brakes.
    const roaming=Boolean(this.roamGoal);
    const steering=aggro&&!detour?actor:roaming&&remaining>35
      ?this.roamCrawl??={id:actor.id,spec,aggro:{},aiSample:this.random}:null;
    const crawl=steering?snakeCrawlStep(steering,enemy,target,delta,this.terrain.crawlSpace):null;
    let next=this.terrain.move(enemy,crawl?.point??straight);
    let facing=crawl?.facing??enemy.facing;
    if(crawl&&(dist(enemy,next)<0.01||dist(next,target)>=dist(enemy,target)||
      roaming&&dist(this.home,next)>this.roaming.maxRadius)){
      // A diagonal can point into a wall. Try the direct crawl for this step.
      next=this.terrain.move(enemy,straight);
      if(Math.abs(next.x-enemy.x)>0.2)facing=Math.sign(next.x-enemy.x);
    }else if(!crawl&&Math.abs(next.x-enemy.x)>0.2){
      facing=Math.sign(next.x-enemy.x);
    }
    if(dist(enemy,next)<0.01||dist(next,target)>=dist(enemy,target)){
      if(this.roamGoal)this.pauseRoaming();
      actor.phase='blocked';
      return;
    }
    actor.phase='chase';
    enemy.facing=facing;
    Object.assign(enemy,next);
    enemy.poseMs=snakeCrawlPose(enemy.poseMs,delta);
  }
}

export class SwampMob extends CombatEnemy {
  constructor(bout,spawn,terrain,index,{test=false,roaming=SWAMP_ROAMING,random=Math.random,onAggro}={}){
    const species=ENEMIES[spawn.kind];
    const overrides=spawn.detectionRange===undefined?spawn.combat:{...spawn.combat,detectionRange:spawn.detectionRange};
    const spec=overrides?{...species,...overrides}:species;
    super(bout,spawn.kind,index,{x:spawn.x,y:spawn.y},spec);
    this.footRadius=(SWAMP_MOB_TERRAIN[spawn.kind]??SWAMP_ENCOUNTER_TERRAIN[spawn.kind]).footRadius;
    this.spawnId=spawn.id;
    this.encounterId=spawn.encounterId;
    this.checkpoint=spawn.checkpoint;
    this.miniBoss=Boolean(spawn.miniBoss);
    this.test=test;
    this.terrain=terrain;
    this.navigation=new SwampNavigation(spawn,terrain,{roaming,random,onAggro});
  }
}

export class SwampAmbush {
  constructor(config){
    this.config=config;
    this.reset();
  }

  reset(feet){
    this.phase='hidden';
    this.elapsed=0;
    this.waitForExit=Boolean(feet&&this.contains(feet));
  }

  contains(feet){
    const zone=this.config.trigger;
    if(zone.shape==='rectangle')return Math.abs(feet.x-zone.x)<=zone.width/2&&Math.abs(feet.y-zone.y)<=zone.height/2;
    return dist(feet,zone)<=zone.radius;
  }

  beginWarning(){
    this.phase='warning';
    this.elapsed=0;
    return 'warning';
  }

  update(delta,player,canApproach,canLand=()=>true){
    if(this.phase==='hidden'){
      if(!this.contains(player)){
        this.waitForExit=false;
        return;
      }
      if(this.waitForExit||!canApproach())return;
      return this.beginWarning();
    }
    if(this.phase==='warning'){
      this.elapsed+=delta;
      if(this.elapsed<this.config.warningMs)return;
      if(this.config.emergeMs){
        this.phase='emerging';
        this.elapsed=0;
        return 'emerging';
      }
      this.phase='revealed';
      return 'spawn';
    }
    if(this.phase==='emerging'){
      this.elapsed+=delta;
      if(this.elapsed<this.config.emergeMs)return;
      const clear=canLand();
      if(!clear&&this.elapsed<this.config.emergeMs+SWAMP_EMERGENCE.landingWaitMs)return;
      this.phase='revealed';
      return clear?'spawn':'cancel';
    }
  }
}
