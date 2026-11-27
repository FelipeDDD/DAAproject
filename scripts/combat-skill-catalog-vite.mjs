import { SKILL_CATALOG_ROUTE,validateSkillCatalog } from '../src/combat/skillCatalogSchema.js';
import { localJsonPlugin } from './local-json-vite.mjs';

export function combatSkillCatalogPlugin(){
  return localJsonPlugin({name:'local-combat-skill-catalog',route:SKILL_CATALOG_ROUTE,
    file:['src','combat','skillCatalog.json'],tokenHeader:'x-combat-skill-catalog-token',validate:validateSkillCatalog});
}
