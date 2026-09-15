export const PRESENCE_SYNC_INTERVAL_MS = 125;
export const PRESENCE_HEARTBEAT_MS = 10_000;
export const PRESENCE_TIMEOUT_MS = 60_000;

export function isPresenceActive(lastSeen, now = Date.now()) {
  return Number.isFinite(lastSeen) && now - lastSeen < PRESENCE_TIMEOUT_MS;
}

export function ownsCharacterSession(player, characterId, sessionId) {
  return Boolean(player && player.playerId === characterId
    && player.characterId === characterId && player.sessionId === sessionId);
}
