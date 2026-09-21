import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { auditQuizQuality, formatQuizAudit, normalizeQuizText } from '../scripts/quiz-quality.mjs';
import { loadAuditQuestions, parseAuditArguments } from '../scripts/audit-quiz-quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'scripts/audit-quiz-quality.mjs');
const question = (overrides = {}) => ({
  id: 'test-001', source: 'test.csv', difficulty: 'medium',
  question: 'Welche Aufgabe erfüllt dieser Algorithmus bei einer sortierten Liste?',
  answers: ['Suchen', 'Ändern', 'Löschen', 'Kopieren'], correctAnswer: 0,
  explanation: 'Der Algorithmus findet das gesuchte Element in der Liste.', ...overrides,
});
const issues = (overrides, rule) => auditQuizQuality([question(overrides)]).questions[0].issues.filter((issue) => issue.rule === rule);

test('external references use specific phrases and record all fields, without lautet false positives', () => {
  for (const phrase of ['im Übungsblatt', 'im Arbeitsblatt', 'im Material', 'laut Material', 'laut Folie', 'laut Folien', 'im Skript', 'wie oben beschrieben', 'wie zuvor beschrieben']) {
    assert.equal(issues({ question: `Was steht ${phrase}?` }, 'external_context_reference').length, 1);
  }
  const result = issues({ question: 'IM ÜBUNGSBLATT', answers: ['Laut Folie', 'B', 'C', 'D'], explanation: 'wie zuvor beschrieben' }, 'external_context_reference');
  assert.deepEqual(result.map((issue) => issue.metrics.field).sort(), ['answers[0]', 'explanation', 'question']);
  for (const text of ['Eine Schleife lautet:', 'im Materialismus', 'laut Foliennummer', 'vorim Skript']) {
    assert.equal(issues({ question: text }, 'external_context_reference').length, 0);
  }
});

test('correct length outlier requires unique maximum and both inclusive thresholds', () => {
  const check = (lengths) => issues({ answers: lengths.map((n, i) => String(i).repeat(n)) }, 'correct_answer_length_outlier');
  assert.equal(check([40, 32, 32, 32]).length, 1); // ratio 1.25 and difference 8
  assert.equal(check([39, 32, 32, 32]).length, 0);
  assert.equal(check([35, 28, 28, 28]).length, 0); // ratio passes, absolute difference fails
  assert.equal(check([48, 40, 40, 40]).length, 0); // absolute difference passes, ratio fails
  assert.equal(check([40, 40, 20, 20]).length, 0); // tie
  const [issue] = check([40, 32, 32, 32]);
  assert.equal(issue.severity, 'warning');
  assert.equal(issue.metrics.ratio, 1.25);
  assert.deepEqual(issue.metrics.lengths, [40, 32, 32, 32]);
});

test('spread requires both thresholds, with Unicode character counts', () => {
  const check = (lengths) => issues({ answers: lengths.map((n, i) => ['😀', 'b', 'c', 'd'][i].repeat(n)) }, 'answer_length_spread');
  assert.equal(check([25, 10, 15, 20]).length, 1);
  assert.equal(check([24, 10, 15, 20]).length, 0);
  assert.equal(check([10, 4, 5, 6]).length, 0);
});

test('normalization handles Unicode, case and spaces while preserving semantic operators', () => {
  assert.equal(normalizeQuizText(' „U\u0308BUNG   eins?“ '), 'übung eins');
  for (const operator of ['-', '+', '<', '>', '=', '!', '/', '*', '%', '&', '|']) {
    assert.equal(normalizeQuizText(` „${operator}1?“ `), `${operator}1`);
    assert.equal(normalizeQuizText(` „1${operator}“ `), `1${operator}`);
  }
  for (const [left, right] of [['5 > 3', '5 < 3'], ['==', '==='], ['1', '-1']]) {
    assert.notEqual(normalizeQuizText(left), normalizeQuizText(right));
  }
});

