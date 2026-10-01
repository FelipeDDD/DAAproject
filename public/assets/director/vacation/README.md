# Director vacation album

Copy the photos into this folder. The initial configuration expects:

- `endlich_ferien.png` — cover, caption: `Endlich ein bisschen Erholung.`
- `pisa.png`
- `beach.png`
- `tourist.png`
- `pool_office.png`
- `pigeons.png`
- `monkeys.png`

Images are not included yet. Missing photos show a friendly placeholder. PNG,
JPEG and WebP work; if you choose another filename/extension, change its `src` in
`src/office2/directorFiles.js`. Add/reorder entries in `DIRECTOR_VACATION_ALBUM.photos`
to extend the album. Each entry accepts `src`, `caption` and optional `filename`.
Only the currently displayed image is loaded, with its proportions preserved.

After the existing Director recovery unlock: **Open Director files**, `cd Private`,
then `open Endlich_Ferien.album`. `type` opens the nearby fictional text files.
Their editable contents are also in `directorFiles.js`; these are configuration
files, not writes to the user's disk. Gallery arrows/previous/next stay within
the first/last photo. Escape or Close returns to the inactive underlying terminal.
The terminal becomes active again on gallery close. Navigation makes no Convex calls.
