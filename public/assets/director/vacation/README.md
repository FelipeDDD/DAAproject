# Director vacation album

Runtime copies of assets-drafts/director-album, with originals retained:

1. cover.png — Endlich ein bisschen Erholung.
2. foto1.png
3. foto2.png
4. foto3.png
5. foto4.png
6. foto5.png
7. foto6.png

After Director recovery, choose Open Director files, then run:

    open Endlich Ferien.album

The album is at the root alongside Lost key.txt. The older
Private/Endlich_Ferien.album remains a compatible alias.

To add photos, copy them here and extend DIRECTOR_VACATION_ALBUM.photos in
src/office2/directorFiles.js. Entries accept src, optional caption and optional
filename. Only the selected photo loads, with its proportions preserved.
Previous/Next and arrow keys stay within the first/last photo. Escape/Close
restores terminal input. Missing images show a fallback.

Opening and navigating the album makes no Convex calls and does not activate
or alter the hidden-key investigation.
