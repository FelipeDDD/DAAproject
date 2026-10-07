# Bald character with glasses — normalized walk sheet

Built-in image generation, 2026-10-07. Approved anchor: assets-drafts/character-customization/bald-glasses-anchor-v1.png. Pose/style reference: felipe-walk-raw-v2.png. Raw iterations v1–v3 retained in assets-drafts. Final sheet uses raw v3.

- Sheet: 768x576; 6x4; 128x144 frames; down/left/right/up rows.
- Column 0: idle; columns 1–5: walking at 10 FPS (existing convention).
- Intended runtime scale: 0.5, giving 64x72 frame footprint.
- Feet baseline: 143. Max content height: 132. Nearest-neighbor registration and alpha cutoff 96, as existing skins.
- Per-direction uniform registration corrects the smaller generated back view; poses within each direction use the same scale (no per-frame stretching).
- Raw pose correction requested more distinct front/back opposite strides and lower profile knee lifts. Generation still has small natural pose variations; preview all directions before integrating.
- No game integration or replacement of existing skins.
- Preview: tools/sprite-preview/bald-glasses.html (also works directly from disk).

Regenerate from saved raw art:

powershell -NoProfile -File scripts/register-character-sheet.ps1 -Source assets-drafts/character-customization/bald-glasses-walk-raw-v3.png -OutputPrefix public/assets/characters/experimental/bald-glasses-level3-hd -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2 -NormalizeDirectionHeight

## Exact prompts

### Pass 1

Create exactly ONE transparent walking spritesheet: SIX columns by FOUR rows, 24 separate full-body sprites. Reference image 1 is the APPROVED bald character with rectangular dark-framed transparent glasses, warm skin, plain black short sleeve shirt, charcoal pants and black shoes: preserve his identity, face, glasses, clothing and proportions. Reference image 2 Felipe is ONLY the game's walk-pose layout, pixel-art finish and motion template; do not reproduce his hair, can or shirt symbol.
Art: clean high-resolution pixelated sprite art matching the references, restrained shading, crisp stepped outlines, consistent head and body size across ALL 24 frames. Entire scalp completely bald in every direction, no dark hairline or side hair, no beard. Glasses remain visible in side views but never two frontal lenses on a profile; no face/eyes/glasses lenses on the back view.
Exact rows: row 1 DOWN/front, row 2 LEFT/true profile, row 3 RIGHT/true profile, row 4 UP/back.
Exact columns: 1 idle (feet planted), 2 left-leg-forward contact with right arm forward, 3 left-support passing pose with RIGHT knee bent and raised, 4 right-leg-forward contact with left arm forward, 5 right-support passing pose with LEFT knee bent and raised, 6 recovery pose approaching the next left contact. Columns 2–6 must be five genuinely DISTINCT gait phases. No duplicated strides, no both legs moving together, no both arms held identical across all poses, no sideways kick or diagonal leg drift in the UP row. Legs move strictly toward/away from the viewer on front/back rows. Arms counter-swing naturally opposite the advancing leg. Keep each limb consistently attached, each foot distinct. Do not copy-paste the same walking pose 5 times.
Maintain SAME body height, head scale, stable head and torso alignment and grounded foot baseline in all frames, minimal/no vertical bounce. Side views have the SAME leg length and head height as front/back. Every frame has exactly two arms and two legs. No cloned extra legs, hands, detached parts.
Layout: 6 equally spaced columns and 4 equally spaced rows, landscape canvas approximately 4:3. Each isolated sprite fits inside its own cell with generous fully transparent gutters both horizontally and vertically. All head, hands and feet fully contained; NEVER touch or overlap neighbouring cells. Normalization later targets 128x144 per cell, 132px max character height and 64x72 game display at scale .5. Prioritize consistent proportions and clear motion.
Actual transparent background, no opaque or checkerboard background, no shadows, no floor, no text, numbers, borders, gridlines, props, extra poses or decorative elements.

### Pass 2

Edit the supplied 6x4 bald-with-glasses walking sprite sheet. Preserve the approved character, transparent background, exact SIX columns and FOUR rows, framing, character scale, bald head/glasses design and clothing.
CORRECTION: The existing walking legs repeat nearly identical lifts and the side views raise the knee too high, creating a marching hitch. Replace the walk limb poses with a smoother, low-lift walking cycle. ALL five walk columns must be distinct and alternate the supporting leg clearly. Never bend both legs identically. No sideways drifting feet on the back row.
Every row: column1 IDLE; column2 LEFT CONTACT (left leg forward grounded, right leg back, right arm forward); column3 LEFT SUPPORT / PASSING (left leg holds weight relatively straight, right knee gently bends travelling past, right heel lifted, arms nearer midline); column4 RIGHT CONTACT (opposite of column2, right leg forward grounded, left back, left arm forward); column5 RIGHT SUPPORT / PASSING (opposite of column3, right leg straight supports, left knee gently bends, left heel lifted); column6 LEFT RECOVERY (left leg extends toward the next forward contact but feet closer than col2, right foot trailing, right arm starts coming forward).
For DOWN/front row: left leg means character's anatomical left = viewer's right. Make cols2-3 visibly grounded on viewer's RIGHT shoe, cols4-5 visibly grounded on viewer's LEFT shoe. Avoid giving cols3/4/5 the same long/short leg pattern. For UP/back row, reverse viewer sides; retain true front-to-back stepping, NO side kick. Opposite arms must alternate which hand appears forward/down versus back/up.
For LEFT and RIGHT profile rows: preserve real sagittal walk. Near and far legs trade forward position, differentiate far limb with slightly darker shade. Passing feet barely clear the ground and knees stay below hip; don't lift knee to waist. Contact poses long enough to read, passing poses narrower. Frontmost arm must visibly swap from forward in column2 to back in column4, with mid positions on passing frames.
All heads the same scale and constant vertical line; torso and hips stable. Preserve consistent body height. All feet sit within their cells with transparent gutters. Subtle natural arm swing. Crisp high-resolution pixelated art as supplied. No text, no grid, no shadow, no additional props.

### Pass 3

Correct ONLY the walking legs/arms in the FIRST (front-facing) and FOURTH (back-facing) rows of this spritesheet. Keep the second and third profile rows unchanged. Keep 6 columns, 4 rows, transparency, outfit, bald head/glasses, exact scale and spacing.
Critical mechanical edit for ROW 1: replace the whole character pose in COLUMN 4 with a horizontally mirrored version of row1 COLUMN 2. Replace the whole character pose in COLUMN 5 with a horizontally mirrored version of row1 COLUMN 3. That means whichever shoe currently extends DOWN on the RIGHT in COLUMN 2 must extend DOWN on the LEFT in COLUMN 4. COLUMN 5 must likewise reverse column3's feet and hands. Columns 2 and 4 are OPPOSITE supporting legs, not same-leg duplicates. Columns 3 and 5 OPPOSITE passing legs.
Perform the same exact change for ROW 4 (back): COLUMN 4 is the horizontal mirror of COLUMN 2, COLUMN 5 is the horizontal mirror of COLUMN 3. The bald black-shirt character is symmetric, so these horizontal reversals preserve identity.
Column1 idle remains untouched in all rows; column6 retains a distinct recovery stance with feet nearly level and close together. No text, no lines, no extra rows/columns, no shadows or backgrounds. This is pose correction, not redesign.
