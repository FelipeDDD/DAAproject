const ACTIVE_PLAYER_MS = 15_000;

export async function requireActivePlayer(ctx, characterId, sessionId, room) {
  const player = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
  if (!player || player.characterId !== characterId || player.sessionId !== sessionId
    || (room !== undefined && player.room !== room) || Date.now() - player.lastSeen >= ACTIVE_PLAYER_MS) {
    throw new Error('Invalid session or room.');
  }
  return player;
}
