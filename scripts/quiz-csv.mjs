import fs from 'node:fs';
import path from 'node:path';

export const CSV_COLUMNS = Object.freeze([
  'id', 'category', 'difficulty', 'question',
  'answer1', 'answer2', 'answer3', 'answer4',
  'correctAnswer', 'explanation', 'media',
]);
export const SUPPORTED_DIFFICULTIES = Object.freeze(['easy', 'medium', 'hard']);
export const SUPPORTED_MEDIA_TYPES = Object.freeze(['image', 'table', 'text', 'code']);

function csvError(source, line, message) {
  return `${source}:${line}: ${message}`;
}

export function parseQuizCsv(input, source = '<csv>') {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = firstLine.startsWith('id,category,') ? ',' : ';';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
        if (character === '\n') line += 1;
      }
      continue;
    }

    if (character === '"' && field === '') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push({ values: row, line: rowLine });
      row = [];
      field = '';
      line += 1;
      rowLine = line;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error(csvError(source, rowLine, 'campo entre aspas não foi fechado'));
  row.push(field);
  if (row.some((value) => value !== '')) rows.push({ values: row, line: rowLine });
  return rows;
}

function validateMedia(media, context, errors) {
  if (!media || typeof media !== 'object' || Array.isArray(media)) {
    errors.push(`${context}: media deve ser um objeto JSON`);
    return;
  }
  if (!SUPPORTED_MEDIA_TYPES.includes(media.type)) {
    errors.push(`${context}: media.type deve ser image, table, text ou code`);
    return;
  }

  if (media.type === 'image') {
    if (typeof media.src !== 'string' || !media.src.trim()) errors.push(`${context}: image.src é obrigatório`);
    if (media.alt !== undefined && typeof media.alt !== 'string') errors.push(`${context}: image.alt deve ser texto`);
  }
  if (media.type === 'text' && typeof media.content !== 'string') {
    errors.push(`${context}: text.content deve ser texto`);
  }
  if (media.type === 'code') {
    if (typeof media.content !== 'string') errors.push(`${context}: code.content deve ser texto`);
    if (media.language !== undefined && typeof media.language !== 'string') errors.push(`${context}: code.language deve ser texto`);
  }
  if (media.type === 'table') {
    const columnsValid = Array.isArray(media.columns) && media.columns.length > 0
      && media.columns.every((column) => typeof column === 'string' && column.trim());
    if (!columnsValid) errors.push(`${context}: table.columns deve conter ao menos uma coluna de texto`);
    if (!Array.isArray(media.rows)) {
      errors.push(`${context}: table.rows deve ser uma lista`);
    } else if (columnsValid) {
      media.rows.forEach((cells, index) => {
        if (!Array.isArray(cells) || cells.length !== media.columns.length
          || cells.some((cell) => typeof cell !== 'string')) {
          errors.push(`${context}: table.rows[${index}] deve ter ${media.columns.length} células de texto`);
        }
      });
    }
  }
}

export function convertQuizCsv(input, source = '<csv>') {
  const parsedRows = parseQuizCsv(input, source);
  const errors = [];
  if (parsedRows.length === 0) return { questions: [], errors: [csvError(source, 1, 'arquivo vazio')] };

  const header = parsedRows[0].values;
  if (header.length !== CSV_COLUMNS.length || header.some((column, index) => column !== CSV_COLUMNS[index])) {
    errors.push(csvError(source, parsedRows[0].line,
      `cabeçalho esperado (${CSV_COLUMNS.join(', ')}); use ; ou , como separador`));
    return { questions: [], errors };
  }

  const filePrefix = path.basename(source, path.extname(source));
  const questions = [];
  const categories = new Set();
  for (const { values, line } of parsedRows.slice(1)) {
    const context = `${source}:${line}`;
    if (values.length !== CSV_COLUMNS.length) {
      errors.push(`${context}: esperadas ${CSV_COLUMNS.length} colunas, encontradas ${values.length}`);
      continue;
    }
    const record = Object.fromEntries(CSV_COLUMNS.map((column, index) => [column, values[index].trim()]));
    const required = ['id', 'category', 'difficulty', 'question', 'answer1', 'answer2', 'answer3', 'answer4', 'correctAnswer'];
    for (const fieldName of required) {
      if (!record[fieldName]) errors.push(`${context}: campo obrigatório vazio: ${fieldName}`);
    }
    if (record.id && !new RegExp(`^${filePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d{3,}$`).test(record.id)) {
      errors.push(`${context}: id deve seguir ${filePrefix}-001, ${filePrefix}-002, ...`);
    }
    if (record.difficulty && !SUPPORTED_DIFFICULTIES.includes(record.difficulty)) {
      errors.push(`${context}: difficulty não suportada: ${record.difficulty}`);
    }
    if (record.category) categories.add(record.category);
    const answers = [record.answer1, record.answer2, record.answer3, record.answer4];
    if (answers.some((answer) => !answer)) errors.push(`${context}: a pergunta deve ter exatamente 4 respostas preenchidas`);
    if (new Set(answers).size !== answers.length) errors.push(`${context}: as 4 respostas devem ser diferentes`);
    const correctAnswer = Number(record.correctAnswer);
    if (!/^\d+$/.test(record.correctAnswer) || !Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      errors.push(`${context}: correctAnswer deve ser um índice inteiro entre 0 e 3`);
    }

    let media;
    if (record.media) {
      try {
        media = JSON.parse(record.media);
        validateMedia(media, context, errors);
      } catch (error) {
        errors.push(`${context}: media contém JSON inválido (${error.message})`);
      }
    }

    questions.push({
      id: record.id,
      category: record.category,
      difficulty: record.difficulty,
      question: record.question,
      answers,
      correctAnswer,
      ...(record.explanation ? { explanation: record.explanation } : {}),
      ...(media !== undefined ? { media } : {}),
    });
  }
  if (categories.size > 1) errors.push(`${source}: cada CSV deve conter somente uma category`);
  return { questions, errors };
}

export function loadStaticQuizQuestions(directory) {
  const files = fs.readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith('.csv'))
    .sort((left, right) => left.localeCompare(right));
  const questions = [];
  const errors = [];
  const ids = new Map();

  if (files.length === 0) errors.push(`${directory}: nenhum arquivo .csv encontrado`);
  for (const file of files) {
    const source = path.join(directory, file);
    const result = convertQuizCsv(fs.readFileSync(source, 'utf8'), source);
    errors.push(...result.errors);
    for (const question of result.questions) {
      if (ids.has(question.id)) errors.push(`${source}: ID duplicado ${question.id} (também em ${ids.get(question.id)})`);
      else ids.set(question.id, source);
      questions.push(question);
    }
  }
  return { files, questions, errors };
}

export function serializeQuizModule(questions) {
  return `// Generated from quiz-data/*.csv by scripts/sync-quiz-data.mjs. Do not edit.\nexport default ${JSON.stringify(questions, null, 2)};\n`;
}
