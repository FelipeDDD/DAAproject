import { PVP_RULES } from './config.js';
import { PLAYER_SPEED } from '../game/settings.js';

// Common round rules only. Objective/respawn/score rules stay in gameModes.
export const DEFAULT_MATCH_SETTINGS=Object.freeze({
  maxHp:PVP_RULES.maxHp,damage:PVP_RULES.damage,
  attackCooldownMs:PVP_RULES.attackCooldownMs,movementSpeedMultiplier:1,
});
export const MATCH_SETTING_LIMITS=Object.freeze({
  maxHp:{min:50,max:500,integer:true},damage:{min:1,max:100,integer:true},
  attackCooldownMs:{min:100,max:5000,integer:true},movementSpeedMultiplier:{min:.5,max:2,integer:false},
});
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const validField=(key,value)=>{const {min,max,integer}=MATCH_SETTING_LIMITS[key];
  return Number.isFinite(value)&&value>=min&&value<=max&&(!integer||Number.isSafeInteger(value));};
export function validMatchSettings(value){try{normalizeMatchSettings(value);return plain(value);}catch{return false;}}
export function normalizeMatchSettings(value){
  if(value!=null&&(!plain(value)||Object.keys(value).some(key=>key!=='teamOverrides'&&!Object.hasOwn(DEFAULT_MATCH_SETTINGS,key))))
    throw new Error('Invalid match settings.');
  // Old/partial snapshots may omit a field or explicitly leave it nullish.
  // Supplied invalid numbers still fail; backend saves use these same bounds.
  const settings={...DEFAULT_MATCH_SETTINGS};
  for(const key of Object.keys(DEFAULT_MATCH_SETTINGS))if(value?.[key]!=null)settings[key]=value[key];
  if(!Object.keys(DEFAULT_MATCH_SETTINGS).every(key=>validField(key,settings[key])))throw new Error('Match settings are outside the allowed ranges.');
  const overrides=value?.teamOverrides;
  if(overrides!=null){
    if(!plain(overrides)||Object.keys(overrides).some(team=>!['A','B'].includes(team)))throw new Error('Invalid team overrides.');
    const teams={A:{},B:{}};
    for(const team of ['A','B']){
      const fields=overrides[team];
      if(fields==null)continue;
      if(!plain(fields)||Object.keys(fields).some(key=>!Object.hasOwn(DEFAULT_MATCH_SETTINGS,key)))throw new Error('Invalid team override fields.');
      for(const [key,number] of Object.entries(fields)){
        if(number==null)continue; // Use Global; normalize away nullish fields.
        if(!validField(key,number))throw new Error('Team settings are outside the allowed ranges.');
        teams[team][key]=number;
      }
    }
    // Empty overrides preserve the pre-override canonical global shape.
    if(Object.values(teams).some(fields=>Object.keys(fields).length))settings.teamOverrides=teams;
  }
  return settings;
}
export const matchSettingsFor=match=>normalizeMatchSettings(match?.matchSettings);
export function resolveMatchSettings(value,team){
  const {teamOverrides,...globals}=normalizeMatchSettings(value);
  return {...globals,...teamOverrides?.[team]};
}
export const effectiveMatchSettings=(match,team)=>resolveMatchSettings(match?.matchSettings,team);
export const pvpMovementSpeed=(match,team)=>PLAYER_SPEED*effectiveMatchSettings(match,team).movementSpeedMultiplier;
export const sameMatchSettings=(a,b)=>[undefined,'A','B'].every(team=>{
  const left=resolveMatchSettings(a,team),right=resolveMatchSettings(b,team);
  return Object.keys(DEFAULT_MATCH_SETTINGS).every(key=>left[key]===right[key]);
});
export const hasCustomMatchSettings=match=>{
  const settings=matchSettingsFor(match);
  return !sameMatchSettings(settings,DEFAULT_MATCH_SETTINGS);
};
