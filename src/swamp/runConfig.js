import { PLAYER_MAX_HP } from '../boss/config.js';
import { SKILL_CATEGORIES } from '../combat/skillCatalogSchema.js';

export { SLOT_KEYS } from '../combat/skillCatalogSchema.js';
export const SWAMP_MINI_BOSS = {
  id:'swamp-mini-boss',
  name:'Mushroom Boss',
  kind:'mushroom',
  spawn:{x:340,y:375},
  activationRadius:145,
  arena:{left:90,right:650,top:175,bottom:610},
  checkpointDrop:{x:350,y:500},
};

export const SWAMP_RUN = {
  storageKey:'daa.swamp-v3.run.v1',
  maxHp:PLAYER_MAX_HP,
  checkpointHeal:PLAYER_MAX_HP,
  pickupRange:32,
  requireUnusedMiddleCategory:true,
  categories:{
    starter:{label:SKILL_CATEGORIES.damage,category:'damage'},
    offense:{label:SKILL_CATEGORIES.damage,category:'damage'},
    survival:{label:SKILL_CATEGORIES.survival,category:'survival'},
    ultimate:{label:SKILL_CATEGORIES.ultimate,category:'ultimate'},
  },
  checkpoints:[
    {id:'entrance',label:'Swamp entrance',slot:0,categories:['starter'],spawn:'default'},
    {id:'southeast',label:'Southeast marsh',slot:1,categories:['offense','survival'],elite:'southeast-marsh',
      drop:{x:1650,y:1310}},
    {id:'north',label:'North trail',slot:2,categories:['offense','survival'],elite:'north-trail',excludeCategoryFromSlot:1,
      drop:{x:1180,y:338}},
    {id:'inner-ruins',label:'Inner ruins',slot:3,categories:['ultimate'],elite:SWAMP_MINI_BOSS.id,
      drop:SWAMP_MINI_BOSS.checkpointDrop},
  ],
};
