import { REALTIME_CONFIG as config } from './config.js';

const plain=p=>p!==null&&typeof p==='object'&&!Array.isArray(p);
const number=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(s);
export const validRoomId=id;
export const CLIENT_TYPES=new Set(['join-room','leave-room','ping','peer-ping','peer-pong','position','pvp-authorize','pvp-hit-attempt','pvp-movement','pvp-projectile-spawn','pvp-projectile-destroy','projectile-spawn','projectile-destroy','test-event','pulse-start','pulse-end','pulse-summary']);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function validPvpProjectileIdentity(p){return plain(p)&&id(p.projectileId)&&id(p.playerId)
  &&Number.isSafeInteger(p.life)&&p.life>=0&&Number.isSafeInteger(p.shotSeq)&&p.shotSeq>=1;}
export function validPvpProjectile(p){return validPvpProjectileIdentity(p)
  &&number(p.x,-100000,100000)&&number(p.y,-100000,100000)
  &&number(p.vx,-1000,1000)&&number(p.vy,-1000,1000)&&Math.hypot(p.vx,p.vy)>0
  &&number(p.ttlMs,100,3000);}
// PvP world coordinates are independent of the lab's 800 x 500 canvas.
export function validPvpMovement(p){return plain(p)&&id(p.playerId)
  &&number(p.x,-100000,100000)&&number(p.y,-100000,100000)
  &&number(p.vx,-1000,1000)&&number(p.vy,-1000,1000)&&typeof p.moving==='boolean'
  &&['up','down','left','right'].includes(p.direction)
  &&Number.isSafeInteger(p.sampleSeq)&&p.sampleSeq>=1
  &&Number.isSafeInteger(p.life)&&p.life>=0;}
export function validPosition(p){return plain(p)&&number(p.x,0,config.width)&&number(p.y,0,config.height)&&number(p.vx,-1000,1000)&&number(p.vy,-1000,1000)
  &&(p.sampleSeq===undefined||(Number.isSafeInteger(p.sampleSeq)&&p.sampleSeq>=0));}
const timing=p=>plain(p)&&id(p.runId)&&Number.isSafeInteger(p.sequence)&&p.sequence>=1
  &&number(p.intervalMs,20,2000)&&(p.benchmark===undefined||p.benchmark===true)&&['scheduledAt','actualFireAt','sentAt'].every(k=>number(p[k],0,Number.MAX_SAFE_INTEGER));
export function validProjectile(p){return validPosition(p)&&id(p.id)&&number(p.startedAt,0,Number.MAX_SAFE_INTEGER)&&number(p.ttlMs,100,3000)
  &&(p.pulse===undefined||timing(p.pulse));}
const settings=p=>plain(p)&&number(p.latencyMs,0,2000)&&number(p.jitterMs,0,1000)&&number(p.loss,0,1);
const sampleStats=p=>plain(p)&&Number.isSafeInteger(p.count)&&p.count>=0&&['average','min','max','jitter'].every(k=>p[k]===null||number(p[k],0,Number.MAX_SAFE_INTEGER));
const timingSamples=p=>plain(p)&&['scheduleError','intervals','intervalVariation','receiveToRender'].every(k=>Array.isArray(p[k])&&p[k].length<=50&&p[k].every(n=>number(n,0,Number.MAX_SAFE_INTEGER)));
export function validPulseSummary(p){return plain(p)&&id(p.runId)&&p.role==='receiver'&&number(p.configuredIntervalMs,20,2000)
  &&Number.isSafeInteger(p.sampleCount)&&p.sampleCount>=0&&Number.isSafeInteger(p.missingSequences)&&p.missingSequences>=0
  &&Number.isSafeInteger(p.outOfOrder)&&p.outOfOrder>=0&&typeof p.backgrounded==='boolean'&&typeof p.completed==='boolean'
  &&sampleStats(p.intervalsMs)&&sampleStats(p.receiveToRenderMs)&&(p.timingSamples===undefined||timingSamples(p.timingSamples));}
