import {
  isPresenceActive,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_SYNC_INTERVAL_MS,
  PRESENCE_TIMEOUT_MS,
} from './presencePolicy.js';

export { PRESENCE_HEARTBEAT_MS, PRESENCE_SYNC_INTERVAL_MS, PRESENCE_TIMEOUT_MS };

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
      const newestServerHeartbeat=Math.max(...rows.map(row=>row.lastSeen).filter(Number.isFinite));
      if(Number.isFinite(newestServerHeartbeat))active.serverClockOffset=Date.now()-newestServerHeartbeat;
      this.deliver(active);
    }, error => this.fail(error));
    this.timer = setInterval(() => { this.deliver(active); this.send(); }, PRESENCE_SYNC_INTERVAL_MS);
    this.send();
  }

  deliver(active) {
    if (this.active !== active) return;
    const serverNow=Number.isFinite(active.serverClockOffset)
      ? Date.now()-active.serverClockOffset
      : Date.now();
    active.receive(active.rows.filter(p => p.playerId !== this.identity.playerId
      && p.room === active.room && isPresenceActive(p.lastSeen,serverNow)));
  }

  async send(now = Date.now()) {
    const active = this.active;
    if (!active || this.busy) return;
    const snapshot=active.snapshot();
    const state = {
      playerId:this.identity.playerId,characterId:this.identity.characterId,
      name:this.identity.name,sessionId:this.identity.sessionId,room:active.room,...snapshot,
    };
    const serialized = JSON.stringify(state);
    const stateChanged = serialized !== active.previous;
    if (!stateChanged && now - active.sentAt < PRESENCE_HEARTBEAT_MS) return;
    this.busy = true;
    try {
      const request=stateChanged
        ? this.client.mutation(this.api.players.update,state)
        : this.client.mutation(this.api.players.heartbeat,{
        characterId: this.identity.characterId,
        sessionId: this.identity.sessionId,
      });
      this.pendingSend=request;
      await request;
      active.previous = serialized;
      active.sentAt = now;
      if (this.active === active) this.status('Online');
    } catch (error) { this.fail(error); }
    finally { this.pendingSend=null;this.busy = false; }
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

  async release(){
    const identity=this.identity;
    this.leave();
    if(!identity?.characterId||!identity?.sessionId)return {released:false};
    try{await this.pendingSend;}catch{}
    const result=await this.client.mutation(this.api.players.release,{
      characterId:identity.characterId,sessionId:identity.sessionId,
    });
    if(this.identity===identity)this.identity=null;
    return result;
  }

  close() { this.leave(); return this.client.close(); }
}
