import { objectsIn } from '../maps/tiledObjects.js';
import { readMapTransitions } from '../maps/transitions.js';

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 44;
const OFFICE3_DOOR_FRAME={x:400,y:245,width:450,height:635};
const OFFICE3_DOOR_SIZE={width:52,height:64};
// Align the sprite's bottom edge with the classroom wall/floor seam.
const OFFICE3_DOOR_Y_OFFSET=-18;

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

export function office3DoorPlacement(source) {
  const marker = objectsIn(source, 'Notes').find(object => object.name === 'office3-door');
  if (!marker) return null;
  return { x: marker.x, y: marker.y+OFFICE3_DOOR_Y_OFFSET,
    width: OFFICE3_DOOR_SIZE.width, height: OFFICE3_DOOR_SIZE.height };
}

export function drawOffice3Door(scene, source) {
  const placement = office3DoorPlacement(source);
  if (!placement) return null;
  const texture = scene.textures.get('office3-door');
  if (!texture.has('art')) texture.add('art', 0, OFFICE3_DOOR_FRAME.x,
    OFFICE3_DOOR_FRAME.y, OFFICE3_DOOR_FRAME.width, OFFICE3_DOOR_FRAME.height);
  return scene.add.image(placement.x, placement.y, 'office3-door', 'art')
    .setOrigin(.5).setDisplaySize(placement.width, placement.height).setDepth(-.25);
}
