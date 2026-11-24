import { objectsIn } from './tiledObjects.js';

const EPSILON = 1e-8;
const CLEARANCE = 0.001;
const MAX_CONTACTS = 8;
const dot = (ax, ay, bx, by) => ax * bx + ay * by;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function segment(a, b, radius = 0) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  return {
    a, b, length, radius,
    tx: length ? (b.x - a.x) / length : 0,
    ty: length ? (b.y - a.y) / length : 0,
    left: Math.min(a.x, b.x) - radius,
    right: Math.max(a.x, b.x) + radius,
    top: Math.min(a.y, b.y) - radius,
    bottom: Math.max(a.y, b.y) + radius,
  };
}

function outline(points, solid) {
  return points.flatMap((a, index) => {
    const b = points[index + 1] ?? (solid ? points[0] : null);
    return b && (a.x !== b.x || a.y !== b.y) ? [segment(a, b)] : [];
  });
}

function rectangle(left, top, right, bottom) {
  return [{x: left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
}

// Tiled and the baked Swamp background share the same world pixels. Camera
// zoom acts after physics and never affects the coordinates or radius here.
export function readFootObstacles(source) {
  return objectsIn(source, 'Collision').flatMap(object => {
    const {x, y, width, height, polygon, polyline, ellipse, rotation = 0} = object;
    if (object.gid || object.point || object.text) return [];
    if (ellipse) {
      const radius = Math.min(width, height) / 2;
      if (!(radius > 0)) return [];
      const center = {x: x + width / 2, y: y + height / 2};
      return [{kind: 'ellipse', center, radius, edges: [segment(center, center, radius)]}];
    }
    const kind = polygon ? 'polygon' : polyline ? 'polyline' : 'rectangle';
    const local = polygon ?? polyline ?? (width > 0 && height > 0 ? rectangle(0, 0, width, height) : []);
    if (local.length < (polyline ? 2 : 3)) return [];
    const angle = rotation * Math.PI / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const points = local.map(p => ({x: x + p.x * cos - p.y * sin, y: y + p.x * sin + p.y * cos}));
    const solid = kind !== 'polyline';
    const edges = outline(points, solid);
    if (!edges.length) return [];
    const signedArea = edges.reduce((sum, {a, b}) => sum + a.x * b.y - a.y * b.x, 0);
    if (solid && Math.abs(signedArea) < EPSILON) return [];
    return [{kind, points, solid, edges, winding: Math.sign(signedArea)}];
  });
}

function insidePolygon(point, edges) {
  let inside = false;
  for (const {a, b} of edges) {
    if ((a.y > point.y) === (b.y > point.y)) continue;
    if (point.x < a.x + (b.x - a.x) * (point.y - a.y) / (b.y - a.y)) inside = !inside;
  }
  return inside;
}

function closestOffset(point, edge) {
  const {a, tx, ty, length} = edge;
  const along = clamp(dot(point.x - a.x, point.y - a.y, tx, ty), 0, length);
  const x = point.x - (a.x + along * tx), y = point.y - (a.y + along * ty);
  return {x, y, distance: Math.hypot(x, y)};
}

function nearby(edge, left, top, right, bottom) {
  return edge.left <= right && edge.right >= left && edge.top <= bottom && edge.bottom >= top;
}

function overlap(point, obstacle, radius) {
  const {solid, edges, winding} = obstacle;
  const inside = solid && insidePolygon(point, edges);
  let nearest, best;
  for (const edge of edges) {
    if (!inside && !nearby(edge, point.x - radius, point.y - radius, point.x + radius, point.y + radius)) continue;
    const offset = closestOffset(point, edge);
    if (!nearest || offset.distance < nearest.distance) {
      nearest = offset;
      best = edge;
    }
  }
  if (!nearest) return null;
  const depth = radius + best.radius + (inside ? nearest.distance : -nearest.distance);
  if (depth <= EPSILON) return null;
  const sign = inside ? -1 : 1;
  const nx = nearest.distance > EPSILON ? sign * nearest.x / nearest.distance : best.ty * (winding || 1);
  const ny = nearest.distance > EPSILON ? sign * nearest.y / nearest.distance : -best.tx * (winding || 1);
  return nx || ny ? {nx, ny, depth} : {nx: 1, ny: 0, depth};
}

// Ray against the two straight faces and two round caps of a segment expanded
// by the foot radius. Only contacts approached by the movement can block it.
function sweepSegment(point, move, edge, radius, limit) {
  const {a, b, tx, ty, length} = edge;
  const reach = radius + edge.radius;
  let hit = null;
  if (length) {
    const normalSpeed = dot(move.x, move.y, -ty, tx);
    if (Math.abs(normalSpeed) > EPSILON) {
      const side = normalSpeed < 0 ? 1 : -1;
      const nx = -ty * side, ny = tx * side;
      const t = (reach - dot(point.x - a.x, point.y - a.y, nx, ny)) / -Math.abs(normalSpeed);
      const along = dot(point.x + move.x * t - a.x, point.y + move.y * t - a.y, tx, ty);
      if (t >= -EPSILON && t <= limit && along >= 0 && along <= length) hit = {t: Math.max(0, t), nx, ny};
    }
  }
  const speedSquared = dot(move.x, move.y, move.x, move.y);
  for (const cap of length ? [a, b] : [a]) {
    const dx = point.x - cap.x, dy = point.y - cap.y;
    const approach = dot(dx, dy, move.x, move.y);
    if (approach >= -EPSILON) continue;
    const discriminant = approach * approach - speedSquared * (dx * dx + dy * dy - reach * reach);
    if (discriminant <= 0) continue;
    const t = (-approach - Math.sqrt(discriminant)) / speedSquared;
    if (t < -EPSILON || t > (hit?.t ?? limit)) continue;
    hit = {t: Math.max(0, t), nx: (dx + t * move.x) / reach, ny: (dy + t * move.y) / reach};
  }
  return hit;
}

export function isFootPositionClear(obstacles, bounds, radius, point) {
  const {x, y} = point;
  return Number.isFinite(x) && Number.isFinite(y) &&
    x >= bounds.left + radius && x <= bounds.right - radius &&
    y >= bounds.top + radius && y <= bounds.bottom - radius &&
    !obstacles.some(obstacle => overlap(point, obstacle, radius));
}

export function createFootCollision(obstacles, {left, top, right, bottom}, radius) {
  const edges = [...obstacles.flatMap(item => item.edges), ...outline(rectangle(left, top, right, bottom), true)];
  const inBounds = point => ({
    x: clamp(point.x, left + radius, right - radius),
    y: clamp(point.y, top + radius, bottom - radius),
  });
  return (start, end, slide = true) => {
    let point = inBounds(start);
    // Recover a spawn in a wall or an overlap from floating point error.
    for (let pass = 0; pass <= MAX_CONTACTS; pass++) {
      const contact = obstacles.map(item => overlap(point, item, radius)).find(Boolean);
      if (!contact) break;
      if (pass === MAX_CONTACTS) return inBounds(start);
      point = inBounds({
        x: point.x + contact.nx * (contact.depth + CLEARANCE),
        y: point.y + contact.ny * (contact.depth + CLEARANCE),
      });
    }
    let move = {x: end.x - start.x, y: end.y - start.y};
    for (let pass = 0; pass < MAX_CONTACTS && Math.hypot(move.x, move.y) > EPSILON; pass++) {
      const left = Math.min(point.x, point.x + move.x) - radius;
      const right = Math.max(point.x, point.x + move.x) + radius;
      const top = Math.min(point.y, point.y + move.y) - radius;
      const bottom = Math.max(point.y, point.y + move.y) + radius;
      let hit = null;
      for (const edge of edges) {
        if (!nearby(edge, left, top, right, bottom)) continue;
        hit = sweepSegment(point, move, edge, radius, hit?.t ?? 1) ?? hit;
      }
      if (!hit) return inBounds({x: point.x + move.x, y: point.y + move.y});
      const {t, nx, ny} = hit;
      point.x += move.x * t;
      point.y += move.y * t;
      if (!slide) return inBounds(point);
      // Keep only the tangent of the unspent motion. Cast again in case it
      // reaches another edge or the round cap at a joint in the same step.
      const inward = Math.min(0, dot(move.x, move.y, nx, ny));
      move = {x: (move.x - inward * nx) * (1 - t), y: (move.y - inward * ny) * (1 - t)};
    }
    return inBounds(point);
  };
}
