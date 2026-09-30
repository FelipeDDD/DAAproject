import { requireProfileSessionToken } from '../ProfileSessionClient.js';

export async function requestDirectorWorkstation(host,method,extra={}){
  const presence=host.scene.presence,generation=host.generation;
  const call=['status','recoveryStatus'].includes(method)?'query':'mutation';
  try{
    return await presence.client[call](presence.api.directorWorkstation[method],{
      token:requireProfileSessionToken(presence),
      playerId:presence.identity.playerId,sessionId:presence.identity.sessionId,...extra,
    });
  }catch(error){
    if(host.active&&host.generation===generation&&/CHARACTER_SESSION_LOST|SESSION_INVALID/.test(String(error))){
      host.close();presence.fail(new Error('CHARACTER_SESSION_LOST'));
    }
    throw error;
  }
}
