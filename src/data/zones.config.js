export const ZONES = {

  insecurity: {
    label: 'Rose Forest', emoji: '🌸',
    goalX: 2600, goalY: 240,
    levelW: 2800, levelH: 500,
    checkpoint: { x: 1400, y: 180 },
    fog: false,
    skyTop: '#1a0a2e', skyBottom: '#2d0f3e',
    tileColor: '#3d6b34', tileHighlight: '#5a9c4f',
    tileBorder: '#1e3a18', tileTopDeco: '#6ab85a',
    spikeColor: '#c0392b', accentColor: '#f2a7bb',

    platforms: [
      { x: 0,    y: 320, w: 320,  h: 200 },
      { x: 380,  y: 290, w: 180,  h: 220 }, // easy gap
      { x: 620,  y: 260, w: 200,  h: 250 },
      { x: 880,  y: 230, w: 160,  h: 20  }, // floating
      { x: 1100, y: 260, w: 280,  h: 250 },
      { x: 1440, y: 280, w: 300,  h: 230 }, // checkpoint here
      { x: 1800, y: 250, w: 160,  h: 20  },
      { x: 2020, y: 220, w: 200,  h: 20  },
      { x: 2280, y: 250, w: 560,  h: 260 },
    ],
    spikes: [
      { x: 320, y: 304, w: 64 },
      { x: 560, y: 244, w: 64 },
    ],
    enemies: [
      { x: 420,  y: 250, speed: 1.2, range: 80  },
      { x: 1160, y: 220, speed: 1.4, range: 100 },
      { x: 1860, y: 210, speed: 1.3, range: 80  },
    ],
    rockSpawners: [],
    hearts: [
      { x: 450, y: 230 },
      { x: 1180, y: 210 },
      { x: 2100, y: 170 },
    ],
  },

  jealousy: {
    label: 'Night Bridge', emoji: '💚',
    goalX: 2700, goalY: 220,
    levelW: 2900, levelH: 500,
    checkpoint: { x: 1450, y: 200 },
    fog: false,
    skyTop: '#0a1e0d', skyBottom: '#05100a',
    tileColor: '#2a4a30', tileHighlight: '#3a6b40',
    tileBorder: '#162818', tileTopDeco: '#4a8040',
    spikeColor: '#27ae60', accentColor: '#7ed4a0',

    platforms: [
      { x: 0,    y: 320, w: 300,  h: 200 },
      { x: 360,  y: 300, w: 100,  h: 20  }, // bridge planks
      { x: 520,  y: 280, w: 100,  h: 20  },
      { x: 680,  y: 300, w: 100,  h: 20  },
      { x: 840,  y: 280, w: 100,  h: 20  },
      { x: 1000, y: 300, w: 280,  h: 210 },
      { x: 1340, y: 270, w: 380,  h: 240 },
      { x: 1780, y: 250, w: 120,  h: 20  },
      { x: 1960, y: 220, w: 120,  h: 20  },
      { x: 2140, y: 250, w: 120,  h: 20  },
      { x: 2320, y: 230, w: 420,  h: 280 },
    ],
    spikes: [
      { x: 300,  y: 304, w: 64 },
      { x: 1340, y: 254, w: 64 },
      { x: 1500, y: 254, w: 64 },
    ],
    enemies: [
      { x: 380,  y: 260, speed: 1.5, range: 60  },
      { x: 580,  y: 240, speed: 1.5, range: 60  },
      { x: 1060, y: 260, speed: 1.6, range: 100 },
      { x: 2380, y: 190, speed: 1.8, range: 100 },
    ],
    rockSpawners: [],
    hearts: [
      { x: 440, y: 240 },
      { x: 1400, y: 220 },
      { x: 1840, y: 200 },
    ],
  },

  fear: {
    label: 'Dark Shore', emoji: '🌑',
    goalX: 2750, goalY: 200,
    levelW: 3000, levelH: 550,
    checkpoint: { x: 1500, y: 220 },
    fog: false,
    skyTop: '#050510', skyBottom: '#0a0a20',
    tileColor: '#1a1a3e', tileHighlight: '#22225a',
    tileBorder: '#0d0d22', tileTopDeco: '#2a2a5e',
    spikeColor: '#8888ff', accentColor: '#7ec8e3',

    platforms: [
      { x: 0,    y: 340, w: 280,  h: 220 },
      { x: 340,  y: 310, w: 140,  h: 20  }, // rock zone — platforms spread out
      { x: 540,  y: 280, w: 140,  h: 20  },
      { x: 740,  y: 250, w: 140,  h: 20  },
      { x: 940,  y: 280, w: 280,  h: 280 },
      { x: 1280, y: 260, w: 380,  h: 300 },
      { x: 1720, y: 240, w: 120,  h: 20  },
      { x: 1900, y: 210, w: 120,  h: 20  },
      { x: 2080, y: 180, w: 120,  h: 20  },
      { x: 2260, y: 220, w: 560,  h: 340 },
    ],
    spikes: [
      { x: 280,  y: 324, w: 64 },
      { x: 1280, y: 244, w: 64 },
      { x: 1420, y: 244, w: 64 },
    ],
    enemies: [
      { x: 380,  y: 270, speed: 1.4, range: 80  },
      { x: 580,  y: 240, speed: 1.6, range: 80  },
      { x: 1000, y: 240, speed: 1.8, range: 120 },
      { x: 1780, y: 200, speed: 1.8, range: 80  },
      { x: 2320, y: 180, speed: 2.0, range: 100 },
    ],
    rockSpawners: [
      { x: 480,  interval: 3.5, spread: 80 },
      { x: 720,  interval: 4.0, spread: 60 },
    ],
    hearts: [
      { x: 460, y: 240 },
      { x: 1000, y: 200 },
      { x: 1960, y: 160 },
    ],
  },

  doubt: {
    label: 'Fog Valley', emoji: '🌫️',
    goalX: 2650, goalY: 220,
    levelW: 2900, levelH: 520,
    checkpoint: { x: 1400, y: 200 },
    fog: true,
    skyTop: '#12121e', skyBottom: '#080810',
    tileColor: '#2a2a40', tileHighlight: '#363654',
    tileBorder: '#16162a', tileTopDeco: '#3a3a5e',
    spikeColor: '#9999cc', accentColor: '#c9a7d4',

    platforms: [
      { x: 0,    y: 330, w: 320,  h: 200 },
      { x: 380,  y: 300, w: 120,  h: 20  },
      { x: 560,  y: 270, w: 120,  h: 20  },
      { x: 740,  y: 300, w: 120,  h: 20  },
      { x: 920,  y: 320, w: 280,  h: 200 },
      { x: 1260, y: 280, w: 380,  h: 240 },
      { x: 1700, y: 250, w: 400,  h: 280 },
      { x: 2160, y: 230, w: 140,  h: 20  },
      { x: 2360, y: 200, w: 540,  h: 330 },
    ],
    spikes: [
      { x: 320,  y: 314, w: 64 },
      { x: 1400, y: 264, w: 64 },
    ],
    enemies: [
      { x: 420,  y: 260, speed: 1.4, range: 80  },
      { x: 980,  y: 280, speed: 1.6, range: 100 },
      { x: 1760, y: 210, speed: 1.8, range: 120 },
      { x: 2420, y: 160, speed: 2.0, range: 100 },
    ],
    rockSpawners: [],
    hearts: [
      { x: 460, y: 230 },
      { x: 1320, y: 230 },
      { x: 1820, y: 200 },
    ],
  },

  loneliness: {
    label: 'Shadow Castle', emoji: '💜',
    goalX: 2900, goalY: 200,
    levelW: 3100, levelH: 580,
    checkpoint: { x: 1550, y: 210 },
    fog: true,
    skyTop: '#0d0714', skyBottom: '#080510',
    tileColor: '#2a0d38', tileHighlight: '#38124e',
    tileBorder: '#160628', tileTopDeco: '#4a1a6e',
    spikeColor: '#9b59b6', accentColor: '#c9a7d4',

    platforms: [
      { x: 0,    y: 360, w: 260,  h: 240 },
      { x: 320,  y: 330, w: 100,  h: 20  },
      { x: 480,  y: 300, w: 100,  h: 20  },
      { x: 640,  y: 270, w: 100,  h: 20  },
      { x: 800,  y: 300, w: 100,  h: 20  },
      { x: 960,  y: 340, w: 260,  h: 240 },
      { x: 1280, y: 300, w: 380,  h: 280 },
      { x: 1720, y: 270, w: 300,  h: 310 },
      { x: 2080, y: 250, w: 100,  h: 20  },
      { x: 2240, y: 220, w: 100,  h: 20  },
      { x: 2400, y: 190, w: 100,  h: 20  },
      { x: 2560, y: 220, w: 560,  h: 380 },
    ],
    spikes: [
      { x: 260,  y: 344, w: 64 },
      { x: 1420, y: 284, w: 64 },
      { x: 1560, y: 284, w: 64 },
    ],
    enemies: [
      { x: 360,  y: 290, speed: 1.4, range: 60  },
      { x: 520,  y: 260, speed: 1.6, range: 60  },
      { x: 680,  y: 230, speed: 1.6, range: 60  },
      { x: 1020, y: 300, speed: 1.8, range: 100 },
      { x: 1600, y: 260, speed: 2.0, range: 120 },
      { x: 1780, y: 230, speed: 2.0, range: 80  },
      { x: 2620, y: 180, speed: 2.2, range: 100 },
    ],
    rockSpawners: [
      { x: 420,  interval: 3.0, spread: 60 },
      { x: 720,  interval: 3.5, spread: 60 },
      { x: 1450, interval: 3.0, spread: 80 },
    ],
    hearts: [
      { x: 360,  y: 260 },
      { x: 860,  y: 220 },
      { x: 1380, y: 240 },
      { x: 1820, y: 200 },
    ],
  },
};