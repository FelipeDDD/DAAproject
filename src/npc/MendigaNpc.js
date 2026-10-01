import { MENDIGA_VISUAL as config, patrolStep, readMendigaPatrol } from './mendigaPatrol.js';

export class MendigaNpc {
  constructor(scene) {
    this.route = readMendigaPatrol(scene.source);
    if (this.route.length < 2) return;
    for (const [row, direction] of config.rows.entries()) {
      const key = `${config.texture}-walk-${direction}`;
      if (!scene.anims.exists(key)) scene.anims.create({
        key, frames: scene.anims.generateFrameNumbers(config.texture, {start: row * 4, end: row * 4 + 3}),
        frameRate: config.frameRate, repeat: -1,
      });
    }
    const first = this.route[0];
    this.sprite = scene.add.sprite(first.x, first.y, config.texture, 0)
      .setOrigin(.5, 1).setScale(config.scale).setDepth(first.y);
    this.target = 1;
    this.pauseUntil = 0;
  }

  update(time, delta) {
    if (!this.sprite || time < this.pauseUntil) return;
    const step = patrolStep(this.sprite, this.route[this.target], delta);
    this.sprite.setPosition(step.x, step.y).setDepth(step.y);
    this.sprite.play(`${config.texture}-walk-${step.direction}`, true);
    if (step.arrived) {
      this.sprite.stop();
      this.target = (this.target + 1) % this.route.length;
      this.pauseUntil = time + config.pauseMs;
    }
  }

  destroy() { this.sprite?.destroy(); this.sprite = null; }
}
