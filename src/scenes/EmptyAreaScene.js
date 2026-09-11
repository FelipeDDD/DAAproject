import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { CAMERA_ZOOM } from '../game/settings.js';

// Test destination. Replace this scene with a real map loader when ready.
export class EmptyAreaScene extends Phaser.Scene {
  constructor() {
    super('empty-area');
  }

  create({ targetX = 320, targetY = 256 } = {}) {
    this.add.rectangle(0, 0, 960, 640, 0xf0f2f3).setOrigin(0);
    this.physics.world.setBounds(0, 0, 960, 640);
    this.player = new Player(this, targetX, targetY);
    this.cameras.main.setBounds(0, 0, 960, 640).setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 1, 1);
    const hint = document.getElementById('interaction-hint');
    hint.textContent = 'Área de teste · Esc para voltar à escola.';
    this.input.keyboard.once('keydown-ESC', () => {
      this.input.keyboard.resetKeys();
      this.scene.resume('school');
      this.scene.stop();
    });
  }

  update() {
    this.player.update();
  }
}
