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
  graphics.fillStyle(0x536c7b).fillRect(0, 0, 3, 32);
  graphics.fillStyle(0xd7e2e8).fillRect(3, 0, 3, 32);
  graphics.generateTexture('door-open', 32, 32);
  graphics.destroy();
}
