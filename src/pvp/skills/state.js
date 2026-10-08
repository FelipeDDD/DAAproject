const plain=p=>p!==null&&typeof p==='object'&&!Array.isArray(p);
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(s);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const time=n=>Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
export function validSkillUse(p){
  if(!plain(p)||!['playerId','sessionId','skillId'].every(k=>id(p[k]))
    ||!['round','life','castSeq'].every(k=>integer(p[k]))||p.castSeq<=0)return false;
  const keys=Object.keys(p);
  if(keys.length===6)return true;
  return keys.length===7&&Object.hasOwn(p,'aim')&&plain(p.aim)
    &&Object.keys(p.aim).length===2&&Number.isFinite(p.aim.x)&&Number.isFinite(p.aim.y)
    &&Math.abs(p.aim.x)<=100300&&Math.abs(p.aim.y)<=100300;
}
// Generic envelope; a skill can evolve its presentation data without touching
// combat snapshots persisted in Convex. Bound wire size and world coordinates.
export function validSkillSnapshot(p,round){
  return plain(p)&&Array.isArray(p.enabled)&&p.enabled.length<=8&&p.enabled.every(id)
    &&new Set(p.enabled).size===p.enabled.length
    &&Array.isArray(p.cooldowns)&&p.cooldowns.length<=64
    &&p.cooldowns.every(row=>plain(row)&&id(row.playerId)&&p.enabled.includes(row.skillId)&&time(row.readyAt))
    &&Array.isArray(p.instances)&&p.instances.length<=16&&new Set(p.instances.map(i=>i?.id)).size===p.instances.length
    &&p.instances.every(i=>plain(i)&&id(i.id)&&p.enabled.includes(i.skillId)&&i.round===round&&id(i.ownerId)
      &&integer(i.ownerLife)&&['A','B'].includes(i.team)&&validSkillViewData(i));
}
function validSkillViewData(i){
  // Add the next skill's wire shape here; no gameplay implementation imported.
  if(i.skillId!=='fire-zone')return false;
  return [i.x,i.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=100300)
    &&Number.isFinite(i.radius)&&i.radius>0&&i.radius<=500&&['telegraph','active'].includes(i.phase)
    &&time(i.activeAt)&&time(i.endsAt)&&i.endsAt>i.activeAt;
}
