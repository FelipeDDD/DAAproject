import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertQuizCsv } from './quiz-csv.mjs';
import { auditQuizQuality, formatQuizAudit } from './quiz-quality.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseAuditArguments(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const argument = args[i];
    if (!['--file', '--json'].includes(argument)) throw new Error(`Opção desconhecida: ${argument}`);
    const key = argument.slice(2), value = args[++i];
    if (!value || value.startsWith('--') || options[key]) throw new Error(`Valor ausente ou opção repetida: ${argument}`);
    options[key] = value;
  }
  if (options.file && (path.basename(options.file) !== options.file || !/\.csv$/i.test(options.file))) {
    throw new Error('--file deve ser o nome de um CSV em quiz-data/.');
  }
  return options;
}

export function loadAuditQuestions(directory, file) {
  const files = fs.readdirSync(directory).filter((name) => /\.csv$/i.test(name) && (!file || name === file)).sort();
  if (!files.length) throw new Error(file ? `CSV não encontrado: ${file}` : 'Nenhum CSV encontrado.');
  const questions = [], errors = [], ids = new Set();
  for (const source of files) {
    const result = convertQuizCsv(fs.readFileSync(path.join(directory, source), 'utf8'), source);
    errors.push(...result.errors);
    for (const question of result.questions) {
      if (ids.has(question.id)) errors.push(`ID duplicado: ${question.id}`);
      ids.add(question.id);
      questions.push(question);
    }
  }
  if (errors.length) throw new Error(`Falha na validação estrutural:\n${errors.join('\n')}`);
  return { files, questions };
}

function writeReport(destination, report) {
  // Do not allow --json to overwrite a source, generated module, or any existing file.
  if (path.extname(destination).toLowerCase() !== '.json') throw new Error('--json exige um caminho com extensão .json.');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
}

export function runAudit(args) {
  const options = parseAuditArguments(args);
  const { files, questions } = loadAuditQuestions(path.join(root, 'quiz-data'), options.file);
  const report = auditQuizQuality(questions, { sources: files });
  if (options.json) writeReport(path.resolve(options.json), report);
  console.log(formatQuizAudit(report));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runAudit(process.argv.slice(2)); }
  catch (error) { console.error(`Auditoria não concluída: ${error.message}`); process.exitCode = 1; }
}
