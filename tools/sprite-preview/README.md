# Third-skin prototypes

All four third skins now support wardrobe recoloring; see [editable material masks](material-masks.md) for the active PNGs and manual-edit instructions. Yassin now uses a newly drawn Felipe-referenced gait, five steps at 10 FPS; see [generation and registration](yassin-felipe-walk.md).

## Michael and Yassin tests

Yassin's current third skin is the new bald character with glasses (`yassin-felipe-walk-v1.png`). It is available as **Skin test** from the regular Yassin wardrobe, without an extra character-selection card. Earlier brown/black drafts remain in [archive/yassin](archive/yassin/README.md). Retired V4/V5 public sheets are no longer preloaded by normal gameplay.

Michael and Yassin test skins now appear through **Dev Tools → All Skins** and the wardrobe after selecting their regular bases. Both use the approved B anchors: fully bald Michael and a slightly slimmer face for Yassin. Same 24-frame layout, 128x144 frame size, 0.5 scale and 10 FPS as the other experiments. Editable recolor masks are now available. The four real bases and their ownership are unchanged; these are local-only visual previews.

Open `/tools/sprite-preview/` through Vite to compare the four experiments and inspect each walking pose. Current sheets/previews are `public/assets/characters/experimental/michael-level3-hd*.png` and `yassin-felipe-walk-v1*.png`. Prompts and registration details: [michael-yassin-generation.md](michael-yassin-generation.md).

## Sarina test

Sarina's Skin test is available through **Dev Tools → All Skins** for the regular Sarina base. She retains her normal profile/class identity, with only a local appearance override. Sarina now has an editable hair/clothing mask.

The new sheet uses Felipe's approved poses/style, with brown curly hair, purple shirt and blue trousers from the current Sarina reference. Both have the same 128x144 frames at 0.5 scale, 24 frames in down/left/right/up order, idle in column 0 and walking columns 1–5 at 10 FPS. The normalizer uses uniform scale and foot baseline 143. The comparison page includes her new and Remastered versions.

Runtime artifacts: `public/assets/characters/experimental/sarina-level3-hd.png`, `-idle.png`, `-preview.png`, and `-registration.json`. Raw source: ignored `assets-drafts/character-customization/sarina-walk-raw-v1.png`. Rebuild:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/register-character-sheet.ps1 -Source assets-drafts/character-customization/sarina-walk-raw-v1.png -OutputPrefix public/assets/characters/experimental/sarina-level3-hd -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2
```

## Try it

Run `npm run dev`. Select Felipe normally, then click **All Skins** in Dev Tools to activate the third skin. The wardrobe can switch among Classic, Remastered and Skin test. The override survives room changes and appearance restoration, but is not saved as an unlock or sent to other players. Selection has the four real bases plus a fifth **Felipe — TEST** preview card.

For a backend-free animation comparison, open `http://localhost:5173/tools/sprite-preview/`. All four directions animate beside the existing Remastered art; pause, step or adjust FPS. This page is a development tool, not a production build entry.

## Runtime recolor test

Felipe's test skin applies the fixed `FELIPE_TEST_PALETTE` from `src/art/felipeRecolor.js`: chestnut hair, teal shirt, light gray trousers and burgundy shoes. The wardrobe thumbnail shows the original HD PNG. In game, `createCharacterAnimations` first prepares a derived canvas texture from the loaded source, registers the same 128x144 frames, then creates its animations. The texture manager caches this result across scenes; no per-frame recoloring or Convex requests are added.

The active Felipe mask is `public/assets/characters/experimental/felipe-level3-hd-material-mask.png`, exported ONLY from the `felipe-material-mask.png` layer of the user-edited `Downloads/felipe-level3-hd-teste.xcf`. It replaces generated boundaries for the 24-frame HD skin. Red = hair, green = shirt, blue = trousers, yellow = shoes; transparent/non-label pixels remain fixed. Edit without smoothing and export the mask alone at 768×576; never flatten it with the source sprite. The old coordinate-based mask remains as a fallback for tools calling the recolor helper without a PNG mask. Recoloring modifies RGB only, retaining original alpha, positions and shading. These masks are specific to this source sheet and are not a general segmentation algorithm. Another sheet will need its own reviewed masks. The wardrobe has a local color picker. Persistent palettes, skin-tone changes and multiplayer palette synchronization remain deferred. The preview's **Test colors** checkbox compares the original and recolored frames using the exact runtime function.

## Assets and registration

- Approved reference: `assets-drafts/character-customization/felipe-anchor-v1.png`.
- Corrected raw source: `assets-drafts/character-customization/felipe-walk-raw-v2.png`.
- Runtime: `public/assets/characters/experimental/felipe-level3-hd.png` (768 x 576, 128 x 144 per frame, scale 0.5).
- Menu thumbnail: `felipe-level3-hd-idle.png` (128 x 144).
- Enlarged sheet: `felipe-level3-hd-preview.png` (1536 x 1152).
- Registration report: `felipe-level3-hd-registration.json` (source SHA-256, crop bounds, shared scale and anchors).
- First 64 x 72 prototype and its report remain under `felipe-level3.*` for comparison. HD is registered from the same raw source, not enlarged from this low-resolution PNG. Its world-space frame and collision dimensions stay the same.

