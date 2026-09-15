import { isPresenceActive, ownsCharacterSession } from '../src/multiplayer/presencePolicy.js';

export async function requireActivePlayer(ctx, characterId, sessionId, room) {
  const player = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
  if (!ownsCharacterSession(player, characterId, sessionId)
    || (room !== undefined && player.room !== room) || !isPresenceActive(player.lastSeen)) {
    throw new Error('Invalid session or room.');
  }
  return player;
}
