import { objectsIn, propertiesOf } from './tiledObjects.js';
import { distanceToSeat } from './quizSeats.js';
import { MONITOR_DEFAULTS } from '../terminal/config.js';

export function readTerminalComputers(source) {
  return objectsIn(source, 'Entities').filter(object => object.visible !== false &&
    ((object.class || object.type) === 'terminalComputer' ||
      propertiesOf(object).interaction === 'terminalComputer')).map(object => {
    const settings = { ...MONITOR_DEFAULTS, ...propertiesOf(object) };
    for (const key of Object.keys(MONITOR_DEFAULTS)) {
      if (!Number.isFinite(settings[key]) ||
        ((key.includes('Width') || key.includes('Height')) && settings[key] <= 0) ||
        (key === 'interactionDistance' && settings[key] < 0)) {
        throw new Error(`Terminal ${object.id}: invalid ${key}`);
      }
    }
    return {
      id: String(object.id),
      x: object.x + settings.monitorOffsetX,
      y: object.y - (object.gid ? object.height : 0) + settings.monitorOffsetY,
      width: settings.monitorWidth, height: settings.monitorHeight,
      interactionDistance: settings.interactionDistance,
    };
  });
}

export function nearbyTerminalComputer(computers, body) {
  return computers.filter(computer => distanceToSeat(computer, body) <= computer.interactionDistance)
    .sort((a, b) => distanceToSeat(a, body) - distanceToSeat(b, body))[0] ?? null;
}

// Phaser 4's view matrix includes scroll, zoom, rotation and camera viewport.
// Canvas CSS bounds then account for Scale.FIT, letterboxing and page scrolling.
export function getMonitorScreenBounds(computer, camera, canvas, gameSize) {
  const matrix = camera.getViewMatrix();
  const points = [
    [computer.x, computer.y], [computer.x + computer.width, computer.y],
    [computer.x, computer.y + computer.height],
    [computer.x + computer.width, computer.y + computer.height],
  ].map(([x, y]) => matrix.transformPoint(x, y));
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / gameSize.width, scaleY = rect.height / gameSize.height;
  const left = Math.min(...points.map(p => p.x)), top = Math.min(...points.map(p => p.y));
  return {
    left: rect.left + left * scaleX, top: rect.top + top * scaleY,
    width: (Math.max(...points.map(p => p.x)) - left) * scaleX,
    height: (Math.max(...points.map(p => p.y)) - top) * scaleY,
  };
}
