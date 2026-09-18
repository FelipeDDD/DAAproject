import { objectsIn, propertiesOf } from './tiledObjects.js';
import { distanceToSeat } from './quizSeats.js';
import { MONITOR_DEFAULTS } from '../terminal/config.js';

export const TERMINAL_PROMPT = Object.freeze({ text: '[E] Terminal', offsetX: 0, offsetY: -70 });

export function readTerminalComputers(source) {
  return objectsIn(source, 'Entities').filter(object => object.visible !== false &&
    ((object.class || object.type) === 'terminalComputer' ||
      propertiesOf(object).interaction === 'terminalComputer')).map(object => {
    const properties = propertiesOf(object);
    const settings = { ...MONITOR_DEFAULTS, ...properties };
    for (const key of Object.keys(MONITOR_DEFAULTS)) {
      if (!Number.isFinite(settings[key]) ||
        ((key.includes('Width') || key.includes('Height')) && settings[key] <= 0) ||
        (key === 'interactionDistance' && settings[key] < 0)) {
        throw new Error(`Terminal ${object.id}: invalid ${key}`);
      }
    }
    const top = object.y - (object.gid ? object.height : 0);
    const x = object.x + settings.monitorOffsetX;
    const y = top + settings.monitorOffsetY;
    const interaction = {
      x: Number.isFinite(properties.interactionOffsetX)
        ? object.x + properties.interactionOffsetX : x,
      y: Number.isFinite(properties.interactionOffsetY)
        ? top + properties.interactionOffsetY : y,
      width: properties.interactionWidth ?? settings.monitorWidth,
      height: properties.interactionHeight ?? settings.monitorHeight,
    };
    if (![interaction.x,interaction.y,interaction.width,interaction.height].every(Number.isFinite) ||
      interaction.width <= 0 || interaction.height <= 0) {
      throw new Error(`Terminal ${object.id}: invalid interaction geometry`);
    }
    return {
      id: String(object.id),
      x, y,
      width: settings.monitorWidth, height: settings.monitorHeight,
      interactionDistance: settings.interactionDistance, interaction,
    };
  });
}

export function nearbyTerminalComputer(computers, body) {
  const target = computer => computer.interaction ?? computer;
  return computers.filter(computer => distanceToSeat(target(computer), body) <= computer.interactionDistance)
    .sort((a, b) => distanceToSeat(target(a), body) - distanceToSeat(target(b), body))[0] ?? null;
}

export function terminalPromptPosition(computer) {
  const target = computer.interaction ?? computer;
  return {
    x: Math.round(target.x + target.width / 2 + TERMINAL_PROMPT.offsetX),
    y: Math.round(target.y + target.height + TERMINAL_PROMPT.offsetY),
  };
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
