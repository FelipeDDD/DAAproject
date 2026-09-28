import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertQuizCsv, loadStaticQuizQuestions } from '../scripts/quiz-csv.mjs';
import GENERATED_QUIZ_QUESTIONS from '../convex/quizStaticQuestions.generated.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const header = 'id;category;difficulty;question;answer1;answer2;answer3;answer4;correctAnswer;explanation;media';
const topicHeader = 'id;category;topic;difficulty;question;answer1;answer2;answer3;answer4;correctAnswer;explanation;media';

test('all CSV questions load with unique IDs, source files and quoted code intact', () => {
  const result = loadStaticQuizQuestions(path.join(root, 'quiz-data'));
  assert.deepEqual(result.errors, []);
  assert.ok(result.files.length >= 6, 'all current category CSV files are present');
  assert.ok(result.questions.length >= 900, 'the static question bank has not lost a large portion of its questions');
  assert.equal(new Set(result.questions.map(({ id }) => id)).size, result.questions.length);
  const validCategories = new Set(['Betriebssysteme','Hardware','Netzwerk','Programmierung','Rechnungen','WiSo']);
  const categories = new Set(result.questions.map(({ category }) => category));
  assert.deepEqual(categories, validCategories);
  for (const question of result.questions) {
    assert.ok(question.id.trim());
    assert.ok(question.category.trim());
    assert.ok(question.question.trim());
    assert.ok(['medium','hard'].includes(question.difficulty));
    assert.equal(question.answers.length, 4);
    assert.ok(question.answers.every((answer) => typeof answer === 'string' && answer.trim()));
    assert.ok(Number.isInteger(question.correctAnswer));
    assert.ok(question.correctAnswer >= 0 && question.correctAnswer < question.answers.length);
    assert.ok(question.answers[question.correctAnswer].trim());
    assert.ok(question.explanation === undefined || typeof question.explanation === 'string');
  }

  const generatedById = new Map(GENERATED_QUIZ_QUESTIONS.map((question) => [question.id, question]));
  assert.equal(generatedById.size, result.questions.length, 'generated data contains the same number of static questions');
  for (const question of result.questions) {
    const generated = generatedById.get(question.id);
    assert.ok(generated, `generated question ${question.id} exists`);
    for (const field of ['id','category','topic','difficulty','question','correctAnswer','explanation','source'])
      assert.equal(generated[field] ?? null, question[field] ?? null, `${question.id}.${field} matches the CSV`);
    assert.deepEqual(generated.answers, question.answers, `${question.id} answers match the CSV`);
  }

  const code = result.questions.find(({ id }) => id === 'Programmierung-011');
  assert.equal(code.source,'programming.csv');
  assert.equal(code.answers[0],'const score = 10;');
  assert.match(result.questions.find(({id})=>id==='Programmierung-014').question,/value = 5; if/);
  assert.ok(result.questions.filter(({ category }) => category === 'Hardware').length >= 20);
  assert.equal(result.questions.find(({id})=>id==='hardware-001').topic,null);
  const rechnungenTopics=[...new Set(result.questions
    .filter(({category})=>category==='Rechnungen').map(({topic})=>topic))];
  for(const topic of ['Dreisatz','Netto-Brutto','Prozentrechnung','Rabatt','Textverständnis'])
    assert.ok(rechnungenTopics.includes(topic));
});

test('new CSV header reads optional topics while the old header remains compatible',()=>{
  const withTopic=convertQuizCsv(`${topicHeader}\nrechnungen-999;Rechnungen;Rabatt;medium;Frage;A;B;C;D;0;;`,'rechnungen.csv');
  const withoutTopic=convertQuizCsv(`${header}\nhardware-999;Hardware;medium;Frage;A;B;C;D;0;;`,'hardware.csv');
  assert.deepEqual(withTopic.errors,[]);assert.equal(withTopic.questions[0].topic,'Rabatt');
  assert.deepEqual(withoutTopic.errors,[]);assert.equal(withoutTopic.questions[0].topic,null);
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
