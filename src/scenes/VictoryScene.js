import { Scene }          from './Scene.js';
import { ENEMIES_CONFIG } from '../data/enemies.config.js';
import { CONTENT }        from '../data/content.js';

export class VictoryScene extends Scene {
  constructor(ge, bossId, state, onDone) {
    super(ge);
    this.bossId  = bossId;
    this.state   = state;
    this.onDone  = onDone;
    this._timers = [];
  }

  render() {
    this.el.id = 'victory-scene';
  }

  start() {
    this.ge.particles.spawnBurst(
      window.innerWidth  / 2,
      window.innerHeight / 2,
      28, 'heart'
    );
    this.ge.audio.victory();
    this._renderLastWords();
  }

  _renderLastWords() {
    const cfg      = ENEMIES_CONFIG[this.bossId];
    const dialogue = CONTENT.bosses[this.bossId].deathDialogue;
    const msPerLine = 600;
    const readDelay = Math.max(4000, dialogue.length * msPerLine);

    this.el.innerHTML = `
      <p style="
        font-family: var(--font-title);
        font-size: 0.75rem;
        letter-spacing: 0.25em;
        color: var(--lavender);
        animation: fadeInDown 0.4s ease;
        margin-bottom: 8px;
      ">SHADOW DEFEATED</p>

      <h1 style="
        font-family: var(--font-title);
        color: var(--gold);
        font-size: 2rem;
        animation: glow 2s infinite;
        margin-bottom: 20px;
      ">${cfg.emoji} ${cfg.name} Fades</h1>

      <div id="dialogue-lines" style="
        max-width: 420px;
        width: 90%;
        background: rgba(255,255,255,0.04);
        border-left: 3px solid var(--rose);
        border-radius: 0 12px 12px 0;
        padding: 20px 24px;
        font-family: var(--font-body);
        font-style: italic;
        font-size: 1rem;
        color: rgba(255,248,244,0.9);
        line-height: 1.9;
        text-align: left;
        max-height: 50vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--plum) transparent;
      "></div>

      <div id="continue-wrap" style="
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.6s ease;
      ">
        <button id="continue-btn" class="btn-primary">→ Continue</button>
        <p style="
          font-family: var(--font-title);
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.25);
          margin: 0;
        ">click to continue</p>
      </div>
    `;

    const container = this.el.querySelector('#dialogue-lines');
    const wrap      = this.el.querySelector('#continue-wrap');
    const btn       = this.el.querySelector('#continue-btn');

    // Reveal lines one by one
    dialogue.forEach((line, i) => {
      const t = setTimeout(() => {
        if (!this.el.isConnected) return;
        const p         = document.createElement('p');
        p.style.cssText = `
          margin: 5px 0;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        `;
        p.textContent = line;
        container.appendChild(p);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          p.style.opacity   = '1';
          p.style.transform = 'translateY(0)';
        }));
        container.scrollTop = container.scrollHeight;
      }, 300 + i * msPerLine);
      this._timers.push(t);
    });

    // Only show button after all lines are done
    const t2 = setTimeout(() => {
      if (!this.el.isConnected) return;
      wrap.style.opacity      = '1';
      wrap.style.pointerEvents = 'all';

      // THIS is the only click handler — calls onDone when player is ready
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._timers.forEach(t => clearTimeout(t));
        this._timers = [];
        this.onDone?.(); // GameEngine takes over from here
      });
    }, readDelay);
    this._timers.push(t2);
  }

  destroy() {
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
    super.destroy();
  }
}