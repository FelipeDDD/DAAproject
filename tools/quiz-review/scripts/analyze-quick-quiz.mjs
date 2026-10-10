import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QUICK_QUIZ_CATEGORY_CUTS,
  defaultQuizDataDirectory,
  loadQuickQuizAnalysis,
} from './quick-quiz-analysis.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '../../..');
const outputDirectory = path.join(projectRoot, 'tools', 'quiz-review', 'scripts');
const analysis = loadQuickQuizAnalysis(defaultQuizDataDirectory(projectRoot));

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'quick-quiz-analysis.html'), createHtml(analysis), 'utf8');

console.log(`Total questions: ${analysis.totalQuestions}`);
console.log(`Excluded from Quick Quiz: ${analysis.excludedQuestionCount} (${analysis.excludedCategories.join(', ')})`);
console.log(`CSV files: ${analysis.files.length} (${analysis.files.join(', ')})`);
console.log('Global percentiles (eligible pool excludes WiSo; ranked by displayLength, ties: questionLength, ID)');
console.log('Percentile  Questions  Max question  Max display  Max answer');
for (const row of analysis.percentiles) {
  console.log(`${String(`${row.percentile}%`).padEnd(11)} ${String(row.eligibleCount).padEnd(10)} ${String(row.maxQuestionLength).padEnd(13)} ${String(row.maxDisplayLength).padEnd(12)} ${row.maxAnswerLength}`);
}
console.log('\n20/25/30% thresholds per category:');
console.log(['Category', 'Total', ...[20, 25, 30].flatMap((cut) => [`${cut}% count`, `${cut}% max display`])].join('\t'));
for (const category of analysis.categoryNames) {
  const rows = [20, 25, 30].map((cut) => analysis.perCategoryPercentiles[category].find((row) => row.percentile === cut));
  console.log([category, analysis.categoryQuestionSets[category].length, ...rows.flatMap((row) => [row.eligibleCount, row.maxDisplayLength])].join('\t'));
}
for (const [label, distribution] of [['Global', analysis.globalCategoryDistribution], ['Per-category', analysis.perCategoryDistribution]]) {
  console.log(`\n${label} pool category distribution:`);
  console.log(['Cut', ...analysis.categoryNames, 'Total'].join('\t'));
  for (const row of distribution) {
    console.log([`${row.percentile}%`, ...analysis.categoryNames.map((category) => row.counts[category]), row.targetCount].join('\t'));
  }
}
console.log(`\nHTML viewer: ${path.join(outputDirectory, 'quick-quiz-analysis.html')}`);

