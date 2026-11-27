export const SKILL_CATALOG_ROUTE='/__combat-skill-catalog';
export const SKILL_IDS=['cleaver','lash','drain','flurry','fireball','lance','meteor','fire-ring','tesla','healing-parry'];
export const SKILL_CATEGORIES={damage:'Damage',survival:'Survival',ultimate:'Ultimate'};
export const SLOT_KEYS=['LMB','Q','E','R'];
export const canEquip=(catalog,id,slot)=>Boolean(catalog[id]?.slots.includes(SLOT_KEYS[slot]));

export function validateSkillCatalog(data){
  if(!data||typeof data!=='object'||Object.keys(data).length!==SKILL_IDS.length||
    !SKILL_IDS.every(id=>Object.hasOwn(data,id)))return 'The catalog must contain all registered skill IDs.';
  for(const id of SKILL_IDS){
    const entry=data[id];
    if(!entry||Object.keys(entry).length!==2||typeof entry.category!=='string'||!Object.hasOwn(SKILL_CATEGORIES,entry.category)||
      !Object.hasOwn(entry,'slots')||!Array.isArray(entry.slots)||!entry.slots.length||
      new Set(entry.slots).size!==entry.slots.length||!entry.slots.every(slot=>SLOT_KEYS.includes(slot))){
      return id+' needs a valid category and at least one distinct allowed slot.';
    }
  }
  return '';
}
