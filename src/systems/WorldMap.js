export class WorldMap {
  constructor(canvas, state) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.state     = state;
    this.running   = false;
    this.TILE      = 32;
    this.time      = 0;
    this.timeSpeed = 0.00006;
    this.keys      = {};
    this.rightMouseDown = false;

    this.WORLD_W = 2400;
    this.WORLD_H = 1800;

    this.camera = { x: 0, y: 0 };

    // Define 5 sectors
    this.sectors = {
      center:   { x: 1200, y: 900,   theme: 'spring', season: '🌸 Spring', color: '#90EE90', particleColor: '#FFB7C5' },
      topLeft:  { x: 400,  y: 300,   theme: 'winter', season: '❄️ Winter', color: '#B0C4DE', particleColor: '#FFFFFF' },
      topRight: { x: 2000, y: 300,   theme: 'autumn', season: '🍂 Autumn', color: '#D2691E', particleColor: '#FFA500' },
      bottomLeft: { x: 400,  y: 1500,  theme: 'summer', season: '☀️ Summer', color: '#FFD700', particleColor: '#FFE4B5' },
      bottomRight: { x: 2000, y: 1500,  theme: 'monsoon', season: '🌧️ Monsoon', color: '#4A6FA5', particleColor: '#87CEEB' }
    };

    // In constructor, update the hero object:
    this.hero = {
      x: 1200, y: 900,
      targetX: 1200, targetY: 900,
      speed: 2.4,
      direction: 'down',
      frame: 0,
      frameTimer: 0,
      moving: false,
      name: state.hero.name,
      carryingMomo: false,
      momoCarryOffset: { x: 0, y: -28 },
      currentSector: 'center',
      // Jump properties
      isJumping: false,
      jumpVelocity: 0,
      jumpHeight: 0,
      originalY: 900,
      jumpPower: -8,
      gravity: 0.5
    };
    

    this.onEnterDungeon  = null;
    this._pendingDungeon = null;

    // Dungeons placed in each sector (in order of progression)
    this.dungeons = [
      { 
        id: 'insecurity', 
        x: 1200, y: 700,
        sector: 'center',
        label: 'Whispering Grove',   
        emoji: '🍃', 
        color: '#6b2d5e', 
        glowColor: 'rgba(107,45,94,0.7)',
        order: 1
      },
      { 
        id: 'jealousy',   
        x: 400, y: 300,
        sector: 'topLeft',
        label: 'Frozen Heart',    
        emoji: '❄️', 
        color: '#2d6b3a', 
        glowColor: 'rgba(45,107,58,0.7)',
        order: 2
      },
      { 
        id: 'fear',       
        x: 2000, y: 300,
        sector: 'topRight',
        label: 'Shadowfall Woods', 
        emoji: '🍂', 
        color: '#1a1a3e', 
        glowColor: 'rgba(26,26,62,0.7)',
        order: 3
      },
      { 
        id: 'doubt',      
        x: 400, y: 1500,
        sector: 'bottomLeft',
        label: 'Sunken Ruins',    
        emoji: '☀️', 
        color: '#3a3a5e', 
        glowColor: 'rgba(58,58,94,0.7)',
        order: 4
      },
      { 
        id: 'loneliness', 
        x: 2000, y: 1500,
        sector: 'bottomRight',
        label: 'Rainspire',       
        emoji: '🌧️', 
        color: '#4a1a6e', 
        glowColor: 'rgba(74,26,110,0.7)',
        order: 5
      },
    ];

    // Particles for each sector
    this.particles = {
      center: [],
      topLeft: [],
      topRight: [],
      bottomLeft: [],
      bottomRight: []
    };
    
    this._updateUnlocks();
    this._buildWorld();
    this._setupInput();
    this._initParticles();
  }

  _initParticles() {
    // Create particles for each sector
    const centerX = 1200;
    const centerY = 900;
    const centerRadius = 350;
    
    for (let sector in this.sectors) {
      const count = 100;
      const theme = this.sectors[sector].theme;
      
      for (let i = 0; i < count; i++) {
        let x, y, particleType;
        
        // Set particle area based on sector with circular center
      switch(sector) {
        case 'center': {
          // Circular area
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * centerRadius;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
          break;
        }
        case 'topLeft': {
          x = Math.random() * (centerX - centerRadius);
          y = Math.random() * (centerY - centerRadius);
          break;
        }
        case 'topRight': {
          x = (centerX + centerRadius) + Math.random() * (this.WORLD_W - (centerX + centerRadius));
          y = Math.random() * (centerY - centerRadius);
          break;
        }
        case 'bottomLeft': {
          x = Math.random() * (centerX - centerRadius);
          y = (centerY + centerRadius) + Math.random() * (this.WORLD_H - (centerY + centerRadius));
          break;
        }
        case 'bottomRight': {
          x = (centerX + centerRadius) + Math.random() * (this.WORLD_W - (centerX + centerRadius));
          y = (centerY + centerRadius) + Math.random() * (this.WORLD_H - (centerY + centerRadius));
          break;
        }
        default: {
          x = 900 + Math.random() * 600;
          y = 600 + Math.random() * 600;
        }}
        
        // Particle type based on theme
        switch(theme) {
          case 'spring':
            particleType = { type: 'flower', color: '#FFB7C5', size: 2 + Math.random() * 3 };
            break;
          case 'winter':
            particleType = { type: 'snow', color: '#FFFFFF', size: 1 + Math.random() * 2 };
            break;
          case 'autumn':
            particleType = { type: 'leaf', color: '#FFA500', size: 2 + Math.random() * 3 };
            break;
          case 'summer':
            particleType = { type: 'sparkle', color: '#FFE4B5', size: 1 + Math.random() * 2 };
            break;
          case 'monsoon':
            particleType = { type: 'raindrop', color: '#87CEEB', size: 1 + Math.random() * 2 };
            break;
          default:
            particleType = { type: 'flower', color: '#FFB7C5', size: 2 };
        }
        
        this.particles[sector].push({
          x, y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: Math.random() * 1 + 0.5,
          life: 100 + Math.random() * 200,
          ...particleType,
          angle: Math.random() * Math.PI * 2,
          rotation: Math.random() * 0.1
        });
      }
    }
  }



