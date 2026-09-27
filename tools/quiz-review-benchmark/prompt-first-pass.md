# Rechnungen — primeira revisão semântica (benchmark)

Você receberá um JSON com 25 perguntas retiradas de `quiz-data/rechnungen.csv`.

## Objetivo
Revisar cada pergunta individualmente para qualidade pedagógica e técnica de um banco de questões para Fachinformatiker/IHK.

Avalie:
- correção factual e matemática;
- clareza da pergunta;
- se existe exatamente uma resposta defensável;
- qualidade e plausibilidade dos distratores;
- se a resposta correta fica óbvia por tamanho, detalhamento ou formulação;
- qualidade da explicação;
- adequação do nível `medium`;
- redundância ou problema pedagógico relevante.

## Regras
- Não altere IDs.
- Não altere uma pergunta boa apenas para "melhorar estilo".
- Preserve alemão natural e apropriado para prova/estudo.
- Não transforme a questão em algo mais avançado sem necessidade.
- Em cálculos, recalcule tudo independentemente.
- Se houver `REWRITE`, devolva a pergunta completa, com quatro respostas, `correctAnswer` e `explanation`.
- `correctAnswer` é índice zero-based: 0, 1, 2 ou 3.
- Não escreva comentários fora do JSON final.

## Decisões permitidas na primeira passada
- `PASS`: a pergunta pode permanecer como está.
- `REWRITE`: a pergunta deve ser substituída por uma versão revisada.
- `OTHER_ISSUE`: existe um problema que não deve ser resolvido por uma simples reescrita; explique.

## Formato de saída
```json
{
  "benchmark": "rechnungen-first-pass-v1",
  "results": [
    {
      "id": "rechnungen-000",
      "decision": "PASS",
      "reason": "..."
    },
    {
      "id": "rechnungen-000",
      "decision": "REWRITE",
      "reason": "...",
      "proposal": {
        "id": "rechnungen-000",
        "category": "Rechnungen",
        "topic": "...",
        "difficulty": "medium",
        "question": "...",
        "answers": ["...", "...", "...", "..."],
        "correctAnswer": 0,
        "explanation": "..."
      }
    },
    {
      "id": "rechnungen-000",
      "decision": "OTHER_ISSUE",
      "reason": "..."
    }
  ]
}
```

Revise todas as 25 perguntas. A saída deve conter exatamente um resultado por ID, na mesma ordem do arquivo de entrada.
