import {
  isPlayerActive,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_POSITION_THRESHOLD_PX,
  PRESENCE_SYNC_INTERVAL_MS,
  PRESENCE_TIMEOUT_MS,
  TERMINAL_PRESENCE_HEARTBEAT_MS,
} from './presencePolicy.js';

export { PRESENCE_HEARTBEAT_MS, PRESENCE_POSITION_THRESHOLD_PX, PRESENCE_SYNC_INTERVAL_MS, PRESENCE_TIMEOUT_MS, TERMINAL_PRESENCE_HEARTBEAT_MS };

export class Presence {
  constructor(client, api, identity, status = () => {}) {
    Object.assign(this, { client, api, identity, status });
    this.busy = false;
    this.terminalMode = false;
  }

  get heartbeatIntervalMs() {
    return this.terminalMode ? TERMINAL_PRESENCE_HEARTBEAT_MS : PRESENCE_HEARTBEAT_MS;
  }

  setTerminalMode(enabled, now = Date.now()) {
    const nextMode = Boolean(enabled);
    if (this.terminalMode === nextMode) return false;
    this.terminalMode = nextMode;
    if (this.active) this.active.nextHeartbeatAt = now + this.heartbeatIntervalMs;
    return true;
  }

  async enterTerminal() {
    if(this.terminalLease)return this.terminalLease;
    if(this.terminalTransition)throw new Error('Terminal transition in progress');
    await this.pendingSend;
    await this.send();
    if(!this.active)throw new Error('CHARACTER_SESSION_LOST');
    this.terminalTransition=true;
    try{
      const {characterId,sessionId}=this.identity;
      const lease=await this.client.mutation(this.api.players.enterTerminal,{characterId,sessionId});
      this.terminalLease={...lease,clockOffset:Date.now()-lease.serverNow};
      this.setTerminalMode(true);
      this.suspendRoom();
      return lease;
    }catch(error){if(String(error).includes('CHARACTER_SESSION_LOST'))this.fail(error);throw error;}
    finally{this.terminalTransition=false;}
  }

  async exitTerminal() {
    if(!this.terminalLease){if(this.active?.roomPaused)await this.resumeRoom();return;}
    if(this.terminalTransition)throw new Error('Terminal transition in progress');
    this.terminalTransition=true;
    try{
      const {characterId,sessionId}=this.identity;
      const result=await this.client.mutation(this.api.players.exitTerminal,{characterId,sessionId});
      this.terminalLease=null;this.setTerminalMode(false);
      await this.resumeRoom();
      return result;
    }catch(error){if(String(error).includes('CHARACTER_SESSION_LOST'))this.fail(error);throw error;}
    finally{this.terminalTransition=false;}
  }

  enter(room, snapshot, receive) {
    this.leave();
    const active = { room, snapshot, receive, rows: [], sentAt: 0, nextHeartbeatAt: 0, previous: '' };
    this.active = active;
    this.status('Conectando…');
    void this.subscribeRoom(active).catch(()=>{});
    this.timer = setInterval(() => { this.deliver(active); this.send(); }, PRESENCE_SYNC_INTERVAL_MS);
    this.send();
  }

  subscribeRoom(active) {
    if(this.unsubscribe)return active.roomReady;
    const generation=active.roomGeneration=(active.roomGeneration??0)+1;
    active.roomPaused=false;
    active.roomReady=new Promise((resolve,reject)=>{
    active.finishRoom=resolve;
    this.unsubscribe = this.client.onUpdate(this.api.players.inRoom, { room:active.room }, rows => {
      if (this.active !== active||active.roomPaused||active.roomGeneration!==generation) return;
      active.rows = rows;
      const newestServerHeartbeat=Math.max(...rows.filter(row=>row.presenceMode!=='terminal').map(row=>row.lastSeen).filter(Number.isFinite));
      if(Number.isFinite(newestServerHeartbeat))active.serverClockOffset=Date.now()-newestServerHeartbeat;
      this.deliver(active);
      active.finishRoom=null;resolve(true);
    }, error => {
      if(this.active!==active||active.roomGeneration!==generation)return;
      active.roomPaused=true;this.unsubscribe?.();this.unsubscribe=null;
      active.finishRoom=null;reject(error);this.fail(error);
    });
    });
    return active.roomReady;
  }

  suspendRoom(){
    const active=this.active;
    if(!active||active.roomPaused)return;
    active.roomPaused=true;active.roomGeneration=(active.roomGeneration??0)+1;
    this.unsubscribe?.();this.unsubscribe=null;
    active.finishRoom?.(false);active.finishRoom=null;
    active.rows=[];active.receive([]);
  }

  async resumeRoom(){
    const active=this.active;
    if(!active)throw new Error('CHARACTER_SESSION_LOST');
    if(active.roomPaused)await this.subscribeRoom(active);
    if(this.active!==active)throw new Error('CHARACTER_SESSION_LOST');
  }

  deliver(active) {
    if (this.active !== active||active.roomPaused) return;
    const serverNow=Number.isFinite(active.serverClockOffset)
      ? Date.now()-active.serverClockOffset
      : Date.now();
    active.receive(active.rows.filter(p => p.playerId !== this.identity.playerId
      && p.room === active.room && isPlayerActive(p,serverNow)));
  }

  async send(now = Date.now()) {
    const active = this.active;
    if(this.terminalLease){
      if(now-this.terminalLease.clockOffset>=this.terminalLease.terminalLeaseExpiresAt)this.fail(new Error('CHARACTER_SESSION_LOST'));
      return;
    }
    if(this.terminalTransition)return;
    if (!active || this.busy || now < (active.retryAt ?? 0)) return;
    const snapshot=active.snapshot();
    const state = {
      playerId:this.identity.playerId,characterId:this.identity.characterId,
      name:this.identity.name,sessionId:this.identity.sessionId,room:active.room,...snapshot,
    };
    const serialized=JSON.stringify(state);
    const previousState=active.previousState;
    const moved=!previousState||Math.hypot(state.x-previousState.x,state.y-previousState.y)>=PRESENCE_POSITION_THRESHOLD_PX;
    const stateChanged=moved||JSON.stringify({...state,x:previousState.x,y:previousState.y})!==active.previous;
    const shouldUpdate = stateChanged && (!this.terminalMode || moved);
    const heartbeatDueAt = active.nextHeartbeatAt || active.sentAt + this.heartbeatIntervalMs;
    if (!shouldUpdate && now < heartbeatDueAt) return;
    this.busy = true;
    try {
      const request=shouldUpdate
        ? this.client.mutation(this.api.players.update,state)
        : this.client.mutation(this.api.players.heartbeat,{
        characterId: this.identity.characterId,
        sessionId: this.identity.sessionId,
      });
      this.pendingSend=request;
      await request;
      active.previous = serialized;
      active.previousState = state;
      active.sentAt = now;
      active.nextHeartbeatAt = now + this.heartbeatIntervalMs;
      active.retryAt = 0;
      if (this.active === active) this.status('Online');
    } catch (error) {
      if (this.active === active) {
        active.retryAt = Date.now() + this.heartbeatIntervalMs;
        this.fail(error);
      }
    }
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
    if(this.active){this.active.roomGeneration=(this.active.roomGeneration??0)+1;this.active.finishRoom?.(false);}
    this.terminalLease=null;
    this.terminalMode = false;
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
