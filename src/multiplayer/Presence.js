import {
  ADAPTIVE_MOVEMENT, ADAPTIVE_CRUISE_INTERVAL_MS, ADAPTIVE_VELOCITY_THRESHOLD_PX_S,
  isPlayerActive,
  PRESENCE_HEARTBEAT_MS,
  PRESENCE_POSITION_THRESHOLD_PX,
  PRESENCE_SYNC_INTERVAL_MS,
  PRESENCE_TIMEOUT_MS,
  TERMINAL_PRESENCE_HEARTBEAT_MS,
  STATIONARY_IDLE_DWELL_MS,
  STATIONARY_RENEWAL_MARGIN_MS,
  STATIONARY_RENEWAL_RETRY_MS,
  STATIONARY_RENEWAL_FINAL_MARGIN_MS,
} from './presencePolicy.js';

export { PRESENCE_HEARTBEAT_MS, PRESENCE_POSITION_THRESHOLD_PX, PRESENCE_SYNC_INTERVAL_MS, PRESENCE_TIMEOUT_MS, TERMINAL_PRESENCE_HEARTBEAT_MS };

export class Presence {
  constructor(client, api, identity, status = () => {}, { adaptiveMovement = ADAPTIVE_MOVEMENT } = {}) {
    Object.assign(this, { client, api, identity, status });
    this.busy = false;
    this.adaptiveMovement = adaptiveMovement;
    this.terminalMode = false;
  }

  get heartbeatIntervalMs() {
    return this.terminalMode ? TERMINAL_PRESENCE_HEARTBEAT_MS : PRESENCE_HEARTBEAT_MS;
  }

