// Read raw TMJ data so custom properties have the same format in Phaser and tests.
export function propertiesOf(object) {
  return Object.fromEntries((object.properties ?? []).map(({ name, value }) => [name, value]));
}

export function objectsIn(source, name) {
  const layer = source.layers.find((entry) => entry.name === name && entry.type === 'objectgroup');
  if (!layer) return [];
  return layer.objects.map((object) => ({
    ...object,
    x: object.x + (layer.offsetx ?? 0),
    y: object.y + (layer.offsety ?? 0),
  }));
}

export function resolveSpawn(source, destination = {}) {
  const spawns = objectsIn(source, 'Spawns');
  const find = (name) => spawns.find((spawn) =>
    spawn.name === name || String(propertiesOf(spawn).id ?? spawn.id) === String(name));
  let spawn;
  if (destination.targetSpawn) {
    spawn = find(destination.targetSpawn);
    if (!spawn) throw new Error(`Spawn not found: ${destination.targetSpawn}`);
  } else if (destination.targetX !== undefined || destination.targetY !== undefined) {
    if (!Number.isFinite(destination.targetX) || !Number.isFinite(destination.targetY)) {
      throw new Error('Provide numeric targetX and targetY values, or targetSpawn.');
    }
    return { x: destination.targetX, y: destination.targetY };
  } else {
    spawn = find(propertiesOf(source).defaultSpawn ?? 'default') ?? spawns[0];
    if (!spawn) throw new Error('Add a point named default to the Spawns object layer.');
  }
  return { x: spawn.x, y: spawn.y };
}
