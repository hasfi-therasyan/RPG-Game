import { Scene }              from './Scene.js';
import { TypewriterSystem }   from '../systems/TypewriterSystem.js';
import { CONTENT }            from '../data/content.js';

export class EndingScene extends Scene {
  constructor(ge) {
    super(ge);
    this.typewriter = new TypewriterSystem();
  }

  render() {
    this.el.id = 'ending-scene';
    this.el.innerHTML = `
      <p style="color:var(--lavender);font-size:0.8rem;letter-spacing:0.25em;font-family:var(--font-title);margin-bottom:10px;animation:fadeIn 1s ease">
        ALL SHADOWS DEFEATED
      </p>
      <h1 class="letter-name anim-glow">${CONTENT.hero.name}</h1>
      <div class="letter-wrap" id="letter-content"></div>
      <div class="ending-actions hidden" id="ending-actions">
        <button class="btn-primary" id="replay-btn">🌸 Play Again</button>
        <button class="btn-secondary" id="share-btn">💌 Share with ${CONTENT.hero.name}</button>
      </div>`;
  }

  start() {
    for (let i = 0; i < 30; i++) {
      setTimeout(() => this.ge.particles.spawnPetals(3), i * 200);
    }
    this.ge.audio.victory();

    setTimeout(() => {
      const container = this.el.querySelector('#letter-content');
      this.typewriter.writeLines(
        container,
        CONTENT.endingLetter,
        30,
        420,
        () => {
          const actions = this.el.querySelector('#ending-actions');
          if (actions) actions.classList.remove('hidden');
          this.ge.audio.chime();
        }
      );
    }, 1200);

    this.el.querySelector('#replay-btn')?.addEventListener('click', () => {
      this.ge.bus.emit('restartGame');
    });

    this.el.querySelector('#share-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = '💌 Link copied! Send it to her.';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2600);
      });
    });
  }

  destroy() {
    super.destroy();
    this.typewriter.destroy();
  }
}