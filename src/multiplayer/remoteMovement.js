import { ADAPTIVE_MOVEMENT, ADAPTIVE_CRUISE_INTERVAL_MS, PRESENCE_SYNC_INTERVAL_MS } from './presencePolicy.js';

// Client rendering delay follows the send interval; it can be tuned independently.
export const REMOTE_INTERPOLATION_DELAY_MS = ADAPTIVE_MOVEMENT ? ADAPTIVE_CRUISE_INTERVAL_MS : PRESENCE_SYNC_INTERVAL_MS;
export const REMOTE_TELEPORT_THRESHOLD_PX = 160;
export const REMOTE_MAX_SNAPSHOTS = 32;

export class RemoteSnapshotBuffer {
  constructor({ delayMs = REMOTE_INTERPOLATION_DELAY_MS,
    teleportThreshold = REMOTE_TELEPORT_THRESHOLD_PX, maxSnapshots = REMOTE_MAX_SNAPSHOTS } = {}) {
    Object.assign(this, { delayMs, teleportThreshold, maxSnapshots });
    this.snapshots = [];
    this.lastSampleAt = -Infinity;
  }

  push(row, arrivalAt) {
    if (!Number.isFinite(row.x) || !Number.isFinite(row.y) || !Number.isFinite(arrivalAt))
      return { accepted: false, teleport: false };
    const sampleAt = Number.isFinite(row.lastSeen) ? row.lastSeen : null;
    if (sampleAt !== null && sampleAt < this.lastSampleAt)
      return { accepted: false, teleport: false };
    if (sampleAt !== null) this.lastSampleAt = sampleAt;
    // Heartbeats, other players' writes and Presence's cached deliveries are not
    // new movement samples. Server timestamps are only used to reject stale rows;
    // rendering uses a monotonic local clock, without assuming synchronized clocks.
    const signature = JSON.stringify([row.x, row.y, row.direction,
      row.equippedSkin, row.activeCharacterItem, row.moving, row.velocityX, row.velocityY]);
    if (signature === this.lastSignature) return { accepted: false, teleport: false };
    const previous = this.latest;
    const distance = previous ? Math.hypot(row.x - previous.x, row.y - previous.y) : 0;
    const teleport = distance > this.teleportThreshold;
    const snapshot = {
      x: row.x, y: row.y, direction: row.direction || 'down',
      equippedSkin: row.equippedSkin, activeCharacterItem: row.activeCharacterItem,
      velocityX: row.velocityX, velocityY: row.velocityY,
      moving: typeof row.moving === 'boolean' ? row.moving : distance > 0,
      explicitMoving: typeof row.moving === 'boolean',
      sampleAt, arrivalAt: previous && !teleport ? Math.max(arrivalAt, previous.arrivalAt + .001) : arrivalAt,
    };
    if (teleport) this.snapshots.length = 0;
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) this.snapshots.shift();
    this.latest = snapshot;
    this.lastSignature = signature;
    return { accepted: true, teleport };
  }

  sample(now) {
    if (!this.snapshots.length) return null;
    const renderAt = now - this.delayMs;
    while (this.snapshots.length > 1 && this.snapshots[1].arrivalAt <= renderAt)
      this.snapshots.shift();
    const [before, after] = this.snapshots;
    // Startup and underrun hold a known position; never extrapolate or keep walking.
    if (!after || renderAt < before.arrivalAt) return { ...before, moving: false };
    const fraction = (renderAt - before.arrivalAt) / (after.arrivalAt - before.arrivalAt);
    return {
      ...before,
      x: before.x + (after.x - before.x) * fraction,
      y: before.y + (after.y - before.y) * fraction,
      // Walking matches the segment actually being rendered. Facing and skin/item
      // animations switch when the delayed timeline reaches their sample.
      moving: (!before.explicitMoving || before.moving) && Math.hypot(after.x - before.x, after.y - before.y) > .001,
    };
  }
}
