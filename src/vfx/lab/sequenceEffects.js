import { SheetSequence } from './SheetSequence.js';
import { tuneEffects, pixelExperiments } from './curatedEffects.js';

const sheet=(name,at,ms,options={})=>({sheet:name,at,ms,...options});
const flight=(style,at,ms)=>({flight:style,at,ms,offset:[0,-12]});
const mark=(radius,color,ms)=>({mark:radius,color,at:0,ms,floor:true});
const arc=(at,ms,offset,fromOffset,seed)=>({arc:true,at,ms,offset,fromOffset,seed});
const length=clips=>Math.max(...clips.map(c=>c.at+c.ms));

function sequence(label,color,clips,alternatives={}){
  const durationMs=length(clips);
  const variants={Original:clips,...alternatives};
  return {
    label,color,variants,durationMs,aim:'pointer',castRangePx:224,
    timing:{mode:'playback',minMs:200,maxMs:8000,stepMs:10,hint:'Duration scales the whole sequence.'},
    create(scene,anchor,nearest,player,{settings={},random,captureAim,liveSettings=()=>settings}={}){
      const variant=settings.variant??this.defaultVariant;
      const tracks=this.buildClips?.[variant]?.(settings.areaRadiusPx)
        ??this.variants[variant]??this.variants.Original;
      const view=new SheetSequence(scene,tracks,anchor,player,nearest,random,captureAim,liveSettings);
      // Keep the effect-duration slider meaningful when a variant adds stages.
      const ratio=length(tracks)/durationMs;
      return {channeling:tracks.some(clip=>clip.holdBeam),update:ms=>view.update(ms*ratio),destroy:()=>view.destroy()};
    },
  };
}

const fire='#ff9b59',ice='#81d6f0',holy='#aae396',arcane='#bd9af0',storm='#93b8ff',poison='#b5d667';
const impact=sheet('blast',0,660,{scale:0.8});
const smoke=sheet('smoke',0,900);
const meteor=[mark(29,0xf69155,430),sheet('meteor',350,1750)];
const sword=[sheet('sweep',0,390,{offset:[0,-13]}),sheet('spark',125,240,{offset:[10,-14]})];
const chain=[arc(0,190,[0,-14]),arc(85,210,[32,-39],[0,-14],3),arc(170,220,[51,-7],[32,-39],6),
  sheet('spark',170,320,{offset:[51,-7],scale:0.7})];
const fireball=[flight('cinder',0,430),sheet('blast',430,940,{offset:[0,-12]})];
const quake=[mark(26,0xebc16e,220),sheet('quake',180,1320)];
const sanctuary=[sheet('pfx-heal-ring',0,2950,{scale:0.7}),sheet('pfx-bloom',800,3350,{scale:0.78}),
  sheet('litany',920,3950,{tint:0x8fd992,opacity:0.55,frames:[0.28,0.58],cycles:3,floor:true,fade:true}),
  ...[1600,3000].map(at=>sheet('pfx-heal',at,1950,{scale:0.7,fade:true})),
  {grovePulse:true,at:4850,ms:680}];
const gate=[sheet('litany',0,1500,{floor:true,scale:0.74}),sheet('gate',310,2050,{offset:[0,-19]})];
const cloud=[sheet('miasma',0,1900,{offset:[-10,0],drift:[13,-3]}),
  sheet('miasma',650,1900,{offset:[10,2],flip:true,scale:0.86,drift:[9,-6]})];
const thunder=[mark(31,0x909dfa,350),sheet('bolt',300,790,{offset:[-16,4]}),
  sheet('bolt',550,770,{offset:[20,-12],flip:true}),sheet('bolt',930,820,{offset:[4,5]})];

