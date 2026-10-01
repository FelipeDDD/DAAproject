import { collisionAreas } from '../maps/collision.js';
import { objectsIn } from '../maps/tiledObjects.js';

export const MENDIGA_VISUAL = Object.freeze({
  texture: 'outside-mendiga', frameWidth: 128, frameHeight: 144,
  scale: .5, speed: 32, frameRate: 7, pauseMs: 300, directionChangeCooldownMs: 420,
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

export function stabilizePatrolDirection(current, requested, now, changedAt,
  cooldownMs = MENDIGA_VISUAL.directionChangeCooldownMs) {
  if (!current || current === requested) return {direction: requested, changedAt: current ? changedAt : now};
  if (now - changedAt < cooldownMs) return {direction: current, changedAt};
  return {direction: requested, changedAt: now};
}

const PATROL_GRID_SIZE = 16;
const NPC_FEET = {width: 16, height: 8, offsetY: 8};

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x
    && a.y < b.y + b.height && a.y + a.height > b.y;
}

function canWalkAt(x, y, obstacles, width, height) {
  const feet = {x: x - NPC_FEET.width / 2, y: y - NPC_FEET.offsetY,
    width: NPC_FEET.width, height: NPC_FEET.height};
  if (feet.x < 0 || feet.y < 0 || feet.x + feet.width > width || feet.y + feet.height > height) return false;
  return !obstacles.some(area => overlaps(feet, area));
}

function canWalkBetween(a, b, obstacles, width, height) {
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.ceil(distance / 4);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!canWalkAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, obstacles, width, height)) return false;
  }
  return true;
}

export function buildMendigaWalkGrid(source, cellSize = PATROL_GRID_SIZE) {
  const width = source.width * source.tilewidth, height = source.height * source.tileheight;
  const obstacles = collisionAreas(objectsIn(source, 'Collision')).map(area => ({
    x: area.x, y: area.y, width: area.width, height: area.height,
  }));
  const nodes = new Map();
  const columns = Math.floor(width / cellSize), rows = Math.floor(height / cellSize);
  for (let row = 1; row < rows; row++) for (let column = 1; column < columns; column++) {
    const x = column * cellSize, y = row * cellSize;
    if (canWalkAt(x, y, obstacles, width, height)) nodes.set(`${column},${row}`, {column, row, x, y, neighbors: []});
  }
  for (const node of nodes.values()) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const next = nodes.get(`${node.column + dx},${node.row + dy}`);
    if (next && canWalkBetween(node, next, obstacles, width, height)) node.neighbors.push(next);
  }
  return {nodes, obstacles, width, height, cellSize};
}

export function findMendigaWanderPath(grid, position, random = Math.random, minDistance = 128) {
  if (!grid?.nodes?.size) return [];
  let start = null, nearest = Infinity;
  for (const node of grid.nodes.values()) {
    const distance = (node.x - position.x) ** 2 + (node.y - position.y) ** 2;
    if (distance < nearest) {start = node; nearest = distance;}
  }
  if (!start || nearest > (grid.cellSize * 1.5) ** 2) return [];
  const parents = new Map([[start, null]]), pending = [start];
  for (let index = 0; index < pending.length; index++) {
    const node = pending[index];
    for (const next of node.neighbors) if (!parents.has(next)) {
      parents.set(next, node); pending.push(next);
    }
  }
  const candidates = pending.filter(node => Math.hypot(node.x - start.x, node.y - start.y) >= minDistance);
  const destinations = candidates.length ? candidates : pending.filter(node => node !== start);
  if (!destinations.length) return [];
  const choice = destinations[Math.min(destinations.length - 1, Math.floor(random() * destinations.length))];
  const path = [];
  for (let node = choice; node && node !== start; node = parents.get(node)) path.push({x: node.x, y: node.y});
  return path.reverse();
}
