import { isPlayerActive, ownsCharacterSession, TERMINAL_LEASE_MS } from '../src/multiplayer/presencePolicy.js';

export async function requireActivePlayer(ctx, characterId, sessionId, room) {
  const player = await ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
  if (!ownsCharacterSession(player, characterId, sessionId)
    || (room !== undefined && player.room !== room) || !isPlayerActive(player)) {
    throw new Error(player?.presenceMode === 'terminal' ? 'CHARACTER_SESSION_LOST' : 'Invalid session or room.');
  }
  return player;
}

export async function requireAuthenticatedPlayer(ctx,characterId,sessionId,room){
  const player=await requireActivePlayer(ctx,characterId,sessionId,room);
  if(!player.profileId)throw new Error('PROFILE_REQUIRED');
  return player;
}

// Reuse the authenticated row; no extra player query or client request.
export async function refreshTerminalLease(ctx, player, characterId, sessionId, now = Date.now()) {
  if (!ownsCharacterSession(player, characterId, sessionId) || !isPlayerActive(player, now))
    throw new Error('CHARACTER_SESSION_LOST');
  if (player.presenceMode !== 'terminal') return null;
  const terminalLeaseExpiresAt = now + TERMINAL_LEASE_MS;
  if (player.terminalLeaseExpiresAt !== terminalLeaseExpiresAt)
    await ctx.db.patch(player._id, { terminalLeaseExpiresAt });
  return { terminalLeaseExpiresAt, serverNow: now };
}
