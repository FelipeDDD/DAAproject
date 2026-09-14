import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_QUIZ_QUESTIONS } from '../convex/quizGeneratedQuestions.js';
import { loadStaticQuizQuestions, serializeQuizModule } from './quiz-csv.mjs';
import { validateQuizQuestion } from '../src/quizValidation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = path.join(root, 'quiz-data');
const outputFile = path.join(root, 'convex', 'quizStaticQuestions.generated.js');
const validateOnly = process.argv.includes('--validate-only');
const result = loadStaticQuizQuestions(dataDirectory);
const knownIds = new Set(result.questions.map((question) => question.id));

for (const template of GENERATED_QUIZ_QUESTIONS) {
  if (knownIds.has(template.id)) result.errors.push(`ID duplicado no banco combinado: ${template.id}`);
  result.errors.push(...validateQuizQuestion(template,{allowGenerated:true})
    .map(message=>`convex/quizGeneratedQuestions.js (${template.id||'missing id'}): ${message}`));
  knownIds.add(template.id);
}

if (result.errors.length > 0) {
  console.error(`Banco de perguntas inválido (${result.errors.length} erro(s)):`);
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  if (!validateOnly) fs.writeFileSync(outputFile, serializeQuizModule(result.questions), 'utf8');
  const action = validateOnly ? 'validadas' : 'sincronizadas';
  console.log(`${result.questions.length} perguntas estáticas em ${result.files.length} CSV(s) ${action}; ${GENERATED_QUIZ_QUESTIONS.length} templates gerados em JavaScript.`);
}
