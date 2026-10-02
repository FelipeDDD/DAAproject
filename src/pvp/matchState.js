import { PVP_RULES,PVP_TEAMS } from './config.js';

// Pure rules shared by the temporary Convex authority and client clock projection.
// No Phaser, profile rewards, network transport or UI code belongs here.
export const newFighter=member=>({...member,hp:PVP_RULES.maxHp,kills:0,deaths:0,life:0,
  respawnAt:null,lastShot:0,lastHitAt:0});
export function canStartMatch(match){
  return match.state==='waiting'&&PVP_TEAMS.every(team=>{
    const count=match.participants.filter(p=>p.team===team).length;
    return count>=1&&count<=PVP_RULES.teamSize;
  });
}
export function endMatch(match,now,reason='timer'){
  if(match.state==='ended')return match;
  return {...match,state:'ended',endedAt:now,reason,
    participants:match.participants.map(p=>({...p,respawnAt:null})),
    winner:['timer','score-limit'].includes(reason)?(match.scores.A===match.scores.B?'draw':match.scores.A>match.scores.B?'A':'B'):null};
}
// Membership is independent of health: a dead player awaiting respawn still belongs to a team.
export function reconcileParticipants(match,participants,now){
  const next={...match,participants};
  if(match.state==='ended')return next;
  if(!participants.some(p=>p.playerId===match.hostPlayerId))return endMatch(next,now,'host_left');
  if(match.state!=='waiting'&&PVP_TEAMS.some(team=>!participants.some(p=>p.team===team)))return endMatch(next,now,'team_empty');
  return next;
}
export const interruptedMatch=match=>match?.state==='ended'&&['team_empty','host_left','host-left','expired','lobby_unavailable'].includes(match.reason);
export function startMatch(match,now){
  if(!canStartMatch(match))throw new Error('Each team needs 1 or 2 players.');
  const startedAt=now+PVP_RULES.countdownMs;
  return {...match,state:'countdown',startedAt,endsAt:startedAt+match.timeLimitMs};
}
export function respawnPlayer(player){return {...player,hp:PVP_RULES.maxHp,life:player.life+1,respawnAt:null};}
export function advanceMatch(match,now){
  if(!match||match.state==='waiting'||match.state==='ended')return match;
  if(now>=match.endsAt)return endMatch(match,match.endsAt);
  if(now<match.startedAt)return match;
  return {...match,state:'active',participants:match.participants.map(p=>
    p.respawnAt!==null&&now>=p.respawnAt?respawnPlayer(p):p)};
}
export function registerPlayerDeath(match,killerId,victimId,now){
  const killer=match.participants.find(p=>p.playerId===killerId),victim=match.participants.find(p=>p.playerId===victimId);
  if(match.state!=='active'||!killer||!victim||killer.team===victim.team||victim.hp>0||victim.respawnAt!==null)return match;
  const next={...match,scores:{...match.scores,[killer.team]:match.scores[killer.team]+1},
    participants:match.participants.map(p=>p===victim?{...p,hp:0,deaths:p.deaths+1,respawnAt:now+match.respawnMs}:
      p===killer?{...p,kills:p.kills+1}:p)};
  return next.scores[killer.team]>=match.scoreLimit?endMatch(next,now,'score-limit'):next;
}
export function applyPlayerDamage(source,{attackerId,victimId,attackerLife,victimLife,shot},now){
  const match=advanceMatch(source,now);
  const attacker=match.participants.find(p=>p.playerId===attackerId),victim=match.participants.find(p=>p.playerId===victimId);
  if(match.state!=='active'||!attacker||!victim||attacker.team===victim.team||attacker.hp<=0||victim.hp<=0
    ||attacker.life!==attackerLife||victim.life!==victimLife||!Number.isSafeInteger(shot)||shot<=attacker.lastShot
    ||now-attacker.lastHitAt<PVP_RULES.attackCooldownMs)return match;
  const next={...match,participants:match.participants.map(p=>p===attacker?{...p,lastShot:shot,lastHitAt:now}:
    p===victim?{...p,hp:Math.max(0,p.hp-PVP_RULES.damage)}:p)};
  return victim.hp<=PVP_RULES.damage?registerPlayerDeath(next,attackerId,victimId,now):next;
}
