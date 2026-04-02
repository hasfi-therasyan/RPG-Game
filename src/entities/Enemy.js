export class Enemy {
  constructor(config) {
    this.id       = config.id;
    this.name     = config.name;
    this.title    = config.title;
    this.emoji    = config.emoji;
    this.hp       = config.maxHP;
    this.maxHp    = config.maxHP;
    this.defense  = config.defense;
    this.color    = config.color;
    this.bgGradient = config.bgGradient;
    this.moves    = config.moves;
    this.reward   = config.reward;
    this.statusEffects = [];
  }

  chooseMove() {
    const totalWeight = this.moves.reduce((s, m) => s + m.weight, 0);
    let r = Math.random() * totalWeight;
    for (const move of this.moves) {
      r -= move.weight;
      if (r <= 0) return move;
    }
    return this.moves[0];
  }

  takeDamage(amount) {
    const mitigated = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - mitigated);
    return mitigated;
  }

  addStatus(effect, duration = 1) {
    if (!this.hasStatus(effect)) this.statusEffects.push({ id: effect, duration });
  }

  hasStatus(effect) {
    return this.statusEffects.some(s => s.id === effect);
  }

  tickStatuses() {
    this.statusEffects = this.statusEffects
      .map(s => ({ ...s, duration: s.duration - 1 }))
      .filter(s => s.duration > 0);
  }

  isAlive() { return this.hp > 0; }
}