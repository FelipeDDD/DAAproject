import { ConvexClient,ConvexHttpClient } from 'convex/browser';
import { anyApi } from 'convex/server';
import { WebSocket } from 'ws';
import { localTarget } from './convex-db-transfer.mjs';

// Never reads a cloud credential or exposes this admin key to a browser.
export async function createLocalPvpBridge(){
  const {url,config}=await localTarget();
  const http=new ConvexHttpClient(url,{logger:false,
    fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(5000)})});http.setAdminAuth(config.adminKey);
  const reactive=new ConvexClient(url,{webSocketConstructor:WebSocket,logger:false});reactive.setAdminAuth(config.adminKey);
  return {
    async authenticate({playerId,sessionId,matchId,round}){
      const state=await http.query(anyApi.pvpMatches.current,{playerId,sessionId,matchId});
      if(!state||!['countdown','active'].includes(state.state)||(state.round??0)!==round
        ||!state.participants.some(p=>p.playerId===playerId))throw new Error('Invalid PvP session/round.');
      return state;
    },
    subscribe(matchId,onState,onError){return reactive.onUpdate(anyApi.pvpMatches.realtimeState,{matchId},onState,onError);},
    commit(args){return http.mutation(anyApi.pvpMatches.applyRealtimeDamage,args);},
    close(){return reactive.close();},
  };
}
