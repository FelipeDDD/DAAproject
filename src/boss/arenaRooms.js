// Map identity stays `arena`; only its multiplayer room is instanced.
export const ARENA_COOP_CAPACITY=4;
export const ARENA_LOBBY_LIFETIME_MS=30*60_000;
export const soloArenaRoom=playerId=>`arena:solo:${playerId}`;
export const coopArenaRoom=lobbyId=>`arena:coop:${lobbyId}`;
export const arenaLobbyId=room=>room?.startsWith('arena:coop:')?room.slice('arena:coop:'.length):null;
export const roomMapKey=room=>room?.startsWith('arena:')?'arena':room?.startsWith('pvp-arena-test:')?'pvp-arena-test':room;
export function arenaPresenceRoom(identity,destination={}){
  if(destination.arenaMode==='coop'){
    if(!destination.arenaLobbyId)throw new Error('Missing co-op lobby.');
    return coopArenaRoom(destination.arenaLobbyId);
  }
  if(!identity?.playerId)throw new Error('Select a character before entering the arena.');
  return soloArenaRoom(identity.playerId);
}
