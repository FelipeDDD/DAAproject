# Yassin bald skin — slot 5 preview

Open `/` or `/yassin-skin-test.html` and choose **Yassin — TEST**, the fifth card.
Both the normal development server and the shared test build include this card.
There are still four real character bases; slot 5 is a visual option for Yassin.
The approved v3 descriptor is also Yassin's current third-skin preview in the
character catalog. Original character image files are preserved.

The card joins using the real `jassine` character base and the existing
profile/guest session flow. It applies this placeholder locally through the
existing experimental visual path. Other players continue seeing the normal
published Yassin skin. Selecting one of the four normal cards clears the local
preview through the original character selection flow.

`src/experimental/yassinSkinTestEntry.js` now imports the normal entry directly.
The menu and texture/animation loaders share the character catalog, without
prototype overrides. The descriptor's `menuPreview: true` adds its menu card and
loads its texture/animations even when DEV tools are disabled. Other experimental
skins still require DEV mode. This does not enable DevTools on the shared build
or change server identity, movement, physics or collision rules.

`src/experimental/yassinBaldSkin.js` holds the placeholder's texture descriptor.
The current HD v3 sheet has six columns and four rows (down, left, right, up),
128x144 cells, 24 frames, scale 0.5 and 10 FPS, matching the other third skins.
Column 0 is idle; columns 1 through 5 are the walk cycle. Registration anchors
feet at row pixel 143 and uses one uniform scale across all poses, with maximum
content height 118 so the smaller head is not enlarged back to the old height.
The frame occupies the same 64x72 world space as before,
and the original feet collision dimensions are preserved.

Current assets are `public/assets/characters/experimental/yassin-bald-slot5-hd-v3*`:
the source generated sheet, registered sheet, idle preview, enlarged preview
and registration JSON. The visual content was generated with the built-in
imagegen tool exclusively from the approved
`assets-drafts/yassin-head-proportions-preview.png`. The rejected yellow/large-head
sheets were not references for v3. A subsequent edit of that output adds passing
poses to the side-view walk cycles. The original sheets and earlier placeholders
remain available under their original names.
The existing registration script only fits and aligns the generated frames.
Generation instructions are in `yassin-bald-slot5-hd-v3-prompt.txt` beside this
document. Reload `/yassin-skin-test.html` to select the updated slot 5.

The normal Vite build includes both preview HTML pages, and `vite.test.config.js`
inherits those entries. Rebuild the shared frontend after changes; the Vite
preview server reads the updated files without a restart. Previously these URLs
were absent from the shared build and returned the old main page via SPA fallback.

Open `/yassin-animation-preview.html` for all four animated directions together.
It reads the same test descriptor and frame order as the game. Pause or scrub
the frames to inspect the hands and feet. Hand movement remains subtle and is
not claimed to be a fully corrected hand-authored walk cycle.

Set `menuPreview: false` in the descriptor to hide the temporary fifth card.
The character's Classic and Remastered assets remain independent of this preview.
