import { sequenceEffects } from './sequenceEffects.js';
import { LASH } from './precisionDemo.js';
import balance from '../../combat/balance.json' with {type:'json'};
import { METEOR_ART_MS, METEOR_FALL_MS, METEOR_SHEET } from '../../combat/meteorTiming.js';

const definitions={
  cleaver:{description:'Sweep through enemies in a short frontal arc.',icon:'pfx-cleave',shape:'arc'},
  lash:{description:'Fixed reach. Only the whip tip hits, with a high critical chance on contact.',icon:'pfx-whip',shape:'tip'},
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
}

configureCombatSkills(balance.michael);
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