test('all exact duplicate group members are marked across files, but not as near duplicates', () => {
  const input = [' „Übung eins?“ ', 'ÜBUNG   EINS.', 'U\u0308bung eins'].map((text, i) => question({ id: `test-00${i}`, source: `${i}.csv`, question: text }));
  const report = auditQuizQuality(input);
  for (const item of report.questions) {
    assert.equal(item.issues.filter((issue) => issue.rule === 'exact_duplicate_question').length, 2);
    assert.equal(item.issues.filter((issue) => issue.rule === 'near_duplicate_question').length, 0);
  }
});

test('near duplicates require six distinct tokens, exclude same IDs and short generic questions', () => {
  const a = question({ question: 'Welche Aufgabe erfüllt dieser Algorithmus bei einer sortierten Liste?' });
  const b = question({ id: 'test-002', question: 'Welche Aufgabe erfüllt dieser Algorithmus bei einer sortierten langen Liste?' });
  const report = auditQuizQuality([a, b]);
  for (const item of report.questions) {
    const [issue] = item.issues.filter((entry) => entry.rule === 'near_duplicate_question');
    assert.ok(issue.metrics.score >= 0.85);
    assert.notEqual(issue.metrics.otherId, item.id);
  }
  for (const input of [[a, { ...b, id: a.id }], [question({ question: 'Was ist RAM?' }), question({ id: 'test-002', question: 'RAM ist was?' })]]) {
    assert.ok(auditQuizQuality(input).questions.every((q) => !q.issues.some((i) => i.rule === 'near_duplicate_question')));
  }
});

test('normalized duplicate answers report all matching indices', () => {
  const result = issues({ answers: [' „Richtig?“ ', 'richtig', 'Falsch', 'Anders'] }, 'duplicate_answer_normalized');
  assert.deepEqual(result[0].metrics.answerIndices, [0, 1]);
});

test('distinct operators and negative numbers are not duplicate answers or questions', () => {
  for (const [left, right] of [['5 > 3', '5 < 3'], ['==', '==='], ['1', '-1']]) {
    assert.equal(issues({ answers: [left, right, 'andere', 'keine'] }, 'duplicate_answer_normalized').length, 0);
    const input = [left, right].map((expression, index) => question({
      id: `test-00${index + 1}`,
      question: `Welche Aussage über den Ausdruck ${expression} gilt bei der Auswertung dieses Algorithmus?`,
    }));
    const report = auditQuizQuality(input);
    for (const item of report.questions) {
      assert.ok(!item.issues.some((issue) => ['exact_duplicate_question', 'near_duplicate_question'].includes(issue.rule)));
    }
  }
});

test('repetitive explanation is detected conservatively without flagging detailed explanations', () => {
  assert.equal(issues({ explanation: ' „SUCHEN?“ ' }, 'explanation_repeats_answer').length, 1);
  assert.equal(issues({ explanation: 'Suchen bedeutet hier, das passende Element in der Liste zu finden.' }, 'explanation_repeats_answer').length, 0);
});

test('absolute words only in distractors are info, and nur or word substrings are not flagged', () => {
  for (const word of ['immer', 'nie', 'niemals', 'ausschließlich', 'unter keinen Umständen']) {
    const result = issues({ answers: ['Richtig', `Es gilt ${word}.`, 'Anders', 'Falsch'] }, 'distractor_absolute_word');
    assert.equal(result.length, 1);
    assert.equal(result[0].severity, 'info');
    assert.equal(result[0].metrics.answerIndex, 1);
  }
  for (const answers of [['nur true oder false', 'nur Zahlen', 'Zimmer', 'Scharnier'], ['immer richtig', 'niemals richtig', 'A', 'B']]) {
    assert.equal(issues({ answers }, 'distractor_absolute_word').length, 0);
  }
});

test('missing and whitespace explanations are warnings; answer position zero has no penalty', () => {
  for (const explanation of [undefined, '', '   ']) assert.equal(issues({ explanation }, 'missing_explanation')[0].severity, 'warning');
  const report = auditQuizQuality([question()]);
  assert.equal(report.questions[0].status, 'PASS');
  assert.equal(report.summary.pass, 1);
});

