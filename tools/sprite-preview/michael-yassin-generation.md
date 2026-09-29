# Michael and Yassin third-skin generation

Built-in image generation, 2026-09-29. User approved option B of each character, with Michael completely bald (side shading is skin), and a slightly slimmer face for Yassin. Reference 1 is the corresponding approved `assets-drafts/character-customization/<name>-anchor-b.png`; reference 2 is `sarina-walk-raw-v1.png` for style/layout/gait only. No recolor masks.

Raw outputs are kept in ignored `assets-drafts/character-customization/<name>-walk-raw-v1.png`. Registered sheets, idle thumbnails, enlarged previews and source-hash registration reports are in `public/assets/characters/experimental/`. No per-frame stretching or pose substitutions. The new generation requests narrower foot lanes and equal cadence for the rear walk; Sarina is unchanged. Animation quality still needs the user's in-game review.

## Registration

**Current Yassin version: v3, subtle stubble.** User approved `yassin-anchor-soft-stubble-v2.png`: warm scalp visible between understated darker gray dots, no opaque gray/black hair cap. Generated `yassin-walk-raw-v3.png` from that anchor plus the original v1 walk sheet, then registered with the same command below using v3 as source. Current uniform scale 0.507692307692308. Runtime asset paths, frame dimensions, baseline, FPS and hitbox are unchanged. Brown v1 and black v2 registered sheets, thumbnails, previews and reports are archived in `tools/sprite-preview/archive/yassin/` and linked from the comparison page. Historical prompts/settings below remain for reproducibility.

Historical black v2: built-in image editing changed the hair palette across all 24 frames; source is `assets-drafts/character-customization/yassin-walk-raw-v2.png`. This version has been superseded by v3 and preserved in the archive. The original v1 draft is also retained.

