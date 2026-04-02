export class SceneManager {
  constructor(container, bus) {
    this.container  = container;
    this.bus        = bus;
    this._current   = null;
    this._overlay   = document.getElementById('overlay');
  }

  async switchTo(scene) {
    if (this._current) {
      await this._fadeOut();
      this._current.destroy();
      this.container.innerHTML = '';
    }
    this._current = scene;
    scene.mount(this.container);
    await this._fadeIn();
    scene.start();
  }

  _fadeOut() {
    return new Promise(resolve => {
      this._overlay.classList.add('fade-in');
      setTimeout(resolve, 650);
    });
  }

  _fadeIn() {
    return new Promise(resolve => {
      this._overlay.classList.remove('fade-in');
      this._overlay.classList.add('fade-out');
      setTimeout(() => {
        this._overlay.classList.remove('fade-out');
        resolve();
      }, 650);
    });
  }

  destroy() {
    if (this._current) this._current.destroy();
  }
}