// Combat fields belong to the relay. Identity/team/session metadata belongs to Convex.
export const fighterFields=['hp','life','kills','deaths','respawnAt','lastShot','lastHitAt'];
export const combatFields=['state','scores','startedAt','endsAt','endedAt','winner','reason'];
const pick=(value,keys)=>Object.fromEntries(keys.map(key=>[key,value[key]??null]));
export function combatSnapshot(match){
  return {...pick(match,combatFields),...(match.payload?{payload:match.payload}:{}),players:match.participants.map(p=>({playerId:p.playerId,...pick(p,fighterFields)}))};
}
export function mergeCombatSnapshot(metadata,snapshot){
  return {...metadata,...pick(snapshot,combatFields),...(snapshot.payload?{payload:snapshot.payload}:{}),participants:metadata.participants.map(p=>{
    const fighter=snapshot.players.find(q=>q.playerId===p.playerId);
    return fighter?{...p,...pick(fighter,fighterFields)}:p;
  })};
}
