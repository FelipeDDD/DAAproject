// Only a layer named Collision creates map collision. Visual layers are ignored.
export function addMapCollision(scene, map, player) {
  // Collision is now an object layer with axis-aligned rectangles.
  const objects = map.getObjectLayer('Collision');
  if (!objects) return null;
  const rectangles = scene.physics.add.staticGroup();
  for (const area of objects.objects) {
    if (area.rotation || area.ellipse || area.polygon || area.polyline || area.gid || area.point) {
      throw new Error('Collision: use tiles ou retângulos sem rotação.');
    }
    const zone = scene.add.zone(area.x, area.y, area.width, area.height).setOrigin(0);
    rectangles.add(zone);
  }
  scene.physics.add.collider(player, rectangles);
  return rectangles;
}
