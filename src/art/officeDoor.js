import { objectsIn } from '../maps/tiledObjects.js';
import { readMapTransitions } from '../maps/transitions.js';

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 44;

export function officeDoorPlacement(source) {
  const transition = readMapTransitions(source).find((item) => item.targetMap === 'office2');
  if (!transition) return null;

  const note = objectsIn(source, 'Notes').find((item) => item.name === 'door-office2');
  if (note) return {
    x: note.x + (note.width || 0) / 2,
    bottom: note.y + (note.height || 0),
    width: note.width || DEFAULT_WIDTH,
    height: note.height || DEFAULT_HEIGHT,
  };

  // Older classroom maps only have the office transition point. It sits just
  // above the wall, so anchor the door art over that wall until the note is saved.
  return { x: transition.x, bottom: transition.y + 24,
    width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
}

export function drawOfficeDoor(scene, source) {
  const placement = officeDoorPlacement(source);
  if (!placement) return;

  const texture = scene.textures.get('office-door');
  if (!texture.has('art')) texture.add('art', 0, 166, 400, 923, 511);
  scene.add.image(placement.x, placement.bottom, 'office-door', 'art')
    .setOrigin(0.5, 1)
    .setDisplaySize(placement.width, placement.height)
    .setDepth(-0.25);
}
