import { CharacterItemClient } from '../inventory/CharacterItemClient.js';
import { CHARACTER_ITEM_IDS, characterItemDefinition } from '../inventory/characterItems.js';
import { hasProfileSession } from '../ProfileSessionClient.js';
import { WorldPrompt } from '../ui/WorldPrompt.js';
import { renderQuizMedia } from '../QuizMedia.js';
import { office3PaperPlacement } from '../art/office3PaperHighlight.js';
import {
  OFFICE3_FEEDBACK_MS, OFFICE3_MONITOR, OFFICE3_STREAK_TARGET,
  chooseOffice3Question, nextStreak, passwordIsCorrect,
} from './office3Puzzle.js';
import './office3Puzzle.css';

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export class Office3PuzzleController {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.busy = false;
    this.streak = 0;
    this.usedIds = [];
    this.client = new CharacterItemClient(scene.presence);
    this.paperMarker = office3PaperPlacement(scene.source);
    this.prompt = new WorldPrompt(scene, 'Press E to access terminal', { className: 'office3-terminal-prompt' });
    this.prompt.setPosition(OFFICE3_MONITOR.x, OFFICE3_MONITOR.y - 20);
    this.paperPrompt = new WorldPrompt(scene, 'Press E to inspect paper', { className: 'office3-paper-prompt' });
    if(this.paperMarker)this.paperPrompt.setPosition(this.paperMarker.x,this.paperMarker.y - 23);

    this.root = element('div', 'office3-puzzle-overlay');
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'Office terminal');
    this.root.dataset.blockGameShortcuts = '';
    this.panel = element('section', 'office3-puzzle-panel');
    this.root.append(this.panel);
    document.body.append(this.root);
    this.onKeyDown = event => {
      if (!this.active) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.close();
        return;
      }
      // Suppress game/emote/hotbar shortcuts while this dialog has the keyboard.
      event.stopImmediatePropagation();
    };
    window.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('keyup', this.onKeyDown, true);
  }

  nearMonitor() {
    const body = this.scene.player?.body;
    if (!body) return false;
    return Math.hypot(body.center.x - OFFICE3_MONITOR.x,
      body.center.y - OFFICE3_MONITOR.interactionY) <= OFFICE3_MONITOR.radius;
  }

  nearPaper() {
    const body = this.scene.player?.body;
    if (!body || !this.paperMarker) return false;
    return Math.hypot(body.center.x - this.paperMarker.x,
      body.center.y - this.paperMarker.y) <= 48;
  }

  updatePrompt(available) {
    this.prompt.setVisible(Boolean(available) && !this.active && this.nearMonitor());
    this.paperPrompt.setVisible(Boolean(available) && !this.active && this.nearPaper());
  }

  activate() {
    if (this.active) return false;
    this.active = true;
    this.busy = false;
    this.prompt.setVisible(false);
    this.paperPrompt.setVisible(false);
    this.scene.player.setVelocity(0, 0);
    this.scene.input.keyboard.resetKeys();
    this.keyboardWasEnabled = this.scene.input.keyboard.enabled;
    this.scene.input.keyboard.enabled = false;
    this.root.hidden = false;
    return true;
  }

  open() {
    if (!this.nearMonitor() || !this.scene.presence || !this.activate()) return false;
    if (hasProfileSession(this.scene.presence)) this.showPassword();
    else this.showProfileRequired();
    return true;
  }

  openPaper() {
    if (!this.nearPaper() || !this.activate()) return false;
    this.panel.replaceChildren();
    this.panel.classList.remove('quiz');
    this.panel.classList.add('paper');
    this.root.setAttribute('aria-label', 'Yellow paper');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close paper');
    close.addEventListener('click', () => this.close());
    const image = element('img', 'office3-paper-image');
    image.src = `${import.meta.env.BASE_URL}assets/items/yellow-paper-item.png`;
    image.alt = 'Handwritten note: /28 + /29 - /23';
    this.panel.append(close, image);
    close.focus();
    return true;
  }

  showProfileRequired() {
    this.panel.classList.remove('quiz', 'paper');
    this.root.setAttribute('aria-label', 'Office terminal');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.replaceChildren(close, element('h2', '', 'OFFICE TERMINAL'),
      element('p', '', 'Sign in with a profile to collect the office key.'));
    close.focus();
  }

  showPassword() {
    this.panel.replaceChildren();
    this.panel.classList.remove('quiz', 'paper');
    this.root.setAttribute('aria-label', 'Office terminal');
    const heading = element('h2', '', 'OFFICE TERMINAL');
    const form = element('form', 'office3-password-form');
    const label = element('label', '', 'Password:');
    const prefix = element('span', 'office3-password-prefix', '-');
    const input = element('input', 'office3-password-input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.maxLength = 3;
    input.placeholder = '***';
    input.setAttribute('aria-label', 'Three password digits; the minus sign is already entered');
    input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 3); });
    label.append(prefix, input);
    const submit = element('button', '', 'Submit');
    submit.type = 'submit';
    const feedback = element('p', 'office3-puzzle-feedback');
    feedback.setAttribute('role', 'status');
    form.append(label, submit);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (this.busy || input.value.length !== 3) return;
      this.busy = true;
      const correct = passwordIsCorrect(input.value);
      input.disabled = true;
      submit.disabled = true;
      feedback.textContent = correct ? 'Access confirmed' : 'Access denied';
      // Restart the CSS animation when another denied attempt uses this same element.
      feedback.removeAttribute('data-result');
      void feedback.offsetWidth;
      feedback.dataset.result = correct ? 'correct' : 'wrong';
      this.delay = setTimeout(() => {
        this.delay = null;
        if (!this.active) return;
        this.busy = false;
        if (correct) this.startQuiz();
        else { input.value = ''; input.disabled = false; submit.disabled = false; input.focus(); }
      }, OFFICE3_FEEDBACK_MS);
    });
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.append(close, heading, form, feedback);
    input.focus();
  }

  startQuiz() {
    this.streak = 0;
    this.usedIds = [];
    this.showQuestion();
  }

  showQuestion() {
    if (!this.active) return;
    this.question = chooseOffice3Question(this.usedIds);
    this.usedIds.push(this.question.id);
    this.panel.replaceChildren();
    this.panel.classList.add('quiz');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    const title = element('h2', '', 'ACCESS CONFIRMATION');
    const instructions = element('p', 'office3-puzzle-instructions',
      'Beantworte 5 Fragen richtig in Folge, um den Zugriff zu bestätigen.');
    const progress = element('p', 'office3-puzzle-progress', this.streak + '/' + OFFICE3_STREAK_TARGET);
    const media = element('div', 'office3-puzzle-media');
    renderQuizMedia(media, this.question.media);
    const question = element('p', 'office3-puzzle-question', this.question.question);
    const choices = element('div', 'office3-puzzle-choices');
    const feedback = element('p', 'office3-puzzle-feedback');
    feedback.setAttribute('role', 'status');
    this.question.answers.forEach((answer, index) => {
      const button = element('button', 'office3-puzzle-choice', answer);
      button.type = 'button';
      button.addEventListener('click', () => this.answer(index, choices, feedback, progress));
      choices.append(button);
    });
    this.panel.append(close, title, instructions, progress, media, question, choices, feedback);
    choices.querySelector('button')?.focus();
  }

  answer(index, choices, feedback, progress) {
    if (!this.active || this.busy) return;
    this.busy = true;
    const correct = index === this.question.correctAnswer;
    this.streak = nextStreak(this.streak, correct);
    progress.textContent = this.streak + '/' + OFFICE3_STREAK_TARGET;
    feedback.textContent = correct ? 'Richtig!' : 'Falsch! Die Serie beginnt bei 0/5.';
    feedback.dataset.result = correct ? 'correct' : 'wrong';
    choices.querySelectorAll('button').forEach(button => { button.disabled = true; });
    this.delay = setTimeout(() => {
      this.delay = null;
      if (!this.active) return;
      if (this.streak === OFFICE3_STREAK_TARGET) void this.grantKey();
      else { this.busy = false; this.showQuestion(); }
    }, OFFICE3_FEEDBACK_MS);
  }

  async grantKey() {
    this.panel.classList.remove('reward');
    const close = element('button', 'office3-puzzle-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close terminal');
    close.addEventListener('click', () => this.close());
    this.panel.replaceChildren(close, element('h2', '', 'ACCESS CONFIRMED'));
    const message = element('p', 'office3-puzzle-success', 'Saving key...');
    this.panel.append(message);
    try {
      const inventory = this.scene.characterItems;
      if (!inventory) throw new Error('A profile inventory is required.');
      if (!inventory.items.some(item => item.itemId === CHARACTER_ITEM_IDS.OFFICE2_KEY)) {
        const result = await this.client.claim(CHARACTER_ITEM_IDS.OFFICE2_KEY);
        if (inventory.destroyed) return;
        inventory.setItems([...inventory.items.filter(item => item.itemId !== CHARACTER_ITEM_IDS.OFFICE2_KEY),
          result.item]);
      }
      if (!this.active) return;
      const keyImage = element('img', 'office3-reward-key');
      keyImage.src = `${import.meta.env.BASE_URL}${characterItemDefinition(CHARACTER_ITEM_IDS.OFFICE2_KEY).icon}`;
      keyImage.alt = "Silver key to the Director's office";
      this.panel.insertBefore(keyImage, message);
      this.panel.classList.add('reward');
      message.textContent = 'Du hast den Schlüssel für das Büro des Direktors erhalten.';
      this.panel.append(element('p', 'office3-puzzle-feedback', 'The key is now in your inventory.'));
    } catch (error) {
      if (!this.active) return;
      message.textContent = 'The key could not be saved.';
      this.panel.append(element('p', 'office3-puzzle-feedback', 'Could not save the key. Please try again.'));
      const retry = element('button', '', 'Retry');
      retry.type = 'button';
      retry.addEventListener('click', () => { retry.disabled = true; void this.grantKey(); });
      this.panel.append(retry);
      console.warn('Office terminal reward:', error);
    } finally {
      this.busy = false;
    }
  }

  close() {
    if (!this.active) return;
    clearTimeout(this.delay);
    this.delay = null;
    this.active = false;
    this.busy = false;
    this.root.hidden = true;
    this.panel.replaceChildren();
    this.panel.classList.remove('paper', 'reward');
    this.scene.input.keyboard.resetKeys();
    this.scene.input.keyboard.enabled = this.keyboardWasEnabled !== false;
    this.scene.game.canvas?.focus?.();
  }

  destroy() {
    this.close();
    this.prompt.destroy();
    this.paperPrompt.destroy();
    this.root.remove();
    window.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('keyup', this.onKeyDown, true);
  }
}
