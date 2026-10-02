import Phaser from 'phaser';
import { SchoolScene } from '../scenes/SchoolScene.js';
import { OutsideScene } from '../scenes/OutsideScene.js';
import { ArenaScene } from '../scenes/ArenaScene.js';
import { PvpArenaScene } from '../scenes/PvpArenaScene.js';
import { Office2Scene } from '../scenes/Office2Scene.js';
import { Office3Scene } from '../scenes/Office3Scene.js';
import { SecretPathScene } from '../scenes/SecretPathScene.js';
import { GAME_LOGICAL_SIZE } from '../ui/displaySettings.js';

export const GAME_SCENES_BY_KEY=Object.freeze({
  school:SchoolScene,outside:OutsideScene,arena:ArenaScene,office2:Office2Scene,office3:Office3Scene,'secret-path':SecretPathScene,'pvp-arena-test':PvpArenaScene,
});

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
  scene: Object.values(GAME_SCENES_BY_KEY),
};
