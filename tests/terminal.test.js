import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readTerminalComputers, nearbyTerminalComputer, getMonitorScreenBounds } from '../src/maps/terminalComputers.js';
import { TerminalOverlayController } from '../src/terminal/TerminalOverlayController.js';

test('terminal uses the existing Tiled computer and moves with its entity/layer', () => {
  const source = JSON.parse(fs.readFileSync(new URL('../public/assets/maps/classroom.tmj', import.meta.url)));
  const [computer] = readTerminalComputers(source);
  assert.equal(computer.id, '257');
  assert.ok(computer.width > 0 && computer.height > 0);
  const layer = source.layers.find(l => l.name === 'Entities');
  layer.offsetx = 100; layer.offsety = 20;
  const [moved] = readTerminalComputers(source);
  assert.equal(moved.x, computer.x + 100);
  assert.equal(moved.y, computer.y + 20);
  assert.equal(nearbyTerminalComputer([computer], { x: computer.x, right: computer.x + 5, y: computer.y, bottom: computer.y + 5 }), computer);
  assert.equal(nearbyTerminalComputer([computer], { x: 0, y: 0, right: 1, bottom: 1 }), null);
});

test('monitor projection includes zoom/scroll, camera viewport, CSS scaling and resize', () => {
  const computer = { x: 100, y: 50, width: 20, height: 10 };
  const camera = { getViewMatrix: () => ({ transformPoint: (x, y) => ({ x: (x - 40) * 2 + 10, y: (y - 20) * 2 + 5 }) }) };
  let rect = { left: 30, top: 80, width: 480, height: 320 };
  const canvas = { getBoundingClientRect: () => rect };
  assert.deepEqual(getMonitorScreenBounds(computer, camera, canvas, { width: 960, height: 640 }),
    { left: 95, top: 112.5, width: 20, height: 10 });
  rect = { left: 0, top: 0, width: 960, height: 640 };
  assert.deepEqual(getMonitorScreenBounds(computer, camera, canvas, { width: 960, height: 640 }),
    { left: 130, top: 65, width: 40, height: 20 });
});

