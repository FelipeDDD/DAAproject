import { TERMINAL_ANIMATION as timing } from './config.js';
import { getMonitorScreenBounds } from '../maps/terminalComputers.js';
import { TerminalStudyBridge } from './TerminalStudyBridge.js';

export class TerminalOverlayController {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.isTransitioning = false;
    this.animations = new Set();
    this.root = document.createElement('div');
    this.root.className = 'terminal-overlay';
    this.root.hidden = true;
    this.root.tabIndex = -1;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'DAA Project Terminal');
    this.root.innerHTML = '<div class="terminal-dimmer"></div><div class="terminal-surface"><iframe title="DAA Project Terminal"></iframe></div>';
    this.surface = this.root.querySelector('.terminal-surface');
    this.dimmer = this.root.querySelector('.terminal-dimmer');
    this.frame = this.root.querySelector('iframe');
    this.frame.inert = true;
    // Load once, ahead of interaction. The embedded page has no Convex client.
    this.frame.src = `${import.meta.env?.BASE_URL ?? '/'}prototype-ui/computer-ui-preview.html?embedded=1`;
    document.body.append(this.root);
    this.onMessage = event => {
      if (event.origin === location.origin && event.source === this.frame.contentWindow &&
        event.data?.type === 'daa-terminal-database-request') {
        void this.databaseBridge().then(bridge=>bridge.handle(event));return;
      }
      if (event.origin === location.origin && event.source === this.frame.contentWindow &&
        event.data?.type === 'daa-terminal-leaderboard-request') {
        void this.leaderboardBridge().then(bridge=>bridge.handle(event));return;
      }
      if (!this.studyBridge && this.scene.soloStudy) {
        this.studyBridge=new TerminalStudyBridge({frame:this.frame,controller:this.scene.soloStudy});
      }
      if (this.studyBridge?.accepts(event)) { void this.studyBridge.handle(event); return; }
      if (event.origin === location.origin && event.source === this.frame.contentWindow &&
        event.data?.type === 'daa-terminal-close') void this.close();
    };
    this.onKey = event => {
      if (!this.active) return;
      // The iframe owns internal Escape navigation. Its home page explicitly asks us to close.
      if (document.activeElement === this.frame) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (event.type === 'keydown' && !event.repeat) void this.close();
      }
      // Terminal keyboard controls remain usable; nothing reaches Phaser/chat.
      if (!this.root.contains(event.target) || /^(e|w|a|s|d|[1-6]|Arrow.*|Enter|Escape)$/i.test(event.key)) {
        event.stopImmediatePropagation();
        if (!this.root.contains(event.target)) event.preventDefault();
      }
    };
    this.onResize = () => {
      if (this.active && ['focus', 'expand', 'collapse'].includes(this.phase)) this.updateOrigin();
    };
    window.addEventListener('message', this.onMessage);
    window.addEventListener('keydown', this.onKey, true);
    window.addEventListener('keyup', this.onKey, true);
    window.addEventListener('resize', this.onResize);
  }

  get active() { return this.isOpen || this.isTransitioning; }
  duration(ms) { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms; }

  focusContent() {
    if (!this.active || this.disposed) return false;
    this.frame.focus?.({ preventScroll: true });
    this.frame.contentWindow?.focus();
    return true;
  }

  databaseBridge() {
    if(!this.databaseBridgePromise)this.databaseBridgePromise=import('./TerminalQuestionDatabaseBridge.js')
      .then(({TerminalQuestionDatabaseBridge})=>{
        const bridge=new TerminalQuestionDatabaseBridge({frame:this.frame});
        if(this.disposed)bridge.destroy();
        return bridge;
      });
    return this.databaseBridgePromise;
  }

  leaderboardBridge() {
    if(!this.leaderboardBridgePromise)this.leaderboardBridgePromise=import('./TerminalLeaderboardBridge.js')
      .then(({TerminalLeaderboardBridge})=>{
        const bridge=new TerminalLeaderboardBridge({frame:this.frame,presence:this.scene.presence});
        if(this.disposed)bridge.destroy();
        return bridge;
      });
    return this.leaderboardBridgePromise;
  }

  animate(element, frames, ms, delay = 0) {
    const animation = element.animate(frames, {
      duration: this.duration(ms), delay: this.duration(delay), easing: timing.easing, fill: 'both',
    });
    this.animations.add(animation);
    return animation.finished.catch(() => {}).finally(() => {
      this.animations.delete(animation);
      animation.cancel();
    });
  }

  moveCamera(values) {
    const camera = this.scene.cameras.main;
    return new Promise(resolve => {
      this.finishCamera = resolve;
      if (!this.duration(timing.cameraMs)) { Object.assign(camera, values); resolve(); return; }
      this.cameraTween = this.scene.tweens.add({
        targets: camera, ...values, duration: timing.cameraMs, ease: 'Sine.easeInOut',
        onUpdate: () => { if(this.phase === 'focus') this.updateOrigin(); },
        onComplete: resolve,
      });
    });
  }

  updateOrigin() {
    const camera = this.scene.cameras.main;
    camera.preRender();
    const bounds = getMonitorScreenBounds(this.computer, camera,
      this.scene.game.canvas, this.scene.scale.gameSize);
    this.surface.style.setProperty('--monitor-x', `${bounds.left}px`);
    this.surface.style.setProperty('--monitor-y', `${bounds.top}px`);
    this.surface.style.setProperty('--monitor-scale-x', bounds.width / window.innerWidth);
    this.surface.style.setProperty('--monitor-scale-y', bounds.height / window.innerHeight);
    return 'translate(var(--monitor-x), var(--monitor-y)) scale(var(--monitor-scale-x), var(--monitor-scale-y))';
  }

  async open(computer) {
    if (this.active || this.disposed) return;
    this.isTransitioning = true;
    this.computer = computer;
    const { scene } = this, camera = scene.cameras.main;
    this.saved = {
      scrollX: camera.scrollX, scrollY: camera.scrollY, zoom: camera.zoom,
      follow: camera._follow, roundPixels: camera.roundPixels,
      lerpX: camera.lerp.x, lerpY: camera.lerp.y,
      offsetX: camera.followOffset.x, offsetY: camera.followOffset.y,
      keyboardEnabled: scene.input.keyboard.enabled,
    };
    camera.stopFollow();
    scene.player.setVelocity(0, 0);
    scene.input.keyboard.resetKeys();
    scene.input.keyboard.enabled = false;
    scene.quiz?.updateSeatPrompt(false);
    scene.soloStudy?.updateSeatPrompt(false);
    this.background = [...document.body.children].filter(e => e !== this.root && e.tagName !== 'SCRIPT')
      .map(element => ({ element, inert: element.inert }));
    this.background.forEach(({ element }) => { element.inert = true; });
    this.root.hidden = false;
    this.root.focus({ preventScroll: true });
    this.phase = 'focus';
    const origin = this.updateOrigin();
    this.surface.style.transform = origin;
    this.surface.style.opacity = '.8';
    await Promise.all([
      this.animate(this.surface, [{ boxShadow: '0 0 2px #62efff' }, { boxShadow: '0 0 28px #62efff' }, { boxShadow: '0 0 8px #62efff' }], timing.flashMs),
      this.moveCamera(matchMedia('(prefers-reduced-motion: reduce)').matches ? {} : {
        zoom: this.saved.zoom * timing.zoomFactor,
        scrollX: this.saved.scrollX + (computer.x + computer.width / 2 - camera.width / 2 - this.saved.scrollX) * timing.panFraction,
        scrollY: this.saved.scrollY + (computer.y + computer.height / 2 - camera.height / 2 - this.saved.scrollY) * timing.panFraction,
      }),
    ]);
    if (this.disposed) return;
    this.phase = 'expand';
    const start = this.updateOrigin();
    this.surface.style.transform = 'none';
    this.surface.style.opacity = '1';
    this.dimmer.style.opacity = '1';
    this.frame.style.opacity = '1';
    await Promise.all([
      this.animate(this.surface, [{ transform: start, opacity: .8, borderRadius: '12px' }, { transform: 'none', opacity: 1, borderRadius: '0' }], timing.expandMs),
      this.animate(this.dimmer, [{ opacity: 0 }, { opacity: 1 }], timing.expandMs),
      this.animate(this.frame, [{ opacity: 0 }, { opacity: 1 }], timing.contentMs, timing.expandMs * timing.contentDelayFraction),
    ]);
    if (this.disposed) return;
    this.phase = 'open';
    this.isOpen = true;
    this.isTransitioning = false;
    this.frame.inert = false;
    this.focusContent();
    if (this.closeRequested) { this.closeRequested = false; void this.close(); }
  }

  async close() {
    if (this.disposed || !this.active) return;
    if (this.isTransitioning) {
      if (this.phase !== 'collapse' && this.phase !== 'restore' && this.phase !== 'hide-content') this.closeRequested = true;
      return;
    }
    this.isTransitioning = true;
    void this.studyBridge?.reset();
    this.phase = 'hide-content';
    this.frame.inert = true;
    this.root.focus({ preventScroll: true });
    this.frame.style.opacity = '0';
    await this.animate(this.frame, [{ opacity: 1 }, { opacity: 0 }], timing.contentMs);
    if (this.disposed) return;
    this.phase = 'collapse';
    const end = this.updateOrigin();
    this.surface.style.transform = end;
    this.dimmer.style.opacity = '0';
    await Promise.all([
      this.animate(this.surface, [{ transform: 'none', borderRadius: '0' }, { transform: end, borderRadius: '12px' }], timing.expandMs),
      this.animate(this.dimmer, [{ opacity: 1 }, { opacity: 0 }], timing.expandMs),
    ]);
    if (this.disposed) return;
    this.phase = 'restore';
    this.surface.style.opacity = '0';
    await this.moveCamera({ scrollX: this.saved.scrollX, scrollY: this.saved.scrollY, zoom: this.saved.zoom });
    if (!this.disposed) this.restore();
  }

  restore() {
    if (this.saved) {
      const s = this.saved, camera = this.scene.cameras.main;
      if (s.follow) camera.startFollow(s.follow, s.roundPixels, s.lerpX, s.lerpY, s.offsetX, s.offsetY);
      camera.setZoom(s.zoom).setScroll(s.scrollX, s.scrollY);
      this.scene.input.keyboard.resetKeys();
      this.scene.input.keyboard.enabled = s.keyboardEnabled;
      this.background?.forEach(({ element, inert }) => { element.inert = inert; });
    }
    this.saved = null;
    this.isOpen = this.isTransitioning = this.closeRequested = false;
    this.root.hidden = true;
    this.frame.inert = true;
    document.getElementById('game')?.focus({ preventScroll: true });
  }

  destroy() {
    this.disposed = true;
    this.cameraTween?.stop();
    this.finishCamera?.();
    this.animations.forEach(animation => animation.cancel());
    this.studyBridge?.destroy();
    void this.databaseBridgePromise?.then(bridge=>bridge.destroy());
    void this.leaderboardBridgePromise?.then(bridge=>bridge.destroy());
    this.restore();
    window.removeEventListener('message', this.onMessage);
    window.removeEventListener('keydown', this.onKey, true);
    window.removeEventListener('keyup', this.onKey, true);
    window.removeEventListener('resize', this.onResize);
    this.root.remove();
  }
}
