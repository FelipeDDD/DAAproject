import { CHARACTERS } from '../characters.js';
import {
  IT_CHALLENGE_DURATION_MS,IT_CHALLENGE_RULES_VERSION,IT_CHALLENGE_VARIANT,itChallengeRulesKey,
} from '../quiz/itChallengeRules.js';

const REQUEST_TYPE='daa-terminal-leaderboard-request';
const STATE_TYPE='daa-terminal-leaderboard-state';

function fallbackName(characterId){
  return String(characterId??'Unknown player').replace(/[-_]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
}

export function normalizeLeaderboardRows(rows,{currentCharacterId=null}={}){
  const currentRulesKey=itChallengeRulesKey();
  const names=new Map(CHARACTERS.map(character=>[character.id,character.name]));
  return (Array.isArray(rows)?rows:[])
    .filter(row=>row?.rulesKey===currentRulesKey&&row.rulesVersion===IT_CHALLENGE_RULES_VERSION
      &&row.durationMs===IT_CHALLENGE_DURATION_MS)
    .sort((left,right)=>right.score-left.score||left.achievedAt-right.achievedAt)
    .map((row,index)=>({
      rank:index+1,characterId:row.characterId,name:names.get(row.characterId)??fallbackName(row.characterId),
      isCurrentPlayer:row.characterId===currentCharacterId,score:row.score,correct:row.correct,
      wrong:row.wrong,skipped:row.skipped,manualSkip:row.manualSkip,timeoutSkip:row.timeoutSkip,
      mediumCorrect:row.mediumCorrect,hardCorrect:row.hardCorrect,totalAnswered:row.totalAnswered,
      accuracy:row.accuracy,achievedAt:row.achievedAt,rulesVersion:row.rulesVersion,
      durationMs:row.durationMs,variant:row.variant,rulesKey:row.rulesKey,
    }));
}

export class TerminalLeaderboardBridge {
  constructor({frame,presence,origin=location.origin}={}){
    this.frame=frame;this.presence=presence;this.origin=origin;this.disposed=false;
  }

  accepts(event){
    return !this.disposed&&event.origin===this.origin&&event.source===this.frame.contentWindow
      &&event.data?.type===REQUEST_TYPE;
  }

  post(state,requestId){
    this.frame.contentWindow?.postMessage({type:STATE_TYPE,state,requestId},this.origin);
  }

  async handle(event){
    if(!this.accepts(event))return false;
    const requestId=event.data.requestId;
    try{
      if(!this.presence?.client||!this.presence?.api?.itChallenge?.leaderboard)
        throw new Error('Leaderboard service is unavailable.');
      const rows=await this.presence.client.query(this.presence.api.itChallenge.leaderboard,{});
      if(this.disposed)return true;
      this.post({
        mode:'IT Challenge',variant:IT_CHALLENGE_VARIANT,durationMs:IT_CHALLENGE_DURATION_MS,
        rulesVersion:IT_CHALLENGE_RULES_VERSION,rulesKey:itChallengeRulesKey(),
        records:normalizeLeaderboardRows(rows,{currentCharacterId:this.presence.identity?.characterId}),
      },requestId);
    }catch(error){
      if(!this.disposed)this.post({error:error instanceof Error?error.message:'Could not load leaderboard.'},requestId);
    }
    return true;
  }

  destroy(){this.disposed=true;}
}

export const TERMINAL_LEADERBOARD_MESSAGES=Object.freeze({request:REQUEST_TYPE,state:STATE_TYPE});
