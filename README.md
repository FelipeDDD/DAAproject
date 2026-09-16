# DAAproject — escola e pátio

JavaScript, Phaser e Vite. Os mapas, posições e colisões vêm do Tiled.
Presença, posição, portas e chat por sala via Convex, sem login.

## Convenção de idiomas

A interface do jogo é sempre em **inglês**, incluindo menus, botões, configurações,
status e feedback do quiz. O conteúdo do banco de perguntas é sempre em **alemão**:
perguntas, alternativas e explicações. As categorias do banco também usam nomes em
alemão. Novos CSVs e templates gerados devem seguir essa convenção.

## Executar

```powershell
npm.cmd install
npm.cmd run convex
```

Mantenha o Convex rodando. Em outro terminal:

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run test:multiplayer
npm.cmd run build
```

Na primeira execução, `convex dev` configura o backend de desenvolvimento e grava
`VITE_CONVEX_URL` em `.env.local`. Este projeto já está configurado para Convex
local em `http://127.0.0.1:3210`, sem conta. Reinicie o Vite ao mudar essa variável.
A seleção exige o Convex disponível para confirmar que o personagem está livre.

## Deploy manual: Vercel + Convex

O frontend usa `import.meta.env.VITE_CONVEX_URL`. Em produção, essa variável é
fornecida automaticamente durante o build por `convex deploy`; a URL do deployment
não fica gravada no código ou no repositório. O `vercel.json` desativa deployments
automáticos originados por push no Git e configura o build combinado:

```powershell
npx convex deploy --cmd "npm run build" --cmd-url-env-var-name VITE_CONVEX_URL
```

Antes do primeiro deploy:

1. No Convex Dashboard, selecione o deployment **Production** do projeto. Em
   **Settings > General**, gere uma **Production Deploy Key** com a permissão
   `deployment:deploy`.
2. Na Vercel, abra o projeto em **Settings > Environment Variables** e crie
   `CONVEX_DEPLOY_KEY` com essa chave. Marque somente o ambiente **Production**.
   Não é necessário criar `VITE_CONVEX_URL` na Vercel.
3. No primeiro uso da CLI, autentique-se e vincule esta pasta ao projeto Vercel
   existente quando ela solicitar. A pasta local `.vercel/` fica ignorada pelo Git.

Para publicar manualmente backend e frontend compatíveis:

```powershell
npm.cmd run deploy:prod
```

A Vercel executa o build configurado em `vercel.json`; o Convex escolhe o deployment
associado a `CONVEX_DEPLOY_KEY`, injeta sua URL no Vite e publica as funções. Depois,
a Vercel publica o `dist` produzido pelo mesmo processo.

## Multiplayer mínimo

Abra `http://127.0.0.1:5173` em duas abas, escolha personagens diferentes e aguarde
**Online**. Mova uma delas para separar os personagens, que começam no mesmo spawn.
Cada um tem sua própria skin; o remoto tem nome sobre a cabeça. Alterne entre abas. Ao
atravessar a saída com F, ele desaparece para quem ficou na outra área; ao
retornar, reaparece. E altera o estado compartilhado da porta pelo Convex.

- `convex/schema.js`: tabela players, com playerId, name, room, x, y, direction e lastSeen.
- `convex/players.js`: atualização de posição e consulta indexada por room.
- `src/multiplayer/Presence.js`: envia posição até **8 vezes/s** (125 ms) quando há
  mudança e um heartbeat leve a cada 10 s quando está parado; mantém só uma mutação
  em voo e assina apenas a room atual com `onUpdate`.
- `src/multiplayer/RemotePlayers.js`: sprite remoto e suavização de aproximadamente 100 ms.
- `src/scenes/MapScene.js`: associa a cena ativa à room, sem mudar os dados do Tiled.

`characterId` (também usado como `playerId`) é fixo: michael, jassine, sarina ou felipe.
A escolha fica em `localStorage['daa-character-id']` como preferência destacada no menu.
Cada carregamento cria um `sessionId` em memória para reservar o personagem;
nem duplicar uma aba permite usar a mesma vaga simultaneamente.
Presenças sem heartbeat somem da tela após 60 segundos e são removidas do backend
após aproximadamente 60–65 segundos (limpeza a cada 5 s). O heartbeat continua
quando a aba está em background; blur e `visibilitychange` não liberam a reserva.
Não há colisão entre jogadores nem autenticação.
O backend local atende o teste no mesmo computador; jogar entre computadores
exige configurar um deployment Convex acessível a todos.

