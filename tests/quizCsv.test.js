import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertQuizCsv, loadStaticQuizQuestions } from '../scripts/quiz-csv.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const header = 'id;category;difficulty;question;answer1;answer2;answer3;answer4;correctAnswer;explanation;media';

test('all CSV questions load with unique IDs, source files and quoted code intact', () => {
  const result = loadStaticQuizQuestions(path.join(root, 'quiz-data'));
  assert.deepEqual(result.errors, []);
  assert.ok(result.questions.length >= 23);
  assert.equal(new Set(result.questions.map(({ id }) => id)).size, result.questions.length);

  const code = result.questions.find(({ id }) => id === 'Programmierung-011');
  assert.equal(code.source,'programming.csv');
  assert.equal(code.answers[0],'const score = 10;');
  assert.match(result.questions.find(({id})=>id==='Programmierung-014').question,/value = 5; if/);
  assert.ok(result.questions.filter(({ category }) => category === 'Hardware').length >= 20);
});

test('quoted CSV fields preserve semicolons, quotes and line breaks', () => {
  const media = JSON.stringify({ type: 'text', content: 'Use "aspas".' }).replaceAll('"', '""');
  const csv = `${header}\nexample-001;Test;medium;"Zeile 1;\nZeile 2";A;B;C;D;0;;"${media}"`;
  const result = convertQuizCsv(csv, 'example.csv');
  assert.deepEqual(result.errors, []);
  assert.equal(result.questions[0].question, 'Zeile 1;\nZeile 2');
  assert.equal(result.questions[0].media.content, 'Use "aspas".');
});

test('comma-delimited exports from other Excel locales are detected automatically', () => {
  const commaHeader = header.replaceAll(';', ',');
  const csv = `${commaHeader}\nexample-001,Test,medium,Frage,A,B,C,D,0,,`;
  const result = convertQuizCsv(csv, 'example.csv');
  assert.deepEqual(result.errors, []);
  assert.equal(result.questions[0].answers[3], 'D');
});

test('validation reports required fields, answer count, difficulty, index and media', () => {
  const csv = `${header}\ninvalid-id;;impossible;Pergunta;A;B;;D;9;;"{""type"":""table"",""columns"":[""A"",""B""],""rows"":[[""só uma""]]}"`;
  const result = convertQuizCsv(csv, 'hardware.csv');
  const report = result.errors.join('\n');
  assert.match(report, /id deve terminar em -001/);
  assert.match(report, /category is required/);
  assert.match(report, /difficulty must be medium or hard/);
  assert.match(report, /all 4 answers must be filled/);
  assert.match(report, /correctAnswer must be/);
  assert.match(report, /table\.rows\[0\]/);
});

test('validation detects duplicate IDs across CSV files', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-csv-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const row = 'shared-001;Test;medium;Frage;A;B;C;D;0;;';
  fs.writeFileSync(path.join(directory, 'shared.csv'), `${header}\n${row}\n`, 'utf8');
  fs.writeFileSync(path.join(directory, 'second.csv'), `${header}\n${row}\n`, 'utf8');
  const report = loadStaticQuizQuestions(directory).errors.join('\n');
  assert.match(report, /ID duplicado shared-001/);
});
