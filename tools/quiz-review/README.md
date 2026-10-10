# Quiz review tools

Ferramentas locais de análise e revisão, reunidas sem alterar o banco de perguntas.

- `viewer/`: visualizador de propostas/validações e decisões humanas. Abra `viewer/open-viewer.cmd` ou `viewer/index.html`; também pode usar `/tools/quiz-review/viewer/` com Vite.
- `scripts/`: analisador Quick Quiz, helper reutilizável, HTML de análise, gerador de benchmark Rechnungen, prompts-base e instruções do benchmark.
- `reviews/`: JSONs de propostas/validações e outros resultados de revisão/benchmark. Inclui os dois relatórios Netzwerk de 2026-10-10.

## Quick Quiz

A partir da raiz: `npm run analyze:quick-quiz`.

O comando gera `tools/quiz-review/scripts/quick-quiz-analysis.html`; abra esse arquivo no navegador ou acesse `/tools/quiz-review/scripts/quick-quiz-analysis.html` com Vite. Os cálculos e filtros permanecem os mesmos. Todos os CSVs em `quiz-data/` precisam ser perguntas válidas no formato esperado pelo parser compartilhado.

## Benchmark e revisões

A partir da raiz: `node tools/quiz-review/scripts/build-rechnungen-benchmark.mjs`.

A entrada do benchmark é gerada em `tools/quiz-review/reviews/rechnungen-benchmark-input.json`. Os prompts-base ficam em `scripts/`; veja `scripts/README.md`. O lote de IDs selecionados do benchmark continua o mesmo.

Para Netzwerk, selecione no viewer os arquivos `reviews/netzwerk-coverage-review-2026-10-10.json` e `reviews/netzwerk-coverage-validation-2026-10-10.json` juntos.

A chave histórica de localStorage `quiz-review-viewer:v1:` é preservada para manter decisões já salvas no mesmo navegador/origem. Ela é um identificador de armazenamento, não um caminho de pasta; trocar a origem do navegador continua usando outro armazenamento.

## Testes focados

`node --test tests/quickQuizAnalysis.test.js tests/quickQuizViewer.test.js tests/quizReviewViewer.test.js tools/quiz-review/viewer/viewer.test.js`
