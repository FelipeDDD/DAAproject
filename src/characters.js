// Menu order, names and replaceable sprite assets. All sprites use a 32 x 56 canvas.
export const CHARACTERS = [
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
  },
];
export const CHARACTER_STORAGE_KEY = 'daa-character-id';
export const CHARACTER_STYLE_STORAGE_KEY = 'daa-character-style';
export const characterById = id => CHARACTERS.find(c => c.id === id);
