export const DIRECTOR_BOSS_ID='director';
export const BOSS_REWARDS=Object.freeze({
  REMASTERED_SKIN:'remastered_skin',
  DIRECTOR_ACCESS_BADGE:'director_access_badge',
});
export const DIRECTOR_REWARD_IDS=Object.freeze(Object.values(BOSS_REWARDS));
export const CHARACTER_SKINS=Object.freeze({CLASSIC:'classic',REMASTERED:'remastered'});
export const BOSS_DEV_PRESETS=Object.freeze(['fresh','skin_only','badge_only','both_unlocked','one_win','two_wins']);

export function normalizeBossProgress(progress,characterId=''){
  const rewards=[...new Set((progress?.rewards??[]).filter(id=>DIRECTOR_REWARD_IDS.includes(id)))];
  const equippedSkin=progress?.equippedSkin===CHARACTER_SKINS.REMASTERED
    &&rewards.includes(BOSS_REWARDS.REMASTERED_SKIN)?CHARACTER_SKINS.REMASTERED:CHARACTER_SKINS.CLASSIC;
  return {characterId:progress?.characterId??characterId,bossId:DIRECTOR_BOSS_ID,
    wins:Math.max(0,Number(progress?.wins)||0),defeated:Boolean(progress?.defeated),rewards,equippedSkin};
}

export function missingDirectorRewards(progress){
  const owned=new Set(normalizeBossProgress(progress).rewards);
  return DIRECTOR_REWARD_IDS.filter(id=>!owned.has(id));
}

export function rewardOutcomeForVictory(progress){
  const normalized=normalizeBossProgress(progress);
  const missing=missingDirectorRewards(normalized);
  if(normalized.wins===1&&missing.length===2)return {type:'choice',options:[...missing]};
  if(normalized.wins===2&&missing.length===1)return {type:'automatic',rewardId:missing[0]};
  return {type:'none'};
}

export function applyDirectorVictory(previous,characterId=''){
  const progress=normalizeBossProgress(previous,characterId);
  progress.wins+=1;progress.defeated=true;
  const outcome=rewardOutcomeForVictory(progress);
  if(outcome.type==='automatic')progress.rewards.push(outcome.rewardId);
  return {progress,outcome};
}

export function applyDirectorRewardChoice(previous,rewardId){
  const progress=normalizeBossProgress(previous);
  if(!DIRECTOR_REWARD_IDS.includes(rewardId))throw new Error('Unknown Director reward.');
  if(progress.rewards.includes(rewardId))return {progress,granted:false};
  if(progress.wins<1||progress.rewards.length>0)throw new Error('Director reward choice is no longer available.');
  progress.rewards.push(rewardId);
  return {progress,granted:true};
}

export function hasBossReward(progress,rewardId){return normalizeBossProgress(progress).rewards.includes(rewardId);}

export function hasPendingDirectorReward(progress){
  const normalized=normalizeBossProgress(progress);
  return normalized.wins>0&&normalized.rewards.length===0;
}

export function shouldClearDirectorLoot(progress,{rewardOpened=false,bossDying=false}={}){
  return !hasPendingDirectorReward(progress)&&!rewardOpened&&!bossDying;
}

export function canEquipCharacterSkin(progress,skin){
  if(skin===CHARACTER_SKINS.CLASSIC)return true;
  return skin===CHARACTER_SKINS.REMASTERED&&hasBossReward(progress,BOSS_REWARDS.REMASTERED_SKIN);
}

export function equipCharacterSkin(previous,skin,characterId=''){
  const progress=normalizeBossProgress(previous,characterId);
  if(!canEquipCharacterSkin(progress,skin))throw new Error('This skin has not been unlocked.');
  progress.equippedSkin=skin;
  return progress;
}

export function applyBossDevPreset(previous,preset,characterId=''){
  if(!BOSS_DEV_PRESETS.includes(preset))throw new Error('Unknown DEV boss preset.');
  const current=normalizeBossProgress(previous,characterId);
  const exact=(wins,rewards)=>normalizeBossProgress({characterId,bossId:DIRECTOR_BOSS_ID,
    wins,defeated:wins>0,rewards,equippedSkin:CHARACTER_SKINS.CLASSIC},characterId);
  if(preset==='fresh')return exact(0,[]);
  if(preset==='skin_only')return exact(Math.max(1,current.wins),[BOSS_REWARDS.REMASTERED_SKIN]);
  if(preset==='badge_only')return exact(Math.max(1,current.wins),[BOSS_REWARDS.DIRECTOR_ACCESS_BADGE]);
  if(preset==='both_unlocked')return exact(Math.max(2,current.wins),DIRECTOR_REWARD_IDS);
  const wins=preset==='one_win'?1:2;
  return normalizeBossProgress({...current,wins,defeated:wins>0},characterId);
}
