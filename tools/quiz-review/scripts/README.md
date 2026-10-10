# Rechnungen Model Benchmark

Este pacote prepara um teste cego para comparar modelos na revisão de `quiz-data/rechnungen.csv`.

## Lote
25 IDs selecionados:
- rechnungen-003
- rechnungen-009
- rechnungen-017
- rechnungen-018
- rechnungen-021
- rechnungen-026
- rechnungen-027
- rechnungen-035
- rechnungen-038
- rechnungen-041
- rechnungen-046
- rechnungen-050
- rechnungen-064
- rechnungen-069
- rechnungen-071
- rechnungen-077
- rechnungen-082
- rechnungen-085
- rechnungen-088
- rechnungen-109
- rechnungen-129
- rechnungen-138
- rechnungen-150
- rechnungen-162
- rechnungen-184

## Fluxo
1. Use o script `tools/quiz-review/scripts/build-rechnungen-benchmark.mjs`.
2. Execute a partir da raiz do projeto:
   `node tools/quiz-review/scripts/build-rechnungen-benchmark.mjs`
3. Isso gera `tools/quiz-review/reviews/rechnungen-benchmark-input.json`.
4. Entregue exatamente o mesmo JSON + `prompt-first-pass.md` para:
   - Sol High
   - Astra Light
5. Salve as saídas separadamente em `tools/quiz-review/reviews/`, por exemplo:
   - `sol-high-result.json`
   - `astra-light-result.json`
6. Depois monte os candidatos como A/B sem revelar os modelos.
7. Envie o mesmo material de validação + `prompt-validation.md` para:
   - Astra High
   - Astra Medium
8. O viewer existente poderá receber um modo benchmark para comparar:
   Original / Candidate A / Candidate B / validação High / validação Medium.

Nenhum passo deste benchmark deve sobrescrever `quiz-data/rechnungen.csv`.

O lote de IDs acima foi preservado nesta reorganização. Se um ID tiver sido removido do banco atual, o gerador informa os IDs ausentes e interrompe sem gerar um lote parcial; a escolha de um novo lote é uma revisão separada.
