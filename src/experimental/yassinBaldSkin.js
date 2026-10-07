// Third skin for the regular Yassin base; no separate character-selection card.
export const YASSIN_BALD_TEST_VISUAL=Object.freeze({
  wardrobePreview:true,
  // Build opposite back-facing leg poses from columns 1/2 when registering.
  normalizeUpStride:true,
  sprite:'character-yassin-bald-glasses-test',
  recolorSource:'character-yassin-bald-glasses-original',
  recolorMaskSource:'character-yassin-bald-glasses-material-mask',
  recolorMaskAsset:'assets/characters/experimental/yassin-felipe-walk-v1-material-mask.png',
  recolorParts:['shirt','trousers','shoes'],
  materialColors:{shirt:'#242525',trousers:'#363737',shoes:'#2e3030'},
  asset:'assets/characters/experimental/yassin-felipe-walk-v1.png',
  previewAsset:'assets/characters/experimental/yassin-felipe-walk-v1-idle.png',
  frameWidth:128,frameHeight:144,scale:0.5,frameRate:10,
  // Registered poses based on Felipe: idle in column 0, five walk frames.
  walkColumns:{down:[1,2,3,4,5],left:[1,2,3,4,5],right:[1,2,3,4,5],up:[1,2,3,4,5]},
});