For each name (`michael`, `yassin`):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/register-character-sheet.ps1 -Source assets-drafts/character-customization/<name>-walk-raw-v1.png -OutputPrefix public/assets/characters/experimental/<name>-level3-hd -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2
```

Uniform registration scale: Michael 0.507692307692308, corrected Yassin v2 0.501901140684411; sole baseline 143. Both use a 768x576 sheet, 6x4 frames. Down/left/right/up, first column idle, remaining five columns walk at 10 FPS. World scale 0.5, unchanged foot hitbox. Dev-only cards 7/8 reuse real Michael/Yassin bases (Yassin's internal ID remains `jassine`); the override is local, not a networked/equipped skin.

## Exact Yassin hair correction prompt

### Current v3 generation

Create a new corrected full walk sprite sheet using reference1 as the EXACT APPROVED Yassin character identity and scalp appearance, reference2 as the EXACT 24-frame walk layout/poses/body and clothing template. Apply reference1's extremely close shaved scalp to ALL 24 sprites in reference2. Hair is sparse tiny soft charcoal/taupe-gray dots against mostly visible WARM SKIN, very faint gray shadow only, just emerging like one-day stubble. Zero hair volume. Match reference1 exactly: NO opaque gray cap, NO solid black cap, NO brown full buzz cut, NO totally bald scalp. Preserve slender face, black glasses, bright blue short sleeved shirt, blue jeans, black shoes and all proportions. No facial beard. Preserve reference2's readable walk poses and pixelated clean high-resolution style and consistent body size across directions. EXACTLY 6 columns x4 rows with transparent alpha background, generous clear gutters, no shadows, text, grid or extra frames. Row1 DOWN/front; row2 LEFT profile; row3 RIGHT profile; row4 UP/back no face. Column1 idle, columns2-6 five sequential distinct walking poses contact/passing/opposite contact/opposite passing/recovery. Stable torso/head height, same foot baseline, narrow parallel foot lanes especially on rear walk, no sideways foot sliding or extra bounce. Full bodies and feet entirely inside cells, no overlap. Landscape canvas about6:5. Generate ONLY this single 24-frame spritesheet.

### Historical v2 black hair edit

Edit this exact 24-frame character spritesheet. Change ONLY the light brown buzz-cut HAIR color to BLACK in every frame including the back of the head, keeping the same very short cropped hairstyle, same silhouette and fine texture. Hair palette black/near-black with subtle dark charcoal highlights so it still reads as hair. Preserve skin tone, black glasses, blue shirt and trousers, shoes, facial features, ALL walk poses, anatomy, pixel detail, positions, scale, cell spacing and 6-column 4-row layout exactly. No new hairstyles, no longer hair, no added volume, no beard. Preserve actual transparent alpha background, no opaque background or checkerboard, no text or extra frames. This is solely a hair palette correction on an existing game animation sheet, not a redesign.

## Exact michael prompt

Create a production raw walk spritesheet for ONE character. Image1 is the approved character identity anchor. Image2 Sarina is ONLY the style, body proportion, overall height and 24-frame layout reference, NOT the hair/clothes identity. Clean high-resolution pixelated RPG game art with crisp small clusters and restrained detailed shading, not huge coarse pixels. Match anchor identity in all directions.
EXACTLY 6 columns x4 rows, 24 isolated FULL BODY sprites on genuine transparent alpha background, no ground shadows, no labels, no visible grid, no extra images. Generous transparent gutters on all four sides of every sprite. Landscape canvas roughly 6:5. All frames equal anatomical scale, stable head/torso height, clear arms and separate legs/feet, no cut-offs, no overlap.
Row1 DOWN/front. Row2 LEFT true profile. Row3 RIGHT true profile. Row4 UP/back with no face. Column1 idle with both feet grounded. Columns2–6 FIVE distinct successive walking cycle poses, naturally flowing contact/passing/opposite contact/opposite passing/recovery, alternating legs and counter-swinging arms, readable bent knees and lifted heels. Do not use five repeated broad strides. Keep head body proportions and clothes identical across frames.
IMPORTANT UP WALK IMPROVEMENT: rear walking has SAME lively step cadence and leg excursion as front walk, feet track two narrow parallel lanes beneath hips, no horizontal foot drift/skating/splayed legs. Alternate fore/aft foreshortening, show lifted sole of rear foot on passing poses. Stable planted-foot ground baseline.
Michael: completely BALD scalp on TOP, SIDES and BACK, no hairline, NO side hair or stubble patches. Use warm skin shadows, not brown hair on sides. Preserve approved anchor B face with brown eyebrows, small angular nose, slim build, charcoal black short-sleeved T-shirt, medium blue jeans, black shoes. Small normal cigarette at corner of mouth in front and side views; omit detached smoke so silhouette stays compact. No cigarette in rear view where occluded. No beard. Keep same friendly expression and head silhouette except eliminate all apparent hair.

## Exact yassin prompt

Create a production raw walk spritesheet for ONE character. Image1 is the approved character identity anchor. Image2 Sarina is ONLY the style, body proportion, overall height and 24-frame layout reference, NOT the hair/clothes identity. Clean high-resolution pixelated RPG game art with crisp small clusters and restrained detailed shading, not huge coarse pixels. Match anchor identity in all directions.
EXACTLY 6 columns x4 rows, 24 isolated FULL BODY sprites on genuine transparent alpha background, no ground shadows, no labels, no visible grid, no extra images. Generous transparent gutters on all four sides of every sprite. Landscape canvas roughly 6:5. All frames equal anatomical scale, stable head/torso height, clear arms and separate legs/feet, no cut-offs, no overlap.
Row1 DOWN/front. Row2 LEFT true profile. Row3 RIGHT true profile. Row4 UP/back with no face. Column1 idle with both feet grounded. Columns2–6 FIVE distinct successive walking cycle poses, naturally flowing contact/passing/opposite contact/opposite passing/recovery, alternating legs and counter-swinging arms, readable bent knees and lifted heels. Do not use five repeated broad strides. Keep head body proportions and clothes identical across frames.
IMPORTANT UP WALK IMPROVEMENT: rear walking has SAME lively step cadence and leg excursion as front walk, feet track two narrow parallel lanes beneath hips, no horizontal foot drift/skating/splayed legs. Alternate fore/aft foreshortening, show lifted sole of rear foot on passing poses. Stable planted-foot ground baseline.
Yassin: preserve approved anchor B identity, but subtly narrow cheeks and jaw to make face a little slimmer, not round/chubby. Close cropped light brown buzz cut with fine texture, black rectangular glasses, blue short-sleeved T-shirt, blue jeans, black shoes. Slim build, warm skin, no beard, no accessories. Keep glasses present on front and sides, only visible temples as appropriate on back, no eyes/face on rear view.

