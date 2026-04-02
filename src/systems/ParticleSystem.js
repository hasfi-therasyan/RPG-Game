export class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = true;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._loop();
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnPetals(count = 12, x, y) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'petal',
        x: x ?? Math.random() * this.canvas.width,
        y: y ?? -10,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1.5 + 0.8,
        size: Math.random() * 10 + 6,
        opacity: Math.random() * 0.6 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        color: `hsl(${330 + Math.random() * 30}, 80%, ${70 + Math.random() * 15}%)`,
        life: 1,
        decay: Math.random() * 0.004 + 0.002,
      });
    }
  }

  spawnBurst(x, y, count = 16, type = 'heart') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        type,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 12 + 6,
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        color: type === 'heart'
          ? `hsl(${340 + Math.random() * 20}, 85%, 70%)`
          : `hsl(${260 + Math.random() * 30}, 60%, 50%)`,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        gravity: 0.12,
      });
    }
  }

  spawnSmoke(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 1.5 + 0.5),
        size: Math.random() * 20 + 10,
        opacity: Math.random() * 0.4 + 0.2,
        color: `hsl(${270 + Math.random() * 30}, 30%, ${20 + Math.random() * 15}%)`,
        life: 1,
        decay: Math.random() * 0.008 + 0.005,
      });
    }
  }

  spawnFloatingPetals() {
    if (Math.random() < 0.04) this.spawnPetals(1);
  }

  _drawHeart(ctx, x, y, size, opacity, color) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.beginPath();
    const s = size * 0.06;
    ctx.moveTo(0, s * 4);
    ctx.bezierCurveTo(-s * 8, 0, -s * 8, -s * 5, 0, -s * 3);
    ctx.bezierCurveTo(s * 8, -s * 5, s * 8, 0, 0, s * 4);
    ctx.fill();
    ctx.restore();
  }

  _drawPetal(ctx, x, y, size, opacity, color, rotation) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _loop() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.spawnFloatingPetals();

    this.particles = this.particles.filter(p => p.life > 0);

    for (const p of this.particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      if (p.gravity) p.vy += p.gravity;
      if (p.rotSpeed) p.rotation = (p.rotation || 0) + p.rotSpeed;
      p.life -= p.decay;
      p.opacity = p.life * (p.type === 'smoke' ? 0.4 : 0.9);

      if (p.type === 'heart') {
        this._drawHeart(this.ctx, p.x, p.y, p.size, Math.max(0, p.opacity), p.color);
      } else if (p.type === 'petal') {
        this._drawPetal(this.ctx, p.x, p.y, p.size, Math.max(0, p.opacity), p.color, p.rotation || 0);
      } else if (p.type === 'smoke') {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else if (p.type === 'spark') {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    requestAnimationFrame(() => this._loop());
  }

  destroy() {
    this.running = false;
    window.removeEventListener('resize', this._resize);
  }
}