function harness(t, reducedMotion = false) {
  class Element {
    constructor() {
      this.style = { setProperty(name, value) { this[name] = value; } };
      this.inert = false; this.children = []; this.tagName = 'DIV'; this.hidden = false;
    }
    querySelector(selector) { return this.parts[selector]; }
    set innerHTML(_) {
      this.parts = Object.fromEntries(['.terminal-surface', '.terminal-dimmer', 'iframe'].map(s => [s, new Element()]));
      this.parts.iframe.contentWindow = { focus() {} };
    }
    setAttribute() {}
    append(element) { this.children.push(element); }
    focus() {}
    contains(target) { return target === this; }
    remove() { this.removed = true; }
    animate(frames, options) {
      const record = { frames, options, cancel() { this.cancelled = true; } };
      record.finished = Promise.resolve(); animations.push(record); return record;
    }
  }
  const animations = [], body = new Element(), game = new Element(), listeners = new Map();
  body.children.push(game);
  for (const [key, value] of Object.entries({
    document: { createElement: () => new Element(), body, getElementById: () => game },
    window: { innerWidth: 1000, innerHeight: 700,
      addEventListener(key, fn) { listeners.set(key, fn); }, removeEventListener(key) { listeners.delete(key); } },
    location: { origin: 'http://localhost' },
    matchMedia: () => ({ matches: reducedMotion }),
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  const player = { setVelocity(x, y) { this.velocity = [x, y]; } };
  const camera = {
    scrollX: 100, scrollY: 200, zoom: 2.6, width: 960, height: 640,
    _follow: player, roundPixels: true, lerp: { x: .5, y: .6 }, followOffset: { x: 3, y: 7 },
    stopFollow() { this._follow = null; }, preRender() {},
    startFollow(target, round, x, y, ox, oy) { this._follow = target; this.followArgs = [round, x, y, ox, oy]; },
    setZoom(zoom) { this.zoom = zoom; return this; },
    setScroll(x, y) { this.scrollX = x; this.scrollY = y; return this; },
    getViewMatrix() { return { transformPoint: (x, y) => ({ x: (x - this.scrollX) * this.zoom, y: (y - this.scrollY) * this.zoom }) }; },
  };
  const scene = { cameras: { main: camera }, player,
    game: { canvas: { getBoundingClientRect: () => ({ left: 10, top: 20, width: 960, height: 640 }) } },
    scale: { gameSize: { width: 960, height: 640 } },
    input: { keyboard: { enabled: true, resetKeys() {} } },
    tweens: { add(config) {
      for (const key of ['scrollX', 'scrollY', 'zoom']) if (key in config) config.targets[key] = config[key];
      config.onUpdate?.();queueMicrotask(config.onComplete);return { stop() {} };
    } },
  };
  return { scene, camera, game, animations, listeners, computer: { x: 200, y: 300, width: 16, height: 18 } };
}

test('opening locks immediately, uses monitor origin, delays content, closes and restores camera repeatedly', async t => {
  const h = harness(t), controller = new TerminalOverlayController(h.scene);
  for (let i = 0; i < 3; i++) {
    const opening = controller.open(h.computer);
    assert.equal(controller.isTransitioning, true);
    assert.equal(h.scene.input.keyboard.enabled, false);
    assert.equal(h.game.inert, true);
    await controller.open(h.computer); // Double E must do nothing.
    await opening;
    assert.equal(controller.isOpen, true);
    assert.equal(controller.frame.inert, false);
    assert.ok(h.camera.zoom > 2.6);
    assert.ok(h.animations.some(a => a.options.delay > 200));
    assert.ok(h.animations.some(a => a.frames[0].transform?.includes('--monitor-x')));
    for (const key of ['e', 'w', 'ArrowUp', 'Enter', '1']) {
      let blocked = false;
      h.listeners.get('keydown')({ key, target: h.game, preventDefault() {}, stopImmediatePropagation() { blocked = true; } });
      assert.equal(blocked, true);
    }
    await controller.close();
    assert.equal(controller.active, false);
    assert.equal(h.camera.zoom, 2.6);
    assert.deepEqual([h.camera.scrollX, h.camera.scrollY], [100, 200]);
    assert.deepEqual(h.camera.followArgs, [true, .5, .6, 3, 7]);
    assert.equal(h.camera._follow, h.scene.player);
    assert.equal(h.scene.input.keyboard.enabled, true);
    assert.equal(h.game.inert, false);
  }
  controller.destroy();
  assert.equal(h.listeners.size, 0);
});

test('Escape during opening queues the same reverse close; reduced motion and destruction restore controls', async t => {
  const h = harness(t, true), controller = new TerminalOverlayController(h.scene);
  const opening = controller.open(h.computer);
  h.listeners.get('keydown')({ key: 'Escape', type: 'keydown', target: h.game, preventDefault() {}, stopImmediatePropagation() {} });
  await opening;
  for (let i = 0; i < 20; i++) await Promise.resolve();
  assert.equal(controller.active, false);
  assert.ok(h.animations.every(a => a.options.duration === 0 && a.options.delay === 0));
  const interrupted = controller.open(h.computer);
  controller.destroy();await interrupted;
  assert.equal(controller.active, false);
  assert.equal(h.scene.input.keyboard.enabled, true);
  assert.equal(h.game.inert, false);
});

test('parent overlay leaves Escape navigation to the focused terminal iframe', async t => {
  const h = harness(t, true), controller = new TerminalOverlayController(h.scene);
  await controller.open(h.computer);
  document.activeElement = controller.frame;
  let prevented = false;
  h.listeners.get('keydown')({
    key: 'Escape', type: 'keydown', target: controller.frame,
    preventDefault() { prevented = true; }, stopImmediatePropagation() {},
  });
  await Promise.resolve();
  assert.equal(controller.isOpen, true);
  assert.equal(prevented, false);
  document.activeElement = h.game;
  await controller.close();
  controller.destroy();
});

test('an open terminal can restore iframe focus after returning to the browser tab', async t => {
  const h = harness(t, true), controller = new TerminalOverlayController(h.scene);
  let frameFocuses = 0, windowFocuses = 0;
  controller.frame.focus = () => { frameFocuses++; };
  controller.frame.contentWindow.focus = () => { windowFocuses++; };
  assert.equal(controller.focusContent(), false);
  await controller.open(h.computer);
  const openingFrameFocuses=frameFocuses,openingWindowFocuses=windowFocuses;
  assert.equal(controller.focusContent(), true);
  assert.equal(frameFocuses,openingFrameFocuses+1);
  assert.equal(windowFocuses,openingWindowFocuses+1);
  await controller.close();
  assert.equal(controller.focusContent(), false);
  controller.destroy();
});
