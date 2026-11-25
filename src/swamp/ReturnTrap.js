export function returnTrapAxis(a,b){
  const length=Math.hypot(b.x-a.x,b.y-a.y);
  return {length,x:(b.x-a.x)/length,y:(b.y-a.y)/length};
}

export const gateLength=(config,gate)=>config['gate'+gate+'Length']??config.halfWidth*2;

// Planes are perpendicular to the A → B axis. Crossing their bounded
// segments requires continuous movement; standing in a gate never counts.
export class ReturnTrap {
  constructor(config){
    this.config=config;
    this.axis=returnTrapAxis(config.a,config.b);
    this.reset();
  }

  reset(){
    this.previous=null;
    this.phase='awaiting-a';
  }

  sample(point,{inCombat=false,canTrigger=()=>true}={}){
    if(this.phase==='triggered')return false;
    const from=this.previous;
    this.previous={x:point.x,y:point.y};
    if(!from)return false;
    const {a,maxStep,requireCombat}=this.config;
    const {x,y,length}=this.axis;
    if(!Number.isFinite(length)||!length||Math.hypot(point.x-from.x,point.y-from.y)>maxStep){
      this.phase='awaiting-a';
      return false;
    }
    const project=p=>(p.x-a.x)*x+(p.y-a.y)*y;
    const before=project(from),after=project(point);
    const within=(offset,gate)=>{
      const t=(offset-before)/(after-before);
      const cx=from.x+(point.x-from.x)*t,cy=from.y+(point.y-from.y)*t;
      return Math.abs((cy-a.y)*x-(cx-a.x)*y)<=gateLength(this.config,gate)/2;
    };
    if(before<0&&after>=0&&within(0,'A'))this.phase='awaiting-b';
    if(this.phase==='awaiting-b'&&before<length&&after>=length&&within(length,'B'))this.phase='armed';
    if(before>=0&&after<0){
      const trigger=this.phase==='armed'&&within(0,'A')&&(!requireCombat||inCombat)&&canTrigger();
      this.phase=trigger?'triggered':'awaiting-a';
      return trigger;
    }
    return false;
  }
}
