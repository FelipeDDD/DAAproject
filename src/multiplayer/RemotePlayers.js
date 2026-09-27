import { characterBaseIdFor, characterById } from '../characters.js';
import { applyCharacterVisual,updateCharacterVisual,visualStyleForActiveItem } from '../characterVisuals.js';
import { RemoteSnapshotBuffer } from './remoteMovement.js';

export class RemotePlayers {
  constructor(scene, { clock = () => performance.now(), ...bufferOptions } = {}) {
    this.scene = scene; this.players = new Map();
    this.clock = clock; this.bufferOptions = bufferOptions;
  }

  receive(rows) {
    const arrivalAt = this.clock();
    const present = new Set(rows.map(p => p.playerId));
    for (const [id, remote] of this.players) if (!present.has(id)) {
      remote.sprite.destroy(); remote.label.destroy(); this.players.delete(id);
    }
    for (const row of rows) {
      let remote = this.players.get(row.playerId);
      if (!remote) {
        const character=characterById(characterBaseIdFor(row));
        const sprite = this.scene.add.sprite(row.x,row.y,'student').setOrigin(0.5,1);
        const style=visualStyleForActiveItem(row.activeCharacterItem,row.equippedSkin);
        const visual=applyCharacterVisual(sprite,character,style);
        const label = this.scene.add.text(row.x, row.y, row.displayName??row.name, { fontSize: '10px', color: '#152c42', backgroundColor: '#ffffffcc' }).setOrigin(0.5, 1);
        remote = { sprite,label,visual,character,characterBaseId:characterBaseIdFor(row),style,buffer:new RemoteSnapshotBuffer(this.bufferOptions) };
        this.players.set(row.playerId, remote);
      }
      const nextBaseId=characterBaseIdFor(row);
      if(remote.characterBaseId!==nextBaseId){
        remote.character=characterById(nextBaseId);remote.characterBaseId=nextBaseId;
        remote.visual=applyCharacterVisual(remote.sprite,remote.character,remote.style);
      }
      const { teleport } = remote.buffer.push(row, arrivalAt);
      remote.presenceMode=row.presenceMode??'playing';
      remote.terminalLeaseExpiresAt=row.terminalLeaseExpiresAt;
      if (teleport) remote.sprite.setPosition(row.x, row.y);
      remote.label.setText(row.displayName??row.name);
    }
  }

  update() {
    const now = this.clock();
    for (const remote of this.players.values()) {
      const { sprite, label } = remote;
      const target = remote.buffer.sample(now);
      if (!target) continue;
      const style=visualStyleForActiveItem(target.activeCharacterItem,target.equippedSkin);
      if(remote.style!==style){remote.visual=applyCharacterVisual(sprite,remote.character,style);remote.style=style;}
      sprite.setPosition(target.x, target.y);
      updateCharacterVisual(sprite,remote.visual,target.direction,target.moving);
      sprite.setDepth(sprite.y);
      label.setPosition(sprite.x,sprite.y-remote.visual.labelOffset).setDepth(sprite.y+1);
    }
  }
}
