# DAAproject — escola e pátio

JavaScript, Phaser e Vite. Os mapas, posições e colisões vêm do Tiled.
Presença, posição, portas e chat por sala via Convex, sem login.

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

## Multiplayer mínimo

Abra `http://127.0.0.1:5173` em duas abas, escolha personagens diferentes e aguarde
**Online**. Mova uma delas para separar os personagens, que começam no mesmo spawn.
Cada um tem sua própria skin; o remoto tem nome sobre a cabeça. Alterne entre abas. Ao
atravessar a saída com F, ele desaparece para quem ficou na outra área; ao
retornar, reaparece. E altera o estado compartilhado da porta pelo Convex.

- `convex/schema.js`: tabela players, com playerId, name, room, x, y, direction e lastSeen.
- `convex/players.js`: atualização de posição e consulta indexada por room.
- `src/multiplayer/Presence.js`: envia até **8 vezes/s** (125 ms), ou uma vez/s parado;
  mantém só uma mutação em voo e assina apenas a room atual com `onUpdate`.
- `src/multiplayer/RemotePlayers.js`: sprite remoto e suavização de aproximadamente 100 ms.
- `src/scenes/MapScene.js`: associa a cena ativa à room, sem mudar os dados do Tiled.

`characterId` (também usado como `playerId`) é fixo: michael, jassine, sarina ou felipe.
A escolha fica em `localStorage['daa-character-id']` como preferência destacada no menu.
Cada carregamento cria um `sessionId` em memória para reservar o personagem;
nem duplicar uma aba permite usar a mesma vaga simultaneamente.
Presenças sem atualização somem da tela após 15 segundos e são removidas do
backend após aproximadamente 15–20 segundos (limpeza a cada 5 s). Não há colisão entre jogadores nem autenticação.
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
preservando posição e mapa. Fechar/recarregar a aba libera a vaga pelo timeout;
aguarde aproximadamente 15 segundos para escolher novamente o mesmo personagem.
Se uma sessão suspensa perder sua reserva, ela volta à seleção ao tentar atualizar.

Testes reais: `npm run test:characters`, `npm run test:multiplayer` e
`npm run test:doors-online`. Eles precisam de vagas livres e do Convex rodando.
O primeiro testa disputa simultânea, atualização/liberação pelo dono e troca de dono.

WASD/setas: andar. **E**: abrir/fechar a porta próxima. **F**: atravessar uma porta
aberta com destino. **Esc** no exterior: voltar à posição anterior no interior.
A entrada principal interna é uma passagem fixa, entreaberta (`interactive: false`),
conforme a anotação: use F perto dela. A entrada externa permite voltar pelo mesmo
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
- `targetMap` (string): `school` ou `outside`.
- `targetSpawn` (string): nome do ponto de destino; tem prioridade sobre X/Y.
- `targetX`, `targetY` (float): alternativa, em pixels do mundo.
- `closedTexture`, `openTexture` (string) e `closedFrame`, `openFrame` (int/string): arte opcional.

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

35 testes passaram: chat, presença, interpolação, estados e trava,
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
`preserveBounds`, `hinge` e `opensToward` servem como instruções de autoria;
não geram arte ou animação automaticamente. As anotações precisam ser interpretadas.

O retângulo em `Doors` define o vão e o bloqueador. O desenho pode ocupar mais
espaço usando `openWidth`, `openHeight`, `openOffsetX`, `openOffsetY` e os
equivalentes `closed...` (propriedades numéricas em pixels). Isso permite uma
folha aberta perpendicular à parede e uma saída mais alta sem aumentar a colisão.
Os frames continuam selecionados por `openTexture` e `closedTexture`.
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
outro jogador. Fechar uma aba remove sua presença após 15 s. O teste automatizado
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
a 4 participantes. Nesse momento, o Convex seleciona uma vez até cinco IDs do
banco de `convex/quizQuestions.js`, sem repetição, e salva a sequência no lobby.
Com apenas três perguntas cadastradas, todas são usadas. Cada item aceita `id`,
`category`, `difficulty`, `question`, quatro `answers`, `correctAnswer` e uma
`explanation` opcional. A escolha fica local até o jogador confirmar; então o
Convex salva uma resposta por participante e pergunta na tabela `quizAnswers`.
Quando todos os participantes ativos respondem, a alternativa correta e o
feedback são revelados, o lobby soma um ponto por acerto e o host pode avançar.
Depois da última pergunta, o painel mostra o resultado sincronizado. A limpeza de
presença também repara ou remove lobbies a cada 5 segundos.

`scripts/sync-door-definitions.mjs` também gera `convex/quizSeatDefinitions.js`
a partir do Tiled antes de iniciar o Convex ou compilar. O teste real com dois
clientes é `npm.cmd run test:quiz-lobby` com o backend local rodando.
