# Office3 computer and safe

- `Notes/cofre` in `office3.tmj` defines the safe's floor footprint. Runtime artwork projects above it, with a static footprint collider and a one-second green indicator cycle. Position/size follow the authored marker.
- `office3Computer.js` is a fictional, case-insensitive filesystem (`dir`, `cd`, and explicit authored filenames). No shell execution or real filesystem access occurs. Joke text is editable here.
- `office3Safes` stores one persistent four-digit code per profile. Indexed profile/code lookups and insertion share a Convex transaction, preventing duplicate profile rows or duplicate codes on concurrent allocation. Four digits have a hard limit of 10,000 distinct profiles; exhaustion fails explicitly rather than reusing codes.
- The first completed computer quiz creates that row after five correct answers; its existence marks completion for the profile. Later visits require one correct answer. `challengeStatus` reads that marker after the paper password and `unlockComputer` validates the required answer count again.
- Safe requests validate profile token, active player/session and Office3 room. Five incorrect codes cause a 30-second cooldown. Computer shutdown persists a ten-second cooldown per profile. Guests cannot receive persistent rewards. No polling or scheduler was added.
- A direct generic item claim cannot bypass the safe. Existing owned keys are preserved. Normal inventory subscriptions still receive the reward, and the mutation also returns the public item for immediate UI update.
- Async overlay operations use an interaction generation to ignore late responses after closing/reopening. Game keyboard capture is disabled during the modal and restored on close.

## Artwork

`public/assets/maps/office3-safe.png`: two 128x144 RGBA frames (closed/open), with per-texture linear filtering. Global pixel-art settings stay unchanged. Generated using the built-in image tool, then cropped/registered and downsampled into equal runtime cells. The green pulse is drawn separately.

Generation prompt:

> Create a game sprite sheet with exactly TWO frames side by side in equal square cells, transparent background real alpha. A small dark slate grey digital office safe, 3/4 top-down view for a 2D RPG office, front faces down toward viewer, top visible, very little right side visible. LEFT frame CLOSED door with small digital keypad on upper right, small black indicator socket immediately beside keypad (green light will be rendered in code), simple handle. RIGHT frame same safe OPEN door hinged left outward, empty dark interior shelf, keypad remains on door. Consistent scale, identical safe body position in both equal cells, full object with padding no clipping. Clean softly shaded game prop, readable at 40 pixels tall, medium definition not chunky pixel art, no text, no floor, no ground shadow, no numbers outside keypad, no extra objects. Exactly two states closed and open. Metal rim, subtle blue grey highlights. Square safe body. Output landscape 2:1 sprite sheet.
