import { Scene }   from './Scene.js';
import { CONTENT } from '../data/content.js';

const EVENTS = [
  {
    id: 'rest',
    icon: '🌸',
    title: 'A Quiet Moment',
    description: 'Chiara finds a soft patch of light and rests for a while.',
    choices: [
      { label: 'Rest deeply (+40 HP)',       action: 'healHP',  value: 40 },
      { label: 'Meditate (+25 MP)',           action: 'healMP',  value: 25 },
    ],
  },
  {
    id: 'memory',
    icon: '💭',
    title: 'A Memory Surfaces',
    description: () => `"${CONTENT.sharedMemories[Math.floor(Math.random() * CONTENT.sharedMemories.length)]}"`,
    choices: [
      { label: 'Hold onto it (+30 HP, +15 MP)', action: 'healBoth', hp: 30, mp: 15 },
      { label: 'Let it fuel you (+1 ATK permanently)', action: 'buffATK', value: 4 },
    ],
  },
  {
    id: 'chest',
    icon: '✨',
    title: 'A Glowing Chest',
    description: 'Hidden in the shadows, a small chest pulses with warm light.',
    choices: [
      { label: 'Open it (random item)',    action: 'randomItem' },
      { label: 'Leave it (gain 20 MP)',    action: 'healMP', value: 20 },
    ],
  },
  {
    id: 'stranger',
    icon: '🌙',
    title: 'A Mysterious Voice',
    description: 'A voice whispers: "You are closer to the light than you think."',
    choices: [
      { label: 'Listen (+20 HP, remove debuffs)', action: 'cleanse' },
      { label: 'Press forward (+15 MP)',           action: 'healMP', value: 15 },
    ],
  },
  {
    id: 'shrine',
    icon: '💗',
    title: 'A Love Shrine',
    description: 'A small shrine built from letters and dried flowers. It radiates warmth.',
    choices: [
      { label: 'Pray (+50 HP)',              action: 'healHP',  value: 50 },
      { label: 'Offer something (+2 ATK)',   action: 'buffATK', value: 6 },
    ],
  },
];

const RANDOM_ITEMS = ['memoryPotion', 'loveShard', 'petalShield'];

export class EventScene extends Scene {
  constructor(ge, state, onDone) {
    super(ge);
    this.state  = state;
    this.onDone = onDone;
    this.event  = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  }

  render() {
    const ev = this.event;
    const desc = typeof ev.description === 'function' ? ev.description() : ev.description;

    this.el.id = 'event-scene';
    this.el.style.cssText = `
      background: radial-gradient(ellipse at 50% 40%, #1a0a2e, #080510);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 24px; padding: 40px 24px; text-align: center;
    `;

    this.el.innerHTML = `
      <p style="font-family:var(--font-title);font-size:0.75rem;letter-spacing:0.25em;color:var(--lavender);animation:fadeInDown 0.4s ease">
        RANDOM ENCOUNTER
      </p>
      <div style="font-size:3.5rem;animation:fadeIn 0.6s ease 0.2s both">${ev.icon}</div>
      <h2 style="font-family:var(--font-title);color:var(--rose);font-size:1.5rem;animation:fadeInUp 0.5s ease 0.3s both">
        ${ev.title}
      </h2>
      <p style="color:rgba(255,248,244,0.7);font-style:italic;max-width:360px;font-size:1rem;line-height:1.7;animation:fadeIn 0.6s ease 0.4s both">
        ${desc}
      </p>
      <div id="event-choices" style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px;animation:fadeInUp 0.5s ease 0.6s both">
        ${ev.choices.map((c, i) => `
          <button class="btn-primary" data-choice="${i}" style="width:100%;font-size:0.85rem">
            ${c.label}
          </button>`).join('')}
      </div>`;
  }

  start() {
    this.ge.particles.spawnPetals(10);
    this.el.querySelectorAll('[data-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx    = parseInt(btn.dataset.choice);
        const choice = this.event.choices[idx];
        this._applyChoice(choice);
      });
    });
  }

  _applyChoice(choice) {
    const hero = this.ge.state.hero;

    if (choice.action === 'healHP') {
      hero.hp = Math.min(hero.maxHp, hero.hp + choice.value);
    } else if (choice.action === 'healMP') {
      hero.mp = Math.min(hero.maxMp, hero.mp + choice.value);
    } else if (choice.action === 'healBoth') {
      hero.hp = Math.min(hero.maxHp, hero.hp + choice.hp);
      hero.mp = Math.min(hero.maxMp, hero.mp + choice.mp);
    } else if (choice.action === 'buffATK') {
      hero.atk += choice.value;
    } else if (choice.action === 'randomItem') {
      const item = RANDOM_ITEMS[Math.floor(Math.random() * RANDOM_ITEMS.length)];
      hero.items[item] = (hero.items[item] || 0) + 1;
    } else if (choice.action === 'cleanse') {
      hero.hp = Math.min(hero.maxHp, hero.hp + 20);
      hero.statusEffects = [];
    }

    this.ge.audio.chime();
    this.ge.particles.spawnBurst(
      window.innerWidth / 2, window.innerHeight / 2, 14, 'heart'
    );

    setTimeout(() => this.onDone(), 600);
  }
}