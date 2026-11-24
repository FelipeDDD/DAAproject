// Visual tuning and movement speed in world pixels per second.
import { PVP_MAP,PVP_INSPECTION_SCENE,PVP_MAP_LAYOUT } from '../pvp/config.js';

export const CAMERA_ZOOM = Object.freeze({default:1.6,arena:1.3,swampV3Factor:0.85});
export const CAMERA_ZOOM_TRANSITION_MS=220;
// The walking inspection scene and live PvP scene share the same physical map.
export const usesPvpCameraZoom=mapKey=>mapKey===PVP_MAP||mapKey===PVP_INSPECTION_SCENE;
export const cameraZoomForMap=mapKey=>usesPvpCameraZoom(mapKey)?PVP_MAP_LAYOUT.cameraZoom
  :mapKey==='arena'?CAMERA_ZOOM.arena
  :mapKey==='swamp-v3-large'?CAMERA_ZOOM.default*CAMERA_ZOOM.swampV3Factor:CAMERA_ZOOM.default;
export const PLAYER_SCALE = 1.15;
export const NEW_PLAYER_SCALE = 1;
export const PLAYER_SPEED = 128;
