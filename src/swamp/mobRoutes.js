const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const DIRECTIONS=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

// Nodes and swept links are shared by mobs with the same foot radius and
// cached on demand. Every straight segment uses the actual Tiled geometry.
export function createMobRoutes(terrain,bounds,{cellSize,maxExpanded,maxRouteDistance}){
  const nodes=new Map();
  function node(col,row){
    const id=col+':'+row;
    if(nodes.has(id))return nodes.get(id);
    const x=bounds.left+col*cellSize,y=bounds.top+row*cellSize;
    if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom)return null;
    const point={id,col,row,x,y};
    const valid=terrain.clear(point)?point:null;
    nodes.set(id,valid);
    return valid;
  }
  function neighbors(from){
    return from.links??=DIRECTIONS.flatMap(([dx,dy])=>{
      const to=node(from.col+dx,from.row+dy);
      if(!to||!terrain.canReach(from,to))return [];
      return [{to,cost:cellSize*Math.hypot(dx,dy)}];
    });
  }
  function anchors(point,canJoin){
    const col=Math.round((point.x-bounds.left)/cellSize);
    const row=Math.round((point.y-bounds.top)/cellSize);
    const result=[];
    for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
      const candidate=node(col+dx,row+dy);
      const cost=candidate?distance(point,candidate):Infinity;
      if(cost<=cellSize*2&&canJoin(candidate))result.push({candidate,cost});
    }
    return result;
  }
  return (from,goal)=>{
    if(distance(from,goal)>maxRouteDistance)return null;
    const starts=anchors(from,p=>terrain.canReach(from,p));
    const ends=anchors(goal,p=>terrain.clear(goal)?terrain.canReach(p,goal):terrain.sees(p,goal));
    if(!starts.length||!ends.length)return null;
    const clearGoal=terrain.clear(goal);
    const goals=new Map(ends.map(({candidate,cost})=>[candidate,clearGoal?cost:0]));
    const heuristic=p=>Math.max(0,distance(p,goal)-(clearGoal?0:2*cellSize));
    const open=new Map();
    const best=new Map();
    for(const {candidate,cost} of starts){
      const state={point:candidate,cost,score:cost+heuristic(candidate),previous:null};
      best.set(candidate,cost);
      open.set(candidate,state);
    }
    for(let count=0;open.size&&count<maxExpanded;count++){
      let next;
      for(const state of open.values())if(!next||state.score<next.score)next=state;
      const {point,cost}=next;
      open.delete(point);
      if(cost+(goals.get(point)??Infinity)<=maxRouteDistance){
        const path=[];
        if(clearGoal)path.push(goal);
        for(let state=next;state;state=state.previous)path.push(state.point);
        return path.reverse();
      }
      for(const {to,cost:step} of neighbors(point)){
        const spent=cost+step,score=spent+heuristic(to);
        if(score>maxRouteDistance||spent>=(best.get(to)??Infinity))continue;
        best.set(to,spent);
        open.set(to,{point:to,cost:spent,score,previous:next});
      }
    }
    return null;
  };
}
