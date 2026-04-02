import { Hero }           from '../entities/Hero.js';
import { Enemy }          from '../entities/Enemy.js';
import { ENEMIES_CONFIG } from '../data/enemies.config.js';
import { SKILLS_CONFIG }  from '../data/skills.config.js';
import { CONTENT }        from '../data/content.js';

export class BattleEngine {
  constructor(gameEngine, bossId) {
    this.ge      = gameEngine;
    this.bossId  = bossId;
    this.hero    = new Hero({ ...gameEngine.state.hero });
    this.enemy   = new Enemy(ENEMIES_CONFIG[bossId]);
    this.turn    = 'player';
    this.busy    = false;
    this.onUpdate      = null;
    this.onLog         = null;
    this.onVictory     = null;
    this.onDefeat      = null;
    this.onRevival     = null;
    this.onGetSceneEl  = null;
    this.lastPlayerAction = null;
    this.turnCount        = 0;
    this._disabledAction  = null;
    this._obscureHP       = false;
  }

  getAvailableSkills() {
    return Object.values(SKILLS_CONFIG).filter(s => {
      if (s.finalBossOnly && this.bossId !== 'loneliness') return false;
      return s.unlockLevel <= this.hero.level;
    });
  }

  // ── PLAYER ACTIONS ────────────────────────────────────────────────────────

  async playerAttack() {
    // Guard FIRST before doing anything
    if (this.busy || this.turn !== 'player') return;
    this.busy = true;
    this.lastPlayerAction = 'attack';
    this.turnCount++;

    const base   = this.hero.atk;
    const dmg    = Math.floor(base * (0.85 + Math.random() * 0.3));
    const actual = this.enemy.takeDamage(dmg);

    this.ge.audio.hit();
    this.ge.particles.spawnBurst(
      window.innerWidth * 0.65, window.innerHeight * 0.35, 10, 'heart'
    );
    this.onLog?.(`${this.hero.name} attacks for ${actual} damage!`, 'hero-action');
    this.onUpdate?.();

    if (!this.enemy.isAlive()) { this._doVictory(); return; }
    await this._delay(600);
    await this._enemyTurn();
  }

  async playerSkill(skillId) {
    // Guard FIRST
    if (this.busy || this.turn !== 'player') return;
    const skill = SKILLS_CONFIG[skillId];
    if (!skill || this.hero.mp < skill.mpCost) return;

    this.busy = true;
    this.lastPlayerAction = skillId;
    this.turnCount++;
    this.hero.mp -= skill.mpCost;

    if (skill.type === 'heal') {
      const healed = this.hero.heal(skill.value);
      this.ge.audio.chime();
      this.ge.particles.spawnBurst(
        window.innerWidth * 0.3, window.innerHeight * 0.5, 12, 'heart'
      );
      this.onLog?.(`💖 ${skill.name} — Chiara recovers ${healed} HP!`, 'hero-action');

    } else if (skill.type === 'damage') {
      const dmg    = Math.floor(this.hero.atk * skill.multiplier);
      const actual = this.enemy.takeDamage(dmg);
      this.ge.audio.hit();
      this.ge.particles.spawnBurst(
        window.innerWidth * 0.65, window.innerHeight * 0.35, 16, 'spark'
      );
      this.onLog?.(`⚡ ${skill.name} — ${actual} damage!`, 'hero-action');

    } else if (skill.type === 'buff') {
      this.hero.addStatus(skill.effect, skill.duration);
      this.ge.audio.chime();
      this.onLog?.(
        `🛡️ ${skill.name} — Defense raised for ${skill.duration} turns!`, 'hero-action'
      );

    } else if (skill.type === 'stun') {
      const [min, max] = skill.damage;
      const dmg    = Math.floor(min + Math.random() * (max - min));
      const actual = this.enemy.takeDamage(dmg);
      this.enemy.addStatus('stunned', 1);
      this.ge.audio.chime();
      this.onLog?.(
        `✨ ${skill.name} — ${actual} damage! Enemy stunned!`, 'hero-action'
      );

    } else if (skill.type === 'damage+stun') {
      const dmg    = Math.floor(this.hero.atk * skill.multiplier);
      const actual = this.enemy.takeDamage(dmg);
      this.enemy.addStatus('stunned', 1);
      const mem = CONTENT.sharedMemories[
        Math.floor(Math.random() * CONTENT.sharedMemories.length)
      ];
      this.ge.audio.chime();
      this.ge.particles.spawnBurst(
        window.innerWidth * 0.5, window.innerHeight * 0.4, 18, 'heart'
      );
      this.onLog?.(`🌸 Memory Flash: "${mem}"`, 'system');
      await this._delay(800);
      this.onLog?.(`${actual} damage! Enemy stunned by the memory!`, 'damage');

    } else if (skill.type === 'ultimate') {
      this.ge.audio.ultimateCharge();
      this.ge.particles.spawnBurst(
        window.innerWidth * 0.5, window.innerHeight * 0.4, 40, 'heart'
      );
      this.onLog?.(`💗 PURE LOVE — The ultimate light!`, 'hero-action');
      await this._delay(1200);
      this.enemy.hp = 0;
    }

    this.onUpdate?.();
    if (!this.enemy.isAlive()) { this._doVictory(); return; }
    await this._delay(600);
    await this._enemyTurn();
  }

