import { CHARACTERS } from './characters.js';
import { YASSIN_BALD_TEST_VISUAL } from './experimental/yassinBaldSkin.js';
import { YASSIN_PROPORTION_TEST_VISUAL } from './experimental/yassinProportionTestSkin.js';

// Stable texture IDs travel over Presence, rather than the page-relative
// "level3Preview" selector. Both normal and test pages know every public variant.
const originals=new Map(CHARACTERS.map(c=>[c.id,c.experimentalVisual]));
const yassinV4={...YASSIN_BALD_TEST_VISUAL,sprite:'character-yassin-proportions-v4-test',
  asset:'assets/characters/experimental/yassin-proportions-v4.png',
  previewAsset:'assets/characters/experimental/yassin-proportions-v4-idle.png'};
export function registeredPreviewVisuals(character){
  if(!character)return [];
  const visuals=[originals.get(character.id),character.experimentalVisual,
    ...(character.id==='jassine'?[YASSIN_BALD_TEST_VISUAL,yassinV4,YASSIN_PROPORTION_TEST_VISUAL]:[])];
  return [...new Map(visuals.filter(Boolean).map(v=>[v.sprite,v])).values()];
}
export function previewVisual(character,id){return registeredPreviewVisuals(character).find(v=>v.sprite===id);}
