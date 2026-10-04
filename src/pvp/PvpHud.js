export class PvpHud {
  constructor({onLeave,onEnd,documentRef=globalThis.document,dev=false}){
    this.root=documentRef.createElement('aside');this.root.className='pvp-hud';
    const node=(tag,cls)=>{const n=documentRef.createElement(tag);n.className=cls;this.root.append(n);return n;};
    this.score=node('strong','');this.timer=node('div','');this.personal=node('small','');
    this.result=node('p','pvp-result');this.help=node('small','');this.help.textContent='WASD / arrows · Click to fire';
    this.returnTimer=node('p','pvp-return');
    this.status=node('p','');this.status.setAttribute('role','status');
    this.leave=node('button','');this.leave.textContent='Leave Arena';this.leave.onclick=onLeave;
    if(dev){this.diagnostics=node('small','pvp-diagnostics');this.end=node('button','');this.end.textContent='DEV: End Match';this.end.onclick=onEnd;}
    documentRef.body.append(this.root);
  }
  render(state,self,now,returnSeconds=null){
    this.score.textContent=`TEAM A  ${state.scores.A} — ${state.scores.B}  TEAM B`;
    const clockNow=state.state==='ended'?(state.endedAt??now):now;
    const seconds=Math.max(0,Math.ceil(((state.endsAt??clockNow)-clockNow)/1000));
    this.timer.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    this.personal.textContent=`Team ${self?.team??'?'} · HP ${self?.hp??0} · K ${self?.kills??0} / D ${self?.deaths??0}`;
    this.result.textContent=state.state==='ended'
      ?(['timer','score-limit'].includes(state.reason)?state.winner==='draw'?'DRAW':`TEAM ${state.winner} WINS`:
        ['host_left','host-left'].includes(state.reason)?'MATCH ENDED · The host left.':
        state.reason==='team_empty'?`MATCH ENDED · Team ${state.participants.some(p=>p.team==='A')?'B':'A'} has no remaining players.`:'MATCH ENDED')
      :state.state==='countdown'?String(Math.max(1,Math.ceil((state.startedAt-now)/1000)))
      :self?.hp===0?(self.respawnAt===null?'Waiting for respawn...':`Respawn in ${Math.max(0,(self.respawnAt-now)/1000).toFixed(1)}s`)
      :now-state.startedAt<1000?'FIGHT':'';
    this.returnTimer.textContent=returnSeconds===null?'':`Returning in ${returnSeconds}...`;
    this.leave.textContent=returnSeconds===null?'Leave Arena':'Leave now';
    if(this.diagnostics)this.diagnostics.textContent=`DEV · ${state.matchId} · ${state.state} · Team ${self?.team}`;
    if(this.end)this.end.hidden=state.hostPlayerId!==self?.playerId||state.state==='ended';
  }
  destroy(){this.root.remove();}
}
