import { PVP_RULES,PVP_TEAMS } from './config.js';
import { resolveMatchSettings,matchSettingsFor,effectiveMatchSettings } from './matchSettings.js';

// Pure combat rules executed by the realtime authority. Convex uses lobby/membership helpers only.
// No Phaser, profile rewards, network transport or UI code belongs here.
export const newFighter=(member,settings)=>({...member,hp:resolveMatchSettings(settings,member.team).maxHp,kills:0,deaths:0,life:0,
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
  if(!participants.some(p=>p.playerId===match.hostPlayerId)){
    if(match.state!=='ended')return endMatch(next,now,'host_left');
    if(['host_left','host-left'].includes(match.reason))return next;
    // A finished round can still lose its lobby host. Preserve its scores/winner,
    // but begin departure recovery now, rather than at the earlier victory time.
    return {...next,reason:'host_left',endedAt:interruptedMatch(match)?match.endedAt:now};
  }
  if(match.state!=='waiting'&&PVP_TEAMS.some(team=>!participants.some(p=>p.team===team))){
    if(match.state!=='ended')return endMatch(next,now,'team_empty');
    // The last opponent may leave after victory. Keep that result, but give the
    // remaining host the same recovery countdown as an empty team during play.
    if(!interruptedMatch(match))return {...next,reason:'team_empty',endedAt:now};
  }
  return next;
}
export const interruptedMatch=match=>match?.state==='ended'&&['team_empty','host_left','host-left','expired','lobby_unavailable'].includes(match.reason);
export function startMatch(match,now){
  if(!canStartMatch(match))throw new Error(`Each team needs 1 to ${PVP_RULES.teamSize} players.`);
  const startedAt=now+PVP_RULES.countdownMs;
  const matchSettings=matchSettingsFor(match);
  return {...match,matchSettings,participants:match.participants.map(p=>({...p,hp:resolveMatchSettings(matchSettings,p.team).maxHp})),
    state:'countdown',startedAt,endsAt:startedAt+match.timeLimitMs};
}
export function respawnPlayer(player,settings){return {...player,hp:resolveMatchSettings(settings,player.team).maxHp,life:player.life+1,respawnAt:null,lastShot:0,lastHitAt:0};}
export function advanceMatch(match,now,{finish=endMatch}={}){
  if(!match||match.state==='waiting'||match.state==='ended')return match;
  if(now>=match.endsAt)return finish(match,match.endsAt);
  if(now<match.startedAt)return match;
  return {...match,state:'active',participants:match.participants.map(p=>
    p.respawnAt!==null&&now>=p.respawnAt?respawnPlayer(p,match.matchSettings):p)};
}
export function registerPlayerDeath(match,killerId,victimId,now,{scoreVictory=true}={}){
  const killer=match.participants.find(p=>p.playerId===killerId),victim=match.participants.find(p=>p.playerId===victimId);
  if(match.state!=='active'||!killer||!victim||killer.team===victim.team||victim.hp>0||victim.respawnAt!==null)return match;
  const next={...match,scores:{...match.scores,[killer.team]:match.scores[killer.team]+1},
    participants:match.participants.map(p=>p===victim?{...p,hp:0,deaths:p.deaths+1,respawnAt:now+match.respawnMs}:
      p===killer?{...p,kills:p.kills+1}:p)};
  return scoreVictory&&next.scores[killer.team]>=match.scoreLimit?endMatch(next,now,'score-limit'):next;
}
export function applyPlayerDamage(source,{attackerId,victimId,attackerLife,victimLife,shot},now){
  const match=advanceMatch(source,now);
  const attacker=match.participants.find(p=>p.playerId===attackerId),victim=match.participants.find(p=>p.playerId===victimId);
  const settings=effectiveMatchSettings(match,attacker?.team);
  if(match.state!=='active'||!attacker||!victim||attacker.team===victim.team||attacker.hp<=0||victim.hp<=0
    ||attacker.life!==attackerLife||victim.life!==victimLife||!Number.isSafeInteger(shot)||shot<=attacker.lastShot
    ||now-attacker.lastHitAt<settings.attackCooldownMs)return match;
  const next={...match,participants:match.participants.map(p=>p===attacker?{...p,lastShot:shot,lastHitAt:now}:
    p===victim?{...p,hp:Math.max(0,p.hp-settings.damage)}:p)};
  return victim.hp<=settings.damage?registerPlayerDeath(next,attackerId,victimId,now):next;
}
