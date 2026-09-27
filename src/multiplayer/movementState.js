// Arcade resolves velocity and displacement before the scene update. Use both:
// keys/desired velocity alone would report walking indefinitely against a wall.
export function resolvedMovementState(body) {
  const displaced = Math.hypot(body.deltaX(), body.deltaY()) > .01;
  const velocityX = Math.round(body.velocity.x);
  const velocityY = Math.round(body.velocity.y);
  const moving = displaced && Math.hypot(velocityX, velocityY) > 1;
  return { moving, velocityX: moving ? velocityX : 0, velocityY: moving ? velocityY : 0 };
}
