import { objectsIn } from '../maps/tiledObjects.js';

const TRAPDOOR_FRAME = Object.freeze({ x: 216, y: 226, width: 823, height: 803 });
export const OFFICE2_TRAPDOOR_RADIUS = 40;

export function office2TrapdoorPlacement(source) {
  const marker = objectsIn(source, 'Notes').find(object => object.name === 'office2-trapdoor');
  if (!marker) return null;
  return {
    x: marker.x + marker.width / 2,
    y: marker.y + marker.height / 2,
    width: marker.width,
    height: marker.height,
  };
}

export function drawOffice2Trapdoor(scene, source) {
  const placement = office2TrapdoorPlacement(source);
  if (!placement) return null;
  const texture = scene.textures.get('office2-trapdoor');
  if (!texture.has('art')) texture.add('art', 0,
    TRAPDOOR_FRAME.x, TRAPDOOR_FRAME.y, TRAPDOOR_FRAME.width, TRAPDOOR_FRAME.height);
  return scene.add.image(placement.x, placement.y, 'office2-trapdoor', 'art')
    .setOrigin(0.5)
    .setDisplaySize(placement.width, placement.height)
    .setDepth(-0.25);
}
