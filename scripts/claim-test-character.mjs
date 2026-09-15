import { anyApi } from 'convex/server';
import { characterById } from '../src/characters.js';
import { isPresenceActive } from '../src/multiplayer/presencePolicy.js';
export async function claimTestCharacter(client){
  const rows=await client.query(anyApi.players.availability,{}),sessionId=crypto.randomUUID();
  for(const r of rows.filter(r=>!isPresenceActive(r.lastSeen))){
    const result=await client.mutation(anyApi.players.claim,{characterId:r.characterId,sessionId});
    if(result.ok)return {playerId:r.characterId,characterId:r.characterId,sessionId,name:characterById(r.characterId).name};
  }
  throw new Error('No free character for integration test. Close a game session first.');
}
export async function releaseTestCharacter(client,identity){
  if(identity)await client.mutation(anyApi.players.release,{characterId:identity.characterId,sessionId:identity.sessionId});
}
