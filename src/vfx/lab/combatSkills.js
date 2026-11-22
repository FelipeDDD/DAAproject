import { sequenceEffects } from './sequenceEffects.js';
import { LASH } from './precisionDemo.js';
import combatSheets from '../../../tools/vfx-lab/sheets/combat-pixelfx.json' with {type:'json'};

const slow=(percent,ms)=>({name:'Slowed',percent,ms});
const drainBands=[
  {range:40,damage:20,heal:20},
  {range:90,damage:15,heal:15},
  {range:150,damage:10,heal:10},
  {range:240,damage:5,heal:5},
];
const meteorSheet='pfx-combat-meteor';
const meteorFrames=combatSheets[meteorSheet].frameMs;
// PixelFX impact starts at 620 ms. Frame 13 is the first sample at or after impact.
const meteorImpactFrame=13;
const meteorFallMs=meteorFrames.slice(0,meteorImpactFrame).reduce((total,ms)=>total+ms,0);
const definitions={
  cleaver:{description:'Sweep through enemies in a short frontal arc.',icon:'pfx-cleave',shape:'arc',
    damage:24,range:48,cooldown:1700,cast:450},
  lash:{description:'Fixed reach. Only the whip tip hits, with a high critical chance on contact.',icon:'pfx-whip',shape:'tip',
    damage:10,critical:30,criticalChance:0.5,range:LASH.reach,radius:LASH.radius,cooldown:1200,cast:LASH.crackMs},
  drain:{description:'Closer hits deal more damage. Four returning orbs restore HP as they reach you.',
    iconSymbol:'blood-drop',shape:'ray',bands:drainBands,range:drainBands.at(-1).range,rayPadding:3,
    cooldown:3200,cast:sequenceEffects.drain.preparation.durationMs,castSpeed:0.3},
  flurry:{description:'Sweep nearby enemies with icy blades, slowing each enemy hit.',icon:'pfx-ice-daggers',shape:'arc',
    damage:18,range:32,cooldown:1700,cast:390,status:slow(30,1600)},
  fireball:{description:'Throw a fireball that explodes on contact or at maximum range.',icon:'blast',shape:'missile',
    damage:26,range:200,radius:29,missileRadius:5,speed:275,flight:'cinder',impact:'blast',cooldown:2400,cast:0},
  lance:{description:'Launch an ice shard that slows the first enemy struck.',icon:'shards',shape:'missile',
    damage:19,range:210,missileRadius:4,speed:325,flight:'icicle',impact:'shards',cooldown:2000,cast:0,status:slow(35,2000)},
  meteor:{description:'Mark a fixed patch of ground. The meteor hits every enemy inside on impact.',icon:'meteor',shape:'ground',
    damage:55,range:210,radius:35,cooldown:6500,cast:1690,
    meteor:{sheet:meteorSheet,fallMs:meteorFallMs,scale:1.22}},
};
export const SKILLS=Object.fromEntries(Object.entries(definitions).map(([id,data])=>{
  const effect=sequenceEffects[id];
  const clips=effect.variants[data.variant??'Original'];
  const visualMs=data.meteor?data.cast-meteorFallMs+meteorFrames.reduce((total,ms)=>total+ms,0):
    Math.max(...clips.map(c=>c.at+c.ms))+(effect.preparation?.durationMs??0);
  const impactMs=data.impact?clips.find(c=>c.sheet===data.impact).ms:undefined;
  return [id,{id,name:effect.label,effect,clips,visualMs,impactMs,...data}];
}));
export const SLOT_KEYS=['LMB','Q','E','R'];
export const DEFAULT_SLOTS=['cleaver','lash','drain','meteor'];

export function skillTooltip(skill){
  const effect=skill.status;
  const damage=skill.bands?['Distance from hand to target center · Damage / Max healing',
    ...skill.bands.map(band=>'≤ '+band.range+' px · '+band.damage+' / '+band.heal+' HP')]:
    ['Damage: '+skill.damage+(skill.critical?' · '+skill.critical+' critical ('+Math.round(skill.criticalChance*100)+'% on hit)':'')];
  return [skill.name,skill.description,...damage,
    'Range: '+Math.round(skill.range)+' px'+(skill.radius?' · Radius: '+skill.radius+' px':''),
    'Cooldown: '+skill.cooldown/1000+' s · Cast: '+(skill.cast?skill.cast/1000+' s':'instant'),
    ...(effect?['Effect: '+effect.name+' '+effect.percent+'% for '+effect.ms/1000+' s']:[]),
    ...(skill.castSpeed?['Movement during cast: −'+Math.round((1-skill.castSpeed)*100)+'%']:[]),
  ].join('\n');
}
