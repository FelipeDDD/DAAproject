import { objectsIn, propertiesOf } from './tiledObjects.js';

// No map coordinates here: rectangle geometry and behavior come from Doors in TMJ.
export function readDoors(source) {
  const ids = new Set();
  return objectsIn(source, 'Doors').map((object) => {
    const props = propertiesOf(object);
    const id = String(props.id ?? (object.name || object.id));
    if (ids.has(id)) throw new Error(`Id de porta repetido: ${id}`);
    ids.add(id);
    if (object.rotation || object.gid || object.point || object.ellipse || object.polygon || object.polyline ||
        !(object.width > 0 && object.height > 0)) {
      throw new Error(`Porta ${id}: use um retângulo sem rotação na layer Doors.`);
    }
    for (const name of ['open', 'locked', 'transition', 'interactive']) {
      if (props[name] !== undefined && typeof props[name] !== 'boolean') {
        throw new Error(`Porta ${id}: ${name} deve ser uma propriedade bool no Tiled.`);
      }
    }
    const visualGeometry = (state) => Object.fromEntries(
      ['width', 'height', 'offsetX', 'offsetY'].flatMap((key) => {
        const value = props[state + key[0].toUpperCase() + key.slice(1)];
        return value === undefined ? [] : [[key, value]];
      }),
    );
    return {
      id, label: props.label ?? object.name ?? id,
      x: object.x, y: object.y, width: object.width, height: object.height,
      open: props.open ?? false,
      locked: props.locked ?? false,
      interactive: props.interactive ?? true,
      transition: props.transition ?? Boolean(props.targetMap),
      targetMap: props.targetMap,
      targetSpawn: props.targetSpawn,
      targetX: props.targetX,
      targetY: props.targetY,
      closedVisual: { texture: props.closedTexture ?? 'door-closed', frame: props.closedFrame ?? 0, ...visualGeometry('closed') },
      openVisual: { texture: props.openTexture ?? 'door-open', frame: props.openFrame ?? 0, ...visualGeometry('open') },
    };
  });
}
