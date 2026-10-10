import fs from 'node:fs';
import path from 'node:path';
import { convertQuizCsv } from '../../../scripts/quiz-csv.mjs';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'quiz-data', 'rechnungen.csv');
const OUTPUT_DIR = path.join(ROOT, 'tools', 'quiz-review', 'reviews');
const OUTPUT = path.join(OUTPUT_DIR, 'rechnungen-benchmark-input.json');

const SELECTED_IDS = Object.freeze([
  "rechnungen-003",
  "rechnungen-009",
  "rechnungen-017",
  "rechnungen-018",
  "rechnungen-021",
  "rechnungen-026",
  "rechnungen-027",
  "rechnungen-035",
  "rechnungen-038",
  "rechnungen-041",
  "rechnungen-046",
  "rechnungen-050",
  "rechnungen-064",
  "rechnungen-069",
  "rechnungen-071",
  "rechnungen-077",
  "rechnungen-082",
  "rechnungen-085",
  "rechnungen-088",
  "rechnungen-109",
  "rechnungen-129",
  "rechnungen-138",
  "rechnungen-150",
  "rechnungen-162",
  "rechnungen-184",
]);

if (!fs.existsSync(SOURCE)) {
  throw new Error(`Arquivo não encontrado: ${SOURCE}`);
}

const parsed = convertQuizCsv(fs.readFileSync(SOURCE, 'utf8'), SOURCE);
if (parsed.errors.length) {
  throw new Error(`rechnungen.csv inválido:\n${parsed.errors.join('\n')}`);
}

const byId = new Map(parsed.questions.map((question) => [question.id, question]));
const missing = SELECTED_IDS.filter((id) => !byId.has(id));
if (missing.length) {
  throw new Error(`IDs ausentes em rechnungen.csv: ${missing.join(', ')}`);
}

const questions = SELECTED_IDS.map((id) => {
  const { source, ...question } = byId.get(id);
  return question;
});

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const payload = {
  benchmark: "rechnungen-first-pass-v1",
  source: "quiz-data/rechnungen.csv",
  questionCount: questions.length,
  selectedIds: SELECTED_IDS,
  instructions: {
    blindComparison: true,
    preserveIds: true,
    doNotModifySourceCsv: true
  },
  questions
};

fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Benchmark criado: ${OUTPUT}`);
console.log(`Questões: ${questions.length}`);
