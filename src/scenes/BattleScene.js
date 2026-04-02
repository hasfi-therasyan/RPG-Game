import { Scene }        from './Scene.js';
import { BattleEngine } from '../engine/BattleEngine.js';
import { ENEMIES_CONFIG } from '../data/enemies.config.js';
import { CONTENT }      from '../data/content.js';

export class BattleScene extends Scene {
  constructor(ge, bossId, state) {
    super(ge);
    this.bossId = bossId;
    this.state  = state;
    this.engine = null;
  }

  render() {
    const cfg = ENEMIES_CONFIG[this.bossId];
    this.el.id = 'battle-scene';
    this.el.style.background = cfg.bgGradient;

    this.el.innerHTML = `
      <div id="battle-header">
        <div class="stat-panel" id="hero-panel">
          <div class="stat-name">${CONTENT.hero.name}</div>
          <div class="bar-wrap">
            <span class="bar-label">HP</span>
            <div class="bar-track"><div class="bar-fill hp" id="hero-hp-bar" style="width:100%"></div></div>
          </div>
          <div class="bar-wrap">
            <span class="bar-label" style="color:var(--mp-color)">MP</span>
            <div class="bar-track"><div class="bar-fill mp" id="hero-mp-bar" style="width:100%"></div></div>
          </div>
          <div class="stat-numbers" id="hero-numbers">HP 100/100 · MP 50/50</div>
          <div class="status-badges" id="hero-statuses"></div>
        </div>
        <div class="stat-panel" id="enemy-panel" style="text-align:right">
          <div class="stat-name">${cfg.name}</div>
          <div class="bar-wrap">
            <span class="bar-label" style="color:#c47a7a">HP</span>
            <div class="bar-track"><div class="bar-fill ep" id="enemy-hp-bar" style="width:100%"></div></div>
          </div>
          <div class="stat-numbers" id="enemy-numbers">HP ${cfg.maxHP}/${cfg.maxHP}</div>
          <div class="status-badges" id="enemy-statuses"></div>
        </div>
      </div>

      <div id="battle-arena">
        <div class="hero-sprite anim-heroIdle" id="hero-pixel-sprite" style="
          width:80px;height:120px;
          display:flex;align-items:center;justify-content:center;
          position:relative;
        ">
          <canvas id="hero-battle-canvas" width="80" height="120"
            style="image-rendering:pixelated;width:80px;height:120px"></canvas>
        </div>

        <div class="enemy-sprite anim-enemyIdle" id="enemy-sprite" style="--enemy-color:${cfg.color}">
          ${this._renderEnemySprite(this.bossId)}
        </div>
      </div>

      <div id="battle-log"></div>

      <div id="submenu" class="hidden"></div>

      <div id="action-menu">
        <button class="action-btn" id="btn-attack">⚔️ Attack</button>
        <button class="action-btn" id="btn-skills">✨ Skills</button>
        <button class="action-btn" id="btn-items">🎒 Items</button>
        <button class="action-btn" id="btn-encourage">💬 Encourage</button>
      </div>`;
  }

