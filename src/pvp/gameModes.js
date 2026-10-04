import { PVP_RULES } from './config.js';
import { PAYLOAD_RULES } from './payload/config.js';

export const PVP_MODES=Object.freeze({
  tdm:{label:'Team Deathmatch',respawnMs:PVP_RULES.respawnMs,timeLimitMs:PVP_RULES.timeLimitMs,
    summary:s=>`TEAM A  ${s.scores.A} — ${s.scores.B}  TEAM B`},
  payload:{label:'Payload',respawnMs:PAYLOAD_RULES.respawnMs,timeLimitMs:PAYLOAD_RULES.timeLimitMs,
    summary:s=>`PAYLOAD · ${s.payload?.contested?'CONTESTED':s.payload?.control==='A'?'BLUE → RED BASE':s.payload?.control==='B'?'RED → BLUE BASE':'NEUTRAL'}`},
});
export function gameMode(id='tdm'){
  if(!Object.hasOwn(PVP_MODES,id))throw new Error('Invalid PvP game mode.');return PVP_MODES[id];
}
