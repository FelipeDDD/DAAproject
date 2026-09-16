// Tiled stores flip/rotation flags in the four highest bits of an object GID.
export const TILED_GID_MASK = 0x0fffffff;

export function tileObjectFrame(gid, tilesets) {
  const cleanGid = (gid >>> 0) & TILED_GID_MASK;
  for (let index = tilesets.length - 1; index >= 0; index -= 1) {
    const tileset = tilesets[index];
    if (cleanGid < tileset.firstgid) continue;
    const frame = cleanGid - tileset.firstgid;
    if (tileset.tilecount !== undefined && frame >= tileset.tilecount) return null;
    return { tilesetIndex: index, frame };
  }
  return null;
}
