// All temporary art lives here; no movement or collision logic depends on it.
export function createPlaceholderTextures(scene) {
  if (scene.textures.exists('student')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const rect = (color, x, y, w, h) => g.fillStyle(color).fillRect(x, y, w, h);

  rect(0xdce1e4, 0, 0, 32, 32);
  rect(0xf0f2f3, 1, 1, 30, 30);
  rect(0xfafafa, 2, 2, 28, 1);
  rect(0xe4e8ea, 31, 0, 1, 32);
  g.generateTexture('floor', 32, 32);
  g.clear();

  // 32 × 56 silhouette: hair, face, jacket, trousers and shoes.
  rect(0x34444b, 5, 51, 24, 4);
  rect(0x28313f, 9, 39, 6, 14);
  rect(0x28313f, 18, 39, 6, 14);
  rect(0xe2e4d7, 8, 51, 8, 4);
  rect(0xe2e4d7, 18, 51, 8, 4);
  rect(0x345d71, 6, 23, 22, 20);
  rect(0x528a96, 8, 23, 17, 15);
  rect(0xdec19a, 3, 29, 4, 12);
  rect(0xdec19a, 27, 29, 4, 12);
  rect(0xf0cb9f, 8, 7, 18, 17);
  rect(0x45372f, 6, 3, 21, 8);
  rect(0x45372f, 6, 8, 4, 9);
  rect(0x45372f, 24, 8, 3, 7);
  rect(0x293540, 13, 14, 2, 3);
  rect(0x293540, 22, 14, 2, 3);
  rect(0xbd896e, 17, 21, 5, 2);
  g.generateTexture('student', 32, 56);
  g.destroy();
}
