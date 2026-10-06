import { gameMode } from './gameModes.js';

const payloadStatus=payload=>payload?.contested?'CONTESTED':payload?.control==='A'?'BLUE PUSHING':payload?.control==='B'?'RED PUSHING':'NEUTRAL';
function retryCompositionValid(state,retry){
  if(!retry||!Array.isArray(retry.activePlayerIds)||!Array.isArray(state?.participants))return false;
  const active=new Set(retry.activePlayerIds),participants=state.participants.filter(p=>active.has(p.playerId));
  return participants.length>=2&&participants.some(p=>p.team==='A')&&participants.some(p=>p.team==='B');
}
export const PVP_DEV_PANEL_OPEN_KEY='daa-pvp-dev-panel-open';

function readDevPanelOpen(storage){
  try{return (storage??globalThis.localStorage)?.getItem(PVP_DEV_PANEL_OPEN_KEY)==='true';}catch{return false;}
}
function saveDevPanelOpen(open,storage){
  try{(storage??globalThis.localStorage)?.setItem(PVP_DEV_PANEL_OPEN_KEY,String(Boolean(open)));}catch{}
}

export class PvpHud {
  constructor({onLeave,onEnd,onRetry=()=>{},documentRef=globalThis.document,dev=false,storage}){
    const node=(parent,tag,cls)=>{const n=documentRef.createElement(tag);n.className=cls;parent.append(n);return n;};
    this.root=documentRef.createElement('aside');this.root.className='pvp-hud';
    this.root.setAttribute('aria-label','PvP match');

    const match=node(this.root,'section','pvp-hud-match');
    this.mode=node(match,'span','pvp-hud-mode');
    this.score=node(match,'strong','pvp-hud-score');
    this.phase=node(match,'span','pvp-hud-phase');
    this.timer=node(match,'time','pvp-hud-timer');
    this.payloadProgress=node(match,'span','pvp-hud-progress');

    const player=node(this.root,'section','pvp-hud-player');
    this.team=node(player,'span','pvp-hud-team');
    this.personal=node(player,'small','pvp-hud-personal');
    this.leave=node(player,'button','pvp-hud-leave');this.leave.type='button';this.leave.textContent='Leave';this.leave.onclick=onLeave;
    if(dev){
      const details=node(player,'details','pvp-hud-dev');
      this.devPanel=details;details.open=readDevPanelOpen(storage);
      details.addEventListener('toggle',()=>saveDevPanelOpen(details.open,storage));
      const summary=node(details,'summary','');summary.textContent='DEV';
      this.diagnostics=node(details,'small','pvp-diagnostics');
      this.end=node(details,'button','');this.end.type='button';this.end.textContent='End match';this.end.onclick=onEnd;
    }

    const feedback=node(this.root,'section','pvp-hud-feedback');
    this.result=node(feedback,'p','pvp-result');
    this.returnTimer=node(feedback,'p','pvp-return');
    this.retryStatus=node(feedback,'small','pvp-retry-status');
    this.retry=node(feedback,'button','pvp-retry');this.retry.type='button';this.retry.textContent='Retry';this.retry.hidden=true;
    this.retry.onclick=()=>{if(this.retry.disabled)return;if(onRetry()!==false){this.retry.disabled=true;this.retryPendingRound=this.renderedRound;}};
    this.status=node(feedback,'p','pvp-hud-status');this.status.setAttribute('role','status');
    // The shell is relative to the canvas, so the rails track viewport presets.
    (documentRef.getElementById?.('game-shell')??documentRef.body).append(this.root);
  }
  render(state,self,now,returnSeconds=null){
    const retry=state.state==='ended'?state.retry:null;
    const canRetry=retryCompositionValid(state,retry);
    this.renderedRound=state.round??0;
    this.retry.hidden=!canRetry;
    this.retry.disabled=!canRetry||retry.resolving||retry.playerIds.includes(self?.playerId)||this.retryPendingRound===this.renderedRound;
    this.retry.textContent=retry?.playerIds.includes(self?.playerId)?'Retry confirmed':'Retry';
    this.retryStatus.textContent=canRetry?`Retry: ${retry.playerIds.length}/${retry.activePlayerIds.length} · ${state.participants
      .filter(p=>retry.playerIds.includes(p.playerId)).map(p=>p.displayName??'Player').join(', ')}`:'';
    this.mode.textContent=state.mode==='payload'?'PAYLOAD':'TDM';
    this.score.textContent=state.mode==='payload'?payloadStatus(state.payload):gameMode(state.mode).summary(state);
    this.phase.textContent=state.mode==='payload'&&state.state==='active'?'':state.state.toUpperCase();
    const distance=state.payload?.distance,routeLength=state.payload?.routeLength;
    this.payloadProgress.textContent=state.mode==='payload'&&Number.isFinite(distance)&&Number.isFinite(routeLength)&&routeLength>0
      ?`${Math.round(Math.max(0,Math.min(100,distance/routeLength*100)))}%`:'';
    const clockNow=state.state==='ended'?(state.endedAt??now):now;
    const seconds=Math.max(0,Math.ceil(((state.endsAt??clockNow)-clockNow)/1000));
    this.timer.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    this.team.textContent=self?.team==='A'?'BLUE':self?.team==='B'?'RED':'TEAM ?';
    this.team.setAttribute('data-team',self?.team??'');
    this.personal.textContent=`K ${self?.kills??0} / D ${self?.deaths??0} · HP ${self?.hp??0}`;
    this.result.textContent=state.state==='ended'
      ?(['timer','score-limit','payload-delivered'].includes(state.reason)?state.winner==='draw'?'DRAW':`TEAM ${state.winner} WINS`:
        ['host_left','host-left'].includes(state.reason)?'MATCH ENDED · The host left.':
        state.reason==='team_empty'?`MATCH ENDED · Team ${state.participants.some(p=>p.team==='A')?'B':'A'} has no remaining players.`:'MATCH ENDED')
      :state.state==='countdown'?String(Math.max(1,Math.ceil((state.startedAt-now)/1000)))
      :self?.hp===0?(self.respawnAt===null?'Waiting for respawn...':`Respawn in ${Math.max(0,(self.respawnAt-now)/1000).toFixed(1)}s`)
      :now-state.startedAt<1000?'FIGHT':'';
    this.returnTimer.textContent=retry?(canRetry?(retry.resolving?'Preparing next round...':`Retry or leave in ${Math.max(0,Math.ceil((retry.deadline-now)/1000))}s`)
      :`Returning in ${Math.max(0,Math.ceil((retry.deadline-now)/1000))}s`)
      :returnSeconds===null?'':`Returning in ${returnSeconds}...`;
    this.leave.textContent=returnSeconds===null?'Leave':'Leave now';
    if(this.diagnostics)this.diagnostics.textContent=`Match ${state.matchId} · ${state.state} · Round ${this.renderedRound} · Team ${self?.team}${this.errorDetail?` · ${this.errorDetail}`:''}`;
    if(this.end)this.end.hidden=state.hostPlayerId!==self?.playerId||state.state==='ended';
  }
  destroy(){this.root.remove();}
}
