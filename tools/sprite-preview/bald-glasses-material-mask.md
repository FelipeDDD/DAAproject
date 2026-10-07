# Editable starter mask — Yassin test / bald glasses

Source: public/assets/characters/experimental/bald-glasses-level3-hd.png
Mask: bald-glasses-material-mask.png (768x576; 6x4 cells of 128x144).

Material labels match the Felipe mask export:
- #00FF00: shirt
- #0000FF: trousers
- #FFFF00: shoes
- #FF0000: reserved for hair; unused on this bald character
- Transparent: fixed/original pixels (skin, eyes, glasses, outlines and background)

This is a starter mask for manual refinement. Head is protected; garment boundaries and lifted shoes are traced per frame. Dark outlines and skin-adjacent edges are intentionally excluded.

GIMP: open the original sheet, open the mask as a layer, paint exact labels with Pencil (no antialiasing), and erase to protect pixels. Keep 768x576 and do not rescale. Save the layered work as XCF; export only the mask layer back to PNG.

bald-glasses-material-mask-overlay.png is only a visual comparison, NOT a mask for editing/export. The game does not load these PNGs yet.
