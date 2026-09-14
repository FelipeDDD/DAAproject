import test from 'node:test';
import assert from 'node:assert/strict';
import { renderQuizMedia } from '../src/QuizMedia.js';

// Minimal DOM contract; fail immediately if rendering ever starts parsing HTML.
function mediaRoot() {
  const doc = {
    baseURI: 'https://quiz.example/',
    createElement(tagName) {
      return {
        tagName, ownerDocument: doc, children: [], dataset: {}, events: {},
        set innerHTML(_) { throw new Error('Question content must not use innerHTML'); },
        set textContent(value) { this.text = value; this.children = []; },
        append(...nodes) { this.children.push(...nodes); },
        replaceChildren(...nodes) { this.children = nodes; },
        contains(node) { return this.children.includes(node); },
        addEventListener(name, callback) { this.events[name] = callback; },
      };
    },
  };
  return doc.createElement('div');
}

test('optional, unknown and malformed media leave no visible area or stale content', () => {
  const root = mediaRoot();
  for (const media of [undefined, null, {}, { type: 'video' },
    { type: 'table', columns: ['A'], rows: [null] },
    { type: 'image', src: 'javascript:alert(1)' }, { type: 'code', content: null }]) {
    renderQuizMedia(root, { type: 'text', content: 'Previous question' });
    renderQuizMedia(root, media);
    assert.equal(root.hidden, true);
    assert.deepEqual(root.children, []);
  }
});

test('text and code preserve literal HTML and code whitespace', () => {
  const root = mediaRoot();
  const content = '<img src=x onerror=alert(1)>\n  const x = 10;';
  renderQuizMedia(root, { type: 'text', content });
  assert.equal(root.hidden, false);
  assert.equal(root.children[0].tagName, 'p');
  assert.equal(root.children[0].text, content);
  renderQuizMedia(root, { type: 'code', content, language: 'javascript' });
  const pre = root.children[0], code = pre.children[0];
  assert.equal(pre.tagName, 'pre');
  assert.equal(code.tagName, 'code');
  assert.equal(code.text, content);
  assert.equal(code.dataset.language, 'javascript');
});

test('tables have scoped headers and safely render cells, zero and missing values', () => {
  const root = mediaRoot();
  renderQuizMedia(root, {
    type: 'table', columns: ['<script>bad()</script>', 'IP'],
    rows: [['<img onerror=bad()>', '192.168.1.10'], [0]],
  });
  const table = root.children[0];
  assert.equal(table.tagName, 'table');
  const [head, body] = table.children;
  const header = head.children[0].children[0];
  assert.equal(header.tagName, 'th');
  assert.equal(header.scope, 'col');
  assert.equal(header.text, '<script>bad()</script>');
  assert.equal(body.children[0].children[0].text, '<img onerror=bad()>');
  assert.deepEqual(body.children[1].children.map(cell => cell.text), ['0', '']);
});

test('images resolve asset paths, preserve alt text and handle broken URLs', () => {
  const root = mediaRoot();
  renderQuizMedia(root, { type: 'image', src: '/assets/quiz/example.png', alt: '<b>Diagram</b>' });
  const img = root.children[0];
  assert.equal(img.tagName, 'img');
  assert.equal(img.src, 'https://quiz.example/assets/quiz/example.png');
  assert.equal(img.alt, '<b>Diagram</b>');
  img.events.error();
  assert.equal(root.children[0].text, 'Imagem indisponível: <b>Diagram</b>');
});

test('a late image error cannot replace the next question media', () => {
  const root = mediaRoot();
  renderQuizMedia(root, { type: 'image', src: '/missing.png' });
  const img = root.children[0];
  renderQuizMedia(root, { type: 'text', content: 'Next question' });
  img.events.error();
  assert.equal(root.children[0].text, 'Next question');
});
