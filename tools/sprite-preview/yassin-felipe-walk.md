# Yassin — Felipe walking reference (2026-10-08)

Built-in image generation/edit tool, then existing registration script. This is a generated pose adaptation, not a pixel-identical copy of Felipe's legs. First attempt retained excessive knee lift and was rejected; second used Felipe as master pose sheet.

Final prompt:
> COMPOSITING EDIT. Image 1 is the master target spritesheet. Keep image 1 walking poses EXACTLY: same legs, trousers, shoes and feet, same silhouettes and positions frame by frame. Do NOT redesign the legs. Replace only Felipe's long-haired head with the bald black-glasses man's head from image 2, and remove the green accessory from his shirt/hand. Image 2 supplies HEAD IDENTITY ONLY, absolutely not legs or walking poses. Master image 1 lower body must be preserved. 24 sprites in same 6 columns x4 rows grid as image 1, rows front,left,right,back. First col idle, next5 walk. Black shirt, grey trousers, black shoes. Bald head, glasses. Transparent alpha background. Same consistent small game sprite scale/proportions, straight modest Felipe walking gait, no high knees. Do not copy image2 leg poses. No labels, no extra rows, no cropped feet. Preserve image1's pose variation exactly.

Inputs: public/assets/characters/experimental/felipe-level3-hd.png and bald-glasses-level3-hd.png.
Raw output: assets-drafts/character-customization/yassin-felipe-walk-v1-raw.png (draft directory may be Git-ignored).
Runtime output: public/assets/characters/experimental/yassin-felipe-walk-v1.png and matching -idle.png / -preview.png / -registration.json / -material-mask.png.

Registration command:

    powershell -NoProfile -File scripts/register-character-sheet.ps1 -Source assets-drafts/character-customization/yassin-felipe-walk-v1-raw.png -OutputPrefix public/assets/characters/experimental/yassin-felipe-walk-v1 -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2 -NormalizeDirectionHeight

Uniform scaling within each direction; common head axis and sole baseline143. No runtime size or collision changes. Five walk frames at10FPS, idle column0. Original version preserved. Editable mask conservatively classifies neutral clothing below the head; fine boundaries can be refined manually, without overwriting Felipe's mask.

Validation: all24 frames isolated and baseline143, 45 focused skin/recolor/appearance tests passing, Vite build. Static frame inspection performed; live in-game appearance still needs user review.
