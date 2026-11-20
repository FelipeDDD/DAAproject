import { SKILL_DEFAULTS } from '../../pvp/skills/config.js';
import { FireZoneView } from '../../pvp/skills/views/fire-zone/FireZoneView.js';
import { PixelFxView } from './PixelFxView.js';
import { CastingFlash, CastingSparks } from './CastingSparks.js';
import { CampfireGround } from './CampfireGround.js';
import { PersistentGroundView } from './PersistentGroundView.js';
import { healingGround } from './healingGround.js';
import { frostGround } from './frostGround.js';
import { groundFire } from './groundFire.js';
import * as fireRing from './vendor/pixelfx/fx/fire/fire-ring.js';
import * as spiritFlame from './vendor/pixelfx/fx/fire/spirit-flame.js';

const zone=SKILL_DEFAULTS['fire-zone'];
const defaultCastRange=zone.maxRangeTiles*zone.tileSize;
const groundFireDuration=5000;
export const LAB_HOTBAR_SLOTS=Object.freeze([
  'fire-zone','fire-ring','campfire-ground','spirit-ground','healing-ground','frost-ground',
]);

function persistentGroundFire(label,source,count,spread){
  const effect=groundFire(source,{count,spread});
  return {
    label,
    durationMs:groundFireDuration,
    aim:'pointer',
    castRangePx:defaultCastRange,
    timing:{mode:'sustain',minMs:500,maxMs:10000,stepMs:100,
      hint:`Default: ${groundFireDuration} ms · flames loop at normal speed.`},
    create:(scene,anchor,nearest)=>new PixelFxView(scene,effect,anchor,nearest),
  };
}

function persistentArea(label,style,{castRangePx,areaRadiusPx,durationMs}){
  return {
    label,
    durationMs,
    aim:'pointer',
    aimPreview:true,
    castRangePx,
    areaRadius:{defaultPx:areaRadiusPx,minPx:32,maxPx:160,stepPx:8},
    timing:{mode:'sustain',minMs:500,maxMs:10000,stepMs:100,
      hint:'Effect Duration starts after the area finishes expanding.'},
    create(scene,anchor,nearest,_player,{durationMs=this.durationMs,settings={}}={}){
      const {minPx,maxPx,defaultPx}=this.areaRadius;
      const radius=Math.round(Math.min(maxPx,Math.max(minPx,settings.areaRadiusPx??defaultPx)));
      return new PersistentGroundView(scene,anchor,nearest,style,radius,durationMs);
    },
  };
}

export const LAB_EFFECTS=Object.freeze({
  // Candidate for a one-shot fire burst skill. Sustained ground fire is a separate effect.
  'fire-ring':{
    label:'PixelFX Fire Ring',
    durationMs:fireRing.meta.duration*1000,
    aim:'pointer',
    castRangePx:defaultCastRange,
    timing:{mode:'playback',defaultMs:3000,minMs:500,maxMs:8000,stepMs:50,
      hint:`Original: ${fireRing.meta.duration*1000} ms · changes playback speed.`},
    preparation:{
      durationMs:1500,
      create:(scene,anchor,_nearest,player)=>new CastingSparks(scene,player,anchor),
      release:{durationMs:85,create:(scene,anchor,_nearest,player)=>new CastingFlash(scene,player,anchor)},
    },
    create:(scene,anchor,nearest)=>new PixelFxView(scene,fireRing,anchor,nearest,{reach:zone.radius}),
  },
  'fire-zone':{
    label:'Current Fire Zone',
    durationMs:zone.telegraphMs+zone.durationMs,
    timing:{mode:'sustain',minMs:250,maxMs:10000,stepMs:50,leadMs:zone.telegraphMs,
      hint:`Original: ${zone.durationMs} ms active · ${zone.telegraphMs} ms telegraph stays fixed.`},
    create(scene,anchor){
      const preview={...anchor,radius:zone.radius,phase:'telegraph',activeAt:zone.telegraphMs};
      const view=new FireZoneView(scene,preview);
      return {
        update(elapsedMs){
          if(elapsedMs>=preview.activeAt)preview.phase='active';
          view.render(preview,elapsedMs);
        },
        destroy(){view.destroy();},
      };
    },
  },
  'campfire-ground':{
    label:'Campfire Ground',
    durationMs:groundFireDuration,
    aim:'pointer',
    castRangePx:256,
    areaRadius:{defaultPx:80,minPx:32,maxPx:160,stepPx:8},
    projectileEnabled:true,
    timing:{mode:'sustain',minMs:500,maxMs:10000,stepMs:100,
      hint:'Effect Duration starts once the fire has spread.'},
    create(scene,anchor,nearest,player,{durationMs=this.durationMs,settings={}}={}){
      const {minPx,maxPx,defaultPx}=this.areaRadius;
      const radius=Math.min(maxPx,Math.max(minPx,settings.areaRadiusPx??defaultPx));
      return new CampfireGround(scene,player,anchor,nearest,{
        radius,holdMs:durationMs,projectileEnabled:settings.projectileEnabled??this.projectileEnabled,
      });
    },
  },
  'spirit-ground':persistentGroundFire('Spirit Ground',spiritFlame,8,43),
  'healing-ground':persistentArea('Healing Ground',healingGround,{
    castRangePx:160,areaRadiusPx:64,durationMs:3000,
  }),
  'frost-ground':persistentArea('Frost Ground',frostGround,{
    castRangePx:160,areaRadiusPx:72,durationMs:4000,
  }),
});
