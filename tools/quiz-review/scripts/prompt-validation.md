# Rechnungen — validação cega de propostas (benchmark)

Você receberá, para cada questão:
- a versão ORIGINAL;
- CANDIDATE A;
- CANDIDATE B.

Os candidatos foram produzidos por modelos diferentes. Você não deve tentar identificar qual modelo gerou qual candidato.

## Objetivo
Avaliar cada candidato em relação à pergunta original, verificando:
- correção factual/matemática;
- clareza;
- exatamente uma resposta defensável;
- plausibilidade dos distratores;
- ausência de pistas artificiais;
- explicação correta e suficiente;
- adequação ao nível e ao objetivo pedagógico;
- se a proposta realmente melhora ou corrige algo necessário.

Recalcule independentemente todas as questões numéricas.

## Decisões permitidas
Use o conjunto completo:
- `APPROVE`
- `REVISE`
- `REJECT`
- `KEEP_AND_ADD`
- `REVISE_AND_ADD`
- `REVISE_ORIGINAL`

### Interpretação
- `APPROVE`: o candidato pode substituir o original como está.
- `REVISE`: a ideia do candidato é boa, mas precisa de ajustes antes de substituir.
- `REJECT`: o candidato é pior, incorreto ou desnecessário.
- `KEEP_AND_ADD`: manter o original e adicionar a proposta como questão adicional.
- `REVISE_AND_ADD`: revisar a proposta e adicioná-la como questão adicional, mantendo o original.
- `REVISE_ORIGINAL`: o candidato não deve ser usado, mas a análise revelou que o original precisa de correção própria.

## Saída
Avalie A e B separadamente para cada ID.

```json
{
  "benchmark": "rechnungen-validation-v1",
  "results": [
    {
      "id": "rechnungen-000",
      "candidateA": {
        "decision": "APPROVE",
        "reason": "..."
      },
      "candidateB": {
        "decision": "REVISE",
        "reason": "...",
        "revisedProposal": {
          "id": "rechnungen-000",
          "category": "Rechnungen",
          "topic": "...",
          "difficulty": "medium",
          "question": "...",
          "answers": ["...", "...", "...", "..."],
          "correctAnswer": 0,
          "explanation": "..."
        }
      }
    }
  ]
}
```

Não dê um vencedor geral. Avalie cada questão e cada candidato individualmente.
Não escreva comentários fora do JSON final.
