import { CHARACTERS } from './characters.js';

// Stable texture IDs travel over Presence, rather than the page-relative
// "level3Preview" selector. Both normal and test pages know every public variant.
const originals=new Map(CHARACTERS.map(c=>[c.id,c.experimentalVisual]));
export function registeredPreviewVisuals(character){
  if(!character)return [];
  // Retired V4/V5 files are not public runtime skins. Test pages may override
  // experimentalVisual while normal pages retain the registered base skin.
  const visuals=[originals.get(character.id),character.experimentalVisual];
  return [...new Map(visuals.filter(Boolean).map(v=>[v.sprite,v])).values()];
}
export function previewVisual(character,id){return registeredPreviewVisuals(character).find(v=>v.sprite===id);}