Rows: down, left, right, up. Column 0 is idle; columns 1–5 form the experimental five-pose walk at 10 FPS. Existing sheets retain their current frame sequences and speed.

The image-generation tool produced the raw art. A second generation corrected repeated wide strides in the side views with bent-knee passing poses. Registration detects isolated row/column bands rather than assuming perfectly even generated cells, uses one scale for the entire sheet, centers the head to avoid accessory-induced jitter, samples with nearest neighbor and aligns the lowest sole to the last frame row (y=143 for HD). Original skin PNGs remain unchanged. Registration cannot fix anatomical errors or imperfect gait timing. The current source has simple facial features; NPC-level facial detail would require a separate art revision, not just higher registration resolution.

Rebuild on Windows (draft sources are ignored by Git; copy the raw source to another PC first):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/register-character-sheet.ps1 -Source assets-drafts/character-customization/felipe-walk-raw-v2.png -OutputPrefix public/assets/characters/experimental/felipe-level3-hd -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2
```

The normalizer rejects missing frames, touching crop boundaries and overflowing output. It does not generate poses or scale each frame independently. The source PNG remains flattened and unchanged; the runtime material mask produces the recolored test texture. This is not yet a third wardrobe unlock.

## Exact generation prompt (built-in image tool)

Create an animation inspection sprite sheet from the ONLY attached approved Felipe character anchor. Exactly 24 full-body sprites, in a rigid evenly spaced grid of SIX columns and FOUR rows. Transparent background with real alpha; no fake checkerboard, shadows on floor, grid lines, labels or text. Landscape canvas with approximately 6:5 aspect ratio. Each of the 24 equal cells contains exactly one complete character, fully isolated with generous padding on every side. No cropped head/foot, no overlapping neighboring sprites.

IDENTITY: faithfully preserve the anchor's long straight black hair, warm skin, black T-shirt with small white pi emblem on the FRONT only, charcoal trousers, separate dark shoes, small green-black drink can carried in the character's LEFT hand (viewer right in front view). Hair reaches below shoulders but must not cover legs/knees. Same face and head size throughout. Back view shows back of hair and shirt, NO face, NO front emblem. Side views must be true side-facing profiles, with recognizable nose profile and trailing long hair.

ROWS STRICTLY:
row 1 DOWN, looking towards viewer in every cell.
row 2 LEFT, facing screen left in every cell.
row 3 RIGHT, facing screen right in every cell.
row 4 UP, back towards viewer in every cell.
No mixed directions within a row.

COLUMNS STRICTLY:
column 1 neutral standing idle with separate feet and relaxed arms.
columns 2–6 five DISTINCT consecutive walking poses covering ONE COMPLETE loop: first leg forward contact; first passing/recovery; opposite leg forward contact; opposite passing/recovery; closing step returning smoothly to first contact. Both legs alternately swing in opposite phase. Leg separation and readable shoes are the top priority. In front/back views use foreshortening, alternating knees/foot height, not a sideways slide. In side views use clear forward/back stride, bent knee passing pose, alternating forward leg. Do not duplicate the same planted pose across columns. Two legs and two feet only, never overlapping ghost limbs.

Use the SAME character scale, head dimensions, torso proportions and horizontal BODY CENTER within each cell throughout the whole sheet. Anchor the torso/head consistently, with no vertical body bounce. All ground contact soles share a consistent baseline in each row; a lifted foot may be above that baseline. Avoid expanding/shrinking hair between frames. Arms swing subtly with opposite legs and the can stays in the same anatomical hand.
Clean pixel art with crisp deliberate square clusters and restrained 3–4-tone shading per material, practical for later reduction to 64x72 per cell. Preserve separable hair, shirt, trousers, shoes, exposed skin, fixed eyes/emblem/can. Same dark neutral palette as the anchor. This is a raw inspection sheet for subsequent precise programmatic registration, not a mockup. All 24 isolated sprites must remain fully inside their own evenly spaced cell.

## Exact correction prompt (built-in image tool)

Edit this existing Felipe spritesheet. Preserve its exact SIX-column FOUR-row layout, character design, scale, spacing, transparent alpha background, all directions, and the entire FIRST (front) and FOURTH (back) rows. Preserve all 24 complete isolated sprites. This is a specific animation correction to rows TWO and THREE only:
Their walk cycle has too many repeated wide-stride silhouettes. Replace ONLY the LEG POSES in columns THREE and FIVE (1-based columns) of both side-facing rows with proper PASSING poses. In these passing poses the supporting leg is nearly straight below the hip; the other leg has a visibly bent knee and the lifted foot passes close to the supporting ankle, clearly OFF the ground. Legs are close together in those two columns, not spread. Column THREE and FIVE should have opposite legs as the supporting leg. Keep columns TWO and FOUR as opposite extended contact strides, and SIX as recovery. The side-row sequence should visibly alternate spread stride -> close bent-knee pass -> opposite spread stride -> close bent-knee pass -> recovery.
Keep the top of the head, hair, head size, torso height, hips and ground baseline stationary across these frames. Do not change frontal/back sprites, faces, emblem, palette, or add anything. Keep complete feet inside their cells with generous margins. Do not add motion blur or duplicate legs. Crisp pixel-art edges and true transparent background.

