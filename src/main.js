import Phaser from 'phaser';
import { gameConfig } from './game/config.js';
import './style.css';

const game = new Phaser.Game(gameConfig);

// Prevent duplicate canvases and keyboard listeners during Vite hot reloads.
if (import.meta.hot) {
  import.meta.hot.dispose(() => game.destroy(true));
}
