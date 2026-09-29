# Preserved Yassin sheets

Retained at the user's request, outside `public` so inactive art is not shipped with the game build.

- `yassin-brown-v1`: first generated brown cropped hair, re-registered from the unchanged original raw source.
- `yassin-black-v2`: exact copy of the active black-haired sheet before replacement with the approved subtle stubble version.

Each prefix has `.png` (768x576 runtime sheet), `-idle.png`, `-preview.png`, and `-registration.json` with the source hash and crop bounds. Layout: 6x4, 128x144 cells, down/left/right/up; column 0 idle, columns 1–5 walk at 10 FPS; world scale 0.5. No masks or runtime recolor.

Current active art remains `public/assets/characters/experimental/yassin-level3-hd.png` (v3). To reuse an archive later, reference its sheet through a public asset path and use the same frame configuration; do not use the enlarged preview as the runtime sheet.