  setTerminalMode(enabled, now = Date.now()) {
    const nextMode = Boolean(enabled);
    if (this.terminalMode === nextMode) return false;
    this.terminalMode = nextMode;
    if (this.active) {
      this.active.nextHeartbeatAt = now + this.heartbeatIntervalMs;
      this.active.idleSince = now;
    }
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
      const {playerId,characterId,sessionId}=this.identity;
      const lease=await this.client.mutation(this.api.players.enterTerminal,{playerId,characterId,sessionId});
      this.terminalLease={...lease,clockOffset:Date.now()-lease.serverNow};
      this.stationaryLease=null;
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
      const {playerId,characterId,sessionId}=this.identity;
      const result=await this.client.mutation(this.api.players.exitTerminal,{playerId,characterId,sessionId});
      this.terminalLease=null;this.setTerminalMode(false);
      if(this.active)this.active.idleSince=Date.now();
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
      const newestServerHeartbeat=Math.max(...rows.filter(row=>!row.presenceMode||row.presenceMode==='playing').map(row=>row.lastSeen).filter(Number.isFinite));
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

  observeMovement(movement) {
    if (!this.adaptiveMovement || !this.active) return;
    this.active.movement = movement;
    void this.send();
  }

  scheduleCruise(active) {
    clearTimeout(this.cruiseTimer);
    if (!this.adaptiveMovement || this.active !== active || !active.previousState?.moving) return;
    this.cruiseTimer = setTimeout(() => { if(this.active===active)void this.send(); },
      Math.max(1, active.sentAt + ADAPTIVE_CRUISE_INTERVAL_MS - Date.now()));
  }

  async send(now = Date.now()) {
    const active = this.active;
    if(this.terminalLease){
      if(now-this.terminalLease.clockOffset>=this.terminalLease.terminalLeaseExpiresAt)this.fail(new Error('CHARACTER_SESSION_LOST'));
      return;
    }
    if(this.terminalTransition)return;
    if (!active || this.busy || now < (active.retryAt ?? 0)) return;
    if(this.stationaryLease&&now>=this.stationaryLease.stationaryLeaseExpiresAt+this.stationaryLease.clockOffset){
      this.fail(new Error('CHARACTER_SESSION_LOST'));return;
    }
    const snapshot=active.snapshot();
    const state = {
      playerId:this.identity.playerId,characterId:this.identity.characterId,
      name:this.identity.displayName??this.identity.name,
      displayName:this.identity.displayName??this.identity.name,
      sessionId:this.identity.sessionId,room:active.room,...snapshot,
      ...(this.adaptiveMovement ? active.movement : {}),
    };
    if (!this.adaptiveMovement) {
      delete state.moving; delete state.velocityX; delete state.velocityY;
    }
    const adaptive = this.adaptiveMovement && typeof state.moving === 'boolean';
    const serialized=JSON.stringify(state);
    const previousState=active.previousState;
    const moved=!previousState||Math.hypot(state.x-previousState.x,state.y-previousState.y)>=PRESENCE_POSITION_THRESHOLD_PX;
    const eventChanged = !previousState || (adaptive && (
      state.moving !== previousState.moving || state.direction !== previousState.direction ||
      state.room !== previousState.room || state.equippedSkin !== previousState.equippedSkin ||
      state.activeCharacterItem !== previousState.activeCharacterItem ||
      Math.hypot(state.velocityX-previousState.velocityX,state.velocityY-previousState.velocityY) >= ADAPTIVE_VELOCITY_THRESHOLD_PX_S ||
      Math.hypot(state.x-previousState.x,state.y-previousState.y) > 160));
    const stateChanged=adaptive ? moved || eventChanged
      : moved||JSON.stringify({...state,x:previousState.x,y:previousState.y})!==active.previous;
    if (adaptive && stateChanged && !eventChanged && now < active.sentAt + ADAPTIVE_CRUISE_INTERVAL_MS) return;
    const shouldUpdate = stateChanged && (!this.terminalMode || moved);
    if(shouldUpdate||active.idleSince===undefined)active.idleSince=now;
    const enterStationary=!shouldUpdate&&!this.stationaryLease&&!this.terminalMode
      &&now-active.idleSince>=STATIONARY_IDLE_DWELL_MS;
    const renewStationary=Boolean(this.stationaryLease&&!shouldUpdate&&now>=this.stationaryLease.renewAt);
    if(this.stationaryLease&&!shouldUpdate&&!renewStationary)return;
    const heartbeatDueAt = active.nextHeartbeatAt || active.sentAt + this.heartbeatIntervalMs;
    if (!shouldUpdate && !enterStationary && !renewStationary && now < heartbeatDueAt) return;
    this.busy = true;
    try {
      const request=enterStationary||renewStationary
        ? this.client.mutation(this.api.players[renewStationary?'renewStationary':'enterStationary'],{
          playerId:this.identity.playerId,characterId:this.identity.characterId,sessionId:this.identity.sessionId,
        })
        : shouldUpdate
        ? this.client.mutation(this.api.players.update,state)
        : this.client.mutation(this.api.players.heartbeat,{
        playerId: this.identity.playerId, characterId: this.identity.characterId,
        sessionId: this.identity.sessionId,
      });
      this.pendingSend=request;
      const result=await request;
      if(this.active!==active)return;
      if(enterStationary||renewStationary)this.setStationaryLease(result);
      else if(shouldUpdate)this.stationaryLease=null;
      if(shouldUpdate){active.previous = serialized;active.previousState = state;}
      active.sentAt = now;
      active.nextHeartbeatAt = now + this.heartbeatIntervalMs;
      active.retryAt = 0;
      if (this.active === active) this.status('Online');
    } catch (error) {
      if (this.active === active) {
        if((enterStationary||renewStationary)&&String(error).includes('CHARACTER_SESSION_LOST'))this.fail(error);
        else if(renewStationary&&this.stationaryLease){
          const expiry=this.stationaryLease.stationaryLeaseExpiresAt+this.stationaryLease.clockOffset;
          const retryAt=Math.min(Date.now()+STATIONARY_RENEWAL_RETRY_MS,expiry-STATIONARY_RENEWAL_FINAL_MARGIN_MS);
          if(retryAt<=Date.now())this.fail(new Error('CHARACTER_SESSION_LOST'));
          else this.stationaryLease.renewAt=retryAt;
        }else{
          active.retryAt = Date.now() + this.heartbeatIntervalMs;
          this.fail(error);
        }
      }
    }
    finally {
      this.pendingSend=null;this.busy = false;
      if (this.active === active && adaptive) {
        this.scheduleCruise(active);
        queueMicrotask(() => { if(this.active===active)void this.send(); });
      }
    }
  }

  setStationaryLease(lease){
    const clockOffset=Date.now()-lease.serverNow;
    const localExpiry=lease.stationaryLeaseExpiresAt+clockOffset;
    this.stationaryLease={...lease,clockOffset,renewAt:localExpiry-STATIONARY_RENEWAL_MARGIN_MS};
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
    this.stationaryLease=null;
    this.terminalMode = false;
    clearInterval(this.timer);
    clearTimeout(this.cruiseTimer);
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
      playerId:identity.playerId,characterId:identity.characterId,sessionId:identity.sessionId,
    });
    if(this.identity===identity)this.identity=null;
    return result;
  }

  close() { this.leave(); return this.client.close(); }
}
