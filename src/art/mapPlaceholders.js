import { objectsIn, propertiesOf } from '../maps/tiledObjects.js';

// Temporary artwork only. Every world position/rectangle is authored in Tiled.
export function drawMapPlaceholders(scene, source) {
  if (source.layers.find((layer) => layer.name === 'Entities')?.visible === false) return;
  for (const object of objectsIn(source, 'Entities')) {
    if (object.visible === false) continue;
    const props = propertiesOf(object);
    if ((object.class || object.type) === 'wall') {
      scene.add.rectangle(object.x, object.y, object.width, object.height,
        Number.parseInt((props.color ?? '#ead4b4').replace('#', ''), 16)).setOrigin(0).setDepth(-1);
    } else if ((object.class || object.type) === 'monitor') {
      const facing = props.facing ?? 1;
      const g = scene.add.graphics({ x: object.x, y: object.y })
        .setName(object.name)
        .setScale(source.tilewidth / 32, source.tileheight / 32)
        .setDepth(object.y + 16 * source.tileheight / 32);
        // Mirror a three-quarter view so both screens face their seating side.
        const polygon = (color, points) => g.fillStyle(color).fillPoints(
          points.map(([x, y]) => ({ x: -facing * x, y })), true);
        // Paint keyboards first so the screen and its stand always cover them.
        if (!props.hideKeyboard) {
          polygon(0xa7b4bc, [[-17, 9], [-6, 13], [-2, 19], [-13, 15]]);
          polygon(0xeaf0f2, [[-14, 11], [-7, 14], [-5, 16], [-12, 13]]);
        }
        polygon(0x859397, [[-7, 10], [3, 13], [8, 10], [-2, 7]]);
        g.fillStyle(0x52616a).fillRect(-2, 1, 4, 10);
        polygon(0x52616a, [[-7, -14], [10, -8], [10, 9], [7, 11], [-7, 5]]);
        polygon(0x283a45, [[-9, -12], [7, -6], [7, 11], [-9, 5]]);
        polygon(0x86d4e4, [[-7, -9], [5, -5], [5, 8], [-7, 4]]);
        polygon(0xd4f4f5, [[-6, -8], [4, -5], [4, -3], [-6, -6]]);
    }
  }
}
