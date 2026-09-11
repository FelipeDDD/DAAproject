// Positions and sizes are WORLD PIXELS. Tile size in classroom.tmj is 32.
// targetMap is the key of a registered Phaser scene (see game/config.js).
export const classroomDoors = [
  {
    id: 'classroom-exit',
    label: 'Saída da sala',
    x: 18 * 32, y: 15 * 32, width: 96, height: 32,
    open: false,
    locked: false,
    closedVisual: { texture: 'door-closed', frame: 0 },
    openVisual: { texture: 'door-open', frame: 0 },
    targetMap: 'empty-area',
    targetX: 320,
    targetY: 256,
  },
  {
    id: 'bathroom-entry',
    label: 'Banheiro',
    x: 12 * 32, y: 7 * 32, width: 32, height: 32,
    open: false,
    locked: false,
    closedVisual: { texture: 'door-closed', frame: 0 },
    openVisual: { texture: 'door-open', frame: 0 },
    // No targetMap: this door only opens/closes in the current map.
  },
];
