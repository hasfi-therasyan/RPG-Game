export class AudioEngine {
  constructor() {
    this._ctx = null;
  }

  _getCtx() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  }

  _play(freq, type, duration, gainVal = 0.15, delay = 0) {
    try {
      const ctx  = this._getCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch { /* ignore */ }
  }

  jump() {
    try {
      const ctx  = this._getCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch { /* ignore */ }
  }

  chime() {
    [523, 659, 784, 1047].forEach((f, i) => this._play(f, 'sine', 0.6, 0.12, i * 0.12));
  }

  hit() {
    this._play(180, 'square', 0.18, 0.2);
    this._play(120, 'sawtooth', 0.12, 0.1, 0.05);
  }

  miss() {
    this._play(220, 'triangle', 0.25, 0.1);
  }

  victory() {
    const notes = [523, 659, 784, 659, 784, 1047];
    notes.forEach((f, i) => this._play(f, 'sine', 0.5, 0.15, i * 0.18));
  }

  ultimateCharge() {
    for (let i = 0; i < 8; i++) {
      this._play(200 + i * 80, 'sine', 0.3, 0.08, i * 0.1);
    }
  }

  destroy() {
    if (this._ctx) { this._ctx.close(); this._ctx = null; }
  }
}