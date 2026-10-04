# Three separate wall tiles — experimental

Open school-walls-3.tsx in Tiled. Atlas school-walls-3.png is exactly 96x32 RGBA,
three 32x32 cells, zero margin/spacing. The unused part of the vertical cell is
transparent. Individual tile-0/1/2.png and enlarged preview.png are also supplied.

0 = horizontal; 1 = corner connecting east and south; 2 = vertical, left-aligned.
Place horizontal to the RIGHT of the corner, vertical BELOW the corner. Use
Tiled horizontal/vertical flip for other orientations; do not rotate the beige
face to create a vertical wall. No collision or Wang set is assigned.

Generated with built-in image_gen from school-walls-generated-v3.png. Prompt:
three separate equal-cell horizontal/corner/vertical pieces; cream plaster,
pale-blue cap, navy skirting, transparent unused cell area; not a closed room.
Generated source retained at assets-drafts/tilesets/school-walls-three-source.png.
Export registration used nearest-neighbor sampling into exact 32x32 cells.
This is a first small visual test kit, not a complete interior/exterior wall set.
No live map changes. Prefer classroom-wall-lab.tmj for testing.
