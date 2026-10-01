import { objectsIn } from '../maps/tiledObjects.js';

export const MENDIGA_VISUAL = Object.freeze({
  texture: 'outside-mendiga', frameWidth: 128, frameHeight: 144,
  scale: .5, speed: 32, frameRate: 7, pauseMs: 300,
  // Row order follows the artwork, rather than assuming the player sheet layout.
  rows: ['down', 'right', 'left', 'up'],
});

export function readMendigaPatrol(source) {
  return objectsIn(source, 'Notes')
    .filter(object => /^mendiga-patrol-\d+$/.test(object.name) && object.point
      && Number.isFinite(object.x) && Number.isFinite(object.y))
    .sort((a, b) => Number(a.name.split('-').at(-1)) - Number(b.name.split('-').at(-1)))
    .map(({x, y}) => ({x, y}));
}

export function patrolStep(position, target, delta, speed = MENDIGA_VISUAL.speed) {
  const dx = target.x - position.x, dy = target.y - position.y;
  const distance = Math.hypot(dx, dy);
  const travel = Math.min(distance, speed * Math.max(0, Math.min(delta, 100)) / 1000);
  const direction = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  return {
    x: distance ? position.x + dx / distance * travel : target.x,
    y: distance ? position.y + dy / distance * travel : target.y,
    direction, arrived: travel >= distance,
  };
}
