// Menu order, names and replaceable sprite assets. All sprites use a 32 x 56 canvas.
export const CHARACTERS = [
  { id: 'michael', name: 'Michael', sprite: 'character-michael', asset: 'assets/characters/michael.svg' },
  { id: 'jassine', name: 'Jassine', sprite: 'character-jassine', asset: 'assets/characters/jassine.svg' },
  { id: 'sarina', name: 'Sarina', sprite: 'character-sarina', asset: 'assets/characters/sarina.svg' },
  { id: 'felipe', name: 'Felipe', sprite: 'character-felipe', asset: 'assets/characters/felipe.svg' },
];
export const CHARACTER_STORAGE_KEY = 'daa-character-id';
export const characterById = id => CHARACTERS.find(c => c.id === id);
