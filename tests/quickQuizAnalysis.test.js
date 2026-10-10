import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadStaticQuizQuestions } from '../scripts/quiz-csv.mjs';
import {
  buildQuickQuizAnalysis,
  defaultQuizDataDirectory,
  loadQuickQuizAnalysis,
  QUICK_QUIZ_EXCLUDED_CATEGORIES,
} from '../tools/quiz-review/scripts/quick-quiz-analysis.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quizDataDirectory = defaultQuizDataDirectory(projectRoot);

function csvSnapshot() {
  return fs.readdirSync(quizDataDirectory)
    .filter((file) => file.toLowerCase().endsWith('.csv'))
    .sort()
    .map((file) => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(quizDataDirectory, file))).digest('hex')]);
}

test('analysis counts every valid question from all quiz CSVs without changing them', () => {
  const before = csvSnapshot();
  const parsed = loadStaticQuizQuestions(quizDataDirectory);
  const analysis = loadQuickQuizAnalysis(quizDataDirectory);
  const after = csvSnapshot();

  assert.deepEqual(parsed.errors, []);
  assert.equal(analysis.sourceQuestionCount, parsed.questions.length);
  assert.equal(analysis.totalQuestions, parsed.questions.filter((question) => !QUICK_QUIZ_EXCLUDED_CATEGORIES.includes(question.category.toLowerCase())).length);
  assert.equal(analysis.excludedQuestionCount, parsed.questions.filter((question) => question.category.toLowerCase() === 'wiso').length);
  assert.ok(analysis.rankedQuestions.every((question) => question.category.toLowerCase() !== 'wiso'));
  assert.equal(analysis.files.length, parsed.files.length);
  assert.deepEqual(after, before);
});

test('percentile pools are ordered and use the expected exact rank thresholds', () => {
  const questions = Array.from({ length: 20 }, (_, index) => ({
    id: `q-${String(index + 1).padStart(3, '0')}`,
    category: index % 2 ? 'B' : 'A',
    question: 'q'.repeat(index + 1),
    answers: ['', '', '', ''],
  }));
  const analysis = buildQuickQuizAnalysis(questions);

  assert.deepEqual(analysis.percentiles.map((row) => row.eligibleCount), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.deepEqual(analysis.percentiles.map((row) => row.maxDisplayLength), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.ok(analysis.percentiles.every((row, index, rows) => index === 0 || row.maxDisplayLength >= rows[index - 1].maxDisplayLength));
  assert.deepEqual(analysis.globalCategoryDistribution.map((row) => row.targetCount), [2, 4, 5, 6, 8, 10]);
  assert.deepEqual(analysis.globalCategoryDistribution[0].counts, { A: 1, B: 1 });
  assert.deepEqual(analysis.perCategoryDistribution.map((row) => row.targetCount), [2, 4, 6, 6, 8, 10]);
  assert.equal(analysis.perCategoryPercentiles.A.find((row) => row.percentile === 20).eligibleCount, 2);
  assert.equal(analysis.perCategoryPercentiles.B.find((row) => row.percentile === 20).eligibleCount, 2);
});

test('WiSo exclusion is case-insensitive and viewer exposes both strategies', () => {
  const questions = [
    { id: 'a-001', category: 'Hardware', question: 'short', answers: ['a', 'b', 'c', 'd'] },
    { id: 'b-001', category: 'WiSo', question: 'also short', answers: ['a', 'b', 'c', 'd'] },
    { id: 'c-001', category: 'wiso', question: 'also excluded', answers: ['a', 'b', 'c', 'd'] },
  ];
  const analysis = buildQuickQuizAnalysis(questions);
  const html = fs.readFileSync(path.join(projectRoot, 'tools', 'quiz-review', 'scripts', 'quick-quiz-analysis.html'), 'utf8');

  assert.equal(analysis.sourceQuestionCount, 3);
  assert.equal(analysis.totalQuestions, 1);
  assert.equal(analysis.excludedQuestionCount, 2);
  assert.deepEqual(analysis.categoryNames, ['Hardware']);
  assert.match(html, /WiSo is excluded from the Quick Quiz analysis pool/);
  assert.match(html, /Global percentile/);
  assert.match(html, /Per-category percentile/);
});
