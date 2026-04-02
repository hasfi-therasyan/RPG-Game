const SAVE_KEY = 'chiara_rpg_save';

export class SaveManager {
  save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch(_e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(_e) { return null; }
  }

  clear() {
    try { localStorage.removeItem(SAVE_KEY); } catch(_e) {}
  }

  hasSave() { return !!localStorage.getItem(SAVE_KEY); }
}