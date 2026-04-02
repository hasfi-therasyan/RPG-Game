import { Scene }      from './Scene.js';
import { Platformer } from '../systems/Platformer.js';
import { ZONES }      from '../data/zones.config.js';

export class PlatformerScene extends Scene {
  constructor(ge, zoneId, lives, onWin, onGameOver) {
    super(ge);
    this.zoneId   = zoneId;
    this.lives    = lives;
    this.onWin     = onWin;
    this.onGameOver = onGameOver;
    this.platformer = null;
    this.canvas     = null;
    this.lifeEls    = null;
  }

  render() {
    this.el.style.cssText = `
      position: absolute; inset: 0;
      background: #0d0714;
      display: block;
    `;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      display: block; width: 100%; height: 100%;
      image-rendering: pixelated;
    `;
    this.el.appendChild(this.canvas);

    // Lives UI
    const livesUI = document.createElement('div');
    livesUI.style.cssText = `
      position: absolute; top: 50px; left: 50%;
      transform: translateX(-50%);
      display: flex; gap: 8px; z-index: 10;
    `;
    livesUI.id = 'lives-ui';
    this.el.appendChild(livesUI);
    this._renderLives(livesUI);

    // Zone intro banner
    const zone   = ZONES[this.zoneId];
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center; pointer-events: none; z-index: 20;
      animation: fadeIn 0.5s ease;
    `;
    banner.innerHTML = `
      <div style="font-size:3rem">${zone.emoji}</div>
      <h2 style="font-family:'Cinzel',serif;color:${zone.accentColor};font-size:1.6rem;
        text-shadow:0 0 20px ${zone.accentColor};margin:8px 0">${zone.label}</h2>
      <p style="color:rgba(255,248,244,0.6);font-style:italic;font-family:'Cormorant Garamond',serif">
        Reach the dungeon to face the shadow...
      </p>`;
    this.el.appendChild(banner);
    setTimeout(() => banner.remove(), 2200);
  }

  _renderLives(container) {
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('div');
      heart.style.cssText = `
        font-size: 1.4rem;
        opacity: ${i < this.lives ? '1' : '0.2'};
        transition: opacity 0.3s ease;
        filter: ${i < this.lives ? 'drop-shadow(0 0 6px #f2a7bb)' : 'none'};
      `;
      heart.textContent = '❤️';
      container.appendChild(heart);
    }
  }

  start() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const zone = ZONES[this.zoneId];

    this.platformer = new Platformer(
      this.canvas,
      this.zoneId,
      zone,
      () => this.onWin?.(),
      () => this._loseLife(),
      this.ge, // ← pass game engine in
    );

    this.platformer.onHeartCollected = () => this._gainLife();

    this._onResize = () => {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', this._onResize);

    this.platformer.start();
  }

  _loseLife() {
    this.lives--;
    const livesUI = this.el.querySelector('#lives-ui');
    if (livesUI) this._renderLives(livesUI);
    this.ge.audio.miss();

    if (this.lives <= 0) {
      // Game over
      setTimeout(() => this._showGameOver(), 600);
    }
  }

  _gainLife() {
    if (this.lives >= 3) return; // cap at 3
    this.lives++;
    const livesUI = this.el.querySelector('#lives-ui');
    if (livesUI) this._renderLives(livesUI);
    this.ge.audio.chime();

    // Show +1 life toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 80px; left: 50%;
      transform: translateX(-50%);
      background: rgba(242,167,187,0.9);
      color: #3b1f2e;
      padding: 6px 20px;
      border-radius: 20px;
      font-family: 'Cinzel', serif;
      font-size: 0.85rem;
      font-weight: bold;
      letter-spacing: 0.1em;
      z-index: 20;
      pointer-events: none;
      animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = '❤️ +1 Life!';
    this.el.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  _showGameOver() {
    const over = document.createElement('div');
    over.style.cssText = `
      position: absolute; inset: 0;
      background: rgba(10,5,16,0.92);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 20px; z-index: 50;
      animation: fadeIn 0.5s ease;
    `;
    over.innerHTML = `
      <div style="font-size:3rem">💔</div>
      <h2 style="font-family:'Cinzel',serif;color:#e84040;font-size:1.8rem">
        The shadows won... for now.
      </h2>
      <p style="color:rgba(255,248,244,0.6);font-style:italic;font-family:'Cormorant Garamond',serif;
        max-width:300px;text-align:center">
        Every warrior falls before they rise. Try again, Chiara.
      </p>
      <button class="btn-primary" id="retry-platform">Try Again 🌸</button>
      <button class="btn-secondary" id="back-map">← Back to Map</button>`;
    this.el.appendChild(over);

    over.querySelector('#retry-platform').onclick = () => {
      this.onGameOver?.('retry');
    };
    over.querySelector('#back-map').onclick = () => {
      this.onGameOver?.('map');
    };
  }

  destroy() {
    super.destroy();
    this.platformer?.destroy();
    window.removeEventListener('resize', this._onResize);
  }
}