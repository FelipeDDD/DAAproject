// Map geometry uses tile units; the spawn is the character's feet in pixels.
// A future Tiled loader can supply bounds, spawn and collision layers here.
export const classroom = {
  tileSize: 32,
  columns: 26,
  rows: 20,
  spawn: { x: 416, y: 352 },
  doorway: { x: 12, y: 14, width: 2, height: 1 },
  walls: [
    { x: 0, y: 0, width: 26, height: 2 },
    { x: 0, y: 19, width: 26, height: 1 },
    { x: 0, y: 2, width: 1, height: 17 },
    { x: 25, y: 2, width: 1, height: 17 },
    { x: 1, y: 14, width: 11, height: 1 },
    { x: 14, y: 14, width: 11, height: 1 },
  ],
  desks: [
    { x: 5, y: 5, width: 3, height: 1.5 },
    { x: 17, y: 5, width: 3, height: 1.5 },
    { x: 5, y: 9, width: 3, height: 1.5 },
    { x: 17, y: 9, width: 3, height: 1.5 },
  ],
};
