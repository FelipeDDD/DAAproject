import { isPlayerActive, ownsCharacterSession, ownsPlayerSession, TERMINAL_LEASE_MS } from '../src/multiplayer/presencePolicy.js';

// Explicit live IDs never fall back. Omitting the ID supports only pre-migration rows.
export function findSessionPlayer(ctx, characterId, playerId) {
  return playerId !== undefined
    ? ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', playerId)).unique()
    : ctx.db.query('players').withIndex('by_player', q => q.eq('playerId', characterId)).unique();
}

// Legacy slot lookup is retained for older callers; new Study/Challenge calls use playerId.
export async function findCharacterSessionPlayer(ctx, characterId, sessionId) {
  const rows=await ctx.db.query('players').withIndex('by_character',q=>q.eq('characterId',characterId)).collect();
  return rows.find(player=>player.sessionId===sessionId)??null;
}

export async function requireActivePlayer(ctx, characterId, sessionId, room) {
  const player = await findCharacterSessionPlayer(ctx, characterId, sessionId);
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

export async function requireAuthenticatedLivePlayer(ctx,playerId,sessionId,room){
  const player=await findSessionPlayer(ctx,undefined,playerId);
  if(!ownsPlayerSession(player,playerId,sessionId)
    ||(room!==undefined&&player.room!==room)||!isPlayerActive(player))
    throw new Error('CHARACTER_SESSION_LOST');
  if(!player.profileId)throw new Error('PROFILE_REQUIRED');
  return player;
}

// Reuse the authenticated row; no extra player query or client request.
export async function refreshTerminalLease(ctx, player, playerId, sessionId, now = Date.now()) {
  if (!ownsPlayerSession(player, playerId, sessionId) || !isPlayerActive(player, now))
    throw new Error('CHARACTER_SESSION_LOST');
  if (player.presenceMode !== 'terminal') return null;
  const terminalLeaseExpiresAt = now + TERMINAL_LEASE_MS;
  if (player.terminalLeaseExpiresAt !== terminalLeaseExpiresAt)
    await ctx.db.patch(player._id, { terminalLeaseExpiresAt });
  return { terminalLeaseExpiresAt, serverNow: now };
}