function createHtml(data) {
  const embeddedData = JSON.stringify(data).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Quick Quiz Question Analysis</title>
  <style>
    :root { color-scheme: dark; font: 15px/1.5 system-ui, sans-serif; background: #111827; color: #e5e7eb; }
    body { max-width: 1180px; margin: 0 auto; padding: 28px 20px 56px; }
    h1, h2 { line-height: 1.2; } h1 { margin-bottom: 6px; }
    .muted { color: #9ca3af; } .summary { font-size: 1.15rem; margin: 0 0 24px; }
    .notice { background: #3b2f17; border: 1px solid #a87920; border-radius: 8px; padding: 12px 14px; color: #fde68a; }
    .panel { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; white-space: nowrap; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #374151; }
    th { color: #c4b5fd; }
    select { background: #111827; color: #fff; border: 1px solid #6b7280; border-radius: 6px; padding: 8px 12px; }
    .pool-summary { display: flex; flex-wrap: wrap; gap: 10px 24px; margin: 14px 0; }
    .pool-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 10px 16px; margin-top: 12px; }
    button { background: #312e81; color: #fff; border: 1px solid #818cf8; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
    button:focus-visible, select:focus-visible { outline: 2px solid #c4b5fd; outline-offset: 2px; }
    .examples { display: grid; gap: 12px; }
    .question { background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 14px; }
    .question h3 { font-size: 1rem; margin: 4px 0 10px; }
    .question ol { margin: 0; padding-left: 22px; color: #d1d5db; }
    .tag { color: #c4b5fd; font-size: .85rem; }
    @media (min-width: 760px) { .examples { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <h1>Quick Quiz Question Analysis</h1>
  <p class="summary"><strong>${data.totalQuestions}</strong> questions eligible for Quick Quiz, from ${data.sourceQuestionCount} valid questions across ${data.files.length} CSV files</p>
  <p class="notice">WiSo is excluded from the Quick Quiz analysis pool (${data.excludedQuestionCount} questions excluded). Its CSV and the main question bank remain unchanged.</p>
  <p class="muted">Character counts use Unicode code points. Display length = question length + total answer length. Global pools use exact percentile counts; ties are broken by question length and ID.</p>
  <section class="panel">
    <h2>Global percentile thresholds</h2>
    <div class="table-wrap"><table id="percentiles"></table></div>
  </section>
  <section class="panel">
    <h2>Global vs per-category comparison</h2>
    <p class="muted">Global selects the shortest questions across all included categories. Per-category selects the shortest share within every category, then combines those pools.</p>
    <div class="table-wrap"><table id="comparison"></table></div>
    <h3>Per-category display thresholds</h3>
    <div class="table-wrap"><table id="category-thresholds"></table></div>
  </section>
  <section class="panel">
    <h2>Inspect a question pool</h2>
    <label for="strategy">Strategy: </label>
    <select id="strategy"><option value="global">Global percentile</option><option value="per-category">Per-category percentile</option></select>
    <label for="cut"> Cut: </label>
    <select id="cut">${QUICK_QUIZ_CATEGORY_CUTS.map((cut) => `<option value="${cut}"${cut === 20 ? ' selected' : ''}>Shortest ${cut}%</option>`).join('')}</select>
    <div class="pool-controls">
      <label for="view">View: </label>
      <select id="view" aria-label="Question sample view">
        <option value="shortest">Shortest</option>
        <option value="longest">Longest</option>
        <option value="near-cutoff">Near cutoff</option>
        <option value="random-sample">Random sample</option>
      </select>
      <button id="shuffle" type="button" hidden>Shuffle</button>
      <span id="examples-status" class="muted" aria-live="polite"></span>
    </div>
    <div id="category-cutoffs" class="muted"></div>
    <div id="pool-summary" class="pool-summary"></div>
    <div id="examples" class="examples"></div>
  </section>
  <script id="analysis-data" type="application/json">${embeddedData}</script>
  <script>
    const data = JSON.parse(document.getElementById('analysis-data').textContent);
    const byId = (id) => document.getElementById(id);
    const cell = (tag, value) => { const node = document.createElement(tag); node.textContent = value; return node; };
    function renderTable(table, headers, rows) {
      const head = document.createElement('thead'); const headerRow = document.createElement('tr');
      headers.forEach((value) => headerRow.append(cell('th', value))); head.append(headerRow);
      const body = document.createElement('tbody');
      rows.forEach((values) => { const row = document.createElement('tr'); values.forEach((value) => row.append(cell('td', String(value)))); body.append(row); });
      table.replaceChildren(head, body);
    }
    renderTable(byId('percentiles'), ['Percentile', 'Questions', 'Max question', 'Max display', 'Max answer'], data.percentiles.map((row) => [row.percentile + '%', row.eligibleCount, row.maxQuestionLength, row.maxDisplayLength, row.maxAnswerLength]));
    const cuts = [10, 20, 25, 30, 40, 50];
    const comparisonRows = cuts.flatMap((cut) => {
      const global = data.globalCategoryDistribution.find((row) => row.percentile === cut);
      const category = data.perCategoryDistribution.find((row) => row.percentile === cut);
      return [
        ['Global ' + cut + '%', ...data.categoryNames.map((name) => global.counts[name]), global.targetCount],
        ['Per-category ' + cut + '%', ...data.categoryNames.map((name) => category.counts[name]), category.targetCount],
      ];
    });
    renderTable(byId('comparison'), ['Pool', ...data.categoryNames, 'Total'], comparisonRows);
    renderTable(byId('category-thresholds'), ['Category', 'Questions', '20% count', '20% max display', '25% count', '25% max display', '30% count', '30% max display'], data.categoryNames.map((name) => {
      const rows = [20, 25, 30].map((cut) => data.perCategoryPercentiles[name].find((row) => row.percentile === cut));
      return [name, data.categoryQuestionSets[name].length, ...rows.flatMap((row) => [row.eligibleCount, row.maxDisplayLength])];
    }));
    const compareQuestions = (left, right) => left.metrics.displayLength - right.metrics.displayLength ||
      left.metrics.questionLength - right.metrics.questionLength || left.id.localeCompare(right.id);
    function sampleNearCutoff(groups, limit = 12) {
      const examples = [];
      for (let offset = 1; examples.length < limit; offset += 1) {
        let found = false;
        for (const group of groups) {
          if (offset <= group.length) { examples.push(group[group.length - offset]); found = true; }
          if (examples.length === limit) break;
        }
        if (!found) break;
      }
      return examples.sort(compareQuestions);
    }
    function randomSample(pool, limit = 20) {
      const shuffled = pool.slice();
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const other = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
      }
      return shuffled.slice(0, limit);
    }
    function renderPool() {
      const percentile = Number(byId('cut').value);
      const strategy = byId('strategy').value;
      let pool; let summary; let cutoffText = ''; let cutoffGroups;
      if (strategy === 'global') {
        summary = data.percentiles.find((row) => row.percentile === percentile);
        pool = data.rankedQuestions.slice(0, summary.targetCount);
        cutoffGroups = [pool];
      } else {
        const categoryRows = data.categoryNames.map((category) => {
          const categoryPool = data.categoryQuestionSets[category];
          const targetCount = Math.ceil(categoryPool.length * percentile / 100);
          const selected = categoryPool.slice(0, targetCount);
          return { category, selected, summary: data.perCategoryPercentiles[category].find((row) => row.percentile === percentile) };
        });
        pool = categoryRows.flatMap((row) => row.selected).sort((left, right) => left.metrics.displayLength - right.metrics.displayLength || left.metrics.questionLength - right.metrics.questionLength || left.id.localeCompare(right.id));
        cutoffGroups = categoryRows.map((row) => row.selected);
        const metrics = pool.map((question) => question.metrics);
        summary = { eligibleCount: pool.length, maxQuestionLength: Math.max(0, ...metrics.map((item) => item.questionLength)), maxDisplayLength: Math.max(0, ...metrics.map((item) => item.displayLength)), maxAnswerLength: Math.max(0, ...metrics.map((item) => item.maxAnswerLength)) };
        cutoffText = categoryRows.map(({ category, selected, summary: row }) => category + ': ' + selected.length + '/' + data.categoryQuestionSets[category].length + ' · max display ' + row.maxDisplayLength).join(' | ');
      }
      byId('pool-summary').replaceChildren(
        cell('strong', 'Eligible: ' + pool.length + ' / ' + data.totalQuestions),
        cell('span', 'Max question: ' + summary.maxQuestionLength + ' chars'),
        cell('span', 'Max display: ' + summary.maxDisplayLength + ' chars'),
        cell('span', 'Max answer: ' + summary.maxAnswerLength + ' chars'),
      );
      byId('category-cutoffs').textContent = cutoffText;
      const view = byId('view').value;
      const displayedPool = view === 'longest' ? pool.slice(-12).reverse()
        : view === 'near-cutoff' ? sampleNearCutoff(cutoffGroups)
        : view === 'random-sample' ? randomSample(pool)
        : pool.slice(0, 12);
      byId('shuffle').hidden = view !== 'random-sample';
      byId('examples-status').textContent = 'Showing ' + displayedPool.length + ' of ' + pool.length + ' eligible questions.';
      const examples = displayedPool.map((question) => {
        const article = document.createElement('article'); article.className = 'question';
        const tag = cell('div', question.category + ' · ' + question.id + ' · display ' + question.metrics.displayLength);
        tag.className = 'tag'; article.append(tag, cell('h3', question.question));
        const answers = document.createElement('ol');
        question.answers.forEach((answer) => answers.append(cell('li', answer)));
        article.append(answers); return article;
      });
      byId('examples').replaceChildren(...examples);
    }
    byId('cut').addEventListener('change', renderPool); byId('strategy').addEventListener('change', renderPool);
    byId('view').addEventListener('change', renderPool); byId('shuffle').addEventListener('click', renderPool); renderPool();
  </script>
</body>
</html>
`;
}
