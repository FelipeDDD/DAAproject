import { directorBossConfig } from './encounterConfig.js';

export const ARENA_MODES=Object.freeze({SOLO:'solo',COOP:'coop'});
export const ARENA_ENCOUNTER_STATES=Object.freeze({
  WAITING:'waiting',ACTIVE:'active',DEFEATED:'defeated',COMPLETED:'completed',
});

const newEncounterId=()=>globalThis.crypto?.randomUUID?.()??`solo-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Encounter identity and lifecycle are independent of Phaser objects and of
// the Director's intro/dialogue timing state.
export class ArenaEncounter {
  constructor({encounterId,mode=ARENA_MODES.SOLO,hostPlayerId=null,participantCount}={}){
    if(!Object.values(ARENA_MODES).includes(mode))throw new Error('Unknown arena mode.');
    this.encounterId=encounterId??(mode===ARENA_MODES.SOLO?newEncounterId():null);
    this.mode=mode;
    this.hostPlayerId=hostPlayerId;
    this.participantCount=participantCount??(mode===ARENA_MODES.SOLO?1:0);
    if(!Number.isInteger(this.participantCount)||this.participantCount<0||this.participantCount>4)
      throw new RangeError('Arena participant count must be between 0 and 4.');
    this.bossConfig=directorBossConfig(mode===ARENA_MODES.SOLO?1:Math.max(1,this.participantCount));
    this.state=ARENA_ENCOUNTER_STATES.WAITING;
  }
  start(){
    if(this.state!==ARENA_ENCOUNTER_STATES.WAITING)return false;
    this.state=ARENA_ENCOUNTER_STATES.ACTIVE;return true;
  }
  defeat(){
    if(this.state!==ARENA_ENCOUNTER_STATES.ACTIVE)return false;
    this.state=ARENA_ENCOUNTER_STATES.DEFEATED;return true;
  }
  complete(){
    if(this.state!==ARENA_ENCOUNTER_STATES.DEFEATED)return false;
    this.state=ARENA_ENCOUNTER_STATES.COMPLETED;return true;
  }
  updateFromLobby(lobby){
    if(this.mode!==ARENA_MODES.COOP||lobby.lobbyId!==this.encounterId)return false;
    const count=lobby.participants.length;
    if(!Number.isInteger(count)||count<0||count>4)throw new RangeError('Arena participant count must be between 0 and 4.');
    this.hostPlayerId=lobby.hostPlayerId;
    this.participantCount=count;
    // Configuration only: a started lobby does not activate cooperative combat.
    this.bossConfig=directorBossConfig(Math.max(1,count));
    return true;
  }
  reset(){
    if(this.mode!==ARENA_MODES.SOLO)return false;
    this.encounterId=newEncounterId();this.state=ARENA_ENCOUNTER_STATES.WAITING;
    return true;
  }
}

export function arenaEncounterFromDestination(destination={}){
  const source=destination.encounter??destination;
  const mode=source.mode??destination.arenaMode??ARENA_MODES.SOLO;
  return new ArenaEncounter({
    mode,
    encounterId:destination.arenaLobbyId??source.encounterId??source.lobbyId??null,
    hostPlayerId:source.hostPlayerId??null,
    participantCount:source.participantCount??source.participants?.length,
  });
}
