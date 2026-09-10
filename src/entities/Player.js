import Phaser from 'phaser';
import { PLAYER_SCALE, PLAYER_SPEED } from '../game/settings.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'student');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setScale(PLAYER_SCALE);
    // Only the feet collide: the head can overlap walls in a top-down view.
    // Size and offset use texture pixels; Arcade applies the sprite scale.
    this.body.setSize(20, 12);
    this.body.setOffset(6, 44);
    this.setCollideWorldBounds(true);
    this.speed = PLAYER_SPEED;
    this.direction = new Phaser.Math.Vector2();
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    this.direction.set(Number(right) - Number(left), Number(down) - Number(up));
    // Diagonals have the same speed as movement on a single axis.
    this.direction.normalize().scale(this.speed);
    this.setVelocity(this.direction.x, this.direction.y);
    if (this.direction.x !== 0) this.setFlipX(this.direction.x < 0);
    this.setDepth(this.y);
  }
}
