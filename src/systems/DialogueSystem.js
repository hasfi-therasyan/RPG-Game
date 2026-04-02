export class DialogueSystem {
  constructor() {
    this.box      = document.getElementById('dialogue-box');
    this.speaker  = document.getElementById('dialogue-speaker');
    this.text     = document.getElementById('dialogue-text');
    this._timeout = null;
    this._queue   = [];
    this._writing = false;
    this._active  = false; // only listen for clicks when dialogue is actually showing

    this._clickHandler = () => {
      if (this._active) this._skip();
    };
    document.addEventListener('click', this._clickHandler, { capture: true });

    this.box.style.cursor = 'pointer';
    this.box.title        = 'Click anywhere to continue';
  }

  _skip() {
    if (!this._writing || !this._active) return;
    clearTimeout(this._timeout);

    const current = this._queue[0];
    if (current && this.text.textContent.length < current.text?.length) {
      // Still typing — complete instantly
      this.text.textContent = current.text ?? this.text.textContent;
      this._timeout = setTimeout(() => {
        const done = this._queue.shift();
        if (done) done.resolve();
        this._next();
      }, 400);
    } else {
      // Done typing — advance
      const done = this._queue.shift();
      if (done) done.resolve();
      this._next();
    }
  }

  show(speaker, text, duration = 3000) {
    return new Promise(resolve => {
      this._queue.push({ speaker, text, duration, resolve });
      if (!this._writing) this._next();
    });
  }

  _next() {
    if (this._queue.length === 0) {
      this._writing = false;
      this._active  = false; // stop listening for clicks
      this.hide();
      return;
    }

    this._writing = true;
    this._active  = true; // start listening for clicks
    const { speaker, text, duration, resolve } = this._queue[0];

    this.speaker.textContent = speaker.toUpperCase();
    this.text.textContent    = '';
    this.box.classList.remove('hidden');

    // Hint
    const hint = this.box.querySelector('.dialogue-hint') || (() => {
      const h = document.createElement('span');
      h.className  = 'dialogue-hint';
      h.textContent = 'tap to continue ▼';
      h.style.cssText = `
        position: absolute; bottom: 8px; right: 14px;
        font-size: 0.65rem; color: rgba(201,167,212,0.5);
        font-family: var(--font-title); letter-spacing: 0.1em;
        animation: pulse 1.5s ease infinite;
      `;
      this.box.style.position = 'relative';
      this.box.appendChild(h);
      return h;
    })();
    hint.style.display = 'none';

    let i = 0;
    const tick = () => {
      if (i < text.length) {
        this.text.textContent += text[i++];
        this._timeout = setTimeout(tick, 32);
      } else {
        hint.style.display = 'block';
        this._timeout = setTimeout(() => {
          this._queue.shift();
          resolve();
          this._next();
        }, duration);
      }
    };
    tick();
  }

  hide() {
    clearTimeout(this._timeout);
    this._queue   = [];
    this._writing = false;
    this._active  = false; // stop intercepting clicks
    this.box.classList.add('hidden');
    this.text.textContent    = '';
    this.speaker.textContent = '';
  }

  async sequence(lines) {
    for (const { speaker, text, duration } of lines) {
      await this.show(speaker, text, duration ?? 2800);
    }
  }

  destroy() {
    clearTimeout(this._timeout);
    document.removeEventListener('click', this._clickHandler, { capture: true });
    this.hide();
  }
}