  async playerEncourage() {
    // Guard FIRST
    if (this.busy || this.turn !== 'player') return;
    this.busy = true;
    this.lastPlayerAction = 'encourage';
    this.turnCount++;

    const mpGain = Math.floor(10 + Math.random() * 6);
    this.hero.restoreMP(mpGain);
    this.ge.audio.chime();
    this.onLog?.(`Chiara encourages herself. +${mpGain} MP.`, 'system');
    this.onUpdate?.();
    await this._delay(500);
    await this._enemyTurn();
  }

  async playerItem(itemId) {
    // Guard FIRST
    if (this.busy || this.turn !== 'player') return;
    if (!this.hero.items[itemId] || this.hero.items[itemId] <= 0) return;
    this.busy = true;
    this.hero.items[itemId]--;

    if (itemId === 'memoryPotion') {
      const h = this.hero.heal(30);
      this.ge.audio.chime();
      this.onLog?.(`🧪 Memory Potion — Restored ${h} HP.`, 'hero-action');
    } else if (itemId === 'loveShard') {
      const m = this.hero.restoreMP(25);
      this.ge.audio.chime();
      this.onLog?.(`💌 Love Letter Shard — Restored ${m} MP.`, 'hero-action');
    } else if (itemId === 'petalShield') {
      this.hero.addStatus('shielded', 1);
      this.ge.audio.chime();
      this.onLog?.(`🌸 Petal Shield — Next attack blocked!`, 'hero-action');
    }

    this.onUpdate?.();
    await this._delay(500);
    await this._enemyTurn();
  }

  // ── ENEMY TURN ────────────────────────────────────────────────────────────

  async _enemyTurn() {
    this.turn = 'enemy';

    if (this.enemy.hasStatus('stunned')) {
      this.enemy.tickStatuses();
      this.onLog?.(`${this.enemy.name} is stunned and skips their turn!`, 'system');
      this.onUpdate?.();
      await this._delay(800);
      this._endTurn();
      return;
    }

    const move         = this.enemy.chooseMove();
    const taunts       = CONTENT.bosses[this.bossId].taunts;
    const reactive     = CONTENT.bosses[this.bossId].reactiveTaunts ?? {};
    let taunt;

    if (this.lastPlayerAction === 'encourage' && reactive.onEncourage?.length) {
      taunt = reactive.onEncourage[Math.floor(Math.random() * reactive.onEncourage.length)];
    } else if (this.lastPlayerAction === 'warmth' && reactive.onHeal?.length) {
      taunt = reactive.onHeal[Math.floor(Math.random() * reactive.onHeal.length)];
    } else if (this.hero.hp / this.hero.maxHp < 0.3 && reactive.onLowHP?.length) {
      taunt = reactive.onLowHP[Math.floor(Math.random() * reactive.onLowHP.length)];
    } else if (this.turnCount > 6 && reactive.onLongBattle?.length) {
      taunt = reactive.onLongBattle[Math.floor(Math.random() * reactive.onLongBattle.length)];
    } else {
      taunt = taunts[Math.floor(Math.random() * taunts.length)];
    }

    // Show taunt — player clicks to dismiss, then damage applies
    await this.ge.dialogue.show(this.enemy.name, taunt, 2200);

    const [min, max] = move.damage;
    const rawDmg     = Math.floor(min + Math.random() * (max - min));
    const actual     = this.hero.takeDamage(rawDmg);

    if (move.effect) this.hero.addStatus(move.effect);

    this.ge.audio.miss();
    this.ge.particles.spawnSmoke(
      window.innerWidth * 0.3, window.innerHeight * 0.5
    );
    this.onLog?.(
      `${this.enemy.name} uses ${move.name} — ${actual} damage!`, 'enemy-action'
    );
    if (move.effect) this.onLog?.(`Chiara is now ${move.effect}!`, 'system');

    this.onUpdate?.();

    if (!this.hero.isAlive()) {
      if (!this.hero.revivedThisBattle) {
        this.hero.revivedThisBattle = true;
        this.hero.hp = Math.floor(this.hero.maxHp * 0.5);
        const revMsg = CONTENT.revivals[
          Math.floor(Math.random() * CONTENT.revivals.length)
        ];
        this.onRevival?.(revMsg);
        this.onUpdate?.();
        this.busy = false; // let player interact with revival screen
        return;
      } else {
        this.onDefeat?.();
        return;
      }
    }

    await this._delay(600);
    this._endTurn();
  }

