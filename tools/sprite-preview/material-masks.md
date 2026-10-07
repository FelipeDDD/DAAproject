# Editable third-skin masks

Active masks live beside their spritesheets in `public/assets/characters/experimental/`:

- `felipe-level3-hd-material-mask.png` (user-edited; left untouched by the all-character extension)
- `sarina-level3-hd-material-mask.png` (hair, shirt, trousers, shoes)
- `michael-level3-hd-material-mask.png` (shirt, trousers, shoes)
- `yassin-felipe-walk-v1-material-mask.png` (Yassin: shirt, trousers, shoes)

All are RGBA PNGs at 768×576, 6×4 cells of 128×144. Red `#FF0000` = hair, green `#00FF00` = shirt, blue `#0000FF` = trousers, yellow `#FFFF00` = shoes. Transparent/non-label pixels stay fixed. Source alpha is always preserved. Use Pencil without smoothing in GIMP; export only the mask layer at the original size and reload the game. Masks are conservative starting points: fine hair edges, cloth seams or shoe boundaries can be refined manually. No automatic generator overwrites manual changes.

Michael/Sarina masks were initialized from the registered sheets' material colors and per-direction protected regions. Yassin reuses the earlier starter mask, with the raised side-view knees reassigned from shirt to trousers in the active runtime PNG. The earlier files under `tools/sprite-preview/` remain references; edit the public runtime PNGs for gameplay.

`src/art/characterRecolor.js` is the shared runtime path. Michael/Sarina/Yassin start with an empty palette, preserving original art; choosing a part applies only that part. Reset restores the original pixels. Felipe keeps its existing default test palette and shading. The bald characters expose no hair selector. The third-skin unlock/access flow is unchanged; DEV → All Skins can select it for testing. Palette choices stay local to the current game session and are not persisted or synchronized to peers.

## Yassin walking review

Yassin now uses `yassin-felipe-walk-v1.png` with five newly drawn walking poses at 10 FPS, based on Felipe. The matching new mask uses green shirt, blue trousers and yellow shoes; bald head, skin, glasses and darkest outlines remain fixed. The previous sheet/mask are preserved under `bald-glasses-level3-hd*`. These are conservative starter masks; refine material boundaries in GIMP if needed.
