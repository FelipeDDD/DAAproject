import Phaser from 'phaser';
import { CAMERA_ZOOM } from '../game/settings.js';
import { Player } from '../entities/Player.js';
import { classroom } from '../maps/classroom.js';
import { createPlaceholderTextures, drawClassroom } from '../art/placeholders.js';

export class SchoolScene extends Phaser.Scene {
  constructor() {
    super('school');
  }

  create() {
    const map = classroom;
    const width = map.columns * map.tileSize;
    const height = map.rows * map.tileSize;
    createPlaceholderTextures(this);
    drawClassroom(this, map);
    this.physics.world.setBounds(0, 0, width, height);

    const obstacles = this.physics.add.staticGroup();
    for (const wall of [...map.walls, ...map.desks]) {
      const zone = this.add.zone(
        wall.x * map.tileSize,
        wall.y * map.tileSize,
        wall.width * map.tileSize,
        wall.height * map.tileSize,
      ).setOrigin(0);
      obstacles.add(zone);
    }

    this.player = new Player(this, map.spawn.x, map.spawn.y);
    this.physics.add.collider(this.player, obstacles);

    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, 1, 1);

    // Avoid held movement when the player switches browser tabs/windows.
    const stop = () => {
      this.input.keyboard.resetKeys();
      this.player.setVelocity(0, 0);
    };
    this.game.events.on(Phaser.Core.Events.BLUR, stop);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, stop);
    });
  }

  update() {
    this.player.update();
  }
}
