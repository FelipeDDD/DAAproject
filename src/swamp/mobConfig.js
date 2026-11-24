export const SWAMP_RESPAWN_DELAY_MS = 750;

export const SWAMP_AGGRO = {
  releaseDistance:500,
  releaseAfterMs:2000,
  regenPerSecond:0.03,
  counterCooldownMs:12000,
  noRouteAfterMs:4500,
  noRouteRedetectMs:1000,
};

export const SWAMP_ROUTING = {
  cellSize:24,
  retryMs:850,
  maxRouteDistance:1250,
  maxExpanded:550,
};

export const SWAMP_ROAMING={
  enabled:true,minRadius:30,maxRadius:65,minPauseMs:1100,maxPauseMs:2700,attempts:6,
};

export const SWAMP_PACK_AGGRO={enabled:true,radius:120};

export const SWAMP_EXPERIMENTAL_GROUPS = {enabled:true};

function encounter(id,kind,x,y,companionX,companionY,checkpoint=null){
  return {
    id,enabled:true,difficulty:['normal','hard'],activation:'on-reset',checkpoint,
    members:[{id,kind,x,y,encounterId:id,checkpoint},
      {id:id+'-companion',kind:'slime',x:companionX,y:companionY,encounterId:id,experimental:true}],
  };
}

export const SWAMP_AMBUSH = {
  id:'east-bush',enabled:true,difficulty:['normal','hard'],activation:'proximity',checkpoint:null,
  trigger:{x:1665, y:1172, radius:76},
  bush:{x:1783, y:1208},
  defaultVariant:'snake',
  returnTrap:{
    a:{id:'east-return-a',label:'Return Trap · A',marker:true,x:1665,y:1172},
    b:{id:'east-return-b',label:'Return Trap · B',marker:true,x:1665,y:992},
    halfWidth:28,minSeparation:64,maxStep:48,requireCombat:false,reactionMs:650,
  },
  variants:{
    snake:{label:'Snake · escalating leaves',type:'immediate',kind:'snake',effect:'escalating'},
    frog:{label:'Frog · soft leaves',type:'immediate',kind:'frog',effect:'soft'},
    alarm:{label:'False alarm · foliage movement',type:'false-alarm',kind:null,effect:'foliage'},
    'return-trap':{label:'Return Trap · Snake',type:'return-trap',kind:'snake',effect:'escalating'},
  },
  spawn:{id:'east-bush',kind:'snake',x:1748,y:1180},
  warningMs:760,
};

// World coordinates mark the ground anchor. Difficulty is data only for now.
export const SWAMP_ENCOUNTERS = [
  encounter('west-curve','snake',340,1370,388,1418),
  encounter('west-marsh','frog',347,873,299,825),
  encounter('south-trail','slime',750,1470,814,1470),
  encounter('southeast-marsh','frog',1650,1310,1698,1358,'southeast'),
  encounter('north-trail','slime',1180,338,1244,338,'north'),
  SWAMP_AMBUSH,
];

export const SWAMP_SPAWNS=SWAMP_ENCOUNTERS.filter(entry=>entry.activation==='on-reset')
  .map(entry=>entry.members[0]);

export function swampEncounterSpawns(defeated=new Set(),groups=SWAMP_EXPERIMENTAL_GROUPS,difficulty='normal'){
  const entries=SWAMP_ENCOUNTERS.filter(entry=>entry.enabled&&entry.activation==='on-reset'&&
    entry.difficulty.includes(difficulty)&&!defeated.has(entry.id));
  const originals=entries.flatMap(entry=>entry.members.filter(member=>!member.experimental));
  const companions=groups.enabled?entries.flatMap(entry=>entry.members.filter(member=>member.experimental)):[];
  return [...originals,...companions];
}

// Navigation footprints. Attack and hurtbox definitions come from ENEMIES.
export const SWAMP_MOB_TERRAIN = {
  snake:{footRadius:15,stopDistance:32},
  frog:{footRadius:12},
  slime:{footRadius:13},
};