// Update _updateParticles() respawn logic
  _updateParticles() {
    const centerX = 1200;
    const centerY = 900;
    const centerRadius = 350;
    
    for (let sector in this.particles) {
      for (let i = this.particles[sector].length - 1; i >= 0; i--) {
        const p = this.particles[sector][i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.angle += p.rotation;
        
        // Reset particles that go out of bounds or die
        if (p.life <= 0 || p.y > this.WORLD_H + 100 || p.x < -100 || p.x > this.WORLD_W + 100) {
          // Respawn at random position within sector
          switch(sector) {
            case 'center': {
              const angle = Math.random() * Math.PI * 2;
              const radius = Math.random() * centerRadius;
              p.x = centerX + Math.cos(angle) * radius;
              p.y = centerY + Math.sin(angle) * radius;
              break;
            }
            case 'topLeft': {
              p.x = Math.random() * (centerX - centerRadius);
              p.y = Math.random() * (centerY - centerRadius);
              break;
            }
            case 'topRight': {
              p.x = (centerX + centerRadius) + Math.random() * (this.WORLD_W - (centerX + centerRadius));
              p.y = Math.random() * (centerY - centerRadius);
              break;
            }
            case 'bottomLeft': {
              p.x = Math.random() * (centerX - centerRadius);
              p.y = (centerY + centerRadius) + Math.random() * (this.WORLD_H - (centerY + centerRadius));
              break;
            }
            case 'bottomRight': {
              p.x = (centerX + centerRadius) + Math.random() * (this.WORLD_W - (centerX + centerRadius));
              p.y = (centerY + centerRadius) + Math.random() * (this.WORLD_H - (centerY + centerRadius));
              break;
            }
          }
          p.life = 100 + Math.random() * 200;
        }
      }
    }
  }

  _updateUnlocks() {
    const defeated = this.state.defeatedBosses;
    // Sort dungeons by order
    const sortedDungeons = [...this.dungeons].sort((a, b) => a.order - b.order);
    
    this.dungeons.forEach((d) => {
      d.done = defeated.includes(d.id);
      // Unlock in order: first dungeon always unlocked, others require previous boss defeated
      if (d.order === 1) {
        d.unlocked = true;
      } else {
        const previousDungeon = sortedDungeons[d.order - 2];
        d.unlocked = defeated.includes(previousDungeon.id);
      }
    });
  }

_buildWorld() {
  const C = Math.ceil(this.WORLD_W / this.TILE);
  const R = Math.ceil(this.WORLD_H / this.TILE);
  this.tiles = [];

  // Center point and radius
  const centerX = 1200;
  const centerY = 900;
  const centerRadius = 350;

  for (let r = 0; r < R; r++) {
    this.tiles[r] = [];
    for (let c = 0; c < C; c++) {
      const x = c * this.TILE + this.TILE/2;
      const y = r * this.TILE + this.TILE/2;
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Water borders
      if (r < 2 || r >= R - 2 || c < 2 || c >= C - 2) {
        this.tiles[r][c] = 2;
      }
      // Center sector (circular)
      else if (distFromCenter <= centerRadius) {
        this.tiles[r][c] = 0; // Grass (Spring)
      }
      // Surrounding sectors
      else {
        // Determine which quadrant the tile is in
        if (x < centerX && y < centerY) {
          this.tiles[r][c] = 3; // Snow (Winter)
        }
        // Top-Right (Autumn)
        else if (x > centerX && y < centerY) {
          this.tiles[r][c] = 4; // Autumn leaves
        }
        // Bottom-Left (Summer)
        else if (x < centerX && y > centerY) {
          this.tiles[r][c] = 5; // Sand (Summer)
        }
        // Bottom-Right (Monsoon)
        else if (x > centerX && y > centerY) {
          this.tiles[r][c] = 6; // Wet ground (Monsoon)
        }
        // On the axes - assign based on primary direction
        else if (x === centerX && y < centerY) {
          this.tiles[r][c] = 3; // Top - Winter
        }
        else if (x === centerX && y > centerY) {
          this.tiles[r][c] = 5; // Bottom - Summer
        }
        else if (x < centerX && y === centerY) {
          this.tiles[r][c] = 3; // Left - Winter
        }
        else if (x > centerX && y === centerY) {
          this.tiles[r][c] = 4; // Right - Autumn
        }
        else {
          this.tiles[r][c] = 0; // Fallback
        }
      }
    }
  }

  // Define house at center
  this.house = { x: 1200, y: 900, width: 80, height: 60 };

  // Build pathways
  this._buildPathways();
  
  // Rest of decorations...
  this.trees = [];
  this.flowers = [];
  this.rocks = [];

  // Add decorations based on sector
  for (let i = 0; i < 200; i++) {
    let x, y;
    const rand = Math.random();
    
    if (rand < 0.2) {
      x = 400 + Math.random() * 400;
      y = 300 + Math.random() * 300;
    } else if (rand < 0.4) {
      x = 1600 + Math.random() * 400;
      y = 300 + Math.random() * 300;
    } else if (rand < 0.6) {
      x = 400 + Math.random() * 400;
      y = 1200 + Math.random() * 300;
    } else if (rand < 0.8) {
      x = 1600 + Math.random() * 400;
      y = 1200 + Math.random() * 300;
    } else {
      x = 900 + Math.random() * 600;
      y = 600 + Math.random() * 600;
    }
    
    if (!this._nearDungeon(x, y, 80) && !this._nearHouse(x, y, 60)) {
      this.trees.push({ x, y });
    }
  }
  
  for (let i = 0; i < 300; i++) {
    let x, y;
    const rand = Math.random();
    
    if (rand < 0.2) {
      x = 400 + Math.random() * 400;
      y = 300 + Math.random() * 300;
    } else if (rand < 0.4) {
      x = 1600 + Math.random() * 400;
      y = 300 + Math.random() * 300;
    } else if (rand < 0.6) {
      x = 400 + Math.random() * 400;
      y = 1200 + Math.random() * 300;
    } else if (rand < 0.8) {
      x = 1600 + Math.random() * 400;
      y = 1200 + Math.random() * 300;
    } else {
      x = 900 + Math.random() * 600;
      y = 600 + Math.random() * 600;
    }
    
    const colors = {
      center: '#FFB7C5',
      topLeft: '#B0C4DE',
      topRight: '#FFA500',
      bottomLeft: '#FFD700',
      bottomRight: '#87CEEB'
    };
    
    let randomColor;
    if (x < 800 && y < 600) randomColor = colors.topLeft;
    else if (x > 1600 && y < 600) randomColor = colors.topRight;
    else if (x < 800 && y > 1200) randomColor = colors.bottomLeft;
    else if (x > 1600 && y > 1200) randomColor = colors.bottomRight;
    else randomColor = colors.center;
    
    if (!this._nearDungeon(x, y, 60) && !this._nearHouse(x, y, 50)) {
      this.flowers.push({ x, y, color: randomColor, phase: (i * 0.618) % (Math.PI * 2) });
    }
  }

  this._initMomo();
}

  _buildPathways() {
    // Sort dungeons by order
    const sortedDungeons = [...this.dungeons].sort((a, b) => a.order - b.order);
    
    // Create path between each consecutive dungeon
    for (let i = 0; i < sortedDungeons.length - 1; i++) {
      const from = sortedDungeons[i];
      const to = sortedDungeons[i + 1];
      
      // Create a winding path
      const steps = 20;
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        // Add some curve to the path
        const offsetX = Math.sin(t * Math.PI) * 50;
        const offsetY = Math.cos(t * Math.PI * 0.5) * 30;
        
        const pathX = from.x + (to.x - from.x) * t + offsetX;
        const pathY = from.y + (to.y - from.y) * t + offsetY;
        
        const tileX = Math.floor(pathX / this.TILE);
        const tileY = Math.floor(pathY / this.TILE);
        
        if (this.tiles[tileY] && this.tiles[tileY][tileX] !== undefined) {
          this.tiles[tileY][tileX] = 1; // Path tile
        }
      }
    }
    
    // Add path from house to first dungeon
    const firstDungeon = sortedDungeons[0];
    const steps = 15;
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const pathX = this.house.x + (firstDungeon.x - this.house.x) * t;
      const pathY = this.house.y + (firstDungeon.y - this.house.y) * t;
      
      const tileX = Math.floor(pathX / this.TILE);
      const tileY = Math.floor(pathY / this.TILE);
      
      if (this.tiles[tileY] && this.tiles[tileY][tileX] !== undefined) {
        this.tiles[tileY][tileX] = 1;
      }
    }
  }

  _nearDungeon(x, y, radius) {
    return this.dungeons.some(d => {
      const dx = x - d.x, dy = y - d.y;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
  }

  _nearHouse(x, y, radius) {
    const dx = x - this.house.x;
    const dy = y - this.house.y;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  }

  _setupInput() {
    this._onKeyDown = e => {
      this.keys[e.key] = true;
      
      // E key - Pet Momo
      if (e.key === 'e' || e.key === 'E') {
        this._petMomo();
      }
      // F key - Feed Momo
      if (e.key === 'f' || e.key === 'F') {
        this._feedMomo();
      }
      // R key - Toggle pick up/drop Momo
      if (e.key === 'r' || e.key === 'R') {
        if (this.hero.carryingMomo) {
          this._dropMomo();
        } else {
          this._pickupMomo();
        }
        
      }
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        this._jump();
      }
    };
    
    this._onKeyUp = e => { this.keys[e.key] = false; };
    
    // Track right-click state
    this._onMouseDown = e => {
      if (e.button === 2) { // Right button
        this.rightMouseDown = true;
        e.preventDefault(); // Prevent context menu
      }
    };
    
    this._onMouseUp = e => {
      if (e.button === 2) {
        this.rightMouseDown = false;
      }
    };
    
    this._onContextMenu = e => {
      e.preventDefault(); // Disable right-click context menu
    };
    
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('contextmenu', this._onContextMenu);
  }

  _jump() {
    // Only jump if not already jumping
    if (!this.hero.isJumping) {
      this.hero.isJumping = true;
      this.hero.jumpVelocity = this.hero.jumpPower;
      this.hero.originalY = this.hero.y;
    }
  }

  _updateJump() {
    if (this.hero.isJumping) {
      // Apply gravity
      this.hero.jumpVelocity += this.hero.gravity;
      this.hero.y += this.hero.jumpVelocity;
      
      // Check if landed
      if (this.hero.y >= this.hero.originalY) {
        this.hero.y = this.hero.originalY;
        this.hero.isJumping = false;
        this.hero.jumpVelocity = 0;
      }
    }
}


  // ── MOMO FEATURES ─────────────────────────────────────────────────────────

  _initMomo() {
    this.momo = {
      x: 1200, y: 950,
      targetX: 1200, targetY: 950,
      direction: 1,
      frame: 0,
      frameTimer: 0,
      moving: false,
      action: 'idle',
      actionTimer: 0,
      actionDuration: 0,
      tailWag: 0,
      haloSpin: 0,
      rollAngle: 0,
      speechBubble: null,
      speechTimer: 0,
      fatness: 0,
      fatnessDecay: 0,
      isTumbling: false,
      tumbleTimer: 0,
      tumbleVelocity: { x: 0, y: 0 },
      tumbleRotation: 0,
      isPetted: false,
      petParticles: [],
      beingPushed: false,
      pushDirection: { x: 0, y: 0 },
      gift: null,
      giftDropTimer: 0,
    };
    
    this.momoSpeeches = [
      'meow~',
      '*purring*',
      'prrrr...',
      '...zZz',
      '*rolls over*',
      'mrrrow!',
      '*stares at nothing*',
      'nya~',
      '...',
      '*knocks something over*',
    ];
    
    this.giftTypes = ['🌸 Flower', '⭐ Star', '🍂 Leaf', '💎 Gem', '🍄 Mushroom', '🪶 Feather'];
    
    this._nextMomoAction();
  }

  _nextMomoAction() {
    // Don't do actions if tumbling, being carried, pushed, or recently petted
    if (this.momo.isTumbling || this.hero.carryingMomo || this.momo.isPetted || this.momo.beingPushed) {
      setTimeout(() => this._nextMomoAction(), 500);
      return;
    }
    
    const actions = [
      { action: 'walk',  duration: 180 + Math.random() * 120 },
      { action: 'sit',   duration: 200 + Math.random() * 160 },
      { action: 'roll',  duration: 100 + Math.random() * 60  },
      { action: 'spin',  duration: 80  + Math.random() * 40  },
      { action: 'idle',  duration: 160 + Math.random() * 100 },
      { action: 'chase', duration: 120 + Math.random() * 80  },
    ];
    const picked = actions[Math.floor(Math.random() * actions.length)];
    this.momo.action = picked.action;
    this.momo.actionDuration = picked.duration;
    this.momo.actionTimer = 0;

    if (picked.action === 'walk' || picked.action === 'chase') {
      this.momo.targetX = Math.max(100, Math.min(this.WORLD_W - 100,
        this.momo.x + (Math.random() - 0.5) * 300
      ));
      this.momo.targetY = Math.max(100, Math.min(this.WORLD_H - 300,
        this.momo.y + (Math.random() - 0.5) * 200
      ));
    }

    if (Math.random() < 0.45) {
      this.momo.speechBubble = this.momoSpeeches[
        Math.floor(Math.random() * this.momoSpeeches.length)
      ];
      this.momo.speechTimer = 120;
    } else {
      this.momo.speechBubble = null;
      this.momo.speechTimer = 0;
    }
  }

  _handleCollisionPush() {
    // Only push if right mouse button is pressed
    if (!this.rightMouseDown) return;
    
    // Check if Chiara collides with Momo
    const dx = this.momo.x - this.hero.x;
    const dy = this.momo.y - this.hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const collisionDist = 35;
    
    if (dist < collisionDist && !this.hero.carryingMomo && !this.momo.isTumbling) {
      // Calculate push direction (away from hero's movement direction)
      const heroMoveX = this.hero.targetX - this.hero.x;
      const heroMoveY = this.hero.targetY - this.hero.y;
      const moveDist = Math.sqrt(heroMoveX * heroMoveX + heroMoveY * heroMoveY);
      
      let pushDirectionX, pushDirectionY;
      if (moveDist > 0.1) {
        pushDirectionX = heroMoveX / moveDist;
        pushDirectionY = heroMoveY / moveDist;
      } else {
        const angle = Math.atan2(dy, dx);
        pushDirectionX = Math.cos(angle);
        pushDirectionY = Math.sin(angle);
      }
      
      this.momo.beingPushed = true;
      this.momo.pushDirection = { x: pushDirectionX, y: pushDirectionY };
      this.momo.speechBubble = 'mrrOW! 🌀';
      this.momo.speechTimer = 30;
      
      setTimeout(() => {
        this.momo.beingPushed = false;
      }, 200);
    }
  }

  _petMomo() {
    const dx = this.momo.x - this.hero.x;
    const dy = this.momo.y - this.hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 60 && !this.hero.carryingMomo) {
      this.momo.isPetted = true;
      this.momo.speechBubble = 'purrr... 💕';
      this.momo.speechTimer = 80;
      
      this.momo.petParticles = [];
      for (let i = 0; i < 12; i++) {
        this.momo.petParticles.push({
          x: this.momo.x + (Math.random() - 0.5) * 40,
          y: this.momo.y + (Math.random() - 0.5) * 30 - 20,
          life: 60,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
        });
      }
      
      setTimeout(() => {
        this.momo.isPetted = false;
      }, 1500);
    }
  }

  _feedMomo() {
    const dx = this.momo.x - this.hero.x;
    const dy = this.momo.y - this.hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 60 && !this.hero.carryingMomo) {
      this.momo.fatness = Math.min(1, this.momo.fatness + 0.4);
      this.momo.fatnessDecay = 300;
      this.momo.speechBubble = 'nom nom nom 🍖';
      this.momo.speechTimer = 60;
      
      for (let i = 0; i < 8; i++) {
        this.momo.petParticles.push({
          x: this.momo.x + (Math.random() - 0.5) * 30,
          y: this.momo.y + (Math.random() - 0.5) * 20,
          life: 40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2,
        });
      }
    }
  }

  _pickupMomo() {
    const dx = this.momo.x - this.hero.x;
    const dy = this.momo.y - this.hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 50 && !this.hero.carryingMomo && !this.momo.isTumbling && !this.momo.beingPushed) {
      this.hero.carryingMomo = true;
      this.momo.speechBubble = 'meow? 🧡';
      this.momo.speechTimer = 50;
      this.momo.beingPushed = false;
      this.momo.isTumbling = false;
    }
  }

  _dropMomo() {
    if (this.hero.carryingMomo) {
      this.hero.carryingMomo = false;
      this.momo.x = this.hero.x + (this.hero.direction === 'left' ? -30 : 30);
      this.momo.y = this.hero.y + 20;
      this.momo.speechBubble = 'mrrrow!';
      this.momo.speechTimer = 40;
    }
  }

  _dropGift() {
    if (!this.momo.gift && Math.random() < 0.005 && !this.hero.carryingMomo && !this.momo.beingPushed) {
      const giftType = this.giftTypes[Math.floor(Math.random() * this.giftTypes.length)];
      this.momo.gift = {
        type: giftType,
        x: this.momo.x + (Math.random() - 0.5) * 40,
        y: this.momo.y + 20,
        collected: false,
      };
      this.momo.speechBubble = `🎁 for you!`;
      this.momo.speechTimer = 60;
    }
    
    if (this.momo.gift && !this.momo.gift.collected) {
      const dx = this.hero.x - this.momo.gift.x;
      const dy = this.hero.y - this.momo.gift.y;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        this.momo.gift.collected = true;
        this.momo.speechBubble = `❤️ ${this.momo.gift.type}!`;
        this.momo.speechTimer = 50;
        
        for (let i = 0; i < 10; i++) {
          this.momo.petParticles.push({
            x: this.momo.gift.x,
            y: this.momo.gift.y,
            life: 40,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3,
          });
        }
        
        setTimeout(() => {
          this.momo.gift = null;
        }, 100);
      }
    }
  }

  _updateMomo() {
    const m = this.momo;
    m.haloSpin = (m.haloSpin + 0.03) % (Math.PI * 2);
    m.tailWag = Math.sin(this.time * 8) * 0.4;
    
    this._handleCollisionPush();
    
    if (m.fatnessDecay > 0) {
      m.fatnessDecay--;
      if (m.fatnessDecay === 0) {
        m.fatness = Math.max(0, m.fatness - 0.01);
      }
    }
    
    for (let i = m.petParticles.length - 1; i >= 0; i--) {
      const p = m.petParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vy += 0.1;
      if (p.life <= 0) {
        m.petParticles.splice(i, 1);
      }
    }
    
    this._dropGift();
    
    if (this.hero.carryingMomo) {
      m.x = this.hero.x;
      m.y = this.hero.y + this.hero.momoCarryOffset.y;
      m.moving = false;
      m.action = 'idle';
      return;
    }
    
    if (m.beingPushed) {
      const pushSpeed = 5;
      m.x += m.pushDirection.x * pushSpeed;
      m.y += m.pushDirection.y * pushSpeed;
      m.direction = m.pushDirection.x > 0 ? 1 : -1;
      m.moving = true;
      m.action = 'beingPushed';
      
      m.x = Math.max(80, Math.min(this.WORLD_W - 100, m.x));
      m.y = Math.max(80, Math.min(this.WORLD_H - 300, m.y));
      return;
    }
    
    if (m.isTumbling) {
      m.tumbleTimer--;
      m.x += m.tumbleVelocity.x;
      m.y += m.tumbleVelocity.y;
      m.tumbleVelocity.y += 0.5;
      m.tumbleRotation += 0.3;
      
      if (m.x < 80 || m.x > this.WORLD_W - 80) {
        m.tumbleVelocity.x *= -0.6;
        m.x = Math.max(80, Math.min(this.WORLD_W - 80, m.x));
      }
      if (m.y < 80 || m.y > this.WORLD_H - 150) {
        m.tumbleVelocity.y *= -0.5;
        m.y = Math.max(80, Math.min(this.WORLD_H - 150, m.y));
      }
      
      if (m.tumbleTimer <= 0 || (Math.abs(m.tumbleVelocity.x) < 0.5 && Math.abs(m.tumbleVelocity.y) < 0.5 && m.y > this.WORLD_H - 200)) {
        m.isTumbling = false;
        m.tumbleRotation = 0;
        m.action = 'sit';
        this._nextMomoAction();
      }
      return;
    }
    
    const distToHero = Math.hypot(this.hero.x - m.x, this.hero.y - m.y);
    if (distToHero < 150 && distToHero > 40 && !m.isPetted && m.action !== 'chase' && !m.beingPushed) {
      const dx = this.hero.x - m.x;
      const dy = this.hero.y - m.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        m.x += (dx / dist) * 1.8;
        m.y += (dy / dist) * 1.8;
        m.direction = dx > 0 ? 1 : -1;
        m.moving = true;
        m.frameTimer++;
        if (m.frameTimer > 8) { m.frame = (m.frame + 1) % 4; m.frameTimer = 0; }
      } else {
        m.moving = false;
      }
      m.action = 'follow';
      return;
    }
    
    m.actionTimer++;
    if (m.speechTimer > 0) m.speechTimer--;

    if (m.actionTimer >= m.actionDuration) this._nextMomoAction();

    if (m.action === 'roll') m.rollAngle += 0.18;

    if (m.action === 'spin') {
      m.targetX = Math.max(100, Math.min(this.WORLD_W - 100,
        m.x + Math.cos(m.actionTimer * 0.2) * 30
      ));
      m.targetY = Math.max(100, Math.min(this.WORLD_H - 300,
        m.y + Math.sin(m.actionTimer * 0.2) * 20
      ));
    }

    if (m.action === 'walk' || m.action === 'chase' || m.action === 'spin') {
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const spd = m.action === 'chase' ? 2.8 : 1.6;

      if (dist > 4) {
        m.moving = true;
        m.x += (dx / dist) * spd;
        m.y += (dy / dist) * spd;
        m.direction = dx > 0 ? 1 : -1;
        m.frameTimer++;
        if (m.frameTimer > 10) { m.frame = (m.frame + 1) % 4; m.frameTimer = 0; }
      } else {
        m.moving = false;
        m.frame = 0;
      }
    } else {
      m.moving = false;
      m.frame = 0;
    }

    m.x = Math.max(100, Math.min(this.WORLD_W - 100, m.x));
    m.y = Math.max(100, Math.min(this.WORLD_H - 300, m.y));
  }

    // Update _updateHeroSector() for circular center detection
    _updateHeroSector() {
      const x = this.hero.x;
      const y = this.hero.y;
      const centerX = 1200;
      const centerY = 900;
      const centerRadius = 350;
      
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      // Check if in center sector (circular)
      if (distFromCenter <= centerRadius) {
        this.hero.currentSector = 'center';
      } else {
        // Determine which quadrant
        if (x < centerX && y < centerY) {
          this.hero.currentSector = 'topLeft';
        } else if (x > centerX && y < centerY) {
          this.hero.currentSector = 'topRight';
        } else if (x < centerX && y > centerY) {
          this.hero.currentSector = 'bottomLeft';
        } else {
          this.hero.currentSector = 'bottomRight';
        }
      }
    }
  // ── DRAWING METHODS ────────────────────────────────────────────────────────

  _drawSky(ctx, W, H) {
    const t = this.time;
    let top, bot;
    if (t < 0.2) { const p = t / 0.2; top = this._lerp('#0d0714','#ff6b35',p); bot = this._lerp('#150d1e','#ffb347',p); }
    else if (t < 0.3) { const p = (t - 0.2) / 0.1; top = this._lerp('#ff6b35','#5a9fd4',p); bot = this._lerp('#ffb347','#87ceeb',p); }
    else if (t < 0.7) { top = '#3a7ab8'; bot = '#6ab4d4'; }
    else if (t < 0.8) { const p = (t - 0.7) / 0.1; top = this._lerp('#3a7ab8','#c0392b',p); bot = this._lerp('#6ab4d4','#f39c12',p); }
    else { const p = (t - 0.8) / 0.2; top = this._lerp('#c0392b','#0d0714',p); bot = this._lerp('#f39c12','#150d1e',p); }

    const g = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  _drawTiles(ctx) {
    const T = this.TILE;
    const camL = Math.max(0, Math.floor(this.camera.x / T) - 1);
    const camT = Math.max(0, Math.floor(this.camera.y / T) - 1);
    const camR = Math.min((this.tiles[0]?.length ?? 0), Math.ceil((this.camera.x + this.canvas.width) / T) + 1);
    const camB = Math.min(this.tiles.length, Math.ceil((this.camera.y + this.canvas.height) / T) + 1);

    for (let r = camT; r < camB; r++) {
      for (let c = camL; c < camR; c++) {
        const type = this.tiles[r]?.[c] ?? 0;
        const tx = c * T;
        const ty = r * T;

        if (type === 2) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#1a3a6e' : '#1e4480';
          ctx.fillRect(tx, ty, T, T);
        } else if (type === 1) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#7a5535' : '#8b6340';
          ctx.fillRect(tx, ty, T, T);
        } else if (type === 3) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#E8F0F8' : '#F0F8FF';
          ctx.fillRect(tx, ty, T, T);
        } else if (type === 4) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#D2691E' : '#CD853F';
          ctx.fillRect(tx, ty, T, T);
        } else if (type === 5) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#F4A460' : '#DEB887';
          ctx.fillRect(tx, ty, T, T);
        } else if (type === 6) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#4A6FA5' : '#5B8DB8';
          ctx.fillRect(tx, ty, T, T);
        } else {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#3d6b34' : '#456e3b';
          ctx.fillRect(tx, ty, T, T);
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx, ty, T, T);
      }
    }
  }

  _drawDecorations(ctx) {
    const cx = this.camera.x, cy = this.camera.y;
    const cw = this.canvas.width, ch = this.canvas.height;

    for (const t of this.trees) {
      if (t.x < cx - 60 || t.x > cx + cw + 60 || t.y < cy - 80 || t.y > cy + ch + 80) continue;
      const x = t.x, y = t.y;
      
      let trunkColor, leafColor;
      if (x < 800 && y < 600) {
        trunkColor = '#8B7355';
        leafColor = '#B0C4DE';
      } else if (x > 1600 && y < 600) {
        trunkColor = '#8B6914';
        leafColor = '#D2691E';
      } else if (x < 800 && y > 1200) {
        trunkColor = '#D2B48C';
        leafColor = '#228B22';
      } else if (x > 1600 && y > 1200) {
        trunkColor = '#696969';
        leafColor = '#2E8B57';
      } else {
        trunkColor = '#5c3d1e';
        leafColor = '#2d5a1b';
      }
      
      ctx.fillStyle = trunkColor;
      ctx.fillRect(x - 4, y + 10, 8, 20);
      ctx.fillStyle = leafColor;
      ctx.fillRect(x - 16, y - 4, 32, 8);
      ctx.fillRect(x - 12, y - 12, 24, 8);
      ctx.fillRect(x - 8, y - 20, 16, 8);
      ctx.fillRect(x - 4, y - 28, 8, 8);
    }

    for (const f of this.flowers) {
      if (f.x < cx - 20 || f.x > cx + cw + 20 || f.y < cy - 20 || f.y > cy + ch + 20) continue;
      const bob = Math.floor(Math.sin(this.time * 6 + f.phase) * 1.5);
      ctx.fillStyle = '#3a7024';
      ctx.fillRect(f.x, f.y + 4 + bob, 2, 6);
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x - 3, f.y + bob, 8, 2);
      ctx.fillRect(f.x, f.y - 3 + bob, 2, 8);
      ctx.fillStyle = '#fff7a0';
      ctx.fillRect(f.x - 1, f.y - 1 + bob, 4, 4);
    }
  }

  _drawPaths(ctx) {
    ctx.strokeStyle = 'rgba(232,184,109,0.25)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    const sortedDungeons = [...this.dungeons].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedDungeons.length - 1; i++) {
      const a = sortedDungeons[i], b = sortedDungeons[i + 1];
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

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x - 26, y + 28, 52, 10);

      const glow = ctx.createRadialGradient(x, y, 8, x, y, 46);
      glow.addColorStop(0, d.glowColor);
      glow.addColorStop(0.7, d.glowColor.replace(/[\d.]+\)$/, `${0.25 * pulse})`));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 46 * pulse, 0, Math.PI * 2);
      ctx.fill();

      const pc = d.done ? '#e8b86d' : (d.unlocked ? d.color : '#2a2a2a');
      ctx.fillStyle = pc;
      ctx.fillRect(x - 24, y - 8, 8, 40);
      ctx.fillRect(x + 16, y - 8, 8, 40);
      ctx.fillRect(x - 16, y - 24, 32, 8);
      ctx.fillRect(x - 24, y - 16, 8, 8);
      ctx.fillRect(x + 16, y - 16, 8, 8);

      const hlColor = d.done ? '#ffd080' : (d.unlocked ? '#ffffff' : '#444');
      ctx.fillStyle = hlColor;
      ctx.globalAlpha = (d.unlocked ? 1 : 0.4) * 0.3;
      ctx.fillRect(x - 24, y - 8, 3, 40);
      ctx.fillRect(x - 16, y - 24, 32, 3);
      ctx.globalAlpha = d.unlocked ? 1 : 0.4;

      if (d.unlocked && !d.done) {
        const inner = ctx.createRadialGradient(x, y + 4, 2, x, y + 4, 18);
        inner.addColorStop(0, `rgba(255,255,255,${0.7 * pulse})`);
        inner.addColorStop(0.5, d.glowColor);
        inner.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = inner;
        ctx.fillRect(x - 16, y - 16, 32, 36);

        for (let i = 0; i < 6; i++) {
          const a = t * 1.6 + (i / 6) * Math.PI * 2;
          const px = x + Math.cos(a) * 24;
          const py = y + Math.sin(a) * 14;
          ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(a + t) * 0.3})`;
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
      }

      if (d.done) {
        ctx.fillStyle = '#e8b86d';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓', x, y + 8);
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = d.unlocked ? '#fff8f4' : 'rgba(255,248,244,0.35)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.emoji} ${d.label}`, x, y + 52);
      if (!d.unlocked) {
        ctx.fillStyle = 'rgba(255,248,244,0.3)';
        ctx.font = '9px monospace';
        ctx.fillText('🔒 locked', x, y + 64);
      }
      ctx.textAlign = 'left';
    }
  }

  _drawHouse(ctx) {
    const x = this.house.x - 40;
    const y = this.house.y - 30;
    
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 5, y + 5, 80, 60);
    
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(x, y, 80, 60);
    
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 40, y - 25);
    ctx.lineTo(x + 90, y);
    ctx.fill();
    
    ctx.fillStyle = '#5C3317';
    ctx.fillRect(x + 30, y + 25, 20, 35);
    
    ctx.fillStyle = '#FFE4B5';
    ctx.fillRect(x + 10, y + 15, 12, 12);
    ctx.fillRect(x + 58, y + 15, 12, 12);
    
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 65, y - 15, 10, 20);
    
    ctx.fillStyle = 'rgba(200,200,200,0.4)';
    ctx.beginPath();
    ctx.arc(x + 70, y - 20, 5, 0, Math.PI * 2);
    ctx.arc(x + 75, y - 30, 4, 0, Math.PI * 2);
    ctx.arc(x + 70, y - 40, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHero(ctx) {
    const h = this.hero;
    let x = Math.floor(h.x);
    let y = Math.floor(h.y);
    
    // Apply jump offset for drawing
    if (h.isJumping) {
      y = Math.floor(h.y);
    }
    
    // Simple walk bob
    let bob = 0;
    if (h.moving && !h.isJumping) {
      bob = Math.sin(this.time * 14) * 2;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x - 12, y + 25, 24, 6);

    // Aura
    const aura = ctx.createRadialGradient(x, y, 4, x, y, 28);
    aura.addColorStop(0, 'rgba(242,167,187,0.3)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    const flip = h.direction === 'left' ? -1 : 1;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(flip, 1);
    ctx.translate(-x, -y);

    // Hair
    ctx.fillStyle = '#c9a7d4';
    ctx.fillRect(x - 8, y - 20, 16, 4);
    ctx.fillRect(x - 10, y - 16, 20, 4);
    ctx.fillRect(x - 10, y - 12, 4, 8);
    ctx.fillRect(x + 6, y - 12, 4, 8);

    // Face
    ctx.fillStyle = '#f2c4d0';
    ctx.fillRect(x - 6, y - 12, 12, 10);

    // Eyes
    if (h.direction !== 'up') {
      const blink = Math.sin(this.time * 3) > 0.95;
      ctx.fillStyle = '#3b1f2e';
      ctx.fillRect(x - 4, y - 9, 3, blink ? 1 : 3);
      ctx.fillRect(x + 1, y - 9, 3, blink ? 1 : 3);
      ctx.fillStyle = 'rgba(242,167,187,0.6)';
      ctx.fillRect(x - 6, y - 7, 2, 2);
      ctx.fillRect(x + 4, y - 7, 2, 2);
    }

    // Body
    ctx.fillStyle = '#e8a0b8';
    ctx.fillRect(x - 6, y - 2, 12, 12);
    ctx.fillStyle = '#f2a7bb';
    ctx.fillRect(x - 8, y + 2, 16, 8);
    ctx.fillRect(x - 10, y + 8, 20, 6);

    // Arms (simple swing when walking)
    let armSwing = 0;
    if (h.moving && !h.isJumping) {
      armSwing = Math.sin(this.time * 14) * 3;
    }
    
    ctx.fillStyle = '#f2c4d0';
    ctx.fillRect(x - 10, y - 1 + armSwing, 4, 8);
    ctx.fillRect(x + 6, y - 1 - armSwing, 4, 8);

    // Legs with Momo-style walking animation
    // Using frame-based animation like Momo
    let legSwing = 0;
    if (h.moving && !h.isJumping) {
      // Use frame counter like Momo does
      const framePhase = (h.frame * Math.PI / 2);
      legSwing = Math.sin(framePhase) * 4;
    }
    
    ctx.fillStyle = '#c9a7d4';
    // Left leg
    ctx.fillRect(x - 6, y + 14 + legSwing, 4, 8);
    // Right leg (moves opposite)
    ctx.fillRect(x + 2, y + 14 - legSwing, 4, 8);

    ctx.restore();

    // Name tag
    const nameY = y - 30 + (h.moving ? Math.sin(this.time * 6) * 1 : 0);
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText(h.name, x + 1, nameY + 1);
    ctx.fillStyle = '#f2a7bb';
    ctx.fillText(h.name, x, nameY);
    ctx.textAlign = 'left';
  }

  _drawMomo() {
    const m = this.momo;
    let x = Math.floor(m.x);
    let y = Math.floor(m.y);
    
    if (this.hero.carryingMomo) {
      x = Math.floor(this.hero.x);
      y = Math.floor(this.hero.y + this.hero.momoCarryOffset.y);
    }
    
    const ctx = this.ctx;

    ctx.save();

    if (m.isTumbling) {
      ctx.translate(x, y);
      ctx.rotate(m.tumbleRotation);
      ctx.translate(-x, -y);
    } else if (m.action === 'roll') {
      ctx.translate(x, y);
      ctx.rotate(m.rollAngle);
      ctx.translate(-x, -y);
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(m.direction, 1);
    ctx.translate(-x, -y);

    const bob = m.moving ? Math.sin(this.time * 14) * 2 : 0;
    const sit = (m.action === 'sit' && !this.hero.carryingMomo) ? 6 : 0;

    const S = 3;
    const ox = x - 16;
    const oy = y - 14 + bob;

    const fatScale = 1 + (m.fatness * 0.5);
    
    const dp = (lx, ly, w, h, color) => {
      ctx.fillStyle = color;
      const actualW = w * S * (lx === 0 || lx + w >= 10 ? fatScale : 1);
      const actualX = ox + lx * S - ((actualW - w * S) / 2);
      ctx.fillRect(actualX, oy + ly * S + sit, actualW, h * S);
    };

    const tailCurl = Math.sin(m.tailWag + this.time * 3) * 5;
    ctx.strokeStyle = '#e8832a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ox + 1 * S, oy + 8 * S + sit);
    ctx.quadraticCurveTo(ox - 14, oy + 12 * S + sit + tailCurl, ox - 8, oy + 5 * S + sit + tailCurl);
    ctx.stroke();

    dp(0, 4, 10, 7, '#e8832a');
    dp(1, 3, 8, 1, '#e8832a');
    dp(0, 5, 10, 5, '#e8832a');
    dp(1, 9, 8, 2, '#e8832a');
    dp(2, 10, 6, 1, '#e8832a');

    dp(2, 5, 6, 5, '#fff5e6');
    dp(1, 6, 8, 3, '#fff5e6');
    dp(2, 8, 6, 2, '#fff5e6');

    dp(0, 5, 1, 4, '#c96a18');
    dp(9, 5, 1, 4, '#c96a18');
    dp(0, 7, 2, 2, '#c96a18');
    dp(8, 7, 2, 2, '#c96a18');

    if (m.action === 'sit' && !this.hero.carryingMomo) {
      dp(1, 10, 3, 2, '#e8832a');
      dp(6, 10, 3, 2, '#e8832a');
      dp(1, 11, 3, 1, '#c96a18');
      dp(6, 11, 3, 1, '#c96a18');
    } else {
      const legSwing = m.moving ? Math.floor(Math.sin(m.frame * Math.PI / 2) * 2) : 0;
      dp(1, 10 + legSwing, 3, 3, '#e8832a');
      dp(6, 10 - legSwing, 3, 3, '#e8832a');
      dp(1, 12 + legSwing, 3, 1, '#c96a18');
      dp(6, 12 - legSwing, 3, 1, '#c96a18');
    }

    dp(2, -2, 6, 2, '#e8832a');
    dp(1, -1, 8, 2, '#e8832a');
    dp(1, 0, 8, 4, '#e8832a');
    dp(0, 1, 10, 3, '#e8832a');
    dp(1, 3, 8, 2, '#e8832a');

    dp(0, 2, 2, 2, '#f09030');
    dp(8, 2, 2, 2, '#f09030');

    dp(1, -4, 3, 3, '#e8832a');
    dp(6, -4, 3, 3, '#e8832a');
    dp(2, -3, 1, 1, '#ffb5c0');
    dp(7, -3, 1, 1, '#ffb5c0');

    dp(2, 2, 6, 3, '#fff5e6');
    dp(3, 1, 4, 1, '#fff5e6');

    const blink = Math.sin(this.time * 1.8) > 0.95;
    if (m.isPetted) {
      ctx.fillStyle = '#3b1f2e';
      ctx.fillRect(ox + 2 * S, oy + 1 * S + sit, 3 * S, 1);
      ctx.fillRect(ox + 7 * S, oy + 1 * S + sit, 3 * S, 1);
    } else if (blink) {
      ctx.fillStyle = '#3b1f2e';
      ctx.fillRect(ox + 2 * S, oy + 0 * S + sit, 2 * S, 1);
      ctx.fillRect(ox + 6 * S, oy + 0 * S + sit, 2 * S, 1);
    } else {
      dp(2, 0, 2, 2, '#f5a623');
      dp(6, 0, 2, 2, '#f5a623');
      dp(2, 0, 1, 1, '#1a0a0a');
      dp(6, 0, 1, 1, '#1a0a0a');
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(ox + 3 * S, oy + 0 * S + sit, S, S);
      ctx.fillRect(ox + 7 * S, oy + 0 * S + sit, S, S);
    }

    dp(4, 3, 2, 1, '#ffb5c0');

    dp(2, 4, 6, 1, '#f09030');
    dp(3, 5, 4, 1, '#f09030');

    ctx.strokeStyle = 'rgba(255,245,230,0.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(ox + 2*S, oy + 4*S + sit); ctx.lineTo(ox - 12, oy + 3*S + sit); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 2*S, oy + 4*S + sit); ctx.lineTo(ox - 12, oy + 5*S + sit); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 2*S, oy + 4*S + sit); ctx.lineTo(ox - 10, oy + 2*S + sit); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 8*S, oy + 4*S + sit); ctx.lineTo(ox + 10*S + 12, oy + 3*S + sit); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 8*S, oy + 4*S + sit); ctx.lineTo(ox + 10*S + 12, oy + 5*S + sit); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 8*S, oy + 4*S + sit); ctx.lineTo(ox + 10*S + 10, oy + 2*S + sit); ctx.stroke();

    ctx.restore();

    const haloX = x;
    const haloY = y - 26 + bob;
    const haloR = 10;
    const hGlow = Math.sin(m.haloSpin) * 0.2 + 0.8;

    const haloGrad = ctx.createRadialGradient(haloX, haloY, 4, haloX, haloY, 18);
    haloGrad.addColorStop(0, `rgba(255,240,120,${0.4 * hGlow})`);
    haloGrad.addColorStop(1, 'rgba(255,240,120,0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath(); ctx.arc(haloX, haloY, 18, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = `rgba(255,220,60,${0.85 * hGlow})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255,220,60,0.6)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(haloX, haloY, haloR, haloR * 0.35, m.haloSpin * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 4; i++) {
      const a = m.haloSpin + (i / 4) * Math.PI * 2;
      const sx = haloX + Math.cos(a) * (haloR + 4);
      const sy = haloY + Math.sin(a) * (haloR * 0.35 + 2);
      ctx.fillStyle = `rgba(255,240,120,${0.5 + Math.sin(a + this.time * 3) * 0.4})`;
      ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy) - 1, 3, 3);
    }

    const nameY = y - 40 + bob;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText('Momo 🧡', x + 1, nameY + 1);
    ctx.fillStyle = '#fff5e6';
    ctx.fillText('Momo 🧡', x, nameY);

    for (const p of m.petParticles) {
      const alpha = p.life / 60;
      ctx.fillStyle = `rgba(255,100,150,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.bezierCurveTo(p.x - 3, p.y - 3, p.x - 6, p.y + 2, p.x, p.y + 5);
      ctx.bezierCurveTo(p.x + 6, p.y + 2, p.x + 3, p.y - 3, p.x, p.y);
      ctx.fill();
    }

    if (m.gift && !m.gift.collected) {
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(m.gift.x - 5, m.gift.y - 3, 10, 6);
      ctx.fillStyle = '#ff8844';
      ctx.fillRect(m.gift.x - 2, m.gift.y - 6, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(m.gift.type, m.gift.x - 12, m.gift.y - 8);
    }

    if (m.speechBubble && m.speechTimer > 0 && !this.hero.carryingMomo) {
      const alpha = Math.min(1, m.speechTimer / 20);
      const bx = x + 20;
      const by = y - 30 + bob;
      const text = m.speechBubble;
      const tw = text.length * 6 + 14;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = 'rgba(200,200,200,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      this._roundRect(ctx, bx, by - 14, tw, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.moveTo(bx, by + 4);
      ctx.lineTo(bx - 6, by + 10);
      ctx.lineTo(bx + 6, by + 4);
      ctx.fill();

      ctx.fillStyle = '#3b1f2e';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(text, bx + 7, by + 1);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  _drawParticles() {
    const ctx = this.ctx;
    const currentSector = this.hero.currentSector;
    const particles = this.particles[currentSector];
    
    for (const p of particles) {
      if (p.x < this.camera.x - 100 || p.x > this.camera.x + this.canvas.width + 100 ||
          p.y < this.camera.y - 100 || p.y > this.camera.y + this.canvas.height + 100) {
        continue;
      }
      
      const screenX = p.x - this.camera.x;
      const screenY = p.y - this.camera.y;
      
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(p.angle);
      
      switch(p.type) {
        case 'snow':
          ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(this.time * 5) * 0.3})`;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          break;
        case 'leaf':
          ctx.fillStyle = `rgba(255,165,0,${0.6})`;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size, 0);
          ctx.fill();
          break;
        case 'flower':
          ctx.fillStyle = p.color;
          for(let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const px = Math.cos(angle) * p.size;
            const py = Math.sin(angle) * p.size;
            ctx.fillRect(px - 1, py - 1, 2, 2);
          }
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(-1, -1, 2, 2);
          break;
        case 'sparkle':
          ctx.fillStyle = `rgba(255,228,181,${0.7 + Math.sin(this.time * 10) * 0.3})`;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          break;
        case 'raindrop':
          ctx.fillStyle = `rgba(135,206,235,${0.5})`;
          ctx.fillRect(0, -p.size, 1, p.size * 2);
          break;
      }
      
      ctx.restore();
    }
  }

  _drawHUD(ctx, W, H) {
    const currentSector = this.sectors[this.hero.currentSector];
    const label = this.time < 0.2 ? '🌙 Night'
                  : this.time < 0.3 ? '🌅 Dawn'
                  : this.time < 0.7 ? '☀️ Day'
                  : this.time < 0.8 ? '🌇 Dusk'
                  : '🌙 Night';

    ctx.fillStyle = 'rgba(10,5,16,0.7)';
    ctx.beginPath(); this._roundRect(ctx, 10, 10, 120, 28, 6); ctx.fill();
    ctx.fillStyle = '#fff8f4';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, 16, 29);
    
    ctx.fillStyle = 'rgba(10,5,16,0.7)';
    ctx.beginPath(); this._roundRect(ctx, W - 150, 10, 140, 28, 6); ctx.fill();
    ctx.fillStyle = currentSector.color;
    ctx.font = '11px monospace';
    ctx.fillText(`${currentSector.season} Sector`, W - 140, 29);
    
    ctx.fillStyle = 'rgba(10,5,16,0.6)';
    ctx.beginPath(); this._roundRect(ctx, 10, H - 58, 430, 48, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,248,244,0.45)';
    ctx.font = '9px monospace';
    ctx.fillText('Click to move · WASD / Arrows · SPACE: Jump', 16, H - 45);
    ctx.fillText('E: Pet · F: Feed · R: Pick up/Drop · Hold Right Click + Walk to Push', 16, H - 33);
    ctx.fillText('Follow the glowing paths to reach dungeons in order!', 16, H - 21);
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  // ── INPUT HANDLING ────────────────────────────────────────────────────────

  handleClick(screenX, screenY) {
    const wx = screenX + this.camera.x;
    const wy = screenY + this.camera.y;

    for (const d of this.dungeons) {
      const dx = wx - d.x, dy = wy - d.y;
      if (Math.sqrt(dx * dx + dy * dy) < 44 && d.unlocked && !d.done) {
        this.hero.targetX = d.x;
        this.hero.targetY = d.y + 50;
        this._pendingDungeon = d.id;
        return;
      }
    }

    this.hero.targetX = Math.max(80, Math.min(this.WORLD_W - 80, wx));
    this.hero.targetY = Math.max(80, Math.min(this.WORLD_H - 300, wy));
    this._pendingDungeon = null;
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

  update() {
    this.time = (this.time + this.timeSpeed) % 1;

    const h = this.hero;
    const spd = 3.5;

    // Only allow movement input if not jumping (or allow air control)
    if (!h.isJumping) {
      if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { h.targetX -= spd; h.direction = 'left'; }
      if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { h.targetX += spd; h.direction = 'right'; }
      if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) { h.targetY -= spd; h.direction = 'up'; }
      if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) { h.targetY += spd; h.direction = 'down'; }
    } else {
      // Air control - reduced movement while jumping
      const airControl = 1.5;
      if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { h.targetX -= airControl; }
      if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { h.targetX += airControl; }
      if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) { h.targetY -= airControl; }
      if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) { h.targetY += airControl; }
    }

    h.targetX = Math.max(80, Math.min(this.WORLD_W - 80, h.targetX));
    h.targetY = Math.max(80, Math.min(this.WORLD_H - 300, h.targetY));

    const dx = h.targetX - h.x;
    const dy = h.targetY - h.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 3) {
      h.moving = true;
      h.x += (dx / dist) * h.speed;
      h.y += (dy / dist) * h.speed;
      if (Math.abs(dx) > Math.abs(dy)) h.direction = dx > 0 ? 'right' : 'left';
      else h.direction = dy > 0 ? 'down' : 'up';
      h.frameTimer++;
      if (h.frameTimer > 8) { 
        h.frame = (h.frame + 1) % 4; 
        h.frameTimer = 0; 
      }
    } else {
      h.moving = false;
      h.frame = 0;
      if (this._pendingDungeon) {
        const id = this._pendingDungeon;
        this._pendingDungeon = null;
        setTimeout(() => this.onEnterDungeon?.(id), 200);
      }
    }

    // Update jump physics
    this._updateJump();

    this._updateHeroSector();

    const maxCamX = Math.max(0, this.WORLD_W - this.canvas.width);
    const maxCamY = Math.max(0, this.WORLD_H - this.canvas.height);
    this.camera.x = Math.max(0, Math.min(maxCamX, h.x - this.canvas.width / 2));
    this.camera.y = Math.max(0, Math.min(maxCamY, h.y - this.canvas.height / 2));

    this._updateMomo();
    this._updateParticles();
  }

  // ── DRAW ──────────────────────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    this._drawSky(ctx, W, H);

    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));
    this._drawTiles(ctx);
    this._drawDecorations(ctx);
    this._drawPaths(ctx);
    this._drawDungeons(ctx);
    this._drawHouse(ctx);
    this._drawHero(ctx);
    this._drawMomo();
    this._drawParticles();
    ctx.restore();

    this._drawHUD(ctx, W, H);
  }

  // ── UTILS ─────────────────────────────────────────────────────────────────

  _lerp(a, b, t) {
    const hr = h => parseInt(h.replace('#', '').slice(0, 2), 16);
    const hg = h => parseInt(h.replace('#', '').slice(2, 4), 16);
    const hb = h => parseInt(h.replace('#', '').slice(4, 6), 16);
    const r = Math.round(hr(a) + (hr(b) - hr(a)) * t);
    const g = Math.round(hg(a) + (hg(b) - hg(a)) * t);
    const bv = Math.round(hb(a) + (hb(b) - hb(a)) * t);
    return `rgb(${r},${g},${bv})`;
  }

  // ── LIFECYCLE ─────────────────────────────────────────────────────────────

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
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('contextmenu', this._onContextMenu);
  }
}