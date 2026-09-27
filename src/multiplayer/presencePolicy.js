export const ADAPTIVE_MOVEMENT = true;
export const ADAPTIVE_CRUISE_INTERVAL_MS = 300;
export const ADAPTIVE_VELOCITY_THRESHOLD_PX_S = 12;
export const PRESENCE_SYNC_INTERVAL_MS = 200;
export const PRESENCE_POSITION_THRESHOLD_PX = 2;
export const PRESENCE_HEARTBEAT_MS = 10_000;
export const TERMINAL_PRESENCE_HEARTBEAT_MS = 20_000;
export const PRESENCE_TIMEOUT_MS = 60_000;
export const TERMINAL_LEASE_MS = 10 * 60_000;
export const STATIONARY_IDLE_DWELL_MS = 20_000;
export const STATIONARY_LEASE_MS = 5 * 60_000;
export const STATIONARY_RENEWAL_MARGIN_MS = 60_000;
export const STATIONARY_RENEWAL_RETRY_MS = 30_000;
export const STATIONARY_RENEWAL_FINAL_MARGIN_MS = 5_000;

export function isPresenceActive(lastSeen, now = Date.now()) {
  return Number.isFinite(lastSeen) && now - lastSeen < PRESENCE_TIMEOUT_MS;
}

export function isPlayerActive(player, now = Date.now()) {
  if (!player) return false;
  if (player.presenceMode === 'stationary') {
    return Number.isFinite(player.stationaryLeaseExpiresAt) && now < player.stationaryLeaseExpiresAt;
  }
  if (player.presenceMode === 'terminal') {
    return Number.isFinite(player.terminalLeaseExpiresAt) && now < player.terminalLeaseExpiresAt;
  }
  return isPresenceActive(player.lastSeen, now);
}

export function ownsCharacterSession(player, characterId, sessionId) {
  return Boolean(player && player.playerId === characterId
    && player.characterId === characterId && player.sessionId === sessionId);
}
