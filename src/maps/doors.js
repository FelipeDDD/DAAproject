import { objectsIn, propertiesOf } from './tiledObjects.js';

// No map coordinates here: rectangle geometry and behavior come from Doors in TMJ.
export function readDoors(source) {
  const ids = new Set();
  return objectsIn(source, 'Doors').map((object) => {
    const props = propertiesOf(object);
    const id = String(props.id ?? (object.name || object.id));
    if (ids.has(id)) throw new Error(`Duplicate door ID: ${id}`);
    ids.add(id);
    if (object.rotation || object.gid || object.point || object.ellipse || object.polygon || object.polyline ||
        !(object.width > 0 && object.height > 0)) {
      throw new Error(`Door ${id}: use an unrotated rectangle in the Doors layer.`);
    }
    for (const name of ['open', 'locked', 'transition', 'interactive']) {
      if (props[name] !== undefined && typeof props[name] !== 'boolean') {
        throw new Error(`Door ${id}: ${name} must be a bool property in Tiled.`);
      }
    }
    const orientation = props.orientation ?? (object.width >= object.height ? 'horizontal' : 'vertical');
    if (!['horizontal', 'vertical'].includes(orientation)) {
      throw new Error(`Door ${id}: orientation must be horizontal or vertical.`);
    }
    const hinge = props.hinge ?? (orientation === 'horizontal' ? 'left' : 'top');
    if (!['left', 'right', 'top', 'bottom'].includes(hinge)) {
      throw new Error(`Door ${id}: hinge must be left, right, top or bottom.`);
    }
    if (orientation === 'horizontal' && !['left', 'right'].includes(hinge)) {
      throw new Error(`Door ${id}: a horizontal door hinge must be left or right.`);
    }
    if (orientation === 'vertical' && !['top', 'bottom'].includes(hinge)) {
      throw new Error(`Door ${id}: a vertical door hinge must be top or bottom.`);
    }
    const visualState = props.visualState;
    if (visualState !== undefined && !['closed', 'open', 'halfOpen'].includes(visualState)) {
      throw new Error(`Door ${id}: visualState must be closed, open or halfOpen.`);
    }
    if (visualState === 'halfOpen' && (props.interactive ?? true) !== false) {
      throw new Error(`Door ${id}: halfOpen visualState requires interactive: false.`);
    }
    for (const state of ['closed', 'open', 'halfOpen']) {
      for (const key of ['Width', 'Height', 'OffsetX', 'OffsetY', 'OriginX', 'OriginY', 'Angle']) {
        const value = props[`${state}${key}`];
        if (value !== undefined && !Number.isFinite(value)) {
          throw new Error(`Door ${id}: ${state}${key} must be numeric.`);
        }
      }
      for (const key of ['FlipX', 'FlipY']) {
        const value = props[`${state}${key}`];
        if (value !== undefined && typeof value !== 'boolean') {
          throw new Error(`Door ${id}: ${state}${key} must be a bool property.`);
        }
      }
    }
    const visualGeometry = (state) => Object.fromEntries(
      ['width', 'height', 'offsetX', 'offsetY', 'originX', 'originY', 'angle', 'flipX', 'flipY'].flatMap((key) => {
        const value = props[state + key[0].toUpperCase() + key.slice(1)];
        return value === undefined ? [] : [[key, value]];
      }),
    );
    const defaultOpenVisual = orientation === 'vertical'
      ? {
        texture: 'door-closed-side', width: object.width, height: object.height,
        offsetX: object.width / 2, offsetY: hinge === 'bottom' ? object.height : 0,
        originX: 0.5, originY: hinge === 'bottom' ? 1 : 0, angle: hinge === 'bottom' ? 90 : -90,
      }
      : {
        texture: 'door-open',
        ...(hinge === 'right' ? { offsetX: object.width, originX: 1, flipX: true } : {}),
      };
    const closedVisual = {
      texture: props.closedTexture ?? (orientation === 'vertical' ? 'door-closed-side' : 'door-closed'),
      frame: props.closedFrame ?? 0, ...visualGeometry('closed'),
    };
    const openVisual = { ...defaultOpenVisual,
      texture: props.openTexture ?? defaultOpenVisual.texture,
      frame: props.openFrame ?? 0,
      ...visualGeometry('open'),
    };
    const halfOpenVisual = { ...openVisual,
      texture: props.halfOpenTexture ?? 'door-half-open',
      frame: props.halfOpenFrame ?? 0,
      ...visualGeometry('halfOpen'),
    };
    return {
      id, label: props.label ?? object.name ?? id,
      x: object.x, y: object.y, width: object.width, height: object.height,
      orientation, hinge, visualState,
      open: props.open ?? false,
      locked: props.locked ?? false,
      interactive: props.interactive ?? true,
      transition: props.transition ?? Boolean(props.targetMap),
      targetMap: props.targetMap,
      targetSpawn: props.targetSpawn,
      targetX: props.targetX,
      targetY: props.targetY,
      closedVisual, openVisual, halfOpenVisual,
    };
  });
}