  _renderEnemySprite(id) {
    const sprites = {
      insecurity: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="eg1" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#6b2d5e"/><stop offset="100%" stop-color="#1a0a2e" stop-opacity="0"/>
        </radialGradient></defs>
        <ellipse cx="60" cy="90" rx="45" ry="65" fill="url(#eg1)" opacity="0.9"/>
        <ellipse cx="60" cy="90" rx="35" ry="55" fill="#3d1040" opacity="0.7"/>
        <circle cx="48" cy="70" r="7" fill="#c9a7d4" opacity="0.9"/>
        <circle cx="72" cy="70" r="7" fill="#c9a7d4" opacity="0.9"/>
        <circle cx="50" cy="68" r="3" fill="#0a0510"/>
        <circle cx="74" cy="68" r="3" fill="#0a0510"/>
        <path d="M45 95 Q60 88 75 95" stroke="#c9a7d4" stroke-width="2" fill="none" opacity="0.6"/>
        <ellipse cx="60" cy="30" rx="25" ry="20" fill="#2a0d38" opacity="0.8"/>
        ${[...Array(6)].map((_, i) => `<line x1="${35+i*10}" y1="${20+Math.sin(i)*8}" x2="${33+i*10}" y2="2" stroke="#6b2d5e" stroke-width="2" opacity="0.7"/>`).join('')}
      </svg>`,
      jealousy: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="eg2" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#1a4d2e"/><stop offset="100%" stop-color="#0a1e0d" stop-opacity="0"/>
        </radialGradient></defs>
        <polygon points="60,10 110,140 10,140" fill="url(#eg2)" opacity="0.85"/>
        <polygon points="60,30 95,130 25,130" fill="#0d3320" opacity="0.7"/>
        <circle cx="47" cy="75" r="8" fill="#7ed4a0" opacity="0.9"/>
        <circle cx="73" cy="75" r="8" fill="#7ed4a0" opacity="0.9"/>
        <circle cx="48" cy="74" r="4" fill="#0a1e0d"/>
        <circle cx="74" cy="74" r="4" fill="#0a1e0d"/>
        <path d="M45 100 Q60 108 75 100" stroke="#7ed4a0" stroke-width="2" fill="none" opacity="0.7"/>
        <line x1="60" y1="10" x2="60" y2="0" stroke="#2d6b3a" stroke-width="3"/>
      </svg>`,
      fear: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="eg3" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#1a1a3e"/><stop offset="100%" stop-color="#050510" stop-opacity="0"/>
        </radialGradient></defs>
        <ellipse cx="60" cy="80" rx="50" ry="70" fill="url(#eg3)" opacity="0.9"/>
        <ellipse cx="60" cy="80" rx="38" ry="58" fill="#0d0d28" opacity="0.8"/>
        <ellipse cx="46" cy="65" rx="10" ry="12" fill="#3a3a8e" opacity="0.8"/>
        <ellipse cx="74" cy="65" rx="10" ry="12" fill="#3a3a8e" opacity="0.8"/>
        <ellipse cx="46" cy="65" rx="5" ry="7" fill="#0a0510"/>
        <ellipse cx="74" cy="65" rx="5" ry="7" fill="#0a0510"/>
        <path d="M42 95 L48 88 L54 95 L60 88 L66 95 L72 88 L78 95" stroke="#3a3a8e" stroke-width="2" fill="none" opacity="0.7"/>
      </svg>`,
      doubt: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="eg4" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#3a3a5e" stop-opacity="0.6"/><stop offset="100%" stop-color="#080810" stop-opacity="0"/>
        </radialGradient></defs>
        <ellipse cx="60" cy="80" rx="50" ry="70" fill="url(#eg4)"/>
        ${[...Array(8)].map(() => {
          const cx = 20 + Math.random() * 80;
          const cy = 15 + Math.random() * 130;
          const r  = 5 + Math.random() * 20;
          return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.6}" fill="#3a3a5e" opacity="${0.1 + Math.random()*0.2}"/>`;
        }).join('')}
        <circle cx="45" cy="68" r="8" fill="#5a5a9e" opacity="0.7"/>
        <circle cx="75" cy="68" r="8" fill="#5a5a9e" opacity="0.7"/>
        <text x="60" y="100" text-anchor="middle" fill="#8888cc" font-size="22" opacity="0.8">?</text>
      </svg>`,
      loneliness: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="eg5" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#4a1a6e"/><stop offset="100%" stop-color="#080510" stop-opacity="0"/>
          </radialGradient>
          <filter id="blur5"><feGaussianBlur stdDeviation="3"/></filter>
        </defs>
        <ellipse cx="60" cy="90" rx="55" ry="75" fill="url(#eg5)" opacity="0.95"/>
        <ellipse cx="60" cy="90" rx="42" ry="62" fill="#1e0830" opacity="0.9" filter="url(#blur5)"/>
        <circle cx="44" cy="68" r="10" fill="#7c3fae" opacity="0.85"/>
        <circle cx="76" cy="68" r="10" fill="#7c3fae" opacity="0.85"/>
        <circle cx="44" cy="68" r="5" fill="#0a0510"/>
        <circle cx="76" cy="68" r="5" fill="#0a0510"/>
        <circle cx="46" cy="66" r="2" fill="#c9a7d4" opacity="0.9"/>
        <circle cx="78" cy="66" r="2" fill="#c9a7d4" opacity="0.9"/>
        <path d="M42 98 Q60 92 78 98" stroke="#7c3fae" stroke-width="2.5" fill="none" opacity="0.8"/>
        ${[...Array(12)].map((_, i) => {
          const angle = (Math.PI * 2 / 12) * i;
          const r = 58;
          const x = 60 + Math.cos(angle) * r;
          const y = 90 + Math.sin(angle) * r;
          return `<circle cx="${x}" cy="${y}" r="2.5" fill="#c9a7d4" opacity="${0.3 + Math.random()*0.5}"/>`;
        }).join('')}
      </svg>`,
    };
    return sprites[id] || sprites.insecurity;
  }

  start() {
    this.engine = new BattleEngine(this.ge, this.bossId);
    this.engine.onUpdate  = () => this._updateUI();
    this.engine.onLog     = (msg, cls) => this._addLog(msg, cls);
    this.engine.onVictory = () => this.ge.bus.emit('battleWon', this.bossId);
    this.engine.onDefeat  = () => this._showDefeat();
    this.engine.onRevival = (msg) => this._showRevival(msg);

    this._updateUI();
    this._drawBattleHero();
    this._heroAnimFrame = setInterval(() => this._drawBattleHero(), 400);
    this._bindActions();

    const cfg = ENEMIES_CONFIG[this.bossId];
    setTimeout(() => {
      this.ge.dialogue.show(cfg.name, CONTENT.bosses[this.bossId].taunts[0], 2500);
    }, 800);
  }

  _drawBattleHero() {
  const canvas = this.el.querySelector('#hero-battle-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const W    = 80, H = 120;
  const tick = Math.floor(Date.now() / 400) % 2; // blink/idle frame
  ctx.clearRect(0, 0, W, H);

  // Glow aura
  const aura = ctx.createRadialGradient(40,60,6,40,60,36);
  aura.addColorStop(0,'rgba(242,167,187,0.4)');
  aura.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(40,60,36,0,Math.PI*2); ctx.fill();

  const S = 3; // pixel scale
  const ox = 20, oy = 10; // offset

  // Helper — draw scaled pixel rect
  const px = (x,y,w,h,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox+x*S, oy+y*S, w*S, h*S);
  };

  // Hair
  px(-1, 0,  10, 1, '#b894c8');
  px( 0, 1,   8, 1, '#b894c8');
  px(-1, 1,   2, 5, '#c9a7d4'); // left lock
  px( 7, 1,   2, 5, '#c9a7d4'); // right lock
  px( 0, 0,   8, 2, '#c9a7d4'); // top

  // Head
  px(1, 2,  6, 5, '#f2c4d0');

  // Eyes
  const blink = tick === 0;
  px(2, 3, 1, blink?1:2, '#3b1f2e');
  px(5, 3, 1, blink?1:2, '#3b1f2e');
  // Blush
  px(1, 5, 1, 1, 'rgba(242,167,187,0.7)');
  px(6, 5, 1, 1, 'rgba(242,167,187,0.7)');

  // Body
  px(1,  7, 6, 4, '#f2a7bb');
  px(0,  8, 8, 3, '#e8a0b8'); // dress waist
  // Dress highlight
  px(2,  7, 2, 2, '#ffc0d0');

  // Skirt
  px(-1, 10, 10, 2, '#e8a0b8');
  px(-1, 12,  2, 2, '#e8a0b8'); // left flare
  px( 7, 12,  2, 2, '#e8a0b8'); // right flare

  // Arms — idle sway
  const armOff = tick === 0 ? 0 : 1;
  px(-2, 7+armOff, 2, 4, '#f2c4d0'); // left arm
  px( 8, 7-armOff, 2, 4, '#f2c4d0'); // right arm

  // Legs
  px(1, 13, 3, 4, '#c9a7d4');
  px(4, 13, 3, 4, '#c9a7d4');
  // Shoes
  px(1, 17, 3, 1, '#7c5c90');
  px(4, 17, 3, 1, '#7c5c90');

  // Shadow on ground
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(40, H-6, 18, 5, 0, 0, Math.PI*2);
  ctx.fill();
}

  _bindActions() {
    this.el.querySelector('#btn-attack').onclick    = () => { this.ge.dialogue.hide(); this.engine.playerAttack(); };
    this.el.querySelector('#btn-encourage').onclick = () => { this.ge.dialogue.hide(); this.engine.playerEncourage(); };
    this.el.querySelector('#btn-skills').onclick    = () => this._showSubmenu('skills');
    this.el.querySelector('#btn-items').onclick     = () => this._showSubmenu('items');
  }

  _showSubmenu(type) {
    const sub = this.el.querySelector('#submenu');
    sub.classList.remove('hidden');

    if (type === 'skills') {
      const skills = this.engine.getAvailableSkills();
      sub.innerHTML = skills.map(s => `
        <button class="submenu-item" data-skill="${s.id}" ${this.engine.hero.mp < s.mpCost ? 'disabled' : ''}>
          <span class="item-name">${s.icon} ${s.name}</span>
          <span class="item-cost">${s.mpCost} MP</span>
          <span class="item-desc">${s.desc}</span>
        </button>`).join('') +
        `<button id="submenu-back">↩ Back</button>`;

      sub.querySelectorAll('[data-skill]').forEach(btn => {
        btn.onclick = () => {
          sub.classList.add('hidden');
          this.ge.dialogue.hide();
          this.engine.playerSkill(btn.dataset.skill);
        };
      });

    } else {
      const items = this.engine.hero.items;
      const itemDefs = [
        { id: 'memoryPotion', icon: '🧪', name: 'Memory Potion', desc: 'Restore 30 HP' },
        { id: 'loveShard',    icon: '💌', name: 'Love Letter Shard', desc: 'Restore 25 MP' },
        { id: 'petalShield',  icon: '🌸', name: 'Petal Shield', desc: 'Block next attack' },
      ];
      sub.innerHTML = itemDefs.map(it => `
        <button class="submenu-item" data-item="${it.id}" ${!items[it.id] ? 'disabled' : ''}>
          <span class="item-name">${it.icon} ${it.name}</span>
          <span class="item-cost">×${items[it.id] ?? 0}</span>
          <span class="item-desc">${it.desc}</span>
        </button>`).join('') +
        `<button id="submenu-back">↩ Back</button>`;

      sub.querySelectorAll('[data-item]').forEach(btn => {
        btn.onclick = () => {
          sub.classList.add('hidden');
          this.ge.dialogue.hide();
          this.engine.playerItem(btn.dataset.item);
        };
      });
    }

    sub.querySelector('#submenu-back').onclick = () => sub.classList.add('hidden');
  }

  _updateUI() {
    const h = this.engine.hero;
    const e = this.engine.enemy;

    const hpPct = (h.hp / h.maxHp * 100).toFixed(1);
    const mpPct = (h.mp / h.maxMp * 100).toFixed(1);
    const epPct = (e.hp / e.maxHp * 100).toFixed(1);

    const heroHpBar = this.el.querySelector('#hero-hp-bar');
    const heroMpBar = this.el.querySelector('#hero-mp-bar');
    const enemyBar  = this.el.querySelector('#enemy-hp-bar');

    if (heroHpBar) {
      heroHpBar.style.width = `${hpPct}%`;
      heroHpBar.classList.toggle('low', h.hp / h.maxHp < 0.25);
    }
    if (heroMpBar) heroMpBar.style.width = `${mpPct}%`;
    if (enemyBar)  enemyBar.style.width  = `${epPct}%`;

    const nums = this.el.querySelector('#hero-numbers');
    if (nums) nums.textContent = `HP ${h.hp}/${h.maxHp} · MP ${h.mp}/${h.maxMp}`;
    const eNums = this.el.querySelector('#enemy-numbers');
    if (eNums) eNums.textContent = `HP ${Math.max(0,e.hp)}/${e.maxHp}`;

    const hStatus = this.el.querySelector('#hero-statuses');
    if (hStatus) hStatus.innerHTML = h.statusEffects.map(s =>
      `<span class="status-badge ${s.id}">${s.id}</span>`).join('');

    const eStatus = this.el.querySelector('#enemy-statuses');
    if (eStatus) eStatus.innerHTML = e.statusEffects.map(s =>
      `<span class="status-badge ${s.id}">${s.id}</span>`).join('');

    const buttons = this.el.querySelectorAll('.action-btn');
    const disabled = this.engine.busy || this.engine.turn !== 'player';
    buttons.forEach(b => b.disabled = disabled);
    // Doubt mechanic — disable a random action
    const disabled2 = this.engine._disabledAction;
    if (disabled2) {
      const map = { attack: '#btn-attack', skills: '#btn-skills', items: '#btn-items', encourage: '#btn-encourage' };
      const btn = this.el.querySelector(map[disabled2]);
      if (btn) btn.disabled = true;
    }
  }

  _addLog(msg, cls = '') {
    const log = this.el.querySelector('#battle-log');
    if (!log) return;
    const line = document.createElement('div');
    line.className = `log-line ${cls}`;
    line.textContent = msg;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    if (log.children.length > 20) log.removeChild(log.firstChild);
  }

  _showRevival(msg) {
    const rev = document.createElement('div');
    rev.id = 'revival-screen';
    rev.innerHTML = `
      <h2>Don't Give Up...</h2>
      <p>"${msg}"</p>
      <button class="btn-primary anim-pulse" id="revival-btn">Rise Again 🌸</button>`;
    this.el.appendChild(rev);
    rev.querySelector('#revival-btn').onclick = () => {
      rev.remove();
      this.engine.busy = false;
      this.engine.turn = 'player';
      this._updateUI();
    };
  }

  _showDefeat() {
    const def = document.createElement('div');
    def.className = 'modal-overlay';
    def.innerHTML = `
      <div class="modal-box">
        <h2>The Shadow Wins... for now.</h2>
        <p>Every warrior falls before they rise. Try again, Chiara.</p>
        <div class="modal-actions">
          <button class="btn-primary" id="retry-btn">Try Again</button>
        </div>
      </div>`;
    document.body.appendChild(def);
    def.querySelector('#retry-btn').onclick = () => {
      def.remove();
      this.ge.bus.emit('startBattle', this.bossId);
    };
  }
  destroy() {
  if (this._heroAnimFrame) clearInterval(this._heroAnimFrame);
  super.destroy();
  this.ge.dialogue.hide();
}
}