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

export function drawClassroom(scene, map) {
  const tile = map.tileSize;
  const width = map.columns * tile;
  const height = map.rows * tile;
  scene.add.tileSprite(0, 0, width, height, 'floor').setOrigin(0).setDepth(-2);
  const g = scene.add.graphics().setDepth(-1);
  const rect = (color, x, y, w, h) => g.fillStyle(color).fillRect(x, y, w, h);

  for (const wall of map.walls) {
    const x = wall.x * tile;
    const y = wall.y * tile;
    const w = wall.width * tile;
    const h = wall.height * tile;
    rect(0xcbd2d7, x, y, w, h);
    rect(0xffffff, x + 2, y + 2, w - 4, h - 7);
    rect(0xe7ebed, x + 2, y + h - 8, w - 4, 4);
    rect(0xb9c3ca, x, y + h - 4, w, 4);
  }

  // Open door: a threshold and frame, with no body blocking the passage.
  const door = map.doorway;
  const dx = door.x * tile;
  const dy = door.y * tile;
  rect(0xe3e8eb, dx, dy, door.width * tile, tile);
  rect(0xaebbc4, dx - 3, dy, 3, tile);
  rect(0xaebbc4, dx + door.width * tile, dy, 3, tile);
  rect(0xc6ced4, dx, dy + tile - 2, door.width * tile, 2);

  for (const desk of map.desks) {
    const x = desk.x * tile;
    const y = desk.y * tile;
    const w = desk.width * tile;
    const h = desk.height * tile;
    const furniture = scene.add.graphics().setDepth(y + h);
    const part = (color, px, py, pw, ph) => furniture.fillStyle(color).fillRect(px, py, pw, ph);
    part(0xd6dde1, x + 3, y + 4, w, h);
    part(0xa8b4bd, x, y, w, h);
    part(0xffffff, x + 2, y + 2, w - 4, h - 7);
    part(0xe2e7eb, x + 2, y + h - 6, w - 4, 4);
    // Monitor, stand and keyboard, all deliberately simple placeholders.
    part(0x40505c, x + 28, y + 5, 40, 23);
    part(0xb7dce9, x + 31, y + 8, 34, 17);
    part(0xdceff5, x + 34, y + 11, 19, 2);
    part(0x7c8c97, x + 45, y + 28, 6, 4);
    part(0x7c8c97, x + 37, y + 31, 22, 3);
    part(0xc3ccd2, x + 29, y + 36, 38, 7);
    part(0xf8f9fa, x + 32, y + 38, 32, 2);
    part(0x9aa9b3, x + 74, y + 36, 5, 7);
  }
}
