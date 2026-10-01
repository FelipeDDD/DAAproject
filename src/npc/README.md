# NPC do pátio: caixas de cigarro

`MendigaNpc` continua cuidando apenas do sprite/caminhada.
`BeggarInteraction` liga os prompts e a entrega explícita por E.
`NpcProximityDialogue`, em `beggarDialogue.js`, é reutilizável e contém os
parâmetros/pools de fala (alemão). O tamanho do tile vem do mapa.

| Faixa | Comportamento | Cooldown | Chance por tentativa |
| --- | --- | --- | --- |
| 0–1 tile | Prompt; E para falar/entregar. Sem interação automática. | — | — |
| >1–3 tiles | Fala normal, preferindo caixa relevante no inventário. | 8–12 s | 25% |
| >3–6 tiles | Grito ocasional. | 12–20 s | 15% |
| >6 tiles | Nenhuma nova fala. | — | — |

Verificação local a cada 750 ms, fala por 6 s, sem repetir a mesma linha
consecutivamente. Tentativa aleatória malsucedida consome cooldown também.
A fala iniciada mantém a duração e acompanha a cabeça, com clamp na borda
da tela se a NPC sair da câmera. Prompts somem ao sair/dormir; subscriptions
da quest são encerradas e restauradas apenas ao entrar em mapas relevantes.

## Progresso

`npcCollectibleQuests` usa `profileId + questId`, independente da classe.
Os IDs de progresso continuam `cigarette_pack_01..04`. A primeira etapa usa o
item existente `lung_crusher_3000_pack`, reconhecendo profiles que já o coletaram.
Não há dois pickups para a primeira carteira. Sua entrega remove o item existente;
Michael mantém seu equipamento `lung_crusher_3000` independente.
As demais etapas usam seus cards/ícones vermelho, verde e azul. O inventário
permanece profile-wide. `cigarettePacks.js` concentra arte, nomes, mapas, aliases
dos marcadores e dimensões no chão. Os PNGs fornecidos foram copiados sem edição;
`iconScale`/`iconClip` em `inventory/characterItems.js` enquadram os ícones no HUD
sem alterar suas margens originais. Cards usam a apresentação estática existente.

`npcQuests.progress` é uma subscription indexada, somente fora da escola ou
em mapas com spawn configurado. `start` ocorre uma vez por entrada, criando
o estado apenas quando necessário; não há timers Convex nem cron.
`collect` valida sessão autenticada, perfil, caixa atual, spawn, sala e distância
até o pickup (64 px de tolerância para a posição realtime). O pickup local
exige distância de 32 px. `handIn` valida sessão/perfil, sala outside, sequência
e propriedade do item. O alcance da NPC móvel é validado localmente no E;
ela não tem presença/posição sincronizada no backend.
Entrega remove o item e avança o estado na mesma transação. Requests antigos
não podem entregar novamente. Quarta entrega define `completed: true`, limpa
caixa/spawn ativos e deixa `rewardClaimed: false` como hook futuro.
Nenhuma recompensa é concedida nesta etapa. Guests podem ouvir/falar, mas
não criam progresso persistente nem coletam/entregam caixas.

## Testar a coleção no Dev Tools

- **Reset cigarette collection**: reinicia as entregas e remove todas as carteiras
  deste perfil, incluindo o alias antigo da primeira. Reativa o primeiro pickup;
  não remove poções, chaves ou o equipamento Lung Crusher do Michael.
- **Get all cigarette packs**: coloca as quatro carteiras diretamente no inventário,
  sem duplicar itens e sem marcar entregas. Clique nos slots para ver cada card.
  A NPC ainda aceita as entregas na ordem normal; use Reset para repetir uma quest concluída.

Ambas são mutations apenas por clique, com a mesma proteção DEV dos demais itens
e validação de perfil/player/session. Não há bypass na coleta normal nem novo polling.

## Configurar os spawns no Tiled

Locais provisórios atuais, todos vindos do Tiled:

| Etapa | Mapa | Marcador |
| --- | --- | --- |
| 1 / original | classroom (`school`) | `lung-crusher` |
| 2 / vermelha | office3 | `lung-crusher-3000-red` |
| 3 / verde | classroom (`school`) | `long-crusher-3000-green` |
| 4 / azul | secret-path | `long-crusher-3000-blue` |

O azul foi adicionado ao TMX de autoria e sincronizado com o TMJ usado pelo jogo.
Ao editar o TMX novamente, mantenha o marcador também no TMJ exportado.
`lungcrusher` antigo de office3 não é usado nem movido.

1. Mova os pontos existentes em Notes ou use os aliases configurados em
   `cigarettePacks.js`. Para pontos adicionais, use nomes globais únicos
   `cigarette-spawn-*` com a propriedade string `packId` (`cigarette_pack_01..04`).
   A seleção por etapa escolhe somente spawns da respectiva carteira/cor.
2. Execute `node scripts/sync-npc-collectible-spawns.mjs`. Ele lê coordenadas
   e offsets do Tiled e gera `convex/npcCollectibleSpawns.generated.js`.
   Também roda antes de `npm run convex` e do build.
3. Com Convex local atualizado, entre novamente num mapa relevante. `start`
   atribui um spawn a quests que estavam aguardando locais configurados e corrige
   spawns de teste incompatíveis com a etapa, sem apagar entregas existentes.

Cada perfil vê só sua caixa atual. Coletar esconde a caixa, sem avançar a quest;
entregar libera a seguinte. A escolha evita o último spawn quando há alternativa.
Os pickups novos são pequenas variantes SVG coloridas da silhueta da primeira
carteira (`scripts/build-cigarette-ground-icons.mjs`), sem mudar a arte dos cards.
A vermelha tem pequenos papéis decorativos junto à lixeira, sem colisão.
Trocar de mapa não recria item já coletado. Durante testes, não remova/mova
marcadores ativos sem ressincronizar os dados frontend/backend.
