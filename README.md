# DAAproject — escola e pátio

JavaScript, Phaser e Vite. Os mapas, posições e colisões vêm do Tiled.
Sem backend/multiplayer ou novas dependências.

## Executar

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

WASD/setas: andar. **E**: abrir/fechar a porta próxima. **F**: atravessar uma porta
aberta com destino. **Esc** no exterior: voltar à posição anterior no interior.
A entrada principal interna é uma passagem fixa, entreaberta (`interactive: false`),
conforme a anotação: use F perto dela. A entrada externa permite voltar pelo mesmo
sistema de Doors. As cenas adormecem entre visitas, preservando os estados locais
das portas; recarregar a página reinicia os valores do Tiled.

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

26 testes passaram: estados e trava, conversão das notas, dimensões fracionárias,
spawns livres/recíprocos, portas sem bloqueio permanente e acesso às escadas,
gazebo, canteiros e calçada com a hitbox escalada. Compilação passou (aviso de
bundle grande por incluir Phaser). Os dois mapas foram renderizados com o
renderizador do Tiled, confirmando a leitura dos SVGs/TSX e a composição.
O navegador de teste estava indisponível: ainda falta o playtest real no navegador.

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
