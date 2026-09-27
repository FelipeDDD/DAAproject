import { anyApi } from 'convex/server';
import { CHARACTERS } from '../src/characters.js';
import { isPlayerActive } from '../src/multiplayer/presencePolicy.js';
export async function claimTestCharacter(client){
  const {maxPlayers,players}=await client.query(anyApi.players.availability,{}),sessionId=crypto.randomUUID();
  if(players.filter(row=>isPlayerActive(row)).length>=maxPlayers)
    throw new Error('The local player capacity is full. Close a game session first.');
  const guestId=`guest-${crypto.randomUUID()}`;
  const character=CHARACTERS[0];
  const result=await client.mutation(anyApi.players.claimGuest,{guestId,characterBaseId:character.id,sessionId});
  if(result.ok)return {playerId:result.playerId,characterId:character.id,characterBaseId:character.id,sessionId,name:character.name};
  throw new Error(result.reason==='full'?'The local player capacity is full. Close a game session first.':'Could not claim a test player.');
}
export async function releaseTestCharacter(client,identity){
  if(identity)await client.mutation(anyApi.players.release,{playerId:identity.playerId,characterId:identity.characterId,sessionId:identity.sessionId});
}
