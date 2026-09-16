export const TERMINAL_ANIMATION = Object.freeze({
  cameraMs: 250,
  expandMs: 440,
  contentMs: 140,
  flashMs: 120,
  zoomFactor: 1.12,
  panFraction: 0.35,
  contentDelayFraction: 0.65,
  easing: 'cubic-bezier(.22,.8,.24,1)',
});

// Pixel offsets from the object's top-left; override these on the Tiled entity.
export const MONITOR_DEFAULTS = Object.freeze({
  monitorOffsetX: 0, monitorOffsetY: 0,
  monitorWidth: 16, monitorHeight: 18, interactionDistance: 32,
});
