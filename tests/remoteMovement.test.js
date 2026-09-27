import test from 'node:test';
import assert from 'node:assert/strict';
import { RemoteSnapshotBuffer, REMOTE_INTERPOLATION_DELAY_MS } from '../src/multiplayer/remoteMovement.js';
import { PRESENCE_SYNC_INTERVAL_MS } from '../src/multiplayer/presencePolicy.js';
import { RemotePlayers } from '../src/multiplayer/RemotePlayers.js';

const row = (x, direction = 'right', extra = {}) => ({
  playerId: 'felipe', characterId: 'felipe', name: 'Felipe', x, y: 0, direction,
  equippedSkin: 'classic', activeCharacterItem: null, ...extra,
});

test('default visual delay follows the configured presence interval', () => {
  assert.equal(REMOTE_INTERPOLATION_DELAY_MS, PRESENCE_SYNC_INTERVAL_MS);
});

for (const interval of [150, 180, 200]) {
  test(`${interval} ms samples render constant speed without catch-up pulsing`, () => {
    const buffer = new RemoteSnapshotBuffer({ delayMs: interval });
    for (let n = 0; n <= 4; n++) buffer.push(row(144 * n * interval / 1000), n * interval);
    let previous = 0;
    const step = interval / 4;
    for (let t = step; t <= interval * 4; t += step) {
      const rendered = buffer.sample(t + interval);
      assert.ok(Math.abs(rendered.x - 144 * t / 1000) < 1e-9);
      assert.ok(Math.abs(rendered.x - previous - 144 * step / 1000) < 1e-9);
      assert.equal(rendered.y, 0);
      previous = rendered.x;
    }
  });
}

test('cached deliveries and heartbeats do not become fake movement samples', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 200 });
  buffer.push(row(0, 'right', { lastSeen: 1000 }), 0);
  buffer.push(row(20, 'right', { lastSeen: 1200 }), 200);
  assert.equal(buffer.push(row(20, 'right', { lastSeen: 1200 }), 250).accepted, false);
  assert.equal(buffer.push(row(20, 'right', { lastSeen: 1500 }), 500).accepted, false);
  assert.equal(buffer.snapshots.length, 2);
  assert.equal(buffer.snapshots[1].arrivalAt, 200);
  assert.equal(buffer.sample(300).x, 10);
  assert.equal(buffer.push(row(0, 'left', { lastSeen: 1100 }), 600).accepted, false);
});

test('teleport clears the old path and snaps immediately, without interpolating across the map', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 200 });
  buffer.push(row(0), 0);
  buffer.push(row(20), 200);
  assert.equal(buffer.push(row(400, 'up'), 250).teleport, true);
  assert.equal(buffer.snapshots.length, 1);
  assert.equal(buffer.sample(250).x, 400);
  assert.equal(buffer.sample(300).direction, 'up');
  assert.equal(buffer.push(row(560), 400).teleport, false);
});

test('direction and appearance switch at the delayed sample time, not packet arrival', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 200 });
  buffer.push(row(0, 'right'), 0);
  buffer.push(row(20, 'up', { equippedSkin: 'remastered' }), 200);
  buffer.push(row(40, 'up', { equippedSkin: 'remastered' }), 400);
  assert.equal(buffer.sample(300).direction, 'right');
  assert.equal(buffer.sample(300).equippedSkin, 'classic');
  assert.equal(buffer.sample(400).direction, 'up');
  assert.equal(buffer.sample(400).equippedSkin, 'remastered');
});

test('walking follows rendered movement and stops when the final sample is reached', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 200 });
  buffer.push(row(0), 0);
  buffer.push(row(20), 200);
  assert.equal(buffer.sample(300).moving, true);
  const stopped = buffer.sample(400);
  assert.equal(stopped.x, 20);
  assert.equal(stopped.moving, false);
  assert.equal(buffer.sample(1000).moving, false);
});

test('stationary direction changes produce idle animation rather than fake walking', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 200 });
  buffer.push(row(20, 'right'), 0);
  buffer.push(row(20, 'up'), 200);
  assert.equal(buffer.sample(300).moving, false);
  assert.equal(buffer.sample(300).direction, 'right');
  assert.equal(buffer.sample(400).direction, 'up');
});

test('startup and buffer underrun hold known positions without extrapolation', () => {
  const buffer = new RemoteSnapshotBuffer({ delayMs: 180 });
  assert.equal(buffer.sample(0), null);
  buffer.push(row(10), 0);
  assert.equal(buffer.sample(0).x, 10);
  buffer.push(row(30), 180);
  const held = buffer.sample(5000);
  assert.equal(held.x, 30);
  assert.equal(held.moving, false);
  assert.equal(buffer.snapshots.length, 1);
});

test('snapshot storage stays bounded even while rendering is paused', () => {
  const buffer = new RemoteSnapshotBuffer({ maxSnapshots: 8 });
  for (let n = 0; n < 100; n++) buffer.push(row(n), n * 200);
  assert.equal(buffer.snapshots.length, 8);
});

test('RemotePlayers renders from the buffer, snaps teleports and removes departed players', () => {
  let now = 0;
  const object = (x, y) => ({ x, y, anims: { stop() {}, play() {} },
    setOrigin() { return this; }, setTexture() { return this; }, setScale() { return this; },
    setFlipX() { return this; }, setText() { return this; }, setDepth() { return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    destroy() { this.destroyed = true; },
  });
  const remotes = new RemotePlayers({ add: { sprite: object, text: object } }, { clock: () => now, delayMs: 200 });
  remotes.receive([row(0)]);
  now = 200; remotes.receive([row(20)]);
  now = 300; remotes.update();
  const remote = remotes.players.get('felipe');
  assert.equal(remote.sprite.x, 10);
  remotes.receive([row(20)]);
  assert.equal(remote.buffer.snapshots.length, 2);
  now = 350; remotes.receive([row(400)]);
  assert.equal(remote.sprite.x, 400);
  remotes.update();
  assert.equal(remote.sprite.x, 400);
  remotes.receive([]);
  assert.equal(remotes.players.size, 0);
  assert.equal(remote.sprite.destroyed, true);
  assert.equal(remote.label.destroyed, true);
});
