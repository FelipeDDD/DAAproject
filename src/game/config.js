import Phaser from 'phaser';
import { SchoolScene } from '../scenes/SchoolScene.js';
import { OutsideScene } from '../scenes/OutsideScene.js';
import { ArenaScene } from '../scenes/ArenaScene.js';
import { Office2Scene } from '../scenes/Office2Scene.js';
import { GAME_LOGICAL_SIZE } from '../ui/displaySettings.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_LOGICAL_SIZE.width,
  height: GAME_LOGICAL_SIZE.height,
  backgroundColor: '#f0f2f3',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [SchoolScene, OutsideScene, ArenaScene, Office2Scene],
};
