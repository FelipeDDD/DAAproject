const INTERACTION_DISTANCE = 48;

export class Door {
  constructor(scene, definition) {
    Object.assign(this, definition);
    this.open = Boolean(definition.open && !definition.locked);
    this.locked = Boolean(definition.locked);
    this.visual = scene.add.image(this.x, this.y, definition.closedVisual.texture)
      .setOrigin(0).setDepth(this.y + this.height);
    this.blocker = scene.add.zone(this.x, this.y, this.width, this.height).setOrigin(0);
    scene.physics.add.existing(this.blocker, true);
    this.applyState();
  }

  applyState() {
    const visual = this.open ? this.openVisual : this.closedVisual;
    this.visual.setTexture(visual.texture, visual.frame ?? 0)
      .setDisplaySize(this.width, this.height);
    this.blocker.body.enable = !this.open;
  }

  distanceTo(body) {
    const dx = Math.max(this.x - body.right, body.x - this.x - this.width, 0);
    const dy = Math.max(this.y - body.bottom, body.y - this.y - this.height, 0);
    return Math.hypot(dx, dy);
  }

  isNear(body) {
    return this.distanceTo(body) <= INTERACTION_DISTANCE;
  }

  overlaps(body) {
    return body.x < this.x + this.width && body.right > this.x &&
      body.y < this.y + this.height && body.bottom > this.y;
  }

  toggle(body) {
    if (this.locked) return 'Porta trancada.';
    // Never create a solid body on top of the player's feet.
    if (this.open && this.overlaps(body)) return 'Saia da passagem para fechar a porta.';
    this.open = !this.open;
    this.applyState();
    return this.open ? 'Porta aberta.' : 'Porta fechada.';
  }

  getDestination() {
    if (!this.open || this.locked || !this.targetMap) return null;
    return { targetMap: this.targetMap, targetX: this.targetX, targetY: this.targetY };
  }
}
