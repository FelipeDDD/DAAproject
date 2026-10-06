const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(value);
export function validPickupSnapshot(rows){
  return Array.isArray(rows)&&rows.length<=64&&new Set(rows.map(row=>row?.id)).size===rows.length
    &&rows.every(row=>row!==null&&typeof row==='object'&&!Array.isArray(row)&&id(row.id)
      &&['health','buff'].includes(row.type)&&typeof row.available==='boolean'
      &&[row.x,row.y].every(value=>Number.isFinite(value)&&Math.abs(value)<=100_000)
      &&(row.respawnAt===null||Number.isFinite(row.respawnAt)&&row.respawnAt>=0&&row.respawnAt<=Number.MAX_SAFE_INTEGER)
      &&(!row.available||row.respawnAt===null)
      &&(row.type!=='buff'||!row.available&&row.respawnAt===null));
}
