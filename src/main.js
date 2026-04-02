import { GameEngine } from './engine/GameEngine.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  game.init();
  window._game = game;
});