Referência da integração: [cliente JavaScript do Convex](https://docs.convex.dev/client/javascript/overview).

## Seleção dos quatro personagens

`src/characters.js` define ordem, id, nome, chave de textura e caminho dos sprites.
Os SVGs em `public/assets/characters/` usam 32×56 px e preservam a hitbox dos pés.
`scripts/character-art.mjs` gera apenas esses placeholders; troque os SVGs depois
para melhorar a arte. Michael tem silhueta mais alta/magra e cigarro; Jassine,
cabelo curto e azul claro; Sarina, cachos, roxo e tiramisu; Felipe, cabelo comprido,
preto com detalhes brancos e lata preta/verde provisória.

`src/CharacterMenu.js` mostra previews e disponibilidade. `players:claim` no Convex
reserva a vaga em uma transação: duas escolhas simultâneas têm apenas um vencedor.
`players:update` e `players:release` conferem o dono da sessão. A consulta de
disponibilidade retorna somente characterId e lastSeen, sem expor o identificador
da sessão. Isso coordena o protótipo sem implementar autenticação real.

Use **Trocar personagem** acima do jogo para liberar a vaga e escolher outra,
preservando posição e mapa. Ao fechar a página, o cliente tenta liberar a vaga;
se a requisição não terminar, o timeout atua como fallback após cerca de 60 segundos.
Se uma sessão suspensa perder sua reserva, ela volta à seleção ao tentar atualizar.

Testes reais: `npm run test:characters`, `npm run test:multiplayer` e
`npm run test:doors-online`. Eles precisam de vagas livres e do Convex rodando.
O primeiro testa disputa simultânea, atualização/liberação pelo dono e troca de dono.

WASD/setas: andar. **E**: abrir/fechar uma porta local ou atravessar uma porta
com destino. **Esc** no exterior: voltar à posição anterior no interior.
A entrada principal interna é uma passagem fixa, entreaberta (`interactive: false`),
conforme a anotação: aproxime-se e use E. A entrada externa permite voltar pelo mesmo
sistema de Doors. As cenas adormecem entre visitas e retomam a assinatura dos
estados compartilhados ao voltar. Sem Convex configurado, usam os valores do Tiled.

## Onde editar

- Interior: `public/assets/maps/classroom.tmj` (cena `school`).
- Exterior: `public/assets/maps/outside.tmj` (cena `outside`).
- Arte provisória editável: `public/assets/campus/prototype.svg` e `materials.svg`.

O antigo mapa vazio e sua cena foram substituídos pelo exterior. A câmera, escala,
velocidade e hitbox não mudaram; ficam em `src/game/settings.js` e `Player.js`.

| Layer | Tipo | Função |
| --- | --- | --- |
| Floor | Tile | Chão; sem colisão automática. |
| Walls | Tile | Paredes visuais; sem colisão automática. |
| Decoration | Tile | Decoração visual; sem colisão automática. |
| Entities | Object | Móveis/vegetação e outros objetos visuais. |
| objectDecoration | Object | Objetos decorativos posicionados no Tiled; sem colisão automática. |
| Collision | Object | Retângulos sólidos, sempre invisíveis no jogo. |
| Doors | Object | Retângulos que controlam portas e transições. |
| Spawns | Object | Pontos nomeados de entrada. |
| Notes | Object | Instruções de edição, nunca renderizadas pelo Phaser. |

Use essas layers na raiz, sem duplicar nomes. Mova/redimensione objetos no Tiled;
não há ajuste à grade no Phaser. Para objetos de tile, o Tiled usa x/y no canto
inferior esquerdo: o carregador respeita essa convenção, a dimensão e os flips.
Mova também a Collision correspondente ao deslocar um móvel sólido. Não desenhe
Collision sobre o vão de uma porta: ela possui um bloqueador próprio.

## Anotações do interior

Foram resolvidos os 37 Notes e os 10 marcadores de teclado que estavam sem arte
em Entities. Os teclados originais foram movidos para Notes antes da conversão.
As anotações continuam preservadas, com `resolvedEntity` apontando para o objeto
criado; os objetos criados têm `sourceNote` para rastrear a origem.

Inclui cadeiras, teclados, mesa de escritório com monitor/computador/caderno/caneta,
mesa de café, armário, pias, secador, sanitários e divisórias decorativas. As duas
notas de porta viraram portas locais. A saída principal adicionada pelo editor
foi ligada ao exterior. Valores booleanos escritos como texto foram normalizados
no TMJ. As Tile Layers existentes do interior não foram redesenhadas.

Retângulos mantiveram sua geometria exata. Para pontos/objetos sem dimensões, foi
usado um tamanho provisório de sprite, centrado no marcador; os pontos originais
não foram movidos. As notas de portas respeitam a extensão de um tile solicitada.

## Portas e destinos

Em Doors, use retângulos sem rotação. Propriedades customizadas:

- `id` e `label` (string): identificador único e nome exibido; o nome do objeto é fallback.
- `open`, `locked`, `transition`, `interactive` (**bool**, não string).
- `orientation` (string): `horizontal` ou `vertical`.
- `hinge` (string): `left`/`right` em portas horizontais; `top`/`bottom` em portas verticais.
- `visualState` (string, opcional): `closed`, `open` ou `halfOpen`; use em portas não interativas com visual fixo.
- `targetMap` (string): `school` ou `outside`.
- `targetSpawn` (string): nome do ponto de destino; tem prioridade sobre X/Y.
- `targetX`, `targetY` (float): alternativa, em pixels do mundo.
- `closedTexture`, `openTexture`, `halfOpenTexture` (string) e os respectivos
  `closedFrame`, `openFrame`, `halfOpenFrame` (int/string): arte opcional.

`locked: true` fecha a porta e impede abrir/viajar. `interactive: false` mantém
seu estado fixo, mas F continua disponível quando a passagem está aberta.
Uma porta não fecha sobre os pés do jogador.

A entrada externa usa `targetMap: school`, `targetSpawn: mainEntrance`.
A saída interna usa `targetMap: outside`, `targetSpawn: schoolEntrance`.
A saída de teste anterior também leva ao pátio. Portas sem destino só abrem/fecham.

Para criar um spawn, use **Inserir ponto** em Spawns e defina seu Nome. A posição
é a dos pés. Nome `default`, propriedade de mapa `defaultSpawn` ou primeiro ponto
servem para a entrada inicial. Deixe spawns fora de colisões e portas fechadas.

## Exterior e arte provisória

Pátio compacto de 30×24 tiles: fachada de tijolos/janelas, entrada central, quatro
degraus, calçamento, canteiros escalonados, árvores/arbustos, bancos, gazebo e uma
faixa de calçada/rua. Fachada, canteiros, troncos, bancos e pilares sólidos têm
retângulos separados em Collision. As escadas e o caminho central estão livres.

O piso reutiliza o tileset existente `floorsbase`. A arte nova é um atlas SVG
simples, referenciado por um TSX e editável/substituível. Árvores, mobiliário,
fachada e gazebo continuam provisórios. As portas e os monitores antigos ainda
usam desenhos locais do Phaser. A layer Notes não aparece no jogo.

Não há posições importantes do mapa hardcoded no runtime. Apenas receitas de
arte, configuração da câmera e registro de cenas ficam no código. Os scripts
abaixo contêm a construção inicial dos dados, mas não rodam ao iniciar o jogo:

```powershell
node scripts/campus-art.mjs
node scripts/author-campus.mjs
```

O primeiro regenera o atlas; não execute depois de editar manualmente esses SVGs
sem guardar sua versão. O segundo resolve apenas Notes ainda sem resolvedEntity
e cria outside.tmj **somente se ele não existir**. Depois da criação, edite os
mapas diretamente no Tiled. Backups ficam em `.map-recovery/`, ignorados pelo Git.
Recarregue o arquivo do disco no Tiled antes de continuar numa janela antiga.

## Código e validação

`MapScene.js` centraliza carregamento de TMJ/TSX, sprites, colisão e transição.
`SchoolScene.js` e `OutsideScene.js` apenas escolhem os arquivos de mapa.
`maps/doors.js` lê propriedades; `entities/Door.js` controla visual e bloqueador.

A suíte automatizada cobre chat, presença, interpolação, estados e trava,
conversão das notas, dimensões fracionárias,
spawns livres/recíprocos, portas sem bloqueio permanente e acesso às escadas,
gazebo, canteiros e calçada com a hitbox escalada. Compilação passou (aviso de
bundle grande por incluir Phaser). Os dois mapas foram renderizados com o
renderizador do Tiled, confirmando a leitura dos SVGs/TSX e a composição.
O navegador de teste estava indisponível: ainda falta o playtest real no navegador.
O teste de integração com dois clientes WebSocket e backend Convex local passou,
incluindo posição, direção, filtro do próprio jogador e ida/volta entre rooms.

## Placeholders e ajustes de portas

Use retângulos em `Notes` para delimitar o espaço completo de cada objeto.
Use `description` para detalhes e `facing` (`left/right/up/down`) para a face
voltada ao jogador. Pontos indicam apenas o centro, sem definir tamanho.
Para um conjunto, marque seu contorno e os componentes, incluindo passagens livres.
`preserveBounds` e `opensToward` servem como instruções de autoria;
não geram arte ou animação automaticamente. As anotações precisam ser interpretadas.

O retângulo em `Doors` define somente o vão, a interação e o bloqueador. Cada
estado visual pode usar `Width`, `Height`, `OffsetX`, `OffsetY`, `OriginX`,
`OriginY`, `Angle`, `FlipX` e `FlipY`, precedidos por `closed`, `open` ou
`halfOpen`, por exemplo `openOffsetX` e `halfOpenAngle`. Assim a folha aberta
pode ocupar espaço perpendicular à parede sem mudar a colisão. Para uma porta de
transição entreaberta acionada por E, use `visualState: halfOpen`, `open: true` e
`interactive: false`. Portas com destino mantêm o vão bloqueado para impedir a
troca de mapa ao caminhar; a folha visual aberta não cria uma segunda colisão.
As paredes e as colisões devem terminar nas duas bordas do vão.

## Portas compartilhadas

`convex/doors.js` consulta os estados da room e valida cada pedido de abertura ou
fechamento. `src/multiplayer/DoorSync.js` assina esses estados e aplica visual e
colisão juntos. O movimento local não espera pelo servidor; o estado da porta
aguarda confirmação. Uma passagem ocupada por um jogador ativo não pode fechar.
Se a posição local estiver mais adiantada que a última posição enviada, a colisão
recebida permite sair do vão antes de voltar a bloquear.

Os valores iniciais `open`, `locked`, `interactive` e a geometria continuam no
Tiled. `scripts/sync-door-definitions.mjs` gera `convex/doorDefinitions.js` para
o backend; roda antes de `npm run convex` e do build. Após editar portas no Tiled
com o backend já aberto, execute `node scripts/sync-door-definitions.mjs`.
O estado já salvo na tabela `doors` persiste entre visitas e recarregamentos;
os defaults do Tiled valem para portas ainda sem estado salvo. Não há interface
para alterar `locked` nesta etapa; o campo compartilhado é respeitado.

Teste: duas abas na mesma área; pressione E perto da mesma porta e confira o
outro jogador. Fechar uma aba tenta liberar a presença imediatamente; como fallback,
o backend remove a sessão sem heartbeat após aproximadamente 60–65 s. O teste automatizado
real dessas duas funções é `npm.cmd run test:doors-online` (backend rodando).

Correção do mapa: `note-door-190` atende a anotação `fixThis`; `wall-17-21`,
`wall-17-22` e `wall-16-22` têm colisões alinhadas aos seus retângulos, com o
pequeno vão sem uso preenchido. Backup anterior em `.map-recovery/`.

## Chat por sala

Enter foca o campo; Enter novamente envia; Esc desfoca. Enquanto digita,
o movimento e as teclas de portas ficam bloqueados, mas a presen?a continua ativa.
Depois de enviar, o foco retorna ao jogo. Trocar de sala troca a assinatura e
limpa o hist?rico anterior; trocar de personagem tamb?m encerra o chat anterior.

- Tabela: messages em convex/schema.js.
- Envio: messages:send em convex/messages.js, validando sess?o, room e autor.
- Realtime: messages:inRoom no mesmo arquivo, por ?ndice room/createdAt.
- Limites: ?ltimas 50 mensagens, em ordem cronol?gica, at? 200 caracteres por envio.
- Interface e foco: src/RoomChat.js; integra??o em MapScene.js e main.js.

As mensagens ficam armazenadas no Convex, sem sistema adicional de hist?rico.
O painel exibe texto simples, sem interpretar HTML. Teste real: npm run test:chat
(usa uma vaga livre e deixa duas mensagens identificadas como teste no backend local).

## Lobby físico do quiz

As quatro cadeiras da mesa com monitores duplos são objetos `quizSeat` na layer
`Entities` de `classroom.tmj`. Cada uma possui `characterId`, `seatX`, `seatY` e
`direction`. A disposição é Sarina/Felipe à esquerda (cima/baixo) e
Michael/Jassine à direita (cima/baixo). `src/maps/quizSeats.js` lê esses dados;
o Phaser não contém coordenadas das cadeiras.

Perto da própria cadeira, o prompt local `[E] Sentar` usa apenas a posição e a
hitbox locais. E chama `quizLobbies:join`, alinha o personagem e bloqueia o
movimento. E novamente, Esc ou o botão do painel chamam `leave`.
`src/QuizLobby.js` controla essa integração e o painel. O chat continua disponível
enquanto o jogador está sentado.

A tabela `quizLobbies` fica em `convex/schema.js`; as queries e mutations estão
em `convex/quizLobbies.js`. O primeiro a sentar vira host. Se ele sair, o primeiro
participante ativo restante vira host; sem participantes, o lobby é apagado.
Somente o host vê o botão de início e pode mudar o status para `starting`, com 2
a 4 participantes. Nesse momento, o Convex seleciona uma vez a quantidade configurada de IDs do
banco combinado por `convex/quizQuestions.js`, sem repetição, e salva a sequência
no lobby. As perguntas estáticas são carregadas automaticamente dos CSVs, junto aos templates gerados. Cada item aceita `id`,
`category`, `topic` opcional, `difficulty`, `question`, quatro `answers`, `correctAnswer` e uma
`explanation` opcional. A escolha fica local até o jogador confirmar; então o
Convex salva uma resposta por participante e pergunta na tabela `quizAnswers`.
Quando todos os participantes ativos respondem, a alternativa correta e o
feedback são revelados, o lobby soma um ponto por acerto e o host pode avançar.
Depois da última pergunta, o painel mostra o resultado sincronizado. A limpeza de
presença também repara ou remove lobbies a cada 5 segundos.

Antes de iniciar, o host escolhe uma categoria ou `All`, topic ou `All` quando a
categoria possui topics, dificuldade `medium`, `hard` ou `All`, e quantidade 5,
10, 15 ou `All`. Essas configurações ficam em
`quizLobbies.settings`, são visíveis para todos e editáveis somente pelo host. As
categorias do seletor vêm automaticamente do banco combinado.

O banco também aceita templates com `type: 'generated'` e `generate()`. Ao iniciar,
o backend aplica os filtros, seleciona os IDs e gera cada pergunta concreta uma única vez,
embaralha também as respostas estáticas e salva as perguntas concretas em
`quizLobbies.questions`. Cada resposta é temporariamente associada a `isCorrect`
durante o embaralhamento, e `correctAnswer` é recalculado depois. Os clientes recebem somente a
pergunta materializada, nunca a função geradora ou uma versão calculada localmente.
Avançar de pergunta apenas lê essa sequência salva e não executa o template outra vez.

Quando uma categoria filtrada possui somente um template gerado, ele pode criar
várias perguntas concretas distintas para preencher a quantidade escolhida. Cada
instância recebe um ID próprio na sessão, evitando conflitos nas respostas e na pontuação.

### Histórico recente e anti-repetição

O Convex salva por personagem uma lista limitada em `quizQuestionHistory`. A seleção
reutilizável fica em `convex/quizSelection.js`: primeiro aplica categoria, topic e dificuldade,
depois evita `max(5, ceil(pool filtrado × 0,10))` perguntas recentes de cada participante.
As constantes `RECENT_EXCLUSION_PERCENT`, `RECENT_EXCLUSION_MINIMUM` e
`RECENT_HISTORY_LIMIT` ficam no início desse arquivo.

Perguntas que não são recentes para ninguém têm prioridade. Se elas não completarem
a quantidade configurada, as recentes retornam da mais antiga para a mais nova, sem
fazer a sessão falhar. Instâncias como `network-subnet-hosts-generated#2` são gravadas
no histórico pelo ID do template `network-subnet-hosts-generated`. O helper
`buildQuizQuestionSelection()` recebe o banco, filtros e históricos sem conhecer o
lobby, podendo ser reutilizado futuramente pelos modos Study, Challenge e Time Attack.

Os templates ficam em `convex/quizGeneratedQuestions.js`. Nesse arquivo,
`network-subnet-hosts-generated` escolhe prefixos entre `SUBNET_PREFIX_MIN` (24) e
`SUBNET_PREFIX_MAX` (30); `number-decimal-binary-generated` escolhe valores entre
`DECIMAL_VALUE_MIN` (0) e `DECIMAL_VALUE_MAX` (255).
`generateUniqueDistractors()` e `shuffleAnswers()` concentram a geração de alternativas
únicas e o embaralhamento. `materializeQuizQuestions()` permanece em
`convex/quizQuestions.js` e converte a seleção para dados persistíveis.

### Manutenção das perguntas estáticas em CSV

As perguntas estáticas ficam em `quiz-data/`, com um arquivo por categoria. Todos os
arquivos `.csv` dessa pasta são detectados automaticamente. O formato principal usa UTF-8 e ponto e
vírgula, pois o Excel com configuração regional alemã normalmente reserva a vírgula
para números decimais. Ao salvar, escolha **CSV UTF-8 (durch Trennzeichen getrennt)**
e mantenha a extensão `.csv`; não salve a planilha como `.xlsx`. O importador detecta
automaticamente `;` ou `,`, caso a configuração regional do Excel produza vírgulas.

### Preview interno do banco de perguntas

Com `npm.cmd run dev` em execução, abra
`http://127.0.0.1:5173/quiz-database.html`. Essa página existe somente como
ferramenta de desenvolvimento e não aparece na navegação normal do jogo. Ela lista
as perguntas estáticas e os templates gerados, mostra origem, totais, filtros,
busca, ordenação, resposta correta, topic, explanation, media e avisos de validação.

O botão `Generate again` materializa outra amostra local de um template dinâmico,
sem criar ou alterar sessões no Convex. Depois de editar um CSV, execute
`npm.cmd run sync:quiz` para atualizar o módulo consumido pelo jogo e pelo preview.
As categorias são lidas do banco sincronizado e aparecem automaticamente.

Cada arquivo contém estas colunas, nesta ordem:

| Coluna | Conteúdo |
| --- | --- |
| `id` | Identificador único terminado em número, como `hardware-001` ou `programming-001` |
| `category` | Categoria exibida e usada pelos filtros |
| `topic` | Subtema opcional; deixe vazio quando a categoria não usar topics |
| `difficulty` | `medium` ou `hard` |
| `question` | Texto da pergunta |
| `answer1` até `answer4` | Exatamente quatro alternativas diferentes |
| `correctAnswer` | Índice da resposta correta: `0` para `answer1` até `3` para `answer4` |
| `explanation` | Explicação opcional |
| `media` | Objeto JSON opcional para `image`, `table`, `text` ou `code` |

Para adicionar uma pergunta, abra o CSV da categoria no Excel, insira uma linha e use
o próximo ID numérico livre. A posição física da linha não afeta o sorteio. Para uma
categoria nova, copie o cabeçalho para um novo CSV e mantenha um prefixo consistente
nos IDs. IDs precisam ser únicos entre todos os CSVs e também não podem coincidir com
um template gerado.

O cabeçalho novo é
`id;category;topic;difficulty;question;answer1;answer2;answer3;answer4;correctAnswer;explanation;media`.
O loader continua aceitando o cabeçalho antigo sem `topic`. Nos painéis, o fluxo é
**Category → Topic → Difficulty → Quantity**; Topic desaparece quando a categoria
selecionada não possui nenhum valor e volta para `All` ao trocar de categoria.

Execute `npm.cmd run validate:quiz` depois de salvar. O comando aponta arquivo e linha
para IDs duplicados, campos obrigatórios vazios, respostas ausentes ou repetidas,
`correctAnswer` inválido, dificuldade não suportada, `topic` estruturalmente inválido
e JSON de `media` inválido. `topic` vazio é válido e não ativa nenhum filtro.
`npm.cmd run sync:quiz` atualiza `convex/quizStaticQuestions.generated.js`; esse arquivo
é gerado e não deve ser editado. `dev`, `build`, `convex` e `test` fazem essa sincronização
automaticamente, portanto não é necessário copiar dados do CSV para JavaScript.

Cada pergunta começa com X (60 atualmente) segundos, definidos por
`QUIZ_QUESTION_DURATION_MS` em `src/quizTimer.js`. Antes de confirmar, o jogador
pode trocar livremente a alternativa selecionada. O botão **Confirmar resposta**
trava a escolha imediatamente. Se o contador chegar a `0s`, a última alternativa
selecionada é confirmada automaticamente; sem seleção, o jogador não recebe ponto.
O prazo é salvo no lobby para que todos vejam a mesma contagem. A pergunta só é
revelada depois que cada participante ativo confirmou ou finalizou pelo tempo.
Durante uma partida, E, Esc e **Sair do lobby** primeiro abrem uma confirmação;
**Cancelar** mantém o jogador sentado. Uma saída confirmada não interrompe a
partida enquanto restarem pelo menos duas pessoas. Se uma saída ou expiração de
presença deixar apenas um participante, o Convex finaliza o quiz e mostra
“Quiz encerrado por falta de participantes” para quem ficou.

`scripts/sync-door-definitions.mjs` também gera `convex/quizSeatDefinitions.js`
a partir do Tiled antes de iniciar o Convex ou compilar. O teste real com dois
clientes é `npm.cmd run test:quiz-lobby` com o backend local rodando.

### Emotes multiplayer

A barra inferior possui seis slots acionados por clique ou pelas teclas **1–6**.
O botão de engrenagem, ou clique direito em um slot, abre o catálogo. A escolha é
salva por personagem em `localStorage`. Catálogo, defaults, duração e cooldown
ficam centralizados em `src/emotes/config.js`.

`src/emotes/EmoteSync.js` envia e assina somente os eventos da room atual;
`EmoteRenderer.js` posiciona e anima o balão sobre os sprites; `EmoteBar.js` cuida
apenas da interface. O Convex mantém no máximo um evento temporário por personagem
em `emoteEvents`, sobrescreve-o no próximo uso e remove eventos expirados pelo cron.
Uma futura radial wheel pode chamar o mesmo `EmoteSync.trigger()`.

Teste realtime com o backend local rodando: `npm.cmd run test:emotes`.

### Solo Study Mode

No mapa interno, aproxime-se da entidade `chairLuxury-241` e pressione **E**. Ela
está marcada como `soloStudySeat` na layer `Entities`; posição, direção e ponto de
assento ficam no TMJ. A placa `studyModeSign`, também em `Entities`, orienta o
jogador pelo corredor e pode ser movida ou editada diretamente no Tiled.

`convex/soloStudy.js` prepara a sequência usando o mesmo banco, filtros,
anti-repetição, geração e shuffle do multiplayer. Ele grava as perguntas vistas
na mesma tabela `quizQuestionHistory`. As escolhas, confirmações e o resultado
da partida solo ficam localmente em `src/quiz/SoloStudySession.js`; essa classe
independente de interface é a base reutilizável para modos solo futuros.
`src/SoloStudyController.js` integra essa sessão ao Phaser e ao painel HTML.

O mesmo painel permite escolher **Study** ou **Challenge** antes dos filtros.
`src/quiz/SoloSession.js` contém seleção de alternativa, confirmação, progresso e
resultado básico. `SoloStudySession.js` mantém a experiência sem score;
`SoloChallengeSession.js` acrescenta 10 pontos por acerto, avaliação final e
`completionRecord()`, cuja estrutura pode ser enviada ao Convex quando highscores
forem implementados. `src/quiz/soloModes.js` centraliza a criação dos modos e é o
ponto de extensão planejado para Time Attack.

Challenge concede 60 segundos por pergunta, configurados por
`CHALLENGE_QUESTION_DURATION_MS` em `SoloChallengeSession.js`. A barra do painel
é atualizada apenas no cliente. Ao chegar a zero, a pergunta conta como incorreta,
revela resposta e explicação e aguarda o botão **Next question**. Study continua
sem limite de tempo.

### Estatísticas do quiz

Abra a cadeira de Solo Mode e use **Statistics** na tela de configuração. O painel
mostra totais, acurácia por categoria, topics expansíveis, difficulty e mode. O
filtro de modo permite consultar Study, Challenge ou Multiplayer separadamente.

Cada resposta resolvida cria uma tentativa mínima em `quizAttempts`, identificada
por uma chave idempotente. `quizPerformance` mantém acumuladores por personagem,
categoria, topic, difficulty e mode, evitando reler todo o histórico para montar o
painel. Ambas ficam em `convex/schema.js`; mutations e query ficam em
`convex/quizStatistics.js`, e a agregação reutilizável em
`convex/quizStatisticsModel.js`. IDs concretos de perguntas generated são reduzidos
ao ID do template, da mesma forma que no anti-repetition.

Study e Challenge mantêm respostas e score locais, mas o backend conserva um
snapshot mínimo da sequência ativa em `soloQuizRuns` para validar cada tentativa.
No multiplayer, a tentativa é registrada na mesma mutation que já grava a resposta.
Categorias e topics só são classificados como pontos fracos após pelo menos 5
respostas, configuradas por `WEAK_STATISTICS_MINIMUM_ANSWERS`.
Com o Convex local rodando, `npm.cmd run test:statistics` valida o registro solo
idempotente; `npm.cmd run test:quiz-lobby` também confere os registros individuais
dos dois participantes.

## Conteúdo auxiliar por pergunta

Na coluna `media` dos CSVs, cada pergunta aceita um objeto JSON opcional.
Perguntas sem esse campo mantêm a apresentação anterior. Os exemplos de código
e tabela estão em `quiz-data/programming.csv`, nas perguntas `programming-001` e
`programming-003`;
`programming-002` continua sem media. Não foram adicionadas perguntas ao sorteio.

Use uma das estruturas abaixo como valor JSON da coluna. O Excel preserva e escapa
as aspas da célula ao salvar o CSV:

```json
{"type":"image","src":"/assets/quiz/example.png","alt":"Descrição da imagem"}

{"type":"table","columns":["Gerät","IP-Adresse"],"rows":[["PC1","192.168.1.10"],["PC2","192.168.1.11"]]}

{"type":"text","content":"Informação adicional..."}

{"type":"code","language":"javascript","content":"const x = 10;"}
```

Coloque imagens em `public/assets/quiz/` (crie a pasta ao adicionar a primeira).
O caminho público não inclui `public`. A imagem mantém a proporção e o texto
`alt`; um arquivo indisponível mostra uma mensagem auxiliar. URLs de imagem
aceitam HTTP/HTTPS, incluindo caminhos locais resolvidos contra a página.

`src/QuizMedia.js` cria elementos DOM e usa `textContent`, sem interpretar HTML
das perguntas. Código usa `<pre><code>` sem highlighting; `language` fica em
`data-language`. Tipos desconhecidos ou estruturas incompletas são ignorados.
A consulta do quiz apenas repassa `media` quando presente, sem mudar confirmação,
feedback, pontuação, seleção, filtros, host ou resultado final.

A área `.quiz-media` fica acima de `.quiz-question-body`, dentro de
`.quiz-question-layout`. Ajustes estão em `src/style.css`:

- `--quiz-media-max-height`: limite da área e da imagem (padrão: 240px).
- `--quiz-media-gap`: distância para a pergunta (16px).
- `.quiz-media-image`, `.quiz-media-table`, `.quiz-media-text` e `.quiz-media-code`:
  estilos específicos de cada tipo.
- Para experimentar media ao lado da pergunta em telas de pelo menos 900px,
  aumente `--quiz-panel-width` e defina `--quiz-content-columns` como
  `minmax(0, 1fr) minmax(0, 1fr)`. Telas menores continuam empilhadas, e perguntas
  sem media continuam ocupando a largura inteira.

Conteúdo longo tem rolagem dentro da área auxiliar. Os testes de renderização,
texto literal, media ausente e troca de conteúdo rodam com `npm.cmd test`.
