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
    const logicalState = this.open ? 'open' : 'closed';
    const state = this.interactive === false && this.visualState ? this.visualState : logicalState;
    const visual = state === 'halfOpen'
      ? this.halfOpenVisual
      : state === 'open' ? this.openVisual : this.closedVisual;
    this.displayedState = state;
    this.visual.setTexture(visual.texture, visual.frame ?? 0)
      .setDisplaySize(visual.width ?? this.width, visual.height ?? this.height)
      .setOrigin(visual.originX ?? 0, visual.originY ?? 0)
      .setAngle(visual.angle ?? 0);
    this.visual.setFlipX?.(visual.flipX ?? false);
    this.visual.setFlipY?.(visual.flipY ?? false);
    this.visual.setPosition(this.x + (visual.offsetX ?? 0), this.y + (visual.offsetY ?? 0));
    this.blocker.body.enable = this.blocksPassage();
  }

  distanceTo(body) {
    const dx = Math.max(this.x - body.right, body.x - this.x - this.width, 0);
    const dy = Math.max(this.y - body.bottom, body.y - this.y - this.height, 0);
    return Math.hypot(dx, dy);
  }

  applySharedState(state, body) {
    this.locked = state.locked;
    this.open = state.open && !state.locked;
    this.applyState();
    this.updateBlocker(body);
  }

  updateBlocker(body) {
    // A late network close must never trap feet already inside the doorway.
    this.blocker.body.enable = this.blocksPassage() && !this.overlaps(body);
  }

  blocksPassage() {
    return !this.open || Boolean(this.getDestination());
  }

  isNear(body) {
    return this.distanceTo(body) <= INTERACTION_DISTANCE;
  }

  overlaps(body) {
    return body.x < this.x + this.width && body.right > this.x &&
      body.y < this.y + this.height && body.bottom > this.y;
  }

  toggle(body) {
    if (this.locked) return 'Door locked.';
    if (this.interactive === false) return 'Fixed passage.';
    // Never create a solid body on top of the player's feet.
    if (this.open && this.overlaps(body)) return 'Move out of the doorway before closing the door.';
    this.open = !this.open;
    this.applyState();
    return this.open ? 'Door open.' : 'Door closed.';
  }

  getDestination() {
    if (!this.open || this.locked || this.transition === false || !this.targetMap) return null;
    return {
      targetMap: this.targetMap, targetSpawn: this.targetSpawn,
      targetX: this.targetX, targetY: this.targetY,
    };
  }
}
