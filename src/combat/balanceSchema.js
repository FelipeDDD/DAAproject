import original from './balance.original.json' with {type:'json'};
import { METEOR_FALL_MS } from './meteorTiming.js';
import { DAMAGE_PERCENT } from './damageScaling.js';

export { original };
export const BALANCE_ROUTE='/__combat-balance';
export const BALANCE_FORMAT='daa-combat-balance-v1';
const proportions=new Set(['criticalChance','feintChance','chance','castSpeed','enterRatio','exitRatio']);
const timed=/(?:Ms|^ms)$|^(cast|cooldown|sharedCooldown|lifetime)$/;
const distance=/range|distance|radius|padding|^recoil$|hysteresis/i;
const newSlimeFields=['damagePercent','jumpDamage','projectileDamage','contactDamage'];

function bounds(path){
  const key=path.at(-1);
  if(key==='damagePercent'){
    const {min,max,step}=DAMAGE_PERCENT;
    return {min,max,step,unit:'%',integer:true};
  }
  if(proportions.has(key))return {min:key==='castSpeed'?0.01:0,max:1,unit:'%',factor:100};
  if(key==='percent')return {min:0,max:100,unit:'%'};
  if(timed.test(key)){
    const allowZero=key==='trackingMs'||(key==='cast'&&['fireball','lance'].includes(path[1]));
    const min=path.join('.')==='michael.meteor.cast'?METEOR_FALL_MS:allowZero?0:1;
    return {min,max:60000,unit:'ms',integer:true};
  }
  if(/^(damage|jumpDamage|projectileDamage|contactDamage|heal|critical)$/.test(key))return {min:1,max:1000,unit:'HP',integer:true};
  if(/speed/i.test(key))return {min:1,max:1600,unit:'px/s'};
  if(key==='angleDeg')return {min:0,max:80,unit:'°'};
  if(key==='angle'||key==='maxTurn')return {min:0,max:Math.PI,unit:'rad'};
  if(/turnRate/i.test(key))return {min:0,max:12,unit:'rad/s'};
  if(distance.test(key))return {min:/range/i.test(key)?1:0,max:2000,unit:'px'};
  throw new Error('Missing limits for '+path.join('.'));
}

function describe(value,path=[]){
  if(typeof value==='number')return [{path,...bounds(path)}];
  return Object.entries(value).flatMap(([key,child])=>describe(child,[...path,key]));
}

export const balanceFields=describe(original);
export const balanceValue=(data,path)=>path.reduce((object,key)=>object[key],data);

export function normalizeBalance(data){
  const variants=data?.slimes?.variants;
  if(!variants||typeof variants!=='object'||Array.isArray(variants))return data;
  const defaults=original.slimes.variants;
  const updated=Object.fromEntries(Object.entries(variants).map(([kind,settings])=>{
    if(!Object.hasOwn(defaults,kind)||!settings||typeof settings!=='object'||Array.isArray(settings))return [kind,settings];
    const missing=newSlimeFields.filter(key=>Object.hasOwn(defaults[kind],key)&&!Object.hasOwn(settings,key));
    return [kind,missing.length?{...settings,...Object.fromEntries(missing.map(key=>[key,defaults[kind][key]]))}:settings];
  }));
  return {...data,slimes:{...data.slimes,variants:updated}};
}

function hasShape(data,reference){
  if(typeof reference==='number')return typeof data==='number';
  if(!data||typeof data!=='object'||Array.isArray(reference)!==Array.isArray(data))return false;
  const keys=Object.keys(reference);
  return Object.keys(data).length===keys.length&&keys.every(key=>Object.hasOwn(data,key)&&hasShape(data[key],reference[key]));
}

export function validateBalance(data){
  data=normalizeBalance(data);
  if(!hasShape(data,original))return 'Use a complete balance file with the expected fields and numeric values.';
  for(const {path,min,max,integer,step} of balanceFields){
    const value=balanceValue(data,path);
    if(!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))
      return path.join('.')+' must be '+(integer?'a whole number':'a number')+' from '+min+' to '+max+'.';
    if(step&&(value-min)%step) return path.join('.')+' must use increments of '+step+'.';
  }
  const {michael,slimes:{special},snake:{diagonalChase},frog}=data;
  if(michael.drain.bands.some((band,i,bands)=>i&&band.range<=bands[i-1].range))return 'Life Steal range bands must increase.';
  if(special.homing.trackingMs>special.homing.lifetime)return 'Homing tracking time cannot exceed projectile lifetime.';
  if(!(special.engageRange<=special.retreatRange&&special.retreatRange<=special.maxRange))
    return 'Slime ranges must follow engage ≤ retreat ≤ maximum.';
  if(diagonalChase.enterRatio>diagonalChase.exitRatio||diagonalChase.minLegMs>diagonalChase.maxLegMs)
    return 'Snake diagonal minimums must be at or below their maximums.';
  if(frog.leap.range>=frog.longLeap.range)return 'Long Leap must reach farther than Leaping Slam.';
  return '';
}

export function balanceChanges(saved,draft){
  return balanceFields.flatMap(field=>{
    const before=balanceValue(saved,field.path),after=balanceValue(draft,field.path);
    return before===after?[]:[{...field,before,after}];
  });
}
