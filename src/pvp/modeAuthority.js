import { PayloadAuthority } from './payload/PayloadAuthority.js';
import { routeFromMap } from './payload/route.js';

const factories={tdm:()=>null,payload:(map,options)=>new PayloadAuthority(routeFromMap(map),options)};
export function createModeAuthority(mode='tdm',map,options){
  if(!Object.hasOwn(factories,mode))throw new Error('Unsupported PvP mode.');return factories[mode](map,options);
}
