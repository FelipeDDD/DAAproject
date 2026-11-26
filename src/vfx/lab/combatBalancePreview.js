import { configureCombatSkills } from './combatSkills.js';
import { FROG } from './frogEnemy.js';
import { SNAKE } from './snakeEnemy.js';
import { configureSlimeBalance } from './slimeVariants.js';
import { normalizeBalance } from '../../combat/balanceSchema.js';

export function applyCombatBalance(balance){
  balance=normalizeBalance(balance);
  configureCombatSkills(balance.michael);
  const frog=structuredClone(balance.frog),snake=structuredClone(balance.snake);
  Object.assign(FROG,frog,{leap:{...FROG.leap,...frog.leap},longLeap:{...FROG.longLeap,...frog.longLeap}});
  Object.assign(SNAKE,snake,{bite:{...SNAKE.bite,...snake.bite}});
  configureSlimeBalance(balance.slimes);
}
