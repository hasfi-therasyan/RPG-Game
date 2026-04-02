export class Hero {
  constructor(data) {
    Object.assign(this, data);
  }

  takeDamage(amount) {
    if (this.hasStatus('shielded')) {
      this.removeStatus('shielded');
      return 0;
    }
    const defense  = this.def + (this.hasStatus('defending') ? 15 : 0);
    const mitigated = Math.max(1, amount - defense);
    this.hp = Math.max(0, this.hp - mitigated);
    return mitigated;
  }

  heal(amount) {
    const prev = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - prev;
  }

  restoreMP(amount) {
    const prev = this.mp;
    this.mp = Math.min(this.maxMp, this.mp + amount);
    return this.mp - prev;
  }

  addStatus(effect, duration = 2) {
    if (!this.hasStatus(effect)) this.statusEffects.push({ id: effect, duration });
  }

  removeStatus(effect) {
    this.statusEffects = this.statusEffects.filter(s => s.id !== effect);
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