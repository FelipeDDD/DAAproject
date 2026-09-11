import Phaser from 'phaser';
import { SchoolScene } from '../scenes/SchoolScene.js';
import { OutsideScene } from '../scenes/OutsideScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 640,
  backgroundColor: '#f0f2f3',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [SchoolScene, OutsideScene],
};
