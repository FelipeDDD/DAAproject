import { configureCombatSkills } from './combatSkills.js';
import { FROG } from './frogEnemy.js';
import { SNAKE } from './snakeEnemy.js';
import { SLIMES, SLIME_SPECIAL } from './slimeVariants.js';

export function applyCombatBalance(balance){
  configureCombatSkills(balance.michael);
  const frog=structuredClone(balance.frog),snake=structuredClone(balance.snake);
  Object.assign(FROG,frog,{leap:{...FROG.leap,...frog.leap},longLeap:{...FROG.longLeap,...frog.longLeap}});
  Object.assign(SNAKE,snake,{bite:{...SNAKE.bite,...snake.bite}});
  Object.assign(SLIME_SPECIAL,structuredClone(balance.slimes.special));
  for(const [kind,settings] of Object.entries(balance.slimes.variants)){
    Object.assign(SLIMES[kind].special,settings);
  }
}
