const clock = document.querySelector('#terminal-clock');
const cards = [...document.querySelectorAll('.mode-card')];
const toast = document.querySelector('#preview-toast');
const returnButton = document.querySelector('#return-button');
const themeSelect = document.querySelector('#theme-select');
const terminal = document.querySelector('#terminal-preview');
const classroomPreview = document.querySelector('#classroom-preview');
const openTerminalButton = document.querySelector('#open-terminal-button');
const brandHomeLink = document.querySelector('.brand');
const studyPage = document.querySelector('#study-page');
const studyBackButton = document.querySelector('#study-back-button');
const startStudyButton = document.querySelector('#start-study-button');
const categoryOptions = document.querySelector('#study-category-options');
const topicOptions = document.querySelector('#study-topic-options');
const difficultyOptions = document.querySelector('#study-difficulty-options');
const topicCount = document.querySelector('#study-topic-count');
const studySummary = document.querySelector('#study-summary');
const THEME_STORAGE_KEY = 'terminalTheme';
const THEMES = new Set(['futuristic', 'subtle']);
const embedded = window.parent !== window && new URLSearchParams(location.search).has('embedded');
let toastTimer;

const STUDY_CATEGORIES = [
  'Hardware',
  'Betriebssysteme',
  'Netzwerk',
  'Programmierung',
  'Zahlensysteme',
  'WiSo',
  'Rechnungen',
  'Prüfungssprache',
];
const STUDY_TOPICS = {
  Hardware: ['All Topics', 'Komponenten', 'Speicher', 'Schnittstellen'],
  Betriebssysteme: ['All Topics', 'Prozesse', 'Dateisysteme', 'Berechtigungen'],
  Netzwerk: [
    'All Topics', 'Topologien', 'IPv4', 'Subnetting', 'CSMA', 'OSI',
    'Anwendungsschicht', 'HTTP-HTTPS', 'E-Mail-Protokolle', 'DNS',
    'FTP-SFTP', 'OSI Schicht 5', 'OSI Schicht 6',
  ],
  Programmierung: ['All Topics', 'Variablen', 'Kontrollstrukturen', 'Algorithmen'],
  Zahlensysteme: ['All Topics', 'Binär', 'Hexadezimal', 'Umrechnungen'],
  WiSo: ['All Topics', 'Arbeitsrecht', 'Verträge', 'Wirtschaft'],
  Rechnungen: ['All Topics', 'Prozentrechnung', 'Dreisatz', 'Kostenrechnung'],
  Prüfungssprache: ['All Topics', 'Operatoren', 'Formulierungen', 'Fachbegriffe'],
};
const STUDY_DIFFICULTIES = ['Mixed', 'Medium', 'Hard'];

function cssTimeToMilliseconds(value) {
  const time = Number.parseFloat(value);
  if (!Number.isFinite(time)) return 420;
  return value.trim().endsWith('ms') ? time : time * 1000;
}

class TerminalPageController {
  constructor() {
    this.page = 'home';
    this.selection = {
      category: 'Netzwerk',
      topic: 'All Topics',
      difficulty: 'Mixed',
    };
    this.transitionTimer = null;

    studyBackButton.addEventListener('click', () => this.showHome());
    startStudyButton.addEventListener('click', () => this.previewStart());
    brandHomeLink.addEventListener('click', event => {
      event.preventDefault();
      if (this.page !== 'home') this.showHome();
    });
    this.render();
  }

  createChoice(value, selected, onSelect) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'study-choice';
    button.textContent = value;
    button.dataset.value = value;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', () => onSelect(value));
    return button;
  }

  renderChoices(container, values, selected, onSelect) {
    const fragment = document.createDocumentFragment();
    values.forEach(value => fragment.append(this.createChoice(value, value === selected, onSelect)));
    container.replaceChildren(fragment);
  }

  render() {
    const topics = STUDY_TOPICS[this.selection.category] ?? ['All Topics'];
    if (!topics.includes(this.selection.topic)) this.selection.topic = 'All Topics';

    this.renderChoices(categoryOptions, STUDY_CATEGORIES, this.selection.category, category => {
      this.selection.category = category;
      this.selection.topic = 'All Topics';
      this.render();
    });
    this.renderChoices(topicOptions, topics, this.selection.topic, topic => {
      this.selection.topic = topic;
      this.render();
    });
    this.renderChoices(difficultyOptions, STUDY_DIFFICULTIES, this.selection.difficulty, difficulty => {
      this.selection.difficulty = difficulty;
      this.render();
    });

    topicCount.textContent = `${topics.length} options`;
    studySummary.textContent = `${this.selection.category} · ${this.selection.topic} · ${this.selection.difficulty}`;
  }

  showStudy(card) {
    if (this.page === 'study') return;
    card?.classList.add('is-launching');
    clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      card?.classList.remove('is-launching');
      this.page = 'study';
      terminal.dataset.page = 'study';
      terminal.classList.add('is-showing-study');
      studyPage.inert = false;
      studyPage.setAttribute('aria-hidden', 'false');
      document.querySelectorAll('.terminal-home-page').forEach(element => {
        element.inert = true;
        element.setAttribute('aria-hidden', 'true');
      });
      studyBackButton.focus({ preventScroll: true });
    }, 110);
  }

  showHome({ immediate = false } = {}) {
    if (this.page === 'home' && !terminal.classList.contains('is-showing-study')) return;
    clearTimeout(this.transitionTimer);
    const finish = () => {
      this.page = 'home';
      terminal.dataset.page = 'home';
      terminal.classList.remove('is-showing-study');
      studyPage.inert = true;
      studyPage.setAttribute('aria-hidden', 'true');
      document.querySelectorAll('.terminal-home-page').forEach(element => {
        element.inert = false;
        element.setAttribute('aria-hidden', 'false');
      });
      if (!immediate) document.querySelector('.card-study')?.focus({ preventScroll: true });
    };
    finish();
  }

  previewStart() {
    const configuration = { ...this.selection };
    console.info('Study Mode preview configuration:', configuration);
    startStudyButton.classList.add('is-confirmed');
    startStudyButton.querySelector('span').textContent = 'CONFIGURATION READY';
    showPreviewMessage(`${configuration.category} · ${configuration.topic} · ${configuration.difficulty}`);
    clearTimeout(this.startFeedbackTimer);
    this.startFeedbackTimer = setTimeout(() => {
      startStudyButton.classList.remove('is-confirmed');
      startStudyButton.querySelector('span').textContent = 'START STUDY';
    }, 1500);
  }
}

class TerminalPreviewController {
  constructor({ terminalElement, classroomElement, openButton, closeButton, pageController }) {
    this.terminalElement = terminalElement;
    this.classroomElement = classroomElement;
    this.openButton = openButton;
    this.closeButton = closeButton;
    this.pageController = pageController;
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
    this.pageController.showHome({ immediate: true });
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
    if (event.key === 'Escape' && !event.repeat && this.isTerminalOpen && this.pageController.page !== 'home') {
      event.preventDefault();
      this.pageController.showHome();
      return;
    }
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
  if (card.dataset.mode === 'Study Mode') {
    terminalPageController.showStudy(card);
    return;
  }
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
const terminalPageController = new TerminalPageController();
const terminalPreviewController = new TerminalPreviewController({
  terminalElement: terminal,
  classroomElement: classroomPreview,
  openButton: openTerminalButton,
  closeButton: returnButton,
  pageController: terminalPageController,
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