export const sequenceEffects={
  'fire-impact':sequence('Fire Impact',fire,[impact]),
  'ice-shards':sequence('Ice Shards',ice,[sheet('shards',0,460,{offset:[0,-10]})]),
  'hit-spark':sequence('Hit Spark',holy,[sheet('spark',0,300,{offset:[0,-12]})]),
  'smoke-burst':sequence('Smoke Burst','#bac1d3',[smoke],{Crosswind:[
    {...smoke,drift:[20,-4]},sheet('smoke',180,900,{offset:[12,0],drift:[32,-7],scale:0.7}),
  ]}),

  fireball:sequence('Fireball',fire,fireball,{Backdraft:[...fireball,sheet('ember',550,1650,{fade:true,cycles:2})]}),
  meteor:sequence('Meteor Strike',fire,meteor,{Shower:[...meteor,
    sheet('meteor',710,1250,{offset:[-25,-9],scale:0.68}),
    sheet('meteor',920,1340,{offset:[27,4],scale:0.76})]}),
  chain:sequence('Chain Lightning',storm,chain,{Fork:[...chain,arc(85,230,[-30,11],[0,-14],7),
    sheet('shards',215,290,{offset:[-30,11],scale:0.52})]}),
  slash:sequence('Sword Slash','#d9d5a6',sword,{'Cross cut':[...sword,
    sheet('sweep',210,400,{flip:true,offset:[0,-14]}),sheet('spark',350,240)]}),
  'shadow-strike':sequence('Shadow Strike',arcane,[
    sheet('rift',0,660,{scale:0.48,offset:[-8,-13]}),
    sheet('shade',210,370,{flip:true,offset:[0,-14]}),sheet('spirit',380,630,{scale:0.62}),
  ]),
  lance:sequence('Ice Lance',ice,[flight('icicle',0,310),sheet('shards',310,520,{scale:1.4,offset:[0,-12]})]),
  slam:sequence('Ground Slam','#ddaf73',quake,{Aftershock:[...quake,sheet('quake',720,1020,{scale:1.28,flip:true})]}),
  beam:sequence('Arcane Beam',arcane,[sheet('ray',0,1850,{beam:true,offset:[0,-14]})]),
  explosion:sequence('Explosion',fire,[sheet('blast',0,1150,{scale:1.4})],{Cluster:[
    sheet('blast',0,900),sheet('blast',190,750,{offset:[-23,6],scale:0.8}),
    sheet('blast',320,840,{offset:[26,-8]}),sheet('smoke',650,720,{scale:0.85}),
  ]}),
  'poison-shot':sequence('Poison Shot',poison,[flight('acid',0,480),
    sheet('venom',465,380,{scale:0.5,offset:[0,-12]}),sheet('miasma',520,1250,{scale:0.84})]),

  sanctuary:sequence('Healing Grove',holy,sanctuary,{'Ring & motes':[
    sheet('pfx-heal-ring',0,2950,{scale:0.7}),sheet('litany',750,3900,{tint:0x88da98,fade:true,floor:true}),
    sheet('blessing',1900,1900,{scale:0.72,fade:true,tint:0xaaffb0}),{grovePulse:true,at:4550,ms:680},
  ]}),
  portal:sequence('Summoning Portal',arcane,gate,{Apparition:[...gate,sheet('venom',900,1650,{drift:[0,-21],fade:true})]}),
  cloud:sequence('Poison Cloud',poison,cloud),
  tornado:sequence('Fire Tornado',fire,[sheet('cyclone',0,2300,{cycles:2,fade:true,scale:0.88})],
    {Roaming:[sheet('cyclone',0,2300,{cycles:2,fade:true,offset:[-25,0],drift:[50,-10]})]}),
  shield:sequence('Magic Shield',storm,[{ward:true,at:0,ms:2050,offset:[0,-20]},
    sheet('barrier',630,1040,{offset:[0,-20],scale:0.76})]),
  blizzard:sequence('Blizzard',ice,[sheet('snow',0,2600,{cycles:2,fade:true}),
    sheet('frost',1200,960,{scale:0.54,offset:[15,7]})]),
  spirits:sequence('Spirit Burst',arcane,[sheet('spirit',0,1100),sheet('shade',220,610,{scale:0.55,offset:[0,-16]})]),
  tempest:sequence('Lightning Storm',storm,thunder),
  vortex:sequence('Dark Vortex',arcane,[sheet('rift',0,2600,{offset:[0,-8]}),
    sheet('spirit',2250,630,{scale:0.6,offset:[0,-8]})]),
  ...pixelExperiments(sequence),
};
tuneEffects(sequenceEffects);
