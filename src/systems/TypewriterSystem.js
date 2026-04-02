export class TypewriterSystem {
  constructor() {
    this._timeouts = [];
  }

  write(element, text, speed = 38, onDone = null) {
    element.textContent = '';
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        element.textContent += text[i++];
        const t = setTimeout(tick, speed);
        this._timeouts.push(t);
      } else {
        if (onDone) onDone();
      }
    };
    tick();
  }

  writeLines(container, lines, speed = 38, lineDelay = 500, onDone = null) {
    container.innerHTML = '';
    let lineIndex = 0;

    const nextLine = () => {
      if (lineIndex >= lines.length) {
        if (onDone) onDone();
        return;
      }
      const line = lines[lineIndex++];
      const el = document.createElement('div');
      el.classList.add('letter-line');
      el.style.animationDelay = `${lineIndex * 0.1}s`;
      container.appendChild(el);

      if (line === '') {
        el.innerHTML = '&nbsp;';
        const t = setTimeout(nextLine, lineDelay * 0.4);
        this._timeouts.push(t);
      } else {
        this.write(el, line, speed, () => {
          const t = setTimeout(nextLine, lineDelay);
          this._timeouts.push(t);
        });
      }
    };
    nextLine();
  }

  clear() {
    this._timeouts.forEach(clearTimeout);
    this._timeouts = [];
  }

  destroy() { this.clear(); }
}