import { characterById } from '../characters.js';
import { applyCharacterVisual,updateCharacterVisual,visualStyleForEquippedSkin } from '../characterVisuals.js';

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
        const character=characterById(row.characterId);
        const sprite = this.scene.add.sprite(row.x,row.y,'student').setOrigin(0.5,1);
        const style=visualStyleForEquippedSkin(row.equippedSkin);
        const visual=applyCharacterVisual(sprite,character,style);
        const label = this.scene.add.text(row.x, row.y, row.name, { fontSize: '10px', color: '#152c42', backgroundColor: '#ffffffcc' }).setOrigin(0.5, 1);
        remote = { sprite,label,visual,character,style };
        this.players.set(row.playerId, remote);
      }
      const style=visualStyleForEquippedSkin(row.equippedSkin);
      if(remote.style!==style){remote.visual=applyCharacterVisual(remote.sprite,remote.character,style);remote.style=style;}
      remote.target = row;
      remote.label.setText(row.name);
    }
  }

  update(delta) {
    for (const { sprite, label, target, visual } of this.players.values()) {
      // Snap teleports; smooth ordinary network samples. No remote physics body.
      const snap = Math.hypot(target.x - sprite.x, target.y - sprite.y) > 160;
      const moving=Math.hypot(target.x-sprite.x,target.y-sprite.y)>.6;
      sprite.setPosition(snap ? target.x : interpolate(sprite.x, target.x, delta), snap ? target.y : interpolate(sprite.y, target.y, delta));
      updateCharacterVisual(sprite,visual,target.direction,moving);
      sprite.setDepth(sprite.y);
      label.setPosition(sprite.x,sprite.y-visual.labelOffset).setDepth(sprite.y+1);
    }
  }
}
