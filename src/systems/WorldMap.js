export class WorldMap {
  constructor(canvas, state) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.state   = state;
    this.running = false;
    this.TILE    = 32;
    this.time    = 0;
    this.timeSpeed = 0.00006;
    this.keys    = {};

    // World size
    this.WORLD_W = 1920;
    this.WORLD_H = 1080;

    // Camera
    this.camera = { x: 0, y: 0 };

    // Hero — start in upper-left area, NOT at bottom
    this.hero = {
      x: 200, y: 300,
      targetX: 200, targetY: 300,
      speed: 2.4,
      direction: 'down',
      frame: 0,
      frameTimer: 0,
      moving: false,
      name: state.hero.name,
    };

    this.onEnterDungeon  = null;
    this._pendingDungeon = null;

    this.dungeons = [
      { id: 'insecurity', x: 320,  y: 280,  label: 'Rose Forest',    emoji: '🖤', color: '#6b2d5e', glowColor: 'rgba(107,45,94,0.7)'   },
      { id: 'jealousy',   x: 680,  y: 240,  label: 'Night Bridge',   emoji: '💚', color: '#2d6b3a', glowColor: 'rgba(45,107,58,0.7)'    },
      { id: 'fear',       x: 1040, y: 320,  label: 'Dark Shore',     emoji: '🌑', color: '#1a1a3e', glowColor: 'rgba(26,26,62,0.7)'     },
      { id: 'doubt',      x: 680,  y: 580,  label: 'Fog Valley',     emoji: '🌫️', color: '#3a3a5e', glowColor: 'rgba(58,58,94,0.7)'    },
      { id: 'loneliness', x: 1040, y: 640,  label: 'Shadow Castle',  emoji: '💜', color: '#4a1a6e', glowColor: 'rgba(74,26,110,0.7)'    },
    ];

    this._updateUnlocks();
    this._buildWorld();
    this._setupInput();
  }

  _updateUnlocks() {
    const defeated = this.state.defeatedBosses;
    const order    = ['insecurity','jealousy','fear','doubt','loneliness'];
    this.dungeons.forEach((d, i) => {
      d.done     = defeated.includes(d.id);
      d.unlocked = i === 0 || defeated.includes(order[i - 1]);
    });
  }

  _buildWorld() {
    // Tile grid: 0=grass, 1=dirt path, 2=water, 3=dark grass
    const C = Math.ceil(this.WORLD_W / this.TILE);
    const R = Math.ceil(this.WORLD_H / this.TILE);
    this.tiles = [];

    for (let r = 0; r < R; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < C; c++) {
        // Water border
        if (r < 2 || r >= R - 2 || c < 2 || c >= C - 2) {
          this.tiles[r][c] = 2;
        } else {
          this.tiles[r][c] = 0;
        }
      }
    }

    // Dirt paths connecting dungeons
    const paths = [
      { r1: 9,  c1: 5,  r2: 9,  c2: 21 },
      { r1: 9,  c1: 21, r2: 18, c2: 21 },
      { r1: 9,  c1: 21, r2: 9,  c2: 33 },
      { r1: 18, c1: 21, r2: 18, c2: 33 },
      { r1: 18, c1: 33, r2: 20, c2: 33 },
    ];
    for (const p of paths) {
      const r1 = Math.min(p.r1,p.r2), r2 = Math.max(p.r1,p.r2);
      const c1 = Math.min(p.c1,p.c2), c2 = Math.max(p.c1,p.c2);
      for (let r = r1; r <= r2; r++)
        for (let c = c1; c <= c2; c++)
          if (this.tiles[r]?.[c] !== undefined) this.tiles[r][c] = 1;
    }

    // Decorations — seeded so they don't move
    this.trees   = [];
    this.flowers = [];
    this.rocks   = [];
    const rng    = (seed, min, max) => min + ((seed * 1664525 + 1013904223) & 0x7fffffff) % (max - min);

    for (let i = 0; i < 80; i++) {
      const x = rng(i * 7 + 1, 80, this.WORLD_W - 80);
      const y = rng(i * 13 + 3, 80, this.WORLD_H - 80);
      if (!this._nearDungeon(x, y, 80)) this.trees.push({ x, y });
    }
    for (let i = 0; i < 150; i++) {
      const x = rng(i * 11 + 5, 70, this.WORLD_W - 70);
      const y = rng(i * 17 + 7, 70, this.WORLD_H - 70);
      const colors = ['#f2a7bb','#c9a7d4','#e8b86d','#ffffff','#ff9eb5'];
      if (!this._nearDungeon(x, y, 60))
        this.flowers.push({ x, y, color: colors[i % 5], phase: (i * 0.618) % (Math.PI * 2) });
    }
    for (let i = 0; i < 30; i++) {
      const x = rng(i * 19 + 9, 80, this.WORLD_W - 80);
      const y = rng(i * 23 + 11, 80, this.WORLD_H - 80);
      if (!this._nearDungeon(x, y, 70)) this.rocks.push({ x, y });
    }
  }

  _nearDungeon(x, y, radius) {
    return this.dungeons.some(d => {
      const dx = x - d.x, dy = y - d.y;
      return Math.sqrt(dx*dx + dy*dy) < radius;
    });
  }

  _setupInput() {
    this._onKeyDown = e => { this.keys[e.key] = true; };
    this._onKeyUp   = e => { this.keys[e.key] = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  handleClick(screenX, screenY) {
    const wx = screenX + this.camera.x;
    const wy = screenY + this.camera.y;

    // Check dungeon click
    for (const d of this.dungeons) {
      const dx = wx - d.x, dy = wy - d.y;
      if (Math.sqrt(dx*dx + dy*dy) < 44 && d.unlocked && !d.done) {
        this.hero.targetX    = d.x;
        this.hero.targetY    = d.y + 50;
        this._pendingDungeon = d.id;
        return;
      }
    }

    // Walk to spot — clamp well inside world
    this.hero.targetX    = Math.max(80, Math.min(this.WORLD_W - 80, wx));
    this.hero.targetY    = Math.max(80, Math.min(this.WORLD_H - 200, wy)); // prevent going to bottom
    this._pendingDungeon = null;
  }

  update() {
    this.time = (this.time + this.timeSpeed) % 1;

    const h   = this.hero;
    const spd = 3.5;

    // Keyboard movement
    let moved = false;
    if (this.keys['ArrowLeft']  || this.keys['a'] || this.keys['A']) { h.targetX -= spd; h.direction = 'left';  moved = true; }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { h.targetX += spd; h.direction = 'right'; moved = true; }
    if (this.keys['ArrowUp']    || this.keys['w'] || this.keys['W']) { h.targetY -= spd; h.direction = 'up';    moved = true; }
    if (this.keys['ArrowDown']  || this.keys['s'] || this.keys['S']) { h.targetY += spd; h.direction = 'down';  moved = true; }

    // Clamp target to SAFE area — not bottom of world
    h.targetX = Math.max(80, Math.min(this.WORLD_W - 80,  h.targetX));
    h.targetY = Math.max(80, Math.min(this.WORLD_H - 200, h.targetY));

    // Smooth movement toward target
    const dx   = h.targetX - h.x;
    const dy   = h.targetY - h.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 3) {
      h.moving = true;
      h.x += (dx / dist) * h.speed;
      h.y += (dy / dist) * h.speed;
      if (!moved) {
        if (Math.abs(dx) > Math.abs(dy)) h.direction = dx > 0 ? 'right' : 'left';
        else                              h.direction = dy > 0 ? 'down'  : 'up';
      }
      h.frameTimer++;
      if (h.frameTimer > 10) { h.frame = (h.frame + 1) % 4; h.frameTimer = 0; }
    } else {
      h.moving = false;
      h.frame  = 0;
      if (this._pendingDungeon) {
        const id = this._pendingDungeon;
        this._pendingDungeon = null;
        setTimeout(() => this.onEnterDungeon?.(id), 200);
      }
    }

    // Camera: centered on hero, clamped to world
    this.camera.x = Math.max(0, Math.min(
      this.WORLD_W - this.canvas.width,
      h.x - this.canvas.width  / 2
    ));
    this.camera.y = Math.max(0, Math.min(
      this.WORLD_H - this.canvas.height,
      h.y - this.canvas.height / 2
    ));
  }

  draw() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    this._drawSky(ctx, W, H);

    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));
    this._drawTiles(ctx);
    this._drawDecorations(ctx);
    this._drawPaths(ctx);
    this._drawDungeons(ctx);
    this._drawHero(ctx);
    ctx.restore();

    this._drawHUD(ctx, W, H);
  }

  _drawSky(ctx, W, H) {
    const t = this.time;
    let top, bot;
    if      (t < 0.2)  { const p = t/0.2;       top = this._lerp('#0d0714','#ff6b35',p); bot = this._lerp('#150d1e','#ffb347',p); }
    else if (t < 0.3)  { const p = (t-0.2)/0.1; top = this._lerp('#ff6b35','#5a9fd4',p); bot = this._lerp('#ffb347','#87ceeb',p); }
    else if (t < 0.7)  { top = '#3a7ab8'; bot = '#6ab4d4'; }
    else if (t < 0.8)  { const p = (t-0.7)/0.1; top = this._lerp('#3a7ab8','#c0392b',p); bot = this._lerp('#6ab4d4','#f39c12',p); }
    else               { const p = (t-0.8)/0.2; top = this._lerp('#c0392b','#0d0714',p); bot = this._lerp('#f39c12','#150d1e',p); }

    const g = ctx.createLinearGradient(0,0,0,H*0.55);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Stars at night
    const nightOpacity = t < 0.25 ? (1 - t/0.2) : t > 0.75 ? ((t-0.75)/0.1) : 0;
    if (nightOpacity > 0) {
      for (let i = 0; i < 70; i++) {
        const sx = (i * 157.3) % W;
        const sy = (i * 89.7)  % (H * 0.5);
        ctx.globalAlpha = nightOpacity * (0.5 + (i%3)*0.2);
        ctx.fillStyle   = '#ffffff';
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }

    // Sun / moon
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const bx    = W/2 + Math.cos(angle) * W * 0.42;
    const by    = H * 0.28 + Math.sin(angle) * H * 0.3;

    if (t > 0.2 && t < 0.8) {
      const sg = ctx.createRadialGradient(bx,by,0,bx,by,24);
      sg.addColorStop(0,'#fff7a0'); sg.addColorStop(1,'rgba(255,220,50,0)');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(bx,by,24,0,Math.PI*2); ctx.fill();
    } else {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle   = '#d0d8ff';
      ctx.beginPath(); ctx.arc(bx,by,14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle   = top; // crescent mask
      ctx.beginPath(); ctx.arc(bx+5,by-3,11,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  _drawTiles(ctx) {
    const T    = this.TILE;
    const camL = Math.max(0, Math.floor(this.camera.x / T) - 1);
    const camT = Math.max(0, Math.floor(this.camera.y / T) - 1);
    const camR = Math.min((this.tiles[0]?.length ?? 0), Math.ceil((this.camera.x + this.canvas.width)  / T) + 1);
    const camB = Math.min(this.tiles.length,             Math.ceil((this.camera.y + this.canvas.height) / T) + 1);

    for (let r = camT; r < camB; r++) {
      for (let c = camL; c < camR; c++) {
        const type = this.tiles[r]?.[c] ?? 0;
        const x = c * T, y = r * T;

        if (type === 2) {
          // Pixel water — alternating blue tiles
          ctx.fillStyle = (r+c)%2===0 ? '#1a3a6e' : '#1e4480';
          ctx.fillRect(x, y, T, T);
          // Wave shimmer pixel
          if ((Math.floor(this.time*20) + c + r) % 4 === 0) {
            ctx.fillStyle = 'rgba(150,200,255,0.25)';
            ctx.fillRect(x+4, y+T*0.4, T-8, 3);
          }
        } else if (type === 1) {
          // Dirt path — pixel style
          ctx.fillStyle = (r+c)%2===0 ? '#7a5535' : '#8b6340';
          ctx.fillRect(x, y, T, T);
          // Pixel pebbles
          ctx.fillStyle = '#6a4828';
          ctx.fillRect(x+6,  y+6,  4, 4);
          ctx.fillRect(x+20, y+18, 3, 3);
        } else {
          // Grass — pixel checkerboard
          ctx.fillStyle = (r+c)%2===0 ? '#3d6b34' : '#456e3b';
          ctx.fillRect(x, y, T, T);
          // Pixel grass blades
          if ((r+c*3)%5===0) {
            ctx.fillStyle = '#5a9c4f';
            ctx.fillRect(x+4,  y,   3, 5);
            ctx.fillRect(x+14, y+1, 3, 4);
            ctx.fillRect(x+24, y,   3, 5);
          }
        }

        // Pixel tile border
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(x,y,T,T);
      }
    }
  }

  _drawDecorations(ctx) {
    const cx = this.camera.x, cy = this.camera.y;
    const cw = this.canvas.width,  ch = this.canvas.height;

    // Pixel trees
    for (const t of this.trees) {
      if (t.x < cx-60 || t.x > cx+cw+60 || t.y < cy-80 || t.y > cy+ch+80) continue;
      const x = t.x, y = t.y;
      // Trunk — pixel blocks
      ctx.fillStyle = '#5c3d1e';
      ctx.fillRect(x-4, y+10, 8, 20);
      // Canopy — pixel blocks (Terraria style)
      ctx.fillStyle = '#2d5a1b';
      ctx.fillRect(x-16, y-4,  32, 8);
      ctx.fillRect(x-12, y-12, 24, 8);
      ctx.fillRect(x-8,  y-20, 16, 8);
      ctx.fillRect(x-4,  y-28, 8,  8);
      // Highlight
      ctx.fillStyle = '#3a7024';
      ctx.fillRect(x-8,  y-4,  8, 4);
      ctx.fillRect(x-4,  y-12, 8, 4);
    }

    // Pixel flowers
    for (const f of this.flowers) {
      if (f.x < cx-20 || f.x > cx+cw+20 || f.y < cy-20 || f.y > cy+ch+20) continue;
      const bob = Math.floor(Math.sin(this.time*6 + f.phase) * 1.5);
      // Stem
      ctx.fillStyle = '#3a7024';
      ctx.fillRect(f.x, f.y+4+bob, 2, 6);
      // Petals — pixel cross
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x-3, f.y+bob,   8, 2);
      ctx.fillRect(f.x,   f.y-3+bob, 2, 8);
      // Center
      ctx.fillStyle = '#fff7a0';
      ctx.fillRect(f.x-1, f.y-1+bob, 4, 4);
    }

    // Pixel rocks
    for (const r of this.rocks) {
      if (r.x < cx-30 || r.x > cx+cw+30 || r.y < cy-30 || r.y > cy+ch+30) continue;
      ctx.fillStyle = '#5a5a6a';
      ctx.fillRect(r.x,    r.y+6,  20, 10);
      ctx.fillRect(r.x+2,  r.y+2,  16, 14);
      ctx.fillRect(r.x+4,  r.y,    12, 16);
      ctx.fillStyle = '#7a7a8a';
      ctx.fillRect(r.x+4,  r.y+2,  6,  4);
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(r.x+14, r.y+10, 4,  4);
    }
  }

  _drawPaths(ctx) {
    // Draw connecting lines between dungeons
    ctx.strokeStyle = 'rgba(232,184,109,0.25)';
    ctx.lineWidth   = 3;
    ctx.setLineDash([8, 6]);
    const order = this.dungeons;
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i], b = order[i+1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  _drawDungeons(ctx) {
    const t = this.time * Math.PI * 2;
    for (const d of this.dungeons) {
      const x = d.x, y = d.y;
      const pulse = Math.sin(t * 2) * 0.25 + 0.75;

      ctx.globalAlpha = d.unlocked ? 1 : 0.4;

      // Ground shadow pixel
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x-26, y+28, 52, 10);

      // Glow ring
      const glow = ctx.createRadialGradient(x,y,8,x,y,46);
      glow.addColorStop(0,   d.glowColor);
      glow.addColorStop(0.7, d.glowColor.replace(/[\d.]+\)$/, `${0.25*pulse})`));
      glow.addColorStop(1,  'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x,y,46*pulse,0,Math.PI*2); ctx.fill();

      // Pixel portal arch — chunky Terraria style
      const pc = d.done ? '#e8b86d' : (d.unlocked ? d.color : '#2a2a2a');
      // Base blocks
      ctx.fillStyle = pc;
      ctx.fillRect(x-24, y-8,  8, 40);  // left pillar
      ctx.fillRect(x+16, y-8,  8, 40);  // right pillar
      ctx.fillRect(x-16, y-24, 32, 8);  // top beam
      ctx.fillRect(x-24, y-16, 8,  8);  // top-left
      ctx.fillRect(x+16, y-16, 8,  8);  // top-right

      // Pixel highlight on pillars
      ctx.fillStyle = d.done ? '#ffd080' : (d.unlocked ? '#ffffff' : '#444');
      ctx.globalAlpha *= 0.3;
      ctx.fillRect(x-24, y-8, 3, 40);
      ctx.fillRect(x-16, y-24, 32, 3);
      ctx.globalAlpha = d.unlocked ? 1 : 0.4;

      // Portal inner — swirling pixels
      if (d.unlocked && !d.done) {
        const inner = ctx.createRadialGradient(x,y+4,2,x,y+4,18);
        inner.addColorStop(0, `rgba(255,255,255,${0.7*pulse})`);
        inner.addColorStop(0.5, d.glowColor);
        inner.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = inner;
        ctx.fillRect(x-16, y-16, 32, 36);

        // Orbiting pixels
        for (let i = 0; i < 6; i++) {
          const a  = t * 1.6 + (i/6)*Math.PI*2;
          const px = x + Math.cos(a)*24;
          const py = y + Math.sin(a)*14;
          ctx.fillStyle = `rgba(255,255,255,${0.4+Math.sin(a+t)*0.3})`;
          ctx.fillRect(px-2, py-2, 4, 4);
        }
      }

      if (d.done) {
        ctx.fillStyle   = '#e8b86d';
        ctx.font        = 'bold 14px monospace';
        ctx.textAlign   = 'center';
        ctx.fillText('✓', x, y+8);
      }

      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = d.unlocked ? '#fff8f4' : 'rgba(255,248,244,0.35)';
      ctx.font      = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.emoji} ${d.label}`, x, y+52);
      if (!d.unlocked) {
        ctx.fillStyle = 'rgba(255,248,244,0.3)';
        ctx.font      = '9px monospace';
        ctx.fillText('🔒 locked', x, y+64);
      }
      ctx.textAlign = 'left';
    }
  }

  _drawHero(ctx) {
    const h   = this.hero;
    const x   = Math.floor(h.x);
    const y   = Math.floor(h.y);
    const T   = 4; // pixel size multiplier
    const bob = h.moving ? Math.floor(Math.sin(this.time * 12) * 2) : 0;

    // Pixel shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x-10, y+22, 20, 6);

    // Glow aura
    const aura = ctx.createRadialGradient(x,y,4,x,y,28);
    aura.addColorStop(0,'rgba(242,167,187,0.3)');
    aura.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(x,y,28,0,Math.PI*2); ctx.fill();

    const flip = h.direction === 'left' ? -1 : 1;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(flip, 1);

    // === PIXEL CHIARA ===
    // Hair (top)
    ctx.fillStyle = '#c9a7d4';
    ctx.fillRect(-8, -20, 16, 4);
    ctx.fillRect(-10,-16, 20, 4);
    ctx.fillRect(-10,-12, 4,  8); // left hair
    ctx.fillRect( 6, -12, 4,  8); // right hair

    // Face
    ctx.fillStyle = '#f2c4d0';
    ctx.fillRect(-6, -12, 12, 10);

    // Eyes
    if (h.direction !== 'up') {
      const blink = Math.sin(this.time*3) > 0.92;
      ctx.fillStyle = '#3b1f2e';
      ctx.fillRect(-4, -9, 3, blink ? 1 : 3);
      ctx.fillRect( 1, -9, 3, blink ? 1 : 3);
      // Blush
      ctx.fillStyle = 'rgba(242,167,187,0.6)';
      ctx.fillRect(-6, -7, 2, 2);
      ctx.fillRect( 4, -7, 2, 2);
    }

    // Body / dress
    ctx.fillStyle = '#e8a0b8';
    ctx.fillRect(-6, -2, 12, 12);
    ctx.fillStyle = '#f2a7bb';
    ctx.fillRect(-8,  2, 16, 8);
    ctx.fillRect(-10, 8, 20, 6); // skirt flare

    // Arms
    const armSwing = h.moving ? Math.floor(Math.sin(this.time*12)*3) : 0;
    ctx.fillStyle = '#f2c4d0';
    ctx.fillRect(-10, -1+armSwing, 4, 8);
    ctx.fillRect(  6, -1-armSwing, 4, 8);

    // Legs
    const legSwing = h.moving ? Math.floor(Math.sin(this.time*12)*3) : 0;
    ctx.fillStyle = '#c9a7d4';
    ctx.fillRect(-6, 14+legSwing,  4, 8);
    ctx.fillRect( 2, 14-legSwing,  4, 8);

    ctx.restore();

    // Floating name — pixel font style
    const nameY  = y - 30 + Math.floor(Math.sin(this.time*3)*2);
    ctx.font      = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(h.name, x+1, nameY+1);
    ctx.fillStyle = '#f2a7bb';
    ctx.fillText(h.name, x, nameY);
    ctx.textAlign = 'left';
  }

  _drawHUD(ctx, W, H) {
    // Time of day
    const label = this.time < 0.2 ? '🌙 Night'
                : this.time < 0.3 ? '🌅 Dawn'
                : this.time < 0.7 ? '☀️ Day'
                : this.time < 0.8 ? '🌇 Dusk'
                :                   '🌙 Night';
    ctx.fillStyle = 'rgba(10,5,16,0.7)';
    ctx.beginPath(); ctx.roundRect(10, 10, 100, 28, 6); ctx.fill();
    ctx.fillStyle = '#fff8f4';
    ctx.font      = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, 16, 29);

    // Controls hint
    ctx.fillStyle = 'rgba(10,5,16,0.6)';
    ctx.beginPath(); ctx.roundRect(10, H-38, 260, 26, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,248,244,0.45)';
    ctx.font      = '10px monospace';
    ctx.fillText('Click to move  ·  WASD / Arrow keys', 16, H-21);
  }

  _lerp(a, b, t) {
    const h2r = h => parseInt(h.replace('#','').slice(0,2),16);
    const h2g = h => parseInt(h.replace('#','').slice(2,4),16);
    const h2b = h => parseInt(h.replace('#','').slice(4,6),16);
    const r   = Math.round(h2r(a)+(h2r(b)-h2r(a))*t);
    const g   = Math.round(h2g(a)+(h2g(b)-h2g(a))*t);
    const bv  = Math.round(h2b(a)+(h2b(b)-h2b(a))*t);
    return `rgb(${r},${g},${bv})`;
  }

  start() {
    this.running = true;
    this._loop();
  }

  _loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    this._raf = requestAnimationFrame(() => this._loop());
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }
}