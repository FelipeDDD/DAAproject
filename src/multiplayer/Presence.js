export const SYNC_INTERVAL_MS = 125; // Maximum 8 updates/second, independent of FPS.
export const HEARTBEAT_MS = 1000;
export const STALE_MS = 15_000;

export class Presence {
  constructor(client, api, identity, status = () => {}) {
    Object.assign(this, { client, api, identity, status });
    this.busy = false;
  }

  enter(room, snapshot, receive) {
    this.leave();
    const active = { room, snapshot, receive, rows: [], sentAt: 0, previous: '' };
    this.active = active;
    this.status('Conectando…');
    this.unsubscribe = this.client.onUpdate(this.api.players.inRoom, { room }, rows => {
      if (this.active !== active) return;
      active.rows = rows;
      this.deliver(active);
    }, error => this.fail(error));
    this.timer = setInterval(() => { this.deliver(active); this.send(); }, SYNC_INTERVAL_MS);
    this.send();
  }

  deliver(active) {
    if (this.active !== active) return;
    active.receive(active.rows.filter(p => p.playerId !== this.identity.playerId &&
      p.room === active.room && Date.now() - p.lastSeen < STALE_MS));
  }

  async send() {
    const active = this.active;
    if (!active || this.busy) return;
    const state = { ...this.identity, room: active.room, ...active.snapshot() };
    const serialized = JSON.stringify(state), now = Date.now();
    if (serialized === active.previous && now - active.sentAt < HEARTBEAT_MS) return;
    this.busy = true;
    try {
      await this.client.mutation(this.api.players.update, state);
      active.previous = serialized;
      active.sentAt = now;
      if (this.active === active) this.status('Online');
    } catch (error) { this.fail(error); }
    finally { this.busy = false; }
  }

  fail(error) {
    if(String(error).includes('CHARACTER_SESSION_LOST')) {
      this.leave();
      if(typeof window!=='undefined')window.dispatchEvent(new Event('character-session-lost'));
    }
    this.status('Multiplayer unavailable');
    if (!this.reportedError) console.warn('Convex:', error);
    this.reportedError = true;
  }

  leave() {
    clearInterval(this.timer);
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.active?.receive([]);
    this.active = null;
  }

  close() { this.leave(); return this.client.close(); }
}
