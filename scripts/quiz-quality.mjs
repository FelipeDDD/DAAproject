// Editorial signals only: REVIEW requires human/AI review, not an automatic correction.
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const length = (text) => Array.from(text.trim()).length;
const mean = (values) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

export function normalizeQuizText(text = '') {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim();
}

function phraseMatches(text, pattern) {
  // Unicode boundaries: JS \b does not treat German umlauts as word characters.
  return [...text.normalize('NFKC').matchAll(new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, 'giu',
  ))].map((match) => match[0]);
}

const external = 'im\\s+(?:Übungsblatt|Arbeitsblatt|Material|Skript)|laut\\s+(?:Material|Folien?)|wie\\s+(?:oben|zuvor)\\s+beschrieben';
const absolutes = 'immer|nie|niemals|ausschließlich|unter\\s+keinen\\s+Umständen';
const citationArtifact = /(?<![\p{L}\p{N}_])(?:contentReference|oaicite)(?![\p{L}\p{N}_])|cite[^]+|【[^】]*†[^】]*】/giu;
const tokens = (text) => new Set(normalizeQuizText(text).match(/[\p{L}\p{N}]+/gu) ?? []);
const operators = (text) => normalizeQuizText(text).match(/[-+<>=!/*%&|]/gu)?.join('') ?? '';
const MIN_NEAR_DUPLICATE_TOKENS = 6;
const NEAR_DUPLICATE_THRESHOLD = 0.85;
const genericCompleteQuestion = (text) => /^welche (?:aussage ist (?:falsch|korrekt|richtig)|zuordnung ist korrekt)\?$/u.test(text);

function stronglySimilarAnswers(first, second) {
  if (normalizeQuizText(first.answers[first.correctAnswer]) !== normalizeQuizText(second.answers[second.correctAnswer])) return false;
  const remaining = new Map();
  for (const answer of second.answers) {
    const normalized = normalizeQuizText(answer);
    remaining.set(normalized, (remaining.get(normalized) ?? 0) + 1);
  }
  let matches = 0;
  for (const answer of first.answers) {
    const normalized = normalizeQuizText(answer);
    const count = remaining.get(normalized) ?? 0;
    if (count) {
      matches += 1;
      remaining.set(normalized, count - 1);
    }
  }
  return matches >= 3;
}

function localIssues(question) {
  const issues = [];
  const add = (rule, severity, message, metrics = {}) => issues.push({ rule, severity, message, metrics });
  const { answers, correctAnswer, explanation = '' } = question;
  const lengths = answers.map(length);
  const correctLength = lengths[correctAnswer];
  const distractorLengths = lengths.filter((_, index) => index !== correctAnswer);
  const distractorMean = mean(distractorLengths);
  const fields = [['question', question.question], ...answers.map((answer, index) => [`answers[${index}]`, answer]), ['explanation', explanation]];
  for (const [field, text] of fields) {
    const matches = phraseMatches(text, external);
    if (matches.length) add('external_context_reference', 'warning', `Referência externa em ${field}.`, { field, matches });
    const artifacts = text.match(citationArtifact) ?? [];
    if (artifacts.length) add('citation_artifact', 'warning', `Resíduo de citação em ${field}.`, { field, matches: artifacts });
  }
  if (correctLength > Math.max(...distractorLengths) && correctLength >= distractorMean * 1.25 && correctLength - distractorMean >= 8) {
    add('correct_answer_length_outlier', 'warning', 'Resposta correta é a única mais longa e supera os limites de comprimento.', {
      lengths, correctAnswer, correctLength, distractorMean, ratio: correctLength / distractorMean,
      difference: correctLength - distractorMean,
    });
  }
  const shortest = Math.min(...lengths), longest = Math.max(...lengths);
  if (longest >= shortest * 2.5 && longest - shortest >= 15) {
    add('answer_length_spread', 'warning', 'Alternativas têm grande diferença de comprimento.', {
      lengths, shortest, longest, ratio: longest / shortest, difference: longest - shortest,
    });
  }
  const answerGroups = new Map();
  answers.forEach((answer, index) => {
    const normalized = normalizeQuizText(answer);
    if (!answerGroups.has(normalized)) answerGroups.set(normalized, []);
    answerGroups.get(normalized).push(index);
  });
  for (const indices of answerGroups.values()) {
    if (indices.length > 1) add('duplicate_answer_normalized', 'warning', 'Alternativas iguais após normalização.', { answerIndices: indices });
  }
  if (!explanation.trim()) add('missing_explanation', 'warning', 'Explicação ausente ou vazia.');
  else if (normalizeQuizText(explanation) === normalizeQuizText(answers[correctAnswer])) {
    add('explanation_repeats_answer', 'warning', 'Explicação apenas repete a resposta correta.');
  }
  if (!phraseMatches(answers[correctAnswer], absolutes).length) {
    answers.forEach((answer, index) => {
      const matches = phraseMatches(answer, absolutes);
      if (index !== correctAnswer && matches.length) add('distractor_absolute_word', 'info',
        `Palavra absoluta no distrator ${index + 1}; revisar no contexto.`, { answerIndex: index, matches });
    });
  }
  return issues;
}

function summarize(questions, originals) {
  const issuesByRule = {};
  for (const rule of questions.flatMap((q) => q.issues.map((issue) => issue.rule)).sort(compare)) {
    issuesByRule[rule] = (issuesByRule[rule] ?? 0) + 1;
  }
  const difficulties = {};
  for (const difficulty of originals.map((q) => q.difficulty).sort(compare)) {
    difficulties[difficulty] = (difficulties[difficulty] ?? 0) + 1;
  }
  return {
    questions: questions.length,
    pass: questions.filter((q) => q.status === 'PASS').length,
    review: questions.filter((q) => q.status === 'REVIEW').length,
    issuesByRule, difficulties,
    averageCorrectLength: mean(originals.map((q) => length(q.answers[q.correctAnswer]))),
    averageDistractorLength: mean(originals.flatMap((q) => q.answers.filter((_, i) => i !== q.correctAnswer).map(length))),
  };
}

export function auditQuizQuality(input, { generatedAt = new Date().toISOString(), sources = [] } = {}) {
  const originals = [...input].sort((a, b) => compare(a.source, b.source) || compare(a.id, b.id));
  const questions = originals.map((q) => ({ id: q.id, source: q.source, status: 'PASS', issues: localIssues(q) }));
  const normalized = originals.map((q) => normalizeQuizText(q.question));
  const tokenSets = originals.map((q) => tokens(q.question));
  const operatorSequences = originals.map((q) => operators(q.question));
  for (let i = 0; i < originals.length; i += 1) {
    for (let j = i + 1; j < originals.length; j += 1) {
      const exact = normalized[i] === normalized[j];
      if (genericCompleteQuestion(normalized[i]) && genericCompleteQuestion(normalized[j])
        && !stronglySimilarAnswers(originals[i], originals[j])) continue;
      if (!exact && (originals[i].id === originals[j].id || operatorSequences[i] !== operatorSequences[j] || tokenSets[i].size < MIN_NEAR_DUPLICATE_TOKENS || tokenSets[j].size < MIN_NEAR_DUPLICATE_TOKENS)) continue;
      const intersection = [...tokenSets[i]].filter((token) => tokenSets[j].has(token)).length;
      const union = tokenSets[i].size + tokenSets[j].size - intersection;
      const score = union ? intersection / union : 0;
      if (!exact && score < NEAR_DUPLICATE_THRESHOLD) continue;
      for (const [index, other] of [[i, j], [j, i]]) {
        questions[index].issues.push({
          rule: exact ? 'exact_duplicate_question' : 'near_duplicate_question', severity: 'warning',
          message: exact ? 'Enunciado duplicado após normalização.' : 'Enunciado semelhante; revisar o par.',
          metrics: { otherId: originals[other].id, otherSource: originals[other].source, ...(exact ? {} : { score }) },
        });
      }
    }
  }
  for (const question of questions) {
    question.issues.sort((a, b) => compare(a.rule, b.rule) || compare(JSON.stringify(a.metrics), JSON.stringify(b.metrics)));
    question.status = question.issues.length ? 'REVIEW' : 'PASS';
  }
  const files = [...new Set([...sources, ...originals.map((q) => q.source)])].sort(compare).map((source) => ({
    source, ...summarize(questions.filter((q) => q.source === source), originals.filter((q) => q.source === source)),
  }));
  return { schemaVersion: 1, generatedAt, summary: { files: files.length, ...summarize(questions, originals) }, files, questions };
}

export function formatQuizAudit(report) {
  const summary = (s) => `${s.questions} perguntas | PASS ${s.pass} | REVIEW ${s.review} | média correta ${s.averageCorrectLength.toFixed(1)}; distratores ${s.averageDistractorLength.toFixed(1)}`;
  const lines = [`Auditoria editorial: ${report.summary.files} arquivo(s) | ${summary(report.summary)}`];
  for (const file of report.files) {
    lines.push(`${file.source}: ${summary(file)}`, `  Dificuldade: ${JSON.stringify(file.difficulties)}`);
    lines.push(`  Regras (ocorrências): ${Object.entries(file.issuesByRule).map(([rule, count]) => `${rule}=${count}`).join(', ') || 'nenhuma'}`);
    const ids = report.questions.filter((q) => q.source === file.source && q.status === 'REVIEW').map((q) => q.id);
    lines.push(`  REVIEW: ${ids.slice(0, 20).join(', ') || 'nenhum'}${ids.length > 20 ? `; +${ids.length - 20} IDs (lista completa no JSON com --json)` : ''}`);
  }
  lines.push(`Total por regra (ocorrências): ${JSON.stringify(report.summary.issuesByRule)}`,
    'REVIEW indica sinais para revisão humana/IA, não erros estruturais. Sem avaliação semântica ou factual automática.');
  return lines.join('\n');
}
