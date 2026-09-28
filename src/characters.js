// Menu order, names and replaceable sprite assets. All sprites use a 32 x 56 canvas.
const ORIGINAL_CHARACTERS = [
  {
    id: 'michael', name: 'Michael', sprite: 'character-michael', asset: 'assets/characters/michael.svg',
    newVisual:{sprite:'character-michael-new',asset:'assets/characters/michael-new.png',previewAsset:'assets/characters/michael-new-preview.png',
      // Include feet-together poses between the source sheet's extended steps.
      walkColumns:{left:[0,2,3,1,4,5],right:[0,2,3,1,4,5]},
    },
    // The cigarette extends far beyond Michael's body in the side views.
    // This wider canvas is visual only; Player keeps the same foot hitbox.
    lungCrusherVisual:{sprite:'character-michael-lung-crusher',asset:'assets/characters/michael-bigzig-normalized.png?v=2',frameWidth:96,frameHeight:72},
  },
  {
    id: 'jassine', name: 'Yassin', sprite: 'character-jassine', asset: 'assets/characters/jassine.svg',
    newVisual:{sprite:'character-yassin-new',asset:'assets/characters/yassin-new.png?v=2',previewAsset:'assets/characters/yassin-new-preview.png?v=2'},
  },
  {
    id: 'sarina', name: 'Sarina', sprite: 'character-sarina', asset: 'assets/characters/sarina.svg',
    newVisual:{sprite:'character-sarina-new',asset:'assets/characters/sarina-new.png',previewAsset:'assets/characters/sarina-new-preview.png'},
  },
  {
    id: 'felipe', name: 'Felipe', sprite: 'character-felipe', asset: 'assets/characters/felipe.svg',
    newVisual:{sprite:'character-felipe-new',asset:'assets/characters/felipe-new.png',previewAsset:'assets/characters/felipe-new-preview.png'},
    experimentalVisual:{sprite:'character-felipe-level3-hd-recolor-v1',recolorSource:'character-felipe-level3-hd-preview',asset:'assets/characters/experimental/felipe-level3-hd.png',
      previewAsset:'assets/characters/experimental/felipe-level3-hd-idle.png',frameRate:10,
      frameWidth:128,frameHeight:144,scale:0.5,
      walkColumns:{down:[1,2,3,4,5],left:[1,2,3,4,5],right:[1,2,3,4,5],up:[1,2,3,4,5]},
    },
  },
];
export const CHARACTERS = ORIGINAL_CHARACTERS;
// Preview cards reuse a real base. They never introduce a fifth class or claim ID.
export function characterMenuOptions(includeExperiments=false){
  const options=CHARACTERS.map(c=>({c,label:c.name,previewStyle:null}));
  if(includeExperiments)for(const c of CHARACTERS.filter(c=>c.experimentalVisual)){
    options.push({c,label:`${c.name} · Skin test`,previewStyle:'level3Preview'});
  }
  return options;
}
export const CHARACTER_STORAGE_KEY = 'daa-character-id';
export const CHARACTER_STYLE_STORAGE_KEY = 'daa-character-style';
export const baseCharacterId = id => {
  if(ORIGINAL_CHARACTERS.some(character=>character.id===id))return id;
  const legacyBase=typeof id==='string'?id.replace(/-(?:2|3)$/,''):id;
  return ORIGINAL_CHARACTERS.some(character=>character.id===legacyBase)?legacyBase:id;
};
export const characterById = id => ORIGINAL_CHARACTERS.find(c => c.id === baseCharacterId(id));
export const characterBaseIdFor = player => player?.characterBaseId
  ?? baseCharacterId(player?.characterId ?? player?.playerId);