  // ── END TURN ──────────────────────────────────────────────────────────────

  _endTurn() {
    this.hero.tickStatuses();

    if (this.hero.hasStatus('burned')) {
      const burnDmg = 8;
      this.hero.hp  = Math.max(1, this.hero.hp - burnDmg);
      this.onLog?.(`Chiara takes ${burnDmg} burn damage!`, 'enemy-action');
    }

    this.enemy.tickStatuses();
    this._applyBossMechanic();

    // Only reset turn/busy if mechanic didn't do it already (fear paralysis)
    if (this.turn !== 'player') {
      this.turn = 'player';
      this.busy = false;
    }
    this.onUpdate?.();
  }

  _applyBossMechanic() {
    switch (this.bossId) {

      case 'insecurity':
        if (this.turnCount % 3 === 0 && this.turnCount > 0) {
          this.hero.atk = Math.max(8, this.hero.atk - 2);
          this.onLog?.(
            `Insecurity whispers... Chiara's confidence wavers (-2 ATK)`, 'system'
          );
        }
        break;

      case 'jealousy':
        if (this.turnCount % 4 === 0 && this.turnCount > 0) {
          this.onLog?.(
            `Jealousy clouds your vision — you can't see clearly!`, 'system'
          );
          this._obscureHP = true;
          setTimeout(() => {
            this._obscureHP = false;
            this.onUpdate?.();
          }, 1800);
        }
        break;

      case 'fear':
        if (Math.random() < 0.18 && this.turnCount > 1) {
          this.onLog?.(
            `Fear grips Chiara — she hesitates and loses her turn!`, 'system'
          );
          // Keep busy=true, reset after delay
          setTimeout(() => {
            this.turn = 'player';
            this.busy = false;
            this.onUpdate?.();
          }, 1600);
          return; // skip the normal reset at end of _endTurn
        }
        break;

      case 'doubt':
        if (this.turnCount % 4 === 0 && this.turnCount > 0) {
          const actions        = ['attack', 'skills', 'items', 'encourage'];
          this._disabledAction = actions[Math.floor(Math.random() * actions.length)];
          this.onLog?.(
            `Doubt makes Chiara second-guess her ${this._disabledAction}...`, 'system'
          );
          setTimeout(() => {
            this._disabledAction = null;
            this.onUpdate?.();
          }, 2000);
        }
        break;

      case 'loneliness':
        if (this.turnCount > 0) {
          const drain   = 4;
          this.hero.mp  = Math.max(0, this.hero.mp - drain);
          if (this.turnCount % 2 === 0) {
            this.onLog?.(
              `Loneliness drains Chiara's spirit... (-${drain} MP)`, 'system'
            );
          }
        }
        break;
    }
  }

  // ── VICTORY ───────────────────────────────────────────────────────────────

  _doVictory() {
    // Lock battle permanently
    this.busy = true;
    this.turn = 'none';

    this.ge.audio.victory();
    this.ge.particles.spawnBurst(
      window.innerWidth / 2, window.innerHeight / 2, 30, 'heart'
    );

    // Save hero state
    this.ge.state.hero = { ...this.hero };

    // Hide any open dialogue
    this.ge.dialogue.hide();

    // Go straight to VictoryScene — it handles last words + loot
    setTimeout(() => this.onVictory?.(), 400);
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}