import { baseCharacterId } from '../characters.js';

// Source sheets have six 362px columns with generous transparent padding.
// Phaser crops the same central strip from each column; the original PNGs stay untouched.
export const PLAYER_ATTACK_VISUALS=Object.freeze({
  michael:Object.freeze({
    id:'smoke',texture:'michael-smoke-attack',animation:'michael-smoke-ring',
    asset:'assets/attacks/zig-attack.png',frameWidth:362,frameHeight:324,frameTop:220,
    frames:6,frameRate:14,repeat:0,scale:0.11,forward:5,spin:0,
    offsets:Object.freeze({
      old:{down:[13,-40],left:[-18,-38],right:[18,-38],up:[13,-39]},
      new:{down:[17,-39],left:[-21,-37],right:[21,-37],up:[17,-39]},
      lungCrusher:{down:[24,-37],left:[-33,-37],right:[29,-37],up:[24,-38]},
    }),
  }),
  jassine:Object.freeze({
    id:'glasses',texture:'yassin-glasses-attack',animation:'yassin-glasses-spin',
    asset:'assets/attacks/glasses-attack.png',frameWidth:362,frameHeight:324,frameTop:220,
    frames:6,frameRate:12,repeat:-1,scale:0.10,forward:5,spin:Math.PI*2.5,
    // Dark tint removes the source sheet's bright blue/white highlights; alpha holes remain transparent.
    tint:0x171a20,
    offsets:Object.freeze({
      old:{down:[0,-45],left:[-12,-45],right:[12,-45],up:[0,-45]},
      new:{down:[0,-48],left:[-13,-47],right:[13,-47],up:[0,-48]},
    }),
  }),
  felipe:Object.freeze({
    id:'monster-attack1',texture:'felipe-monster-attack1',animation:'felipe-monster-attack1-fly',
    asset:'assets/attacks/felipe-monster-attack1.png',frameWidth:362,frameHeight:380,frameTop:185,
    frames:6,frameRate:12,repeat:-1,scale:0.11,forward:10,spin:0,
    offsets:Object.freeze({
      old:{down:[0,-31],left:[-10,-34],right:[10,-34],up:[0,-40]},
      new:{down:[0,-35],left:[-12,-38],right:[12,-38],up:[0,-44]},
    }),
  }),
});

export const PLAYER_ATTACK_VARIANTS=Object.freeze({
  sarina:Object.freeze([
    Object.freeze({
      id:'tiramisu-attack1',texture:'sarina-tiramisu-attack1',animation:'sarina-tiramisu-attack1-fly',
      asset:'assets/attacks/sarina-tiramisu-attack1.png',frameWidth:362,frameHeight:380,frameTop:185,
      frames:6,frameRate:12,repeat:-1,scale:0.11,forward:10,spin:0,
      offsets:Object.freeze({
        old:{down:[0,-31],left:[-10,-34],right:[10,-34],up:[0,-40]},
        new:{down:[0,-35],left:[-12,-38],right:[12,-38],up:[0,-44]},
      }),
    }),
    Object.freeze({
      id:'tiramisu-attack2',texture:'sarina-tiramisu-attack2',animation:'sarina-tiramisu-attack2-fly',
      asset:'assets/attacks/sarina-tiramisu-attack2.png',frameWidth:362,frameHeight:380,frameTop:185,
      frames:6,frameRate:12,repeat:-1,scale:0.11,forward:10,spin:0,
      offsets:Object.freeze({
        old:{down:[0,-31],left:[-10,-34],right:[10,-34],up:[0,-40]},
        new:{down:[0,-35],left:[-12,-38],right:[12,-38],up:[0,-44]},
      }),
    }),
  ]),
});

export function allPlayerAttackVisuals(){
  return [...Object.values(PLAYER_ATTACK_VISUALS),...Object.values(PLAYER_ATTACK_VARIANTS).flat()];
}

export function playerAttackVisual(characterId,random=Math.random){
  characterId=baseCharacterId(characterId);
  const variants=PLAYER_ATTACK_VARIANTS[characterId];
  if(variants?.length)return variants[Math.min(variants.length-1,Math.floor(Math.max(0,random())*variants.length))];
  return PLAYER_ATTACK_VISUALS[characterId]??null;
}

export function playerAttackSpawn(player,visual,direction){
  const offsets=visual.offsets[player.visual?.style]??visual.offsets.old;
  const [x,y]=offsets[player.facing]??offsets.down;
  return {x:player.x+x+direction.x*visual.forward,y:player.y+y+direction.y*visual.forward};
}
