# Michael HD arm correction — 2026-10-27

## Final alignment pass

`scripts/align-michael-frames.ps1` runs after the arm correction. It registers each direction's stable head/neck against its idle frame using integer translation only (maximum 1px horizontal, 4px vertical), then applies the exact same shift to every sprite and mask pixel in the cell. A common upward offset per direction avoids clipping soles. No resizing, redrawing, pose changes, timing changes or runtime logic changes. Idle and enlarged previews are regenerated too.

Backups: ignored `assets-drafts/character-customization/michael-before-frame-alignment.png` and `michael-before-frame-alignment-mask.png`. The registration manifest records every displacement and original hashes; its original `baseline: 143` describes initial foot registration. Final sole positions are recorded per frame in `postprocess.alignment.frames[].footBottom` (139–143), since aligning the upper body rigidly cannot also force all generated sole heights to match without distorting the pose. Every source/target pixel is checked with the inverse transform, rejecting clipping or changed opaque colors. Small variations in the drawn shapes themselves remain; this pass fixes placement only.

Applied the approved Yassin approach to Michael's front/down and back/up walking arms. Runtime files: `public/assets/characters/experimental/michael-level3-hd.png`, its `-preview.png`, `-material-mask.png` and registration manifest. Grid remains 6x4, 128x144 per frame; no runtime animation, skin selection or timing changes. Idle, both side directions, head/cigarette, legs and feet are preserved pixel-for-pixel.

Built-in image editing used the original Michael preview as the target and the approved Yassin preview as the arm-motion reference. Raw output and prompt are retained under ignored `assets-drafts/character-customization/michael-arms-raw.png` and `michael-arms-prompt.txt`. The raw sheet was transparently padded by 20px, then registered with the existing registration script, direction normalization, 128x144 cells and content height 132.

`scripts/register-michael-arm-swing.ps1` composites selected generated arm poses only. It alternates/mirrors opposing arms across the five walk poses, with a middle-height recovery; masks follow original denim and preserve its outline. Tiny disconnected pixels inside the modified regions are eligible for removal. Material labels are updated for the changed sleeves, keeping skin/ink fixed. Backups of both the original sheet and mask are retained as `michael-before-arm-fix.png` and `michael-mask-before-arm-fix.png` in the same draft directory.

Verified: 10,808 sprite pixels and 757 mask pixels changed, all inside arm cutouts. Browser preview and magenta-shirt recolor checked: no skin pixels changed by recoloring. Michael remains the existing Tier 3 skin; other characters were not modified by this correction.
