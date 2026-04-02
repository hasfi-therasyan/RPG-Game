export class Scene {
  constructor(gameEngine) {
    this.ge = gameEngine;
    this.el = null;
    this._unsubs = [];
  }

  mount(container) {
    this.el = document.createElement('div');
    this.el.className = 'scene';
    this.render();
    container.appendChild(this.el);
  }

  render() {}
  start() {}

  on(event, cb) {
    const unsub = this.ge.bus.on(event, cb);
    this._unsubs.push(unsub);
  }

  destroy() {
    this._unsubs.forEach(u => u());
    this._unsubs = [];
    if (this.el) this.el.remove();
    this.ge.dialogue.hide();
  }
}