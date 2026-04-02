# Chiara & The Shadows 🌸

A browser-based RPG game built entirely with vanilla JavaScript — no frameworks, no libraries, no dependencies.

---

## Tech Stack

| Technology | Usage |
|---|---|
| **Vanilla JS (ES6 Modules)** | Entire codebase — import/export, classes, async/await |
| **OOP Architecture** | Every system is a class with constructor, methods, and destroy() lifecycle |
| **Canvas API** | Platformer rendering, world map, pixel art sprites, particle systems |
| **Web Audio API** | All sounds generated procedurally — zero audio files |
| **CSS3 Animations** | Keyframes, transitions, glow effects, parallax layers |
| **LocalStorage** | Save/load game state, checkpoint persistence |
| **Event-Driven (Pub/Sub)** | Decoupled systems communicating via custom EventBus |
| **Netlify** | Static deployment via drag and drop |

---

## Architecture

### Engine (`/src/engine`)
- **GameEngine.js** — Core game loop, global state management, scene orchestration
- **SceneManager.js** — Stack-based scene routing with fade transitions
- **BattleEngine.js** — Turn-based RPG combat logic, status effects, boss mechanics
- **AudioEngine.js** — Procedural sound generation via Web Audio API oscillators
- **SaveManager.js** — Serializes and restores full game state via LocalStorage

### Scenes (`/src/scenes`)
- **TitleScene.js** — Animated intro with particle system
- **MapScene.js** — Top-down world map with camera, click-to-move, day/night cycle
- **PlatformerScene.js** — Side-scrolling platformer level wrapper with lives system
- **BattleScene.js** — RPG battle UI, action menus, HP/MP bars, status badges
- **VictoryScene.js** — Post-battle sequence with boss last words
- **EventScene.js** — Random encounter events between battles
- **EndingScene.js** — Typewriter love letter reveal with particle rain

### Systems (`/src/systems`)
- **WorldMap.js** — Canvas-based top-down world renderer with tile engine, decorations, dungeon portals, and animated Chiara sprite
- **Platformer.js** — Full platformer physics engine: gravity, collision resolution, coyote time, jump buffering, enemy AI, falling rocks, fog
- **ParticleSystem.js** — Canvas particle engine running on requestAnimationFrame — hearts, petals, smoke, sparks
- **DialogueSystem.js** — Typewriter dialogue with click-to-skip and queue management
- **TypewriterSystem.js** — Line-by-line text reveal for the ending scene
- **EventBus.js** — Pub/sub event system for decoupled scene communication

### Entities (`/src/entities`)
- **Hero.js** — Player stats, status effects, damage mitigation, healing
- **Enemy.js** — Boss stats, weighted move selection, status effects
- **5 Boss classes** — Insecurity, Jealousy, Fear, Doubt, Loneliness — each with unique combat mechanics

### Data (`/src/data`)
- **content.js** — Single source of truth for all editable text, dialogue, and personal content
- **enemies.config.js** — Boss stats, moves, rewards, visual config
- **skills.config.js** — Hero skill definitions, MP costs, effects
- **items.config.js** — Consumable item definitions
- **zones.config.js** — All 5 platformer level layouts, obstacles, enemy positions

---

## Key Patterns

- **State Machine** — Game progresses through discrete states managed by SceneManager
- **Component Lifecycle** — Every scene implements `mount()`, `start()`, `destroy()` for clean memory management
- **Event-Driven Communication** — Scenes never reference each other directly — all cross-scene communication goes through EventBus
- **Data-Driven Design** — All game content lives in `/src/data` — changing the game requires no code changes, only data
- **Separation of Concerns** — Physics in Platformer.js, rendering in WorldMap.js, combat in BattleEngine.js — no mixed responsibilities

---

## Game Flow
```
Title Screen
  → World Map (top-down, explorable)
    → Platformer Level (side-scrolling, physics-based)
      → Boss Battle (turn-based RPG)
        → Victory Screen (boss last words)
          → Random Encounter Event
            → World Map
              → ... (repeat for all 5 bosses)
                → Ending (love letter reveal)
```

---

## Run Locally
```bash
npx serve .
```

Open `http://localhost:3000`

> Requires a local server — ES6 modules do not work via `file://`

## Deploy

Drag and drop the project folder onto [netlify.com/drop](https://netlify.com/drop)

## Personalize

Edit only `src/data/content.js` — all names, dialogue, love letter, and memories live there.