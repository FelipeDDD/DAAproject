import { MENDIGA_VISUAL as config, buildMendigaWalkGrid, findMendigaWanderPath,
  patrolStep, readMendigaPatrol, stabilizePatrolDirection } from './mendigaPatrol.js';

export class MendigaNpc {
  constructor(scene, {random = Math.random} = {}) {
    this.route = readMendigaPatrol(scene.source);
    if (!this.route.length) return;
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
    this.walkGrid = buildMendigaWalkGrid(scene.source);
    this.random = random;
    this.path = findMendigaWanderPath(this.walkGrid, first, this.random);
    this.pauseUntil = 0;
    this.lookUntil = 0;
    this.lookTarget = null;
    this.walkDirection = null;
    this.directionChangedAt = -Infinity;
  }

  lookAtPlayer(position, time, duration = 6000) {
    if (!this.sprite || !position) return;
    this.lookTarget = {x: position.x, y: position.y};
    this.lookUntil = Math.max(this.lookUntil, time + duration);
    this.faceTarget();
  }

  faceTarget() {
    if (!this.sprite || !this.lookTarget) return;
    const dx = this.lookTarget.x - this.sprite.x, dy = this.lookTarget.y - this.sprite.y;
    if (Math.abs(dx) + Math.abs(dy) < 0.001) return;
    const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    const frame = config.rows.indexOf(direction) * 4;
    this.walkDirection = direction;
    this.directionChangedAt = this.lookUntil - config.directionChangeCooldownMs;
    this.sprite.stop();
    this.sprite.setTexture(config.texture, frame).setDepth(this.sprite.y);
  }

  update(time, delta) {
    if (!this.sprite) return;
    if (time < this.lookUntil) {
      this.faceTarget();
      return;
    }
    this.lookTarget = null;
    if (time < this.pauseUntil) return;
    if (!this.path.length) {
      this.sprite.stop();
      this.path = findMendigaWanderPath(this.walkGrid, this.sprite, this.random);
      if (!this.path.length) {this.pauseUntil = time + config.pauseMs; return;}
    }
    const step = patrolStep(this.sprite, this.path[0], delta);
    this.sprite.setPosition(step.x, step.y).setDepth(step.y);
    const direction = stabilizePatrolDirection(this.walkDirection, step.direction, time, this.directionChangedAt);
    this.walkDirection = direction.direction;
    this.directionChangedAt = direction.changedAt;
    this.sprite.play(`${config.texture}-walk-${this.walkDirection}`, true);
    if (step.arrived) {
      this.path.shift();
      if (!this.path.length) {
        this.sprite.stop();
        this.pauseUntil = time + config.pauseMs;
      }
    }
  }

  destroy() { this.sprite?.destroy(); this.sprite = null; }
}
