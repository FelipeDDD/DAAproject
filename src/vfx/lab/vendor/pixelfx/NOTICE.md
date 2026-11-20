# Notices

**Hugo Duprez.** `src/core/sim.js` and the effects that say so at the top of their file adapt Sprite Fusion's
open-source pixel art VFX (https://www.spritefusion.com/pixel-art-vfx), Copyright (c) 2026 Hugo Duprez, MIT License.

**Hollow Crown.** `src/core/act.js` adapts how Hollow Crown plays its skills (poses on 12 fps steps, hit-stops, the springy
straw target), from
https://github.com/rehan-remade/hollow-crown, Copyright (c) 2026 rehan-remade, MIT License.

**Patch Pixel.** The font in `gallery/fonts` is Patch's own and is not covered by this repository's MIT license. See
`gallery/fonts/NOTICE.md`.

## DAAproject VFX Lab

This subset is pinned to [PixelFX commit 5294518ce7c72e48b6100a744596e0acf57f2826](https://github.com/patch-gg/pixelfx/tree/5294518ce7c72e48b6100a744596e0acf57f2826).
It keeps the painter, renderer, simulation and fire modules needed by the lab.
DAAproject narrowed the core exports, removed the stock actor from FX setup and
adapted `fire/fire-ring` for a circular ground plane and a 192 × 192 frame.
The gallery, its font, sample actors and background are not distributed here.

The lab also adapts `fire/campfire` and `fire/spirit-flame` from the same commit.
Campfire keeps the flame, ember and smoke recipes with reduced height and removes
logs, coals and gallery lighting. Spirit Flame grounds and shortens the wisps,
with smaller glows and particles. The lab composes both loops over circular
ground patches. The original effect source files retain Hugo Duprez's credits.

The lab uses `fire/fireball` from the same commit as the projectile animation.
DAAproject positions, scales and rotates the original right-facing effect for top-down flight.

Healing Ground adapts the circular wave, green palette and beveled plus signs of
`holy/heal-aoe`; `fx/holy/plus.js` extracts the original plus and palette from
`holy/_lib.js` with its credits. Frost Ground adapts `ice/frost-nova`'s cold
palette, radial wave and faceted crystals, without its character poses.
Both use the original band, crystal or sparkle drawing helpers and position
their details on a circular ground plane. The persistent timing and particle
cycles are DAAproject adaptations.
