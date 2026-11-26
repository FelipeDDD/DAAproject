import { JUMP_RADIUS,SLIME_SCALE,POISON_RADIUS } from './combatGeometry.js';
import { DEFAULT_AGGRO } from './combatAggro.js';
import balance from '../../combat/balance.json' with {type:'json'};
import { normalizeBalance } from '../../combat/balanceSchema.js';
import { scaleDamage } from '../../combat/damageScaling.js';

const poisonShot={speed:182,radius:POISON_RADIUS,lifetime:1250,kind:'poison',status:'Poisoned'};
const frostSlow={speed:0.5,ms:2300};
export const SLIME_SPECIAL={};
const basic={
  timingVariance:0.2,
  ...DEFAULT_AGGRO,
  size:1,scale:SLIME_SCALE,maxHp:100,step:40,chaseMs:690,recoverMs:340,speed:1,
  jumpName:'Jump Attack',jumpRange:116,jumpWindup:500,jumpMs:540,jumpCooldown:1920,
  contactCooldown:1000,
  jumpRadius:JUMP_RADIUS,accent:0xffca88,
  shot:poisonShot,shotRange:205,shotWindup:540,shotCooldown:1800,
};

export const SLIMES={
  slime:{...basic,label:'Poison Slime',hazard:'poison',special:{mode:'homing'}},
  frost:{...basic,label:'Frost Slime',hazard:'ice',accent:0xabf0ff,special:{mode:'spread'},
    palette:['#071831','#123461','#146e9a','#20adc6','#79e5f0','#befbff','#f6ffff'],
    jumpStatus:'Slowed',jumpSlow:frostSlow,
    shot:{...poisonShot,kind:'frost',speed:245,status:'Slowed',slow:frostSlow}},
  big:{...basic,label:'Big Slime',hazard:'unstable',scale:SLIME_SCALE*1.5,size:1.5,maxHp:180,accent:0xe7a5ff,
    special:{mode:'spread'},
    palette:['#1a0d32','#38204b','#622875','#9240aa','#c26adb','#f2a2f4','#fff0ff'],
    jumpRadius:41,jumpMs:690,chaseMs:860,jumpWindup:650,shotWindup:660,step:32,
    shot:{...poisonShot,kind:'glob',speed:147,radius:8,status:undefined}},
  swift:{...basic,label:'Swift Slime',hazard:'electric',scale:SLIME_SCALE*0.75,size:0.75,maxHp:60,
    special:{mode:'homing'},
    palette:['#322409','#5a3809','#996409','#e9aa16','#ffda35','#fff48a','#ffffe7'],accent:0xffe654,
    speed:1.6,zigzag:{amplitude:17,frequencyHz:1.15},jumpName:'Quick Jump',
    jumpRange:78,jumpWindup:400,jumpMs:315,jumpCooldown:1730,jumpRadius:22,
    jumpStatus:'Stunned',stunMs:1000,shot:null},
};

export function configureSlimeBalance({special,variants}){
  Object.assign(SLIME_SPECIAL,structuredClone(special));
  for(const [kind,{damagePercent,jumpDamage,projectileDamage,contactDamage,damage,recoil}] of Object.entries(variants)){
    const spec=SLIMES[kind];
    spec.damage=scaleDamage(jumpDamage,damagePercent);
    spec.contactDamage=scaleDamage(contactDamage,damagePercent);
    if(spec.shot)spec.shot={...spec.shot,damage:scaleDamage(projectileDamage,damagePercent)};
    // Replace the options so an existing summon retains the profile it spawned with.
    spec.special={...spec.special,damage:scaleDamage(damage,damagePercent),recoil};
  }
}

configureSlimeBalance(normalizeBalance(balance).slimes);