export function validClientMessage(m){
  if(!plain(m)||!CLIENT_TYPES.has(m.type)||!validRoomId(m.roomId)||!Number.isSafeInteger(m.seq)||m.seq<1
    ||!number(m.sentAt,0,Number.MAX_SAFE_INTEGER)||!['reliable','unreliable'].includes(m.channel)||!plain(m.payload))return false;
  const p=m.payload;
  switch(m.type){
    case 'join-room':case 'leave-room':return Object.keys(p).length===0;
    case 'ping':return id(p.probeId);
    case 'peer-ping':case 'peer-pong':return id(p.peerId)&&id(p.pingId);
    case 'position':return validPosition(p);
    case 'pvp-movement':return validPvpMovement(p);
    case 'pvp-authorize':return id(p.playerId)&&id(p.sessionId)&&id(p.matchId)&&integer(p.round);
    case 'pvp-hit-attempt':return id(p.projectileId)&&id(p.targetId)&&integer(p.targetLife)
      &&Object.keys(p).every(key=>['projectileId','targetId','targetLife'].includes(key));
    case 'pvp-projectile-spawn':return validPvpProjectile(p);
    case 'pvp-projectile-destroy':return validPvpProjectileIdentity(p);
    case 'projectile-spawn':return validProjectile(p);
    case 'projectile-destroy':return id(p.id);
    case 'test-event':return Number.isSafeInteger(p.value)&&p.value>=0;
    case 'pulse-start':return id(p.runId)&&number(p.intervalMs,20,2000)&&(p.count===null||[10,20,50].includes(p.count))&&settings(p.simulation)&&(p.benchmark===undefined||p.benchmark===true);
    case 'pulse-end':return id(p.runId)&&Number.isSafeInteger(p.lastSequence)&&p.lastSequence>=0&&number(p.skipped,0,Number.MAX_SAFE_INTEGER)&&number(p.maxWakeLateness,0,Number.MAX_SAFE_INTEGER);
    case 'pulse-summary':return id(p.targetId)&&validPulseSummary(p.summary);
    default:return false;
  }
}
export function validServerMessage(m){
  if(!plain(m)||typeof m.type!=='string'||!plain(m.payload)||!number(m.serverTime,0,Number.MAX_SAFE_INTEGER))return false;
  if(CLIENT_TYPES.has(m.type))return validClientMessage(m)&&id(m.senderId);
  switch(m.type){
    case 'pvp-authorized':return validRoomId(m.roomId)&&id(m.payload.playerId)&&integer(m.payload.round);
    case 'pvp-combat-error':return validRoomId(m.roomId)&&typeof m.payload.reason==='string'&&m.payload.reason.length<=200;
    case 'pvp-combat-state':return validRoomId(m.roomId)&&id(m.payload.authorityId)&&integer(m.payload.version)
      &&integer(m.payload.round)&&integer(m.payload.damageRevision)&&Array.isArray(m.payload.players)&&m.payload.players.length<=4
      &&m.payload.players.every(p=>id(p.playerId)&&integer(p.life)&&number(p.hp,0,100));
    case 'pvp-hit-result':return validRoomId(m.roomId)&&id(m.payload.projectileId)&&id(m.payload.shooterId)&&id(m.payload.targetId)
      &&typeof m.payload.accepted==='boolean'&&typeof m.payload.reason==='string'
      &&number(m.payload.damage,0,100)&&[m.payload.hpBefore,m.payload.hpAfter].every(n=>n===null||number(n,0,100));
    case 'welcome':return id(m.payload.clientId);
    case 'pong':return id(m.payload.probeId);
    case 'peer-joined':case 'peer-left':return id(m.payload.clientId);
    case 'room-state':return validRoomId(m.roomId)&&Array.isArray(m.payload.peers)&&m.payload.peers.length<=16
      &&m.payload.peers.every(p=>plain(p)&&id(p.clientId)&&(p.position===null||validPosition(p.position)));
    case 'room-left':return validRoomId(m.roomId);
    default:return false;
  }
}
export function decodeMessage(text,validator,maxBytes=config.maxMessageBytes){
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>maxBytes)return null;
  try{const m=JSON.parse(text);return validator(m)?m:null;}catch{return null;}
}
