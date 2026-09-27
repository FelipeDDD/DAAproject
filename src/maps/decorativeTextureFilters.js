// These high-resolution props are authored as one-image Tiled tilesets. Keep
// linear sampling scoped to their individual texture atlases; all pixel-art
// textures continue using the renderer's global nearest-neighbor setting.
export const SMOOTH_DECORATIVE_TILESETS = new Set([
  'modern-beer-cans',
  'modern-desk-plant',
  'modern-sandwiches',
  'modern-coffee-cups',
]);

export function applySmoothDecorativeTextureFilters({ tilesets, textureManager, textureKeyPrefix, linearFilter }) {
  const filteredKeys = [];

  tilesets.forEach((tileset, index) => {
    if (!SMOOTH_DECORATIVE_TILESETS.has(tileset.name)) return;

    const textureKey = `${textureKeyPrefix}${index}`;
    const texture = textureManager.get(textureKey);
    texture.setFilter(linearFilter);
    filteredKeys.push(textureKey);
  });

  return filteredKeys;
}
