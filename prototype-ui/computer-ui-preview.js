const clock = document.querySelector('#terminal-clock');
const cards = [...document.querySelectorAll('.mode-card')];
const toast = document.querySelector('#preview-toast');
const returnButton = document.querySelector('#return-button');
const themeSelect = document.querySelector('#theme-select');
const terminal = document.querySelector('#terminal-preview');
const classroomPreview = document.querySelector('#classroom-preview');
const openTerminalButton = document.querySelector('#open-terminal-button');
const THEME_STORAGE_KEY = 'terminalTheme';
const THEMES = new Set(['futuristic', 'subtle']);
const embedded = window.parent !== window && new URLSearchParams(location.search).has('embedded');
let toastTimer;

function cssTimeToMilliseconds(value) {
  const time = Number.parseFloat(value);
  if (!Number.isFinite(time)) return 420;
  return value.trim().endsWith('ms') ? time : time * 1000;
}

class TerminalPreviewController {
  constructor({ terminalElement, classroomElement, openButton, closeButton }) {
    this.terminalElement = terminalElement;
    this.classroomElement = classroomElement;
    this.openButton = openButton;
    this.closeButton = closeButton;
    this.isTerminalOpen = false;
    this.isTransitioning = false;
    this.finishTimer = null;

    this.openButton.addEventListener('click', () => this.openTerminal());
    this.closeButton.addEventListener('click', () => this.closeTerminal());
    document.addEventListener('keydown', event => this.handleKeydown(event));
  }

  transitionDuration() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--terminal-transition-duration');
    return cssTimeToMilliseconds(value);
  }

  openTerminal() {
    if (this.isTerminalOpen || this.isTransitioning) return;
    this.isTerminalOpen = true;
    this.beginTransition();
    this.terminalElement.inert = false;
    this.terminalElement.setAttribute('aria-hidden', 'false');
    this.classroomElement.setAttribute('aria-hidden', 'true');

    requestAnimationFrame(() => {
      document.body.classList.add('is-terminal-open');
      this.finishTransition(() => themeSelect.focus({ preventScroll: true }));
    });
  }

  closeTerminal() {
    if (embedded) {
      window.parent.postMessage({ type: 'daa-terminal-close' }, location.origin);
      return;
    }
    if (!this.isTerminalOpen || this.isTransitioning) return;
    this.isTerminalOpen = false;
    this.beginTransition();
    document.body.classList.remove('is-terminal-open');
    this.finishTransition(() => {
      this.terminalElement.inert = true;
      this.terminalElement.setAttribute('aria-hidden', 'true');
      this.classroomElement.setAttribute('aria-hidden', 'false');
      cards.forEach(card => card.classList.remove('is-selected'));
      this.openButton.focus({ preventScroll: true });
    });
  }

  beginTransition() {
    this.isTransitioning = true;
    document.body.classList.add('is-transitioning');
    clearTimeout(this.finishTimer);
  }

  finishTransition(afterTransition) {
    this.finishTimer = setTimeout(() => {
      this.isTransitioning = false;
      document.body.classList.remove('is-transitioning');
      afterTransition?.();
    }, this.transitionDuration() + 30);
  }

  handleKeydown(event) {
    if (embedded) {
      if (event.key === 'Escape' && !event.repeat) {
        event.preventDefault();this.closeTerminal();
      }
      return;
    }
    if (event.repeat || this.isTransitioning) return;
    if (event.key === 'Escape' && this.isTerminalOpen) {
      event.preventDefault();
      this.closeTerminal();
      return;
    }

    const target = event.target;
    const isTyping = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target?.isContentEditable;
    if (!this.isTerminalOpen && !isTyping && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      this.openTerminal();
    }
  }
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.has(savedTheme) ? savedTheme : 'futuristic';
  } catch {
    return 'futuristic';
  }
}

function applyTheme(theme, persist = true) {
  const nextTheme = THEMES.has(theme) ? theme : 'futuristic';
  document.documentElement.dataset.theme = nextTheme;
  themeSelect.value = nextTheme;
  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch {}
  }
}

function updateClock() {
  const now = new Date();
  const value = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  clock.textContent = value;
  clock.dateTime = value;
}

function showPreviewMessage(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function selectCard(card) {
  cards.forEach(item => item.classList.toggle('is-selected', item === card));
  showPreviewMessage(`${card.dataset.mode} selected · visual preview only`);
}

cards.forEach(card => {
  card.addEventListener('click', () => selectCard(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectCard(card);
    }
  });
});

themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
  showPreviewMessage(themeSelect.selectedOptions[0].textContent + ' interface enabled');
});

applyTheme(loadTheme(), false);
const terminalPreviewController = new TerminalPreviewController({
  terminalElement: terminal,
  classroomElement: classroomPreview,
  openButton: openTerminalButton,
  closeButton: returnButton,
});
window.terminalPreviewController = terminalPreviewController;
if (embedded) {
  document.documentElement.classList.add('terminal-embedded');
  document.body.classList.add('is-terminal-open');
  terminalPreviewController.isTerminalOpen = true;
  terminal.inert = false;
  terminal.setAttribute('aria-hidden', 'false');
  classroomPreview.hidden = true;
}
updateClock();
setInterval(updateClock, 30_000);
