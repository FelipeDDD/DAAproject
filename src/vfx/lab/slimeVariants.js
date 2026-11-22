import { JUMP_RADIUS,SLIME_SCALE,POISON_RADIUS } from './combatGeometry.js';
import { DEFAULT_AGGRO } from './combatAggro.js';

const poisonShot={speed:182,radius:POISON_RADIUS,lifetime:1250,damage:16,kind:'poison',status:'Poisoned'};
const frostSlow={speed:0.5,ms:2300};
export const SLIME_SPECIAL={
  engageRange:140,retreatRange:170,retreatHysteresis:10,maxRange:360,retreatMs:450,windupMs:550,recoilMs:300,
  cooldown:6200,sharedCooldown:1050,
  homing:{speed:220,turnRate:1.75,lifetime:1700},
  spread:{speed:260,angle:0.34,lifetime:1500},
};
const basic={
  timingVariance:0.2,
  ...DEFAULT_AGGRO,
  special:{mode:'homing',damage:16,recoil:34},
  size:1,scale:SLIME_SCALE,maxHp:100,step:40,chaseMs:690,recoverMs:340,speed:1,
  jumpName:'Jump Attack',jumpRange:116,jumpWindup:500,jumpMs:540,jumpCooldown:1920,
  contactDamage:6,contactCooldown:1000,
  jumpRadius:JUMP_RADIUS,damage:24,accent:0xffca88,
  shot:poisonShot,shotRange:205,shotWindup:540,shotCooldown:1800,
};

export const SLIMES={
  slime:{...basic,label:'Poison Slime',hazard:'poison'},
  frost:{...basic,label:'Frost Slime',hazard:'ice',accent:0xabf0ff,special:{mode:'spread',damage:16,recoil:34},
    palette:['#071831','#123461','#146e9a','#20adc6','#79e5f0','#befbff','#f6ffff'],
    jumpStatus:'Slowed',jumpSlow:frostSlow,
    shot:{...poisonShot,kind:'frost',speed:245,damage:15,status:'Slowed',slow:frostSlow}},
  big:{...basic,label:'Big Slime',hazard:'unstable',scale:SLIME_SCALE*1.5,size:1.5,maxHp:180,accent:0xe7a5ff,
    special:{mode:'spread',damage:20,recoil:26},
    palette:['#1a0d32','#38204b','#622875','#9240aa','#c26adb','#f2a2f4','#fff0ff'],
    damage:36,jumpRadius:41,jumpMs:690,chaseMs:860,jumpWindup:650,shotWindup:660,step:32,contactDamage:10,
    shot:{...poisonShot,kind:'glob',speed:147,radius:8,damage:25,status:undefined}},
  swift:{...basic,label:'Swift Slime',hazard:'electric',scale:SLIME_SCALE*0.75,size:0.75,maxHp:60,
    special:{mode:'homing',damage:12,recoil:42},
    palette:['#322409','#5a3809','#996409','#e9aa16','#ffda35','#fff48a','#ffffe7'],accent:0xffe654,
    speed:1.6,zigzag:{amplitude:17,frequencyHz:1.15},jumpName:'Quick Jump',
    jumpRange:78,jumpWindup:400,jumpMs:315,jumpCooldown:1730,jumpRadius:22,
    damage:17,jumpStatus:'Stunned',stunMs:1000,contactDamage:4,shot:null},
};
