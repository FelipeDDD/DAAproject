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
});

export function playerAttackVisual(characterId){return PLAYER_ATTACK_VISUALS[characterId]??null;}

export function playerAttackSpawn(player,visual,direction){
  const offsets=visual.offsets[player.visual?.style]??visual.offsets.old;
  const [x,y]=offsets[player.facing]??offsets.down;
  return {x:player.x+x+direction.x*visual.forward,y:player.y+y+direction.y*visual.forward};
}
