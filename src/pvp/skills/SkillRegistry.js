import { SKILL_DEFAULTS,PVP_MODE_SKILLS } from './config.js';
import { FireZoneSkill } from './skills/FireZoneSkill.js';

export class SkillRegistry {
  constructor(definitions=[FireZoneSkill],defaults=SKILL_DEFAULTS,modes=PVP_MODE_SKILLS){
    this.definitions=new Map();this.defaults=structuredClone(defaults);this.modes=structuredClone(modes);
    for(const definition of definitions){
      if(this.definitions.has(definition.id))throw new Error(`Duplicate skill: ${definition.id}`);
      this.definitions.set(definition.id,definition);
    }
    for(const mode of Object.keys(this.modes))for(const id of this.enabled(mode))this.resolve(mode,id);
  }
  enabled(mode){return [...(this.modes[mode]?.skills??[])];}
  resolve(mode,id){
    if(!this.enabled(mode).includes(id))return null;
    const definition=this.definitions.get(id),defaults=this.defaults[id];
    if(!definition||!defaults)throw new Error(`Unregistered skill: ${id}`);
    const override=this.modes[mode].skillOverrides?.[id]??{};
    if(Object.keys(override).some(key=>!Object.hasOwn(defaults,key)))throw new Error(`Unknown skill override: ${id}`);
    const config={...defaults,...override};
    if(!definition.validConfig(config))throw new Error(`Invalid skill configuration: ${id}`);
    return {definition,config:Object.freeze(config)};
  }
}
