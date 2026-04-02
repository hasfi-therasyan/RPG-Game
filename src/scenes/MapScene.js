import { Scene }    from './Scene.js';
import { WorldMap } from '../systems/WorldMap.js';

export class MapScene extends Scene {
  constructor(ge, bossOrder, state) {
    super(ge);
    this.bossOrder = bossOrder;
    this.state     = state;
    this.world     = null;
    this.canvas    = null;
  }

  render() {
    this.el.id        = 'map-scene';
    this.el.style.cssText = `
      position: absolute; inset: 0;
      background: #0d0714;
      display: block;
    `;

    this.canvas           = document.createElement('canvas');
    this.canvas.style.cssText = `
      display: block;
      width: 100%; height: 100%;
      image-rendering: pixelated;
    `;
    this.el.appendChild(this.canvas);

    // Dungeon proximity tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: absolute;
      bottom: 60px; left: 50%;
      transform: translateX(-50%);
      background: rgba(10,5,16,0.9);
      border: 1px solid rgba(242,167,187,0.4);
      border-radius: 12px;
      padding: 10px 20px;
      font-family: 'Cinzel', serif;
      font-size: 0.8rem;
      color: #f2a7bb;
      letter-spacing: 0.1em;
      pointer-events: none;
      display: none;
      backdrop-filter: blur(4px);
      animation: fadeInUp 0.3s ease;
      white-space: nowrap;
    `;
    this.el.appendChild(this.tooltip);
  }

  start() {
    // Size canvas to screen
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.world = new WorldMap(this.canvas, this.state);

    this.world.onEnterDungeon = (id) => {
      this.ge.bus.emit('startBattle', id);
    };

    // Click to move / enter dungeon
    this.canvas.addEventListener('click', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width  / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.world.handleClick(
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top)  * scaleY
      );
    });

    // Proximity tooltip
    this.canvas.addEventListener('mousemove', e => {
      const rect   = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width  / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX + this.world.camera.x;
      const my = (e.clientY - rect.top)  * scaleY + this.world.camera.y;

      let found = null;
      for (const d of this.world.dungeons) {
        const dx = mx - d.x;
        const dy = my - d.y;
        if (Math.sqrt(dx*dx + dy*dy) < 42) { found = d; break; }
      }

      if (found) {
        this.tooltip.style.display = 'block';
        this.tooltip.textContent   = found.unlocked
          ? (found.done ? `✓ ${found.label} — Cleared` : `${found.emoji} Enter ${found.label}`)
          : `🔒 ${found.label} — Defeat previous boss first`;
      } else {
        this.tooltip.style.display = 'none';
      }
    });

    // Resize handler
    this._onResize = () => {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', this._onResize);

    this.world.start();
  }

  destroy() {
    super.destroy();
    this.world?.destroy();
    window.removeEventListener('resize', this._onResize);
  }
}