import { objectsIn } from '../maps/tiledObjects.js';

// Match the six desk footprints authored in the classroom's Collision layer.
// The two central desks use tabletop 4; the others mix all four variants.
const DESK_VARIANTS = Object.freeze({
  'block-26-17': 1,
  'block-30-17': 4,
  'block-34-17': 2,
  'block-26-25': 3,
  'block-30-25': 4,
  'block-34-25': 1,
});

// Frames are tightly cropped from mesas-transparent.png, left to right.
const TABLETOP_FRAMES = Object.freeze([
  { x: 76, y: 98, width: 330, height: 665 },
  { x: 507, y: 98, width: 325, height: 663 },
  { x: 939, y: 98, width: 329, height: 665 },
  { x: 1368, y: 98, width: 331, height: 663 },
]);

export function classroomDeskPlacements(source) {
  return objectsIn(source, 'Collision')
    .filter((object) => Object.hasOwn(DESK_VARIANTS, object.name))
    .map((object) => ({
      id: object.id,
      name: object.name,
      variant: DESK_VARIANTS[object.name],
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
    }));
}

export function drawClassroomDesks(scene, source) {
  const texture = scene.textures.get('classroom-desks');
  TABLETOP_FRAMES.forEach((frame, index) => {
    if (!texture.has(index + 1)) texture.add(index + 1, 0, frame.x, frame.y, frame.width, frame.height);
  });

  for (const desk of classroomDeskPlacements(source)) {
    // The former white tabletops are empty Floor cells. Restore carpet under
    // their rounded edges without changing the authored collision rectangles.
    scene.add.tileSprite(desk.x, desk.y, desk.width, desk.height, 'school-tileset-0', 42)
      .setOrigin(0).setDepth(-1.95);

    const frame = TABLETOP_FRAMES[desk.variant - 1];
    const scale = Math.min(desk.width / frame.width, desk.height / frame.height);
    scene.add.image(desk.x + desk.width / 2, desk.y + desk.height / 2,
      'classroom-desks', desk.variant)
      .setScale(scale).setDepth(-1.8);
  }
}