test('report ordering is deterministic independently of input order and timestamp', () => {
  const input = [question({ id: 'z-001', source: 'b.csv' }), question({ id: 'b-001', source: 'a.csv' }), question({ id: 'a-001', source: 'a.csv' })];
  const first = auditQuizQuality(input, { generatedAt: 'first' });
  const second = auditQuizQuality(input.reverse(), { generatedAt: 'second' });
  delete first.generatedAt; delete second.generatedAt;
  assert.deepEqual(first, second);
  assert.deepEqual(first.questions.map((q) => q.id), ['a-001', 'b-001', 'z-001']);
  for (const item of first.questions) assert.deepEqual(item.issues.map((i) => i.rule), item.issues.map((i) => i.rule).sort());
});

test('CLI rejects invalid options and missing files', () => {
  for (const args of [['--file'], ['--json'], ['--unknown'], ['--file', '../a.csv'], ['--file', 'a.csv', '--file', 'b.csv']]) {
    assert.throws(() => parseAuditArguments(args));
  }
  assert.throws(() => loadAuditQuestions(path.join(root, 'quiz-data'), 'not-found.csv'), /não encontrado/);
});

test('terminal summary stays concise while JSON retains all flagged IDs', () => {
  const report = auditQuizQuality(Array.from({ length: 25 }, (_, i) => question({ id: `test-${String(i).padStart(3, '0')}`, explanation: '' })));
  const text = formatQuizAudit(report);
  assert.match(text, /PASS 0 \| REVIEW 25/);
  assert.match(text, /\+5 IDs/);
  assert.ok(!text.includes('test-024'));
  assert.equal(report.questions.at(-1).id, 'test-024');
});

test('structural errors stop the audit instead of producing misleading quality scores', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-audit-invalid-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, 'invalid.csv'), 'not a CSV');
  assert.throws(() => loadAuditQuestions(directory), /validação estrutural/);
});

test('CLI filters the pilot, creates nested JSON, and never modifies CSVs or generated data', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-quality-audit-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const protectedFiles = [...fs.readdirSync(path.join(root, 'quiz-data')).filter((name) => /\.csv$/i.test(name)).map((name) => path.join(root, 'quiz-data', name)), path.join(root, 'convex/quizStaticQuestions.generated.js')];
  const snapshot = () => protectedFiles.map((file) => ({ file, hash: createHash('sha256').update(fs.readFileSync(file)).digest('hex'), mtime: fs.statSync(file).mtimeMs }));
  const before = snapshot();
  const run = (args) => spawnSync(process.execPath, [cli, ...args], { cwd: directory, encoding: 'utf8' });
  const plain = run([]);
  assert.equal(plain.status, 0, plain.stderr);
  assert.deepEqual(fs.readdirSync(directory), []);
  const output = path.join(directory, 'nested', 'audit.json');
  const filtered = run(['--file', 'programming.csv', '--json', output]);
  assert.equal(filtered.status, 0, filtered.stderr);
  const report = JSON.parse(fs.readFileSync(output, 'utf8'));
  assert.equal(report.schemaVersion, 1);
  assert.ok(Number.isFinite(Date.parse(report.generatedAt)));
  assert.equal(report.summary.files, 1);
  assert.equal(report.summary.questions, 18);
  assert.deepEqual(report.summary.difficulties, { hard: 5, medium: 13 });
  assert.ok(report.questions.every((q) => q.source === 'programming.csv'));
  assert.ok(report.summary.issuesByRule.correct_answer_length_outlier > 1);
  assert.equal(report.summary.issuesByRule.exact_duplicate_question, undefined);
  assert.equal(report.summary.issuesByRule.duplicate_answer_normalized, undefined);
  for (const id of ['Programmierung-015', 'Programmierung-017']) {
    assert.ok(!report.questions.find((q) => q.id === id).issues.some((i) => i.rule === 'external_context_reference'));
  }
  for (const file of [protectedFiles[0], protectedFiles.at(-1)]) assert.notEqual(run(['--json', file]).status, 0);
  assert.notEqual(run(['--json', output]).status, 0, 'existing output is not overwritten');
  assert.deepEqual(snapshot(), before);
});
