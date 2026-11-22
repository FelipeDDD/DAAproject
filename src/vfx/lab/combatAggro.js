export const DEFAULT_AGGRO={detectionRange:220,leashRange:460,leashGraceMs:1800};

export function acquireAggro(actor){
  return actor.aggro??={outsideMs:0};
}

export function trackAggro(actor,distance,dt){
  const {spec}=actor;
  if(distance<=spec.detectionRange)acquireAggro(actor);
  const target=actor.aggro;
  if(!target)return null;
  target.outsideMs=distance>spec.leashRange?target.outsideMs+dt:0;
  if(target.outsideMs>=spec.leashGraceMs)actor.aggro=null;
  return actor.aggro;
}
