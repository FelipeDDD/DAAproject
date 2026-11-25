import { BALANCE_ROUTE, validateBalance } from '../src/combat/balanceSchema.js';
import { localJsonPlugin } from './local-json-vite.mjs';

export function combatBalancePlugin(){
  return localJsonPlugin({name:'local-combat-balance',route:BALANCE_ROUTE,
    file:['src','combat','balance.json'],tokenHeader:'x-combat-balance-token',validate:validateBalance});
}
