# Yassin third skin: bald character with glasses

As of 2026-10-08, the fifth selection card is **Felipe — TEST**, for testing the edited Felipe material mask. Yassin's bald/glasses skin is the third skin of the regular `jassine` base, available as **Skin test** in the wardrobe; it no longer adds a fifth selection card. No character identities or persistent unlocks are changed.

The Yassin descriptor is `src/experimental/yassinBaldSkin.js` (`wardrobePreview: true`). Sheet: `public/assets/characters/experimental/yassin-felipe-walk-v1.png`, 128×144 cells, 6×4, scale 0.5, five walk frames at 10 FPS. Directions: down/left/right/up. The animation preview uses that same descriptor. The active editable recolor mask is `public/assets/characters/experimental/yassin-felipe-walk-v1-material-mask.png`; the older copy under `tools/sprite-preview/` is a reference.

Retired V4/V5 variants are no longer registered/preloaded by normal gameplay: their public PNGs were already removed locally. Their separate legacy test-page descriptors are references only and require their original assets to be restored to run. Source/registration notes for the current art: `tools/sprite-preview/bald-glasses-generation.md`.
