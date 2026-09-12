import { PLAYER_SCALE } from '../game/settings.js';
import { characterById } from '../characters.js';

export function interpolate(current, target, delta) {
  return current + (target - current) * (1 - Math.exp(-Math.max(0, delta) / 100));
}

export class RemotePlayers {
  constructor(scene) { this.scene = scene; this.players = new Map(); }

  receive(rows) {
    const present = new Set(rows.map(p => p.playerId));
    for (const [id, remote] of this.players) if (!present.has(id)) {
      remote.sprite.destroy(); remote.label.destroy(); this.players.delete(id);
    }
    for (const row of rows) {
      let remote = this.players.get(row.playerId);
      if (!remote) {
        const sprite = this.scene.add.sprite(row.x, row.y, characterById(row.characterId)?.sprite ?? 'student').setOrigin(0.5, 1).setScale(PLAYER_SCALE);
        const label = this.scene.add.text(row.x, row.y, row.name, { fontSize: '10px', color: '#152c42', backgroundColor: '#ffffffcc' }).setOrigin(0.5, 1);
        remote = { sprite, label };
        this.players.set(row.playerId, remote);
      }
      remote.target = row;
      remote.label.setText(row.name);
      if (row.direction === 'left' || row.direction === 'right') remote.sprite.setFlipX(row.direction === 'left');
    }
  }

  update(delta) {
    for (const { sprite, label, target } of this.players.values()) {
      // Snap teleports; smooth ordinary network samples. No remote physics body.
      const snap = Math.hypot(target.x - sprite.x, target.y - sprite.y) > 160;
      sprite.setPosition(snap ? target.x : interpolate(sprite.x, target.x, delta), snap ? target.y : interpolate(sprite.y, target.y, delta));
      sprite.setDepth(sprite.y);
      label.setPosition(sprite.x, sprite.y - 58 * PLAYER_SCALE).setDepth(sprite.y + 1);
    }
  }
}
