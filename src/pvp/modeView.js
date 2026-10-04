import { PayloadView } from './payload/PayloadView.js';
const factories={tdm:()=>null,payload:scene=>new PayloadView(scene)};
export function createModeView(mode='tdm',scene){
  if(!Object.hasOwn(factories,mode))throw new Error('Unsupported PvP mode.');return factories[mode](scene);
}
