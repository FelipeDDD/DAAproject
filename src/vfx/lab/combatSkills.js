import { sequenceEffects } from './sequenceEffects.js';
import { LASH } from './precisionDemo.js';
import balance from '../../combat/balance.json' with {type:'json'};
import { normalizeBalance } from '../../combat/balanceSchema.js';
import { METEOR_ART_MS, METEOR_FALL_MS, METEOR_SHEET } from '../../combat/meteorTiming.js';
import { FIRE_RING_ART_MS,FIRE_RING_ART_CHARGE_MS } from './fireRingVisual.js';
import { SENTRY_SHEET } from './proximityDemo.js';
export { SLOT_KEYS } from '../../combat/skillCatalogSchema.js';

export const BURN_TICK_MS=1000;

const definitions={
  cleaver:{description:'Sweep through enemies in a short frontal arc.',icon:'pfx-cleave',shape:'arc'},
  lash:{description:'Fixed reach. Aim the whip tip at the center of an enemy for a chance to crit.',icon:'pfx-whip',shape:'tip'},
  drain:{description:'Closer hits deal more damage. Four returning orbs heal up to the HP actually removed.',
    iconSymbol:'blood-drop',shape:'ray'},
  flurry:{description:'Sweep nearby enemies with icy blades, slowing each enemy hit.',icon:'pfx-ice-daggers',shape:'arc'},
  fireball:{description:'Throw a fireball that explodes on contact or at maximum range.',icon:'blast',shape:'missile',
    flight:'cinder',impact:'blast'},
  lance:{description:'Launch an ice shard that slows the first enemy struck.',icon:'shards',shape:'missile',
    flight:'icicle',impact:'shards'},
  meteor:{description:'Mark a fixed patch of ground. The meteor hits every enemy inside on impact.',icon:'meteor',shape:'ground',
    meteor:{sheet:METEOR_SHEET,fallMs:METEOR_FALL_MS,scale:1.22}},
};
export const SKILLS={};

export function configureCombatSkills(config){
  for(const [id,data] of Object.entries(definitions)){
    const effect=sequenceEffects[id];
    const settings=structuredClone(config[id]);
    if(settings.bands)settings.range=settings.bands.at(-1).range;
    if(settings.status)settings.status.name='Slowed';
    const clips=effect.variants.Original.map(clip=>clip.precision==='tip'?
      {...clip,reach:settings.range,radius:settings.radius}:clip);
    // Impact markers use the original art clock. Retiming the preparation
    // stage keeps the authored contact frame aligned with gameplay damage.
    const artImpactMs=id==='lash'?LASH.crackMs:clips.find(clip=>clip.contact)?.at;
    const artLength=Math.max(...clips.map(clip=>clip.at+clip.ms));
    const visualMs=data.meteor?settings.cast-METEOR_FALL_MS+METEOR_ART_MS:
      artLength+(effect.preparation?settings.cast:artImpactMs===undefined?0:settings.cast-artImpactMs);
    const impactMs=data.impact?clips.find(clip=>clip.sheet===data.impact).ms:undefined;
    SKILLS[id]={id,name:effect.label,effect,clips,visualMs,impactMs,artImpactMs,...data,...settings};
  }
  const ring=structuredClone(config['fire-ring']);
  SKILLS['fire-ring']={...ring,id:'fire-ring',name:'Fire Ring',sandboxOnly:true,icon:'blast',
    description:'Build heat while slowing down. Release a ring of fire from your current position.',
    effect:{color:'#ff9a55'},clips:[],shape:'self-area',rampCastSpeed:true,
    visualMs:ring.cast+FIRE_RING_ART_MS-FIRE_RING_ART_CHARGE_MS};
  const tesla=config.tesla,effect=sequenceEffects.tesla;
  SKILLS.tesla={...tesla,id:'tesla',name:effect.label,sandboxOnly:true,icon:SENTRY_SHEET,effect,
    description:'Place a coil that automatically shocks nearby enemies.',
    shape:'sentry',reaction:'Electrified',clips:[{sheet:SENTRY_SHEET}],visualMs:tesla.cast+tesla.durationMs};
  SKILLS['healing-parry']={
    ...structuredClone(config['healing-parry']),id:'healing-parry',name:'Healing Parry',sandboxOnly:true,shape:'parry',
    description:'Stand still and block direct hits. Heal once based on the total damage blocked.',
    effect:sequenceEffects.shield,icon:'barrier',clips:[],castSpeed:0,
  };
}

configureCombatSkills(normalizeBalance(balance).michael);
export const DEFAULT_SLOTS=['cleaver','lash','drain','meteor'];

export function skillTooltip(skill){
  if(skill.parry){
    const {activeMs,blockFraction,healFraction,maxHeal,recoveryMs,recoveryDamageMultiplier}=skill.parry;
    return [skill.name,skill.description,
      activeMs+' ms guard · '+Math.round(blockFraction*100)+'% block · '+Math.round(healFraction*100)+'% healing (max '+maxHeal+' HP)',
      'Miss: '+recoveryMs+' ms recovery · +'+Math.round((recoveryDamageMultiplier-1)*100)+'% incoming damage',
      'Cooldown: '+skill.cooldown/1000+' s'].join('\n');
  }
  const effect=skill.status;
  const damage=skill.bands?['Distance from hand to target center · Damage / Max healing',
    ...skill.bands.map(band=>'≤ '+band.range+' px · '+band.damage+' / '+band.heal+' HP')]:
    ['Damage: '+skill.damage+(skill.critical?' · '+skill.critical+' critical ('+Math.round(skill.criticalChance*100)+
      '% on '+(skill.shape==='tip'?'precision hit':'hit')+')':'')];
  const reach=skill.shape==='self-area'?'Radius: '+skill.radius+' px':
    'Range: '+Math.round(skill.range)+' px'+(skill.radius?' · Radius: '+skill.radius+' px':'');
  return [skill.name,skill.description,...damage,reach,
    'Cooldown: '+skill.cooldown/1000+' s · Cast: '+(skill.cast?skill.cast/1000+' s':'instant'),
    ...(effect?['Effect: '+effect.name+' '+effect.percent+'% for '+effect.ms/1000+' s']:[]),
    ...(skill.burning?['Burning: '+skill.burning.damage+' HP every '+BURN_TICK_MS/1000+' s for '+skill.burning.ms/1000+' s']:[]),
    ...(skill.shape==='sentry'?['Discharges on each target every '+skill.targetCooldownMs/1000+' s for '+skill.durationMs/1000+' s']:[]),
    ...(skill.rampCastSpeed?['Movement during cast: 100% → '+Math.round(skill.castSpeed*100)+'%']:
      skill.castSpeed?['Movement during cast: −'+Math.round((1-skill.castSpeed)*100)+'%']:[]),
  ].join('\n');
}
