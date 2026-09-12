// Replace these texture keys with a loaded spritesheet to use authored door frames.
export function createDoorTextures(scene) {
  if (scene.textures.exists('door-closed')) return;
  const graphics = scene.make.graphics({}, false);
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 32, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(3, 2, 26, 28);
  graphics.fillStyle(0xa4bdcc).fillRect(6, 5, 20, 13);
  graphics.fillStyle(0x536c7b).fillRect(24, 23, 4, 2);
  graphics.generateTexture('door-closed', 32, 32);
  graphics.clear();
  graphics.fillStyle(0x536c7b).fillRect(12, 0, 8, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(14, 1, 4, 30);
  graphics.fillStyle(0x536c7b).fillRect(18, 24, 3, 2);
  graphics.generateTexture('door-closed-side', 32, 32);
  graphics.clear();
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 3, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(3, 0, 3, 32);
  graphics.generateTexture('door-open', 32, 32);
  graphics.clear();
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 32, 6);
  graphics.fillStyle(0xd7e2e8).fillRect(2, 1, 28, 3);
  graphics.fillStyle(0x31434f).fillRect(26, 4, 3, 2);
  graphics.generateTexture('door-open-right', 32, 32);
  graphics.clear();
  // A hinged leaf swings into the room, perpendicular to the closed doorway.
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 6, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(1, 2, 3, 28);
  graphics.fillStyle(0x31434f).fillRect(4, 26, 2, 3);
  graphics.generateTexture('door-open-south', 32, 32);
  graphics.clear();
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 12, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(2, 1, 8, 30);
  graphics.generateTexture('door-half-open', 32, 32);
  graphics.destroy();
}
