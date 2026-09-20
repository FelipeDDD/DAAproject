// Visual tuning and movement speed in world pixels per second.
export const CAMERA_ZOOM = Object.freeze({default:1.6,arena:1.2});
export const CAMERA_ZOOM_TRANSITION_MS=220;
export const cameraZoomForMap=mapKey=>mapKey==='arena'?CAMERA_ZOOM.arena:CAMERA_ZOOM.default;
export const PLAYER_SCALE = 1.15;
export const NEW_PLAYER_SCALE = 1;
export const PLAYER_SPEED = 144;
